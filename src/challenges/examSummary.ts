import type { Challenge, ChallengeAnalysis, ChallengeAttempt } from '../types/challenge'

export type ChallengeExamStatus = 'validated' | 'retry' | 'unattempted' | 'pending' | 'unavailable' | 'historical'
export type ChallengeExamSummary = { status: ChallengeExamStatus, attempt?: ChallengeAttempt }

// A success remains acquired for the current dossier and rubric, even after a later retry.
// Only server analyses count; historical self-assessments never validate an exam.
export function getChallengeExamSummary(
  challenge: Pick<Challenge, 'id' | 'version' | 'rubricVersion'>,
  attempts: ChallengeAttempt[],
  analyses: Record<string, ChallengeAnalysis>,
): ChallengeExamSummary {
  const matching = attempts.filter(attempt => attempt.challengeId === challenge.id)
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt) || right.id.localeCompare(left.id))
  if (!matching.length) return { status: 'unattempted' }
  const current = matching.filter(attempt => attempt.version === 2 && attempt.challengeVersion === challenge.version)
  const currentAnalysis = (attempt: ChallengeAttempt) => {
    const analysis = Object.hasOwn(analyses, attempt.id) ? analyses[attempt.id] : undefined
    return analysis?.challengeVersion === challenge.version && analysis.rubricVersion === challenge.rubricVersion ? analysis : undefined
  }
  const success = current.find(attempt => {
    const analysis = currentAnalysis(attempt)
    return analysis?.status === 'completed' && analysis.verdict === 'validated'
  })
  if (success) return { status: 'validated', attempt: success }
  const latest = current[0]
  if (!latest) return { status: 'historical', attempt: matching[0] }
  const analysis = currentAnalysis(latest)
  if (!analysis) return { status: Object.hasOwn(analyses, latest.id) ? 'historical' : 'pending', attempt: latest }
  if (analysis.status === 'processing') return { status: 'pending', attempt: latest }
  if (analysis.status === 'failed' || analysis.status === 'needs_review') return { status: 'unavailable', attempt: latest }
  return { status: analysis.verdict === 'retry' ? 'retry' : 'historical', attempt: latest }
}
