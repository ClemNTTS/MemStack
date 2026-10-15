import test from 'node:test'
import assert from 'node:assert/strict'
import { createEnterpriseCheckout, createEnterprisePortal, drainEnterpriseSeatSync, processEnterpriseSubscriptionEvent, validateEnterpriseCheckoutRequest, validateEnterprisePrice, organizationHasAccess } from './enterpriseBilling.mjs'

const now = Date.parse('2026-10-15T12:00:00.000Z')
const config = {enabled:true,priceId:'price_enterpriseQA',unitAmount:1000,interval:'month',taxBehavior:'inclusive',liveMode:false}
const price = {id:config.priceId,active:true,livemode:false,currency:'eur',unit_amount:1000,tax_behavior:'inclusive',type:'recurring',billing_scheme:'per_unit',recurring:{interval:'month',interval_count:1,usage_type:'licensed'}}
const subscription = () => ({id:'sub_enterpriseQA',customer:'cus_enterpriseQA',livemode:false,status:'active',metadata:{memstackOrganizationId:'org-qa'},latest_invoice:{status:'paid'},items:{data:[{id:'si_enterpriseQA',quantity:1,price,current_period_end:Math.floor(now/1000)+86400}]}})
const outbox = '_enterpriseSeatSync/org-qa'
const billing = 'organizations/org-qa/billing/stripe'

function memoryDb() {
  const data = new Map()
  const snapshot = path => ({id:path.split('/').at(-1),exists:data.has(path),data:()=>data.has(path)?structuredClone(data.get(path)):undefined})
  const query = (path, filters=[], maximum=Infinity) => ({path,filters,maximum,
    where:(...filter)=>query(path,[...filters,filter],maximum),limit:count=>query(path,filters,count)})
  return {data,doc:path=>({path,get:async()=>snapshot(path)}),collection:path=>query(path),runTransaction:async callback=>{
    const writes=[]
    const result=await callback({get:async ref=>{
      assert.equal(writes.length,0,'Firestore transactions must read before writing')
      if(!ref.filters)return snapshot(ref.path)
      const docs=[...data.keys()].filter(path=>path.startsWith(`${ref.path}/`) && path.slice(ref.path.length+1).split('/').length===1)
        .filter(path=>ref.filters.every(([field,operator,value])=>operator==='==' && data.get(path)[field]===value)).slice(0,ref.maximum).map(snapshot)
      return {docs,size:docs.length,empty:docs.length===0}
    },set:(ref,value,options)=>writes.push(()=>data.set(ref.path,options?.merge?{...data.get(ref.path),...structuredClone(value)}:structuredClone(value))),
    update:(ref,value)=>writes.push(()=>data.set(ref.path,{...data.get(ref.path),...structuredClone(value)})),
    create:(ref,value)=>writes.push(()=>{assert.equal(data.has(ref.path),false);data.set(ref.path,structuredClone(value))}),
    delete:ref=>writes.push(()=>data.delete(ref.path))})
    for(const write of writes)write()
    return result
  }}
}
function setup(desiredQuantity=3) {
  const db=memoryDb()
  db.data.set(billing,{customerId:'cus_enterpriseQA',subscriptionId:'sub_enterpriseQA',subscriptionStatus:'active',liveMode:false})
  db.data.set(outbox,{organizationId:'org-qa',desiredQuantity,revision:1,syncedRevision:0})
  return db
}

test('enterprise commercial request never accepts client quantity or B2C pricing',()=>{
  const data={organizationId:'org-qa',requestId:'request-checkout-qa-0001'}
  assert.deepEqual(validateEnterpriseCheckoutRequest(data),data)
  for(const patch of [{seats:1},{quantity:1},{unitAmount:1},{customerId:'cus_other'},{priceId:'price_personal'}])assert.throws(()=>validateEnterpriseCheckoutRequest({...data,...patch}),{code:'invalid-argument'})
  assert.equal(validateEnterprisePrice(price,config),price)
  for(const patch of [{unit_amount:150},{unit_amount:990},{tax_behavior:'exclusive'},{recurring:{...price.recurring,interval:'year'}}])assert.throws(()=>validateEnterprisePrice({...price,...patch},config),{code:'failed-precondition'})
})

