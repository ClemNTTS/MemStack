import type { CardProgress, CardResult } from '../types/card.ts'

const dayMs = 24 * 60 * 60 * 1000

export function scheduleReview(result: CardResult, previous?: CardProgress): CardProgress {
  const reviewedAt = Date.parse(result.reviewedAt)
  const elapsedDays = previous
    ? Math.max(0, (reviewedAt - Date.parse(previous.lastReviewedAt)) / dayMs)
    : 0
  const intervalDays = result.rating === 'forgotten' || !previous
    ? 1
    : Math.min(365, Math.max(previous.intervalDays, Math.floor(elapsedDays * 2)))

  return {
    cardId: result.cardId,
    intervalDays,
    lastReviewedAt: result.reviewedAt,
    dueAt: new Date(reviewedAt + intervalDays * dayMs).toISOString(),
  }
}
