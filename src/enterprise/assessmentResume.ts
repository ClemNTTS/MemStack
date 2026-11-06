import type { EnterpriseLessonAssessment, EnterpriseLessonDraftSnapshot } from '../types/enterprise'
import type { EnterpriseLessonDraftState } from '../types/enterprise'
import type { EnterpriseLesson } from '../types/enterpriseContent'

export function assessmentForDraft(assessment: EnterpriseLessonAssessment | undefined, snapshot: EnterpriseLessonDraftSnapshot, now = Date.now()) {
  if (!assessment || assessment.lessonId !== snapshot.lessonId) return undefined
  const failed = assessment.finished && !assessment.passed
  const retryAt = Date.parse(assessment.retryAt ?? '')
  if (failed && Number.isFinite(retryAt) && retryAt > now) return assessment
  // A saved restart after the failure window belongs to the new lesson run,
  // even though its first quiz answer has not created a new assessment yet.
  if (failed && snapshot.state && Number.isFinite(retryAt) && Date.parse(snapshot.updatedAt ?? '') >= retryAt) return undefined
  return assessment.contentVersion === snapshot.contentVersion ? assessment : undefined
}

export function confirmedAssessmentDraft(lesson: EnterpriseLesson, state: EnterpriseLessonDraftState, assessment?: EnterpriseLessonAssessment): EnterpriseLessonDraftState {
  const index = lesson.steps.findIndex(step => step.id === state.stepId)
  const questions = lesson.steps.filter(step => step.type === 'question')
  const questionIds = new Set(questions.map(question => question.id))
  const firstUnconfirmed = lesson.steps.findIndex((step, position) => position <= index && step.type === 'question' && !assessment?.answers[step.id])
  const restoredIndex = firstUnconfirmed >= 0 ? firstUnconfirmed : index
  const reached = new Set(lesson.steps.slice(0, restoredIndex + 1).map(step => step.id))
  const confirmed = assessment?.checks.filter(check => questionIds.has(check.questionId) && reached.has(check.questionId)) ?? []
  return {
    ...state,
    stepId: lesson.steps[Math.max(0, restoredIndex)].id,
    answers: { ...Object.fromEntries(Object.entries(state.answers).filter(([id]) => !questionIds.has(id))), ...Object.fromEntries(confirmed.map(check => [check.questionId, check.selectedOptionId])) },
    checkedIds: [...state.checkedIds.filter(id => !questionIds.has(id)), ...confirmed.map(check => check.questionId)],
  }
}
