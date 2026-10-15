import curriculum from '../../docs/content/curriculum.json'
import { catalogCourses, catalogLessons, catalogCards } from '../data/catalog'
import type { LearningProgress } from '../types/progress'
import type { Course } from '../types/course'
import { learningRewards } from '../progress/gamification'

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
  const rewards = learningRewards(progress)
  const originalDocker = ['docker-images-containers', 'docker-volumes-persistence', 'docker-ports-networks']
  return [
    { symbol: '✦', title: 'Premier déclic', description: 'Terminer ta première leçon.', unlocked: stats.completed > 0 },
    { symbol: '↺', title: 'Mémoire en mouvement', description: 'Répondre à ta première carte de révision.', unlocked: progress.history.some(event => event.kind === 'review') },
    { symbol: '◇', title: 'Cap sur Docker', description: 'Terminer les trois premières leçons Docker.', unlocked: originalDocker.every(id => Object.hasOwn(progress.completedLessons, id)) },
    { symbol: '◎', title: 'Un chemin parcouru', description: 'Terminer toutes les leçons d’un parcours.', unlocked: catalogCourses.some(course => completedCount(course, progress) === course.lessonIds.length) },
    { symbol: '✧', title: 'Le rendez-vous est pris', description: 'Apprendre ou pratiquer trois jours de suite.', unlocked: rewards.longestStreak >= 3 },
    { symbol: '☀', title: 'Une semaine ensemble', description: 'Apprendre ou pratiquer sept jours de suite.', unlocked: rewards.longestStreak >= 7 },
    { symbol: '✺', title: 'Mémo ne te lâche plus', description: 'Apprendre ou pratiquer trente jours de suite.', unlocked: rewards.longestStreak >= 30 },
    { symbol: '▤', title: 'La curiosité grandit', description: 'Terminer dix leçons.', unlocked: stats.completed >= 10 },
    { symbol: '↟', title: 'Les idées prennent racine', description: 'Pratiquer vingt-cinq cartes, comptées une fois par carte et par jour.', unlocked: rewards.practices >= 25 },
    { symbol: '★', title: 'Un atelier bien vivant', description: 'Atteindre le niveau cinq.', unlocked: rewards.level >= 5 },
    { symbol: '❋', title: 'Une saison avec Mémo', description: 'Apprendre ou pratiquer 90 jours de suite.', unlocked: rewards.longestStreak >= 90 },
    { symbol: '✹', title: 'Le rythme est ancré', description: 'Apprendre ou pratiquer 180 jours de suite.', unlocked: rewards.longestStreak >= 180 },
    { symbol: '♛', title: 'Un an, une idée par jour', description: 'Apprendre ou pratiquer 365 jours de suite.', unlocked: rewards.longestStreak >= 365 },
    { symbol: '◈', title: 'La moitié du chemin', description: 'Terminer 75 leçons.', unlocked: stats.completed >= 75 },
    { symbol: '▥', title: 'Toute la bibliothèque', description: 'Terminer les 150 leçons de la bibliothèque.', unlocked: stats.completed >= 150 },
    { symbol: '✵', title: 'Mille petits rappels', description: 'Pratiquer 1 000 cartes, comptées une fois par carte et par jour.', unlocked: rewards.practices >= 1000 },
    { symbol: '✶', title: 'La mémoire au long cours', description: 'Pratiquer 5 000 cartes, comptées une fois par carte et par jour.', unlocked: rewards.practices >= 5000 },
    { symbol: '♜', title: 'Mémo voit grand', description: 'Atteindre le niveau 10.', unlocked: rewards.level >= 10 },
    { symbol: '✷', title: 'Une passion qui dure', description: 'Atteindre le niveau 20.', unlocked: rewards.level >= 20 },
  ]
}
export function CourseProgress({ course, progress }: { course: Course, progress: LearningProgress }) {
  const count = completedCount(course, progress)
  return <div className="course-overview"><span>{count} / {course.lessonIds.length} leçons terminées</span><progress aria-label={`Progression de ${course.title}`} max={course.lessonIds.length} value={count} /></div>
}
export function PageHeading({ eyebrow, title, description }: { eyebrow: string, title: string, description: string }) {
  return <header className="catalog-heading"><p className="lesson-category">{eyebrow}</p><h1>{title}</h1><p>{description}</p></header>
}