test('checkout counts the responsible and accepted active members, excludes invitations, and reuses its customer after 24 hours',async()=>{
  const db=setup(),sessions=[],retrieved=[]
  db.data.set(billing,{customerId:'cus_enterpriseQA',liveMode:false,subscriptionStatus:'canceled'})
  db.data.set('organizations/org-qa',{name:'QA organization',offer:'stripe-enterprise',enabled:true})
  db.data.set('organizations/org-qa/members/manager',{active:true,role:'manager'})
  db.data.set('organizations/org-qa/members/learner',{active:true,role:'learner'})
  db.data.set('organizations/org-qa/members/revoked',{active:false,role:'learner'})
  db.data.set('_enterpriseInvitations/pending',{organizationId:'org-qa',email:'pending@example.com',usedBy:null})
  const stripe={prices:{retrieve:async()=>price},customers:{retrieve:async id=>{retrieved.push(id);return{id,livemode:false}},create:async()=>{throw new Error('Existing customers must not be recreated')}},
    subscriptions:{list:async()=>({data:[],has_more:false})},checkout:{sessions:{create:async(parameters,options)=>{sessions.push({parameters,options});return{url:'https://checkout.stripe.com/c/pay/enterpriseQA'}}}}}
  const args={db,stripe,auth:{uid:'manager',token:{firebase:{sign_in_provider:'google.com'}}},lookup:async()=>({emailVerified:true,disabled:false}),data:{organizationId:'org-qa',requestId:'checkout-qa-existing-customer'},config,now}
  await createEnterpriseCheckout(args)
  await createEnterpriseCheckout({...args,now:now+25*3600000})
  assert.deepEqual(retrieved,['cus_enterpriseQA','cus_enterpriseQA'])
  assert.deepEqual(sessions.map(session=>session.parameters.line_items[0].quantity),[2,2])
  assert.ok(sessions.every(session=>session.parameters.managed_payments.enabled===true))
  assert.ok(sessions.every(session=>session.parameters.customer==='cus_enterpriseQA'))
  assert.ok(sessions.every(session=>new URLSearchParams(session.parameters.success_url.split('?')[1]).get('org')==='org-qa'))
  assert.ok(sessions.every(session=>new URLSearchParams(session.parameters.cancel_url.split('?')[1]).get('org')==='org-qa'))
  db.data.set('organizations/org-qa',{...db.data.get('organizations/org-qa'),enabled:false})
  await assert.rejects(createEnterpriseCheckout({...args,now:now+26*3600000}),{code:'failed-precondition'})
  assert.equal(sessions.length,2)
})

test('the organization portal refuses manual quantity controls and returns to the organization being managed',async()=>{
  const db=setup(),sessions=[]
  db.data.set('organizations/org-qa',{name:'QA organization',offer:'stripe-enterprise',enabled:false})
  db.data.set('organizations/org-qa/members/manager',{active:true,role:'manager'})
  let manualUpdates=true
  const stripe={billingPortal:{configurations:{retrieve:async()=>({active:true,livemode:false,features:{subscription_update:{enabled:manualUpdates}}})},sessions:{create:async parameters=>{sessions.push(parameters);return{url:'https://billing.stripe.com/p/session/qa'}}}}}
  const args={db,stripe,auth:{uid:'manager',token:{firebase:{sign_in_provider:'google.com'}}},lookup:async()=>({emailVerified:true,disabled:false}),data:{organizationId:'org-qa'},config:{...config,portalConfigurationId:'bpc_enterpriseQA'}}
  await assert.rejects(createEnterprisePortal(args),{code:'failed-precondition'})
  assert.equal(sessions.length,0)
  manualUpdates=false
  await createEnterprisePortal(args)
  assert.equal(sessions.length,1)
  assert.equal(new URLSearchParams(sessions[0].return_url.split('?')[1]).get('org'),'org-qa')
  assert.equal(sessions[0].customer,'cus_enterpriseQA')
})

test('a seat change during Stripe synchronization remains pending and converges to the latest absolute quantity',async()=>{
  const db=setup(),provider=subscription(),updates=[]
  const stripe={subscriptions:{retrieve:async()=>structuredClone(provider),update:async(id,parameters,options)=>{
    updates.push({id,parameters,options})
    provider.items.data[0].quantity=parameters.items[0].quantity
    if(updates.length===1)db.data.set(outbox,{...db.data.get(outbox),desiredQuantity:4,revision:2})
    return structuredClone(provider)
  }}}
  const args={db,stripe,organizationId:'org-qa',config,now}
  assert.equal((await drainEnterpriseSeatSync(args)).pending,true)
  assert.equal(db.data.get(outbox).syncedRevision,1)
  assert.equal((await drainEnterpriseSeatSync(args)).pending,false)
  assert.deepEqual(updates.map(call=>call.parameters.items[0].quantity),[3,4])
  assert.ok(updates.every(call=>call.parameters.proration_behavior==='create_prorations'))
  assert.equal(db.data.get(outbox).syncedRevision,2)
})

