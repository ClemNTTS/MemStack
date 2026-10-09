import type { Challenge } from '../types/challenge.ts'
import type { Course } from '../types/course.ts'
import type { LearningProgress } from '../types/progress.ts'

export function getChallengeThemeProgress(
  challenge: Pick<Challenge, 'courseId'>,
  courses: Course[],
  completedLessons: LearningProgress['completedLessons'],
) {
  const course = courses.find(entry => entry.id === challenge.courseId)
  const themeCourses = course ? courses.filter(entry => entry.theme === course.theme) : []
  const lessonIds = [...new Set(themeCourses.flatMap(entry => entry.lessonIds))]
  const completed = lessonIds.filter(id => Object.hasOwn(completedLessons, id)).length
  return {
    theme: course?.theme,
    courseIds: themeCourses.map(entry => entry.id),
    completed,
    total: lessonIds.length,
    unlocked: lessonIds.length > 0 && completed === lessonIds.length,
  }
}
