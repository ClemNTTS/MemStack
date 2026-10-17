import test from 'node:test'
import assert from 'node:assert/strict'
import { enterprisePlan, enterpriseRewards, enterpriseScope } from './model.ts'
import { enterpriseCards, enterpriseChapters, enterpriseLessons, enterpriseTracks, enterpriseCurriculum } from '../data/enterprise.ts'
import type { EnterpriseWorkspace } from '../types/enterprise.ts'
import type { CardProgress } from '../types/card.ts'

const now = Date.parse('2026-10-15T12:00:00.000Z')
const past = '2026-10-14T12:00:00.000Z'
const future = '2026-10-16T12:00:00.000Z'
const empty = (): EnterpriseWorkspace['progress'] => ({ lessons: {}, cards: {}, reviews: [], attempts: [] })
const state = (cardId: string, dueAt: string, lastReviewedAt = past): CardProgress => ({ cardId, dueAt, lastReviewedAt, intervalDays: 1 })

test('enterprise revisions include only cards from completed enterprise lessons, never developer or future content', () => {
  const progress = empty()
  const [first, next] = enterprisePlan(progress, now).guided
  progress.lessons[first.id] = { completedAt: past }
  progress.lessons[next.id] = { completedAt: future }
  progress.lessons['docker-images'] = { completedAt: past }
  progress.cards['docker-card'] = state('docker-card', past)
  const plan = enterprisePlan(progress, now)
  assert.equal(plan.completed, 1)
  assert.equal(plan.next?.id, next.id)
  assert.deepEqual(plan.pending.map(item => item.card.id), first.cards.map(card => card.id))
  assert.equal(plan.due.length, 0)
  assert.ok(plan.pending.every(item => item.card.id.startsWith('ent-')))
})

test('enterprise due queue uses real due dates and ignores invalid or future review timestamps', () => {
  const progress = empty()
  for (const lesson of enterpriseLessons) progress.lessons[lesson.id] = { completedAt: past }
  const [older, newer, tomorrow, badReview, futureReview] = enterpriseCards
  for (const card of enterpriseCards) progress.cards[card.id] = state(card.id, future)
  progress.cards[older.id] = state(older.id, '2026-10-13T12:00:00.000Z')
  progress.cards[newer.id] = state(newer.id, past)
  progress.cards[tomorrow.id] = state(tomorrow.id, future)
  progress.cards[badReview.id] = state(badReview.id, past, 'invalid')
  progress.cards[futureReview.id] = state(futureReview.id, past, future)
  const plan = enterprisePlan(progress, now)
  assert.deepEqual(plan.due.map(item => item.card.id), [older.id, newer.id])
  assert.equal(plan.pending.length, 0)
})

test('finishing one practical path preserves revisions without completing or starting another path', () => {
  const progress = empty()
  const track = enterpriseTracks[0]
  const guided = enterprisePlan(progress, now, track.id).guided
  assert.equal(guided.length, (enterpriseCurriculum.foundationLessonIds?.length ?? 0) + track.lessonIds.length)
  for (const lesson of guided) progress.lessons[lesson.id] = { completedAt: past }
  let plan = enterprisePlan(progress, now, track.id)
  assert.equal(plan.completed, guided.length)
  assert.equal(plan.next, undefined)
  assert.equal(plan.pending.length, guided.reduce((sum, lesson) => sum + lesson.cards.length, 0))
  const other = enterprisePlan(progress, now, enterpriseTracks[1].id)
  assert.equal(other.next?.id, enterpriseTracks[1].lessonIds[0])
  assert.equal(other.completed, enterpriseCurriculum.foundationLessonIds?.length)
  const card = guided[0].cards[0]
  progress.cards[card.id] = state(card.id, past)
  plan = enterprisePlan(progress, now, track.id)
  assert.equal(plan.next, undefined)
  assert.equal(plan.due[0].card.id, card.id)
  assert.ok(plan.pending.length > 0)
})

test('enterprise local request scopes separate identities and organizations', () => {
  assert.notEqual(enterpriseScope('same-user', 'org-a'), enterpriseScope('same-user', 'org-b'))
  assert.notEqual(enterpriseScope('first-user', 'org-a'), enterpriseScope('other-user', 'org-a'))
})

test('track selection changes recommendations without sharing completion or skipping prerequisites', () => {
  const progress = empty()
  const foundation = enterpriseCurriculum.foundationLessonIds!
  const first = enterpriseTracks[0]
  const second = enterpriseTracks[1]
  const firstMission = enterpriseLessons.find(lesson => lesson.id === first.lessonIds[0])!
  const secondMission = enterpriseLessons.find(lesson => lesson.id === second.lessonIds[0])!
  assert.equal(enterprisePlan(progress, now, first.id).available(firstMission), false)
  for (const id of foundation) progress.lessons[id] = { completedAt: past }
  let plan = enterprisePlan(progress, now, second.id)
  assert.equal(plan.next?.id, secondMission.id)
  assert.equal(plan.available(firstMission), true)
  assert.equal(plan.available(secondMission), true)
  progress.lessons[firstMission.id] = { completedAt: past }
  assert.equal(enterprisePlan(progress, now, first.id).completed, foundation.length + 1)
  assert.equal(enterprisePlan(progress, now, second.id).completed, foundation.length)
  progress.lessons[foundation.at(-1)!] = { completedAt: future }
  plan = enterprisePlan(progress, now, second.id)
  assert.equal(plan.available(secondMission), false)
  assert.equal(plan.next?.id, foundation.at(-1))
})

test('enterprise rewards count known acknowledged progress, never unknown, future or repeated review entries', () => {
  const progress = empty()
  const lesson = enterpriseLessons[0]
  const card = lesson.cards[0]
  progress.lessons[lesson.id] = { completedAt: past }
  progress.lessons[enterpriseLessons[1].id] = { completedAt: future }
  progress.lessons['docker-images'] = { completedAt: past }
  progress.cards[card.id] = state(card.id, future)
  progress.cards[lesson.cards[1].id] = state(lesson.cards[1].id, future, future)
  progress.cards['docker-card'] = state('docker-card', past)
  const rewards = enterpriseRewards(progress, now)
  assert.equal(rewards.xp, 50)
  assert.equal(rewards.level, 1)
  assert.equal(rewards.next, 150)
  progress.reviews = Array.from({length:50}, () => ({ cardId: card.id, rating: 'recalled', reviewedAt: past, kind: 'review' }))
  assert.deepEqual(enterpriseRewards(progress, now), rewards)
})

test('enterprise chapter badges require every guided mission and are independent between organization snapshots', () => {
  const organizationA = empty()
  const organizationB = empty()
  const chapter = enterpriseChapters[0]
  const lessons = enterpriseLessons.filter(lesson => lesson.chapterId === chapter.id && !lesson.continuous)
  for (const lesson of lessons) organizationA.lessons[lesson.id] = { completedAt: past }
  assert.equal(enterpriseRewards(organizationA, now).badges.find(badge => badge.id === chapter.id)?.earned, true)
  assert.equal(enterpriseRewards(organizationB, now).badges.find(badge => badge.id === chapter.id)?.earned, false)
  organizationA.lessons[lessons.at(-1)!.id] = { completedAt: future }
  assert.equal(enterpriseRewards(organizationA, now).badges.find(badge => badge.id === chapter.id)?.earned, false)
  delete organizationA.lessons[lessons.at(-1)!.id]
  assert.equal(enterpriseRewards(organizationA, now).badges.find(badge => badge.id === chapter.id)?.earned, false)
})
