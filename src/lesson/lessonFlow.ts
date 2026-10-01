import type { Lesson, LessonStep } from '../types/lesson'

export function indexLessonSteps(lesson: Lesson): Map<string, LessonStep> {
  const steps = new Map<string, LessonStep>()

  for (const step of lesson.steps) {
    if (steps.has(step.id)) {
      throw new Error(`Étape dupliquée : ${step.id}`)
    }
    steps.set(step.id, step)
  }

  if (!steps.has(lesson.firstStepId)) {
    throw new Error(`Première étape introuvable : ${lesson.firstStepId}`)
  }

  for (const step of lesson.steps) {
    const nextIds = step.type === 'question'
      ? step.choices.map((choice) => choice.nextStepId)
      : step.nextStepId ? [step.nextStepId] : []

    if (step.type === 'question' && step.choices.length === 0) {
      throw new Error(`Question sans choix : ${step.id}`)
    }

    if (step.type === 'question') {
      const choiceIds = step.choices.map((choice) => choice.id)
      if (new Set(choiceIds).size !== choiceIds.length) {
        throw new Error(`Choix dupliqué dans la question : ${step.id}`)
      }
    }

    for (const nextId of nextIds) {
      if (!steps.has(nextId)) {
        throw new Error(`Étape ${step.id} : destination introuvable ${nextId}`)
      }
    }
  }

  return steps
}
