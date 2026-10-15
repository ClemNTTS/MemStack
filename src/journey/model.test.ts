import test from 'node:test'
import assert from 'node:assert/strict'
import curriculum from '../../docs/content/curriculum.json' with { type: 'json' }
import { catalogCourses, catalogLessons } from '../data/catalog/index.ts'
import { coursePrerequisites, getJourneyState, getChapterBadges, journeyChapters, journeyGoals, orderedCourseIds, validatePrerequisites } from './model.ts'
import type { LearningProgress } from '../types/progress.ts'

const now = new Date('2026-10-15T12:00:00Z')
const empty = (): LearningProgress => ({ version: 1, completedLessons: {}, cards: {}, history: [] })

test('profile and journey award the same complete chapter, never a partial or future completion', () => {
  const progress = empty()
  const chapter = journeyChapters[0]
  const lessons = chapter.courseIds.flatMap(id => catalogCourses.find(course => course.id === id)!.lessonIds)
  for (const id of lessons) progress.completedLessons[id] = now.toISOString()
  const award = () => getChapterBadges(progress,now).find(badge => badge.title === chapter.badgeTitle)!.unlocked
  assert.equal(award(),true)
  for (const goal of journeyGoals) assert.equal(getJourneyState({progress,activeCourseId:'data-reasoning',goalId:goal.id,now}).chapters.find(item => item.id === chapter.id)!.badgeEarned,award())
  progress.completedLessons[lessons[0]] = '2027-01-01T12:00:00.000Z'
  assert.equal(award(),false)
  delete progress.completedLessons[lessons[0]]
  assert.equal(award(),false)
})

test('reviewed graph matches every explicit curriculum reference, without omitted courses', () => {
  for (const course of curriculum.courses) {
    const references = [...course.prerequisites.matchAll(/`([^`]+)`/g)].map(match => match[1])
    assert.deepEqual(coursePrerequisites[course.id], references, course.id)
  }
  const ids = curriculum.courses.map(course => course.id).sort()
  assert.deepEqual([...new Set(journeyGoals.flatMap(goal => goal.courseIds))].sort(), ids)
  const chapters = journeyChapters.flatMap(chapter => chapter.courseIds)
  assert.equal(new Set(chapters).size, chapters.length)
  assert.deepEqual([...chapters].sort(), ids)
  for (const goal of journeyGoals) {
    for (const id of goal.courseIds) for (const prerequisite of coursePrerequisites[id]) {
      assert.ok(goal.courseIds.indexOf(prerequisite) < goal.courseIds.indexOf(id), `${goal.id}: ${prerequisite} before ${id}`)
    }
  }
  assert.ok(orderedCourseIds.indexOf('javascript-core') < orderedCourseIds.indexOf('browser-runtime'))
  assert.ok(orderedCourseIds.indexOf('javascript-async') < orderedCourseIds.indexOf('browser-runtime'))
})

test('graph rejects cycles, absent course entries and unknown prerequisites', () => {
  assert.throws(() => validatePrerequisites({ a: ['b'], b: ['a'] }, ['a', 'b']), /Cycle/)
  assert.throws(() => validatePrerequisites({ a: ['missing'] }, ['a']), /inconnu/)
  assert.throws(() => validatePrerequisites({ a: [] }, ['a', 'b']), /incomplet/)
})

test('active course is recommended without newly locking its unfinished prerequisites', () => {
  const state = getJourneyState({ progress: empty(), activeCourseId: 'browser-runtime', now })
  assert.equal(state.nextCourseId, 'browser-runtime')
  assert.ok(state.steps.find(step => step.courseId === 'browser-runtime')!.missingPrerequisiteIds.includes('javascript-async'))
  assert.equal(getJourneyState({ progress: empty(), activeCourseId: 'unknown', now }).nextCourseId, 'data-reasoning')
})

test('lesson completion selects next prerequisite-respecting step and ignores future or invalid records', () => {
  const progress = empty()
  const course = catalogCourses.find(entry => entry.id === 'data-reasoning')!
  for (const id of course.lessonIds) progress.completedLessons[id] = '2026-10-14T12:00:00Z'
  assert.equal(getJourneyState({ progress, activeCourseId: course.id, now }).nextCourseId, 'systems-basics')
  progress.completedLessons[course.lessonIds[0]] = '2027-01-01T12:00:00Z'
  progress.completedLessons[course.lessonIds[1]] = 'invalid'
  const step = getJourneyState({ progress, activeCourseId: course.id, now }).steps[0]
  assert.equal(step.completed, false)
  assert.equal(step.completedLessons, course.lessonIds.length - 2)
})

test('chapter badges reflect existing full chapter completion without mutation, XP or Premium locks', () => {
  const progress = empty()
  for (const courseId of journeyChapters[0].courseIds) {
    for (const id of catalogCourses.find(entry => entry.id === courseId)!.lessonIds) progress.completedLessons[id] = '2026-10-14T12:00:00Z'
  }
  const lesson = catalogLessons.find(entry => entry.id === catalogCourses[0].lessonIds[0])!
  progress.cards[lesson.cardIds[0]] = { cardId: lesson.cardIds[0], intervalDays: 1, lastReviewedAt: '2026-10-14T12:00:00Z', dueAt: '2026-10-15T12:00:00Z' }
  progress.cards[lesson.cardIds[1]] = { cardId: lesson.cardIds[1], intervalDays: 2, lastReviewedAt: '2026-10-14T12:00:00Z', dueAt: '2026-10-16T12:00:00Z' }
  const original = structuredClone(progress)
  const state = getJourneyState({ progress, activeCourseId: 'data-reasoning', now })
  assert.equal(state.chapters[0].badgeEarned, true)
  assert.equal(state.chapters[0].dueCards, 1)
  assert.equal(state.steps[0].learnedCards, 2)
  assert.equal(state.steps[0].completed, true)
  assert.deepEqual(progress, original)
  assert.equal('xp' in state, false)
})

test('completion of a goal cannot award a badge for omitted courses in a chapter', () => {
  const progress = empty()
  const goal = journeyGoals.find(entry => entry.id === 'api')!
  for (const courseId of goal.courseIds) {
    for (const id of catalogCourses.find(entry => entry.id === courseId)!.lessonIds) progress.completedLessons[id] = '2026-10-14T12:00:00Z'
  }
  const state = getJourneyState({ progress, activeCourseId: 'rest-design', goalId: 'api', now })
  assert.equal(state.nextCourseId, null)
  const chapter = state.chapters.find(entry => entry.id === 'building')!
  assert.equal(chapter.completed, true)
  assert.equal(chapter.badgeEarned, false)
})
