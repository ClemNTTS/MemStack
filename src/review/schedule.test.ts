import assert from 'node:assert/strict'
import test from 'node:test'
import { scheduleReview } from './schedule.ts'

test('first recall schedules tomorrow and records the review time', () => {
  const state = scheduleReview({ cardId: 'docker', rating: 'recalled', reviewedAt: '2026-10-01T10:00:00.000Z' })
  assert.equal(state.intervalDays, 1)
  assert.equal(state.dueAt, '2026-10-02T10:00:00.000Z')
})

test('recalls spaced over time lengthen intervals, immediate repeats do not', () => {
  const first = scheduleReview({ cardId: 'docker', rating: 'recalled', reviewedAt: '2026-10-01T10:00:00.000Z' })
  const repeat = scheduleReview({ cardId: 'docker', rating: 'recalled', reviewedAt: first.lastReviewedAt }, first)
  assert.equal(repeat.intervalDays, 1)
  const next = scheduleReview({ cardId: 'docker', rating: 'recalled', reviewedAt: first.dueAt }, first)
  assert.equal(next.intervalDays, 2)
  const third = scheduleReview({ cardId: 'docker', rating: 'recalled', reviewedAt: next.dueAt }, next)
  assert.equal(third.intervalDays, 4)
  assert.equal(first.intervalDays, 1)
})

test('forgetting a previously spaced card brings it back tomorrow', () => {
  const previous = { cardId: 'docker', intervalDays: 16, lastReviewedAt: '2026-10-01T10:00:00.000Z', dueAt: '2026-10-17T10:00:00.000Z' }
  const next = scheduleReview({ cardId: 'docker', rating: 'forgotten', reviewedAt: previous.dueAt }, previous)
  assert.equal(next.intervalDays, 1)
  assert.equal(next.dueAt, '2026-10-18T10:00:00.000Z')
})

test('early recalls do not shorten spacing and late recalls are capped at a year', () => {
  const previous = { cardId: 'docker', intervalDays: 16, lastReviewedAt: '2026-10-01T10:00:00.000Z', dueAt: '2026-10-17T10:00:00.000Z' }
  assert.equal(scheduleReview({ cardId: 'docker', rating: 'recalled', reviewedAt: '2026-10-02T10:00:00.000Z' }, previous).intervalDays, 16)
  assert.equal(scheduleReview({ cardId: 'docker', rating: 'recalled', reviewedAt: '2028-10-01T10:00:00.000Z' }, previous).intervalDays, 365)
})
