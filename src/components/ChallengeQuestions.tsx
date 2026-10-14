import type { ChallengeQuestion } from '../types/challenge'
import { InlineLessonText } from './LessonText'

export default function ChallengeQuestions({ questions, choices, disabled, onChoose }: {
  questions: ChallengeQuestion[]
  choices: Record<string, string>
  disabled: boolean
  onChoose: (questionId: string, optionId: string) => void
}) {
  return <>{questions.map((question, index) => <fieldset key={question.id} className="challenge-question" disabled={disabled}>
    <legend>{index + 1}. <InlineLessonText text={question.prompt} /></legend>
    {question.options.map(option => <label key={option.id} className="challenge-option">
      <input type="radio" name={question.id} value={option.id} required checked={choices[question.id] === option.id} onChange={() => onChoose(question.id, option.id)} />
      <span><InlineLessonText text={option.text} /></span>
    </label>)}
  </fieldset>)}</>
}
