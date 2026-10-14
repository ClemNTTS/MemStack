import { AnalysisError } from './analysis.mjs'

const plans = { monthly: { amount: 150, interval: 'month' }, annual: { amount: 990, interval: 'year' } }
const exact = (data, keys) => data && typeof data === 'object' && !Array.isArray(data)
  && Object.keys(data).length === keys.length && keys.every(key => Object.hasOwn(data, key))
const stripeId = (value, prefix) => typeof value === 'string' && new RegExp(`^${prefix}_[a-zA-Z0-9]+$`).test(value)

export function validateCheckoutRequest(data) {
  if (!exact(data, ['plan', 'requestId']) || !Object.hasOwn(plans, data.plan)
    || typeof data.requestId !== 'string' || !/^[a-zA-Z0-9-]{16,128}$/.test(data.requestId)) {
    throw new AnalysisError('invalid-argument', 'Choisis un abonnement valide.')
  }
  return data
}

export function validateSubscriptionPrice(price, plan, expectedId, liveMode) {
  const expected = plans[plan]
  if (!expected || !stripeId(expectedId, 'price') || price?.id !== expectedId || price.active !== true
    || price.livemode !== liveMode || price.currency !== 'eur' || price.unit_amount !== expected.amount
    || price.recurring?.interval !== expected.interval || price.recurring?.interval_count !== 1
    || price.type !== 'recurring' || price.billing_scheme !== 'per_unit'
    || price.tax_behavior !== 'inclusive') {
    throw new AnalysisError('failed-precondition', 'Le tarif TTC de cet abonnement n’est pas correctement configuré.')
  }
  return price
}

export function subscriptionEntitlement(subscription, { customerId, prices, liveMode, now }) {
  const customer = typeof subscription?.customer === 'string' ? subscription.customer : subscription?.customer?.id
  if (!stripeId(subscription?.id, 'sub') || customer !== customerId || subscription.livemode !== liveMode) {
    throw new AnalysisError('failed-precondition', 'Abonnement incompatible avec ce compte.')
  }
  const items = subscription.items?.data
  const item = items?.length === 1 ? items[0] : undefined
  const plan = Object.keys(plans).find(name => prices[name] === item?.price?.id)
  if (!plan || item.quantity !== 1) throw new AnalysisError('failed-precondition', 'Tarif d’abonnement non reconnu.')
  validateSubscriptionPrice(item.price, plan, prices[plan], liveMode)
  const periodEnd = item.current_period_end ?? subscription.current_period_end
  const invoice = subscription.latest_invoice
  // Neither a checkout redirect, a trial, nor an unpaid subscription grants premium.
  const paid = invoice && typeof invoice === 'object' && invoice.status === 'paid'
  const premium = subscription.status === 'active' && paid && Number.isSafeInteger(periodEnd) && periodEnd * 1000 > now
  return { version: 1, source: 'stripe', status: premium ? 'premium' : 'free', plan,
    premiumUntil: premium ? new Date(periodEnd * 1000).toISOString() : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end === true
      || (Number.isSafeInteger(subscription.cancel_at) && subscription.cancel_at * 1000 > now && subscription.cancel_at <= periodEnd) }
}

export function hasPremium(entitlement, now = Date.now()) {
  return entitlement?.version === 1 && entitlement.source === 'stripe' && entitlement.status === 'premium'
    && typeof entitlement.premiumUntil === 'string' && Date.parse(entitlement.premiumUntil) > now
}

export function hasPermanentPremium(access) {
  return access?.version === 1 && access.permanent === true
}

export function publicSubscriptionStatus({ entitlement, access, billing, enabled, liveMode, now = Date.now() }) {
  const permanent = hasPermanentPremium(access)
  const paid = hasPremium(entitlement,now)
  const canManageSubscription = stripeId(billing?.customerId,'cus') && billing.liveMode === liveMode
  return { enabled, premium:permanent || paid, premiumPermanent:permanent,
    premiumUntil:!permanent && paid ? entitlement.premiumUntil : null,
    cancelAtPeriodEnd:!permanent && entitlement?.cancelAtPeriodEnd === true,
    canManageSubscription,
    hasOpenSubscription:canManageSubscription && stripeId(billing?.subscriptionId,'sub') && !['canceled','incomplete_expired'].includes(billing.subscriptionStatus) }
}

export async function resolveSubscriptionPrices(stripe, ids, liveMode) {
  if (!Array.isArray(ids) || ids.length !== 2 || new Set(ids).size !== 2 || ids.some(id => !stripeId(id, 'price'))) {
    throw new AnalysisError('failed-precondition', 'Les deux tarifs doivent être configurés.')
  }
  const found = await Promise.all(ids.map(id => stripe.prices.retrieve(id)))
  const result = {}
  for (const plan of Object.keys(plans)) {
    const matches = found.filter(price => price.unit_amount === plans[plan].amount && price.recurring?.interval === plans[plan].interval)
    if (matches.length !== 1) throw new AnalysisError('failed-precondition', 'Les tarifs mensuel et annuel ne correspondent pas aux offres.')
    validateSubscriptionPrice(matches[0], plan, matches[0].id, liveMode)
    result[plan] = matches[0].id
  }
  return result
}

