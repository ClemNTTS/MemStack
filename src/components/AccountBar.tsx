import { appHref } from '../navigation/browser'
import { useEffect, useRef, useState } from 'react'
import { BookOpen, UserRound, Crown, Flag, LogOut, ChevronDown, ShieldCheck } from 'lucide-react'
import { useProgress } from '../progress/ProgressProvider'
import { useSubscription } from '../progress/subscription'
import { readAdminStatus } from '../firebase/admin'
import './lesson-enhancements.css'

function AccountBar() {
  const account = useProgress()
  const subscription = useSubscription()
  const [busy, setBusy] = useState(false)
  const [adminUid, setAdminUid] = useState('')
  const menuRef = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    let active = true
    setAdminUid('')
    if (account.user && account.ready && account.online) {
      const uid = account.user.uid
      readAdminStatus(uid).then(value => { if (active && value.admin) setAdminUid(uid) }).catch(() => {})
    }
    return () => { active = false }
  }, [account.user?.uid, account.ready, account.online])
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) menuRef.current?.removeAttribute('open')
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !menuRef.current?.open) return
      menuRef.current.removeAttribute('open')
      menuRef.current.querySelector('summary')?.focus()
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])
  async function disconnect() {
    setBusy(true)
    try { await account.logout() }
    finally { setBusy(false) }
  }
  const close = () => menuRef.current?.removeAttribute('open')
  const name = account.user?.displayName || 'Mon compte'
  return <aside className="account-bar" aria-label="Compte et synchronisation">
    <details className="account-menu" ref={menuRef}>
      <summary aria-label="Ouvrir le menu du compte"><span className="account-avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span><span>Compte</span><ChevronDown size={14} aria-hidden="true" />{account.error && <span className="account-menu-notice" aria-label="Synchronisation à vérifier">●</span>}</summary>
      <div className="account-menu-panel">
        <div className="account-menu-identity"><span className="account-avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span><div><strong>{name}</strong><span className="account-plan">{subscription.loading ? 'Abonnement en cours de vérification…' : subscription.status?.premium ? 'Membre Premium' : subscription.status ? 'Formule gratuite' : 'Abonnement à vérifier'}</span></div></div>
        <nav className="account-menu-links" aria-label="Mon compte">
          <a href={appHref('/discover')} onClick={close}><BookOpen size={18} aria-hidden="true" /><span>Découvrir MemStack<small>La méthode et les formules</small></span></a>
          <a href={appHref('/profile')} onClick={close}><UserRound size={18} aria-hidden="true" /><span>Mon compte et ma progression</span></a>
          <a href={appHref('/premium')} onClick={close}><Crown size={18} aria-hidden="true" /><span>{subscription.status?.premium ? 'Mon abonnement Premium' : 'Découvrir Premium'}<small>{subscription.status?.premium ? 'Gérer ma formule' : 'Défis et apprentissage illimité'}</small></span></a>
          {account.ready && <a href={appHref('/reports')} onClick={close}><Flag size={18} aria-hidden="true" /><span>Mes signalements</span></a>}
          {adminUid === account.user?.uid && <a href={appHref('/admin')} onClick={close}><ShieldCheck size={18} aria-hidden="true" /><span>Administration</span></a>}
        </nav>
        <div className="account-menu-sync"><p role="status"><span aria-hidden="true">{account.error ? '○' : '●'}</span> {account.status}</p>
          {account.error && <div className="account-error"><p role="alert">{account.error}</p><button className="sound-toggle" type="button" disabled={!account.online} onClick={account.retry}>Réessayer</button></div>}
          {account.user && account.ready && <details className="account-import"><summary>Importer une progression locale</summary><p>Ajouter à ce compte les leçons et cartes enregistrées dans ce navigateur. La copie locale sera conservée.</p><button className="lesson-choice" type="button" onClick={account.importLocal}>Importer dans ce compte</button></details>}
        </div>
        <button className="account-logout" type="button" disabled={busy} onClick={disconnect}><LogOut size={16} aria-hidden="true" />{busy ? 'Déconnexion…' : 'Se déconnecter'}</button>
      </div>
    </details>
  </aside>
}

export default AccountBar
