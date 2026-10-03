export type Card = {
  id: string
  question: string
  answer: string
}

export type CardRating = 'forgotten' | 'recalled'

export type CardResult = {
  cardId: string
  rating: CardRating
  reviewedAt: string
}

export type CardProgress = {
  cardId: string
  intervalDays: number
  lastReviewedAt: string
  dueAt: string
}
