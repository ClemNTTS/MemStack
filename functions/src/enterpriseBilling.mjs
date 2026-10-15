import { AnalysisError } from './analysis.mjs'
import { randomUUID } from 'node:crypto'
import { requireMember } from './accessService.mjs'

const invalid = message => { throw new AnalysisError('invalid-argument',message) }
const unavailable = message => { throw new AnalysisError('failed-precondition',message) }
const exact = (data,keys) => data && typeof data==='object' && !Array.isArray(data) && Object.keys(data).length===keys.length && keys.every(key=>Object.hasOwn(data,key))
const stripeId = (value,prefix) => typeof value==='string' && new RegExp(`^${prefix}_[A-Za-z0-9]+$`).test(value)

// Commercial terms are checked against trusted server configuration, never client input.
export function validateEnterpriseCheckoutRequest(data) {
  if (!exact(data,['organizationId','requestId']) || typeof data.organizationId!=='string' || !/^[A-Za-z0-9_-]{1,128}$/.test(data.organizationId)
    || typeof data.requestId!=='string' || !/^[A-Za-z0-9-]{16,128}$/.test(data.requestId)) invalid('Organisation et identifiant de demande valides requis.')
  return data
}

export function validateEnterprisePrice(price,config) {
  // All commercial choices must be explicit; never inherit the consumer price or defaults.
  if (!config || !stripeId(config.priceId,'price') || config.unitAmount!==1000
    || config.interval!=='month' || config.taxBehavior!=='inclusive' || typeof config.liveMode!=='boolean') unavailable('Le tarif Entreprise doit être configuré à 10 € TTC par membre actif et par mois.')
  if (price?.id!==config.priceId || price.active!==true || price.livemode!==config.liveMode || price.currency!=='eur'
    || price.unit_amount!==config.unitAmount || price.tax_behavior!==config.taxBehavior || price.type!=='recurring' || price.billing_scheme!=='per_unit'
    || price.recurring?.interval!==config.interval || price.recurring?.interval_count!==1 || price.recurring?.usage_type!=='licensed'
    || price.transform_quantity || price.tiers_mode) unavailable('Le tarif Stripe ne correspond pas à l’offre Entreprise autorisée.')
  return price
}

export function enterpriseSubscriptionEntitlement(subscription,{customerId,organizationId,...config},now=Date.now()) {
  const customer = typeof subscription?.customer==='string' ? subscription.customer : subscription?.customer?.id
  if (!stripeId(subscription?.id,'sub') || !stripeId(customerId,'cus') || customer!==customerId || subscription.livemode!==config.liveMode
    || subscription.metadata?.memstackOrganizationId!==organizationId) unavailable('Cet abonnement ne correspond pas à l’organisation.')
  const item = subscription.items?.data?.length===1 ? subscription.items.data[0] : undefined
  if (!Number.isSafeInteger(item?.quantity) || item.quantity<1 || item.quantity>200) unavailable('Le nombre de places facturées est invalide.')
  validateEnterprisePrice(item.price,config)
  const periodEnd = item.current_period_end ?? subscription.current_period_end
  const paid = subscription.status==='active' && subscription.latest_invoice && typeof subscription.latest_invoice==='object'
    && subscription.latest_invoice.status==='paid' && Number.isSafeInteger(periodEnd) && periodEnd*1000>now
  return {version:1,source:'stripe-enterprise',status:paid?'active':'inactive',seatLimit:paid?item.quantity:0,paidUntil:paid?new Date(periodEnd*1000).toISOString():null,
    cancelAtPeriodEnd:subscription.cancel_at_period_end===true || (Number.isSafeInteger(subscription.cancel_at) && subscription.cancel_at*1000>now && subscription.cancel_at<=periodEnd)}
}

