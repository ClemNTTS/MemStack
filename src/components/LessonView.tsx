import { useMemo, useState } from 'react'
import { indexLessonSteps } from '../lesson/lessonFlow'
import type { Lesson } from '../types/lesson'
import Memo from './Memo'

type LessonViewProps = {
  lesson: Lesson
  onComplete: () => void
}

type VisitedStep = {
  id: string
  selectedChoiceId?: string
}

function LessonView({ lesson, onComplete }: LessonViewProps) {
  const stepsById = useMemo(() => indexLessonSteps(lesson), [lesson])
  const [history, setHistory] = useState<VisitedStep[]>([{ id: lesson.firstStepId }])
  const currentVisit = history[history.length - 1]
  const currentStep = stepsById.get(currentVisit.id)!
  const selectedChoice = currentStep.type === 'question'
    ? currentStep.choices.find((choice) => choice.id === currentVisit.selectedChoiceId)
    : undefined
  const nextStepId = currentStep.type === 'question'
    ? selectedChoice?.nextStepId
    : currentStep.nextStepId
  const canContinue = currentStep.type !== 'question' || Boolean(selectedChoice)

  function selectChoice(choiceId: string) {
    setHistory((previous) => previous.map((visit, index) =>
      index === previous.length - 1 && !visit.selectedChoiceId
        ? { ...visit, selectedChoiceId: choiceId }
        : visit,
    ))
  }

  function continueLesson() {
    if (!canContinue) return

    if (nextStepId) {
      setHistory((previous) => [...previous, { id: nextStepId }])
    } else {
      onComplete()
    }
  }

  return (
    <article className="lesson">
      <header className="lesson-header">
        <Memo />
        <p className="lesson-category">{lesson.category}</p>
        <h1>{lesson.title}</h1>
        <p className="lesson-duration">Durée estimée : {lesson.estimatedMinutes} min</p>
      </header>

      <div className="lesson-content" aria-label="Contenu de la leçon">
        {history.map((visit, index) => {
          const step = stepsById.get(visit.id)!
          const isCurrent = index === history.length - 1

          if (step.type === 'message') {
            return <p className="lesson-bubble" key={`${step.id}-${index}`}>{step.text}</p>
          }

          if (step.type === 'image') {
            return (
              <figure className="lesson-image" key={`${step.id}-${index}`}>
                <img src={step.src} alt={step.alt} />
                {step.caption && <figcaption>{step.caption}</figcaption>}
              </figure>
            )
          }

          const chosen = step.choices.find((choice) => choice.id === visit.selectedChoiceId)

          return (
            <section className="lesson-question" key={`${step.id}-${index}`}>
              <p className="lesson-bubble">{step.prompt}</p>
              <div className="lesson-choices" aria-label="Choix de réponse">
                {step.choices.map((choice) => (
                  <button
                    className="lesson-choice"
                    type="button"
                    key={choice.id}
                    disabled={!isCurrent || Boolean(chosen)}
                    aria-pressed={chosen?.id === choice.id}
                    onClick={() => selectChoice(choice.id)}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              {chosen && <p className="lesson-feedback" aria-live="polite">{chosen.feedback}</p>}
            </section>
          )
        })}
      </div>

      {canContinue && (
        <button className="lesson-next" type="button" onClick={continueLesson}>
          {nextStepId ? 'Continuer' : 'Terminer la leçon'}
        </button>
      )}
    </article>
  )
}

export default LessonView
