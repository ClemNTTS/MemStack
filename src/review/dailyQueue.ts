import type { Card } from '../types/card.ts'
import type { LearningProgress, ReviewKind } from '../types/progress.ts'

export type SessionCard = { card: Card, kind: ReviewKind }

export function localDay(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function createDailyQueue(cards: Card[], lessonCardIds: string[], progress: LearningProgress, now = new Date()): SessionCard[] {
  const newCards = lessonCardIds.filter((id) => !Object.hasOwn(progress.cards, id)).map((id) => {
    const card = cards.find((candidate) => candidate.id === id)
    if (!card) throw new Error(`Carte introuvable : ${id}`)
    return { card, kind: 'new' as const }
  })
  const reviewedToday = new Set(progress.history
    .filter((event) => event.kind === 'review' && localDay(new Date(event.reviewedAt)) === localDay(now))
    .map((event) => event.cardId))
  const due = cards.filter((card) => {
    const state = progress.cards[card.id]
    return state && Date.parse(state.dueAt) <= now.getTime() && !reviewedToday.has(card.id)
  }).sort((a, b) => Date.parse(progress.cards[a.id].dueAt) - Date.parse(progress.cards[b.id].dueAt))
    .slice(0, Math.max(0, 5 - reviewedToday.size))
    .map((card) => ({ card, kind: 'review' as const }))
  return [...newCards, ...due]
}
