import { useEffect, useMemo, useRef, useState } from 'react'
import { indexLessonSteps } from '../lesson/lessonFlow'
import type { Lesson, LessonStep } from '../types/lesson'
import ChatBubble from './ChatBubble'
import { useMessageSound } from '../lesson/useMessageSound'
import './lesson-enhancements.css'

type LessonViewProps = {
  lesson: Lesson
  onComplete: () => void
  onMessage: () => void
  progressLabel: string
  completionLabel?: string
  onShowSummary?: () => void
}

type VisitedStep = {
  id: string
  selectedChoiceId?: string
}

function LessonView({ lesson, onComplete, onMessage, progressLabel, completionLabel = 'Terminer la leçon', onShowSummary }: LessonViewProps) {
  const sound = useMessageSound()
  const endRef = useRef<HTMLDivElement>(null)
  const imageDialogRef = useRef<HTMLDialogElement>(null)
  const [expandedImage, setExpandedImage] = useState<Extract<LessonStep, { type: 'image' }> | null>(null)
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

  useEffect(() => {
    if (expandedImage && !imageDialogRef.current?.open) imageDialogRef.current?.showModal()
  }, [expandedImage])

  useEffect(() => {
    if (history.length === 1 && !currentVisit.selectedChoiceId) return
    const conversation = endRef.current?.parentElement
    if (conversation) {
      conversation.scrollTo({
        top: conversation.scrollHeight,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      })
    }
  }, [history.length, currentVisit.selectedChoiceId])

  function selectChoice(choiceId: string) {
    if (currentVisit.selectedChoiceId) return
    sound.play()
    onMessage()
    setHistory((previous) => previous.map((visit, index) =>
      index === previous.length - 1 && !visit.selectedChoiceId
        ? { ...visit, selectedChoiceId: choiceId }
        : visit,
    ))
  }

  function continueLesson() {
    if (!canContinue) return

    if (nextStepId) {
      sound.play()
      onMessage()
      setHistory((previous) => [...previous, { id: nextStepId }])
    } else {
      onComplete()
    }
  }

  return (
    <article className="lesson">
      <header className="lesson-header">
        <div className="lesson-toolbar">
          <a className="text-link" href="/">← Retour à l’atelier</a>
          {onShowSummary && <button className="sound-toggle" type="button" onClick={onShowSummary}>Voir l’essentiel</button>}
          <button className="sound-toggle" type="button" aria-pressed={sound.enabled} onClick={sound.toggle}>
            Son {sound.enabled ? 'activé' : 'désactivé'}
          </button>
        </div>
        <p className="lesson-category">{lesson.category}</p>
        <p className="course-progress">{progressLabel}</p>
        <h1>{lesson.title}</h1>
        <p className="lesson-duration">Durée estimée : {lesson.estimatedMinutes} min</p>
        <p className="lesson-step-count" role="status">Étape {history.length}</p>
        {sound.unavailable && <p role="status">Le son n’est pas disponible dans ce navigateur.</p>}
      </header>

      <div className="lesson-conversation">
        <div className="lesson-content" role="region" tabIndex={0} aria-label="Historique de la discussion avec Mémo">
          {history.map((visit, index) => {
            const step = stepsById.get(visit.id)!
            const isCurrent = index === history.length - 1

            if (step.type === 'message') {
              const previous = index > 0 ? stepsById.get(history[index - 1].id) : undefined
              return <ChatBubble avatar={previous?.type !== 'message'} key={`${step.id}-${index}`}><p>{step.text}</p></ChatBubble>
            }

            if (step.type === 'image') {
              return (
                <figure className="lesson-image" key={`${step.id}-${index}`}>
                  <img src={step.src} alt={step.alt} />
                  {step.caption && <figcaption>{step.caption}</figcaption>}
                  <button className="sound-toggle lesson-enlarge" type="button" onClick={() => setExpandedImage(step)}>Agrandir le schéma</button>
                </figure>
              )
            }

            const chosen = step.choices.find((choice) => choice.id === visit.selectedChoiceId)

            return (
              <section className="lesson-question" key={`${step.id}-${index}`}>
                <ChatBubble question><p>{step.prompt}</p></ChatBubble>
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
                {chosen && <ChatBubble feedback><p aria-live="polite">{chosen.feedback}</p></ChatBubble>}
              </section>
            )
          })}
          <div ref={endRef} className="lesson-end" aria-hidden="true" />
        </div>
      </div>

      <div className="lesson-controls">{canContinue && (
        <button className="lesson-next" type="button" onClick={continueLesson}>
          {nextStepId ? 'Continuer' : completionLabel}
        </button>
      )}</div>
      <dialog className="lesson-image-dialog" ref={imageDialogRef} aria-labelledby="lesson-image-title" onClose={() => setExpandedImage(null)}>
        <div className="lesson-image-dialog-header">
          <h2 id="lesson-image-title">Schéma de la leçon</h2>
          <button className="sound-toggle" type="button" onClick={() => imageDialogRef.current?.close()}>Fermer</button>
        </div>
        {expandedImage && <>
          <p>Sur petit écran, fais défiler le schéma horizontalement pour lire ses annotations.</p>
          <div className="lesson-image-zoom" role="region" tabIndex={0} aria-label="Schéma agrandi, défilement horizontal disponible">
            <img src={expandedImage.src} alt={expandedImage.alt} />
          </div>
          {expandedImage.caption && <p>{expandedImage.caption}</p>}
        </>}
      </dialog>
    </article>
  )
}

export default LessonView
