import { useEffect, useRef, useState } from 'react'
import { readAiAccessStatus, updateAiMember } from '../firebase/aiAccess'
import { useProgress } from '../progress/ProgressProvider'

export default function AdminAiPage() {
  const { user, online } = useProgress()
  const [adminUid, setAdminUid] = useState('')
  const [email, setEmail] = useState('')
  const [aiEnabled, setAiEnabled] = useState(false)
  const [betaInvited, setBetaInvited] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('Vérification administrateur…')
  const currentUid = useRef(user?.uid)
  currentUid.current = user?.uid
  useEffect(() => {
    let active = true
    setAdminUid('')
    setEmail('')
    setAiEnabled(false)
    setBetaInvited(false)
    setBusy(false)
    if (!user || !online) return
    readAiAccessStatus(user.uid).then(value => { if (active) { setAdminUid(value.admin ? user.uid : ''); setMessage(value.admin ? '' : 'Accès administrateur requis.') } }).catch(() => { if (active) setMessage('La vérification administrateur a échoué.') })
    return () => { active = false }
  }, [user?.uid, online])
  const allowed = Boolean(user && online && adminUid === user.uid)
  async function save() {
    if (!allowed || !user || busy) return
    const uid = user.uid
    setBusy(true)
    setMessage('Enregistrement…')
    try {
      await updateAiMember(uid, email.trim(), aiEnabled, betaInvited)
      if (currentUid.current === uid) setMessage('Droits enregistrés par le serveur et action journalisée.')
    } catch { if (currentUid.current === uid) setMessage('Enregistrement refusé ou indisponible. Aucun succès confirmé ; vérifie le compte et réessaie.') }
    finally { if (currentUid.current === uid) setBusy(false) }
  }
  return <main className="dashboard"><h1>Gestion des membres IA</h1><p role="status">{message}</p>
    {allowed && <form className="overview-panel" onSubmit={event => { event.preventDefault(); void save() }}>
      <p>Recherche exacte d’un compte Google existant. Les quotas restent inchangés. Les droits choisis remplacent les droits de ce compte.</p>
      <label>Adresse du membre<input type="email" required value={email} onChange={event => setEmail(event.target.value)} disabled={busy} /></label>
      <label><input type="checkbox" checked={aiEnabled} onChange={event => setAiEnabled(event.target.checked)} disabled={busy} /> Accès à l’option IA</label>
      <label><input type="checkbox" checked={betaInvited} onChange={event => setBetaInvited(event.target.checked)} disabled={busy} /> Invitation aux nouvelles analyses de la bêta</label>
      <button className="catalog-button" type="submit" disabled={busy}>Enregistrer ces droits</button>
    </form>}
  </main>
}
