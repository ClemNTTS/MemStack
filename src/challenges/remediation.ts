import type { Challenge, ChallengeAnalysis, ChallengeAttempt } from '../types/challenge'

export function needsChallengeRevision(challenge: Challenge, attempt: ChallengeAttempt, analysis: ChallengeAnalysis | null) {
  return attempt.version === 2 && attempt.challengeId === challenge.id
    && attempt.challengeVersion === challenge.version
    && analysis?.challengeVersion === challenge.version
    && analysis.rubricVersion === challenge.rubricVersion
    && analysis.status === 'completed' && analysis.verdict === 'retry'
}

export function revisionChallenge(lessonId: string, challengeId: string | null, challenges: Challenge[]) {
  return challenges.find(challenge => challenge.id === challengeId && challenge.lessonIds.includes(lessonId))
}

export function targetedRevision(challenge: Challenge, analysis: ChallengeAnalysis | null) {
  if (analysis?.status !== 'completed' || analysis.promptVersion !== 'challenge-feedback-v4' || analysis.verdict !== 'retry' || analysis.challengeVersion !== challenge.version || analysis.rubricVersion !== challenge.rubricVersion || !analysis.missedCheckpointIndices?.length) return null
  const indices = analysis.missedCheckpointIndices
  if (indices.some(index => !Number.isInteger(index) || index < 0 || index >= challenge.checkpoints.length) || new Set(indices).size !== indices.length) return null
  const points = indices.map(index => ({ index, text: challenge.checkpoints[index] }))
  const lessonIds = [...new Set(indices.flatMap(index => challenge.checkpointLessonIds?.[index] ?? (challenge.lessonIds.length === 1 ? challenge.lessonIds : [])))].filter(id => challenge.lessonIds.includes(id))
  return { points, lessonIds }
}
