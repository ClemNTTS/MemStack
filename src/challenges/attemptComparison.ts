import type { Challenge, ChallengeAnalysis, ChallengeAttempt } from '../types/challenge'

export function compareChallengeAttempts(challenge: Challenge, selected: ChallengeAttempt, attempts: ChallengeAttempt[], analyses: Record<string, ChallengeAnalysis>) {
  const ordered = attempts.filter(attempt => attempt.challengeId === challenge.id && attempt.challengeVersion === selected.challengeVersion)
    .sort((left, right) => left.submittedAt.localeCompare(right.submittedAt) || left.id.localeCompare(right.id))
  const previous = ordered[ordered.findIndex(attempt => attempt.id === selected.id) - 1]
  if (!previous) return null
  const before = Object.hasOwn(analyses, previous.id) ? analyses[previous.id] : undefined
  const after = Object.hasOwn(analyses, selected.id) ? analyses[selected.id] : undefined
  const valid = (attempt: ChallengeAttempt, analysis: ChallengeAnalysis | undefined) => attempt.version === 2 && analysis?.status === 'completed'
    && analysis.challengeVersion === challenge.version && attempt.challengeVersion === challenge.version
    && analysis.rubricVersion === challenge.rubricVersion && (analysis.verdict === 'validated' || analysis.verdict === 'retry')
  if (!valid(previous, before) || !valid(selected, after)) return { previous, status: 'unavailable' as const }
  const base = { previous, beforeVerdict: before!.verdict!, afterVerdict: after!.verdict! }
  const reliable = (analysis: ChallengeAnalysis) => analysis.promptVersion === 'challenge-feedback-v4'
    && Array.isArray(analysis.missedCheckpointIndices)
    && analysis.missedCheckpointIndices.every(index => Number.isInteger(index) && index >= 0 && index < challenge.checkpoints.length)
    && new Set(analysis.missedCheckpointIndices).size === analysis.missedCheckpointIndices.length
    && (analysis.verdict === 'validated' ? analysis.missedCheckpointIndices.length === 0 : analysis.missedCheckpointIndices.length > 0)
  if (!reliable(before!) || !reliable(after!)) return { ...base, status: 'verdicts' as const }
  const beforePoints = before!.missedCheckpointIndices!
  const afterPoints = after!.missedCheckpointIndices!
  return { ...base, status: 'points' as const,
    corrected: beforePoints.filter(index => !afterPoints.includes(index)),
    remaining: afterPoints.filter(index => beforePoints.includes(index)),
    newlyMissed: afterPoints.filter(index => !beforePoints.includes(index)) }
}
