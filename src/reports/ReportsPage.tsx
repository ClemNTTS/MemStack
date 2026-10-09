import { useEffect, useRef, useState } from 'react'
import { readContentReports } from '../firebase/contentReports'
import type { ReportCursor } from '../firebase/contentReports'
import { useProgress } from '../progress/ProgressProvider'
import { appHref } from '../navigation/browser'
import { reportStatuses } from './reportStatus'
import type { ReportRecord } from './reportStatus'
import { catalogLessons, catalogCards } from '../data/catalog'
import { challenges } from '../data/challenges'
import { PageHeading } from '../components/CatalogShared'

export default function ReportsPage() {
  const { user, online } = useProgress()
  const [revision, setRevision] = useState(0)
  const generation = useRef(0)
  const loadingMore = useRef(false)
  const [state, setState] = useState<{ uid: string, reports?: ReportRecord[], error?: boolean, cursor?: ReportCursor, hasMore?: boolean, loadingMore?: boolean, moreError?: boolean }>({ uid: '' })
  useEffect(() => {
    if (!user || !online) return
    const uid = user.uid
    const operation = ++generation.current
    loadingMore.current = false
    let active = true
    setState({ uid })
    readContentReports(uid).then(page => { if (active && generation.current === operation) setState({ uid, ...page }) })
      .catch(() => { if (active) setState({ uid, error: true }) })
    return () => { active = false; generation.current++ }
  }, [user?.uid, online, revision])
  const current = state.uid === user?.uid && online ? state : undefined
  async function loadMore() {
    if (!user || !online || !current?.hasMore || !current.cursor || loadingMore.current) return
    const uid = user.uid
    const operation = generation.current
    loadingMore.current = true
    setState(previous => ({ ...previous, loadingMore: true, moreError: false }))
    try {
      const page = await readContentReports(uid, current.cursor)
      if (operation !== generation.current) return
      setState(previous => ({ uid, ...page, reports: [...(previous.reports ?? []), ...page.reports.filter(report => !previous.reports?.some(existing => existing.id === report.id))] }))
    } catch {
      if (operation === generation.current) setState(previous => ({ ...previous, loadingMore: false, moreError: true }))
    } finally {
      if (operation === generation.current) loadingMore.current = false
    }
  }
  return <main className="dashboard reports-page">
    <PageHeading eyebrow="Améliorer ensemble" title="Mes signalements" description="Retrouve la réception, la revue et les propositions de correction. Une correction intégrée attend la confirmation de sa publication sur le site." />
    <button type="button" className="catalog-button secondary" disabled={!online || !user} onClick={() => setRevision(value => value + 1)}>Actualiser</button>
    {!online && <p role="alert">Connexion Internet requise.</p>}
    {online && !current?.reports && !current?.error && <p role="status">Chargement des signalements…</p>}
    {current?.error && <p role="alert">Les signalements n’ont pas pu être chargés. Réessaie.</p>}
    {current?.reports?.length === 0 && <p>Aucun signalement enregistré.</p>}
    <div className="reports-list">{current?.reports?.map(report => <article className="overview-panel" key={report.id}>
      <p className="lesson-category">{report.targetType === 'analysis' ? 'Retour IA' : report.targetType === 'challenge' ? 'Défi' : report.cardId ? 'Carte' : 'Leçon'}</p>
      <h2>{report.challengeId ? challenges.find(challenge => challenge.id === report.challengeId)?.title ?? 'Défi archivé' : report.cardId ? catalogCards.find(card => card.id === report.cardId)?.question ?? 'Carte archivée' : catalogLessons.find(lesson => lesson.id === report.lessonId)?.title ?? 'Leçon archivée'}</h2>
      <p><strong>{reportStatuses[report.status][0]}</strong> · {new Date(report.createdAt).toLocaleDateString('fr-FR')}</p>
      <p>{reportStatuses[report.status][1]}</p><p>{report.comment}</p>
      <details><summary>Détails de la version signalée</summary>
        <p>Référence : {report.challengeId || report.cardId || report.lessonId}</p>
        {report.challengeVersion && <p>Défi v{report.challengeVersion} · grille v{report.rubricVersion}{report.promptVersion ? ` · ${report.promptVersion} · ${report.model}` : ''}</p>}
        <p style={{ overflowWrap: 'anywhere' }}>{report.contentVersion}</p>
      </details>
      {report.prUrl && <p><a className="text-link" href={report.prUrl} target="_blank" rel="noopener noreferrer">Consulter la proposition sur GitHub</a></p>}
      {report.status === 'published' && report.deploymentSha && <p>Version publiée : <a className="text-link" href={`https://github.com/ClemNTTS/MemStack/blob/${report.deploymentSha}/src/data/catalog/corrections.json`} target="_blank" rel="noopener noreferrer">{report.deploymentSha.slice(0, 12)}</a>{report.deploymentUrl && <> · <a className="text-link" href={report.deploymentUrl} target="_blank" rel="noopener noreferrer">Déploiement vérifié</a></>}</p>}
      <p><a className="text-link" href={appHref(report.challengeId ? `/challenges/${report.challengeId}` : `/lessons/${report.lessonId}`)}>Consulter le contenu actuel</a></p>
    </article>)}</div>
    {current?.reports && current.reports.length > 0 && <p role="status">{current.reports.length} signalement{current.reports.length > 1 ? 's' : ''} affiché{current.reports.length > 1 ? 's' : ''}{current.hasMore ? ' · les plus récents en premier' : ' · historique complet'}</p>}
    {current?.moreError && <p role="alert">Les signalements suivants n’ont pas pu être chargés. Réessaie avec le bouton ci-dessous.</p>}
    {current?.hasMore && <button type="button" className="catalog-button secondary" disabled={current.loadingMore} onClick={loadMore}>{current.loadingMore ? 'Chargement…' : 'Charger les signalements suivants'}</button>}
  </main>
}