export async function processSubscriptionEvent({ db, stripe, event, config, now = Date.now() }) {
  // Called only after SDK signature verification of the original HTTP body.
  if (!stripeId(event?.id, 'evt') || event.livemode !== config.liveMode || !Number.isSafeInteger(event.created)) {
    throw new AnalysisError('invalid-argument', 'Notification de paiement invalide.')
  }
  const object = event.data?.object
  let subscriptionId
  if (['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed'].includes(event.type)) {
    subscriptionId = typeof object.subscription === 'string' ? object.subscription : object.subscription?.id
  } else if (['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) {
    subscriptionId = object.id
  } else if (['invoice.paid', 'invoice.payment_failed'].includes(event.type)) {
    const value = object.parent?.subscription_details?.subscription ?? object.subscription
    subscriptionId = typeof value === 'string' ? value : value?.id
  } else return { ignored: true }
  if (!stripeId(subscriptionId, 'sub')) return { ignored: true }
  const eventRef = db.doc(`_stripeEvents/${event.id}`)
  if ((await eventRef.get()).exists) return { duplicate: true }
  // Retrieve current provider state: an old event body must not resurrect a canceled subscription.
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['latest_invoice'] })
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id
  if (!stripeId(customerId, 'cus')) throw new AnalysisError('invalid-argument', 'Client de paiement invalide.')
  const customerRef = db.doc(`_stripeCustomers/${customerId}`)
  const linked = (await customerRef.get()).data()
  if (typeof linked?.uid !== 'string' || !linked.uid || linked.uid.includes('/')) return { ignored: true }
  const previousBilling = (await db.doc(`users/${linked.uid}/billing/stripe`).get()).data()
  let replaceableSubscriptionId
  if (previousBilling?.subscriptionId && previousBilling.subscriptionId !== subscription.id) {
    const previousSubscription = await stripe.subscriptions.retrieve(previousBilling.subscriptionId)
    if (['canceled', 'incomplete_expired'].includes(previousSubscription.status)) replaceableSubscriptionId = previousBilling.subscriptionId
  }
  return db.runTransaction(async transaction => {
    const [processed, customer] = await Promise.all([transaction.get(eventRef), transaction.get(customerRef)])
    if (processed.exists) return { duplicate: true }
    const uid = customer.data()?.uid
    if (typeof uid !== 'string' || !uid || uid.includes('/') || customer.data().liveMode !== config.liveMode) return { ignored: true }
    const billingRef = db.doc(`users/${uid}/billing/stripe`)
    const [marker, billing] = await Promise.all([transaction.get(db.doc(`_accountLifecycle/${uid}`)), transaction.get(billingRef)])
    if (marker.exists) return { ignored: true }
    const state = billing.data()
    if (state?.customerId !== customerId || state.liveMode !== config.liveMode) throw new AnalysisError('failed-precondition', 'Client de paiement incompatible.')
    if (Number.isFinite(state.lastEventCreated) && state.lastEventCreated > event.created) {
      transaction.set(eventRef, { created: event.created, processedAt: now })
      return { outdated: true }
    }
    if (state.subscriptionId && state.subscriptionId !== subscription.id && state.subscriptionId !== replaceableSubscriptionId) throw new AnalysisError('failed-precondition', 'Un autre abonnement est déjà associé à ce compte.')
    // Refresh while holding the billing transaction lock, including events created in the same second.
    const current = await stripe.subscriptions.retrieve(subscriptionId,{ expand:['latest_invoice'] })
    const entitlement = subscriptionEntitlement(current, { ...config, customerId, now })
    transaction.set(db.doc(`users/${uid}/settings/subscription`), entitlement)
    transaction.set(billingRef, { ...state, subscriptionId: subscription.id, subscriptionStatus: current.status, lastEventCreated: event.created })
    transaction.set(eventRef, { created: event.created, processedAt: now })
    return { processed: true }
  })
}

export async function closeAccountBilling({ db, stripe, uid, liveMode }) {
  const ref = db.doc(`users/${uid}/billing/stripe`)
  const state = (await ref.get()).data()
  if (!state?.customerId) return
  if (state.liveMode !== liveMode || !stripeId(state.customerId,'cus')) throw new AnalysisError('failed-precondition','Le mode Stripe doit correspondre à cet abonnement avant suppression.')
  const sessions = await stripe.checkout.sessions.list({customer:state.customerId,status:'open',limit:100})
  const subscriptions = await stripe.subscriptions.list({customer:state.customerId,status:'all',limit:100})
  if (sessions.has_more || subscriptions.has_more) throw new AnalysisError('failed-precondition','La facturation nécessite une vérification avant suppression.')
  for (const session of sessions.data) await stripe.checkout.sessions.expire(session.id)
  for (const subscription of subscriptions.data) if (!['canceled','incomplete_expired'].includes(subscription.status)) await stripe.subscriptions.cancel(subscription.id)
  await db.doc(`_stripeCustomers/${state.customerId}`).delete()
}

