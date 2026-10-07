import { useEffect, useRef, useState } from 'react'
import { analyzeChallengeAttempt, challengeAiEnabled, readChallengeAnalysis } from '../firebase/challengeAnalyses'
import type { ChallengeAnalysis, ChallengeAttempt } from '../types/challenge'
import LessonText from '../components/LessonText'

export default function ChallengeFeedback({ uid, attempt, autoStart, online }: { uid: string, attempt: ChallengeAttempt, autoStart: boolean, online: boolean }) {
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
      if (generation.current === operation) setAnalysis(result)
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
        if (active && generation.current === operation && result) setAnalysis(result)
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

  return <section className="challenge-feedback" aria-labelledby="challenge-feedback-title">
    <h3 id="challenge-feedback-title">Ton retour personnalisé</h3>
    {busy && <p role="status">Chargement du retour…</p>}
    {analysis?.status === 'processing' && <p role="status">Mémo analyse ton raisonnement… Tu peux déjà consulter la correction.</p>}
    {pollingPaused && analysis?.status === 'processing' && <p role="status">Le suivi automatique est en pause. Utilise « Vérifier l’analyse » pour retrouver son résultat.</p>}
    {analysis?.status === 'completed' && <><LessonText text={analysis.message} /><p className="dashboard-note">Retour généré par IA : compare-le à la correction de référence. Relire ce retour ne lance aucun appel.</p></>}
    {analysis?.status === 'failed' && <p role="alert">L’analyse a échoué. Tu peux réessayer.</p>}
    {analysis?.status === 'needs_review' && <p role="status">L’analyse doit être vérifiée avant de relancer un appel. Consulte la correction de référence.</p>}
    {error && <p role="alert">{error}</p>}
    {!challengeAiEnabled && !analysis && <p>L’analyse IA est désactivée sur cette version. Ta réponse est conservée pour comparer avec la correction.</p>}
    {attempt.version === 1 && <p>Cette ancienne tentative conserve sa correction d’origine et ne lance pas d’analyse IA.</p>}
    {challengeAiEnabled && attempt.version === 2 && analysis?.status !== 'completed' && analysis?.status !== 'needs_review' && <>
      <p className="dashboard-note">En lançant l’analyse, ton raisonnement et le dossier seront transmis à Mistral pour produire un retour pédagogique.</p>
      <button className="catalog-button secondary" type="button" disabled={busy || !online} onClick={() => { void request(generation.current) }}>{analysis?.status === 'processing' ? 'Vérifier l’analyse' : 'Analyser ma réponse'}</button>
    </>}
    <p><a className="text-link" href="#challenge-reference-correction">Consulter la correction de référence ↓</a></p>
  </section>
}
