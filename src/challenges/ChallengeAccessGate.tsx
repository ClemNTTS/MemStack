import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { readChallengeAccess } from '../firebase/challengeAccess'
import { useProgress } from '../progress/ProgressProvider'
import { appHref } from '../navigation/browser'

export function ChallengeAccessGate({ children }: { children: ReactNode }) {
  const account = useProgress()
  const [access, setAccess] = useState<'loading' | 'allowed' | 'denied' | 'error'>('loading')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    setAccess('loading')
    if (!account.user || !account.ready || !account.online) return
    readChallengeAccess(account.user.uid).then(allowed => {
      if (active) setAccess(allowed ? 'allowed' : 'denied')
    }).catch(() => { if (active) setAccess('error') })
    return () => { active = false }
  }, [account.user?.uid, account.ready, account.online, account.revision, retry])
  if (access === 'allowed' && account.ready && account.online) return children
  return <main className="dashboard">
    <p className="lesson-category">Défis · option IA</p>
    <h1>{access === 'denied' ? 'L’accès à l’option IA est requis.' : access === 'error' ? 'L’accès n’a pas pu être vérifié.' : 'Vérification de ton accès…'}</h1>
    <p>{access === 'denied' ? 'Les défis sont réservés aux membres disposant de l’accès à l’option IA.' : access === 'error' ? 'La vérification de ton droit IA a échoué. Si le problème persiste, contacte l’administrateur.' : 'Une connexion est nécessaire pour vérifier ton accès aux défis.'}</p>
    <div className="panel-actions">
      {access === 'error' && <button className="catalog-button secondary" type="button" onClick={() => setRetry(value => value + 1)}>Réessayer</button>}
      <a className="dashboard-cta" href={appHref('/courses')}>Voir les parcours</a>
    </div>
  </main>
}