export const enterpriseCommercialTerms = {unitAmount:1000,interval:'month',taxBehavior:'inclusive'}
const orgRef = (db,id) => db.doc(`organizations/${id}`)
const billingRef = (db,id) => db.doc(`organizations/${id}/billing/stripe`)
const validOrganizationId = value => typeof value==='string' && /^[A-Za-z0-9_-]{1,128}$/.test(value)
export function organizationHasAccess(organization,now=Date.now()) {
  return organization?.enabled===true && (organization.offer!=='stripe-enterprise' || (organization.entitlement?.status==='active' && Date.parse(organization.entitlement.paidUntil)>now))
}
async function actor({db,auth,lookup}) {
  const uid = requireMember(auth), account = await lookup(uid)
  if (account.disabled || !account.emailVerified || (await db.doc(`_accountLifecycle/${uid}`).get()).exists) throw new AnalysisError('permission-denied','Compte actif et vérifié requis.')
  return uid
}
async function manager(tx,db,uid,organizationId) {
  if (!validOrganizationId(organizationId)) invalid('Organisation invalide.')
  const [organization,member,marker] = await Promise.all([tx.get(orgRef(db,organizationId)),tx.get(db.doc(`organizations/${organizationId}/members/${uid}`)),tx.get(db.doc(`_accountLifecycle/${uid}`))])
  if (marker.exists || !organization.exists || member.data()?.active!==true || member.data()?.role!=='manager') throw new AnalysisError('permission-denied','Responsable actuel de cette organisation requis.')
  return organization.data()
}
function requireEnabled(config) {if(config.enabled!==true) unavailable('Le paiement Entreprise n’est pas encore ouvert.')}

export async function createEnterpriseOrganization({db,auth,lookup,data,config,now=Date.now()}) {
  requireEnabled(config)
  const uid = await actor({db,auth,lookup})
  if (!exact(data,['name','requestId']) || typeof data.name!=='string' || data.name.trim().length<2 || data.name.trim().length>100 || typeof data.requestId!=='string' || !/^[A-Za-z0-9-]{16,128}$/.test(data.requestId)) invalid('Nom et identifiant de création requis.')
  const candidate = randomUUID()
  return db.runTransaction(async tx=>{
    const receiptRef = db.doc(`_enterpriseSelfService/${uid}_${data.requestId}`), budgetRef = db.doc(`users/${uid}/operationLimits/enterpriseCreation`)
    const [receipt,budget,marker,spaces] = await Promise.all([tx.get(receiptRef),tx.get(budgetRef),tx.get(db.doc(`_accountLifecycle/${uid}`)),tx.get(db.collection(`users/${uid}/enterpriseMemberships`).where('active','==',true).limit(20))])
    if (marker.exists) throw new AnalysisError('permission-denied','Compte indisponible.')
    if (receipt.exists) {
      if(receipt.data().name!==data.name.trim()) throw new AnalysisError('already-exists','Cette demande concerne une autre organisation.')
      return {organizationId:receipt.data().organizationId}
    }
    if(spaces.size>=20) throw new AnalysisError('resource-exhausted','Limite de vingt espaces entreprise atteinte.')
    const count = budget.data()?.window>now-86400000 ? budget.data().count : 0
    if(count>=3) throw new AnalysisError('resource-exhausted','Trois créations maximum par jour.')
    tx.create(orgRef(db,candidate),{name:data.name.trim(),enabled:true,offer:'stripe-enterprise',createdAt:new Date(now).toISOString(),createdBy:uid,seatLimit:200,entitlement:{status:'pending',paidUntil:null,seatLimit:0}})
    tx.create(db.doc(`organizations/${candidate}/members/${uid}`),{active:true,role:'manager',alias:'Responsable',joinedAt:new Date(now).toISOString()})
    tx.create(db.doc(`users/${uid}/enterpriseMemberships/${candidate}`),{active:true,organizationId:candidate})
    tx.create(receiptRef,{actorUid:uid,name:data.name.trim(),organizationId:candidate})
    tx.set(budgetRef,{count:count+1,window:count?budget.data().window:now})
    return {organizationId:candidate}
  })
}

