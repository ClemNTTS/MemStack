import assert from 'node:assert/strict'
import test from 'node:test'
import { advanceAutomationSimulation as advance, startAutomationSimulation as start } from './automationSimulation.ts'

test('a repeated request never creates another destination record', () => {
  const initial = start('duplicate')
  const refused = advance(initial, 'create')
  assert.equal(refused.cards, 1)
  assert.equal(refused.done, false)
  assert.equal(advance(refused, 'reuse').done, true)
})

test('an incomplete request waits with no destination record', () => {
  const refused = advance(start('incomplete'), 'create')
  const result = advance(refused, 'request')
  assert.equal(result.cards, 0)
  assert.equal(result.waiting, true)
  assert.equal(result.done, true)
})

test('notification resumes twice then escalates without replaying creation', () => {
  let state = start('notification')
  assert.equal(advance(state, 'alert').done, false)
  state = advance(advance(state, 'retry'), 'retry')
  const refused = advance(state, 'retry')
  assert.equal(refused.retries, 2)
  assert.equal(refused.cards, 1)
  const result = advance(refused, 'alert')
  assert.equal(result.done, true)
  assert.equal(advance(result, 'create').cards, 1)
})
