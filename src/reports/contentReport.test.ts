import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash } from 'node:crypto'
import { analysisReportContext, cardReportContext, challengeReportContext, contentVersion, lessonReportContext, validateContentReport } from './contentReport.ts'
import type { Challenge, ChallengeAnalysis, ChallengeAttempt } from '../types/challenge.ts'
import type { Lesson } from '../types/lesson.ts'

const card = { id: 'docker-card', question: 'Question ?', answer: 'Réponse' }
const lesson: Lesson = { id: 'docker-lesson', title: 'Docker', category: 'DevOps', estimatedMinutes: 3, firstStepId: 'intro', steps: [{ id: 'intro', type: 'message', text: 'Bonjour' }], cardIds: [card.id] }
const input = { ...cardReportContext(card, [lesson]), kind: 'factual' as const, comment: ' Exemple incorrect ', contentVersion: 'a'.repeat(64) }

test('card report uses the canonical lesson and only reported card content', () => {
  assert.deepEqual(cardReportContext(card, [lesson]), { lessonId: lesson.id, cardId: card.id, contentSnapshot: JSON.stringify({ card }) })
  assert.throws(() => cardReportContext(card, []))
})

test('challenge and analysis reports preserve exact versions but never include learner answers', () => {
  const challenge = { id: 'challenge-a', version: 2, rubricVersion: 3 } as Challenge
  const attempt = { id: 'attempt-1', challengeId: challenge.id, answer: 'PRIVATE ANSWER' } as ChallengeAttempt
  const analysis: ChallengeAnalysis = { status: 'completed', message: 'Un retour', challengeVersion: 1, rubricVersion: 2, model: 'model-1', promptVersion: 'prompt-4', verdict: 'retry' }
  const context = analysisReportContext(challenge, attempt, analysis)
  assert.equal(context.challengeVersion, 1)
  assert.equal(context.rubricVersion, 2)
  assert.equal(context.attemptId, attempt.id)
  assert.equal(context.contentSnapshot.includes(attempt.answer), false)
  assert.equal(validateContentReport({ ...context, kind: 'other', comment: 'Retour incohérent', contentVersion: 'a'.repeat(64) }).targetType, 'analysis')
  assert.throws(() => analysisReportContext(challenge, attempt, { ...analysis, status: 'processing' }))
  const dossier = challengeReportContext(challenge)
  assert.equal(validateContentReport({ ...dossier, kind: 'other', comment: 'Dossier ambigu', contentVersion: 'a'.repeat(64) }).challengeVersion, 2)
  assert.throws(() => validateContentReport({ ...dossier, kind: 'other', comment: 'Dossier ambigu', contentVersion: 'a'.repeat(64), attemptId: 'not-empty' }))
})

test('lesson snapshot retains graph and cards in lesson order', () => {
  assert.deepEqual(JSON.parse(lessonReportContext(lesson, [card]).contentSnapshot), { lesson, cards: [card] })
  assert.throws(() => lessonReportContext(lesson, []))
})

test('content version matches worker SHA-256 over UTF-8, including accents', async () => {
  assert.equal(await contentVersion(input.contentSnapshot), createHash('sha256').update(input.contentSnapshot, 'utf8').digest('hex'))
  assert.notEqual(await contentVersion(input.contentSnapshot), await contentVersion(input.contentSnapshot + ' '))
})

test('report trims comment and rejects empty, oversized or invalid fields', () => {
  assert.equal(validateContentReport(input).comment, 'Exemple incorrect')
  for (const patch of [{ comment: ' ' }, { comment: 'a'.repeat(2001) }, { contentSnapshot: 'x'.repeat(12001) }, { contentSnapshot: '' }, { contentVersion: 'bad' }, { lessonId: '../bad' }, { cardId: '../bad' }, { kind: 'unsupported' }]) {
    assert.throws(() => validateContentReport({ ...input, ...patch } as typeof input))
  }
  assert.equal(validateContentReport({ ...input, cardId: '', comment: 'a'.repeat(2000), contentSnapshot: 'x'.repeat(12000) }).comment.length, 2000)
})
