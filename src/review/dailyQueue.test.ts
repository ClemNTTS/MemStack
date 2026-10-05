import assert from 'node:assert/strict'
import test from 'node:test'
import { createDailyQueue } from './dailyQueue.ts'
import { emptyProgress } from '../progress/storage.ts'

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

test('reloads respect reviews already done on the same local day', () => {
  const progress = seededProgress()
  progress.history = [0, 1].map((i) => ({ cardId: `card-${i}`, rating: 'recalled', kind: 'review', reviewedAt: now.toISOString() }))
  const queue = createDailyQueue(cards, [], progress, now)
  assert.equal(queue.length, 3)
  assert.ok(queue.every((item) => !['card-0', 'card-1'].includes(item.card.id)))
  progress.history.push(...[2, 3, 4].map((i) => ({ cardId: `card-${i}`, rating: 'recalled' as const, kind: 'review' as const, reviewedAt: now.toISOString() })))
  assert.deepEqual(createDailyQueue(cards, [], progress, now), [])
  assert.equal(createDailyQueue(cards, [], progress, new Date(now.getTime() + 86400000)).length, 5)
})

test('future and missing cards are excluded; due-at-now is included', () => {
  const progress = seededProgress()
  for (const state of Object.values(progress.cards)) state.dueAt = new Date(now.getTime() + 1).toISOString()
  progress.cards['card-0'].dueAt = now.toISOString()
  delete progress.cards['card-1']
  assert.deepEqual(createDailyQueue(cards, [], progress, now).map((item) => item.card.id), ['card-0'])
  assert.throws(() => createDailyQueue(cards, ['missing'], progress, now))
})

test('new card answers do not consume the daily review allowance', () => {
  const progress = seededProgress()
  progress.history = [{ cardId: 'card-7', rating: 'recalled', kind: 'new', reviewedAt: now.toISOString() }]
  assert.equal(createDailyQueue(cards, [], progress, now).length, 5)
})
