import type { Lesson } from '../types/lesson'

export type VisitedStep = { id: string, selectedChoiceId?: string }

export function lessonDraftKey(uid: string, lessonId: string) {
  return `memstack.lesson-draft.v1.${uid}.${lessonId}`
}

export function restoreLessonHistory(lesson: Lesson, raw: string | null): VisitedStep[] {
  const fallback = [{ id: lesson.firstStepId }]
  if (!raw) return fallback
  try {
    const value = JSON.parse(raw)
    if (value.version !== 1 || !Array.isArray(value.history) || !value.history.length || value.history.length > 1000) return fallback
    const steps = new Map(lesson.steps.map(step => [step.id, step]))
    const history: VisitedStep[] = []
    let expectedId: string | undefined = lesson.firstStepId
    for (const visit of value.history) {
      if (!visit || visit.id !== expectedId) return fallback
      const step = steps.get(visit.id)
      if (!step) return fallback
      if (step.type === 'question') {
        const choice = step.choices.find(item => item.id === visit.selectedChoiceId)
        if (visit.selectedChoiceId !== undefined && !choice) return fallback
        history.push(choice ? { id: step.id, selectedChoiceId: choice.id } : { id: step.id })
        expectedId = choice?.nextStepId
      } else {
        if (visit.selectedChoiceId !== undefined) return fallback
        history.push({ id: step.id })
        expectedId = step.nextStepId
      }
    }
    return history
  } catch {
    return fallback
  }
}
