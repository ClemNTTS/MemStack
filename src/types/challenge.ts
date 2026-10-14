export type ChallengeQuestion = {
  id: string
  prompt: string
  checkpointIndex: number
  options: { id: string, text: string }[]
}

export type CheckedChallengeResult = {
  feedback: string[]
  graderVersion: 'challenge-checks-v1'
  verdict: 'validated' | 'retry'
  correctCount: number
  totalCount: number
  criterionResults: boolean[]
  missedCheckpointIndices: number[]
}

export type Challenge = {
  questions?: ChallengeQuestion[]
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
  checkpointLessonIds?: string[][]
  counterexamples: string[]
  sources: { title: string, url: string }[]
  files: { name: string, description: string, language: string, content: string }[]
  rubricVersion: number
  acceptableAlternatives: string[]
}

export type ChallengeOutcome = '' | 'retry' | 'understood'

export type ChallengeAttempt = {
  id: string
  version: 1 | 2 | 3
  rubricVersion?: number
  selections?: Record<string, string>
  result?: CheckedChallengeResult
  challengeId: string
  challengeVersion: number
  answer: string
  submittedAt: string
  outcome: ChallengeOutcome
  observations?: string
  actions?: string
}

export type ChallengeAnalysis = {
  criterionResults?: boolean[]
  missedCheckpointIndices?: number[]
  verdict?: 'validated' | 'retry'
  status: 'processing' | 'completed' | 'failed' | 'needs_review'
  message: string
  challengeVersion: number
  rubricVersion: number
  model: string
  promptVersion: string
}
