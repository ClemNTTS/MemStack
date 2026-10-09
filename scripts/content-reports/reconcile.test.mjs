import assert from 'node:assert/strict'
import test from 'node:test'
import { reconcileReports } from './reconcile.mjs'
import { createGithub } from './services.mjs'

test('a merged correction is not announced published without a successful deployment proof', async () => {
  for (const published of [null, { deploymentSha: 'a'.repeat(40), deploymentUrl: 'https://github.com/ClemNTTS/MemStack/actions/runs/1' }]) {
    const writes = []
    await reconcileReports({ firestore: {
      query: async status => status === 'pr_open' ? [{ reportId: 'report-1' }] : [],
      patch: async (_, changes) => { writes.push(changes) },
    }, github: { findPullRequest: async () => ({ merged_at: '2026-10-09', merge_commit_sha: 'a'.repeat(40), html_url: 'https://github.com/ClemNTTS/MemStack/pull/1' }),
      publishedCorrection: async () => published } })
    assert.equal(writes[0].status, published ? 'published' : 'pr_merged')
  }
})

test('deployment proof requires the actual correction entry at a successful deployed SHA', async () => {
  for (const entries of [[], [{ reportId: 'report-1', contentVersion: 'b'.repeat(64) }]]) {
    const github = createGithub('fake-token', 'ClemNTTS/MemStack', 'a'.repeat(40), async input => {
      if (input.includes('/actions/')) return Response.json({ workflow_runs: [{ conclusion: 'success', head_sha: 'a'.repeat(40), html_url: 'https://github.com/ClemNTTS/MemStack/actions/runs/1' }] })
      if (input.includes('/compare/')) return Response.json({ status: 'ahead' })
      if (input.includes('/contents/')) return Response.json({ encoding: 'base64', content: Buffer.from(JSON.stringify({ version: 1, entries })).toString('base64') })
      throw new Error('Unexpected request')
    })
    const result = await github.publishedCorrection('c'.repeat(40), 'report-1', 'b'.repeat(64))
    assert.equal(Boolean(result), entries.length > 0)
  }
})

test('closed proposals update history without invoking publication lookup', async () => {
  let status
  await reconcileReports({ firestore: { query: async value => value === 'pr_open' ? [{ reportId: 'report-1' }] : [], patch: async (_, changes) => { status = changes.status } },
    github: { findPullRequest: async () => ({ state: 'closed', html_url: 'https://github.com/ClemNTTS/MemStack/pull/1' }), publishedCorrection: async () => { throw new Error('Unexpected') } } })
  assert.equal(status, 'pr_closed')
})
