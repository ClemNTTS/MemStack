import type { Card } from '../../types/card'
import type { Lesson } from '../../types/lesson'

// The scenario and wording belong to each lesson, not to this graph assembler.
export type LessonDraft = {
  id: string
  intro: string
  concept: string
  example: string
  prompt: string
  correct: string
  incorrect: string
  success: string
  correction: string
  explanation: string
  takeaway: string
  cards: [string, string][]
}

export function assembleLesson(
  draft: LessonDraft,
  title: string,
  category: string,
): { lesson: Lesson, cards: Card[] } {
  const cards = draft.cards.map(([question, answer], index) => ({
    id: `${draft.id}-recall-${index + 1}`,
    question,
    answer,
  }))
  const choices = [
    { id: 'apply', label: draft.correct, feedback: draft.success, nextStepId: 'explanation' },
    { id: 'misconception', label: draft.incorrect, feedback: draft.correction, nextStepId: 'explanation' },
  ]
  if ([...draft.id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 2) choices.reverse()
  return {
    cards,
    lesson: {
      id: draft.id,
      title,
      category,
      estimatedMinutes: 3,
      firstStepId: 'situation',
      cardIds: cards.map(card => card.id),
      steps: [
        { id: 'situation', type: 'message', text: draft.intro, nextStepId: 'concept' },
        { id: 'concept', type: 'message', text: draft.concept, nextStepId: 'example' },
        { id: 'example', type: 'message', text: draft.example, nextStepId: 'prediction' },
        {
          id: 'prediction',
          type: 'question',
          prompt: draft.prompt,
          choices,
        },
        { id: 'explanation', type: 'message', text: draft.explanation, nextStepId: 'takeaway' },
        { id: 'takeaway', type: 'message', text: draft.takeaway },
      ],
    },
  }
}
