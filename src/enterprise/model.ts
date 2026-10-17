import { enterpriseCards, enterpriseChapters, enterpriseLessons, enterpriseCurriculum, enterpriseTracks } from '../data/enterprise.ts'
import type { EnterpriseWorkspace } from '../types/enterprise'
import type { EnterpriseChallenge, EnterpriseLesson } from '../types/enterpriseContent'
import type { SessionCard } from '../review/dailyQueue'

export function enterprisePrerequisiteIds(entry: EnterpriseLesson | EnterpriseChallenge) {
  if (entry.prerequisiteLessonIds) return entry.prerequisiteLessonIds
  if (!('steps' in entry)) return enterpriseLessons.filter(lesson => lesson.chapterId === entry.chapterId && !lesson.continuous).map(lesson => lesson.id)
  const foundations = enterpriseCurriculum.foundationLessonIds ?? []
  const foundationIndex = foundations.indexOf(entry.id)
  if (foundationIndex >= 0) return foundations.slice(0, foundationIndex)
  const index = enterpriseLessons.findIndex(lesson => lesson.id === entry.id)
  return index > 0 ? [enterpriseLessons[index - 1].id] : []
}

export function enterprisePlan(progress: EnterpriseWorkspace['progress'], now = Date.now(), trackId?: string) {
  const complete = (id: string) => Number.isFinite(Date.parse(progress.lessons[id]?.completedAt)) && Date.parse(progress.lessons[id].completedAt) <= now
  const available = (entry: EnterpriseLesson | EnterpriseChallenge) => enterprisePrerequisiteIds(entry).every(complete)
  const track = enterpriseTracks.find(track => track.id === trackId) ?? enterpriseTracks[0]
  const guided = track
    ? [...new Set([...(enterpriseCurriculum.foundationLessonIds ?? []), ...track.lessonIds])].flatMap(id => enterpriseLessons.filter(lesson => lesson.id === id))
    : enterpriseLessons.filter(lesson => !lesson.continuous)
  const next = guided.find(lesson => !complete(lesson.id) && available(lesson))
    ?? (!track ? enterpriseLessons.find(lesson => lesson.continuous && !complete(lesson.id) && available(lesson)) : undefined)
  const cards = enterpriseCards.filter(card => complete(card.lessonId))
  const pending: SessionCard[] = cards.filter(card => !progress.cards[card.id]).map(card => ({ card, kind: 'new' }))
  const due: SessionCard[] = cards.filter(card => {
    const state = progress.cards[card.id]
    return state && Number.isFinite(Date.parse(state.lastReviewedAt)) && Date.parse(state.lastReviewedAt) <= now && Date.parse(state.dueAt) <= now
  }).sort((a,b) => Date.parse(progress.cards[a.id].dueAt) - Date.parse(progress.cards[b.id].dueAt) || a.id.localeCompare(b.id)).map(card => ({ card, kind: 'review' }))
  return { next, guided, track, available, completed: guided.filter(lesson => complete(lesson.id)).length, complete, pending, due }
}

export function enterpriseScope(uid: string, organizationId: string) { return `${uid}:${organizationId}` }

export function enterpriseRewards(progress: EnterpriseWorkspace['progress'], now = Date.now()) {
  const plan = enterprisePlan(progress,now)
  const completed = enterpriseLessons.filter(lesson=>plan.complete(lesson.id)).length
  const cards = enterpriseCards.filter(card=>plan.complete(card.lessonId) && progress.cards[card.id] && Number.isFinite(Date.parse(progress.cards[card.id].lastReviewedAt)) && Date.parse(progress.cards[card.id].lastReviewedAt) <= now).length
  const xp = completed*40 + cards*10
  const badges = enterpriseChapters.map(chapter => {
    const lessons = enterpriseLessons.filter(lesson => !lesson.continuous && lesson.chapterId === chapter.id)
    return { id: chapter.id, title: chapter.title, earned: lessons.length > 0 && lessons.every(lesson => plan.complete(lesson.id)) }
  })
  return {xp,level:1+Math.floor(xp/200),next:200-xp%200,badges}
}
