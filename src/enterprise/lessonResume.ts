import type { EnterpriseLesson } from '../types/enterpriseContent'
import type { EnterpriseLessonDraftState } from '../types/enterprise'
import enterprisePractices from '../data/enterprisePractices.json' with { type: 'json' }

export function emptyLessonDraft(lesson: EnterpriseLesson): EnterpriseLessonDraftState {
  return { stepId: lesson.steps[0].id, answers: {}, checkedIds: [], draft: '', practiceAnswers: {} }
}

export function lessonDraftKey(state: EnterpriseLessonDraftState) {
  const ordered = (record: Record<string, string>) => Object.fromEntries(Object.entries(record).sort(([left], [right]) => left.localeCompare(right)))
  return JSON.stringify({ stepId: state.stepId, answers: ordered(state.answers), checkedIds: [...state.checkedIds].sort(), draft: state.draft, practiceAnswers: ordered(state.practiceAnswers) })
}

export function isValidLessonDraft(lesson: EnterpriseLesson, value: unknown): value is EnterpriseLessonDraftState {
  if (!value || typeof value !== 'object') return false
  const state = value as EnterpriseLessonDraftState
  if (Object.keys(state).length !== 5 || !['stepId', 'answers', 'checkedIds', 'draft', 'practiceAnswers'].every(key => Object.hasOwn(state, key))) return false
  const index = lesson.steps.findIndex(step => step.id === state.stepId)
  const record = (input: unknown): input is Record<string, string> => Boolean(input && typeof input === 'object' && !Array.isArray(input) && Object.entries(input).every(([key, entry]) => key.length < 200 && typeof entry === 'string'))
  if (index < 0 || !record(state.answers) || !record(state.practiceAnswers) || typeof state.draft !== 'string' || state.draft.length > 5000 || !Array.isArray(state.checkedIds) || !state.checkedIds.every(id => typeof id === 'string') || new Set(state.checkedIds).size !== state.checkedIds.length) return false
  const questions = lesson.steps.slice(0, index + 1).filter(step => step.type === 'question')
  if (Object.entries(state.answers).some(([id, answer]) => !questions.some(question => question.id === id && question.options.some(option => option.id === answer)))) return false
  if (state.checkedIds.some(id => !Object.hasOwn(state.answers, id))) return false
  for (const step of lesson.steps.slice(0, index)) {
    if (step.type === 'question' && (state.answers[step.id] !== step.correctOptionId || !state.checkedIds.includes(step.id))) return false
  }
  if (lesson.id !== 'ent-plausible-not-proven' && Object.keys(state.practiceAnswers).length) return false
  const practiceIndex = lesson.steps.findIndex(step => step.type === 'message' && step.text.startsWith('Pratique ·'))
  if ((state.draft || Object.keys(state.practiceAnswers).length) && (practiceIndex < 0 || index < practiceIndex)) return false
  if (new TextEncoder().encode(JSON.stringify(state)).length > 24000) return false
  return Object.entries(state.practiceAnswers).every(([key, answer]) => ['delay', 'fees', 'reference'].includes(key) && ['supported', 'contradicted', 'unverified'].includes(answer))
}

export async function lessonContentVersion(lesson: EnterpriseLesson) {
  const practice = (enterprisePractices as Record<string, unknown>)[lesson.id] ?? null
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({ lesson, practice })))
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}
