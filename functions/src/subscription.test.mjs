import test from 'node:test'
import assert from 'node:assert/strict'
import { createSubscriptionCheckout, hasPremium, processSubscriptionEvent, resolveSubscriptionPrices, subscriptionEntitlement, validateCheckoutRequest, validateSubscriptionPrice } from './subscription.mjs'
import Stripe from 'stripe'
import { hasPermanentPremium, closeAccountBilling, publicSubscriptionStatus } from './subscription.mjs'

test('account deletion closes open checkouts and subscriptions before unlinking billing', async () => {
  const calls = []
  const db = { doc: path => ({ get: async () => ({ data: () => ({ customerId:'cus_member',liveMode:false }) }), delete: async () => calls.push(path) }) }
  const stripe = {
    checkout:{ sessions:{ list:async () => ({ has_more:false,data:[{id:'cs_open'}] }),expire:async id => calls.push(id) } },
    subscriptions:{ list:async () => ({ has_more:false,data:[{id:'sub_active',status:'active'},{id:'sub_old',status:'canceled'}] }),cancel:async id => calls.push(id) }
  }
  await closeAccountBilling({db,stripe,uid:'member',liveMode:false})
  assert.deepEqual(calls,['cs_open','sub_active','_stripeCustomers/cus_member'])
  calls.length = 0
  await assert.rejects(closeAccountBilling({db,stripe,uid:'member',liveMode:true}),{code:'failed-precondition'})
  assert.deepEqual(calls,[])
  stripe.subscriptions.cancel = async () => { throw new Error('Stripe unavailable') }
  await assert.rejects(closeAccountBilling({db,stripe,uid:'member',liveMode:false}),/Stripe unavailable/)
  assert.deepEqual(calls,['cs_open'])
})

test('permanent access requires an explicit trusted grant, independently of Stripe periods', () => {
  assert.equal(hasPermanentPremium({ version: 1, permanent: true }), true)
  for (const value of [null, {}, { version: 1, permanent: false }, { version: 1, permanent: 'true' }, { version: 2, permanent: true }]) assert.equal(hasPermanentPremium(value), false)
})

const now = Date.UTC(2026, 9, 14, 12)
const price = { id: 'price_monthly', active: true, livemode: false, currency: 'eur', unit_amount: 150,
  recurring: { interval: 'month', interval_count: 1 }, type: 'recurring', billing_scheme: 'per_unit', tax_behavior: 'inclusive' }
const config = { customerId: 'cus_member', prices: { monthly: 'price_monthly', annual: 'price_annual' }, liveMode: false, now }
const subscription = { id: 'sub_member', customer: 'cus_member', livemode: false, status: 'active', cancel_at_period_end: false,
  items: { data: [{ quantity: 1, price, current_period_end: Math.floor(now / 1000) + 86400 }] }, latest_invoice: { status: 'paid' } }

test('checkout accepts a plan, never a client supplied price, role, uid or return URL', () => {
  const request = { plan: 'annual', requestId: 'stable-request-identifier' }
  assert.deepEqual(validateCheckoutRequest(request), request)
  for (const input of [null, {}, { ...request, plan: 'fake' }, { ...request, requestId: '../owner' },
    { ...request, price: 'price_other' }, { ...request, uid: 'other' }, { ...request, role: 'premium' }, { ...request, success_url: 'https://evil.example' }]) {
    assert.throws(() => validateCheckoutRequest(input))
  }
})

test('only the exact configured EUR recurring TTC prices are accepted, never the USD example', () => {
  assert.equal(validateSubscriptionPrice(price, 'monthly', 'price_monthly', false), price)
  for (const patch of [{ id: 'price_other' }, { currency: 'usd' }, { unit_amount: 100 }, { unit_amount: 1000 }, { active: false }, { livemode: true },
    { tax_behavior: 'exclusive' }, { type: 'one_time' }, { recurring: { interval: 'year', interval_count: 1 } },
    { recurring: { interval: 'month', interval_count: 2 } }]) assert.throws(() => validateSubscriptionPrice({ ...price, ...patch }, 'monthly', 'price_monthly', false))
})

