import test from 'node:test'
import assert from 'node:assert/strict'
import { learningDay, learningDayBounds, validateLearningAction } from './learningAccess.mjs'

test('learning mutations accept no client identity, dates, roles, schedule or quota', () => {
  const action = { type:'card',cardId:'valid-card',rating:'recalled',requestId:'stable-request-id-123' }
  assert.equal(validateLearningAction(action),action)
  for (const extra of ['uid','premium','reviewedAt','dueAt','intervalDays','lessonsRemaining']) assert.throws(() => validateLearningAction({ ...action,[extra]:999 }))
  for (const input of [null,{},[],{ ...action,rating:'correct' },{ ...action,requestId:'../victim' },{ ...action,cardId:'../victim' }]) assert.throws(() => validateLearningAction(input))
})

test('server daily windows use Paris calendar days across midnight and DST', () => {
  assert.equal(learningDay(Date.parse('2026-10-14T21:59:59Z')),'2026-10-14')
  assert.equal(learningDay(Date.parse('2026-10-14T22:00:00Z')),'2026-10-15')
  assert.equal(learningDay(Date.parse('2026-10-25T22:59:59Z')),'2026-10-25')
  assert.equal(learningDay(Date.parse('2026-10-25T23:00:00Z')),'2026-10-26')
  const fall = learningDayBounds(Date.parse('2026-10-25T12:00:00Z'))
  assert.equal(Date.parse(fall[1])-Date.parse(fall[0]),25*3600000)
  const spring = learningDayBounds(Date.parse('2026-03-29T12:00:00Z'))
  assert.equal(Date.parse(spring[1])-Date.parse(spring[0]),23*3600000)
})
