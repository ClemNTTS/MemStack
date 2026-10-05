import type { LearningProgress } from '../types/progress.ts'

export function accountProgressKey(uid: string) {
  return `memstack.account.v1.${uid}`
}

export function mergeProgress(first: LearningProgress, second: LearningProgress): LearningProgress {
  const completedLessons = { ...first.completedLessons }
  for (const [id, date] of Object.entries(second.completedLessons)) {
    if (!completedLessons[id] || Date.parse(date) < Date.parse(completedLessons[id])) completedLessons[id] = date
  }
  const cards = { ...first.cards }
  for (const [id, card] of Object.entries(second.cards)) {
    if (!cards[id] || Date.parse(card.lastReviewedAt) > Date.parse(cards[id].lastReviewedAt)
      || (card.lastReviewedAt === cards[id].lastReviewedAt && Date.parse(card.dueAt) < Date.parse(cards[id].dueAt))) cards[id] = card
  }
  const events = new Map([...first.history, ...second.history].map((event) => [reviewEventId(event), event]))
  return { version: 1, completedLessons, cards, history: [...events.values()].sort((a, b) => Date.parse(a.reviewedAt) - Date.parse(b.reviewedAt)) }
}

export function reviewEventId(event: LearningProgress['history'][number]) {
  return encodeURIComponent(`${event.cardId}_${event.reviewedAt}_${event.kind}_${event.rating}`)
}
