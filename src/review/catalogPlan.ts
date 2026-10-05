import { catalogCards, catalogLessons } from '../data/catalog/index.ts'
import type { Course } from '../types/course.ts'
import type { LearningProgress } from '../types/progress.ts'
import { planCourse } from './coursePlan.ts'
import { createDailyQueue, localDay } from './dailyQueue.ts'

export type LearningMode = 'today' | 'reviews'

function pendingLearningCards(progress: LearningProgress): string[] {
  return [...new Set(catalogLessons
    .filter(lesson => Object.hasOwn(progress.completedLessons, lesson.id))
    .flatMap(lesson => lesson.cardIds))]
    .filter(id => !Object.hasOwn(progress.cards, id))
}

export function planLearning(course: Course, progress: LearningProgress, now = new Date()) {
  const plan = planCourse(course, catalogLessons, progress, now)
  const pendingCardIds = pendingLearningCards(progress)
  return {
    ...plan,
    pendingCardIds,
    lesson: plan.nextLesson,
  }
}

export function createLearningQueue(progress: LearningProgress, mode: LearningMode = 'today', now = new Date()) {
  return createDailyQueue(catalogCards, mode === 'today' ? pendingLearningCards(progress) : [], progress, now)
}

export function getRelearningSuggestions(progress: LearningProgress, now = new Date()) {
  const forgottenCards = new Map<string, string>()
  const eventsByCard = new Map<string, LearningProgress['history']>()
  const latestKnownEvent = new Map<string, number>()
  for (const event of progress.history) {
    const reviewedAt = Date.parse(event.reviewedAt)
    if (!Object.hasOwn(progress.cards, event.cardId) || reviewedAt > now.getTime()) continue
    latestKnownEvent.set(event.cardId, Math.max(latestKnownEvent.get(event.cardId) ?? -Infinity, reviewedAt))
    if (event.kind !== 'review') continue
    const events = eventsByCard.get(event.cardId) ?? []
    events.push(event)
    eventsByCard.set(event.cardId, events)
  }
  for (const [cardId, events] of eventsByCard) {
    // A newer card state can arrive before its Firestore history event.
    if (Date.parse(progress.cards[cardId].lastReviewedAt) > (latestKnownEvent.get(cardId) ?? -Infinity)) continue
    const ordered = [...events].sort((a, b) => Date.parse(a.reviewedAt) - Date.parse(b.reviewedAt))
    let lastRecall = -1
    ordered.forEach((event, index) => { if (event.rating === 'recalled') lastRecall = index })
    const forgotten = ordered.slice(lastRecall + 1).filter(event => event.rating === 'forgotten')
    const days = new Set(forgotten.map(event => localDay(new Date(event.reviewedAt))))
    if (days.size >= 2) forgottenCards.set(cardId, forgotten[forgotten.length - 1].reviewedAt)
  }
  return catalogLessons
    .filter(lesson => Object.hasOwn(progress.completedLessons, lesson.id))
    .map(lesson => {
      const dates = lesson.cardIds.flatMap(id => forgottenCards.has(id) ? [forgottenCards.get(id)!] : [])
      return {
        lesson,
        forgottenCardCount: dates.length,
        latestForgottenAt: dates.sort((a, b) => Date.parse(b) - Date.parse(a))[0],
      }
    })
    .filter(suggestion => suggestion.forgottenCardCount > 0)
    .sort((a, b) => b.forgottenCardCount - a.forgottenCardCount || Date.parse(b.latestForgottenAt) - Date.parse(a.latestForgottenAt))
    .slice(0, 3)
}
