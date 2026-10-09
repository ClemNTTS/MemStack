import type { Challenge, ChallengeAnalysis, ChallengeAttempt } from '../types/challenge'
import type { Course } from '../types/course'
import type { LearningProgress } from '../types/progress'
import { getChallengeExamSummary } from './examSummary.ts'

export function getThemeSummary(
  theme: string,
  courses: Course[],
  challenges: Challenge[],
  completedLessons: LearningProgress['completedLessons'],
  attempts: ChallengeAttempt[],
  analyses: Record<string, ChallengeAnalysis>,
) {
  const themeCourses = courses.filter(course => course.theme === theme)
  const courseIds = new Set(themeCourses.map(course => course.id))
  const lessonIds = [...new Set(themeCourses.flatMap(course => course.lessonIds))]
  const exams = challenges.filter(challenge => courseIds.has(challenge.courseId)).map(challenge => ({
    challenge,
    summary: getChallengeExamSummary(challenge, attempts, analyses),
  }))
  const notions = exams.flatMap(({ challenge, summary }) => {
    if (summary.status !== 'retry' || !summary.attempt) return []
    const analysis = analyses[summary.attempt.id]
    if (analysis.promptVersion !== 'challenge-feedback-v4') return []
    return [...new Set(analysis.missedCheckpointIndices ?? [])]
      .filter(index => Number.isInteger(index) && index >= 0 && index < challenge.checkpoints.length)
      .map(index => ({ challengeId: challenge.id, checkpointIndex: index, label: challenge.checkpoints[index] }))
  })
  const retriesWithoutNotions = exams.filter(({ challenge, summary }) => summary.status === 'retry'
    && !notions.some(notion => notion.challengeId === challenge.id)).length
  return {
    lessonsCompleted: lessonIds.filter(id => Object.hasOwn(completedLessons, id)).length,
    lessonsTotal: lessonIds.length,
    examsTotal: exams.length,
    examsValidated: exams.filter(exam => exam.summary.status === 'validated').length,
    notions,
    retriesWithoutNotions,
  }
}
