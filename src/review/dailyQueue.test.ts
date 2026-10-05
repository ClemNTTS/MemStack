import assert from 'node:assert/strict'
import test from 'node:test'
import { createDailyQueue } from './dailyQueue.ts'
import { emptyProgress } from '../progress/storage.ts'
import { scheduleReview } from './schedule.ts'

const now = new Date('2026-10-05T12:00:00.000Z')
const cards = Array.from({ length: 8 }, (_, i) => ({ id: `card-${i}`, question: 'Q', answer: 'A' }))

function seededProgress() {
  const progress = emptyProgress()
  for (let i = 0; i < 7; i++) {
    progress.cards[cards[i].id] = {
      cardId: cards[i].id, intervalDays: 1, lastReviewedAt: '2026-09-01T12:00:00.000Z',
      dueAt: new Date(now.getTime() - (i + 1) * 86400000).toISOString(),
    }
  }
  return progress
}

test('new cards precede the five oldest due cards without duplicates', () => {
  const queue = createDailyQueue(cards, ['card-0', 'card-7'], seededProgress(), now)
  assert.deepEqual(queue.map((item) => item.card.id), ['card-7', 'card-6', 'card-5', 'card-4', 'card-3', 'card-2'])
  assert.equal(queue[0].kind, 'new')
  assert.ok(queue.slice(1).every((item) => item.kind === 'review'))
})

test('successive batches allow more than five reviews in one day and use updated due dates', () => {
  const progress = seededProgress()
  const first = createDailyQueue(cards, [], progress, now)
  assert.equal(first.length, 5)
  for (const item of first) {
    const result = { cardId: item.card.id, rating: 'recalled' as const, reviewedAt: now.toISOString() }
    progress.cards[item.card.id] = scheduleReview(result, progress.cards[item.card.id])
    progress.history.push({ ...result, kind: 'review' })
  }
  const second = createDailyQueue(cards, [], progress, now)
  assert.equal(second.length, 2)
  assert.ok(second.every(item => !first.some(previous => previous.card.id === item.card.id)))
  for (const item of second) {
    progress.cards[item.card.id] = scheduleReview({ cardId: item.card.id, rating: 'forgotten', reviewedAt: now.toISOString() }, progress.cards[item.card.id])
  }
  assert.deepEqual(createDailyQueue(cards, [], progress, now), [])
})

test('duplicate inputs produce only one occurrence of each session card', () => {
  const queue = createDailyQueue([...cards, cards[6]], ['card-7', 'card-7'], seededProgress(), now)
  assert.equal(queue.length, 6)
  assert.equal(new Set(queue.map(item => item.card.id)).size, 6)
})

test('future and missing cards are excluded; due-at-now is included', () => {
  const progress = seededProgress()
  for (const state of Object.values(progress.cards)) state.dueAt = new Date(now.getTime() + 1).toISOString()
  progress.cards['card-0'].dueAt = now.toISOString()
  delete progress.cards['card-1']
  assert.deepEqual(createDailyQueue(cards, [], progress, now).map((item) => item.card.id), ['card-0'])
  assert.throws(() => createDailyQueue(cards, ['missing'], progress, now))
})

test('historical answers do not reduce the next review batch', () => {
  const progress = seededProgress()
  progress.history = [{ cardId: 'card-7', rating: 'recalled', kind: 'new', reviewedAt: now.toISOString() }]
  assert.equal(createDailyQueue(cards, [], progress, now).length, 5)
})