export async function getEnterpriseBilling({db,auth,lookup,data,config,now=Date.now()}) {
  const uid = await actor({db,auth,lookup})
  if(!exact(data,['organizationId'])) invalid('Organisation requise.')
  return db.runTransaction(async tx=>{
    const org = await manager(tx,db,uid,data.organizationId)
    const [billing,members,sync] = await Promise.all([tx.get(billingRef(db,data.organizationId)),tx.get(db.collection(`organizations/${data.organizationId}/members`).where('active','==',true).limit(201)),tx.get(db.doc(`_enterpriseSeatSync/${data.organizationId}`))])
    return {enabled:config.enabled===true,organizationId:data.organizationId,name:org.name,suspended:org.enabled!==true,status:org.offer==='managed-pilot'?'pilot':organizationHasAccess(org,now)?'active':org.entitlement?.status==='pending'?'pending':'inactive',...enterpriseCommercialTerms,
      activeMembers:members.size,billedMembers:org.entitlement?.seatLimit??0,paidUntil:org.entitlement?.paidUntil??null,cancelAtPeriodEnd:org.entitlement?.cancelAtPeriodEnd===true,
      canManage:stripeId(billing.data()?.customerId,'cus') && billing.data().liveMode===config.liveMode,syncPending:(sync.data()?.revision??0)>(sync.data()?.syncedRevision??0)}
  })
}

export async function createEnterpriseCheckout({db,stripe,auth,lookup,data,config,now=Date.now()}) {
  requireEnabled(config);validateEnterpriseCheckoutRequest(data)
  const uid = await actor({db,auth,lookup}), organizationId = data.organizationId
  validateEnterprisePrice(await stripe.prices.retrieve(config.priceId),config)
  await db.runTransaction(async tx=>{const org=await manager(tx,db,uid,organizationId);if(org.enabled!==true) unavailable('Cet espace est suspendu. Contacte son administrateur avant de payer.');if(org.offer!=='stripe-enterprise') unavailable('Cet espace administré ne nécessite pas de paiement.')})
  const previousBilling=(await billingRef(db,organizationId).get()).data()
  const customer = previousBilling?.customerId ? await stripe.customers.retrieve(previousBilling.customerId) : await stripe.customers.create({metadata:{memstackScope:'enterprise',memstackOrganizationId:organizationId}},{idempotencyKey:`memstack-org-customer-${config.liveMode?'live':'test'}-${organizationId}`})
  if(!stripeId(customer.id,'cus') || customer.livemode!==config.liveMode) unavailable('Client Stripe incompatible.')
  const state = await db.runTransaction(async tx=>{
    if((await manager(tx,db,uid,organizationId)).enabled!==true) unavailable('Cet espace est suspendu.')
    const ref=billingRef(db,organizationId), previous=await tx.get(ref)
    if(previous.exists && (previous.data().customerId!==customer.id || previous.data().liveMode!==config.liveMode)) unavailable('Client de facturation incompatible.')
    tx.set(ref,{...(previous.data()??{}),customerId:customer.id,liveMode:config.liveMode})
    tx.set(db.doc(`_stripeEnterpriseCustomers/${customer.id}`),{organizationId,liveMode:config.liveMode})
    return previous.data()
  })
  const existing=await stripe.subscriptions.list({customer:customer.id,status:'all',limit:100})
  if(existing.has_more || existing.data.some(row=>!['canceled','incomplete_expired'].includes(row.status))) throw new AnalysisError('already-exists','Un abonnement existe déjà. Ouvre sa gestion.')
  const lease = await db.runTransaction(async tx=>{
    if((await manager(tx,db,uid,organizationId)).enabled!==true) unavailable('Cet espace est suspendu.')
    const [billing,members] = await Promise.all([tx.get(billingRef(db,organizationId)),tx.get(db.collection(`organizations/${organizationId}/members`).where('active','==',true).limit(201))])
    if(members.size<1 || members.size>200) unavailable('Nombre de membres actifs invalide.')
    const current=billing.data()
    if(current.checkoutExpiresAt>now) return {bucket:current.checkoutBucket,sequence:current.checkoutSequence,expiresAt:current.checkoutExpiresAt,quantity:current.checkoutQuantity}
    const bucket=Math.floor(now/1800000),expiresAt=(bucket+2)*1800000
    const sequence=(current.checkoutSequence??0)+1
    tx.set(billingRef(db,organizationId),{...current,checkoutBucket:bucket,checkoutSequence:sequence,checkoutExpiresAt:expiresAt,checkoutQuantity:members.size})
    return {bucket,sequence,expiresAt,quantity:members.size}
  })
  const session=await stripe.checkout.sessions.create({customer:customer.id,mode:'subscription',line_items:[{price:config.priceId,quantity:lease.quantity}],client_reference_id:organizationId,
    subscription_data:{metadata:{memstackScope:'enterprise',memstackOrganizationId:organizationId}},metadata:{memstackScope:'enterprise',memstackOrganizationId:organizationId},
    success_url:`https://memstack.fr/#/enterprise?org=${encodeURIComponent(organizationId)}&payment=success`,cancel_url:`https://memstack.fr/#/enterprise?org=${encodeURIComponent(organizationId)}&payment=cancelled`,expires_at:lease.expiresAt/1000,locale:'fr',managed_payments:{enabled:true}},
    {idempotencyKey:`memstack-org-checkout-${customer.id}-${lease.sequence}`})
  if(typeof session.url!=='string' || !session.url.startsWith('https://checkout.stripe.com/')) unavailable('Page de paiement indisponible.')
  return {url:session.url}
}