test('a lost Stripe response retries the same seat operation without inventing a second charge',async()=>{
  const db=setup(),provider=subscription(),keys=[],applied=new Set()
  let loseResponse=true
  const stripe={subscriptions:{retrieve:async()=>structuredClone(provider),update:async(id,parameters,options)=>{
    keys.push(options.idempotencyKey)
    applied.add(options.idempotencyKey)
    provider.items.data[0].quantity=parameters.items[0].quantity
    if(loseResponse){loseResponse=false;throw new Error('Response lost after provider application')}
    return structuredClone(provider)
  }}}
  const args={db,stripe,organizationId:'org-qa',config,now}
  await assert.rejects(drainEnterpriseSeatSync(args),{code:'unavailable',message:'La synchronisation de facturation est temporairement indisponible.'})
  assert.equal(db.data.get(outbox).syncedRevision,0)
  await drainEnterpriseSeatSync({...args,now:db.data.get(outbox).retryAfter ?? now+60000})
  assert.ok(keys.length>=1)
  assert.equal(new Set(keys).size,1)
  assert.equal(applied.size,1)
  assert.equal(db.data.get(outbox).syncedRevision,1)
})

test('a paid webhook cannot reactivate an administratively suspended organization or personal Premium',async()=>{
  const db=setup(1)
  db.data.set('organizations/org-qa',{name:'QA organization',offer:'stripe-enterprise',enabled:false})
  db.data.set('organizations/org-qa/members/manager',{active:true,role:'manager'})
  db.data.set('_stripeEnterpriseCustomers/cus_enterpriseQA',{organizationId:'org-qa',liveMode:false})
  const stripe={subscriptions:{retrieve:async()=>subscription()}}
  const event={id:'evt_enterpriseQA',created:100,livemode:false,type:'invoice.paid',data:{object:{subscription:'sub_enterpriseQA'}}}
  await processEnterpriseSubscriptionEvent({db,stripe,event,config,now})
  assert.equal(db.data.get('organizations/org-qa').enabled,false)
  assert.equal(organizationHasAccess(db.data.get('organizations/org-qa'),now),false)
  assert.deepEqual(await processEnterpriseSubscriptionEvent({db,stripe,event,config,now}),{duplicate:true})
  assert.equal([...db.data.keys()].some(path=>path.startsWith('users/') && path.includes('/settings/subscription')),false)
})

test('a provider event with already matching member quantity does not create an endless quantity-update loop',async()=>{
  const db=setup(1)
  db.data.set(outbox,{organizationId:'org-qa',desiredQuantity:1,revision:1,syncedRevision:1})
  db.data.set('organizations/org-qa',{name:'QA organization',offer:'stripe-enterprise',enabled:true})
  db.data.set('organizations/org-qa/members/manager',{active:true,role:'manager'})
  db.data.set('_stripeEnterpriseCustomers/cus_enterpriseQA',{organizationId:'org-qa',liveMode:false})
  const stripe={subscriptions:{retrieve:async()=>subscription()}}
  const event={id:'evt_matchingQA',created:101,livemode:false,type:'customer.subscription.updated',data:{object:{id:'sub_enterpriseQA'}}}
  await processEnterpriseSubscriptionEvent({db,stripe,event,config,now})
  assert.equal(db.data.get(outbox).revision,1)
  assert.equal(db.data.get(outbox).syncedRevision,1)
})

