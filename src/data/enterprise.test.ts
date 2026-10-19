import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import type { EnterpriseCurriculum } from '../types/enterpriseContent.ts'

const curriculum = JSON.parse(readFileSync(new URL('../../shared/enterpriseCurriculum.json', import.meta.url), 'utf8')) as EnterpriseCurriculum
const presentation = JSON.parse(readFileSync(new URL('./enterprisePresentation.json', import.meta.url), 'utf8'))
const practices = JSON.parse(readFileSync(new URL('./enterprisePractices.json', import.meta.url), 'utf8')) as Record<string, {
  scenario: string; task: string; starter: string; checklist: string[]; example: string; explanation: string
}>
const assessmentKeys = JSON.parse(readFileSync(new URL('../../shared/enterpriseAssessmentKeys.json', import.meta.url), 'utf8')) as {
  version: number
  challenges: Record<string, Record<string, string>>
  explanations: Record<string, Record<string, string>>
}

test('enterprise exercise documents are visible at a real step and match the downloadable file', () => {
  for (const lesson of curriculum.lessons) {
    for (const document of lesson.documents ?? []) {
      assert.ok(lesson.steps.some(step => step.id === document.stepId && step.type === 'message'), lesson.id)
      assert.match(document.src, /^\/enterprise\/documents\/[a-z0-9-]+\.txt$/)
      const downloaded = readFileSync(new URL(`../../public${document.src}`, import.meta.url), 'utf8')
      assert.equal(downloaded.replace(/\r\n/g, '\n').trim(), document.text)
    }
  }
})

test('every enterprise practice has its case, task and commented comparison before the lesson questions', () => {
  const guidedPracticeLessons = curriculum.lessons
  assert.deepEqual(Object.keys(practices).sort(), guidedPracticeLessons.map(lesson => lesson.id).sort())
  for (const lesson of curriculum.lessons) {
    const practiceSteps = lesson.steps.filter(step => step.type === 'message' && step.text.startsWith('Pratique ·'))
    assert.equal(practiceSteps.length, 1, lesson.id)
    const practiceIndex = lesson.steps.indexOf(practiceSteps[0])
    assert.ok(lesson.steps.slice(practiceIndex + 1).some(step => step.type === 'question'), lesson.id)
    const activity = practices[lesson.id]
    for (const field of ['scenario', 'task', 'starter', 'example', 'explanation'] as const) assert.ok(activity[field].trim(), `${lesson.id}: ${field}`)
    assert.ok(activity.checklist.length >= 2 && activity.checklist.length <= 6, lesson.id)
    assert.equal(new Set(activity.checklist).size, activity.checklist.length, lesson.id)
  }
})

test('enterprise offers three independent practical tracks sharing a short foundation', () => {
  const guided = curriculum.lessons.filter((lesson) => !lesson.continuous)
  const continuing = curriculum.lessons.filter((lesson) => lesson.continuous)
  assert.equal(curriculum.version, 2)
  assert.equal(assessmentKeys.version, curriculum.version)
  assert.equal(curriculum.tracks?.length, 3)
  assert.equal(curriculum.foundationLessonIds?.length, 2)
  const known = new Map(curriculum.lessons.map(lesson => [lesson.id, lesson]))
  const trackLessons = new Set<string>()
  for (const track of curriculum.tracks ?? []) {
    assert.ok(track.outcome && track.audience && track.description, track.id)
    assert.equal(track.lessonIds.length, 6, track.id)
    assert.equal(track.challengeIds.length, 1, track.id)
    for (const id of track.lessonIds) {
      assert.ok(known.has(id), id)
      assert.ok(!trackLessons.has(id), `Specialized missions must not accidentally belong to two paths: ${id}`)
      trackLessons.add(id)
    }
    assert.ok(track.challengeIds.every(id => curriculum.challenges.some(challenge => challenge.id === id)))
    assert.deepEqual(known.get(track.lessonIds[0])?.prerequisiteLessonIds, curriculum.foundationLessonIds)
    for (let index = 1; index < track.lessonIds.length; index++) {
      assert.deepEqual(known.get(track.lessonIds[index])?.prerequisiteLessonIds, [track.lessonIds[index - 1]])
    }
    const challenge = curriculum.challenges.find(challenge => challenge.id === track.challengeIds[0])!
    assert.deepEqual(challenge.prerequisiteLessonIds, track.lessonIds)
  }
  assert.equal(trackLessons.size, 18)
  assert.equal(guided.length, 38)
  assert.equal(continuing.length, 2)
  for (const chapter of curriculum.chapters) {
    assert.ok(guided.some((lesson) => lesson.chapterId === chapter.id), chapter.id)
    assert.equal(curriculum.challenges.filter((challenge) => challenge.chapterId === chapter.id).length, 1)
  }
})

test('public enterprise figures stay aligned with the learning catalogue', () => {
  const tracks = curriculum.tracks ?? []
  const recommended = new Set([...(curriculum.foundationLessonIds ?? []), ...tracks.flatMap(track => track.lessonIds)])
  const minutes = curriculum.lessons.map(lesson => lesson.estimatedMinutes)
  assert.equal(presentation.lessons, curriculum.lessons.length)
  assert.equal(presentation.cards, curriculum.lessons.reduce((total, lesson) => total + lesson.cards.length, 0))
  assert.equal(presentation.challenges, curriculum.challenges.length)
  assert.equal(presentation.tracks, tracks.length)
  assert.equal(presentation.foundationLessons, curriculum.foundationLessonIds?.length)
  assert.ok(tracks.every(track => track.lessonIds.length === presentation.lessonsPerTrack))
  assert.equal(presentation.referenceLessons, curriculum.lessons.filter(lesson => !recommended.has(lesson.id)).length)
  assert.equal(presentation.minimumMinutes, Math.min(...minutes))
  assert.equal(presentation.maximumMinutes, Math.max(...minutes))
})

test('enterprise explicit prerequisites form a known acyclic curriculum', () => {
  const known = new Map(curriculum.lessons.map(lesson => [lesson.id, lesson]))
  const visit = (id: string, ancestors = new Set<string>()) => {
    assert.ok(!ancestors.has(id), `Cyclic lesson prerequisite: ${id}`)
    const lesson = known.get(id)
    assert.ok(lesson, `Unknown prerequisite: ${id}`)
    const required = lesson.prerequisiteLessonIds ?? []
    assert.equal(new Set(required).size, required.length, id)
    for (const previous of required) visit(previous, new Set([...ancestors, id]))
  }
  for (const id of known.keys()) visit(id)
  for (const id of curriculum.foundationLessonIds ?? []) assert.ok(known.has(id), id)
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
    assert.ok(Number.isInteger(lesson.estimatedMinutes) && lesson.estimatedMinutes >= 5 && lesson.estimatedMinutes <= 25, lesson.id)
    assert.ok(lesson.steps.length >= 4 && lesson.steps.length <= 8, lesson.id)
    const messages = lesson.steps.filter((step) => step.type === 'message')
    assert.ok(messages.length >= 3, lesson.id)
    assert.ok(messages.filter(step => !step.text.startsWith('Pratique ·')).every(step => step.text.trim().length > 0), lesson.id)
    assert.ok(messages.filter(step => step.text.startsWith('Pratique ·')).every(step => step.text.length >= 80), lesson.id)
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
  assert.ok(imageSteps.length >= 3)
  for (const image of imageSteps) {
    assert.ok(image.src.startsWith('/enterprise/'))
    assert.ok(image.alt.length > 50 && image.caption.length > 50)
    assert.ok(readFileSync(new URL(`../../public${image.src}`, import.meta.url)).length > 0, image.src)
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
