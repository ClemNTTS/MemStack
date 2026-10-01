export type LessonStep =
  | {
      id: string
      type: 'message'
      text: string
      nextStepId?: string
    }
  | {
      id: string
      type: 'image'
      src: string
      alt: string
      caption?: string
      nextStepId?: string
    }
  | {
      id: string
      type: 'question'
      prompt: string
      choices: {
        id: string
        label: string
        feedback: string
        nextStepId: string
      }[]
    }

export type Lesson = {
  id: string
  title: string
  category: string
  estimatedMinutes: number
  firstStepId: string
  steps: LessonStep[]
  cardIds: string[]
}
