import assert from 'node:assert/strict'
import test from 'node:test'
import { getChallengeThemeProgress } from './themeAccess.ts'
import { catalogCourses } from '../data/catalog/index.ts'
import { challenges } from '../data/challenges.ts'

const courses = [
  { id: 'first', title: 'Premier', theme: 'Web', lessonIds: ['a', 'b'] },
  { id: 'second', title: 'Deuxième', theme: 'Web', lessonIds: ['c'] },
  { id: 'other', title: 'Autre', theme: 'Données', lessonIds: ['d'] },
]
const challenge = { courseId: 'first', lessonIds: ['a'] }

test('prerequisites and two theme lessons unlock without completing the whole theme', () => {
  assert.equal(getChallengeThemeProgress(challenge, courses, {}).unlocked, false)
  assert.equal(getChallengeThemeProgress(challenge, courses, { a: 'date', d: 'date' }).unlocked, false)
  const result = getChallengeThemeProgress(challenge, courses, { a: 'date', b: 'date' })
  assert.equal(result.unlocked, true)
  assert.equal(result.completed, 2)
  assert.equal(result.total, 3)
  assert.equal(result.minimumCompleted, 2)
  assert.deepEqual(result.courseIds, ['first', 'second'])
})

test('advanced prerequisites remain mandatory after the minimum threshold', () => {
  const result = getChallengeThemeProgress({ courseId: 'second', lessonIds: ['c'] }, courses, { a: 'date', b: 'date' })
  assert.equal(result.unlocked, false)
  assert.deepEqual(result.missingLessonIds, ['c'])
  assert.equal(result.requiredCompleted, 0)
  assert.equal(result.requiredTotal, 1)
})

test('unknown courses, empty or invalid prerequisites fail closed', () => {
  for (const dossier of [{ courseId: 'missing', lessonIds: ['a'] }, { ...challenge, lessonIds: [] }, { ...challenge, lessonIds: ['d'] }]) {
    assert.equal(getChallengeThemeProgress(dossier, courses, { a: 'date', b: 'date', d: 'date' }).unlocked, false)
  }
  assert.equal(getChallengeThemeProgress(challenge, [{ ...courses[0], lessonIds: [] }], {}).unlocked, false)
})

test('inherited completions are ignored and singleton themes require their one lesson', () => {
  assert.equal(getChallengeThemeProgress(challenge, courses, Object.create({ a: 'date', b: 'date' })).unlocked, false)
  assert.equal(getChallengeThemeProgress({ courseId: 'other', lessonIds: ['d'] }, courses, { d: 'date' }).unlocked, true)
})

test('every published theme offers a challenge before full completion and within five lessons', () => {
  for (const theme of new Set(catalogCourses.map(course => course.theme))) {
    const themeCourses = catalogCourses.filter(course => course.theme === theme)
    const ids = themeCourses.flatMap(course => course.lessonIds)
    const firstLessons = ids.slice(0, Math.min(5, ids.length - 1))
    const progress = Object.fromEntries(firstLessons.map(id => [id, 'date']))
    assert.ok(challenges.some(dossier => getChallengeThemeProgress(dossier, catalogCourses, progress).theme === theme && getChallengeThemeProgress(dossier, catalogCourses, progress).unlocked), theme)
  }
})
