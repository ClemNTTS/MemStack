import test from 'node:test'
import assert from 'node:assert/strict'
import { validateEnterpriseCheckoutRequest,validateEnterprisePrice,enterpriseSubscriptionEntitlement } from './enterpriseBilling.mjs'

// Fictional identifiers; these tests never create a product or call Stripe.
const config = {priceId:'price_enterpriseFixture',unitAmount:1000,interval:'month',taxBehavior:'inclusive',liveMode:false}
const price = {id:config.priceId,active:true,livemode:false,currency:'eur',unit_amount:1000,tax_behavior:'inclusive',type:'recurring',billing_scheme:'per_unit',recurring:{interval:'month',interval_count:1,usage_type:'licensed'}}
const now = Date.parse('2026-10-15T10:00:00Z')
const subscription = {id:'sub_enterpriseFixture',customer:'cus_orgFixture',livemode:false,metadata:{memstackOrganizationId:'organization-one'},status:'active',latest_invoice:{status:'paid'},items:{data:[{quantity:10,price,current_period_end:Math.floor(now/1000)+86400}]}}
const entitlement = (value=subscription,settings={}) => enterpriseSubscriptionEntitlement(value,{...config,customerId:'cus_orgFixture',organizationId:'organization-one',...settings},now)

test('organization checkout never accepts client quantity, prices, roles or billing ownership',()=>{
  const data = {organizationId:'organization-one',requestId:'request-checkout-organization'}
  assert.deepEqual(validateEnterpriseCheckoutRequest(data),data)
  for (const patch of [{seats:0},{seats:201},{seats:1.5},{unitAmount:1},{priceId:'price_consumer'},{uid:'other'},{role:'manager'}]) assert.throws(()=>validateEnterpriseCheckoutRequest({...data,...patch}),{code:'invalid-argument'})
})
test('B2B price validation requires explicit period and tax terms and rejects consumer or metered prices',()=>{
  assert.equal(validateEnterprisePrice(price,config),price)
  for (const field of ['interval','taxBehavior','unitAmount','liveMode']) {const missing={...config};delete missing[field];assert.throws(()=>validateEnterprisePrice(price,missing),{code:'failed-precondition'})}
  for (const patch of [{id:'price_consumer'},{unit_amount:150},{currency:'usd'},{livemode:true},{tax_behavior:'exclusive'},{recurring:{...price.recurring,interval:'year'}},{recurring:{...price.recurring,usage_type:'metered'}},{transform_quantity:{divide_by:5,round:'up'}}]) assert.throws(()=>validateEnterprisePrice({...price,...patch},config),{code:'failed-precondition'})
})
test('only current paid organization subscriptions grant their exact quantity; pending or foreign payments cannot grant seats',()=>{
  assert.equal(entitlement().seatLimit,10)
  assert.equal(entitlement().source,'stripe-enterprise')
  for (const patch of [{status:'trialing'},{status:'past_due'},{status:'canceled'},{latest_invoice:{status:'open'}},{latest_invoice:'in_unexpanded'}]) assert.equal(entitlement({...subscription,...patch}).seatLimit,0)
  for (const patch of [{customer:'cus_other'},{metadata:{memstackOrganizationId:'other'}},{livemode:true},{items:{data:[...subscription.items.data,...subscription.items.data]}}]) assert.throws(()=>entitlement({...subscription,...patch}),{code:'failed-precondition'})
  assert.equal(entitlement({...subscription,cancel_at_period_end:true}).seatLimit,10)
  assert.equal(entitlement({...subscription,items:{data:[{...subscription.items.data[0],current_period_end:Math.floor(now/1000)}]}}).seatLimit,0)
})
