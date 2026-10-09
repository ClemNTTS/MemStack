import assert from 'node:assert/strict'
import test from 'node:test'
import { decodeContentReport, reportPullRequestUrl, reportStatuses } from './reportStatus.ts'

const data = { version: 1, status: 'pending', comment: 'Un exemple ambigu', kind: 'unclear',
  lessonId: 'lesson-a', cardId: '', createdAt: '2026-10-09T10:00:00Z', contentVersion: 'a'.repeat(64) }

test('report history preserves known statuses and rejects corrupt results rather than inventing pending', () => {
  for (const status of Object.keys(reportStatuses)) assert.equal(decodeContentReport('id', { ...data, status, deploymentSha: 'b'.repeat(40) }).status, status)
  assert.throws(() => decodeContentReport('id', { ...data, status: 'toString' }))
  assert.throws(() => decodeContentReport('id', { ...data, createdAt: 'not-date' }))
  assert.throws(() => decodeContentReport('id', { ...data, status: 'published' }))
  assert.notEqual(reportStatuses.pr_merged[0], reportStatuses.published[0])
})

test('only repository pull request links become clickable', () => {
  assert.equal(reportPullRequestUrl('https://github.com/ClemNTTS/MemStack/pull/12'), 'https://github.com/ClemNTTS/MemStack/pull/12')
  for (const value of ['javascript:alert(1)', 'https://github.com/other/repo/pull/1', 'https://github.com/ClemNTTS/MemStack/pull/1?token=secret']) assert.equal(reportPullRequestUrl(value), undefined)
})
