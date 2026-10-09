import assert from 'node:assert/strict'
import test from 'node:test'
import { getChallengeThemeProgress } from './themeAccess.ts'

const courses = [
  { id: 'first', title: 'Premier', theme: 'Web', lessonIds: ['a', 'b'] },
  { id: 'second', title: 'Deuxième', theme: 'Web', lessonIds: ['c'] },
  { id: 'other', title: 'Autre', theme: 'Données', lessonIds: ['d'] },
]
const challenge = { courseId: 'first' }

test('a completed course or challenge prerequisites do not unlock an incomplete theme', () => {
  const result = getChallengeThemeProgress(challenge, courses, { a: 'date', b: 'date', d: 'date' })
  assert.equal(result.unlocked, false)
  assert.equal(result.completed, 2)
  assert.equal(result.total, 3)
  assert.deepEqual(result.courseIds, ['first', 'second'])
})

test('all lessons in the theme unlock its challenges without other themes', () => {
  assert.equal(getChallengeThemeProgress(challenge, courses, { a: 'date', b: 'date', c: 'date' }).unlocked, true)
})

test('unknown and empty themes remain locked', () => {
  assert.equal(getChallengeThemeProgress({ courseId: 'missing' }, courses, {}).unlocked, false)
  assert.equal(getChallengeThemeProgress(challenge, [{ ...courses[0], lessonIds: [] }], {}).unlocked, false)
})

test('inherited completion entries cannot unlock lessons', () => {
  assert.equal(getChallengeThemeProgress(challenge, courses, Object.create({ a: 'date', b: 'date', c: 'date' })).unlocked, false)
})
