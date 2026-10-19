import test from 'node:test'
import assert from 'node:assert/strict'
import { guidedPracticeAnswer } from './practiceAnswer.ts'

test('two-part practice only submits after both learner fields contain text', () => {
  for (const draft of ['', '\n\n', 'Préparer un brouillon', 'Préparer un brouillon\n\n  ', '  \n\nEnvoyer le mail']) {
    assert.equal(guidedPracticeAnswer('ent-answer-or-action', draft), '')
  }
  assert.equal(guidedPracticeAnswer('ent-answer-or-action', 'Préparer un brouillon\n\nRelire et envoyer'), 'Ce que Léa peut demander à son assistant IA : Préparer un brouillon\nCe qu’elle doit faire elle-même : Relire et envoyer')
})

test('a free-form prompt keeps its paragraphs without adding instructions to the answer', () => {
  const draft = 'Prépare un mail pour mon client.\n\nPropose lundi ou mercredi, réponse avant vendredi.'
  assert.equal(guidedPracticeAnswer('ent-useful-request', draft), draft)
})
