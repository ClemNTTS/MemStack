import test from 'node:test'
import assert from 'node:assert/strict'
import { rankingDay, seedRanking, activeStreak, nextRankingActivity, validateAlias } from './worldRanking.mjs'

test('ranking uses Paris days across midnight and DST, counts a day once and expires after a missed day', () => {
  const state = seedRanking('test',['2026-10-24T10:00:00Z','2026-10-25T10:00:00Z','2026-10-25T11:00:00Z'],Date.parse('2026-10-25T12:00:00Z'))
  assert.equal(state.streak,2)
  assert.equal(nextRankingActivity(state,Date.parse('2026-10-25T13:00:00Z')),state)
  assert.equal(activeStreak(state,Date.parse('2026-10-26T12:00:00Z')),2)
  assert.equal(activeStreak(state,Date.parse('2026-10-27T12:00:00Z')),0)
  assert.equal(nextRankingActivity(state,Date.parse('2026-10-27T12:00:00Z')).streak,1)
  assert.equal(rankingDay(Date.parse('2026-10-14T22:30:00Z')),'2026-10-15')
})
test('ranking ignores future activity and aliases cannot contain email addresses or markup', () => {
  const state = seedRanking('test',['2027-01-01T12:00:00Z','invalid'],Date.parse('2026-10-15T12:00:00Z'))
  assert.equal(state.streak,0)
  assert.match(state.alias,/^Mémo [A-F0-9]{6}$/)
  assert.equal(validateAlias({alias:'  Étoile du code  '}),'Étoile du code')
  for (const alias of ['person@example.com','<script>','a','x'.repeat(25)]) assert.throws(()=>validateAlias({alias}),{code:'invalid-argument'})
  assert.throws(()=>validateAlias({alias:'Valid',streak:999}),{code:'invalid-argument'})
})
