import { useEffect, useRef, useState } from 'react'
import LessonText from '../components/LessonText'
import practices from '../data/enterprisePractices.json' with { type: 'json' }
import EnterprisePracticeFeedback from './EnterprisePracticeFeedback'
import { guidedPracticeAnswer } from './practiceAnswer'
import type { VerifyEnterprisePractice } from '../types/enterprise'

export type EnterprisePractice = {
  scenario: string
  task: string
  starter: string
  checklist: string[]
  example: string
  explanation: string
}

export const enterprisePractices = practices as Record<string, EnterprisePractice>

export default function GuidedEnterprisePractice({ lessonId, draft = '', onDraftChange, onVerify }: { lessonId: string; draft?: string; onDraftChange: (draft: string) => void; onVerify: VerifyEnterprisePractice }) {
  const practice = enterprisePractices[lessonId]
  const twoPartAnswer = lessonId === 'ent-answer-or-action'
  const [assistantDraft = '', ...personalParts] = draft.split('\n\n')
  const personalDraft = personalParts.join('\n\n')
  const [compared, setCompared] = useState(false)
  const feedback = useRef<HTMLElement>(null)
  useEffect(() => {
    if (compared) {
      feedback.current?.focus({ preventScroll: true })
      feedback.current?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }
  }, [compared])
  if (!practice) return null

  function updateDraft(value: string) {
    onDraftChange(value)
  }

  return <div className="enterprise-practice enterprise-guided-practice" data-compact={twoPartAnswer}>
    <h2>À toi de jouer</h2>
    <section className="enterprise-practice-case" aria-label="Situation fictive de l’exercice"><p className="lesson-category">Le cas à explorer</p><LessonText glossary glossaryId={lessonId} text={practice.scenario}/></section>
    {twoPartAnswer ? <div className="enterprise-practice-answer-fields">
      <label>Ce que Léa peut demander à son assistant IA<input type="text" value={assistantDraft} onChange={event => updateDraft(`${event.target.value}\n\n${personalDraft}`)} maxLength={2400}/></label>
      <label>Ce qu’elle doit faire elle-même<input type="text" value={personalDraft} onChange={event => updateDraft(`${assistantDraft}\n\n${event.target.value}`)} maxLength={2400}/></label>
    </div> : <>
      <LessonText glossary glossaryId={lessonId} text={practice.task}/>
      <label>Ta proposition<textarea value={draft} onChange={event => updateDraft(event.target.value)} maxLength={5000} rows={6} placeholder="Écris avec tes mots…"/></label>
    </>}
    <EnterprisePracticeFeedback lessonId={lessonId} practice={practice} answer={guidedPracticeAnswer(lessonId, draft)} onVerify={onVerify}/>
    <div className="enterprise-practice-tools"><button type="button" className="text-link" onClick={() => setCompared(previous => !previous)} aria-expanded={compared}>{compared ? 'Masquer l’exemple' : 'Voir un exemple'}</button></div>
    {compared && <section className="enterprise-practice-comparison" ref={feedback} tabIndex={-1} aria-label="Exemple commenté et repères de comparaison">
      <h3>Un exemple possible</h3>
      <LessonText glossary glossaryId={lessonId} text={practice.example}/>
      <h3>Pourquoi cet exemple convient</h3>
      <LessonText glossary glossaryId={lessonId} text={practice.explanation}/>
      <p>Plusieurs formulations peuvent convenir. Compare les idées plutôt que les mots de l’exemple. Tu peux modifier ta proposition ci-dessus.</p>
    </section>}
  </div>
}
