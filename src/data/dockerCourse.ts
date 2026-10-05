import type { Course } from '../types/course'
import { todayLesson } from './todayLesson.ts'
import { volumesLesson } from './volumesLesson.ts'
import { portsLesson } from './portsLesson.ts'

export const dockerCourse: Course = {
  id: 'docker-basics',
  title: 'Les bases de Docker',
  theme: 'DevOps',
  lessonIds: [todayLesson.id, volumesLesson.id, portsLesson.id],
}

export const dockerLessons = [todayLesson, volumesLesson, portsLesson]
