import { useState } from 'react'
import { useProgress } from '../progress/ProgressProvider'

function AccountBar() {
  const account = useProgress()
  const [busy, setBusy] = useState(false)
  async function authenticate() {
    setBusy(true)
    try { await (account.user ? account.logout() : account.login()) }
    finally { setBusy(false) }
  }
  return <aside className="account-bar" aria-label="Compte et synchronisation">
    <div><strong>{account.user ? account.user.displayName || 'Mon compte' : 'Ton atelier personnel'}</strong><p role="status">{account.status}</p></div>
    <button className="sound-toggle" disabled={busy} onClick={authenticate}>{busy ? 'Connexion…' : account.user ? 'Se déconnecter' : 'Se connecter avec Google'}</button>
    {account.user && account.ready && <details><summary>Importer ma progression locale</summary><p>Fusionner les leçons et cartes apprises sans compte dans ce navigateur avec ce compte Google. La copie locale sera conservée.</p><button className="lesson-choice" onClick={account.importLocal}>Importer dans ce compte</button></details>}
    {account.error && <div className="account-error"><p role="alert">{account.error}</p><button className="sound-toggle" onClick={account.retry}>Réessayer</button></div>}
    {!account.ready && !account.user && account.error && <button className="sound-toggle" onClick={account.resetGuest}>Réinitialiser la progression locale</button>}
  </aside>
}

export default AccountBar
