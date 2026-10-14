import test from 'node:test'
import assert from 'node:assert/strict'
import { activityDay, learningRewards } from './gamification.ts'
import { emptyProgress } from './storage.ts'

test('a streak survives until the next day, then expires without erasing its record', () => {
  const progress = { ...emptyProgress(), completedLessons: { first: '2026-10-10T10:00:00.000Z', second: '2026-10-11T10:00:00.000Z' } }
  assert.equal(learningRewards(progress, new Date('2026-10-12T10:00:00Z')).currentStreak, 2)
  const expired = learningRewards(progress, new Date('2026-10-13T10:00:00Z'))
  assert.equal(expired.currentStreak, 0)
  assert.equal(expired.longestStreak, 2)
})

test('Paris calendar days handle midnight and daylight saving changes', () => {
  assert.equal(activityDay(new Date('2026-10-14T22:30:00Z')), '2026-10-15')
  const progress = { ...emptyProgress(), completedLessons: { first: '2026-10-24T10:00:00Z', second: '2026-10-25T10:00:00Z', third: '2026-10-26T10:00:00Z' } }
  assert.equal(learningRewards(progress, new Date('2026-10-26T12:00:00Z')).currentStreak, 3)
})

test('duplicate practice earns no extra XP, future activity earns none, and level boundaries are exact', () => {
  const event = { cardId: 'one', rating: 'forgotten' as const, kind: 'review' as const, reviewedAt: '2026-10-14T10:00:00Z' }
  const progress = { ...emptyProgress(), history: [event, { ...event, rating: 'recalled' as const }, { ...event, reviewedAt: '2027-01-01T10:00:00Z' }] }
  assert.equal(learningRewards(progress, new Date('2026-10-14T12:00:00Z')).xp, 5)
  progress.completedLessons = Object.fromEntries(['a', 'b', 'c', 'd', 'e'].map(id => [id, '2026-10-14T10:00:00Z']))
  const rewards = learningRewards(progress, new Date('2026-10-14T12:00:00Z'))
  assert.equal(rewards.level, 2)
  assert.equal(rewards.nextLevelAt, 400)
  assert.equal(learningRewards(emptyProgress()).level, 1)
})
