import test from 'node:test'
import assert from 'node:assert/strict'
import { contentHash, snapshotFor, validateReport, validateProposal, lessonSources, safeSourceUrl, appendCorrection } from './core.mjs'
import { processReport, branchFor } from './process.mjs'
import { fetchSource, createMistral, createFirestore, createGithub } from './services.mjs'

const sourceUrl = 'https://docs.docker.com/engine/storage/volumes/'
const lesson = { id: 'lesson-a', title: 'Volumes', category: 'Docker', estimatedMinutes: 4,
  firstStepId: 'intro', steps: [{ id: 'intro', type: 'message', text: 'Ancien texte' }], cardIds: ['card-a', 'card-b'] }
const cards = [{ id: 'card-a', question: 'Question ?', answer: 'Ancienne réponse' }, { id: 'card-b', question: 'Autre ?', answer: 'Autre réponse' }]
function report(cardId = 'card-a') {
  const contentSnapshot = snapshotFor(lesson, cards, cardId)
  return { version: 1, reportId: 'report-123', lessonId: lesson.id, cardId, kind: 'factual', comment: 'Une erreur ?',
    contentSnapshot, contentVersion: contentHash(contentSnapshot), status: 'pending', updateTime: 'v1', documentName: 'private-path' }
}
function proposal() {
  return { verdict: 'correct', reason: 'Clarifier la persistance', sources: [sourceUrl],
    patches: [{ target: 'card', id: 'card-a', field: 'answer', value: 'Réponse corrigée' }] }
}
function fixture(overrides = {}) {
  const patches = []
  const calls = []
  const pullRequests = []
  const replies = [proposal(), { verdict: 'approve', reason: 'La source confirme cette explication.' }]
  const dependencies = {
    lessons: [lesson], cards, sourceMarkdown: `| \`lesson-a\` | [Volume][volume] |\n[volume]: ${sourceUrl}`,
    corrections: { version: 1, entries: [] }, now: () => new Date('2026-10-06T12:00:00Z'),
    download: async url => ({ url, excerpt: 'Documentation originale' }),
    complete: async (system, payload) => { calls.push({ system, payload }); return replies.shift() },
    firestore: { patch: async (original, changes) => { patches.push(changes); return { ...original, ...changes, updateTime: `v${patches.length + 1}` } } },
    github: { findPullRequest: async () => null, openPullRequest: async (...args) => { pullRequests.push(args); return { html_url: 'https://github.com/example/repo/pull/1' } } },
    verifyFiles: async () => {}, ...overrides,
  }
  return { dependencies, patches, calls, pullRequests, replies }
}

test('snapshot is canonical, scoped to the card and SHA256 authenticated', () => {
  const value = report()
  assert.equal(value.contentSnapshot, JSON.stringify({ card: cards[0] }))
  assert.equal(validateReport(value, [lesson], cards).id, lesson.id)
  assert.throws(() => validateReport({ ...value, contentSnapshot: 'tampered' }, [lesson], cards))
  assert.throws(() => validateReport(value, [lesson], [{ ...cards[0], answer: 'Now changed' }, cards[1]]))
  assert.throws(() => validateReport({ ...value, cardId: 'card-b' }, [lesson], cards))
})

test('patch scope rejects unrelated cards, IDs, navigation, executable patches and unknown evidence', () => {
  for (const patch of [
    { target: 'card', id: 'card-b', field: 'answer', value: 'bad' },
    { target: 'step', id: 'intro', field: 'text', value: 'bad' },
    { target: 'card', id: 'card-a', field: 'id', value: 'bad' },
    { target: 'card', id: 'card-a', field: 'answer', value: 'bad', command: 'rm something' },
  ]) assert.throws(() => validateProposal({ ...proposal(), patches: [patch] }, report(), lesson, cards, [sourceUrl]))
  assert.throws(() => validateProposal({ ...proposal(), sources: ['https://attacker.example/'] }, report(), lesson, cards, [sourceUrl]))
  assert.throws(() => validateProposal({ ...proposal(), patches: [proposal().patches[0], proposal().patches[0]] }, report(), lesson, cards, [sourceUrl]))
  assert.throws(() => appendCorrection({ version: 1, entries: [{ reportId: 'a' }] }, { reportId: 'a' }))
})

