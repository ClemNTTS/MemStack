import curriculum from '../../docs/content/curriculum.json'
import { catalogCourses, catalogLessons, catalogCards } from '../data/catalog'
import type { LearningProgress } from '../types/progress'
import type { Course } from '../types/course'

export const themes = curriculum.themes
export function courseMetadata(id: string) { return curriculum.courses.find(course => course.id === id) }
export function prerequisitesLabel(id: string) {
  const text = courseMetadata(id)?.prerequisites ?? ''
  return catalogCourses.reduce((label, course) => label.replaceAll(course.id, course.title), text).replaceAll('`', '')
}
export function completedCount(course: Course, progress: LearningProgress) {
  return course.lessonIds.filter(id => Object.hasOwn(progress.completedLessons, id)).length
}
export function learningStats(progress: LearningProgress) {
  const completed = catalogLessons.filter(lesson => Object.hasOwn(progress.completedLessons, lesson.id)).length
  const learned = catalogCards.filter(card => Object.hasOwn(progress.cards, card.id)).length
  const due = catalogCards.filter(card => progress.cards[card.id] && Date.parse(progress.cards[card.id].dueAt) <= Date.now()).length
  return { completed, learned, due }
}
export function badgesFor(progress: LearningProgress) {
  const stats = learningStats(progress)
  const originalDocker = ['docker-images-containers', 'docker-volumes-persistence', 'docker-ports-networks']
  return [
    { symbol: '✦', title: 'Premier déclic', description: 'Terminer ta première leçon.', unlocked: stats.completed > 0 },
    { symbol: '↺', title: 'Mémoire en mouvement', description: 'Répondre à ta première carte de révision.', unlocked: progress.history.some(event => event.kind === 'review') },
    { symbol: '◇', title: 'Cap sur Docker', description: 'Terminer les trois premières leçons Docker.', unlocked: originalDocker.every(id => Object.hasOwn(progress.completedLessons, id)) },
    { symbol: '◎', title: 'Un chemin parcouru', description: 'Terminer toutes les leçons d’un parcours.', unlocked: catalogCourses.some(course => completedCount(course, progress) === course.lessonIds.length) },
  ]
}
export function CourseProgress({ course, progress }: { course: Course, progress: LearningProgress }) {
  const count = completedCount(course, progress)
  return <div className="course-overview"><span>{count} / {course.lessonIds.length} leçons terminées</span><progress aria-label={`Progression de ${course.title}`} max={course.lessonIds.length} value={count} /></div>
}
export function PageHeading({ eyebrow, title, description }: { eyebrow: string, title: string, description: string }) {
  return <header className="catalog-heading"><p className="lesson-category">{eyebrow}</p><h1>{title}</h1><p>{description}</p></header>
}
