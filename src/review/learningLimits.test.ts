import test from 'node:test'
import assert from 'node:assert/strict'
import { learningAllowance, limitLearningQueue } from './learningLimits.ts'
import { emptyProgress } from '../progress/storage.ts'

test('free limits apply across courses, exclude new cards and do not count tomorrow', () => {
  const progress = { ...emptyProgress(), completedLessons: { a: '2026-10-14T10:00:00Z', b: '2026-10-15T10:00:00Z' },
    history: Array.from({ length: 8 }, (_, index) => ({ cardId: `card-${index}`, kind: index < 5 ? 'review' as const : 'new' as const, rating: 'recalled' as const, reviewedAt: '2026-10-14T10:00:00Z' })) }
  const now = new Date('2026-10-14T12:00:00Z')
  assert.deepEqual(learningAllowance(progress, false, now), { lessonsToday: 1, reviewsToday: 5, lessonsRemaining: 0, reviewsRemaining: 0 })
  assert.equal(learningAllowance(progress, true, now).reviewsRemaining, Infinity)
  assert.equal(learningAllowance(progress, false, new Date('2026-10-14T22:00:00Z')).reviewsRemaining, 5)
})

test('remaining allowance slices due reviews while keeping every new learning card', () => {
  const queue = ['review', 'new', 'review', 'new', 'review'].map((kind, index) => ({ card: { id: String(index), question: '?', answer: '!' }, kind: kind as 'review' | 'new' }))
  assert.deepEqual(limitLearningQueue(queue, 1).map(item => item.card.id), ['0', '1', '3'])
  assert.deepEqual(limitLearningQueue(queue, 0).map(item => item.card.id), ['1', '3'])
  assert.equal(limitLearningQueue(queue, Infinity).length, 5)
})
