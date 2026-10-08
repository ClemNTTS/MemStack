import assert from 'node:assert/strict'
import test from 'node:test'
import { catalogCourses, catalogLessons } from '../data/catalog/index.ts'
import { challenges, getChallengeVersion } from '../data/challenges.ts'
import { acknowledgeChallengeAttempt, decodeChallengeAttempt, matchesAttemptSubmission, validateChallengeAnswer, validateChallengeForm } from './attemptModel.ts'
import type { ChallengeAttempt } from '../types/challenge'
import curriculum from '../../docs/content/curriculum.json' with { type: 'json' }
import dossiers from '../../shared/challengeDossiers.json' with { type: 'json' }
import { createHash } from 'node:crypto'

const attempt: ChallengeAttempt = {
  id: 'test-attempt', version: 1, challengeId: 'docker-images-diagnostic', challengeVersion: 1,
  answer: 'Je recrée le conteneur avec la nouvelle image, après vérification des données.',
  submittedAt: '2026-10-06T12:00:00.000Z', outcome: '',
}
const { id, ...stored } = attempt

test('published Docker snapshots retain the original correction for historical attempts', () => {
  const historical = dossiers.challenges.filter(challenge => ['docker-images-diagnostic', 'docker-volumes-diagnostic', 'docker-ports-diagnostic'].includes(challenge.id))
  assert.equal(createHash('sha256').update(JSON.stringify(historical)).digest('hex'), '844bc51879d5d80a2b2333404bf8d711b38ec72ec587dcec6de5b93a12d9cebf')
})

test('challenge catalogue references existing lessons and primary sources without altering discovery', () => {
  assert.ok(challenges.length >= curriculum.themes.length * 3)
  for (const theme of curriculum.themes) {
    const courseIds = curriculum.courses.filter(course => course.theme === theme.title).map(course => course.id)
    assert.ok(challenges.filter(challenge => courseIds.includes(challenge.courseId)).length >= 3, theme.title)
  }
  assert.equal(new Set(challenges.map(challenge => challenge.id)).size, challenges.length)
  assert.equal(new Set(challenges.map(challenge => challenge.prompt)).size, challenges.length, 'Chaque défi pose une question propre à son scénario')
  for (const challenge of challenges) {
    const course = catalogCourses.find(course => course.id === challenge.courseId)
    assert.ok(course)
    assert.ok(Number.isInteger(challenge.version) && challenge.version >= 1)
    assert.ok(challenge.lessonIds.length > 0)
    for (const lessonId of challenge.lessonIds) {
      assert.ok(course.lessonIds.includes(lessonId))
      assert.ok(catalogLessons.some(lesson => lesson.id === lessonId))
    }
    assert.ok(challenge.checkpoints.length >= 2)
    assert.ok(challenge.counterexamples.length > 0)
    assert.ok(challenge.sources.length > 0)
    for (const source of challenge.sources) {
      const url = new URL(source.url)
      assert.equal(url.protocol, 'https:')
      assert.ok(['docs.docker.com', 'developer.mozilla.org', 'react.dev', 'www.typescriptlang.org', 'nodejs.org', 'www.postgresql.org', 'firebase.google.com', 'kubernetes.io', 'developer.hashicorp.com', 'docs.github.com', 'cloud.google.com', 'docs.cloud.google.com', 'learn.microsoft.com', 'opentelemetry.io', 'prometheus.io', 'sre.google', 'cheatsheetseries.owasp.org', 'git-scm.com', 'web.dev', 'www.w3.org', 'www.rfc-editor.org', 'tc39.es', 'html.spec.whatwg.org', 'martinfowler.com'].includes(url.hostname), source.url)
    }
  }
})

