import type { Course } from '../types/course.ts'
import type { Lesson } from '../types/lesson.ts'
import type { LearningProgress } from '../types/progress.ts'
import { localDay } from './dailyQueue.ts'

export function planCourse(course: Course, lessons: Lesson[], progress: LearningProgress, now = new Date()) {
  const orderedLessons = course.lessonIds.map((id) => {
    const lesson = lessons.find((candidate) => candidate.id === id)
    if (!lesson) throw new Error(`Leçon introuvable : ${id}`)
    return lesson
  })
  if (new Set(course.lessonIds).size !== course.lessonIds.length) throw new Error('Leçons dupliquées dans le parcours')
  const completed = orderedLessons.filter((lesson) => Object.hasOwn(progress.completedLessons, lesson.id))
  const nextLesson = orderedLessons.find((lesson) => !Object.hasOwn(progress.completedLessons, lesson.id))
  const pendingCardIds = [...new Set(completed.flatMap((lesson) => lesson.cardIds))]
    .filter((id) => !Object.hasOwn(progress.cards, id))
  const learnedToday = Object.values(progress.completedLessons).some((date) => localDay(new Date(date)) === localDay(now))
  return {
    completedCount: completed.length,
    nextLesson,
    lesson: nextLesson,
    pendingCardIds,
    learnedToday,
  }
}
