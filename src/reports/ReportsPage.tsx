import { useEffect, useState } from 'react'
import { readContentReports } from '../firebase/contentReports'
import { useProgress } from '../progress/ProgressProvider'
import { appHref } from '../navigation/browser'
import { reportStatuses } from './reportStatus'
import type { ReportRecord } from './reportStatus'

export default function ReportsPage() {
  const { user, online } = useProgress()
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<{ uid: string, reports?: ReportRecord[], error?: boolean }>({ uid: '' })
  useEffect(() => {
    if (!user || !online) return
    const uid = user.uid
    let active = true
    setState({ uid })
    readContentReports(uid).then(reports => { if (active) setState({ uid, reports }) })
      .catch(() => { if (active) setState({ uid, error: true }) })
    return () => { active = false }
  }, [user?.uid, online, revision])
  const current = state.uid === user?.uid && online ? state : undefined
  return <main className="catalog-page">
    <h1>Mes signalements</h1>
    <p>Retrouve la réception, la revue et les propositions de correction. Les états sont actualisés par le suivi planifié ; une proposition fusionnée attend la confirmation du déploiement.</p>
    <button type="button" className="catalog-button secondary" disabled={!online || !user} onClick={() => setRevision(value => value + 1)}>Actualiser</button>
    {!online && <p role="alert">Connexion Internet requise.</p>}
    {online && !current?.reports && !current?.error && <p role="status">Chargement des signalements…</p>}
    {current?.error && <p role="alert">Les signalements n’ont pas pu être chargés. Réessaie.</p>}
    {current?.reports?.length === 0 && <p>Aucun signalement enregistré.</p>}
    {current?.reports?.map(report => <article className="panel" key={report.id}>
      <h2>{report.targetType === 'analysis' ? 'Retour IA' : report.targetType === 'challenge' ? 'Défi' : report.cardId ? 'Carte' : 'Leçon'} · {report.challengeId || report.cardId || report.lessonId}</h2>
      <p><strong>{reportStatuses[report.status][0]}</strong> · {new Date(report.createdAt).toLocaleDateString('fr-FR')}</p>
      <p>{reportStatuses[report.status][1]}</p><p>{report.comment}</p>
      {report.challengeVersion && <p>Défi v{report.challengeVersion} · grille v{report.rubricVersion}{report.promptVersion ? ` · ${report.promptVersion} · ${report.model}` : ''}</p>}
      <details><summary>Version signalée</summary><p style={{ overflowWrap: 'anywhere' }}>{report.contentVersion}</p></details>
      {report.prUrl && <p><a className="text-link" href={report.prUrl} target="_blank" rel="noopener noreferrer">Consulter la proposition sur GitHub</a></p>}
      {report.status === 'published' && report.deploymentSha && <p>Version publiée : <a className="text-link" href={`https://github.com/ClemNTTS/MemStack/blob/${report.deploymentSha}/src/data/catalog/corrections.json`} target="_blank" rel="noopener noreferrer">{report.deploymentSha.slice(0, 12)}</a>{report.deploymentUrl && <> · <a className="text-link" href={report.deploymentUrl} target="_blank" rel="noopener noreferrer">Déploiement vérifié</a></>}</p>}
      <p><a className="text-link" href={appHref(report.challengeId ? `/challenges/${report.challengeId}` : `/lessons/${report.lessonId}`)}>Consulter le contenu actuel</a></p>
    </article>)}
  </main>
}
