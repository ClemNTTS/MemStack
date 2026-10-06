import { useEffect, useRef, useState } from 'react'
import { appHref } from '../navigation/browser'
import { challenges } from '../data/challenges'
import { catalogLessons } from '../data/catalog'
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
  const [response, setResponse] = useState('')
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null)
  const correctionRef = useRef<HTMLHeadingElement>(null)
  const history = attempts.filter(attempt => attempt.challengeId === challengeId)
  const selected = history.find(attempt => attempt.id === selectedAttemptId)
  const currentUid = useRef(user?.uid)
  currentUid.current = user?.uid

  useEffect(() => {
    setResponse('')
    setSelectedAttemptId(null)
  }, [challengeId, user?.uid])

  useEffect(() => {
    if (selected) correctionRef.current?.focus()
  }, [selected?.id])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!challenge || !response.trim() || saving || !ready || !online) return
    const uid = user?.uid
    const attempt = await submitAttempt(challenge.id, response)
    if (attempt && currentUid.current === uid) {
      setSelectedAttemptId(attempt.id)
      setResponse('')
    }
  }

  if (!challenge) return <main className="dashboard"><PageHeading eyebrow="Défi introuvable" title="Une autre situation ?" description="Ce défi n’existe pas dans l’atelier." /><a className="dashboard-cta" href={appHref('/challenges')}>Voir les défis</a></main>

  return <main className="dashboard challenge-page">
    <WorkshopBackground stage="rest" beat={0} />
    <a className="text-link breadcrumb" href={appHref('/challenges')}>← Tous les défis</a>
    <PageHeading eyebrow={`Docker · Diagnostic · ${challenge.estimatedMinutes} min`} title={challenge.title} description="Explique ton raisonnement avant de regarder la correction. Aucun code ne sera exécuté et aucune IA ne notera ta réponse." />
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
      <LessonText text={challenge.scenario} />
      <h3>À toi de diagnostiquer</h3>
      <LessonText text={challenge.prompt} />
    </section>
    {!selected ? <section className="challenge-response" aria-labelledby="challenge-response-title">
      <h2 id="challenge-response-title">Ton raisonnement</h2>
      <form onSubmit={submit}>
        <label htmlFor="challenge-response">Que se passe-t-il et que proposerais-tu ?</label>
        <textarea id="challenge-response" rows={8} maxLength={4000} required value={response} disabled={loading || saving} onChange={event => setResponse(event.target.value)} aria-describedby="challenge-response-note" placeholder="Décris ton diagnostic, ta solution et comment tu la vérifierais." />
        <p id="challenge-response-note" className="dashboard-note">{response.length} / 4 000 caractères · Ta tentative doit être enregistrée avant d’afficher la correction. Elle reste dans ton historique.</p>
        <button className="catalog-button" type="submit" disabled={!ready || saving || !online || !response.trim()}>{saving ? 'Enregistrement…' : 'Enregistrer et voir la correction'}</button>
      </form>
    </section> : <section className="challenge-correction" aria-labelledby="challenge-correction-title">
      <div className="challenge-section-heading"><Memo /><h2 id="challenge-correction-title" ref={correctionRef} tabIndex={-1}>Comparer, puis comprendre</h2></div>
      <p className="dashboard-note">Tentative du {new Date(selected.submittedAt).toLocaleString('fr-FR')} · Enregistrée sur ton compte</p>
      {selected.challengeVersion !== challenge.version && <p className="challenge-version-note" role="status">Cette tentative concerne une ancienne version. La correction affichée est celle de la version actuelle.</p>}
      <details className="challenge-own-response"><summary>Relire ta réponse</summary><LessonText text={selected.answer} /></details>
      <h3>La correction expliquée</h3>
      <LessonText text={challenge.correction} />
      <h3>Les points à retrouver dans ton raisonnement</h3>
      <ul className="challenge-checkpoints">{challenge.checkpoints.map(point => <li key={point}><LessonText text={point} /></li>)}</ul>
      <h3>Les nuances à garder en tête</h3>
      <ul className="challenge-checkpoints">{challenge.counterexamples.map(point => <li key={point}><LessonText text={point} /></li>)}</ul>
      <div className="challenge-self-assessment">
        <h3>Où en es-tu après la comparaison ?</h3>
        <p>Ce choix décrit ton ressenti ; il ne certifie pas la justesse de ta réponse.</p>
        <div className="challenge-rating-buttons">
          <button className="catalog-button secondary" type="button" aria-pressed={selected.outcome === 'retry'} disabled={!ready || saving || !online || selected.outcome !== ''} onClick={() => { void rateAttempt(selected.id, 'retry') }}>À retravailler</button>
          <button className="catalog-button" type="button" aria-pressed={selected.outcome === 'understood'} disabled={!ready || saving || !online || selected.outcome !== ''} onClick={() => { void rateAttempt(selected.id, 'understood') }}>Compris</button>
        </div>
        {selected.outcome !== '' && <p role="status">Repère enregistré : {selected.outcome === 'retry' ? 'à retravailler' : 'compris'}.</p>}
      </div>
      <details className="challenge-sources"><summary>Sources pour aller plus loin</summary><ul>{challenge.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul></details>
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