export async function createSubscriptionCheckout({ db, stripe, uid, data, config, now = Date.now() }) {
  const { plan } = validateCheckoutRequest(data)
  if (config.enabled !== true || !['classic', 'managed'].includes(config.mode)) throw new AnalysisError('failed-precondition', 'Les abonnements ne sont pas encore ouverts.')
  const priceId = config.prices[plan]
  validateSubscriptionPrice(await stripe.prices.retrieve(priceId), plan, priceId, config.liveMode)
  const stateRef = db.doc(`users/${uid}/billing/stripe`)
  const markerRef = db.doc(`_accountLifecycle/${uid}`)
  const state = await db.runTransaction(async transaction => {
    const [marker, previous] = await Promise.all([transaction.get(markerRef), transaction.get(stateRef)])
    if (marker.exists) throw new AnalysisError('failed-precondition', 'Ce compte est en cours de suppression.')
    return previous.data()
  })
  let customerId = state?.customerId
  if (!customerId) {
    const customer = await stripe.customers.create({ metadata: { memstackUid: uid } }, { idempotencyKey: `memstack-customer-${config.liveMode ? 'live' : 'test'}-${uid}` })
    if (!stripeId(customer.id, 'cus') || customer.livemode !== config.liveMode) throw new AnalysisError('failed-precondition', 'Client de paiement invalide.')
    customerId = customer.id
    await db.runTransaction(async transaction => {
      const [marker, previous] = await Promise.all([transaction.get(markerRef), transaction.get(stateRef)])
      if (marker.exists) throw new AnalysisError('failed-precondition', 'Ce compte est en cours de suppression.')
      if (previous.exists && previous.data().customerId !== customerId) throw new AnalysisError('already-exists', 'Un autre client de paiement est déjà associé.')
      transaction.set(stateRef, { customerId, liveMode: config.liveMode })
      transaction.set(db.doc(`_stripeCustomers/${customerId}`), { uid, liveMode: config.liveMode })
    })
  }
  if (!stripeId(customerId, 'cus') || (state && state.liveMode !== config.liveMode)) throw new AnalysisError('failed-precondition', 'Mode de paiement incompatible.')
  const existing = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 })
  if (existing.has_more || existing.data.some(subscription => !['canceled', 'incomplete_expired'].includes(subscription.status))) {
    throw new AnalysisError('already-exists', 'Un abonnement existe déjà. Utilise sa gestion plutôt que de payer à nouveau.')
  }
  // Reuse one hosted session across tabs; server time, rather than a client ID, bounds provider calls.
  const lease = await db.runTransaction(async transaction => {
    const [marker, previous] = await Promise.all([transaction.get(markerRef), transaction.get(stateRef)])
    if (marker.exists) throw new AnalysisError('failed-precondition', 'Ce compte est en cours de suppression.')
    const state = previous.data()
    if (state?.customerId !== customerId) throw new AnalysisError('failed-precondition', 'Client de paiement incompatible.')
    if (state.checkoutExpiresAt > now) {
      if (state.checkoutPlan !== plan) throw new AnalysisError('already-exists', 'Une page de paiement est déjà ouverte pour une autre offre. Réessaie après son expiration.')
      return { bucket: state.checkoutBucket, expiresAt: state.checkoutExpiresAt }
    }
    const bucket = Math.floor(now / 1800000)
    const expiresAt = (bucket + 2) * 1800000
    transaction.set(stateRef, { ...state, checkoutBucket: bucket, checkoutPlan: plan, checkoutExpiresAt: expiresAt })
    return { bucket, expiresAt }
  })
  const session = await stripe.checkout.sessions.create({ customer: customerId, mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }], client_reference_id: uid,
    subscription_data: { metadata: { memstackUid: uid } }, metadata: { memstackUid: uid },
    success_url: 'https://memstack.fr/#/premium?payment=success', cancel_url: 'https://memstack.fr/#/premium?payment=cancelled',
    expires_at: lease.expiresAt / 1000, locale: 'fr',
    ...(config.mode === 'managed' ? { managed_payments: { enabled: true } } : {})
  }, { idempotencyKey: `memstack-checkout-${customerId}-${lease.bucket}` })
  if (typeof session.url !== 'string' || !session.url.startsWith('https://checkout.stripe.com/')) throw new AnalysisError('unavailable', 'La page de paiement est indisponible.')
  return { url: session.url }
}
