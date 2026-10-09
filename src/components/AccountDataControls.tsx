import { useEffect, useRef, useState } from 'react'
import { useProgress } from '../progress/ProgressProvider'
import { deleteOwnAccount, exportOwnAccount } from '../firebase/accountLifecycle'

function localAccountData(uid: string) {
  const data: Record<string, string> = {}
  const draftPrefix = `memstack.challengeDraft.v1:${encodeURIComponent(uid)}:`
  const lessonDraftPrefix = `memstack.lesson-draft.v1.${uid}.`
  const keys = [`memstack.account.v1.${uid}`, `memstack.learning-preference.v1.${uid}`, `memstack.learning-goal.v1.${uid}`]
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index)!
    if (keys.includes(key) || key.startsWith(draftPrefix) || key.startsWith(lessonDraftPrefix)) data[key] = localStorage.getItem(key)!
  }
  return data
}

export default function AccountDataControls() {
  const { user, online } = useProgress()
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const currentUid = useRef(user?.uid)
  currentUid.current = user?.uid
  useEffect(() => { setConfirmation(''); setMessage(''); setError(''); setBusy('') }, [user?.uid])
  async function exportData() {
    if (!user || busy || !online) return
    const uid = user.uid
    setBusy('export'); setError(''); setMessage('')
    try {
      const server = await exportOwnAccount(uid)
      if (currentUid.current !== uid) return
      const output = { server, localDeviceData: localAccountData(uid) }
      const url = URL.createObjectURL(new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url; link.download = `memstack-export-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setMessage('Ton export complet du serveur et de cet appareil est téléchargé.')
    } catch { if (currentUid.current === uid) setError('L’export n’a pas abouti. Réessaie ou contacte l’administrateur.') }
    finally { if (currentUid.current === uid) setBusy('') }
  }
  async function deleteData() {
    if (!user || busy || !online || confirmation !== 'SUPPRIMER') return
    const uid = user.uid
    setBusy('delete'); setError(''); setMessage('')
    try {
      await deleteOwnAccount(uid)
      for (const key of Object.keys(localAccountData(uid))) localStorage.removeItem(key)
    } catch { if (currentUid.current === uid) setError('La suppression n’est pas confirmée. Si elle a commencé, l’accès reste bloqué ; reconnecte-toi puis réessaie ou contacte l’administrateur.') }
    finally { if (currentUid.current === uid) setBusy('') }
  }
  return <section className="overview-panel" aria-labelledby="account-data-title">
    <h2 id="account-data-title">Tes données et ton compte</h2>
    <p>Télécharge ta progression, tes préférences, tes tentatives, les analyses IA, les signalements et les brouillons de cet appareil. Les brouillons d’autres appareils restent sur ces appareils.</p>
    <button className="catalog-button secondary" type="button" disabled={Boolean(busy) || !online} onClick={() => { void exportData() }}>{busy === 'export' ? 'Export en cours…' : 'Exporter mes données'}</button>
    <details><summary>Supprimer mon compte</summary>
      <p>Cette suppression est définitive : progression, préférences, tentatives, analyses et signalements seront effacés, ainsi que ton compte MemStack. Ton compte Google reste intact. Exporte tes données avant de continuer.</p>
      <p className="dashboard-note">Un marqueur technique de suppression et des compteurs globaux sans identité sont conservés pour empêcher les écritures tardives et préserver les limites du service. Les journaux d’accès sont anonymisés pour ce compte.</p>
      <label htmlFor="delete-account-confirmation">Écris SUPPRIMER pour confirmer</label>
      <input id="delete-account-confirmation" value={confirmation} disabled={Boolean(busy)} onChange={event => setConfirmation(event.target.value)} autoComplete="off" />
      <p>Tu devras confirmer ton identité avec Google. Ne ferme pas la page pendant la suppression.</p>
      <button className="catalog-button secondary" type="button" disabled={confirmation !== 'SUPPRIMER' || Boolean(busy) || !online} onClick={() => { void deleteData() }}>{busy === 'delete' ? 'Suppression en cours…' : 'Confirmer la suppression définitive'}</button>
    </details>
    {message && <p role="status">{message}</p>}{error && <p className="inline-error" role="alert">{error}</p>}
  </section>
}
