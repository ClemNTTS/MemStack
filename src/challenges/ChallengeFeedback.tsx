import { useEffect, useRef, useState } from 'react'
import { analyzeChallengeAttempt, challengeAiEnabled, readChallengeAnalysis } from '../firebase/challengeAnalyses'
import type { Challenge, ChallengeAnalysis, ChallengeAttempt } from '../types/challenge'
import { catalogLessons } from '../data/catalog'
import { appHref } from '../navigation/browser'
import { needsChallengeRevision, targetedRevision } from './remediation'
import LessonText from '../components/LessonText'

export default function ChallengeFeedback({ uid, attempt, challenge, onRetry, canRetry, autoStart, online, onAnalysisChange }: { uid: string, attempt: ChallengeAttempt, challenge: Challenge, onRetry: () => void, canRetry: boolean, autoStart: boolean, online: boolean, onAnalysisChange?: () => void }) {
  const [analysis, setAnalysis] = useState<ChallengeAnalysis | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pollingPaused, setPollingPaused] = useState(false)
  const generation = useRef(0)
  const inFlight = useRef(false)

  async function request(operation: number) {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError('')
    setPollingPaused(false)
    try {
      const result = await analyzeChallengeAttempt(uid, attempt.id)
      if (generation.current === operation) { setAnalysis(result); if (result.status === 'completed') onAnalysisChange?.() }
    } catch {
      if (generation.current === operation) setError('L’analyse n’a pas abouti. Ta tentative est enregistrée et la correction reste disponible.')
    } finally {
      if (generation.current === operation) { setBusy(false); inFlight.current = false }
    }
  }

  useEffect(() => {
    const operation = ++generation.current
    setAnalysis(null)
    setError('')
    setPollingPaused(false)
    setBusy(true)
    inFlight.current = false
    readChallengeAnalysis(uid, attempt.id).then(result => {
      if (generation.current !== operation) return
      setAnalysis(result)
      setBusy(false)
      if (!result && autoStart && challengeAiEnabled && attempt.version === 2) void request(operation)
    }).catch(() => {
      if (generation.current !== operation) return
      setBusy(false)
      setError('Impossible de retrouver le retour enregistré. La correction reste disponible.')
    })
    return () => { generation.current++ }
  }, [uid, attempt.id])

  useEffect(() => {
    if (analysis?.status !== 'processing' || !online || pollingPaused) return
    const operation = generation.current
    let active = true
    let reading = false
    let reads = 0
    const timer = window.setInterval(() => {
      if (document.hidden || reading || !active) return
      if (reads >= 24) {
        window.clearInterval(timer)
        setPollingPaused(true)
        return
      }
      reads++
      reading = true
      readChallengeAnalysis(uid, attempt.id).then(result => {
        if (active && generation.current === operation && result) { setAnalysis(result); if (result.status === 'completed') onAnalysisChange?.() }
      }).catch(() => {
        if (active && generation.current === operation) {
          setError('Le suivi de l’analyse est interrompu. Réessaie ou consulte la correction.')
          setPollingPaused(true)
        }
      }).finally(() => { reading = false })
    }, 5000)
    const timeout = window.setTimeout(() => {
      window.clearInterval(timer)
      if (active && generation.current === operation) setPollingPaused(true)
    }, 120000)
    return () => { active = false; window.clearInterval(timer); window.clearTimeout(timeout) }
  }, [analysis?.status, online, uid, attempt.id, pollingPaused])

  const revision = targetedRevision(challenge, analysis)

  return <section className="challenge-feedback" aria-labelledby="challenge-feedback-title">
    <h3 id="challenge-feedback-title">Ton retour personnalisé</h3>
    {busy && <p role="status">Chargement du retour…</p>}
    {analysis?.status === 'processing' && <p role="status">Mémo analyse ton raisonnement… Tu peux déjà consulter la correction.</p>}
    {pollingPaused && analysis?.status === 'processing' && <p role="status">Le suivi automatique est en pause. Utilise « Vérifier l’analyse » pour retrouver son résultat.</p>}
    {analysis?.status === 'completed' && <><p role="status">{analysis.verdict === 'validated' ? 'Examen validé par l’IA.' : analysis.verdict === 'retry' ? 'Examen à retravailler : fais une nouvelle tentative après avoir étudié la correction.' : 'Retour historique : cette analyse ne comporte aucune validation d’examen.'}</p><LessonText text={analysis.message} /><p className="dashboard-note">Verdict et retour générés par IA : compare-les à la correction de référence. Relire ce retour ne lance aucun appel.</p></>}
    {analysis?.status === 'failed' && <p role="alert">L’analyse a échoué. Tu peux réessayer.</p>}
    {analysis?.status === 'needs_review' && <p role="status">L’analyse est indisponible pour cette tentative. L’examen n’est pas validé ; tu peux consulter la correction de référence.</p>}
    {error && <p role="alert">{error}</p>}
    {!challengeAiEnabled && !analysis && <p>L’analyse IA est désactivée sur cette version. Ta réponse est conservée pour comparer avec la correction.</p>}
    {attempt.version === 1 && <p>Cette ancienne tentative conserve sa correction d’origine et ne lance pas d’analyse IA.</p>}
    {challengeAiEnabled && attempt.version === 2 && analysis?.status !== 'completed' && analysis?.status !== 'needs_review' && <>
      <p className="dashboard-note">En lançant l’analyse, ton raisonnement et le dossier seront transmis à Mistral pour produire un retour pédagogique.</p>
      <button className="catalog-button secondary" type="button" disabled={busy || !online} onClick={() => { void request(generation.current) }}>{analysis?.status === 'processing' ? 'Vérifier l’analyse' : 'Analyser ma réponse'}</button>
    </>}
    {needsChallengeRevision(challenge, attempt, analysis) && <section className="challenge-revision" aria-labelledby="challenge-revision-title">
      <h3 id="challenge-revision-title">Préparer ta prochaine tentative</h3>
      <p>{revision ? 'Voici les points identifiés par l’IA comme manqués et les leçons qui leur correspondent.' : 'Cet ancien retour ne précise pas les points manqués. Compare-le à la correction ; les leçons ci-dessous couvrent l’ensemble du défi.'}</p>
      <h4>Les points à reprendre</h4>
      <ul>{(revision?.points.map(point => point.text) ?? challenge.checkpoints).map(point => <li key={point}><LessonText text={point} /></li>)}</ul>
      <h4>Relire les leçons utiles</h4>
      <ul>{(revision?.lessonIds ?? [...new Set(challenge.lessonIds)]).map(id => {
        const lesson = catalogLessons.find(entry => entry.id === id)
        return lesson && <li key={id}><a className="text-link" href={appHref(`/lessons/${id}?challenge=${encodeURIComponent(challenge.id)}`)}>{lesson.title} · relire →</a></li>
      })}</ul>
      <p className="dashboard-note">La relecture ne modifie ni tes échéances de cartes ni ton verdict. Seule une nouvelle analyse IA évalue ta nouvelle réponse.</p>
      <button className="catalog-button" type="button" disabled={!canRetry || !online} onClick={onRetry}>Refaire l’examen</button>
    </section>}
    <p><a className="text-link" href="#challenge-reference-correction" onClick={event => {
      event.preventDefault()
      const correction = document.getElementById('challenge-reference-correction')
      correction?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      correction?.focus({ preventScroll: true })
    }}>Consulter la correction de référence ↓</a></p>
  </section>
}
