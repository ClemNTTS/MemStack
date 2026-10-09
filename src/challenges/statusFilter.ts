import type { ChallengeExamStatus } from './examSummary'

export function matchesExamStatus(filter: string, status: ChallengeExamStatus | undefined, ready: boolean) {
  return !ready || filter === 'all' || status === filter
}
