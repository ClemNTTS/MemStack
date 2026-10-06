import assert from 'node:assert/strict'
import test from 'node:test'
import { catalogCourses, catalogLessons } from '../data/catalog/index.ts'
import { challenges } from '../data/challenges.ts'
import { acknowledgeChallengeAttempt, decodeChallengeAttempt, matchesAttemptSubmission, validateChallengeAnswer } from './attemptModel.ts'
import type { ChallengeAttempt } from '../types/challenge'

const attempt: ChallengeAttempt = {
  id: 'test-attempt', version: 1, challengeId: 'docker-images-diagnostic', challengeVersion: 1,
  answer: 'Je recrée le conteneur avec la nouvelle image, après vérification des données.',
  submittedAt: '2026-10-06T12:00:00.000Z', outcome: '',
}
const { id, ...stored } = attempt

test('challenge catalogue references existing lessons and primary sources without altering discovery', () => {
  assert.equal(challenges.length, 3)
  assert.equal(new Set(challenges.map(challenge => challenge.id)).size, challenges.length)
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
      assert.equal(url.hostname, 'docs.docker.com')
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
