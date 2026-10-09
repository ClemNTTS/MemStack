import { useEffect, useRef, useState } from 'react'
import { appHref } from '../navigation/browser'
import { challenges, getChallengeVersion } from '../data/challenges'
import ChallengeFeedback from '../challenges/ChallengeFeedback'
import AttemptComparison from '../challenges/ChallengeAttemptComparison'
import { challengeAiEnabled } from '../firebase/challengeAnalyses'
import { catalogCourses, catalogLessons } from '../data/catalog'
import { useChallenges } from '../challenges/ChallengeProvider'
import { getChallengeThemeProgress } from '../challenges/themeAccess'
import { useProgress } from '../progress/ProgressProvider'
import { PageHeading } from './CatalogShared'
import LessonText from './LessonText'
import Memo from './Memo'
import WorkshopBackground from './WorkshopBackground'
import ContentReportButton from './ContentReportButton'
import { challengeReportContext } from '../reports/contentReport'
import { loadChallengeDraft, removeChallengeDraft, saveChallengeDraft } from '../challenges/challengeDraft'
import './challenges.css'

function ChallengeView({ challengeId }: { challengeId: string }) {
  const { user, progress, online } = useProgress()
  const { attempts, analyses, analysesLoading, analysesReady, analysesError, refreshAnalyses, loading, ready, error, saving, retry, submitAttempt } = useChallenges()
  const challenge = challenges.find(entry => entry.id === challengeId)
  const themeAccess = challenge ? getChallengeThemeProgress(challenge, catalogCourses, progress.completedLessons) : null
  const [observations, setObservations] = useState('')
  const [actions, setActions] = useState('')
  const [draftScope, setDraftScope] = useState('')
  const [draftMessage, setDraftMessage] = useState('')
  const scope = `${user?.uid ?? ''}:${challengeId}:${challenge?.version ?? 0}`
  const [autoAnalyzeId, setAutoAnalyzeId] = useState<string | null>(null)
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null)
  const correctionRef = useRef<HTMLHeadingElement>(null)
  const responseRef = useRef<HTMLTextAreaElement>(null)
  const previousAttemptId = useRef<string | undefined>(undefined)
  const history = attempts.filter(attempt => attempt.challengeId === challengeId)
  const selected = history.find(attempt => attempt.id === selectedAttemptId)
  const reference = selected ? getChallengeVersion(challengeId, selected.challengeVersion) : challenge
  const displayed = reference ?? challenge
  const currentUid = useRef(user?.uid)
  currentUid.current = user?.uid
  const currentScope = useRef(scope)
  currentScope.current = scope

  useEffect(() => {
    let draft = { observations: '', actions: '' }
    setDraftMessage('')
    if (user && challenge) {
      try {
        draft = loadChallengeDraft(window.localStorage, user.uid, challenge.id, challenge.version)
        if (draft.observations || draft.actions) setDraftMessage('Ton brouillon local a été retrouvé.')
      } catch { setDraftMessage('Ton brouillon local n’a pas pu être chargé.') }
    }
    setObservations(draft.observations)
    setActions(draft.actions)
    setDraftScope(scope)
    setAutoAnalyzeId(null)
    setSelectedAttemptId(null)
  }, [scope])

  function updateDraft(field: 'observations' | 'actions', value: string) {
    if (!user || !challenge || draftScope !== scope) return
    const next = { observations, actions, [field]: value }
    if (field === 'observations') setObservations(value)
    else setActions(value)
    try {
      saveChallengeDraft(window.localStorage, user.uid, challenge.id, challenge.version, next)
      setDraftMessage('Brouillon enregistré sur cet appareil pour ce compte.')
    } catch { setDraftMessage('Le brouillon n’a pas pu être sauvegardé. Garde cette page ouverte.') }
  }

  useEffect(() => {
    if (selected) correctionRef.current?.focus()
    else if (previousAttemptId.current) responseRef.current?.focus()
    previousAttemptId.current = selected?.id
  }, [selected?.id])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (draftScope !== scope || !challengeAiEnabled || !challenge || !themeAccess?.unlocked || !observations.trim() || !actions.trim() || saving || !ready || !online) return
    const uid = user?.uid
    const submittedScope = scope
    const attempt = await submitAttempt(challenge.id, observations, actions)
    if (attempt) {
      try { removeChallengeDraft(window.localStorage, uid!, challenge.id, challenge.version) }
      catch { if (currentScope.current === submittedScope) setDraftMessage('La tentative est enregistrée, mais le brouillon local n’a pas pu être effacé.') }
    }
    if (attempt && currentUid.current === uid && currentScope.current === submittedScope) {
      setSelectedAttemptId(attempt.id)
      setAutoAnalyzeId(attempt.id)
      setObservations('')
      setActions('')
    }
  }

  if (!challenge) return <main className="dashboard"><PageHeading eyebrow="Défi introuvable" title="Une autre situation ?" description="Ce défi n’existe pas dans l’atelier." /><a className="dashboard-cta" href={appHref('/challenges')}>Voir les défis</a></main>

  if (!themeAccess?.unlocked) return <main className="dashboard challenge-page">
    <a className="text-link breadcrumb" href={appHref('/challenges')}>← Tous les défis</a>
    <PageHeading eyebrow="Défi verrouillé" title={challenge.title} description={`Termine toutes les leçons de la thématique ${themeAccess?.theme ?? 'associée'} pour accéder à ce défi.`} />
    <p role="status">{themeAccess?.completed ?? 0} / {themeAccess?.total ?? 0} leçons terminées.</p>
    <a className="dashboard-cta" href={appHref('/courses')}>Continuer les parcours →</a>
  </main>

  return <main className="dashboard challenge-page">
    <WorkshopBackground stage="rest" beat={0} />
    <a className="text-link breadcrumb" href={appHref('/challenges')}>← Tous les défis</a>
    <PageHeading eyebrow={`${catalogCourses.find(course => course.id === challenge.courseId)?.title} · Diagnostic · ${challenge.estimatedMinutes} min`} title={challenge.title} description="Lis le dossier, explique ton diagnostic et propose une action avec sa vérification. Compare ensuite ton raisonnement avec la correction." />
    <ContentReportButton key={challenge.id} context={challengeReportContext(challenge)} />
    <section className="challenge-prerequisites" aria-label="Notions utiles">
      <p>Pour te préparer ou retrouver une notion :</p>
      <ul>{challenge.lessonIds.map(id => {
        const lesson = catalogLessons.find(entry => entry.id === id)
        const completed = Object.hasOwn(progress.completedLessons, id)
        return <li key={id}><a href={appHref(completed ? `/lessons/${id}` : `/courses/${challenge.courseId}`)}>{lesson?.title ?? id}{completed ? ' · relire' : ' · voir le parcours'}</a></li>
      })}</ul>
      <p className="dashboard-note">Tu as terminé la thématique. Ces repères restent disponibles pour relire les notions utiles.</p>
    </section>
    {loading && <p role="status">Chargement de tes tentatives…</p>}
    {error && <div className="inline-error" role="alert"><p>{error}</p><button className="catalog-button secondary" type="button" disabled={saving} onClick={retry}>Réessayer</button></div>}
    <section className="challenge-scenario" aria-labelledby="challenge-situation">
      <div className="challenge-section-heading"><Memo expression="unsure" /><h2 id="challenge-situation">La situation</h2></div>
      {selected && <p className="dashboard-note">Dossier de la tentative · version {selected.challengeVersion}</p>}
      <LessonText text={displayed!.scenario} />
      {displayed!.files.length > 0 && <><h3>Les fichiers du dossier</h3>
      <div className="challenge-files">{displayed!.files.map(file => <details key={file.name} open><summary><strong>{file.name}</strong> · {file.description}</summary><pre tabIndex={0} aria-label={`Contenu de ${file.name}, défilement horizontal disponible`}><code>{file.content}</code></pre></details>)}</div></>}
      <h3>À toi de diagnostiquer</h3>
      <LessonText text={displayed!.prompt} />
    </section>
    {!selected ? <section className="challenge-response" aria-labelledby="challenge-response-title">
      <h2 id="challenge-response-title">Ton raisonnement</h2>
      <form onSubmit={submit}>
        <label htmlFor="challenge-observations">Ce que je constate</label>
        <textarea ref={responseRef} id="challenge-observations" rows={5} maxLength={2000} required value={draftScope === scope ? observations : ''} disabled={loading || saving || draftScope !== scope} onChange={event => updateDraft('observations', event.target.value)} aria-describedby="challenge-response-note" placeholder="Quels indices relèves-tu dans les fichiers ? Comment expliques-tu le problème ?" />
        <label htmlFor="challenge-actions">Ce que je ferais</label>
        <textarea id="challenge-actions" rows={5} maxLength={2000} required value={draftScope === scope ? actions : ''} disabled={loading || saving || draftScope !== scope} onChange={event => updateDraft('actions', event.target.value)} aria-describedby="challenge-response-note" placeholder="Quelle action proposes-tu, pourquoi et comment vérifierais-tu son résultat ?" />
        <p className="dashboard-note">Ce brouillon reste sur cet appareil ; il n’est pas envoyé à l’IA avant l’enregistrement de la tentative.</p>
        {draftMessage && <p className="dashboard-note" role="status">{draftMessage}</p>}
        <p id="challenge-response-note" className="dashboard-note">{observations.length + actions.length + 2} / 4 000 caractères au total · 2 000 par champ. Ta tentative est enregistrée avant tout retour.</p>
        {challengeAiEnabled ? <p className="dashboard-note">Après enregistrement, ton raisonnement et le dossier seront transmis à Mistral pour produire un retour pédagogique.</p> : <p className="dashboard-note" role="status">L’analyse IA est indisponible sur cette version. Les nouvelles tentatives sont suspendues ; ton historique reste consultable.</p>}
        <button className="catalog-button" type="submit" disabled={!challengeAiEnabled || !ready || saving || !online || !observations.trim() || !actions.trim() || observations.trim().length + actions.trim().length + 2 > 4000}>{saving ? 'Enregistrement…' : 'Enregistrer et analyser'}</button>
      </form>
    </section> : <section className="challenge-correction" aria-labelledby="challenge-correction-title">
      <div className="challenge-section-heading"><Memo /><h2 id="challenge-correction-title" ref={correctionRef} tabIndex={-1}>Comparer, puis comprendre</h2></div>
      <p className="dashboard-note">Tentative du {new Date(selected.submittedAt).toLocaleString('fr-FR')} · Enregistrée sur ton compte</p>
      {selected.challengeVersion !== challenge.version && <p className="challenge-version-note" role="status">Cette tentative concerne la version {selected.challengeVersion}. Sa correction d’origine est conservée.</p>}
      <details className="challenge-own-response"><summary>Relire ta réponse</summary>{selected.version === 2 ? <><h3>Ce que je constate</h3><LessonText text={selected.observations!} /><h3>Ce que je ferais</h3><LessonText text={selected.actions!} /></> : <LessonText text={selected.answer} />}</details>
      {user && <ChallengeFeedback key={`${user.uid}-${selected.id}`} uid={user.uid} attempt={selected} challenge={challenge} onRetry={() => setSelectedAttemptId(null)} canRetry={challengeAiEnabled && ready && !saving} autoStart={autoAnalyzeId === selected.id} online={online} onAnalysisChange={refreshAnalyses} />}
      <AttemptComparison challenge={challenge} attempt={selected} attempts={history} analyses={analysesReady ? analyses : {}} loading={analysesLoading} error={analysesError} onRefresh={refreshAnalyses} />
      <h3 id="challenge-reference-correction" tabIndex={-1}>La correction expliquée</h3>
      <LessonText text={reference?.correction ?? 'Cette version du dossier n’est pas disponible.'} />
      <h3>Les points à retrouver dans ton raisonnement</h3>
      <ul className="challenge-checkpoints">{reference?.checkpoints.map(point => <li key={point}><LessonText text={point} /></li>)}</ul>
      <h3>Les nuances à garder en tête</h3>
      <ul className="challenge-checkpoints">{reference?.counterexamples.map(point => <li key={point}><LessonText text={point} /></li>)}</ul>
      <p className="dashboard-note">Seule l’analyse IA évalue cette réponse. La correction de référence permet de revoir les notions.</p>
      <details className="challenge-sources"><summary>Sources pour aller plus loin</summary><ul>{reference?.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul></details>
      <button className="catalog-button secondary" type="button" disabled={!challengeAiEnabled || !ready || saving} onClick={() => setSelectedAttemptId(null)}>Faire une nouvelle tentative</button>
    </section>}
    {history.length > 0 && <section className="challenge-history" aria-labelledby="challenge-history-title">
      <h2 id="challenge-history-title">Tes tentatives</h2>
      <p className="dashboard-note">Chaque tentative conserve ta réponse et son analyse IA. Revoir une correction ne modifie pas ton historique.</p>
      <ol>{history.map(attempt => <li key={attempt.id}><div><strong>{new Date(attempt.submittedAt).toLocaleString('fr-FR')}</strong><span>{attempt.version === 2 ? 'Tentative enregistrée · retour IA dans le détail' : 'Tentative historique'}</span></div><button className="sound-toggle" type="button" disabled={!ready || saving} aria-pressed={selectedAttemptId === attempt.id} onClick={() => setSelectedAttemptId(attempt.id)}>Revoir la tentative</button></li>)}</ol>
    </section>}
  </main>
}

export default ChallengeView
