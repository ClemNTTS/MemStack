import type { ReactNode } from 'react'
import { useProgress } from '../progress/ProgressProvider'
import { useSubscription } from '../progress/subscription'
import PremiumReminder from '../components/PremiumReminder'
import { appHref } from '../navigation/browser'

export function ChallengeAccessGate({ children }: { children: ReactNode }) {
  const account = useProgress()
  const { status, loading, error, refresh } = useSubscription()
  if (account.user && account.ready && account.online) {
    if (loading) return <main className="dashboard"><p role="status">Vérification de ton accès aux défis…</p></main>
    if (status?.premium) return children
    return <main className="dashboard"><PremiumReminder reason="challenges" />{error && <p role="status">{error} <button className="catalog-button secondary" onClick={refresh}>Réessayer</button></p>}<a className="text-link" href={appHref('/courses')}>Continuer mes leçons →</a></main>
  }
  return <main className="dashboard"><h1>Connexion requise</h1><p>Connecte-toi à ton compte et retrouve Internet pour accéder aux défis.</p></main>
}