test('a provider quantity drift reopens reconciliation even when the desired membership count has not changed',async()=>{
  const db=setup(3)
  db.data.set(outbox,{organizationId:'org-qa',desiredQuantity:3,revision:1,syncedRevision:1})
  db.data.set('organizations/org-qa',{name:'QA organization',offer:'stripe-enterprise',enabled:true})
  for(const [uid,role] of [['manager','manager'],['learner-a','learner'],['learner-b','learner']])db.data.set(`organizations/org-qa/members/${uid}`,{active:true,role})
  db.data.set('_stripeEnterpriseCustomers/cus_enterpriseQA',{organizationId:'org-qa',liveMode:false})
  const provider=subscription()
  provider.items.data[0].quantity=2
  const stripe={subscriptions:{retrieve:async()=>structuredClone(provider)}}
  const event={id:'evt_driftQA',created:102,livemode:false,type:'customer.subscription.updated',data:{object:{id:'sub_enterpriseQA'}}}
  await processEnterpriseSubscriptionEvent({db,stripe,event,config,now})
  assert.equal(db.data.get(outbox).desiredQuantity,3)
  assert.ok(db.data.get(outbox).revision>db.data.get(outbox).syncedRevision)
})

test('a prolonged provider failure stops automatic attempts after the configured eight failures',async()=>{
  const db=setup()
  let calls=0,clock=now
  const stripe={subscriptions:{retrieve:async()=>{calls++;throw new Error('Provider unavailable')}}}
  for(let failure=0;failure<8;failure++){
    await assert.rejects(drainEnterpriseSeatSync({db,stripe,organizationId:'org-qa',config,now:clock}),{code:'unavailable',message:'La synchronisation de facturation est temporairement indisponible.'})
    clock=db.data.get(outbox).retryAfter
  }
  const result=await drainEnterpriseSeatSync({db,stripe,organizationId:'org-qa',config,now:clock})
  assert.equal(result.pending,true)
  assert.equal(result.blocked,true)
  assert.equal(calls,8)
  assert.equal(db.data.get(outbox).syncedRevision,0)
})

test('unpaid seat decreases do not create credits for service never paid',async()=>{
  const db=setup(2),provider=subscription(),updates=[]
  provider.latest_invoice.status='open'
  provider.items.data[0].quantity=3
  const stripe={subscriptions:{retrieve:async()=>structuredClone(provider),update:async(id,parameters)=>{updates.push(parameters);return provider}}}
  await drainEnterpriseSeatSync({db,stripe,organizationId:'org-qa',config,now})
  assert.equal(updates[0].proration_behavior,'none')
})

test('an empty organization cancels billing without prorating time from an unpaid invoice',async()=>{
  const db=setup(0),provider=subscription(),cancellations=[]
  provider.latest_invoice.status='open'
  const stripe={subscriptions:{retrieve:async()=>structuredClone(provider),cancel:async(id,parameters,options)=>{cancellations.push({id,parameters,options});return {...provider,status:'canceled'}}}}
  await drainEnterpriseSeatSync({db,stripe,organizationId:'org-qa',config,now})
  assert.equal(cancellations.length,1)
  assert.equal(cancellations[0].parameters.prorate,false)
  assert.equal(db.data.get(outbox).syncedRevision,1)
})

test('a replacement paid subscription works before the old cancellation event arrives and old foreign events cannot revoke it',async()=>{
  const db=setup(1)
  db.data.set('organizations/org-qa',{name:'QA organization',offer:'stripe-enterprise',enabled:true})
  db.data.set('organizations/org-qa/members/manager',{active:true,role:'manager'})
  db.data.set('_stripeEnterpriseCustomers/cus_enterpriseQA',{organizationId:'org-qa',liveMode:false})
  const previous={...subscription(),status:'canceled'}
  const replacement={...subscription(),id:'sub_replacementQA'}
  const stripe={subscriptions:{retrieve:async id=>structuredClone(id===previous.id?previous:replacement)}}
  const paid={id:'evt_replacementPaid',created:200,livemode:false,type:'invoice.paid',data:{object:{subscription:replacement.id}}}
  const accepted=await processEnterpriseSubscriptionEvent({db,stripe,event:paid,config,now})
  assert.equal(accepted.processed,true)
  assert.equal(db.data.get(billing).subscriptionId,replacement.id)
  assert.equal(organizationHasAccess(db.data.get('organizations/org-qa'),now),true)
  const lateCancellation={id:'evt_oldCancellation',created:201,livemode:false,type:'customer.subscription.deleted',data:{object:{id:previous.id}}}
  const ignored=await processEnterpriseSubscriptionEvent({db,stripe,event:lateCancellation,config,now})
  assert.equal(ignored.ignored,true)
  assert.equal(ignored.scope,'enterprise')
  assert.equal(db.data.get(billing).subscriptionId,replacement.id)
  assert.equal(organizationHasAccess(db.data.get('organizations/org-qa'),now),true)
})
