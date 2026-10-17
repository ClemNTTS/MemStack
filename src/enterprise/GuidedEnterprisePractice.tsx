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

export default function GuidedEnterprisePractice({ lessonId, draft = '', onDraftChange }: { lessonId: string; draft?: string; onDraftChange: (draft: string) => void }) {
  const practice = enterprisePractices[lessonId]
  const [compared, setCompared] = useState(false)
  const [exportStatus, setExportStatus] = useState('')
  const [reviewed, setReviewed] = useState<Record<number, boolean>>({})
  const feedback = useRef<HTMLElement>(null)
  useEffect(() => {
    if (compared) {
      feedback.current?.focus({ preventScroll: true })
      feedback.current?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }
  }, [compared])
  if (!practice) return null

  async function copy() {
    try { await navigator.clipboard.writeText(draft); setExportStatus('Proposition copiée. Tu peux la coller dans ton document.') }
    catch { setExportStatus('Copie indisponible. Sélectionne ton texte ou télécharge-le.') }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([draft], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `${lessonId}-proposition.txt`; anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setExportStatus('Téléchargement demandé. Vérifie le fichier dans tes téléchargements.')
  }

  return <div className="enterprise-practice enterprise-guided-practice">
    <h2>À toi de jouer</h2>
    <p className="lesson-category">Auto-comparaison guidée · sans analyse IA de ta saisie</p>
    <section className="enterprise-practice-case" aria-label="Situation fictive de l’exercice"><p className="lesson-category">Toutes les informations pour cet exercice</p><LessonText glossary glossaryId={lessonId} text={practice.scenario}/></section>
    <LessonText glossary glossaryId={lessonId} text={practice.task}/>
    <section aria-label="Critères pour préparer ta proposition"><h3>Ton résultat doit permettre de…</h3><ul>{practice.checklist.map(point => <li key={point}><LessonText glossary glossaryId={lessonId} text={point}/></li>)}</ul></section>
    <p className="dashboard-note">Travaille avec les pièces fictives. Ta saisie reste en mémoire dans cet espace, sans envoi au responsable ni à une IA. Copie-la ou télécharge-la avant de fermer ou de quitter l’espace : elle sera perdue.</p>
    <label>Ta proposition<textarea value={draft} onChange={event => { onDraftChange(event.target.value); setExportStatus(''); setReviewed({}) }} maxLength={5000} rows={6} placeholder={practice.starter}/></label>
    <div className="dashboard-note"><LessonText glossary glossaryId={lessonId} text={`Tu peux t’aider de cette structure : ${practice.starter}`}/></div>
    <div className="enterprise-practice-tools"><button type="button" className="catalog-button secondary" disabled={!draft.trim()} onClick={() => setCompared(true)}>Comparer avec un exemple</button><button type="button" className="catalog-button secondary" disabled={!draft.trim()} onClick={() => { void copy() }}>Copier mon texte</button><button type="button" className="catalog-button secondary" disabled={!draft.trim()} onClick={download}>Télécharger (.txt)</button></div>
    <p role="status" className="dashboard-note">{exportStatus}</p>
    {compared && <section className="enterprise-practice-comparison" ref={feedback} tabIndex={-1} aria-label="Exemple commenté et repères de comparaison">
      <h3>Un exemple possible</h3>
      <LessonText glossary glossaryId={lessonId} text={practice.example}/>
      <h3>Pourquoi cet exemple convient</h3>
      <LessonText glossary glossaryId={lessonId} text={practice.explanation}/>
      <h3>Relis maintenant ton propre texte</h3>
      <p>Coche les critères que tu retrouves dans ta proposition, puis complète les points manquants. Cette auto-comparaison ne note pas ta saisie et ne certifie pas le résultat.</p>
      <div className="enterprise-practice-checklist">{practice.checklist.map((point, index) => <label key={point}><input type="checkbox" checked={Boolean(reviewed[index])} onChange={event => setReviewed(previous => ({ ...previous, [index]: event.target.checked }))}/><span><LessonText glossary glossaryId={lessonId} text={point}/></span></label>)}</div>
      <p>Plusieurs formulations peuvent convenir. Compare les idées plutôt que les mots de l’exemple. Tu peux modifier ta proposition ci-dessus.</p>
    </section>}
    <p className="dashboard-note">Les questions qui suivent consolident la méthode. Aucun assistant externe ni achat n’est nécessaire pour terminer cet atelier.</p>
  </div>
}
