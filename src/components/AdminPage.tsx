import { useEffect, useState } from 'react'
import { readAdminStatus } from '../firebase/admin'
import { useProgress } from '../progress/ProgressProvider'
import { appHref } from '../navigation/browser'
import EnterpriseAdminPanel from '../enterprise/EnterpriseAdminPanel'

export default function AdminPage() {
  const { user, online } = useProgress()
  const [adminUid,setAdminUid] = useState('')
  const [message,setMessage] = useState('Vérification administrateur…')
  const [revision,setRevision] = useState(0)
  useEffect(()=>{
    let active = true
    setAdminUid('');setMessage('Vérification administrateur…')
    if (!user || !online) return
    readAdminStatus(user.uid).then(value=>{if(active){setAdminUid(value.admin?user.uid:'');setMessage(value.admin?'':'Accès administrateur requis.')}})
      .catch(()=>{if(active)setMessage('La vérification administrateur a échoué.')})
    return ()=>{active=false}
  },[user?.uid,online,revision])
  const allowed = Boolean(user && online && adminUid===user.uid)
  return <main className="dashboard"><header className="catalog-heading"><p className="lesson-category">Espace administrateur</p><h1>Administration</h1><p>Les comptes et les abonnements, au bon endroit.</p></header>
    {message && <p role="status">{message}</p>}
    {!allowed && <button className="catalog-button secondary" disabled={!online} onClick={()=>setRevision(value=>value+1)}>Vérifier mon accès</button>}
    {allowed && <><section className="overview-panel"><h2>Les défis suivent désormais le Premium.</h2><p>Les anciennes invitations à l’analyse IA ne sont plus utilisées. L’accès aux défis dépend de l’abonnement ou d’un accès Premium permanent.</p></section><div className="dashboard-columns" style={{marginTop:'1.5rem'}}>
      <section className="overview-panel"><p className="lesson-category">Comptes</p><h2>Retrouver un membre</h2><p>Consulte les comptes Google et email, leur état et leurs méthodes de connexion dans Firebase.</p><a className="catalog-button secondary" href="https://console.firebase.google.com/project/memstack-9f581/authentication/users" target="_blank" rel="noopener noreferrer">Ouvrir les comptes Firebase ↗</a></section>
      <section className="overview-panel"><p className="lesson-category">Abonnements</p><h2>Suivre les paiements</h2><p>Consulte les abonnements, les factures et les résiliations dans Stripe.</p><a className="catalog-button secondary" href="https://dashboard.stripe.com/acct_1UQSaJLmonrrwnNT/subscriptions" target="_blank" rel="noopener noreferrer">Ouvrir Stripe ↗</a></section>
    </div><p className="dashboard-note">Ces consoles demandent leurs propres droits d’administration.</p><EnterpriseAdminPanel key={user?.uid} /></>}
    <p><a className="text-link" href={appHref('/')}>Retour à mon atelier →</a></p>
  </main>
}
