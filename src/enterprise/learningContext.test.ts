import test from 'node:test'
import assert from 'node:assert/strict'
import { enterpriseTracks } from '../data/enterprise.ts'
import { resolveEnterpriseTrack } from './learningContext.ts'

test('explicit visit wins without changing the saved track; generic return restores it', () => {
  const [saved, visit] = enterpriseTracks
  assert.equal(resolveEnterpriseTrack(visit.id, saved.id)?.id, visit.id)
  assert.equal(resolveEnterpriseTrack(undefined, saved.id)?.id, saved.id)
  assert.equal(resolveEnterpriseTrack('removed-track', saved.id)?.id, saved.id)
})

test('no valid preference never silently chooses the first track', () => {
  assert.equal(resolveEnterpriseTrack(undefined, undefined), undefined)
  assert.equal(resolveEnterpriseTrack('removed', 'removed'), undefined)
  const [a, b] = enterpriseTracks
  assert.equal(resolveEnterpriseTrack(null, a.id)?.id, a.id)
  assert.equal(resolveEnterpriseTrack(null, b.id)?.id, b.id)
})
