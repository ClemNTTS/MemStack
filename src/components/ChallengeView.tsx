import { useEffect, useRef, useState } from 'react'
import { appHref } from '../navigation/browser'
import { challenges, getChallengeVersion } from '../data/challenges'
import ChallengeFeedback from '../challenges/ChallengeFeedback'
import { challengeAiEnabled } from '../firebase/challengeAnalyses'
import { catalogCourses, catalogLessons } from '../data/catalog'
import { useChallenges } from '../challenges/ChallengeProvider'
import { useProgress } from '../progress/ProgressProvider'
import { PageHeading } from './CatalogShared'
import LessonText from './LessonText'
import Memo from './Memo'
import WorkshopBackground from './WorkshopBackground'
import './challenges.css'

function ChallengeView({ challengeId }: { challengeId: string }) {
  const { user, progress, online } = useProgress()
  const { attempts, loading, ready, error, saving, retry, submitAttempt, rateAttempt } = useChallenges()
  const challenge = challenges.find(entry => entry.id === challengeId)
  const [observations, setObservations] = useState('')
  const [actions, setActions] = useState('')
  const [autoAnalyzeId, setAutoAnalyzeId] = useState<string | null>(null)
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null)
  const correctionRef = useRef<HTMLHeadingElement>(null)
  const history = attempts.filter(attempt => attempt.challengeId === challengeId)
  const selected = history.find(attempt => attempt.id === selectedAttemptId)
  const reference = selected ? getChallengeVersion(challengeId, selected.challengeVersion) : challenge
  const displayed = reference ?? challenge
  const currentUid = useRef(user?.uid)
  currentUid.current = user?.uid

  useEffect(() => {
    setObservations('')
    setActions('')
    setAutoAnalyzeId(null)
    setSelectedAttemptId(null)
  }, [challengeId, user?.uid])

  useEffect(() => {
    if (selected) correctionRef.current?.focus()
  }, [selected?.id])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!challenge || !observations.trim() || !actions.trim() || saving || !ready || !online) return
    const uid = user?.uid
    const attempt = await submitAttempt(challenge.id, observations, actions)
    if (attempt && currentUid.current === uid) {
      setSelectedAttemptId(attempt.id)
      setAutoAnalyzeId(attempt.id)
      setObservations('')
      setActions('')
    }
  }

  if (!challenge) return <main className="dashboard"><PageHeading eyebrow="Défi introuvable" title="Une autre situation ?" description="Ce défi n’existe pas dans l’atelier." /><a className="dashboard-cta" href={appHref('/challenges')}>Voir les défis</a></main>

  return <main className="dashboard challenge-page">
    <WorkshopBackground stage="rest" beat={0} />
    <a className="text-link breadcrumb" href={appHref('/challenges')}>← Tous les défis</a>
    <PageHeading eyebrow={`${catalogCourses.find(course => course.id === challenge.courseId)?.title} · Diagnostic · ${challenge.estimatedMinutes} min`} title={challenge.title} description="Lis le dossier, explique ton diagnostic et propose une action avec sa vérification. Compare ensuite ton raisonnement avec la correction." />
    <section className="challenge-prerequisites" aria-label="Notions utiles">
      <p>Pour te préparer ou retrouver une notion :</p>
      <ul>{challenge.lessonIds.map(id => {
        const lesson = catalogLessons.find(entry => entry.id === id)
        const completed = Object.hasOwn(progress.completedLessons, id)
        return <li key={id}><a href={appHref(completed ? `/lessons/${id}` : `/courses/${challenge.courseId}`)}>{lesson?.title ?? id}{completed ? ' · relire' : ' · voir le parcours'}</a></li>
      })}</ul>
      <p className="dashboard-note">Ces repères sont conseillés : tu peux essayer le défi dès maintenant.</p>
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
        <textarea id="challenge-observations" rows={5} maxLength={2000} required value={observations} disabled={loading || saving} onChange={event => setObservations(event.target.value)} aria-describedby="challenge-response-note" placeholder="Quels indices relèves-tu dans les fichiers ? Comment expliques-tu le problème ?" />
        <label htmlFor="challenge-actions">Ce que je ferais</label>
        <textarea id="challenge-actions" rows={5} maxLength={2000} required value={actions} disabled={loading || saving} onChange={event => setActions(event.target.value)} aria-describedby="challenge-response-note" placeholder="Quelle action proposes-tu, pourquoi et comment vérifierais-tu son résultat ?" />
        <p id="challenge-response-note" className="dashboard-note">{observations.length + actions.length + 2} / 4 000 caractères au total · 2 000 par champ. Ta tentative est enregistrée avant tout retour.</p>
        {challengeAiEnabled ? <p className="dashboard-note">Après enregistrement, ton raisonnement et le dossier seront transmis à Mistral pour produire un retour pédagogique.</p> : <p className="dashboard-note">L’analyse IA est désactivée sur cette version. La correction de référence reste disponible après enregistrement.</p>}
        <button className="catalog-button" type="submit" disabled={!ready || saving || !online || !observations.trim() || !actions.trim() || observations.trim().length + actions.trim().length + 2 > 4000}>{saving ? 'Enregistrement…' : challengeAiEnabled ? 'Enregistrer et analyser' : 'Enregistrer et voir la correction'}</button>
      </form>
    </section> : <section className="challenge-correction" aria-labelledby="challenge-correction-title">
      <div className="challenge-section-heading"><Memo /><h2 id="challenge-correction-title" ref={correctionRef} tabIndex={-1}>Comparer, puis comprendre</h2></div>
      <p className="dashboard-note">Tentative du {new Date(selected.submittedAt).toLocaleString('fr-FR')} · Enregistrée sur ton compte</p>
      {selected.challengeVersion !== challenge.version && <p className="challenge-version-note" role="status">Cette tentative concerne la version {selected.challengeVersion}. Sa correction d’origine est conservée.</p>}
      <details className="challenge-own-response"><summary>Relire ta réponse</summary>{selected.version === 2 ? <><h3>Ce que je constate</h3><LessonText text={selected.observations!} /><h3>Ce que je ferais</h3><LessonText text={selected.actions!} /></> : <LessonText text={selected.answer} />}</details>
      {user && <ChallengeFeedback key={`${user.uid}-${selected.id}`} uid={user.uid} attempt={selected} autoStart={autoAnalyzeId === selected.id} online={online} />}
      <h3 id="challenge-reference-correction" tabIndex={-1}>La correction expliquée</h3>
      <LessonText text={reference?.correction ?? 'Cette version du dossier n’est pas disponible.'} />
      <h3>Les points à retrouver dans ton raisonnement</h3>
      <ul className="challenge-checkpoints">{reference?.checkpoints.map(point => <li key={point}><LessonText text={point} /></li>)}</ul>
      <h3>Les nuances à garder en tête</h3>
      <ul className="challenge-checkpoints">{reference?.counterexamples.map(point => <li key={point}><LessonText text={point} /></li>)}</ul>
      <div className="challenge-self-assessment">
        <h3>Où en es-tu après la comparaison ?</h3>
        <p>Ce choix décrit ton ressenti ; il ne certifie pas la justesse de ta réponse.</p>
        <div className="challenge-rating-buttons">
          <button className="catalog-button secondary" type="button" aria-pressed={selected.outcome === 'retry'} disabled={!ready || saving || !online || selected.outcome !== ''} onClick={() => { void rateAttempt(selected.id, 'retry') }}>À retravailler</button>
          <button className="catalog-button" type="button" aria-pressed={selected.outcome === 'understood'} disabled={!ready || saving || !online || selected.outcome !== ''} onClick={() => { void rateAttempt(selected.id, 'understood') }}>Compris</button>
        </div>
        {selected.outcome !== '' && <p role="status">Repère enregistré : {selected.outcome === 'retry' ? 'à retravailler' : 'compris'}.</p>}
      </div>
      <details className="challenge-sources"><summary>Sources pour aller plus loin</summary><ul>{reference?.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul></details>
      <button className="catalog-button secondary" type="button" disabled={!ready || saving} onClick={() => setSelectedAttemptId(null)}>Faire une nouvelle tentative</button>
    </section>}
    {history.length > 0 && <section className="challenge-history" aria-labelledby="challenge-history-title">
      <h2 id="challenge-history-title">Tes tentatives</h2>
      <p className="dashboard-note">Chaque tentative conserve ta réponse et son repère. Revoir une correction ne modifie pas ton historique.</p>
      <ol>{history.map(attempt => <li key={attempt.id}><div><strong>{new Date(attempt.submittedAt).toLocaleString('fr-FR')}</strong><span>{attempt.outcome === 'understood' ? 'Compris' : attempt.outcome === 'retry' ? 'À retravailler' : 'Autoévaluation à compléter'}</span></div><button className="sound-toggle" type="button" disabled={!ready || saving} aria-pressed={selectedAttemptId === attempt.id} onClick={() => setSelectedAttemptId(attempt.id)}>Revoir la tentative</button></li>)}</ol>
    </section>}
  </main>
}

export default ChallengeView
