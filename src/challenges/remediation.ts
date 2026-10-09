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