export async function createEnterprisePortal({db,stripe,auth,lookup,data,config}) {
  requireEnabled(config);const uid=await actor({db,auth,lookup})
  if(!exact(data,['organizationId'])) invalid('Organisation requise.')
  const customerId=await db.runTransaction(async tx=>{await manager(tx,db,uid,data.organizationId);const state=(await tx.get(billingRef(db,data.organizationId))).data();if(!stripeId(state?.customerId,'cus') || state.liveMode!==config.liveMode) unavailable('Aucun paiement à gérer.');return state.customerId})
  // A dedicated portal configuration must disable manual quantity/price updates.
  if(!stripeId(config.portalConfigurationId,'bpc')) unavailable('Le portail Entreprise doit être configuré sans modification manuelle des places.')
  const portal=await stripe.billingPortal.configurations.retrieve(config.portalConfigurationId)
  if(portal.active!==true || portal.livemode!==config.liveMode || portal.features?.subscription_update?.enabled!==false) unavailable('Le portail Entreprise doit interdire les modifications manuelles de quantité ou de tarif.')
  const session=await stripe.billingPortal.sessions.create({customer:customerId,configuration:config.portalConfigurationId,return_url:`https://memstack.fr/#/enterprise?org=${encodeURIComponent(data.organizationId)}`})
  if(typeof session.url!=='string' || !session.url.startsWith('https://billing.stripe.com/')) unavailable('Portail indisponible.')
  return {url:session.url}
}

// Call before any writes in the membership transaction. Invitations alone never call it.
export async function queueEnterpriseSeatSync(tx,db,organizationId,quantity,knownProviderQuantity) {
  const ref=db.doc(`_enterpriseSeatSync/${organizationId}`), previous=(await tx.get(ref)).data()??{}
  if(previous.desiredQuantity===quantity && (knownProviderQuantity===undefined || knownProviderQuantity===quantity)) {
    if(knownProviderQuantity===quantity && !previous.leaseId && previous.revision>(previous.syncedRevision??0)) tx.set(ref,{...previous,syncedRevision:previous.revision})
    return
  }
  if(previous.desiredQuantity===undefined && knownProviderQuantity===quantity) return
  tx.set(ref,{...previous,organizationId,desiredQuantity:quantity,revision:(previous.revision??0)+1,syncedRevision:previous.syncedRevision??0})
}

