import plan from '../../../docs/content/curriculum.json' with { type: 'json' }
import type { Course } from '../../types/course'
import type { Lesson } from '../../types/lesson'
import { dockerLessons } from '../dockerCourse.ts'
import { cards as existingCards } from '../cards.ts'
import { assembleLesson } from './authoring.ts'
import { fundamentals } from './fundamentals.ts'
import { web } from './web.ts'
import { languages } from './languages.ts'
import { react } from './react.ts'
import { backend } from './backend.ts'
import { data } from './data.ts'
import { devops } from './devops.ts'
import { security } from './security.ts'
import { testing } from './testing.ts'
import { architecture } from './architecture.ts'
import { performance } from './performance.ts'
import { engineering } from './engineering.ts'
import { catalogVisuals } from './visuals.ts'

const drafts = [...fundamentals, ...web, ...languages, ...react, ...backend, ...data,
  ...devops, ...security, ...testing, ...architecture, ...performance, ...engineering]
const draftsById = new Map(drafts.map(draft => [draft.id, draft]))
if (draftsById.size !== drafts.length) throw new Error('Identifiant de rédaction dupliqué')

function illustrate(original: Lesson): Lesson {
  const lesson = structuredClone(original)
  const visual = catalogVisuals[lesson.id]
  if (!visual) return lesson
  const position = lesson.steps.findIndex(step => step.id === visual.placementStepId)
  const previous = lesson.steps[position]
  if (!previous || previous.type === 'question' || !previous.nextStepId) {
    throw new Error(`Placement d’image invalide : ${lesson.id}`)
  }
  const destination = previous.nextStepId
  previous.nextStepId = 'figure'
  lesson.steps.splice(position + 1, 0, {
    id: 'figure', type: 'image', src: visual.src, alt: visual.alt,
    caption: visual.caption, nextStepId: destination,
  })
  return lesson
}

const assembled = plan.courses.flatMap(course => course.lessons.map(metadata => {
  const existing = dockerLessons.find(lesson => lesson.id === metadata.id)
  if (existing) {
    return { lesson: illustrate(existing), cards: existing.cardIds.map(id => {
      const card = existingCards.find(entry => entry.id === id)
      if (!card) throw new Error(`Carte existante absente : ${id}`)
      return card
    }) }
  }
  const draft = draftsById.get(metadata.id)
  if (!draft) throw new Error(`Leçon non rédigée : ${metadata.id}`)
  const result = assembleLesson(draft, metadata.title, `${course.theme} · ${course.title}`)
  return { ...result, lesson: illustrate(result.lesson) }
}))

export const catalogCourses: Course[] = plan.courses.map(course => ({
  id: course.id, title: course.title, theme: course.theme,
  lessonIds: course.lessons.map(lesson => lesson.id),
}))
export const catalogLessons = assembled.map(entry => entry.lesson)
export const catalogCards = assembled.flatMap(entry => entry.cards)
