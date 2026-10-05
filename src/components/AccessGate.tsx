import { useState } from 'react'
import { useProgress } from '../progress/ProgressProvider'
import Memo from './Memo'

function AccessGate() {
  const account = useProgress()
  const [busy, setBusy] = useState(false)
  async function login() {
    setBusy(true)
    try { await account.login() }
    finally { setBusy(false) }
  }
  const title = !account.online ? 'On reprend une fois en ligne.'
    : !account.authResolved ? 'Ouverture de ton atelier…'
    : !account.user ? 'Ton atelier t’attend.'
    : account.error ? 'La progression est indisponible.' : 'On retrouve ta progression…'

  return <main className="app-shell access-gate">
    <p className="lesson-category">MemStack / Ton atelier personnel</p>
    <Memo expression={account.online ? 'recalled' : 'unsure'} />
    <h1>{title}</h1>
    <p>{!account.online ? 'Une connexion Internet est nécessaire pour apprendre et réviser. La reprise sera automatique au retour du réseau.'
      : !account.user ? 'Connecte-toi avec Google pour accéder à tes leçons et retrouver ta progression.'
      : 'Les leçons seront disponibles une fois la synchronisation terminée.'}</p>
    {account.authResolved && !account.user && account.online && <button className="lesson-choice" disabled={busy} onClick={login}>{busy ? 'Connexion…' : 'Se connecter avec Google'}</button>}
    {!account.user && account.error && <p role="alert">{account.error}</p>}
  </main>
}

export default AccessGate
