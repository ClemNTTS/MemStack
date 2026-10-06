export type Challenge = {
  id: string
  version: number
  title: string
  courseId: string
  lessonIds: string[]
  estimatedMinutes: number
  scenario: string
  prompt: string
  correction: string
  checkpoints: string[]
  counterexamples: string[]
  sources: { title: string, url: string }[]
}

export type ChallengeOutcome = '' | 'retry' | 'understood'

export type ChallengeAttempt = {
  id: string
  version: 1
  challengeId: string
  challengeVersion: number
  answer: string
  submittedAt: string
  outcome: ChallengeOutcome
}
