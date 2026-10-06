import test from 'node:test'
import assert from 'node:assert/strict'
import { applyContentCorrections } from './corrections.ts'
import type { Lesson } from '../../types/lesson'

const lesson: Lesson = {
  id: 'lesson-one', title: 'Title', category: 'Test', estimatedMinutes: 3,
  firstStepId: 'start', cardIds: ['card-one'],
  steps: [{ id: 'start', type: 'message', text: 'Original' }],
}
const original = [{ lesson, cards: [{ id: 'card-one', question: 'Question', answer: 'Answer' }] }]
const correction = {
  reportId: 'report-one', lessonId: lesson.id, cardId: 'card-one', contentVersion: 'a'.repeat(64),
  sources: ['https://docs.docker.com/'], reason: 'Clarify the answer',
  patches: [{ target: 'card', id: 'card-one', field: 'answer', value: 'Corrected answer' }],
}
const file = (entry: unknown) => ({ version: 1, entries: [entry] })

test('corrections preserve learning IDs, transitions and original objects', () => {
  const result = applyContentCorrections(original, file(correction))
  assert.equal(result[0].cards[0].answer, 'Corrected answer')
  assert.equal(original[0].cards[0].answer, 'Answer')
  assert.deepEqual(result[0].lesson, lesson)
  assert.equal(result[0].cards[0].id, 'card-one')
})

test('a card report cannot change other cards or the lesson', () => {
  for (const patch of [
    { target: 'card', id: 'another-card', field: 'answer', value: 'No' },
    { target: 'lesson', id: lesson.id, field: 'title', value: 'No' },
    { target: 'step', id: 'start', field: 'text', value: 'No' },
  ]) assert.throws(() => applyContentCorrections(original, file({ ...correction, patches: [patch] })))
})

test('nontext fields and prototype keys are refused', () => {
  for (const field of ['id', '__proto__', 'constructor', 'nextStepId', 'src']) {
    assert.throws(() => applyContentCorrections(original, file({
      ...correction, patches: [{ ...correction.patches[0], field }],
    })))
  }
})

test('duplicate reports and duplicate fields are refused', () => {
  assert.throws(() => applyContentCorrections(original, { version: 1, entries: [correction, correction] }))
  assert.throws(() => applyContentCorrections(original, file({ ...correction, patches: [correction.patches[0], correction.patches[0]] })))
})

test('lesson corrections remain scoped to the existing graph', () => {
  const result = applyContentCorrections(original, file({ ...correction, cardId: '',
    patches: [{ target: 'step', id: 'start', field: 'text', value: 'Clearer message' }],
  }))
  assert.equal(result[0].lesson.steps[0].type === 'message' && result[0].lesson.steps[0].text, 'Clearer message')
  assert.equal(result[0].lesson.firstStepId, 'start')
  assert.throws(() => applyContentCorrections(original, file({ ...correction, cardId: '',
    patches: [{ target: 'step', id: 'missing', field: 'text', value: 'Not a new step' }],
  })))
})
