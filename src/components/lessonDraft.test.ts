import assert from 'node:assert/strict'
import test from 'node:test'
import { lessonDraftKey, restoreLessonHistory } from '../lesson/lessonDraft.ts'
import type { Lesson } from '../types/lesson.ts'

const lesson: Lesson = {
  id: 'draft-test', title: 'Test', category: 'Test', estimatedMinutes: 1, cardIds: [], firstStepId: 'intro',
  steps: [
    { id: 'intro', type: 'message', text: 'Introduction', nextStepId: 'question' },
    { id: 'question', type: 'question', prompt: 'Choisir', choices: [
      { id: 'yes', label: 'Oui', feedback: 'Oui', nextStepId: 'end' },
      { id: 'no', label: 'Non', feedback: 'Non', nextStepId: 'correction' },
    ] },
    { id: 'correction', type: 'message', text: 'Correction', nextStepId: 'end' },
    { id: 'end', type: 'message', text: 'Fin' },
  ],
}
const encode = (history: unknown) => JSON.stringify({ version: 1, history })

test('a lesson draft restores the chosen branch and the current unanswered question', () => {
  const branch = [{ id: 'intro' }, { id: 'question', selectedChoiceId: 'no' }, { id: 'correction' }]
  assert.deepEqual(restoreLessonHistory(lesson, encode(branch)), branch)
  const question = [{ id: 'intro' }, { id: 'question' }]
  assert.deepEqual(restoreLessonHistory(lesson, encode(question)), question)
})

test('invalid, outdated and disconnected drafts restart safely', () => {
  const initial = [{ id: 'intro' }]
  for (const raw of [null, '{bad', 'null', encode([]), encode([{ id: 'end' }]), encode([{ id: 'intro' }, { id: 'missing' }]), encode([{ id: 'intro' }, { id: 'question', selectedChoiceId: 'missing' }]), encode([{ id: 'intro' }, { id: 'question' }, { id: 'end' }]), encode([{ id: 'intro' }, { id: 'question', selectedChoiceId: 'no' }, { id: 'end' }])]) {
    assert.deepEqual(restoreLessonHistory(lesson, raw), initial)
  }
})

test('draft keys isolate accounts and lessons', () => {
  assert.notEqual(lessonDraftKey('alice', 'one'), lessonDraftKey('bob', 'one'))
  assert.notEqual(lessonDraftKey('alice', 'one'), lessonDraftKey('alice', 'two'))
})
