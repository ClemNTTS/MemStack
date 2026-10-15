import { useEffect, useRef, useState } from 'react'
import { appHref } from '../navigation/browser'
import { challenges, getChallengeVersion } from '../data/challenges'
import { catalogCourses, catalogLessons } from '../data/catalog'
import { useChallenges } from '../challenges/ChallengeProvider'
import { getChallengeThemeProgress } from '../challenges/themeAccess'
import { useProgress } from '../progress/ProgressProvider'
import { PageHeading } from './CatalogShared'
import LessonText, { InlineLessonText } from './LessonText'
import ChallengeQuestions from './ChallengeQuestions'
import WorkshopBackground from './WorkshopBackground'
import ContentReportButton from './ContentReportButton'
import { analysisReportContext, challengeReportContext } from '../reports/contentReport'
import { loadSelectionDraft, saveSelectionDraft, selectionDraftKey } from '../challenges/selectionDraft'
import './challenges.css'

export default function ChallengeView({ challengeId }: { challengeId: string }) {
  const { user, progress, online } = useProgress()
  const { attempts, analyses, loading, ready, error, saving, retry, submitAttempt } = useChallenges()
  const challenge = challenges.find(entry => entry.id === challengeId)
  const themeAccess = challenge ? getChallengeThemeProgress(challenge, catalogCourses, progress.completedLessons) : null
  const scope = `${user?.uid ?? ''}:${challengeId}:${challenge?.version ?? 0}`
  const [draftScope, setDraftScope] = useState('')
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [draftMessage, setDraftMessage] = useState('')
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null)
  const resultRef = useRef<HTMLHeadingElement>(null)
  const currentScope = useRef(scope)
  currentScope.current = scope
  const history = attempts.filter(attempt => attempt.challengeId === challengeId)
  const selected = history.find(attempt => attempt.id === selectedAttemptId)
  const reference = selected ? getChallengeVersion(challengeId, selected.challengeVersion) : challenge
  const displayed = reference ?? challenge
  const complete = challenge?.questions?.every(question => choices[question.id])

  useEffect(() => {
    let draft = {}
    let message = ''
    if (user && challenge) {
      try { draft = loadSelectionDraft(window.localStorage, user.uid, challenge) }
      catch { message = 'Le brouillon local n’a pas pu être retrouvé.' }
    }
    setChoices(draft)
    setDraftMessage(message)
    setDraftScope(scope)
    setSelectedAttemptId(null)
  }, [scope])

  useEffect(() => { if (selected) resultRef.current?.focus() }, [selected?.id])

  function choose(questionId: string, optionId: string) {
    if (!user || !challenge || draftScope !== scope) return
    const next = { ...choices, [questionId]: optionId }
    setChoices(next)
    try { saveSelectionDraft(window.localStorage, user.uid, challenge, next); setDraftMessage('Brouillon enregistré sur cet appareil pour ce compte.') }
    catch { setDraftMessage('Garde cette page ouverte : le brouillon n’a pas pu être sauvegardé.') }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!challenge || !user || draftScope !== scope || !complete || !themeAccess?.unlocked || !ready || !online || saving) return
    const submittedScope = scope
    const uid = user.uid
    const attempt = await submitAttempt(challenge.id, choices)
    if (attempt && currentScope.current === submittedScope) {
      setSelectedAttemptId(attempt.id)
      setChoices({})
      try { window.localStorage.removeItem(selectionDraftKey(uid, challenge)) }
      catch { setDraftMessage('La tentative est enregistrée ; le brouillon local n’a pas pu être effacé.') }
    }
  }

  if (!challenge) return <main className="dashboard"><PageHeading eyebrow="Défi introuvable" title="Une autre situation ?" description="Ce défi n’existe pas dans l’atelier." /><a href={appHref('/challenges')}>Voir les défis</a></main>
  if (!themeAccess?.unlocked) return <main className="dashboard challenge-page">
    <a className="text-link breadcrumb" href={appHref('/challenges')}>← Tous les défis</a>
    <PageHeading eyebrow="Prépare ton défi" title={challenge.title} description={`Termine les leçons utiles et au moins ${themeAccess?.minimumCompleted ?? 2} leçons de la thématique ${themeAccess?.theme ?? 'associée'}.`} />
    <ul>{themeAccess?.missingLessonIds.map(id => <li key={id}>{catalogLessons.find(lesson => lesson.id === id)?.title ?? id}</li>)}</ul>
    <a className="dashboard-cta" href={appHref('/courses')}>Continuer les parcours →</a>
  </main>

  return <main className="dashboard challenge-page">
    <WorkshopBackground stage="rest" beat={0} />
    <a className="text-link breadcrumb" href={appHref('/challenges')}>← Tous les défis</a>
    <PageHeading eyebrow={`${catalogCourses.find(course => course.id === challenge.courseId)?.title} · Diagnostic`} title={challenge.title} description="Lis le scénario et choisis les réponses adaptées. Retrouve ensuite ton résultat et la correction expliquée, vérifiés par le serveur." />
    <ContentReportButton key={challenge.id} context={challengeReportContext(challenge)} />
    <section className="challenge-prerequisites"><p>Les notions utiles :</p><ul>{challenge.lessonIds.map(id => <li key={id}><a href={appHref(`/lessons/${id}`)}>{catalogLessons.find(lesson => lesson.id === id)?.title ?? id} · relire</a></li>)}</ul></section>
    {loading && <p role="status">Chargement de tes tentatives…</p>}
    {error && <div className="inline-error" role="alert"><p>{error}</p><button type="button" disabled={saving} onClick={retry}>Réessayer</button></div>}
    <section className="challenge-scenario" aria-labelledby="challenge-situation">
      <h2 id="challenge-situation">La situation</h2>
      {selected && <p className="dashboard-note">Dossier de la tentative · version {selected.challengeVersion}</p>}
      <LessonText text={displayed!.scenario} />
      <div className="challenge-files">{displayed!.files.map(file => <details key={file.name} open><summary><strong>{file.name}</strong> · {file.description}</summary><pre tabIndex={0} aria-label={`Contenu de ${file.name}`}><code>{file.content}</code></pre></details>)}</div>
      {selected?.version !== 3 && selected && <LessonText text={displayed!.prompt} />}
    </section>
    {!selected ? <section className="challenge-response" aria-labelledby="challenge-response-title">
      <h2 id="challenge-response-title">À toi de résoudre le défi</h2>
      <form onSubmit={submit}>
        <ChallengeQuestions questions={challenge.questions!} choices={draftScope === scope ? choices : {}} disabled={!ready || saving || !online || draftScope !== scope} onChoose={choose} />
        <p className="dashboard-note">Une réponse par question. Il faut strictement plus de 70 % de bonnes réponses pour réussir : {Math.floor(challenge.questions!.length * 0.7) + 1} sur {challenge.questions!.length}. Rien n’est exécuté.</p>
        {draftMessage && <p className="dashboard-note" role="status">{draftMessage}</p>}
        <button className="catalog-button" type="submit" disabled={!ready || saving || !online || !complete || draftScope !== scope}>{saving ? 'Correction et enregistrement…' : 'Soumettre mes réponses'}</button>
      </form>
    </section> : <section className="challenge-correction" aria-labelledby="challenge-correction-title">
      <h2 id="challenge-correction-title" ref={resultRef} tabIndex={-1}>Ton résultat et la correction</h2>
      <p className="dashboard-note">Tentative enregistrée le {new Date(selected.submittedAt).toLocaleString('fr-FR')} · version {selected.challengeVersion}</p>
      {selected.version === 3 && selected.result ? <>
        <p role="status"><strong>{selected.result.verdict === 'validated' ? 'Défi validé.' : 'Défi à retravailler.'}</strong> {selected.result.correctCount}/{selected.result.totalCount} bonnes réponses · correction automatique.</p>
        {reference?.questions?.map((question, index) => <section key={question.id} className="challenge-question-result">
          <h3>{index + 1}. <InlineLessonText text={question.prompt} /></h3>
          <p><strong>{selected.result!.criterionResults[index] ? 'Réponse correcte' : 'Réponse incorrecte'}</strong></p>
          <LessonText text={question.options.find(option => option.id === selected.selections?.[question.id])?.text ?? 'Réponse indisponible'} />
          <LessonText text={selected.result!.feedback[index]} />
        </section>)}
      </> : <>
        <p>Cette tentative appartient à l’ancien format. Elle reste consultable et ne valide pas ce nouveau défi.</p>
        {selected.version === 2 ? <><h3>Ce que je constate</h3><LessonText text={selected.observations!} /><h3>Ce que je ferais</h3><LessonText text={selected.actions!} /></> : <LessonText text={selected.answer} />}
        {analyses[selected.id]?.status === 'completed' && <details><summary>Archive : ancien retour IA</summary><p className="dashboard-note">Ce retour appartient à l’ancien format et ne compte pas dans la validation du défi actuel.</p><LessonText text={analyses[selected.id].message} /><ContentReportButton key={`${user?.uid}/${selected.id}`} context={analysisReportContext(displayed!, selected, analyses[selected.id])} /></details>}
      </>}
      <h3>La correction expliquée</h3><LessonText text={reference?.correction ?? 'Correction historique indisponible.'} />
      <h3>Les notions à revoir</h3><ul>{reference?.checkpoints.map(point => <li key={point}><LessonText text={point} /></li>)}</ul>
      <details><summary>Sources pour aller plus loin</summary><ul>{reference?.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul></details>
      <button className="catalog-button secondary" type="button" disabled={!ready || saving || !online} onClick={() => setSelectedAttemptId(null)}>Faire une nouvelle tentative</button>
    </section>}
    {history.length > 0 && <section className="challenge-history"><h2>Tes tentatives</h2><ol>{history.map(attempt => <li key={attempt.id}><div><strong>{new Date(attempt.submittedAt).toLocaleString('fr-FR')}</strong><span>{attempt.version === 3 ? attempt.result?.verdict === 'validated' ? 'Validé automatiquement' : 'À retravailler' : 'Ancien format'}</span></div><button className="sound-toggle" type="button" disabled={!ready || saving} aria-pressed={selectedAttemptId === attempt.id} onClick={() => setSelectedAttemptId(attempt.id)}>Revoir la tentative</button></li>)}</ol></section>}
  </main>
}
