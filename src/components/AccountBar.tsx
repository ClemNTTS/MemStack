import { useRef, useState } from 'react'
import { useProgress } from '../progress/ProgressProvider'
import './lesson-enhancements.css'

function AccountBar() {
  const account = useProgress()
  const [busy, setBusy] = useState(false)
  const menuRef = useRef<HTMLDetailsElement>(null)
  async function disconnect() {
    setBusy(true)
    try { await account.logout() }
    finally { setBusy(false) }
  }
  return <aside className="account-bar" aria-label="Compte et synchronisation">
    <details className="account-menu" ref={menuRef}>
      <summary>Compte{account.error && <span className="account-menu-notice"> · À vérifier</span>}</summary>
      <div className="account-menu-panel">
        <strong>{account.user?.displayName || 'Mon compte'}</strong>
        <p role="status">{account.status}</p>
        <a className="account-profile-link" href="/profile" onClick={() => menuRef.current?.removeAttribute('open')}>Voir mon profil</a>
        {account.error && <div className="account-error"><p role="alert">{account.error}</p><button className="sound-toggle" type="button" disabled={!account.online} onClick={account.retry}>Réessayer</button></div>}
        {account.user && account.ready && <details className="account-import"><summary>Importer ma progression locale</summary><p>Fusionner les leçons et cartes apprises sans compte dans ce navigateur avec ce compte Google. La copie locale sera conservée.</p><button className="lesson-choice" type="button" onClick={account.importLocal}>Importer dans ce compte</button></details>}
        <button className="sound-toggle" type="button" disabled={busy} onClick={disconnect}>{busy ? 'Déconnexion…' : 'Se déconnecter'}</button>
      </div>
    </details>
  </aside>
}

export default AccountBar
