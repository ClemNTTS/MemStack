import type { LearningProgress } from '../types/progress.ts'
import type { SessionCard } from './dailyQueue.ts'
import { activityDay } from '../progress/gamification.ts'

export function learningAllowance(progress: LearningProgress, premium: boolean, now = new Date()) {
  const today = activityDay(now)
  const isToday = (date: string) => Number.isFinite(Date.parse(date)) && Date.parse(date) <= now.getTime() && activityDay(new Date(date)) === today
  const lessonsToday = Object.values(progress.completedLessons).filter(isToday).length
  const reviewsToday = progress.history.filter(event => event.kind === 'review' && isToday(event.reviewedAt)).length
  return { lessonsToday, reviewsToday, lessonsRemaining: premium ? Infinity : Math.max(0, 1 - lessonsToday),
    reviewsRemaining: premium ? Infinity : Math.max(0, 5 - reviewsToday) }
}

export function limitLearningQueue(queue: SessionCard[], remaining: number) {
  let count = 0
  return queue.filter(item => item.kind === 'new' || ++count <= remaining)
}
