import test from 'node:test'
import assert from 'node:assert/strict'
import { enterpriseLessons, enterpriseTracks } from '../data/enterprise.ts'
import { enterpriseResumeCandidate, resolveEnterpriseTrack } from './learningContext.ts'

test('explicit visit wins without changing the saved track; generic return restores it', () => {
  const [saved, visit] = enterpriseTracks
  assert.equal(resolveEnterpriseTrack(visit.id, saved.id)?.id, visit.id)
  assert.equal(resolveEnterpriseTrack(undefined, saved.id)?.id, saved.id)
  assert.equal(resolveEnterpriseTrack('removed-track', saved.id)?.id, saved.id)
})

test('resume recommendations exclude unrelated missions, changed steps and expired or future snapshots', () => {
  const lesson = enterpriseLessons[0]
  const now = Date.parse('2026-10-22T12:00:00Z')
  const summary = { lessonId: lesson.id, revision: 1, stepId: lesson.steps[1].id, updatedAt: '2026-10-21T12:00:00Z', expiresAt: '2026-11-20T12:00:00Z' }
  assert.equal(enterpriseResumeCandidate([lesson], [summary], now)?.summary.stepId, lesson.steps[1].id)
  assert.equal(enterpriseResumeCandidate([], [summary], now), undefined)
  assert.equal(enterpriseResumeCandidate([lesson], [{ ...summary, stepId: 'removed-step' }], now), undefined)
  assert.equal(enterpriseResumeCandidate([lesson], [{ ...summary, expiresAt: '2026-10-22T12:00:00Z' }], now), undefined)
  assert.equal(enterpriseResumeCandidate([lesson], [{ ...summary, updatedAt: '2026-10-23T12:00:00Z' }], now), undefined)
})

test('no valid preference never silently chooses the first track', () => {
  assert.equal(resolveEnterpriseTrack(undefined, undefined), undefined)
  assert.equal(resolveEnterpriseTrack('removed', 'removed'), undefined)
  const [a, b] = enterpriseTracks
  assert.equal(resolveEnterpriseTrack(null, a.id)?.id, a.id)
  assert.equal(resolveEnterpriseTrack(null, b.id)?.id, b.id)
})
