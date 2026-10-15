import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import type { EnterpriseCurriculum } from '../types/enterpriseContent.ts'

const curriculum = JSON.parse(readFileSync(new URL('../../shared/enterpriseCurriculum.json', import.meta.url), 'utf8')) as EnterpriseCurriculum
const assessmentKeys = JSON.parse(readFileSync(new URL('../../shared/enterpriseAssessmentKeys.json', import.meta.url), 'utf8')) as {
  version: number
  challenges: Record<string, Record<string, string>>
  explanations: Record<string, Record<string, string>>
}

test('enterprise has a complete ordered 20-mission programme and separate continuing practice', () => {
  const guided = curriculum.lessons.filter((lesson) => !lesson.continuous)
  const continuing = curriculum.lessons.filter((lesson) => lesson.continuous)
  assert.equal(curriculum.chapters.length, 8)
  assert.equal(guided.length, 20)
  assert.equal(continuing.length, 2)
  assert.deepEqual(curriculum.lessons.slice(20), continuing)
  for (const chapter of curriculum.chapters) {
    assert.ok(guided.some((lesson) => lesson.chapterId === chapter.id), chapter.id)
    assert.equal(curriculum.challenges.filter((challenge) => challenge.chapterId === chapter.id).length, 1)
  }
})

test('enterprise identifiers are unique, stable and isolated from developer content', () => {
  const ids: string[] = []
  for (const chapter of curriculum.chapters) ids.push(chapter.id)
  for (const lesson of curriculum.lessons) ids.push(lesson.id, ...lesson.steps.map((step) => step.id), ...lesson.cards.map((card) => card.id))
  for (const challenge of curriculum.challenges) ids.push(challenge.id, ...challenge.questions.map((question) => question.id))
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(ids.every((id) => id.startsWith('ent-')))
  const chapters = new Set(curriculum.chapters.map((chapter) => chapter.id))
  assert.ok(curriculum.lessons.every((lesson) => chapters.has(lesson.chapterId)))
  assert.ok(curriculum.challenges.every((challenge) => chapters.has(challenge.chapterId)))
})

test('each enterprise mission teaches, diagnoses twice with feedback and includes retrieval cards', () => {
  for (const lesson of curriculum.lessons) {
    assert.ok(lesson.estimatedMinutes >= 10 && lesson.estimatedMinutes <= 15, lesson.id)
    assert.ok(lesson.steps.length >= 4 && lesson.steps.length <= 8, lesson.id)
    const messages = lesson.steps.filter((step) => step.type === 'message')
    assert.ok(messages.length >= 3, lesson.id)
    assert.ok(messages.every((step) => step.text.length >= 200), lesson.id)
    const questions = lesson.steps.filter((step) => step.type === 'question')
    assert.equal(questions.length, 2, lesson.id)
    for (const question of questions) {
      assert.equal(question.options.length, 3)
      assert.equal(question.options.filter((option) => option.id === question.correctOptionId).length, 1)
      assert.ok(question.options.every((option) => option.feedback.length > 25), question.id)
      assert.equal(new Set(question.options.map((option) => option.text)).size, question.options.length)
    }
    assert.ok(lesson.cards.length >= 3 && lesson.cards.length <= 5, lesson.id)
    assert.ok(lesson.cards.every((card) => card.question.length > 25 && card.answer.length > 30), lesson.id)
    assert.ok(lesson.sources.length > 0 && lesson.sources.every((url) => url.startsWith('https://')), lesson.id)
  }
})

test('every enterprise challenge has a self-contained dossier and five private keyed questions', () => {
  assert.deepEqual(Object.keys(assessmentKeys.challenges).sort(), curriculum.challenges.map((challenge) => challenge.id).sort())
  for (const challenge of curriculum.challenges) {
    assert.ok(challenge.scenario.length > 60, challenge.id)
    assert.ok(challenge.files.length >= 2 && challenge.files.every((file) => file.content.length > 80), challenge.id)
    assert.equal(challenge.questions.length, 5, challenge.id)
    const answers = assessmentKeys.challenges[challenge.id]
    const explanations = assessmentKeys.explanations[challenge.id]
    assert.deepEqual(Object.keys(answers).sort(), challenge.questions.map((question) => question.id).sort())
    for (const question of challenge.questions) {
      assert.equal(question.options.length, 3)
      assert.equal(question.options.filter((option) => option.id === answers[question.id]).length, 1)
      assert.ok(!('correctOptionId' in question))
      assert.ok(question.options.every((option) => !('feedback' in option)))
      assert.ok(explanations[question.id].length > 100, question.id)
    }
  }
})

test('enterprise public adapter cannot import assessment keys and challenge JSON contains no answers', () => {
  const adapter = readFileSync(new URL('./enterprise.ts', import.meta.url), 'utf8')
  assert.ok(!adapter.includes('enterpriseAssessmentKeys'))
  assert.ok(!JSON.stringify(curriculum.challenges).includes('correctOptionId'))
  assert.ok(!JSON.stringify(curriculum.challenges).includes('explanations'))
  const imageSteps = curriculum.lessons.flatMap((lesson) => lesson.steps.filter((step) => step.type === 'image'))
  assert.equal(imageSteps.length, 3)
  for (const image of imageSteps) {
    assert.ok(image.src.startsWith('/enterprise/'))
    assert.ok(image.alt.length > 50 && image.caption.length > 50)
  }
})

test('private key sets support meaningful perfect, partial and incorrect challenge outcomes', () => {
  for (const challenge of curriculum.challenges) {
    const answers = assessmentKeys.challenges[challenge.id]
    const score = (submitted: Record<string, string>) => challenge.questions.filter((question) => submitted[question.id] === answers[question.id]).length / challenge.questions.length
    const wrong = Object.fromEntries(challenge.questions.map((question) => [question.id, question.options.find((option) => option.id !== answers[question.id])!.id]))
    const partial = { ...answers, [challenge.questions[0].id]: wrong[challenge.questions[0].id] }
    assert.equal(score(answers), 1)
    assert.equal(score(wrong), 0)
    assert.equal(score(partial), 0.8)
    assert.ok(score(partial) > 0.7)
  }
})