test('malformed cloud history never masquerades as a valid saved attempt', () => {
  assert.deepEqual(decodeChallengeAttempt(id, stored), attempt)
  for (const patch of [
    { version: 2 }, { challengeId: 'unknown' }, { answer: '' }, { answer: 'x'.repeat(4001) },
    { submittedAt: 'tomorrow' }, { submittedAt: '2026-02-30T12:00:00.000Z' },
    { outcome: 'mastered' }, { challengeVersion: 0 }, { challengeVersion: 1.5 }, { uid: 'another-account' },
  ]) assert.equal(decodeChallengeAttempt(id, { ...stored, ...patch }), null)
  assert.equal(decodeChallengeAttempt('../escape', stored), null)
  assert.equal(decodeChallengeAttempt(id, null), null)
  assert.equal(decodeChallengeAttempt(id, []), null)
  assert.equal(validateChallengeAnswer(attempt.challengeId, '  diagnostic  '), 'diagnostic')
  assert.throws(() => validateChallengeAnswer(attempt.challengeId, '   '))
  assert.throws(() => validateChallengeAnswer('unknown', 'diagnostic'))
})

test('lost write acknowledgement recovers the same server attempt, including its later self-evaluation', async () => {
  const saved = { ...attempt, outcome: 'understood' as const }
  const confirmed = await acknowledgeChallengeAttempt(
    async () => { throw new Error('Lost acknowledgement') },
    async () => saved,
    attempt.challengeId, attempt.challengeVersion, attempt.answer,
  )
  assert.equal(confirmed.id, attempt.id)
  assert.equal(confirmed.outcome, 'understood')
  assert.ok(matchesAttemptSubmission(saved, attempt.challengeId, attempt.challengeVersion, attempt.answer))
})

test('a retry cannot confirm a different response, challenge or version under the same attempt ID', async () => {
  for (const patch of [{ answer: 'Autre réponse' }, { challengeId: 'docker-volumes-diagnostic' }, { challengeVersion: 2 }]) {
    await assert.rejects(acknowledgeChallengeAttempt(async () => {}, async () => ({ ...attempt, ...patch }),
      attempt.challengeId, attempt.challengeVersion, attempt.answer))
  }
  await assert.rejects(acknowledgeChallengeAttempt(async () => {}, async () => null,
    attempt.challengeId, attempt.challengeVersion, attempt.answer))
})

test('a successful client write alone cannot reveal correction before server confirmation', async () => {
  let release: ((value: ChallengeAttempt) => void) | undefined
  let acknowledged = false
  const server = new Promise<ChallengeAttempt>(resolve => { release = resolve })
  const result = acknowledgeChallengeAttempt(async () => {}, async () => server,
    attempt.challengeId, attempt.challengeVersion, attempt.answer).then(value => { acknowledged = true; return value })
  await Promise.resolve()
  await Promise.resolve()
  assert.equal(acknowledged, false)
  release!(attempt)
  assert.equal((await result).id, attempt.id)
  assert.equal(acknowledged, true)
})

test('two-field responses are trimmed, bounded, and preserve their immutable aggregation', () => {
  const form = validateChallengeForm(attempt.challengeId, '  Image v1  ', ' Recréer avec v2 ')
  assert.deepEqual(form, { observations: 'Image v1', actions: 'Recréer avec v2', answer: 'Image v1\n\nRecréer avec v2' })
  const current = { ...stored, version: 2, challengeVersion: 2, ...form }
  assert.deepEqual(decodeChallengeAttempt(id, current), { id, ...current })
  for (const patch of [{ observations: '' }, { actions: 'x'.repeat(2001) }, { answer: 'Autre réponse' }, { challengeVersion: 1 }, { observations: ' Image v1 ' }]) {
    assert.equal(decodeChallengeAttempt(id, { ...current, ...patch }), null)
  }
  assert.throws(() => validateChallengeForm(attempt.challengeId, 'x'.repeat(2000), 'y'.repeat(2000)))
  assert.equal(validateChallengeForm(attempt.challengeId, 'x'.repeat(1999), 'y'.repeat(1999)).answer.length, 4000)
})

test('historical corrections stay available alongside versioned dossiers', () => {
  for (const current of challenges) {
    assert.equal(current.version, 2)
    assert.ok(current.files.length >= 2)
    assert.ok(current.acceptableAlternatives.length > 0)
    const legacy = getChallengeVersion(current.id, 1)
    if (current.id.startsWith('docker-')) {
      assert.ok(legacy)
      assert.equal(legacy.version, 1)
      assert.ok(legacy.correction.length > 100)
    } else assert.equal(legacy, undefined)
  }
  assert.equal(getChallengeVersion(attempt.challengeId, 99), undefined)
})