test('a paid active subscription grants premium until its expiry, cancellation at term preserves paid access', () => {
  const result = subscriptionEntitlement(subscription, config)
  assert.equal(hasPremium(result, now), true)
  assert.equal(hasPremium(result, now + 86400000), false)
  assert.equal(hasPremium(subscriptionEntitlement({ ...subscription, cancel_at_period_end: true }, config), now), true)
})

test('portal cancellation with cancel_at is reflected without extending the paid period', () => {
  const periodEnd = subscription.items.data[0].current_period_end
  const result = subscriptionEntitlement({...subscription,cancel_at:periodEnd},config)
  assert.equal(result.cancelAtPeriodEnd,true)
  assert.equal(result.premiumUntil,subscriptionEntitlement(subscription,config).premiumUntil)
  assert.equal(hasPremium(result,now),true)
  assert.equal(hasPremium(result,periodEnd*1000),false)
  for (const cancelAt of [null,'invalid',periodEnd+86400,Math.floor(now/1000)-1]) assert.equal(subscriptionEntitlement({...subscription,cancel_at:cancelAt},config).cancelAtPeriodEnd,false)
})

test('unpaid members can manage existing billing and canceled members can resubscribe without gaining premium', () => {
  const billing={customerId:'cus_member',subscriptionId:'sub_member',liveMode:false,subscriptionStatus:'past_due'}
  const args={billing,entitlement:subscriptionEntitlement({...subscription,status:'past_due'},config),enabled:true,liveMode:false,now}
  const status=publicSubscriptionStatus(args)
  assert.equal(status.premium,false)
  assert.equal(status.canManageSubscription,true)
  assert.equal(status.hasOpenSubscription,true)
  assert.equal(publicSubscriptionStatus({...args,billing:{...billing,subscriptionStatus:'canceled'}}).hasOpenSubscription,false)
  assert.equal(publicSubscriptionStatus({...args,billing:{...billing,liveMode:true}}).canManageSubscription,false)
  assert.equal(publicSubscriptionStatus({...args,billing:undefined}).hasOpenSubscription,false)
  assert.equal(publicSubscriptionStatus({...args,access:{version:1,permanent:true}}).premium,true)
})

test('trials, pending payments, failures, immediate cancellation and unexpanded invoices never grant premium', () => {
  for (const patch of [{ status: 'trialing' }, { status: 'incomplete' }, { status: 'past_due' }, { status: 'canceled' },
    { latest_invoice: { status: 'open' } }, { latest_invoice: 'in_unexpanded' }, { latest_invoice: null }]) {
    assert.equal(hasPremium(subscriptionEntitlement({ ...subscription, ...patch }, config), now), false)
  }
})

test('another customer, test/live mismatch, unexpected extra items and foreign tariffs cannot grant premium', () => {
  for (const patch of [{ customer: 'cus_other' }, { livemode: true }, { items: { data: [] } },
    { items: { data: [subscription.items.data[0], subscription.items.data[0]] } },
    { items: { data: [{ ...subscription.items.data[0], quantity: 2 }] } },
    { items: { data: [{ ...subscription.items.data[0], price: { ...price, id: 'price_other' } }] } }]) {
    assert.throws(() => subscriptionEntitlement({ ...subscription, ...patch }, config))
  }
  assert.equal(hasPremium({ ...subscriptionEntitlement(subscription, config), premiumUntil: 'invalid' }, now), false)
})

function memoryDb() {
  const data = new Map()
  const snapshot = path => ({ exists: data.has(path), data: () => data.get(path) })
  return { data, doc: path => ({ path, get: async () => snapshot(path) }),
    runTransaction: async callback => {
      const writes = []
      const result = await callback({ get: async ref => snapshot(ref.path), set: (ref, value) => writes.push([ref.path, value]) })
      for (const [path, value] of writes) data.set(path, value)
      return result
    } }
}

