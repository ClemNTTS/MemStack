import assert from 'node:assert/strict'
import test from 'node:test'
import { catalogCards, catalogCourses, catalogLessons } from '../data/catalog/index.ts'
import { cards as legacyCards } from '../data/cards.ts'
import { dockerCourse, dockerLessons } from '../data/dockerCourse.ts'
import { decodeProgress, emptyProgress } from '../progress/storage.ts'
import type { LearningProgress } from '../types/progress.ts'
import { createCompletedLessonQueue, createLearningQueue, planLearning } from './catalogPlan.ts'
import { scheduleReview } from './schedule.ts'

const previousDay = new Date(2026, 9, 5, 12)
const today = new Date(2026, 9, 6, 12)
const nextDay = new Date(2026, 9, 7, 12)
const javascript = catalogCourses.find(course => course.lessonIds.includes('js-scope'))!
const javascriptLesson = catalogLessons.find(lesson => lesson.id === 'js-scope')!

test('lesson completion immediately queues only its undiscovered cards', () => {
  const progress = emptyProgress()
  assert.deepEqual(createCompletedLessonQueue(javascriptLesson, progress), [])
  progress.completedLessons[javascriptLesson.id] = today.toISOString()
  progress.completedLessons[dockerLessons[0].id] = previousDay.toISOString()
  const knownId = javascriptLesson.cardIds[0]
  progress.cards[knownId] = scheduleReview({ cardId: knownId, rating: 'recalled', reviewedAt: previousDay.toISOString() })
  const queue = createCompletedLessonQueue(javascriptLesson, progress)
  assert.deepEqual(queue.map(item => item.card.id), javascriptLesson.cardIds.slice(1))
  assert.ok(queue.every(item => item.kind === 'new'))
  completeWithCards(progress, javascriptLesson.id, today)
  assert.deepEqual(createCompletedLessonQueue(javascriptLesson, progress), [])
})

function completeWithCards(progress: LearningProgress, lessonId: string, at: Date) {
  const lesson = catalogLessons.find(candidate => candidate.id === lessonId)!
  progress.completedLessons[lesson.id] = at.toISOString()
  for (const cardId of lesson.cardIds) {
    progress.cards[cardId] = scheduleReview({ cardId, rating: 'recalled', reviewedAt: at.toISOString() })
  }
}

test('switching courses keeps discovery available on the same day, including after reload', () => {
  const progress = emptyProgress()
  completeWithCards(progress, dockerLessons[0].id, today)
  const restored = decodeProgress(JSON.stringify(progress))
  const plan = planLearning(javascript, restored, today)
  assert.equal(plan.completedCount, 0)
  assert.equal(plan.nextLesson?.id, javascriptLesson.id)
  assert.equal(plan.learnedToday, true)
  assert.equal(plan.lesson?.id, javascriptLesson.id)
  assert.equal(planLearning(javascript, restored, nextDay).lesson?.id, javascriptLesson.id)
})

test('unfinished cards from another course remain available without blocking discovery', () => {
  const progress = emptyProgress()
  progress.completedLessons[dockerLessons[0].id] = previousDay.toISOString()
  const firstCard = dockerLessons[0].cardIds[0]
  progress.cards[firstCard] = scheduleReview({ cardId: firstCard, rating: 'recalled', reviewedAt: previousDay.toISOString() })
  const plan = planLearning(javascript, progress, today)
  assert.equal(plan.learnedToday, false)
  assert.equal(plan.lesson?.id, javascriptLesson.id)
  assert.deepEqual(plan.pendingCardIds, dockerLessons[0].cardIds.slice(1))
  const queue = createLearningQueue(progress, 'today', today)
  assert.deepEqual(queue.filter(item => item.kind === 'new').map(item => item.card.id), plan.pendingCardIds)
  completeWithCards(progress, dockerLessons[0].id, previousDay)
  assert.equal(planLearning(javascript, progress, today).lesson?.id, javascriptLesson.id)
})

test('successive review sessions combine due cards across courses in batches of five', () => {
  const progress = emptyProgress()
  completeWithCards(progress, dockerLessons[0].id, previousDay)
  completeWithCards(progress, javascriptLesson.id, previousDay)
  const queue = createLearningQueue(progress, 'reviews', today)
  assert.equal(queue.length, 5)
  assert.ok(queue.every(item => item.kind === 'review'))
  assert.ok(queue.some(item => dockerLessons[0].cardIds.includes(item.card.id)))
  assert.ok(queue.some(item => javascriptLesson.cardIds.includes(item.card.id)))

  for (const item of queue) {
    const result = { cardId: item.card.id, rating: 'forgotten' as const, reviewedAt: today.toISOString() }
    progress.cards[item.card.id] = scheduleReview(result, progress.cards[item.card.id])
    progress.history.push({ ...result, kind: 'review' })
  }
  const remaining = createLearningQueue(progress, 'reviews', today)
  assert.equal(remaining.length, 1)
  assert.ok(remaining.every(item => !queue.some(reviewed => reviewed.card.id === item.card.id)))
  for (const item of remaining) {
    const result = { cardId: item.card.id, rating: 'recalled' as const, reviewedAt: today.toISOString() }
    progress.cards[item.card.id] = scheduleReview(result, progress.cards[item.card.id])
    progress.history.push({ ...result, kind: 'review' })
  }
  assert.equal(createLearningQueue(decodeProgress(JSON.stringify(progress)), 'reviews', today).length, 0)
  assert.equal(createLearningQueue(progress, 'reviews', nextDay).length, 5)
})

test('reviews never introduce pending or unlearned cards; today resumes pending cards first', () => {
  const progress = emptyProgress()
  completeWithCards(progress, dockerLessons[0].id, previousDay)
  progress.completedLessons[javascriptLesson.id] = previousDay.toISOString()
  const reviews = createLearningQueue(progress, 'reviews', today)
  assert.equal(reviews.length, 3)
  assert.ok(reviews.every(item => item.kind === 'review' && dockerLessons[0].cardIds.includes(item.card.id)))
  const mixed = createLearningQueue(progress, 'today', today)
  assert.deepEqual(mixed.slice(0, 3).map(item => item.card.id), javascriptLesson.cardIds)
  assert.ok(mixed.slice(0, 3).every(item => item.kind === 'new'))
  assert.ok(mixed.slice(3).every(item => item.kind === 'review'))
  assert.ok(mixed.every(item => !dockerLessons[1].cardIds.includes(item.card.id)))
})

test('legacy Docker IDs still plan the next lesson without resetting progress', () => {
  const progress = emptyProgress()
  completeWithCards(progress, dockerLessons[0].id, previousDay)
  const restored = decodeProgress(JSON.stringify(progress))
  const plan = planLearning(dockerCourse, restored, today)
  assert.equal(plan.completedCount, 1)
  assert.equal(plan.lesson?.id, dockerLessons[1].id)
  for (const card of legacyCards) {
    assert.ok(catalogCards.some(candidate => candidate.id === card.id))
  }
  assert.deepEqual(catalogLessons.find(lesson => lesson.id === dockerLessons[0].id)?.cardIds, dockerLessons[0].cardIds)
})
