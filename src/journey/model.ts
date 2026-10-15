import curriculum from '../../docs/content/curriculum.json' with { type: 'json' }
import { catalogCourses, catalogLessons } from '../data/catalog/index.ts'
import type { LearningProgress } from '../types/progress.ts'

// Reviewed against the explicit course references in curriculum.json. Prose-only
// prerequisites remain guidance: this graph never creates an access restriction.
export const coursePrerequisites: Record<string, string[]> = {
  'data-reasoning': [],
  'systems-basics': ['data-reasoning'],
  'http-basics': ['systems-basics'],
  'accessible-ui': ['http-basics'],
  'browser-runtime': ['javascript-core', 'javascript-async', 'http-basics'],
  'javascript-core': ['data-reasoning'],
  'javascript-async': ['javascript-core'],
  'typescript-core': ['javascript-core'],
  'react-state': ['typescript-core', 'accessible-ui'],
  'react-effects': ['react-state', 'javascript-async'],
  'node-server': ['javascript-async', 'systems-basics', 'http-basics'],
  'rest-design': ['http-basics', 'node-server'],
  'backend-resilience': ['rest-design', 'sql-basics'],
  'sql-basics': ['data-reasoning'],
  'document-data': ['sql-basics', 'identity-access'],
  'docker-basics': ['systems-basics'],
  'cicd-basics': ['git-collaboration', 'test-strategy'],
  'cloud-basics': ['http-basics', 'docker-basics', 'identity-access'],
  'terraform-basics': ['cloud-basics', 'git-collaboration'],
  'kubernetes-basics': ['docker-basics', 'cloud-basics'],
  'observability-basics': ['node-server', 'rest-design'],
  'sre-basics': ['observability-basics', 'backend-resilience'],
  'identity-access': ['http-basics'],
  'web-security': ['identity-access', 'accessible-ui', 'sql-basics'],
  'test-strategy': ['javascript-core'],
  'architecture-boundaries': ['typescript-core', 'rest-design'],
  'distributed-basics': ['architecture-boundaries', 'backend-resilience', 'sql-basics'],
  'performance-basics': ['browser-runtime', 'react-state', 'sql-basics'],
  'git-collaboration': ['systems-basics'],
  'maintenance-basics': ['javascript-core', 'git-collaboration', 'test-strategy'],
}

export function validatePrerequisites(graph: Record<string, string[]>, courseIds: string[]) {
  const known = new Set(courseIds)
  if (known.size !== courseIds.length || Object.keys(graph).length !== known.size) throw new Error('Graphe incomplet ou identifiants dupliqués')
  const visited = new Set<string>()
  const visiting = new Set<string>()
  const ordered: string[] = []
  function visit(id: string) {
    if (!known.has(id) || !Object.hasOwn(graph, id)) throw new Error(`Parcours inconnu : ${id}`)
    if (visiting.has(id)) throw new Error(`Cycle de prérequis : ${id}`)
    if (visited.has(id)) return
    visiting.add(id)
    for (const prerequisite of graph[id]) visit(prerequisite)
    visiting.delete(id)
    visited.add(id)
    ordered.push(id)
  }
  for (const id of courseIds) visit(id)
  return ordered
}

export const orderedCourseIds = validatePrerequisites(coursePrerequisites, curriculum.courses.map(course => course.id))

function itinerary(targets: string[]) {
  const included = new Set<string>()
  function include(id: string) {
    if (included.has(id)) return
    included.add(id)
    for (const prerequisite of coursePrerequisites[id]) include(prerequisite)
  }
  for (const id of targets) include(id)
  return orderedCourseIds.filter(id => included.has(id))
}

export type JourneyGoalId = 'interface' | 'api' | 'deployment'
const common = ['data-reasoning', 'systems-basics', 'http-basics']
export const journeyGoals = [
  { id: 'interface' as const, title: 'Créer une interface', description: 'Construis une interface accessible, réactive et fiable.', courseIds: itinerary([...common, 'accessible-ui', 'browser-runtime', 'react-effects', 'performance-basics', 'web-security', 'maintenance-basics']) },
  { id: 'api' as const, title: 'Construire une API', description: 'Relie un serveur, des données et des règles de sécurité.', courseIds: itinerary([...common, 'document-data', 'distributed-basics', 'observability-basics', 'maintenance-basics']) },
  { id: 'deployment' as const, title: 'Déployer une application', description: 'Livre ton application et apprends à la garder fiable.', courseIds: itinerary([...common, 'terraform-basics', 'kubernetes-basics', 'cicd-basics', 'sre-basics']) },
]

