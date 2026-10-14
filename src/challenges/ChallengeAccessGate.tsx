import type { ReactNode } from 'react'
import { useProgress } from '../progress/ProgressProvider'

export function ChallengeAccessGate({ children }: { children: ReactNode }) {
  const account = useProgress()
  if (account.user && account.ready && account.online) return children
  return <main className="dashboard"><h1>Connexion requise</h1><p>Connecte-toi avec Google et retrouve Internet pour accéder aux défis.</p></main>
}
