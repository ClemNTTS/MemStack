import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useProgress } from './ProgressProvider'
import { readSubscriptionStatus, subscriptionRedirect } from '../firebase/subscription'
import type { SubscriptionStatus } from '../firebase/subscription'
import { getFirebaseServices } from '../firebase/client'

type SubscriptionContextValue = { status: SubscriptionStatus | null, loading: boolean, error: string, refresh: () => void,
  busy: boolean, openCheckout: (plan: 'monthly' | 'annual') => Promise<void>, openPortal: () => Promise<void> }
export const SubscriptionContext = createContext<SubscriptionContextValue | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const account = useProgress()
  const [state, setState] = useState<{ uid: string, value: SubscriptionStatus } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [revision, setRevision] = useState(0)
  const [clock, setClock] = useState(0)
  const inFlight = useRef(false)
  useEffect(() => {
    let cancelled = false
    setError('')
    if (!account.user || !account.online || !account.ready) { setLoading(false); return }
    const uid = account.user.uid
    setLoading(true)
    void readSubscriptionStatus().then(value => {
      if (!cancelled && getFirebaseServices().auth.currentUser?.uid === uid) setState({ uid, value })
    }).catch(() => { if (!cancelled) { setState(null); setError('Ton abonnement est momentanément indisponible. Réessaie pour vérifier tes droits.') } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [account.user?.uid, account.online, account.ready, revision])
  const value = state?.uid === account.user?.uid ? state?.value : null
  useEffect(() => {
    if (!value?.premiumUntil || !value.premium) return
    const delay = Date.parse(value.premiumUntil) - Date.now()
    if (!Number.isFinite(delay) || delay <= 0) return
    const timer = setTimeout(() => setClock(value => value + 1), Math.min(delay + 50, 2147483647))
    return () => clearTimeout(timer)
  }, [value?.premiumUntil, value?.premium, clock])
  const status = value && value.premium && !value.premiumPermanent && (!value.premiumUntil || Date.parse(value.premiumUntil) <= Date.now()) ? { ...value, premium: false } : value
  async function redirect(plan?: 'monthly' | 'annual') {
    if (inFlight.current || !account.user || !account.online || !status?.enabled) return
    const uid = account.user.uid
    inFlight.current = true
    setBusy(true)
    setError('')
    try {
      const url = await subscriptionRedirect(plan)
      if (getFirebaseServices().auth.currentUser?.uid === uid) window.location.assign(url)
    } catch { if (getFirebaseServices().auth.currentUser?.uid === uid) setError('Stripe n’a pas pu être ouvert. Réessaie ou vérifie ton abonnement ; aucun nouveau paiement n’est confirmé ici.') }
    finally { inFlight.current = false; setBusy(false) }
  }
  return <SubscriptionContext.Provider value={{ status: status ?? null, loading, error, busy,
    refresh: () => setRevision(value => value + 1), openCheckout: plan => redirect(plan), openPortal: () => redirect() }}>{children}</SubscriptionContext.Provider>
}

export function useSubscription() {
  const value = useContext(SubscriptionContext)
  if (!value) throw new Error('SubscriptionProvider manquant')
  return value
}
