import assert from 'node:assert/strict'
import test from 'node:test'
import { catalogLessons } from '../data/catalog/index.ts'
import { emptyProgress } from '../progress/storage.ts'
import type { ReviewEvent } from '../types/progress.ts'
import { getRelearningSuggestions } from './catalogPlan.ts'
import { scheduleReview } from './schedule.ts'

const lesson = catalogLessons[0]
const cardId = lesson.cardIds[0]
const now = new Date(2026, 9, 8, 12)

function event(day: number, rating: 'forgotten' | 'recalled' = 'forgotten', kind: 'new' | 'review' = 'review', hour = 12): ReviewEvent {
  return { cardId, rating, kind, reviewedAt: new Date(2026, 9, day, hour).toISOString() }
}

function seededProgress(history: ReviewEvent[]) {
  const progress = emptyProgress()
  progress.completedLessons[lesson.id] = new Date(2026, 9, 1, 12).toISOString()
  progress.cards[cardId] = scheduleReview(event(1, 'recalled', 'new'))
  progress.history = history
  return progress
}

test('relearning requires two forgotten review days and reports the relevant completed lesson', () => {
  const suggestions = getRelearningSuggestions(seededProgress([event(5), event(3)]), now)
  assert.equal(suggestions.length, 1)
  assert.equal(suggestions[0].lesson.id, lesson.id)
  assert.equal(suggestions[0].forgottenCardCount, 1)
  assert.equal(suggestions[0].latestForgottenAt, event(5).reviewedAt)
})

test('multiple misses on the same local day and introductory misses do not trigger relearning', () => {
  assert.deepEqual(getRelearningSuggestions(seededProgress([event(3), event(3, 'forgotten', 'review', 18)]), now), [])
  assert.deepEqual(getRelearningSuggestions(seededProgress([event(3, 'forgotten', 'new'), event(5)]), now), [])
})

test('successful recall resets the repeated-forgetting signal', () => {
  assert.deepEqual(getRelearningSuggestions(seededProgress([event(3), event(5), event(6, 'recalled'), event(7)]), now), [])
  assert.equal(getRelearningSuggestions(seededProgress([event(2), event(3, 'recalled'), event(5), event(7)]), now).length, 1)
})

test('future events, unintroduced cards and unfinished lessons are ignored', () => {
  assert.deepEqual(getRelearningSuggestions(seededProgress([event(7), event(9)]), now), [])
  const progress = seededProgress([event(3), event(5)])
  delete progress.cards[cardId]
  assert.deepEqual(getRelearningSuggestions(progress, now), [])
  const unfinished = seededProgress([event(3), event(5)])
  delete unfinished.completedLessons[lesson.id]
  assert.deepEqual(getRelearningSuggestions(unfinished, now), [])
})

test('a newer card state waits for matching history before suggesting relearning', () => {
  const progress = seededProgress([event(3), event(5)])
  progress.cards[cardId] = scheduleReview(event(6, 'recalled'), progress.cards[cardId])
  assert.deepEqual(getRelearningSuggestions(progress, now), [])
  progress.history.push(event(6, 'recalled'))
  assert.deepEqual(getRelearningSuggestions(progress, now), [])

  progress.cards[cardId] = scheduleReview(event(7), progress.cards[cardId])
  assert.deepEqual(getRelearningSuggestions(progress, now), [])
  progress.history.push(event(7))
  assert.deepEqual(getRelearningSuggestions(progress, now), [])
})

test('suggestions prioritize struggling cards then recency and stop after three lessons', () => {
  const progress = emptyProgress()
  for (const [index, currentLesson] of catalogLessons.slice(0, 4).entries()) {
    progress.completedLessons[currentLesson.id] = event(1).reviewedAt
    const ids = index === 0 ? currentLesson.cardIds.slice(0, 2) : currentLesson.cardIds.slice(0, 1)
    for (const id of ids) {
      progress.cards[id] = scheduleReview({ ...event(1, 'recalled', 'new'), cardId: id })
      progress.history.push({ ...event(2), cardId: id }, { ...event(index + 3), cardId: id })
    }
  }
  assert.deepEqual(getRelearningSuggestions(progress, now).map(item => item.lesson.id), [catalogLessons[0].id, catalogLessons[3].id, catalogLessons[2].id])
})
