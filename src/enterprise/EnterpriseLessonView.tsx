import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import ChatBubble from '../components/ChatBubble'
import LessonText from '../components/LessonText'
import ReturnPolicyPractice from './ReturnPolicyPractice'
import GuidedEnterprisePractice from './GuidedEnterprisePractice'
import AutomationFlowPractice from './AutomationFlowPractice'
import EnterpriseFictionalConversation from './EnterpriseFictionalConversation'
import { useLessonScroll } from '../lesson/useLessonScroll'
import type { EnterpriseLesson, EnterpriseStep } from '../types/enterpriseContent'
import './enterprise-conversation-pilot.css'
import type { EnterpriseLearningResult, EnterpriseLessonDraftState, EnterpriseLessonAssessment, VerifyEnterprisePractice } from '../types/enterprise'

export type EnterpriseLessonViewProps = {
  lesson: EnterpriseLesson
  completed: boolean
  available: boolean
  busy: boolean
  onComplete: () => Promise<EnterpriseLearningResult | null>
  returnHref: string
  cardsHref: string
  onVerify: VerifyEnterprisePractice
  draft: string
  onDraftChange: (draft: string) => void
  initialState?: EnterpriseLessonDraftState
  onSessionChange?: (state: EnterpriseLessonDraftState) => void
  sessionControls?: ReactNode
  hasUnsavedChanges?: boolean
  interactionDisabled?: boolean
  lessonAssessment?: EnterpriseLessonAssessment
  onSubmitAnswer?: (questionId: string, optionId: string) => Promise<EnterpriseLessonAssessment>
  onReloadAssessment?: () => Promise<EnterpriseLessonAssessment | null>
  onRestartAssessment?: () => void
}

