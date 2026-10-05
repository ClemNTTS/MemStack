import type { CardProgress, CardResult } from './card'

export type ReviewKind = 'new' | 'review'
export type ReviewEvent = CardResult & { kind: ReviewKind }

export type LearningProgress = {
  version: 1
  completedLessons: Record<string, string>
  cards: Record<string, CardProgress>
  history: ReviewEvent[]
}
