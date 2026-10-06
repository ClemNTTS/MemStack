import assert from 'node:assert/strict'
import test from 'node:test'
import { applyLearningPreferencePatch, decodeLearningPreferences, migrateLearningPreferences } from './preferenceModel.ts'

const courseIds = new Set(['docker', 'typescript'])
const local = { activeCourseId: 'docker', dailyLessonGoal: 1 }
const cloud = { version: 1, activeCourseId: 'typescript', dailyLessonGoal: 3 }

test('first migration uses local preferences only when cloud document is absent', () => {
  assert.deepEqual(migrateLearningPreferences(undefined, local, courseIds), local)
  assert.deepEqual(migrateLearningPreferences(cloud, local, courseIds), { activeCourseId: 'typescript', dailyLessonGoal: 3 })
  // Existing cloud wins even if the local cache is invalid or stale.
  assert.deepEqual(migrateLearningPreferences(cloud, { activeCourseId: 'removed', dailyLessonGoal: 0 }, courseIds), { activeCourseId: 'typescript', dailyLessonGoal: 3 })
})

test('invalid existing cloud data is rejected rather than replaced by local defaults', () => {
  for (const value of [null, [], {}, { ...cloud, version: 2 }, { ...cloud, activeCourseId: 'removed' }, { ...cloud, extra: true }]) {
    assert.throws(() => migrateLearningPreferences(value, local, courseIds))
  }
})

test('goal validation accepts only whole numbers from one to ten', () => {
  for (const goal of [1, 10]) assert.equal(decodeLearningPreferences({ ...cloud, dailyLessonGoal: goal }, courseIds).dailyLessonGoal, goal)
  for (const goal of [0, 11, 1.5, NaN, Infinity, '3', undefined]) {
    assert.throws(() => decodeLearningPreferences({ ...cloud, dailyLessonGoal: goal }, courseIds))
  }
})

test('field patches preserve the latest preference changed by another device', () => {
  const courseUpdate = applyLearningPreferencePatch(cloud, { activeCourseId: 'docker' }, courseIds)
  assert.deepEqual(courseUpdate, { activeCourseId: 'docker', dailyLessonGoal: 3 })
  const goalUpdate = applyLearningPreferencePatch({ version: 1, ...courseUpdate }, { dailyLessonGoal: 4 }, courseIds)
  assert.deepEqual(goalUpdate, { activeCourseId: 'docker', dailyLessonGoal: 4 })
  assert.deepEqual(cloud, { version: 1, activeCourseId: 'typescript', dailyLessonGoal: 3 })
})

test('patch rejects unsupported fields, missing values and invalid courses before writing', () => {
  for (const patch of [{}, { activeCourseId: undefined }, { activeCourseId: 'removed' }, { dailyLessonGoal: 0 }, { version: 2 }]) {
    assert.throws(() => applyLearningPreferencePatch(cloud, patch, courseIds))
  }
})
