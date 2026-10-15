import { useEffect, useRef, useState } from 'react'
import LessonText from '../components/LessonText'
import practices from '../data/enterprisePractices.json' with { type: 'json' }

export type EnterprisePractice = {
  scenario: string
  task: string
  starter: string
  checklist: string[]
  example: string
  explanation: string
}

export const enterprisePractices = practices as Record<string, EnterprisePractice>

export default function GuidedEnterprisePractice({ lessonId }: { lessonId: string }) {
  const practice = enterprisePractices[lessonId]
  const [draft, setDraft] = useState('')
  const [compared, setCompared] = useState(false)
  const feedback = useRef<HTMLElement>(null)
  useEffect(() => {
    if (compared) {
      feedback.current?.focus({ preventScroll: true })
      feedback.current?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }
  }, [compared])
  if (!practice) return null

  return <div className="enterprise-practice enterprise-guided-practice">
    <h2>À toi de jouer</h2>
    <section className="enterprise-practice-case" aria-label="Situation fictive de l’exercice"><p className="lesson-category">Toutes les informations pour cet exercice</p><LessonText glossary glossaryId={lessonId} text={practice.scenario}/></section>
    <LessonText glossary glossaryId={lessonId} text={practice.task}/>
    <label>Ta proposition<textarea value={draft} onChange={event => setDraft(event.target.value)} maxLength={5000} rows={6} placeholder={practice.starter}/></label>
    <div className="dashboard-note"><LessonText glossary glossaryId={lessonId} text={`Tu peux t’aider de cette structure : ${practice.starter}`}/></div>
    <button type="button" className="catalog-button secondary" disabled={!draft.trim()} onClick={() => setCompared(true)}>Comparer ma proposition à un exemple</button>
    {compared && <section className="enterprise-practice-comparison" ref={feedback} tabIndex={-1} aria-label="Exemple commenté et repères de comparaison">
      <h3>Un exemple possible</h3>
      <LessonText glossary glossaryId={lessonId} text={practice.example}/>
      <h3>Pourquoi cet exemple convient</h3>
      <LessonText glossary glossaryId={lessonId} text={practice.explanation}/>
      <h3>Les points à retrouver dans ta proposition</h3>
      <ul>{practice.checklist.map(point => <li key={point}><LessonText glossary glossaryId={lessonId} text={point}/></li>)}</ul>
      <p>Plusieurs formulations peuvent convenir. Compare les idées, puis ajuste ta proposition si un point manque.</p>
    </section>}
    <p className="dashboard-note">Copie ta proposition avant de quitter la page si tu veux la conserver. Les questions qui suivent te permettront de vérifier ton raisonnement.</p>
  </div>
}