export async function drainEnterpriseSeatSync({db,stripe,organizationId,config,now=Date.now(),manual=false}) {
  requireEnabled(config)
  if(!validOrganizationId(organizationId)) invalid('Organisation invalide.')
  const ref=db.doc(`_enterpriseSeatSync/${organizationId}`)
  const claim=await db.runTransaction(async tx=>{
    const [snapshot,billing]=await Promise.all([tx.get(ref),tx.get(billingRef(db,organizationId))])
    const state=snapshot.data(),account=billing.data()
    if(!state || state.revision<=(state.syncedRevision??0)) return null
    if(!manual && (state.failures??0)>=8) return {blocked:true}
    if(!manual && (state.retryAfter??0)>now) throw new AnalysisError('unavailable','Synchronisation différée. Réessaie plus tard.')
    if(!stripeId(account?.subscriptionId,'sub') || account.liveMode!==config.liveMode) return null
    if(state.leaseUntil>now) throw new AnalysisError('unavailable','Une synchronisation est en cours.')
    const lease=state.leaseId ? {leaseId:state.leaseId,leaseRevision:state.leaseRevision,leaseQuantity:state.leaseQuantity} : {leaseId:randomUUID(),leaseRevision:state.revision,leaseQuantity:state.desiredQuantity}
    tx.set(ref,{...state,...lease,leaseUntil:now+180000})
    return {...lease,subscriptionId:account.subscriptionId,customerId:account.customerId}
  })
  if(!claim) return {pending:false}
  if(claim.blocked) return {pending:true,blocked:true}
  try {
    const subscription=await stripe.subscriptions.retrieve(claim.subscriptionId,{expand:['latest_invoice']})
    if(subscription.metadata?.memstackOrganizationId!==organizationId || subscription.customer!==claim.customerId || subscription.livemode!==config.liveMode) unavailable('Abonnement incompatible avec cette organisation.')
    if(!['canceled','incomplete_expired'].includes(subscription.status)) {
      if(claim.leaseQuantity===0) await stripe.subscriptions.cancel(subscription.id,{prorate:subscription.latest_invoice?.status==='paid'},{idempotencyKey:`memstack-org-seats-${claim.leaseId}`})
      else {
        if(subscription.items?.data?.length!==1) unavailable('Abonnement à plusieurs tarifs non reconnu.')
        validateEnterprisePrice(subscription.items.data[0].price,config)
        if(subscription.items.data[0].quantity!==claim.leaseQuantity) await stripe.subscriptions.update(subscription.id,{items:[{id:subscription.items.data[0].id,quantity:claim.leaseQuantity}],proration_behavior:subscription.latest_invoice?.status==='paid'?'create_prorations':'none'},
          {idempotencyKey:`memstack-org-seats-${claim.leaseId}`})
      }
    }
    const pending=await db.runTransaction(async tx=>{
      const current=(await tx.get(ref)).data()
      if(current?.leaseId!==claim.leaseId) return true
      tx.set(ref,{...current,syncedRevision:Math.max(current.syncedRevision??0,claim.leaseRevision),leaseId:null,leaseRevision:null,leaseQuantity:null,leaseUntil:0,failures:0,retryAfter:0})
      return current.revision>claim.leaseRevision
    })
    return {pending}
  } catch(error) {
    await db.runTransaction(async tx=>{const current=(await tx.get(ref)).data();if(current?.leaseId===claim.leaseId) tx.update(ref,{leaseUntil:0,failures:(current.failures??0)+1,retryAfter:now+Math.min(3600000,30000*2**Math.min(current.failures??0,7))})})
    throw new AnalysisError('unavailable','La synchronisation de facturation est temporairement indisponible.')
  }
}

