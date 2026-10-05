import type { LearningProgress } from '../types/progress.ts'

export const progressKey = 'memstack.progress.v1'

export function emptyProgress(): LearningProgress {
  return { version: 1, completedLessons: {}, cards: {}, history: [] }
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function date(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

export function decodeProgress(raw: string | null): LearningProgress {
  if (raw === null) return emptyProgress()
  const value: unknown = JSON.parse(raw)
  if (!record(value) || value.version !== 1 || !record(value.completedLessons) || !record(value.cards) || !Array.isArray(value.history)) {
    throw new Error('Format de progression invalide')
  }
  if (!Object.values(value.completedLessons).every(date)
    || !Object.entries(value.cards).every(([id, card]) => record(card) && card.cardId === id
      && typeof card.intervalDays === 'number' && Number.isInteger(card.intervalDays) && card.intervalDays >= 1 && card.intervalDays <= 365
      && date(card.lastReviewedAt) && date(card.dueAt))
    || !value.history.every((event) => record(event) && typeof event.cardId === 'string'
      && (event.rating === 'recalled' || event.rating === 'forgotten')
      && (event.kind === 'new' || event.kind === 'review') && date(event.reviewedAt))) {
    throw new Error('Progression locale endommagée')
  }
  return value as LearningProgress
}

export function loadProgress(): LearningProgress {
  return decodeProgress(window.localStorage.getItem(progressKey))
}

export function saveProgress(progress: LearningProgress): void {
  window.localStorage.setItem(progressKey, JSON.stringify(progress))
}
