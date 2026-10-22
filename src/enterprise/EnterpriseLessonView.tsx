import { useEffect, useState } from 'react'
import ChatBubble from '../components/ChatBubble'
import LessonText from '../components/LessonText'
import ReturnPolicyPractice from './ReturnPolicyPractice'
import GuidedEnterprisePractice from './GuidedEnterprisePractice'
import AutomationFlowPractice from './AutomationFlowPractice'
import { useLessonScroll } from '../lesson/useLessonScroll'
import type { EnterpriseLesson } from '../types/enterpriseContent'
import type { EnterpriseLearningResult, VerifyEnterprisePractice } from '../types/enterprise'

type Props = {
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
}

export default function EnterpriseLessonView({ lesson, completed, available, busy, onComplete, returnHref, cardsHref, draft, onDraftChange, onVerify }: Props) {
  const [replaying] = useState(completed)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [finished, setFinished] = useState(false)
  const step = lesson.steps[index]
  const answer = answers[step.id]
  const checked = checks[step.id]
  const { contentRef, endRef } = useLessonScroll(`${index}:${Boolean(checked)}`, index > 0 || Boolean(checked), checked ? 'end' : 'current')
  useEffect(() => {
    if (index > 0) contentRef.current?.querySelector<HTMLElement>('[data-current="true"]')?.focus({ preventScroll: true })
  }, [index, contentRef])

  if (!completed && !available) return <section className="enterprise-panel"><h1>Une mission à la fois.</h1><p>Retrouve ton prochain petit pas sur le chemin avant de découvrir cette mission.</p><a href={returnHref}>Revenir à mon chemin →</a></section>
  if (finished) return <section className="enterprise-completion"><img src={`${import.meta.env.BASE_URL}memo/journey-celebrate.webp`} width="160" height="140" alt="Mémo célèbre ta mission"/><h1>{replaying ? 'Relecture terminée.' : 'Mission enregistrée.'}</h1><p role="status">{replaying ? 'Tu as relu cette mission. Ta progression et les dates de tes cartes sont conservées.' : 'Le serveur a confirmé la fin de ta mission dans cette organisation.'}</p><p><strong>Ce que tu as travaillé : </strong>{lesson.objective}</p><p>Tu peux maintenant retrouver ces idées avec les cartes, continuer ton parcours ou t’arrêter ici. Les cartes resteront accessibles dans cet espace.</p><a className="catalog-button" href={cardsHref}>{replaying ? 'Voir mes cartes →' : 'Découvrir mes cartes →'}</a><a className="text-link" href={returnHref}>Revenir à mon parcours →</a></section>

  async function advance() {
    if (busy) return
    if (index < lesson.steps.length - 1) setIndex(value => value + 1)
    else if (completed || await onComplete()) setFinished(true)
  }

  return <section className="enterprise-lesson">
    <a className="text-link" href={returnHref}>← Mon chemin Entreprise</a>
    <header className="enterprise-lesson-intro">
      <div><p className="lesson-category">{replaying ? 'Relecture' : 'Ta mission'} · environ {lesson.estimatedMinutes} min</p><h1>{lesson.title}</h1><p><strong>Ton objectif : </strong>{lesson.objective}</p><p>Explore le cas fictif, propose ta réponse dans l’activité, puis vérifie ton raisonnement. Avance à ton rythme avec « Continuer ».</p></div>
      <img className="enterprise-memo" src={`${import.meta.env.BASE_URL}memo/learning.webp`} alt="Mémo t’accompagne dans cette mission" width="120" height="110"/>
    </header>
    <div className="enterprise-lesson-progress"><span role="status">Étape {index + 1} sur {lesson.steps.length}</span><progress value={index + 1} max={lesson.steps.length} aria-label="Avancement dans la mission"/><span>Un mot souligné ? Survole-le ou touche-le pour lire sa définition.</span></div>
    <div className="enterprise-conversation" ref={contentRef} role="region" tabIndex={0} aria-label="Discussion de la mission avec Mémo">
      {lesson.steps.slice(0, index + 1).map((item, position) => {
        const current = position === index
        if (item.type === 'message') return <div className="enterprise-conversation-turn" data-current={current} tabIndex={-1} key={item.id}>
          <ChatBubble>{lesson.documents?.filter(document => document.stepId === item.id).map(document => <aside className="enterprise-lesson-document" key={document.src} aria-label={document.title}><p className="lesson-category">Document de l’exercice · fictif</p><h2>{document.title}</h2><LessonText text={document.text}/><a href={`${import.meta.env.BASE_URL}${document.src.replace(/^\//, '')}`} download>Télécharger ce document (.txt) ↓</a></aside>)}{!item.text.startsWith('Pratique ·') && <LessonText glossary glossaryId={lesson.id} text={item.text}/>}
            {item.id === 'ent-plausible-not-proven-practice-1' ? <ReturnPolicyPractice lessonId={lesson.id} draft={draft} onDraftChange={onDraftChange} onVerify={onVerify}/> : item.text.startsWith('Pratique ·') && <>{lesson.id === 'ent-automation-exceptions' && <AutomationFlowPractice/>}<GuidedEnterprisePractice lessonId={lesson.id} draft={draft} onDraftChange={onDraftChange} onVerify={onVerify}/></>}
          </ChatBubble>
        </div>
        if (item.type === 'image') return <figure className="enterprise-lesson-visual enterprise-conversation-turn" data-current={current} tabIndex={-1} key={item.id}><img src={`${import.meta.env.BASE_URL}${item.src.replace(/^\//, '')}`} alt={item.alt}/><figcaption>{item.caption}</figcaption><a className="text-link" href={`${import.meta.env.BASE_URL}${item.src.replace(/^\//, '')}`} target="_blank" rel="noopener noreferrer">Voir l’illustration en grand ↗</a></figure>
        const chosen = item.options.find(option => option.id === answers[item.id])
        return <section className="enterprise-conversation-turn" data-current={current} tabIndex={-1} key={item.id}>
          <ChatBubble question><LessonText glossary glossaryId={lesson.id} text={item.prompt}/></ChatBubble>
          <fieldset disabled={!current || busy || checks[item.id]}><legend className="sr-only">Choisis ta réponse</legend>{item.options.map(option => <label className="enterprise-option" key={option.id}><input type="radio" name={item.id} value={option.id} checked={answers[item.id] === option.id} onChange={() => setAnswers(previous => ({ ...previous, [item.id]: option.id }))}/><span>{option.text}</span></label>)}</fieldset>
          {checks[item.id] && chosen && <div className="enterprise-feedback" data-correct={chosen.id === item.correctOptionId} role={current ? 'status' : undefined}><strong>{chosen.id === item.correctOptionId ? 'Tu as retrouvé le bon réflexe.' : 'Reprenons ce point.'}</strong><LessonText glossary glossaryId={lesson.id} text={chosen.feedback}/>{current && chosen.id !== item.correctOptionId && <button className="catalog-button secondary" onClick={() => { setChecks(previous => ({ ...previous, [item.id]: false })); setAnswers(previous => ({ ...previous, [item.id]: '' })) }}>Réessayer avec cette explication</button>}</div>}
        </section>
      })}
      <div className="lesson-end" ref={endRef} aria-hidden="true"/>
    </div>
    <div className="enterprise-lesson-actions"><span>{replaying ? 'Relire ne change pas tes dates de révision.' : 'La mission sera validée après confirmation de son enregistrement.'}</span>{step.type === 'question' && !checked ? <button className="catalog-button" disabled={!answer || busy} onClick={() => setChecks(previous => ({ ...previous, [step.id]: true }))}>Vérifier mon raisonnement</button> : <button className="catalog-button" disabled={busy || (step.type === 'question' && answer !== step.correctOptionId)} onClick={() => { void advance() }}>{busy ? 'Enregistrement…' : index < lesson.steps.length - 1 ? 'Continuer →' : replaying ? 'Terminer la relecture' : 'Enregistrer ma mission'}</button>}</div>
    <details className="enterprise-sources"><summary>Sources de cette mission</summary><ul>{lesson.sources.map(source => <li key={source}><a href={source} target="_blank" rel="noopener noreferrer">{new URL(source).hostname} ↗</a></li>)}</ul></details>
  </section>
}