export async function processEnterpriseSubscriptionEvent({db,stripe,event,config,now=Date.now()}) {
  if(!stripeId(event?.id,'evt') || event.livemode!==config.liveMode || !Number.isSafeInteger(event.created)) invalid('Notification Stripe invalide.')
  const object=event.data?.object
  let subscriptionId
  if(event.type?.startsWith('checkout.session.')) subscriptionId=typeof object.subscription==='string'?object.subscription:object.subscription?.id
  else if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event.type)) subscriptionId=object.id
  else if(['invoice.paid','invoice.payment_failed'].includes(event.type)) {const subscription=object.parent?.subscription_details?.subscription??object.subscription;subscriptionId=typeof subscription==='string'?subscription:subscription?.id}
  else return {ignored:true}
  if(!stripeId(subscriptionId,'sub')) return {ignored:true}
  const eventRef=db.doc(`_stripeEnterpriseEvents/${event.id}`)
  if((await eventRef.get()).exists) return {duplicate:true}
  const initial=await stripe.subscriptions.retrieve(subscriptionId,{expand:['latest_invoice']})
  const customerId=typeof initial.customer==='string'?initial.customer:initial.customer?.id
  const linked=(await db.doc(`_stripeEnterpriseCustomers/${customerId}`).get()).data()
  if(!linked || !validOrganizationId(linked.organizationId) || linked.liveMode!==config.liveMode) return {ignored:true}
  return db.runTransaction(async tx=>{
    const organizationId=linked.organizationId
    const [processed,organization,billing,mapping,members]=await Promise.all([tx.get(eventRef),tx.get(orgRef(db,organizationId)),tx.get(billingRef(db,organizationId)),tx.get(db.doc(`_stripeEnterpriseCustomers/${customerId}`)),tx.get(db.collection(`organizations/${organizationId}/members`).where('active','==',true).limit(201))])
    if(processed.exists) return {duplicate:true}
    if(organization.data()?.offer!=='stripe-enterprise' || mapping.data()?.organizationId!==organizationId || billing.data()?.customerId!==customerId || billing.data()?.liveMode!==config.liveMode) unavailable('Organisation de facturation incompatible.')
    const state=billing.data()
    if(state.lastEventCreated>event.created){tx.set(eventRef,{created:event.created,processedAt:now});return {outdated:true}}
    const current=await stripe.subscriptions.retrieve(subscriptionId,{expand:['latest_invoice']})
    if(state.subscriptionId && state.subscriptionId!==current.id && !['canceled','incomplete_expired'].includes(state.subscriptionStatus)) {
      const previous=await stripe.subscriptions.retrieve(state.subscriptionId)
      if(!['canceled','incomplete_expired'].includes(previous.status)) {tx.set(eventRef,{created:event.created,processedAt:now,ignored:true});return {ignored:true,scope:'enterprise'}}
    }
    let entitlement=enterpriseSubscriptionEntitlement(current,{...config,customerId,organizationId},now)
    const previous=organization.data().entitlement
    // A pending seat increase must not erase previously paid service; no new period is granted.
    if(entitlement.status!=='active' && current.status==='active' && previous?.status==='active' && Date.parse(previous.paidUntil)>now) entitlement=previous
    const noManager=!members.docs.some(row=>row.data().role==='manager')
    await queueEnterpriseSeatSync(tx,db,organizationId,noManager?0:members.size,current.items?.data?.[0]?.quantity)
    tx.update(orgRef(db,organizationId),{entitlement,enabled:noManager?false:organization.data().enabled})
    tx.set(billingRef(db,organizationId),{...state,subscriptionId:current.id,subscriptionStatus:current.status,lastEventCreated:event.created,checkoutExpiresAt:0})
    tx.set(eventRef,{created:event.created,processedAt:now})
    return {processed:true}
  })
}
