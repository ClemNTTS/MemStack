import { useState } from 'react'
import { useProgress } from '../progress/ProgressProvider'
import Memo from './Memo'
import EmailAuthForm from './EmailAuthForm'
import EmailVerification from './EmailVerification'

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
    : !account.user.emailVerified ? 'Une dernière étape pour ton compte.' : account.error ? 'La progression est indisponible.' : 'On retrouve ta progression…'

  return <main className="app-shell access-gate">
    <p className="lesson-category">MemStack / Ton atelier personnel</p>
    <Memo expression={account.online ? 'recalled' : 'unsure'} />
    <h1>{title}</h1>
    <p>{!account.online ? 'Une connexion Internet est nécessaire pour apprendre et réviser. La reprise sera automatique au retour du réseau.'
      : !account.user ? 'Connecte-toi ou crée ton compte pour accéder aux leçons et retrouver ta progression.'
      : !account.user.emailVerified ? 'Confirme ton adresse email pour accéder à tes leçons.' : 'Les leçons seront disponibles une fois la synchronisation terminée.'}</p>
    {account.authResolved && !account.user && account.online && <EmailAuthForm googleBusy={busy} onGoogleLogin={login} />}
    {account.user && !account.user.emailVerified && account.online && <EmailVerification />}
    {!account.user && account.error && <p role="alert">{account.error}</p>}
  </main>
}

export default AccessGate
