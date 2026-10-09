import { useEffect, useState } from 'react'
import { readAiAccessStatus } from '../firebase/aiAccess'
import type { AiAccessStatus } from '../firebase/aiAccess'
import { useProgress } from '../progress/ProgressProvider'
import { appHref } from '../navigation/browser'

export default function AiAccessPanel() {
  const { user, online } = useProgress()
  const [state, setState] = useState<{ uid: string, value?: AiAccessStatus, error?: boolean } | null>(null)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let active = true
    setState(null)
    if (!user || !online) return
    const uid = user.uid
    readAiAccessStatus(uid).then(value => { if (active) setState({ uid, value }) }).catch(() => { if (active) setState({ uid, error: true }) })
    return () => { active = false }
  }, [user?.uid, online, revision])
  const value = state?.uid === user?.uid ? state?.value : undefined
  return <section className="overview-panel" aria-labelledby="ai-access-title">
    <h2 id="ai-access-title">Ton option IA</h2>
    {state?.error ? <p role="alert">L’état serveur est indisponible. Aucun quota estimé n’est affiché.</p> : !value ? <p role="status">Vérification de ton accès et du quota…</p> : <>
      <p>{value.aiEnabled ? 'Accès IA activé.' : 'Accès IA non activé.'} {value.invited ? 'Compte invité à la bêta.' : 'Ce compte n’est pas invité aux nouvelles analyses.'}</p>
      <p>{value.remaining} / {value.dailyLimit} analyses disponibles aujourd’hui. Réinitialisation : {new Date(value.resetsAt).toLocaleString('fr-FR')}.</p>
      {!value.serviceEnabled && <p>Les nouvelles analyses sont suspendues sur le serveur.</p>}
      {!value.globalAvailable && <p>La capacité quotidienne du service est atteinte.</p>}
      <p className="dashboard-note">Quota de protection, sans crédit payé. Une réservation reste consommée même si l’analyse échoue. L’envoi vérifie à nouveau les droits et limites sur le serveur.</p>
      {value.admin && <a href={appHref('/admin/ai')} className="text-link">Gérer les membres IA →</a>}
    </>}
    <button className="catalog-button secondary" type="button" onClick={() => setRevision(value => value + 1)}>Actualiser l’accès et le quota</button>
  </section>
}