export default function EnterpriseLessonView({ lesson, completed, available, busy, onComplete, returnHref, cardsHref, draft, onDraftChange, onVerify, initialState, onSessionChange, sessionControls, hasUnsavedChanges = false, interactionDisabled = false, lessonAssessment, onSubmitAnswer, onReloadAssessment, onRestartAssessment }: EnterpriseLessonViewProps) {
  const pilot = lesson.id === 'ent-answer-or-action'
  const [replaying] = useState(completed)
  const [index, setIndex] = useState(() => initialState ? Math.max(0, lesson.steps.findIndex(step => step.id === initialState.stepId)) : 0)
  const [answers, setAnswers] = useState<Record<string, string>>(initialState?.answers ?? {})
  const [checks, setChecks] = useState<Record<string, boolean>>(() => Object.fromEntries((initialState?.checkedIds ?? []).map(id => [id, true])))
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>(initialState?.practiceAnswers ?? {})
  const [finished, setFinished] = useState(Boolean(!completed && lessonAssessment?.finished))
  const [assessment, setAssessment] = useState<EnterpriseLessonAssessment | null>(!completed ? lessonAssessment ?? null : null)
  const [assessmentFeedback, setAssessmentFeedback] = useState<EnterpriseLessonAssessment['checks'][number] | null>(null)
  const [answerSaving, setAnswerSaving] = useState(false)
  const [answerError, setAnswerError] = useState('')
  const [answerNeedsRefresh, setAnswerNeedsRefresh] = useState(false)
  const [pendingAnswer, setPendingAnswer] = useState<{ questionId: string; optionId: string } | null>(null)
  const [completionConfirmed, setCompletionConfirmed] = useState(false)
  const answerInFlight = useRef(false)
  const completionInFlight = useRef(false)
  const assessmentFeedbackRef = useRef<HTMLElement>(null)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)
  const navigationDialog = useRef<HTMLDialogElement>(null)
  const step = lesson.steps[index]
  const checked = checks[step.id]
  const { contentRef, endRef } = useLessonScroll(`${index}:${Boolean(checked)}`, index > 0 || Boolean(checked), checked ? 'end' : 'current')
  useEffect(() => {
    if (assessmentFeedback) assessmentFeedbackRef.current?.focus({ preventScroll: true })
    else if (index > 0) contentRef.current?.querySelector<HTMLElement>('[data-current="true"]')?.focus({ preventScroll: true })
  }, [index, contentRef, assessmentFeedback])
  useEffect(() => {
    if (!assessment || finished) return
    const reached = new Set(lesson.steps.slice(0, index + 1).map(item => item.id))
    const confirmed = assessment.checks.filter(check => reached.has(check.questionId))
    if (confirmed.length) {
      setAnswers(previous => ({ ...previous, ...Object.fromEntries(confirmed.map(check => [check.questionId, check.selectedOptionId])) }))
      setChecks(previous => ({ ...previous, ...Object.fromEntries(confirmed.map(check => [check.questionId, true])) }))
    }
    if (step.type === 'question' && assessment.answers[step.id]) {
      const next = lesson.steps.findIndex(item => item.type === 'question' && !assessment.answers[item.id])
      if (next > index) {
        setAssessmentFeedback(assessment.checks.find(check => check.questionId === step.id) ?? null)
        setIndex(next)
      }
    }
  }, [pilot, assessment, finished, index, lesson, step])
  useEffect(() => {
    onSessionChange?.({ stepId: step.id, answers, checkedIds: Object.keys(checks).filter(id => checks[id]), draft, practiceAnswers })
  }, [step.id, answers, checks, draft, practiceAnswers, onSessionChange])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !finished && !replaying) { event.preventDefault(); event.returnValue = '' }
    }
    const confirmNavigation = (event: Event) => {
      if (!hasUnsavedChanges || finished || replaying) return
      const proceed = (event as CustomEvent<{ proceed?: () => void }>).detail?.proceed
      if (typeof proceed !== 'function') return
      event.preventDefault()
      setPendingNavigation(() => proceed)
    }
    window.addEventListener('beforeunload', warn)
    window.addEventListener('enterprise-before-navigate', confirmNavigation)
    return () => {
      window.removeEventListener('beforeunload', warn)
      window.removeEventListener('enterprise-before-navigate', confirmNavigation)
    }
  }, [hasUnsavedChanges, finished, replaying])
  useEffect(() => {
    const dialog = navigationDialog.current
    if (pendingNavigation && dialog && !dialog.open) dialog.showModal()
    else if (!pendingNavigation && dialog?.open) dialog.close()
  }, [pendingNavigation])

  if (!completed && !available) return <section className="enterprise-panel"><h1>Une mission à la fois.</h1><p>Retrouve ton prochain petit pas sur le chemin avant de découvrir cette mission.</p><a href={returnHref}>Revenir à mon chemin →</a></section>
  if (finished && assessment) {
    const canRestart = replaying || Boolean(assessment.retryAt && Date.parse(assessment.retryAt) <= Date.now())
    return <section className="enterprise-panel pilot-assessment-result" aria-labelledby="pilot-result-title">
      <p className="lesson-category">{replaying ? 'Ta relecture' : 'Ton résultat'}</p>
      <h1 id="pilot-result-title">{assessment.passed ? 'Les bons réflexes sont là.' : 'Ces réflexes se construisent.'}</h1>
      <p className="pilot-assessment-score" role="status"><strong>{assessment.correct}</strong> / {assessment.total}</p>
      <p>{replaying ? 'Ce résultat d’entraînement ne change pas ta progression.' : assessment.passed ? completionConfirmed ? 'Ta leçon est validée. La suite de ton parcours est disponible.' : 'Toutes tes réponses sont correctes. Valide ta leçon pour débloquer la suite.' : 'Pour débloquer la suite, il faut retrouver les bonnes réponses à toutes les questions.'}</p>
      {!assessment.passed && !replaying && assessment.retryAt && <p>Tu pourras recommencer la leçon à partir du {new Date(assessment.retryAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'long', timeStyle: 'short' })}, heure de Paris.</p>}
      <ul className="pilot-assessment-checks">{assessment.checks.map(check => <li key={check.questionId} data-correct={check.correct}><strong>{check.correct ? '✓' : 'À revoir'} · {check.questionText}</strong>{!check.correct && <><p>La bonne réponse : {check.correctAnswerText}</p><p>{check.explanation}</p></>}</li>)}</ul>
      {answerError && <p role="alert">{answerError}</p>}
      <div className="pilot-assessment-result-actions">
        {!replaying && assessment.passed && !completionConfirmed && <button className="catalog-button" disabled={answerSaving || busy} onClick={() => { void confirmCompletion() }}>{answerSaving || busy ? 'Enregistrement…' : 'Valider ma leçon'}</button>}
        {!assessment.passed && canRestart && <button className="catalog-button" onClick={restartAssessment}>Recommencer la leçon</button>}
        <a className="catalog-button secondary" href={returnHref}>Retrouver mon parcours</a>
      </div>
    </section>
  }
  if (finished) return <section className="enterprise-completion"><img src={`${import.meta.env.BASE_URL}memo/journey-celebrate.webp`} width="160" height="140" alt="Mémo célèbre ta mission"/><h1>{replaying ? 'Relecture terminée.' : 'Mission enregistrée.'}</h1><p role="status">{replaying ? 'Tu as relu cette mission. Ta progression et les dates de tes cartes sont conservées.' : 'Le serveur a confirmé la fin de ta mission dans cette organisation.'}</p><p><strong>Ce que tu as travaillé : </strong>{lesson.objective}</p><p>Tu peux maintenant retrouver ces idées avec les cartes, continuer ton parcours ou t’arrêter ici. Les cartes resteront accessibles dans cet espace.</p><a className="catalog-button" href={cardsHref}>{replaying ? 'Voir mes cartes →' : 'Découvrir mes cartes →'}</a><a className="text-link" href={returnHref}>Revenir à mon parcours →</a></section>

  async function advance() {
    if (busy || (step.type === 'message' && step.choices?.length && !checked)) return
    if (index < lesson.steps.length - 1) setIndex(value => value + 1)
    else if (completed || await onComplete()) setFinished(true)
  }

  async function confirmCompletion() {
    if (completionInFlight.current) return
    completionInFlight.current = true
    setAnswerSaving(true)
    setAnswerError('')
    try {
      const saved = await onComplete()
      if (saved) setCompletionConfirmed(true)
      else setAnswerError('La validation n’est pas encore confirmée. Réessaie pour enregistrer ta leçon.')
    } catch {
      setAnswerError('La validation n’est pas encore confirmée. Réessaie pour enregistrer ta leçon.')
    } finally { completionInFlight.current = false; setAnswerSaving(false) }
  }

  function restartAssessment() {
    onRestartAssessment?.()
    setAssessment(null)
    setAssessmentFeedback(null)
    setAnswers({})
    setChecks({})
    setIndex(0)
    setPracticeAnswers({})
    onDraftChange('')
    setPendingAnswer(null)
    setAnswerError('')
    setAnswerNeedsRefresh(false)
    setCompletionConfirmed(false)
    setFinished(false)
    window.scrollTo(0, 0)
  }

  async function submitQuestion(questionId: string, optionId: string) {
    if (answerInFlight.current || busy || interactionDisabled || assessment?.answers[questionId]) return
    const question = lesson.steps.find(item => item.id === questionId)
    if (!question || question.type !== 'question') return
    answerInFlight.current = true
    setAnswerSaving(true)
    setAnswerError('')
    setAnswerNeedsRefresh(false)
    setPendingAnswer({ questionId, optionId })
    try {
      let result: EnterpriseLessonAssessment
      if (replaying) {
        const correctOption = question.options.find(option => option.id === question.correctOptionId)!
        const selected = question.options.find(option => option.id === optionId)!
        const checked = [...(assessment?.checks ?? []), { questionId, selectedOptionId: optionId, correctOptionId: correctOption.id, correct: optionId === correctOption.id, explanation: selected.feedback, questionText: question.prompt, correctAnswerText: correctOption.text, selectedAnswerText: selected.text }]
        const total = lesson.steps.filter(item => item.type === 'question').length
        const correct = checked.filter(check => check.correct).length
        result = { lessonId: lesson.id, attemptDay: '', contentVersion: 'replay', answers: { ...assessment?.answers, [questionId]: optionId }, checks: checked, correct, total, finished: checked.length === total, passed: checked.length === total && correct === total, retryAt: null, updatedAt: new Date().toISOString() }
      } else {
        if (!onSubmitAnswer) throw new Error('Évaluation indisponible')
        result = await onSubmitAnswer(questionId, optionId)
      }
      setAssessment(result)
      setAnswers(previous => ({ ...previous, [questionId]: result.answers[questionId] }))
      setChecks(previous => ({ ...previous, [questionId]: true }))
      setAssessmentFeedback(result.checks.find(check => check.questionId === questionId) ?? null)
      setPendingAnswer(null)
      if (result.finished) {
        setFinished(true)
        if (result.passed && !replaying) await confirmCompletion()
        window.scrollTo(0, 0)
      } else {
        const next = lesson.steps.findIndex(item => item.type === 'question' && !result.answers[item.id])
        if (next >= 0) setIndex(next)
      }
    } catch (error) {
      const code = String((error as { code?: string }).code)
      let recovered = false
      if ((code.includes('already-exists') || code.includes('resource-exhausted')) && onReloadAssessment) {
        try {
          const confirmed = await onReloadAssessment()
          if (confirmed) {
            setAssessment(confirmed)
            setPendingAnswer(null)
            setFinished(confirmed.finished)
            recovered = true
          }
        } catch { /* Keep the uncertain answer available for an explicit retry. */ }
      }
      if (!recovered && code.includes('failed-precondition')) {
        setAnswerNeedsRefresh(true)
        setAnswerError('Le contenu ou l’état de cette leçon a changé. Actualise pour retrouver la version courante.')
      } else if (!recovered) setAnswerError('Ta réponse n’est pas encore confirmée. Réessaie avec le même choix pour reprendre la bonne tentative.')
    } finally {
      answerInFlight.current = false
      setAnswerSaving(false)
    }
  }

  function renderStep(item: EnterpriseStep, position: number) {
    const current = position === index
    if (pilot && item.type === 'message' && item.choices?.length) {
      const selected = item.choices.find(option => option.id === answers[item.id])
      return <section className="enterprise-conversation-turn pilot-turn" data-current={current} tabIndex={-1} key={item.id} aria-label="Échange avec Mémo">
        {item.text.split('\n\n').map((text, part) => <ChatBubble key={part} avatar={part === 0}><LessonText glossary glossaryId={lesson.id} text={text}/></ChatBubble>)}
        {selected && checks[item.id] ? <>
          <div className="pilot-user-reply"><span className="sr-only">Toi : </span>{selected.text}</div>
          <div className="pilot-reaction" role={current ? 'status' : undefined}><ChatBubble feedback><LessonText glossary glossaryId={lesson.id} text={selected.feedback}/></ChatBubble></div>
        </> : <div className="pilot-choices" role="group" aria-label="Ta réponse à Mémo">{item.choices.map(option => <button type="button" key={option.id} disabled={!current || busy || interactionDisabled} onClick={() => { setAnswers(previous => ({ ...previous, [item.id]: option.id })); setChecks(previous => ({ ...previous, [item.id]: true })) }}>{option.text}</button>)}</div>}
      </section>
    }
    if (item.type === 'message') return <div className="enterprise-conversation-turn" data-current={current} tabIndex={-1} key={item.id}>
      <ChatBubble>{lesson.documents?.filter(document => document.stepId === item.id).map(document => <aside className="enterprise-lesson-document" key={document.src} aria-label={document.title}><p className="lesson-category">Document de l’exercice · fictif</p><h2>{document.title}</h2><LessonText text={document.text}/><a href={`${import.meta.env.BASE_URL}${document.src.replace(/^\//, '')}`} download>Télécharger ce document (.txt) ↓</a></aside>)}{!item.text.startsWith('Pratique ·') && <LessonText glossary glossaryId={lesson.id} text={item.text}/>}
        {item.id === 'ent-plausible-not-proven-practice-1' ? <ReturnPolicyPractice lessonId={lesson.id} draft={draft} onDraftChange={onDraftChange} onVerify={onVerify} answers={practiceAnswers} onAnswersChange={setPracticeAnswers}/> : item.text.startsWith('Pratique ·') && <>{lesson.id === 'ent-automation-exceptions' && <AutomationFlowPractice/>}<GuidedEnterprisePractice lessonId={lesson.id} draft={draft} onDraftChange={onDraftChange} onVerify={onVerify}/></>}
      </ChatBubble>
    </div>
    if (item.type === 'image') return <figure className="enterprise-lesson-visual enterprise-conversation-turn" data-current={current} tabIndex={-1} key={item.id}><img src={`${import.meta.env.BASE_URL}${item.src.replace(/^\//, '')}`} alt={item.alt}/><figcaption>{item.caption}</figcaption><a className="text-link" href={`${import.meta.env.BASE_URL}${item.src.replace(/^\//, '')}`} target="_blank" rel="noopener noreferrer">Voir l’illustration en grand ↗</a></figure>
    return <section className="enterprise-conversation-turn" data-current={current} tabIndex={-1} key={item.id}>
      {current && assessmentFeedback && <aside className="enterprise-feedback pilot-assessment-feedback" data-correct={assessmentFeedback.correct} ref={assessmentFeedbackRef} tabIndex={-1} role="status"><strong>{assessmentFeedback.correct ? 'Bonne réponse.' : 'Voici le bon réflexe.'}</strong>{!assessmentFeedback.correct && <p>La bonne réponse : {assessmentFeedback.correctAnswerText}</p>}<p>{assessmentFeedback.explanation}</p></aside>}
      <ChatBubble question><LessonText glossary glossaryId={lesson.id} text={item.prompt}/></ChatBubble>
      <fieldset disabled={!current || busy || answerSaving || Boolean(pendingAnswer) || Boolean(checks[item.id])}><legend className="sr-only">Ta première réponse sera enregistrée</legend>{item.options.map(option => <label className="enterprise-option" key={option.id}><input type="radio" name={item.id} value={option.id} checked={answers[item.id] === option.id || (pendingAnswer?.questionId === item.id && pendingAnswer.optionId === option.id)} onChange={() => { void submitQuestion(item.id, option.id) }}/><span>{option.text}</span></label>)}</fieldset>
    </section>

  }

  return <section className="enterprise-lesson" data-conversation-pilot={pilot || undefined}>
    <dialog ref={navigationDialog} className="enterprise-navigation-dialog" aria-labelledby="enterprise-navigation-title" aria-describedby="enterprise-navigation-description" onCancel={event => { event.preventDefault(); setPendingNavigation(null) }} onClose={() => setPendingNavigation(null)}>
      <h2 id="enterprise-navigation-title">Quitter cette mission ?</h2>
      <p id="enterprise-navigation-description">Des modifications de cette mission ne sont pas enregistrées. Si tu quittes maintenant, elles seront perdues. Ta dernière reprise confirmée reste disponible.</p>
      <div className="enterprise-resume-actions"><button type="button" autoFocus className="catalog-button" onClick={() => setPendingNavigation(null)}>Rester dans la mission</button><button type="button" className="catalog-button secondary" onClick={() => { const proceed = pendingNavigation; setPendingNavigation(null); navigationDialog.current?.close(); proceed?.() }}>Quitter sans enregistrer</button></div>
    </dialog>
    <a className="text-link" href={returnHref}>← Mon chemin Entreprise</a>
    <header className="enterprise-lesson-intro">
      <div><p className="lesson-category">{replaying ? 'Relecture' : 'Ta mission'} · environ {lesson.estimatedMinutes} min</p><h1>{lesson.title}</h1><p><strong>Ton objectif : </strong>{lesson.objective}</p><p>{pilot ? 'Une invitation à préparer. Quelques choix à faire. Mémo t’accompagne.' : 'Explore le cas fictif, propose ta réponse dans l’activité, puis vérifie ton raisonnement. Avance à ton rythme avec « Continuer ».'}</p></div>
      <img className="enterprise-memo" src={`${import.meta.env.BASE_URL}memo/learning.webp`} alt="Mémo t’accompagne dans cette mission" width="120" height="110"/>
    </header>
    <div className="enterprise-lesson-progress"><span role="status">Étape {index + 1} sur {lesson.steps.length}</span><progress value={index + 1} max={lesson.steps.length} aria-label="Avancement dans la mission"/>{!pilot && <span>Un mot souligné ? Survole-le ou touche-le pour lire sa définition.</span>}</div>
    <div className="enterprise-conversation" ref={contentRef} role="region" tabIndex={0} aria-label="Discussion de la mission avec Mémo" inert={interactionDisabled || undefined}>
      {pilot ? <>
        {index > 0 && <details className="pilot-history" key={index}><summary>Revoir les échanges précédents · {index}</summary>{lesson.steps.slice(0, index).map(renderStep)}</details>}
        {renderStep(step, index)}
      </> : lesson.steps.slice(0, index + 1).map(renderStep)}
      <div className="lesson-end" ref={endRef} aria-hidden="true"/>
    </div>
    {<div className="pilot-answer-status"><p role={answerError ? 'alert' : 'status'}>{answerError || (answerSaving ? 'Enregistrement de ta réponse…' : step.type === 'question' ? replaying ? 'Entraînement : une réponse par question, puis ton résultat.' : 'Une réponse par question. Réussis les deux pour débloquer la suite. En cas d’erreur, nouvelle tentative demain.' : '')}</p>{answerError && (answerNeedsRefresh ? <button className="catalog-button secondary" onClick={() => window.location.reload()}>Actualiser la leçon</button> : pendingAnswer && <button className="catalog-button secondary" disabled={answerSaving} onClick={() => { void submitQuestion(pendingAnswer.questionId, pendingAnswer.optionId) }}>Réessayer l’enregistrement</button>)}</div>}
    {!replaying && (pilot ? <details className="pilot-session-tools"><summary>Enregistrer pour reprendre plus tard</summary>{sessionControls}</details> : sessionControls)}
    {(pilot || step.type !== 'question') && <div className="enterprise-lesson-actions">
      <span>{pilot ? step.type === 'message' && step.choices?.length && !checked ? 'Choisis ta réponse pour avancer.' : 'À ton rythme, une idée à la fois.' : replaying ? 'Relire ne change pas tes dates de révision.' : 'La leçon sera validée après toutes les bonnes réponses et son enregistrement.'}</span>
      <div className="enterprise-lesson-action-buttons">
        {pilot && <EnterpriseFictionalConversation stepId={step.id} checkedIds={Object.keys(checks).filter(id => checks[id])} disabled={busy || interactionDisabled || answerSaving} />}
        {step.type !== 'question' && <button className="catalog-button" disabled={busy || (step.type === 'message' && Boolean(step.choices?.length) && !checked)} onClick={() => { void advance() }}>{busy ? 'Enregistrement…' : 'Continuer →'}</button>}
      </div>
    </div>}
    <details className="enterprise-sources"><summary>Sources de cette mission</summary><ul>{lesson.sources.map(source => <li key={source}><a href={source} target="_blank" rel="noopener noreferrer">{new URL(source).hostname} ↗</a></li>)}</ul></details>
  </section>
}
