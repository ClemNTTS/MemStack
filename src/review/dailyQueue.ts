import type { Card } from '../types/card.ts'
import type { LearningProgress, ReviewKind } from '../types/progress.ts'

export type SessionCard = { card: Card, kind: ReviewKind }

export function localDay(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function createDailyQueue(cards: Card[], lessonCardIds: string[], progress: LearningProgress, now = new Date()): SessionCard[] {
  const uniqueCards = [...new Map(cards.map(card => [card.id, card])).values()]
  const newCards = [...new Set(lessonCardIds)].filter((id) => !Object.hasOwn(progress.cards, id)).map((id) => {
    const card = cards.find((candidate) => candidate.id === id)
    if (!card) throw new Error(`Carte introuvable : ${id}`)
    return { card, kind: 'new' as const }
  })
  const due = uniqueCards.filter((card) => {
    const state = progress.cards[card.id]
    return state && Date.parse(state.dueAt) <= now.getTime()
  }).sort((a, b) => Date.parse(progress.cards[a.id].dueAt) - Date.parse(progress.cards[b.id].dueAt))
    .slice(0, 5)
    .map((card) => ({ card, kind: 'review' as const }))
  return [...newCards, ...due]
}
