import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { gradeChallengeSelections, validateCheckedSubmission } from './challengeChecks.mjs'

const read = name => JSON.parse(readFileSync(new URL(`../../shared/${name}.json`, import.meta.url), 'utf8'))

test('all 36 current dossiers have private deterministic keys and complete independent student fixtures', () => {
  const dossiers = read('challengeDossiers').challenges.filter(entry => entry.version === 2)
  const questions = read('challengeQuestions').challenges
  const keys = read('challengeAnswerKeys').challenges
  const strong = read('challengeStrongStudentCases').cases
  const weak = read('challengeWeakStudentCases').cases
  assert.equal(dossiers.length, 36)
  const expectedIds = dossiers.map(entry => entry.id).sort()
  for (const entries of [questions, keys]) {
    assert.deepEqual(entries.map(entry => entry.id).sort(), expectedIds)
    assert.equal(new Set(entries.map(entry => entry.id)).size, 36)
  }
  for (const cases of [strong, weak]) assert.deepEqual(cases.map(entry => entry.challengeId).sort(), expectedIds)
  for (const dossier of dossiers) {
    const challenge = questions.find(entry => entry.id === dossier.id)
    const key = keys.find(entry => entry.id === dossier.id)
    assert.equal(challenge.challengeVersion, 3)
    assert.equal(challenge.rubricVersion, 2)
    assert.equal(challenge.questions.length, 3)
    assert.equal(new Set(challenge.questions.map(question => question.id)).size, 3)
    assert.deepEqual(challenge.questions.map(question => question.checkpointIndex).sort(), [0, 1, 2])
    for (const question of challenge.questions) {
      assert.ok(question.prompt.length > 15, `${dossier.id}: question spécifique requise`)
      assert.ok(!Object.hasOwn(question, 'explanation'))
      assert.ok(key.questions.find(entry => entry.id === question.id).explanation.length > 30)
      assert.ok(question.options.length >= 3)
      assert.equal(new Set(question.options.map(option => option.id)).size, question.options.length)
      assert.equal(new Set(question.options.map(option => option.text)).size, question.options.length)
      assert.ok(!Object.hasOwn(question, 'correctOptionIds'))
      assert.ok(!Object.hasOwn(question, 'correct'))
    }
    for (const [cases, kind] of [[strong, 'strong'], [weak, 'weak']]) {
      const student = cases.find(entry => entry.challengeId === dossier.id)
      const payload = { attemptId: `student-${kind}`, challengeId: student.challengeId, challengeVersion: student.challengeVersion, selections: student.selections }
      const validated = validateCheckedSubmission(payload, questions)
      const result = gradeChallengeSelections(validated.challenge, key, validated.selections)
      assert.equal(result.verdict, kind === 'strong' ? 'validated' : 'retry', `${dossier.id}: étudiant ${kind}`)
      if (kind === 'weak') assert.ok(result.correctCount <= 1, `${dossier.id}: erreurs faibles insuffisantes`)
      else assert.equal(result.correctCount, result.totalCount, `${dossier.id}: étudiant fort`)
    }
  }
})
