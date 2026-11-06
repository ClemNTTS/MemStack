import { AnalysisError } from './analysis.mjs'
import { learningDay, learningDayBounds } from './learningAccess.mjs'

const fail = (code,message) => { throw new AnalysisError(code,message) }
export const usesEnterpriseLessonAssessment = lesson => Array.isArray(lesson?.steps) && lesson.steps.some(step=>step.type==='question')

export function advanceEnterpriseLessonAssessment(previous,lesson,questionId,optionId,contentVersion,now) {
  const questions = lesson.steps.filter(step=>step.type==='question')
  if (!usesEnterpriseLessonAssessment(lesson) || !questions.length) fail('invalid-argument','Cette mission ne propose pas cette évaluation.')
  const question = questions.find(item=>item.id===questionId)
  if (!question?.options.some(option=>option.id===optionId)) fail('invalid-argument','Réponse inconnue.')
  const retryReady = previous?.finished && !previous.passed && Number.isFinite(Date.parse(previous.retryAt)) && Date.parse(previous.retryAt)<=now
  const changedContent = previous && previous.contentVersion!==contentVersion
  if (changedContent && previous.finished && !previous.passed && !retryReady) fail('resource-exhausted','Cette tentative est terminée. Recommence la leçon demain, à l’heure de Paris.')
  // New content starts a fresh assessment, while an already failed day stays closed.
  // The old version remains in immutable history under its own content fingerprint.
  let current = retryReady || changedContent ? null : previous
  if (current) {
    if (!Array.isArray(current.checks) || typeof current.answers!=='object' || current.answers===null || current.lessonId!==lesson.id
      || !Number.isFinite(Date.parse(current.updatedAt)) || Date.parse(current.updatedAt)>now) fail('unavailable','Évaluation indisponible.')
    if (Object.hasOwn(current.answers,questionId)) {
      if (current.answers[questionId]!==optionId) fail('already-exists','Ta première réponse est déjà enregistrée.')
      return {assessment:current,changed:false}
    }
    if (current.finished) fail('resource-exhausted','Cette tentative est terminée. Recommence la leçon demain, à l’heure de Paris.')
  }
  const answered = current?.checks.length ?? 0
  if (questions[answered]?.id!==questionId) fail('failed-precondition','Réponds aux questions dans l’ordre.')
  const correctOption = question.options.find(option=>option.id===question.correctOptionId)
  if (!correctOption) fail('unavailable','Correction indisponible.')
  const selected = question.options.find(option=>option.id===optionId)
  const checks = [...(current?.checks ?? []),{
    questionId,selectedOptionId:optionId,correctOptionId:correctOption.id,correct:optionId===correctOption.id,
    explanation:selected.feedback,questionText:question.prompt,correctAnswerText:correctOption.text,selectedAnswerText:selected.text,
  }]
  const correct = checks.filter(check=>check.correct).length
  const finished = checks.length===questions.length
  const passed = finished && correct===questions.length
  return {changed:true,assessment:{
    lessonId:lesson.id,attemptDay:current?.attemptDay ?? learningDay(now),contentVersion,
    answers:{...(current?.answers ?? {}),[questionId]:optionId},checks,correct,total:questions.length,
    finished,passed,retryAt:finished && !passed ? learningDayBounds(now)[1] : null,updatedAt:new Date(now).toISOString(),
  }}
}

export function assertEnterpriseLessonAssessmentPassed(assessment,contentVersion) {
  if (!assessment?.finished || !assessment.passed || assessment.contentVersion!==contentVersion
    || !Number.isSafeInteger(assessment.total) || assessment.total<1 || assessment.correct!==assessment.total) {
    fail('failed-precondition','Réussis toutes les questions de la leçon pour débloquer la suite.')
  }
}
