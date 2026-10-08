import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'
import { catalogCards, catalogCourses, catalogLessons } from '../data/catalog/index.ts'
import { indexLessonSteps } from '../lesson/lessonFlow.ts'
import { dockerLessons } from '../data/dockerCourse.ts'
import { catalogVisuals } from '../data/catalog/visuals.ts'
import corrections from '../data/catalog/corrections.json' with { type: 'json' }

test('the complete curriculum contains 150 lessons in 30 ordered courses without orphan cards', () => {
  const plan = JSON.parse(readFileSync(new URL('../../docs/content/curriculum.json', import.meta.url), 'utf8')) as {
    courses: { id: string, lessons: { id: string }[] }[]
  }
  assert.equal(catalogCourses.length, 30)
  assert.equal(catalogLessons.length, 150)
  assert.equal(new Set(catalogCourses.map((course) => course.id)).size, 30)
  assert.equal(new Set(catalogLessons.map((lesson) => lesson.id)).size, 150)
  assert.equal(new Set(catalogCards.map((card) => card.id)).size, catalogCards.length)
  const assignedLessons = catalogCourses.flatMap((course) => course.lessonIds)
  assert.equal(assignedLessons.length, 150)
  assert.equal(new Set(assignedLessons).size, 150)
  for (const course of catalogCourses) {
    assert.equal(course.lessonIds.length, 5, course.id)
    assert.deepEqual(course.lessonIds, plan.courses.find((entry) => entry.id === course.id)?.lessons.map((lesson) => lesson.id), course.id)
    assert.ok(course.lessonIds.every((id) => catalogLessons.some((lesson) => lesson.id === id)), course.id)
  }
  const assignedCards = catalogLessons.flatMap((lesson) => lesson.cardIds)
  assert.equal(new Set(assignedCards).size, assignedCards.length)
  assert.deepEqual(new Set(assignedCards), new Set(catalogCards.map((card) => card.id)))
  for (const card of catalogCards) {
    assert.ok(card.question.trim() && card.answer.trim(), card.id)
  }
  for (const existing of dockerLessons) {
    const lesson = catalogLessons.find((entry) => entry.id === existing.id)
    assert.ok(lesson, existing.id)
    assert.deepEqual(lesson.cardIds, existing.cardIds, `${existing.id}: preserve learned card identifiers`)
  }
})

test('every lesson has reachable terminating routes, recall cards and valid local images', () => {
  for (const lesson of catalogLessons) {
    const steps = indexLessonSteps(lesson)
    const visited = new Set<string>()
    const active = new Set<string>()
    function visit(id: string) {
      assert.ok(!active.has(id), `${lesson.id}: cycle at ${id}`)
      if (visited.has(id)) return
      active.add(id)
      visited.add(id)
      const step = steps.get(id)!
      if (step.type === 'question') {
        assert.ok(step.prompt.trim(), lesson.id)
        assert.ok(step.choices.length >= 2, lesson.id)
        for (const choice of step.choices) {
          assert.ok(choice.label.trim() && choice.feedback.trim(), lesson.id)
          visit(choice.nextStepId)
        }
      } else {
        if (step.type === 'message') assert.ok(step.text.trim(), lesson.id)
        if (step.type === 'image') {
          assert.ok(step.alt.trim(), lesson.id)
          assert.ok(step.src.startsWith('/') && !step.src.includes('..'), `${lesson.id}: local image required`)
          assert.ok(existsSync(new URL(`../../public${step.src}`, import.meta.url)), `${lesson.id}: ${step.src}`)
        }
        if (step.nextStepId) visit(step.nextStepId)
      }
      active.delete(id)
    }
    visit(lesson.firstStepId)
    assert.equal(visited.size, steps.size, `${lesson.id}: unreachable content`)
    assert.ok(lesson.steps.some((step) => step.type === 'question'), lesson.id)
    assert.ok(lesson.cardIds.length >= 3 && lesson.cardIds.length <= 5, lesson.id)
    assert.ok(lesson.estimatedMinutes > 0, lesson.id)
  }
})

test('all thirty diagrams are integrated into their intended lessons and every course has an illustration', () => {
  assert.equal(Object.keys(catalogVisuals).length, 30)
  const assets = readdirSync(new URL('../../public/lessons/catalog/', import.meta.url)).filter((file) => file.endsWith('.svg'))
  assert.deepEqual(new Set(assets), new Set(Object.values(catalogVisuals).map((visual) => visual.src.split('/').at(-1))))
  for (const [lessonId, visual] of Object.entries(catalogVisuals)) {
    const lesson = catalogLessons.find((entry) => entry.id === lessonId)
    assert.ok(lesson, lessonId)
    const approvedAlt = corrections.entries.filter(entry => entry.lessonId === lessonId).flatMap(entry => entry.patches)
      .filter(patch => patch.target === 'step' && patch.id === 'figure' && patch.field === 'alt').at(-1)?.value ?? visual.alt
    assert.ok(lesson.steps.some((step) => step.type === 'image' && step.src === visual.src && step.alt === approvedAlt), lessonId)
  }
  for (const course of catalogCourses) {
    assert.ok(course.lessonIds.some((id) => catalogLessons.find((lesson) => lesson.id === id)?.steps.some((step) => step.type === 'image')), course.id)
  }
})

test('the authoring graph does not always reveal the correct answer by its position', () => {
  const positions = new Set(catalogLessons.flatMap((lesson) => lesson.steps.flatMap((step) => {
    if (step.type !== 'question' || !step.choices.some((choice) => choice.id === 'apply')) return []
    return [step.choices.findIndex((choice) => choice.id === 'apply')]
  })))
  assert.ok(positions.has(0) && positions.has(1))
})