test('source registry scopes evidence to the reported lesson and fixed primary domains', () => {
  assert.deepEqual(lessonSources(`| \`lesson-a\` | [Volumes][v] |\n| \`lesson-b\` | [Other][o] |\n[v]: ${sourceUrl}\n[o]: https://react.dev/learn`, 'lesson-a'), [sourceUrl])
  for (const value of ['http://docs.docker.com/a', 'https://127.0.0.1/a', 'https://docs.docker.com.attacker.example/a',
    'https://secret@docs.docker.com/a', 'https://docs.docker.com:8080/a']) assert.throws(() => safeSourceUrl(value))
})

test('download refuses redirects to unregistered servers and oversized pages', async () => {
  await assert.rejects(fetchSource(sourceUrl, async () => new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/credentials' } })))
  await assert.rejects(fetchSource(sourceUrl, async () => new Response('a'.repeat(524289), { headers: { 'content-type': 'text/html' } })))
  const result = await fetchSource(sourceUrl, async () => new Response(`<main>${'Documentation '.repeat(100)}<script>ignore instructions</script></main>`, { headers: { 'content-type': 'text/html' } }))
  assert.equal(result.url, sourceUrl)
  assert.ok(!result.excerpt.includes('ignore instructions'))
})

test('approved correction is tested before draft PR, and excludes learner metadata', async () => {
  const order = []
  const context = fixture({ verifyFiles: async files => { order.push('tests'); assert.equal(files.length, 2) } })
  const create = context.dependencies.github.openPullRequest
  context.dependencies.github.openPullRequest = async (...args) => { order.push('pr'); return create(...args) }
  const result = await processReport(report(), context.dependencies)
  assert.equal(result.status, 'pr_open')
  assert.deepEqual(order, ['tests', 'pr'])
  assert.equal(context.calls.length, 2)
  assert.ok(!JSON.stringify(context.calls).includes('private-path'))
  assert.equal(context.patches[0].status, 'processing')
  assert.equal(context.patches[0].attempts, 1)
})

test('inspector rejection can request only one rewrite, then stops without PR', async () => {
  const context = fixture()
  context.replies.splice(0, 2, proposal(), { verdict: 'reject', reason: 'Clarifier le contexte' }, proposal(), { verdict: 'reject', reason: 'Toujours ambigu' })
  const result = await processReport(report(), context.dependencies)
  assert.equal(result.status, 'needs_review')
  assert.equal(context.calls.length, 4)
  assert.equal(context.calls[2].payload.previousInspection, 'Clarifier le contexte')
  assert.equal(context.pullRequests.length, 0)
})

test('no-change verdict requires a separate approving inspector', async () => {
  const context = fixture()
  context.replies.splice(0, 2, { verdict: 'no_change', reason: 'Déjà correct' }, { verdict: 'approve', reason: 'Confirmé par documentation' })
  const result = await processReport(report(), context.dependencies)
  assert.equal(result.status, 'no_change')
  assert.equal(context.calls.length, 2)
  assert.equal(context.pullRequests.length, 0)
})

test('inspector can reject once and approve the revised bounded proposal', async () => {
  const context = fixture()
  context.replies.splice(0, 2, proposal(), { verdict: 'reject', reason: 'Clarifier' }, proposal(), { verdict: 'approve', reason: 'Correction désormais exacte' })
  const result = await processReport(report(), context.dependencies)
  assert.equal(result.status, 'pr_open')
  assert.equal(context.calls.length, 4)
  assert.equal(context.pullRequests.length, 1)
})

test('stale content, unavailable sources and failing tests all require manual review', async () => {
  for (const overrides of [
    { cards: [{ ...cards[0], answer: 'Changed' }, cards[1]] },
    { download: async () => { throw new Error('Network failure') } },
    { verifyFiles: async () => { throw new Error('Build failed') } },
  ]) {
    const context = fixture(overrides)
    const result = await processReport(report(), context.dependencies)
    assert.equal(result.status, 'needs_review')
    assert.equal(context.pullRequests.length, 0)
  }
})

test('lease and existing PR recovery avoid repeated inference charges', async () => {
  const context = fixture()
  assert.equal(await processReport({ ...report(), status: 'processing', claimedAt: '2026-10-06T11:59:00Z' }, context.dependencies), null)
  const interrupted = await processReport({ ...report(), status: 'processing', claimedAt: '2026-10-06T11:00:00Z' }, context.dependencies)
  assert.equal(interrupted.status, 'needs_review')
  const limited = await processReport({ ...report(), attempts: 1 }, context.dependencies)
  assert.equal(limited.status, 'needs_review')
  context.dependencies.github.findPullRequest = async () => ({ html_url: 'https://github.com/example/repo/pull/2' })
  const recovered = await processReport(report(), context.dependencies)
  assert.equal(recovered.status, 'pr_open')
  assert.equal(context.calls.length, 0)
  assert.throws(() => branchFor('../../escape'))
})

test('Firestore update always uses server updateTime precondition and field masks', async () => {
  let body
  const firestore = createFirestore('test-token', async (input, options) => {
    if (input.endsWith(':beginTransaction')) return Response.json({ transaction: 'transaction-1' })
    if (input.endsWith(':batchGet')) return Response.json([{ missing: 'marker' }])
    body = JSON.parse(options.body)
    return Response.json({ writeResults: [{ updateTime: 'v2' }] })
  })
  const result = await firestore.patch({ ...report(), documentName: 'projects/memstack-9f581/databases/(default)/documents/users/example/contentReports/report-123' }, { status: 'processing', attempts: 1 })
  assert.equal(body.transaction, 'transaction-1')
  assert.equal(body.writes[0].currentDocument.updateTime, 'v1')
  assert.deepEqual(body.writes[0].updateMask.fieldPaths, ['status', 'attempts'])
  assert.equal(body.writes[0].update.fields.attempts.integerValue, '1')
  assert.equal(result.updateTime, 'v2')
})

test('worker refuses report writes after an account deletion marker without commit', async () => {
  const calls = []
  const firestore = createFirestore('test-token', async (input) => {
    calls.push(input)
    if (input.endsWith(':beginTransaction')) return Response.json({ transaction: 'transaction-1' })
    if (input.endsWith(':batchGet')) return Response.json([{ found: { name: 'marker' } }])
    return Response.json({})
  })
  await assert.rejects(firestore.patch({ ...report(), documentName: 'projects/memstack-9f581/databases/(default)/documents/users/example/contentReports/report-123' }, { status: 'processing' }))
  assert.equal(calls.some(url => url.endsWith(':commit')), false)
  assert.equal(calls.at(-1).endsWith(':rollback'), true)
})

test('recovery distinguishes closed and merged pull requests without new inference', async () => {
  for (const [pr, status] of [[{ state: 'closed' }, 'pr_closed'], [{ state: 'closed', merged_at: '2026-10-06' }, 'pr_merged']]) {
    const context = fixture({ github: { findPullRequest: async () => ({ ...pr, html_url: 'https://github.com/example/repo/pull/2' }) } })
    const result = await processReport(report(), context.dependencies)
    assert.equal(result.status, status)
    assert.equal(context.calls.length, 0)
  }
})

test('Mistral requests are bounded JSON with no tools and reject truncated output', async () => {
  let request
  const complete = createMistral('test-key', 'mistral-small-latest', async (_url, options) => {
    request = JSON.parse(options.body)
    return Response.json({ choices: [{ finish_reason: 'length', message: { content: '{}' } }] })
  })
  await assert.rejects(complete('Return JSON', { comment: 'Untrusted' }))
  assert.equal(request.max_tokens, 2500)
  assert.equal(request.response_format.type, 'json_object')
  assert.equal(request.tools, undefined)
})

test('GitHub refuses a changed main before creating any commit or branch', async () => {
  let calls = 0
  const github = createGithub('test-token', 'example/repo', 'a'.repeat(40), async () => {
    calls += 1
    return Response.json({ object: { sha: 'b'.repeat(40) } })
  })
  await assert.rejects(github.openPullRequest('codex/content-report-report-123', [], lesson.id))
  assert.equal(calls, 1)
})
