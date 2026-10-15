import curriculum from '../../shared/enterpriseCurriculum.json' with { type: 'json' }
import type { EnterpriseCurriculum } from '../types/enterpriseContent'

// Only public teaching content is bundled here. Assessment keys remain server-only.
export const enterpriseCurriculum = curriculum as EnterpriseCurriculum
export const enterpriseChapters = enterpriseCurriculum.chapters
export const enterpriseLessons = enterpriseCurriculum.lessons
export const enterpriseGuidedLessons = enterpriseLessons.filter((lesson) => !lesson.continuous)
export const enterpriseContinuingLessons = enterpriseLessons.filter((lesson) => lesson.continuous)
export const enterpriseChallenges = enterpriseCurriculum.challenges
export const enterpriseCards = enterpriseLessons.flatMap((lesson) => lesson.cards.map((card) => ({ ...card, lessonId: lesson.id })))
export const enterpriseLessonById = new Map(enterpriseLessons.map((lesson) => [lesson.id, lesson]))
export const enterpriseChallengeById = new Map(enterpriseChallenges.map((challenge) => [challenge.id, challenge]))
