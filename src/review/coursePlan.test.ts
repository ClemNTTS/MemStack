import assert from 'node:assert/strict'
import test from 'node:test'
import { dockerCourse, dockerLessons } from '../data/dockerCourse.ts'
import { cards } from '../data/cards.ts'
import { indexLessonSteps } from '../lesson/lessonFlow.ts'
import { emptyProgress, decodeProgress } from '../progress/storage.ts'
import { planCourse } from './coursePlan.ts'
import { scheduleReview } from './schedule.ts'
import { createDailyQueue } from './dailyQueue.ts'

const dayOne = new Date(2026, 9, 5, 12)
const dayTwo = new Date(2026, 9, 6, 12)
const dayThree = new Date(2026, 9, 7, 12)

function finishLesson(progress: ReturnType<typeof emptyProgress>, index: number, now: Date) {
  const lesson = dockerLessons[index]
  progress.completedLessons[lesson.id] = now.toISOString()
  for (const cardId of lesson.cardIds) {
    progress.cards[cardId] = scheduleReview({ cardId, rating: 'recalled', reviewedAt: now.toISOString() })
  }
}

test('three real lessons have valid routes, stable identifiers and three distinct cards each', () => {
  assert.equal(new Set(dockerLessons.map((lesson) => lesson.id)).size, 3)
  assert.equal(new Set(cards.map((card) => card.id)).size, 9)
  for (const lesson of dockerLessons) {
    assert.doesNotThrow(() => indexLessonSteps(lesson))
    assert.equal(lesson.cardIds.length, 3)
    assert.equal(new Set(lesson.cardIds).size, 3)
    assert.ok(lesson.cardIds.every((id) => cards.some((card) => card.id === id)))
  }
})

test('ordered progression allows one completed lesson per local day, including after reload', () => {
  let progress = emptyProgress()
  assert.equal(planCourse(dockerCourse, dockerLessons, progress, dayOne).lesson?.id, dockerLessons[0].id)
  finishLesson(progress, 0, dayOne)
  progress = decodeProgress(JSON.stringify(progress))
  const sameDay = planCourse(dockerCourse, dockerLessons, progress, dayOne)
  assert.equal(sameDay.lesson, undefined)
  assert.equal(sameDay.completedCount, 1)
  assert.equal(sameDay.nextLesson?.id, dockerLessons[1].id)
  assert.equal(planCourse(dockerCourse, dockerLessons, progress, dayTwo).lesson?.id, dockerLessons[1].id)
  finishLesson(progress, 1, dayTwo)
  assert.equal(planCourse(dockerCourse, dockerLessons, progress, dayTwo).lesson, undefined)
  assert.equal(planCourse(dockerCourse, dockerLessons, progress, dayThree).lesson?.id, dockerLessons[2].id)
  finishLesson(progress, 2, dayThree)
  assert.equal(planCourse(dockerCourse, dockerLessons, progress, dayThree).completedCount, 3)
  assert.equal(planCourse(dockerCourse, dockerLessons, progress, dayThree).nextLesson, undefined)
  assert.ok(createDailyQueue(cards, [], progress, new Date(2026, 9, 8, 12)).length > 0)
})

test('unfinished cards resume before the next lesson, even on the next day', () => {
  const progress = emptyProgress()
  progress.completedLessons[dockerLessons[0].id] = dayOne.toISOString()
  const plan = planCourse(dockerCourse, dockerLessons, progress, dayTwo)
  assert.equal(plan.lesson, undefined)
  assert.deepEqual(plan.pendingCardIds, dockerLessons[0].cardIds)
  const queue = createDailyQueue(cards, plan.pendingCardIds, progress, dayTwo)
  assert.equal(queue.length, 3)
  assert.ok(queue.every((item) => item.kind === 'new'))
  finishLesson(progress, 0, dayOne)
  assert.equal(planCourse(dockerCourse, dockerLessons, progress, dayTwo).lesson?.id, dockerLessons[1].id)
})

test('legacy image lesson progress remains valid without resetting stored data', () => {
  const progress = emptyProgress()
  finishLesson(progress, 0, dayOne)
  assert.equal(planCourse(dockerCourse, dockerLessons, decodeProgress(JSON.stringify(progress)), dayTwo).completedCount, 1)
})

test('daily limit uses the local date rather than elapsed 24 hours', () => {
  const progress = emptyProgress()
  finishLesson(progress, 0, new Date(2026, 9, 5, 23, 59))
  assert.equal(planCourse(dockerCourse, dockerLessons, progress, new Date(2026, 9, 6, 0, 1)).lesson?.id, dockerLessons[1].id)
})

test('invalid course references are reported', () => {
  assert.throws(() => planCourse({ ...dockerCourse, lessonIds: ['missing'] }, dockerLessons, emptyProgress(), dayOne))
  assert.throws(() => planCourse({ ...dockerCourse, lessonIds: [dockerLessons[0].id, dockerLessons[0].id] }, dockerLessons, emptyProgress(), dayOne))
})
