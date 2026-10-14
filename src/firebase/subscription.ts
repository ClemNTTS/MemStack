import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseServices } from './client'
import { doc, getDocFromServer } from 'firebase/firestore'

export type SubscriptionStatus = { enabled: boolean, premium: boolean, premiumUntil: string | null, cancelAtPeriodEnd: boolean, premiumPermanent?: boolean, canManageSubscription?: boolean, hasOpenSubscription?: boolean }
export async function readSubscriptionStatus(): Promise<SubscriptionStatus> {
  if (import.meta.env.VITE_SUBSCRIPTIONS_ENABLED !== 'true') {
    const { auth, db } = getFirebaseServices()
    if (!auth.currentUser) throw new Error('Connexion requise.')
    const uid = auth.currentUser.uid
    const access = (await getDocFromServer(doc(db, 'users', uid, 'settings', 'premiumAccess'))).data()
    if (auth.currentUser?.uid !== uid) throw new Error('Compte modifié.')
    const permanent = access?.version === 1 && access.permanent === true
    return { enabled: false, premium: permanent, premiumPermanent: permanent, premiumUntil: null, cancelAtPeriodEnd: false }
  }
  const functions = getFunctions(getFirebaseServices().auth.app, 'europe-west9')
  const response = await httpsCallable<Record<string, never>, SubscriptionStatus>(functions, 'getSubscriptionStatus')({})
  const value = response.data
  if (!value || typeof value.enabled !== 'boolean' || typeof value.premium !== 'boolean'
    || typeof value.cancelAtPeriodEnd !== 'boolean'
    || (value.canManageSubscription !== undefined && typeof value.canManageSubscription !== 'boolean')
    || (value.hasOpenSubscription !== undefined && typeof value.hasOpenSubscription !== 'boolean')
    || (value.premium && value.premiumUntil === null && value.premiumPermanent !== true)
    || (value.premiumUntil !== null && (typeof value.premiumUntil !== 'string' || !Number.isFinite(Date.parse(value.premiumUntil))))) throw new Error('État d’abonnement invalide.')
  return value
}
export async function subscriptionRedirect(plan?: 'monthly' | 'annual') {
  if (import.meta.env.VITE_SUBSCRIPTIONS_ENABLED !== 'true') throw new Error('Les abonnements ne sont pas encore ouverts.')
  const functions = getFunctions(getFirebaseServices().auth.app, 'europe-west9')
  const response = await httpsCallable<unknown, { url: string }>(functions, plan ? 'createPremiumCheckout' : 'createPremiumPortal')(plan ? { plan, requestId: crypto.randomUUID() } : {})
  const url = new URL(response.data.url)
  if (url.protocol !== 'https:' || !(plan ? ['checkout.stripe.com'] : ['billing.stripe.com']).includes(url.hostname)) throw new Error('Page de paiement invalide.')
  return url.href
}