export const journeyChapters = [
  { id: 'foundations', title: 'Comprendre les bases', description: 'Suis les données des premiers raisonnements au Web.', badgeTitle: 'Les fondations sont posées', courseIds: common },
  { id: 'building', title: 'Donner forme à tes idées', description: 'Code, structure et affiche une interface.', badgeTitle: 'Bâtisseur d’interfaces', courseIds: ['javascript-core', 'javascript-async', 'typescript-core', 'accessible-ui', 'browser-runtime', 'react-state', 'react-effects'] },
  { id: 'connecting', title: 'Relier les données', description: 'Relie les services en gardant des frontières claires.', badgeTitle: 'Architecte des données', courseIds: ['sql-basics', 'node-server', 'rest-design', 'identity-access', 'document-data', 'backend-resilience', 'architecture-boundaries', 'distributed-basics'] },
  { id: 'shipping', title: 'Livrer ton application', description: 'Prépare, automatise et déploie tes changements.', badgeTitle: 'Prêt au décollage', courseIds: ['git-collaboration', 'docker-basics', 'cloud-basics', 'cicd-basics', 'terraform-basics', 'kubernetes-basics'] },
  { id: 'reliability', title: 'Fiabiliser dans la durée', description: 'Teste, observe et améliore ce que tu construis.', badgeTitle: 'Gardien de la fiabilité', courseIds: ['test-strategy', 'maintenance-basics', 'web-security', 'observability-basics', 'sre-basics', 'performance-basics'] },
]

export function getRecommendedGoal(activeCourseId: string): JourneyGoalId {
  const chapter = journeyChapters.find(entry => entry.courseIds.includes(activeCourseId))?.id
  if (chapter === 'shipping' || activeCourseId === 'sre-basics') return 'deployment'
  if (chapter === 'connecting' || activeCourseId === 'observability-basics') return 'api'
  return 'interface'
}

export function getChapterBadges(progress: LearningProgress, now = new Date()) {
  const symbols = ['◇', '✧', '◈', '↗', '✹']
  return journeyChapters.map((chapter,index) => ({
    symbol: symbols[index], title: chapter.badgeTitle,
    description: `Terminer les ${chapter.courseIds.length} parcours du chapitre « ${chapter.title} ».`,
    unlocked: chapter.courseIds.every(id => catalogCourses.find(course => course.id === id)!.lessonIds.every(lessonId => {
      const date = Date.parse(progress.completedLessons[lessonId])
      return Number.isFinite(date) && date <= now.getTime()
    })),
  }))
}

export function getJourneyState({ progress, activeCourseId, goalId, now = new Date() }: {
  progress: LearningProgress
  activeCourseId: string
  goalId?: JourneyGoalId
  now?: Date
}) {
  const goal = journeyGoals.find(entry => entry.id === (goalId ?? getRecommendedGoal(activeCourseId)))!
  const validCompletion = (id: string) => {
    const date = Date.parse(progress.completedLessons[id])
    return Number.isFinite(date) && date <= now.getTime()
  }
  const allSteps = orderedCourseIds.map(courseId => {
    const course = catalogCourses.find(entry => entry.id === courseId)!
    const cardIds = course.lessonIds.flatMap(id => catalogLessons.find(lesson => lesson.id === id)!.cardIds)
    const completedLessons = course.lessonIds.filter(validCompletion).length
    const learnedCards = cardIds.filter(id => {
      const date = Date.parse(progress.cards[id]?.lastReviewedAt)
      return Number.isFinite(date) && date <= now.getTime()
    }).length
    const dueCards = cardIds.filter(id => {
      const card = progress.cards[id]
      return card && Number.isFinite(Date.parse(card.lastReviewedAt)) && Date.parse(card.lastReviewedAt) <= now.getTime() && Date.parse(card.dueAt) <= now.getTime()
    }).length
    return { courseId, completedLessons, totalLessons: course.lessonIds.length, completed: completedLessons === course.lessonIds.length,
      prerequisiteIds: coursePrerequisites[courseId], missingPrerequisiteIds: [] as string[], learnedCards, dueCards, totalCards: cardIds.length }
  })
  const completed = new Set(allSteps.filter(step => step.completed).map(step => step.courseId))
  const route = new Set(goal.courseIds)
  const current = allSteps.find(step => step.courseId === activeCourseId && route.has(step.courseId) && !step.completed)
  const nextCourseId = current?.courseId ?? allSteps.find(step => route.has(step.courseId) && !step.completed)?.courseId ?? null
  const steps = allSteps.filter(step => route.has(step.courseId)).map(step => ({ ...step,
    missingPrerequisiteIds: step.prerequisiteIds.filter(id => !completed.has(id)),
    status: step.completed ? 'completed' as const : step.courseId === nextCourseId ? 'current' as const : 'upcoming' as const,
  }))
  const chapters = journeyChapters.map(chapter => {
    const chapterSteps = steps.filter(step => chapter.courseIds.includes(step.courseId))
    const fullChapterSteps = allSteps.filter(step => chapter.courseIds.includes(step.courseId))
    // A chapter badge always represents its entire definition, across objectives.
    // It is derived from existing progress, never persisted as an extra XP award.
    const badgeEarned = fullChapterSteps.length > 0 && fullChapterSteps.every(step => step.completed)
    return { ...chapter, steps: chapterSteps, completedCourses: chapterSteps.filter(step => step.completed).length,
      totalCourses: chapterSteps.length, completed: chapterSteps.length > 0 && chapterSteps.every(step => step.completed), badgeEarned,
      dueCards: chapterSteps.reduce((sum, step) => sum + step.dueCards, 0),
    }
  }).filter(chapter => chapter.steps.length > 0)
  return { goal, chapters, steps, nextCourseId, activeCourseId }
}
