import assert from 'node:assert/strict'
import test from 'node:test'
import { accountProgressKey, mergeProgress } from './merge.ts'
import { emptyProgress } from './storage.ts'

test('local import keeps remote lessons and earliest completion without mutation', () => {
  const cloud = emptyProgress()
  cloud.completedLessons.first = '2026-10-03T10:00:00.000Z'
  const local = emptyProgress()
  local.completedLessons.first = '2026-10-05T10:00:00.000Z'
  local.completedLessons.second = '2026-10-05T11:00:00.000Z'
  const merged = mergeProgress(cloud, local)
  assert.equal(merged.completedLessons.first, cloud.completedLessons.first)
  assert.equal(merged.completedLessons.second, local.completedLessons.second)
  assert.equal(cloud.completedLessons.second, undefined)
})

test('newer forgetting wins over stale successful recall from another device', () => {
  const cloud = emptyProgress()
  cloud.cards.first = { cardId: 'first', intervalDays: 1, lastReviewedAt: '2026-10-05T10:00:00.000Z', dueAt: '2026-10-06T10:00:00.000Z' }
  const local = emptyProgress()
  local.cards.first = { cardId: 'first', intervalDays: 8, lastReviewedAt: '2026-10-03T10:00:00.000Z', dueAt: '2026-10-11T10:00:00.000Z' }
  assert.deepEqual(mergeProgress(cloud, local).cards.first, cloud.cards.first)
  assert.deepEqual(mergeProgress(local, cloud).cards.first, cloud.cards.first)
})

test('repeated imports are idempotent and retain daily review history', () => {
  const local = emptyProgress()
  local.history.push({ cardId: 'first', kind: 'review', rating: 'recalled', reviewedAt: '2026-10-05T10:00:00.000Z' })
  const once = mergeProgress(emptyProgress(), local)
  assert.deepEqual(mergeProgress(once, local), once)
  assert.equal(once.history.length, 1)
})

test('account cache keys are distinct from guest and other users', () => {
  assert.notEqual(accountProgressKey('alice'), accountProgressKey('bob'))
  assert.notEqual(accountProgressKey('alice'), 'memstack.progress.v1')
})
