import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { emptyLessonDraft, isValidLessonDraft, lessonContentVersion, lessonDraftKey } from './lessonResume.ts'
import type { EnterpriseLesson } from '../types/enterpriseContent'
import type { EnterpriseLessonDraftState } from '../types/enterprise'

const curriculum = JSON.parse(readFileSync(new URL('../../shared/enterpriseCurriculum.json', import.meta.url), 'utf8'))
const lesson = curriculum.lessons.find((item: EnterpriseLesson) => item.id === 'ent-plausible-not-proven') as EnterpriseLesson
function openedPractice() {
  const index = lesson.steps.findIndex(step => step.type === 'message' && step.text.startsWith('Pratique ·'))
  const questions = lesson.steps.slice(0, index).filter(step => step.type === 'question')
  return { ...emptyLessonDraft(lesson), stepId: lesson.steps[index].id, answers: Object.fromEntries(questions.map(step => [step.id, step.correctOptionId])), checkedIds: questions.map(step => step.id) }
}

test('resume restores wrong checked answers while rejecting skipped prerequisite questions', () => {
  const questionIndex = lesson.steps.findIndex(step => step.type === 'question')
  const question = lesson.steps[questionIndex]
  assert.equal(question.type, 'question')
  if (question.type !== 'question') return
  const state = { ...emptyLessonDraft(lesson), stepId: question.id, answers: { [question.id]: question.options.find(option => option.id !== question.correctOptionId)!.id }, checkedIds: [question.id] }
  assert.equal(isValidLessonDraft(lesson, state), true)
  const advanced = { ...state, stepId: lesson.steps[questionIndex + 1].id }
  assert.equal(isValidLessonDraft(lesson, advanced), true)
  assert.equal(isValidLessonDraft(lesson, { ...advanced, answers: { [question.id]: question.correctOptionId } }), true)
  assert.equal(isValidLessonDraft(lesson, { ...advanced, answers: { [question.id]: question.correctOptionId }, checkedIds: [] }), false)
})

test('resume rejects unknown steps, future answers, checks without answers and foreign diagnostics', () => {
  const firstQuestion = lesson.steps.find(step => step.type === 'question')!
  assert.equal(isValidLessonDraft(lesson, { ...emptyLessonDraft(lesson), stepId: 'unknown' }), false)
  assert.equal(isValidLessonDraft(lesson, { ...emptyLessonDraft(lesson), answers: { [firstQuestion.id]: 'unknown' } }), false)
  assert.equal(isValidLessonDraft(lesson, { ...emptyLessonDraft(lesson), checkedIds: ['unknown'] }), false)
  assert.equal(isValidLessonDraft(lesson, { ...emptyLessonDraft(lesson), practiceAnswers: { delay: 'contradicted', fees: 'unverified' } }), false)
  assert.equal(isValidLessonDraft(lesson, { ...openedPractice(), practiceAnswers: { delay: 'contradicted', fees: 'unverified' } }), true)
  assert.equal(isValidLessonDraft(lesson, { ...emptyLessonDraft(lesson), practiceAnswers: { delay: 'wrong' } }), false)
  assert.equal(isValidLessonDraft(lesson, { ...emptyLessonDraft(lesson), practiceAnswers: { foreign: 'supported' } }), false)
  const other = curriculum.lessons.find((item: EnterpriseLesson) => item.id === 'ent-answer-or-action')
  assert.equal(isValidLessonDraft(other, { ...emptyLessonDraft(other), practiceAnswers: { delay: 'contradicted' } }), false)
})

test('resume accepts activity text only once the activity is open and enforces the server payload size', () => {
  assert.equal(isValidLessonDraft(lesson, { ...emptyLessonDraft(lesson), draft: 'Une réponse fictive' }), false)
  assert.equal(isValidLessonDraft(lesson, { ...openedPractice(), draft: 'Une réponse fictive' }), true)
  assert.equal(isValidLessonDraft(lesson, { ...openedPractice(), draft: 'x'.repeat(5001) }), false)
  assert.equal(isValidLessonDraft(lesson, { ...openedPractice(), hidden: 'future data' }), false)
})

