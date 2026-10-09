import test from 'node:test'
import assert from 'node:assert/strict'
import { matchesExamStatus } from './statusFilter.ts'

test('personal filters distinguish unavailable, pending and historical without inventing results while loading', () => {
  assert.equal(matchesExamStatus('retry', 'validated', true), false)
  assert.equal(matchesExamStatus('retry', 'retry', true), true)
  assert.equal(matchesExamStatus('unavailable', 'pending', true), false)
  assert.equal(matchesExamStatus('historical', 'historical', true), true)
  assert.equal(matchesExamStatus('retry', undefined, false), true)
  assert.equal(matchesExamStatus('all', 'unattempted', true), true)
})
