import assert from 'node:assert/strict'
import test from 'node:test'
import { decodeProgress, emptyProgress, loadProgress, saveProgress, progressKey } from './storage.ts'

test('empty storage initializes a clean independent progress', () => {
  assert.deepEqual(decodeProgress(null), emptyProgress())
  const first = emptyProgress()
  first.completedLessons.docker = '2026-10-05T12:00:00.000Z'
  assert.deepEqual(emptyProgress().completedLessons, {})
})

test('completed lesson, history and card interval survive a storage round trip', () => {
  const progress = emptyProgress()
  const reviewedAt = '2026-10-05T12:00:00.000Z'
  progress.completedLessons.docker = reviewedAt
  progress.cards.docker = { cardId: 'docker', intervalDays: 4, lastReviewedAt: reviewedAt, dueAt: '2026-10-09T12:00:00.000Z' }
  progress.history.push({ cardId: 'docker', rating: 'recalled', reviewedAt, kind: 'review' })
  assert.deepEqual(decodeProgress(JSON.stringify(progress)), progress)
})

test('invalid or unsupported stored data is rejected without silently resetting it', () => {
  for (const value of ['{', 'null', JSON.stringify({ ...emptyProgress(), version: 2 }), JSON.stringify({ ...emptyProgress(), completedLessons: { docker: 'bad date' } }), JSON.stringify({ ...emptyProgress(), history: [{ cardId: 'docker', rating: 'known' }] })]) {
    assert.throws(() => decodeProgress(value))
  }
  const progress = emptyProgress()
  progress.cards.docker = { cardId: 'other', intervalDays: -1, lastReviewedAt: 'bad', dueAt: 'bad' }
  assert.throws(() => decodeProgress(JSON.stringify(progress)))
})

test('storage read/write errors propagate so the UI can keep the answer unvalidated', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window')
  let saved = ''
  try {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: {
      getItem(key: string) { assert.equal(key, progressKey); return saved || null },
      setItem(key: string, value: string) { assert.equal(key, progressKey); saved = value },
    } } })
    saveProgress(emptyProgress())
    assert.deepEqual(loadProgress(), emptyProgress())
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: {
      getItem() { throw new Error('blocked') }, setItem() { throw new Error('quota') },
    } } })
    assert.throws(loadProgress, /blocked/)
    assert.throws(() => saveProgress(emptyProgress()), /quota/)
  } finally {
    if (original) Object.defineProperty(globalThis, 'window', original)
    else Reflect.deleteProperty(globalThis, 'window')
  }
})
