import type { Challenge, ChallengeAnalysis, ChallengeAttempt } from '../types/challenge'
import { compareChallengeAttempts } from './attemptComparison'
import LessonText from '../components/LessonText'

export default function AttemptComparison({ challenge, attempt, attempts, analyses, loading, error, onRefresh }: {
  challenge: Challenge, attempt: ChallengeAttempt, attempts: ChallengeAttempt[], analyses: Record<string, ChallengeAnalysis>, loading: boolean, error: string, onRefresh: () => void
}) {
  const comparison = compareChallengeAttempts(challenge, attempt, attempts, analyses)
  if (!comparison) return null
  const verdictLabel = (verdict: string) => verdict === 'validated' ? 'Validé' : 'À retravailler'
  const points = (title: string, indices: number[]) => <><h4>{title}</h4>{indices.length > 0
    ? <ul>{indices.map(index => <li key={index}><LessonText text={challenge.checkpoints[index]} /></li>)}</ul>
    : <p>Aucun point dans cette catégorie.</p>}</>
  return <section className="challenge-revision" aria-labelledby="attempt-comparison-title">
    <h3 id="attempt-comparison-title">Ton évolution entre deux tentatives</h3>
    <p className="dashboard-note">Comparaison avec la tentative du {new Date(comparison.previous.submittedAt).toLocaleString('fr-FR')}, sur le même dossier.</p>
    {loading ? <p role="status">Chargement des résultats pour comparer…</p> : error ? <p role="alert">{error}</p> : comparison.status === 'unavailable'
      ? <p>Il faut deux verdicts IA disponibles sur la version actuelle du dossier et de sa grille pour comparer.</p>
      : <><p>Verdict précédent : <strong>{verdictLabel(comparison.beforeVerdict)}</strong> · Cette tentative : <strong>{verdictLabel(comparison.afterVerdict)}</strong>.</p>
        {comparison.status === 'points' ? <>
          {points('Points corrigés selon l’IA', comparison.corrected)}
          {points('Points restant à travailler', comparison.remaining)}
          {points('Autres points à travailler dans cette réponse', comparison.newlyMissed)}
          <p className="dashboard-note">Cette comparaison reprend les points signalés par les deux analyses IA. Consulte les retours et la correction pour vérifier leur interprétation.</p>
        </> : <p>Ces anciens retours permettent de comparer les verdicts, mais ne détaillent pas les points corrigés. Ils restent consultables dans ton historique.</p>}
      </>}
    <button className="catalog-button secondary" type="button" disabled={loading} onClick={onRefresh}>Actualiser la comparaison</button>
  </section>
}