test('resume dirty comparison ignores object and checked-id order while preserving text and choices', () => {
  const state = { ...emptyLessonDraft(lesson), answers: { z: 'two', a: 'one' }, checkedIds: ['z', 'a'], draft: 'Un texte fictif' }
  const reordered = { ...state, answers: { a: 'one', z: 'two' }, checkedIds: ['a', 'z'] }
  assert.equal(lessonDraftKey(state), lessonDraftKey(reordered))
  assert.notEqual(lessonDraftKey(state), lessonDraftKey({ ...state, draft: 'Autre texte fictif' }))
  assert.notEqual(lessonDraftKey(state), lessonDraftKey({ ...state, practiceAnswers: { delay: 'supported' } }))
})

test('resume fingerprint includes the exact public activity as well as the lesson', async () => {
  const practices = JSON.parse(readFileSync(new URL('../data/enterprisePractices.json', import.meta.url), 'utf8'))
  const expected = createHash('sha256').update(JSON.stringify({ lesson, practice: practices[lesson.id] ?? null })).digest('hex')
  assert.equal(await lessonContentVersion(lesson), expected)
  assert.notEqual(expected, createHash('sha256').update(JSON.stringify(lesson)).digest('hex'))
  assert.notEqual(expected, createHash('sha256').update(JSON.stringify({ lesson, practice: { ...practices[lesson.id], task: 'Consigne changée' } })).digest('hex'))
})

test('first mission restores either conversational choice but cannot skip an unanswered exchange', () => {
  const pilot = curriculum.lessons.find((item: EnterpriseLesson) => item.id === 'ent-answer-or-action') as EnterpriseLesson
  const first = pilot.steps[0]
  assert.equal(first.type, 'message')
  if (first.type !== 'message' || !first.choices) return assert.fail('The pilot needs conversational choices')
  const empty = emptyLessonDraft(pilot)
  assert.equal(isValidLessonDraft(pilot, empty), true)
  assert.equal(isValidLessonDraft(pilot, { ...empty, stepId: pilot.steps[1].id }), false)
  for (const choice of first.choices) {
    const answered: EnterpriseLessonDraftState = { ...empty, answers: { [first.id]: choice.id }, checkedIds: [first.id] }
    assert.equal(isValidLessonDraft(pilot, answered), true)
    assert.equal(isValidLessonDraft(pilot, { ...answered, stepId: pilot.steps[1].id }), true)
    assert.equal(isValidLessonDraft(pilot, { ...answered, checkedIds: [], stepId: pilot.steps[1].id }), false)
  }
  assert.equal(isValidLessonDraft(pilot, { ...empty, answers: { [first.id]: 'invented' } }), false)
  assert.equal(isValidLessonDraft(pilot, { ...empty, answers: { [pilot.steps[1].id]: 'choice-1' } }), false)
})

test('pilot draft can advance after a checked wrong assessment answer without rewriting it', () => {
  const pilot = curriculum.lessons.find((item: EnterpriseLesson) => item.id === 'ent-answer-or-action') as EnterpriseLesson
  const questions = pilot.steps.filter(step => step.type === 'question')
  const previous = pilot.steps.slice(0, pilot.steps.indexOf(questions[1]))
  const answers: Record<string,string> = {}
  for (const step of previous) {
    if (step.type === 'message' && step.choices) answers[step.id] = step.choices[0].id
    if (step.type === 'question') answers[step.id] = step.options.find(option => option.id !== step.correctOptionId)!.id
  }
  const state: EnterpriseLessonDraftState = { ...emptyLessonDraft(pilot), stepId: questions[1].id, answers, checkedIds: Object.keys(answers) }
  assert.equal(isValidLessonDraft(pilot, state), true)
  assert.equal(isValidLessonDraft(pilot, { ...state, checkedIds: state.checkedIds.filter(id => id !== questions[0].id) }), false)
})