test('the two existing prices can be supplied in either order without assuming their plan', async () => {
  const annual = { ...price, id: 'price_annual', unit_amount: 990, recurring: { interval: 'year', interval_count: 1 } }
  const stripe = { prices: { retrieve: async id => id === annual.id ? annual : price } }
  assert.deepEqual(await resolveSubscriptionPrices(stripe, ['price_annual', 'price_monthly'], false), config.prices)
  await assert.rejects(resolveSubscriptionPrices(stripe, ['price_monthly', 'price_monthly'], false))
})

test('managed checkout retries reuse their customer and session lease, and cannot start a second offer', async () => {
  const db = memoryDb()
  const requests = []
  let customers = 0
  const stripe = { prices: { retrieve: async () => price }, customers: { create: async () => { customers++; return { id: 'cus_member', livemode: false } } },
    subscriptions: { list: async () => ({ has_more: false, data: [] }) },
    checkout: { sessions: { create: async (...args) => { requests.push(args); return { url: 'https://checkout.stripe.com/c/pay/test' } } } } }
  const args = { db, stripe, uid: 'member', data: { plan: 'monthly', requestId: 'checkout-stable-request' }, config: { ...config, enabled: true, mode: 'managed' }, now }
  await createSubscriptionCheckout(args)
  await createSubscriptionCheckout({ ...args, now: now + 1800001 })
  assert.equal(customers, 1)
  assert.deepEqual(requests[0], requests[1])
  assert.equal(requests[0][0].managed_payments.enabled, true)
  assert.equal(requests[0][0].mode, 'subscription')
  assert.deepEqual(requests[0][0].line_items, [{ price: 'price_monthly', quantity: 1 }])
  assert.equal(requests[0][0].success_url, 'https://memstack.fr/#/premium?payment=success')
  db.data.set('_accountLifecycle/member', { status: 'deleting' })
  await assert.rejects(createSubscriptionCheckout(args), { code: 'failed-precondition' })
  assert.equal(requests.length, 2)
})

test('SDK signature validation rejects a modified body, an invalid signature and an expired notification', () => {
  const stripe = new Stripe('sk_test_fixture_only')
  const payload = JSON.stringify({ id: 'evt_example', object: 'event' })
  const secret = 'whsec_fixture_only'
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret })
  assert.equal(stripe.webhooks.constructEvent(payload, header, secret).id, 'evt_example')
  assert.throws(() => stripe.webhooks.constructEvent(payload + ' ', header, secret))
  assert.throws(() => stripe.webhooks.constructEvent(payload, header, 'whsec_other_fixture'))
  const old = stripe.webhooks.generateTestHeaderString({ payload, secret, timestamp: Math.floor(Date.now() / 1000) - 1000 })
  assert.throws(() => stripe.webhooks.constructEvent(payload, old, secret))
})

test('verified events write one entitlement, duplicates do nothing and old events cannot restore premium', async () => {
  const db = memoryDb()
  db.data.set('_stripeCustomers/cus_member', { uid: 'member', liveMode: false })
  db.data.set('users/member/billing/stripe', { customerId: 'cus_member', liveMode: false })
  let current = subscription
  const stripe = { subscriptions: { retrieve: async () => current } }
  const event = { id: 'evt_paid', created: 100, livemode: false, type: 'invoice.paid', data: { object: { parent: { subscription_details: { subscription: 'sub_member' } } } } }
  const args = { db, stripe, event, config, now }
  await processSubscriptionEvent(args)
  assert.equal(hasPremium(db.data.get('users/member/settings/subscription'), now), true)
  assert.deepEqual(await processSubscriptionEvent(args), { duplicate: true })
  current = { ...subscription, status: 'canceled' }
  await processSubscriptionEvent({ ...args, event: { ...event, id: 'evt_cancelled', created: 102 } })
  current = subscription
  await processSubscriptionEvent({ ...args, event: { ...event, id: 'evt_old', created: 101 } })
  assert.equal(hasPremium(db.data.get('users/member/settings/subscription'), now), false)
  db.data.set('_accountLifecycle/member', { status: 'deleting' })
  await processSubscriptionEvent({ ...args, event: { ...event, id: 'evt_deleted', created: 103 } })
  assert.equal(hasPremium(db.data.get('users/member/settings/subscription'), now), false)
})
