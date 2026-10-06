export type LearningPreferences = {
  activeCourseId: string
  dailyLessonGoal: number
}

export type LearningPreferencePatch = Partial<LearningPreferences>

type CourseIds = ReadonlySet<string>

export function decodeLearningPreferences(value: unknown, courseIds: CourseIds): LearningPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Préférences cloud invalides')
  }
  const data = value as Record<string, unknown>
  const keys = Object.keys(data)
  if (keys.length !== 3 || !keys.every(key => ['version', 'activeCourseId', 'dailyLessonGoal'].includes(key))
    || data.version !== 1 || typeof data.activeCourseId !== 'string' || !courseIds.has(data.activeCourseId)
    || typeof data.dailyLessonGoal !== 'number' || !Number.isInteger(data.dailyLessonGoal)
    || data.dailyLessonGoal < 1 || data.dailyLessonGoal > 10) {
    throw new Error('Préférences cloud invalides')
  }
  return { activeCourseId: data.activeCourseId, dailyLessonGoal: data.dailyLessonGoal }
}

// A missing document permits migration. Invalid existing data must never be replaced silently.
export function migrateLearningPreferences(existing: unknown | undefined, defaults: LearningPreferences, courseIds: CourseIds): LearningPreferences {
  return decodeLearningPreferences(existing === undefined ? { ...defaults, version: 1 } : existing, courseIds)
}

export function applyLearningPreferencePatch(existing: unknown, patch: LearningPreferencePatch, courseIds: CourseIds): LearningPreferences {
  const previous = decodeLearningPreferences(existing, courseIds)
  const keys = Object.keys(patch)
  if (!keys.length || !keys.every(key => key === 'activeCourseId' || key === 'dailyLessonGoal')) {
    throw new Error('Modification de préférences invalide')
  }
  return decodeLearningPreferences({ ...previous, ...patch, version: 1 }, courseIds)
}
