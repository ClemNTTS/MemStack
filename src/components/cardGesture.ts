import type { CardRating } from '../types/card.ts'

export function getSwipeRating(dx: number, dy: number): CardRating | undefined {
  if (Math.abs(dx) < 60 || Math.abs(dx) <= Math.abs(dy)) return undefined
  return dx < 0 ? 'forgotten' : 'recalled'
}
