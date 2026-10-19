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
  const twoPartAnswer = lessonId === 'ent-answer-or-action'
  const [assistantDraft = '', ...personalParts] = draft.split('\n\n')
  const personalDraft = personalParts.join('\n\n')
  const exportDraft = twoPartAnswer
    ? [assistantDraft.trim() && `Ce que Léa peut demander à son assistant IA\n${assistantDraft}`, personalDraft.trim() && `Ce qu’elle doit faire elle-même\n${personalDraft}`].filter(Boolean).join('\n\n')
    : draft
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

  function updateDraft(value: string) {
    onDraftChange(value)
    setExportStatus('')
    setReviewed({})
  }

  async function copy() {
    try { await navigator.clipboard.writeText(exportDraft); setExportStatus('Proposition copiée. Tu peux la coller dans ton document.') }
    catch { setExportStatus('Copie indisponible. Sélectionne ton texte ou télécharge-le.') }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([exportDraft], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `${lessonId}-proposition.txt`; anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setExportStatus('Téléchargement demandé. Vérifie le fichier dans tes téléchargements.')
  }

  return <div className="enterprise-practice enterprise-guided-practice" data-compact={twoPartAnswer}>
    <h2>À toi de jouer</h2>
    {!twoPartAnswer && <p className="lesson-category">Un petit essai, puis un exemple pour te guider</p>}
    <section className="enterprise-practice-case" aria-label="Situation fictive de l’exercice"><p className="lesson-category">Le cas à explorer</p><LessonText glossary glossaryId={lessonId} text={practice.scenario}/></section>
    {twoPartAnswer ? <div className="enterprise-practice-answer-fields">
      <label>Ce que Léa peut demander à son assistant IA<input type="text" value={assistantDraft} onChange={event => updateDraft(`${event.target.value}\n\n${personalDraft}`)} maxLength={2500}/></label>
      <label>Ce qu’elle doit faire elle-même<input type="text" value={personalDraft} onChange={event => updateDraft(`${assistantDraft}\n\n${event.target.value}`)} maxLength={2500}/></label>
    </div> : <>
      <LessonText glossary glossaryId={lessonId} text={practice.task}/>
      <section aria-label="Critères pour préparer ta proposition"><h3>Quelques repères pour t’aider</h3><ul>{practice.checklist.map(point => <li key={point}><LessonText glossary glossaryId={lessonId} text={point}/></li>)}</ul></section>
      <p className="dashboard-note">Ton texte reste ici, sans envoi à ton équipe ou à une IA. Copie-le ou télécharge-le avant de quitter cet espace.</p>
      <label>Ta proposition<textarea value={draft} onChange={event => updateDraft(event.target.value)} maxLength={5000} rows={6} placeholder={practice.starter}/></label>
      <div className="dashboard-note"><LessonText glossary glossaryId={lessonId} text={`Tu peux t’aider de cette structure : ${practice.starter}`}/></div>
    </>}
    {twoPartAnswer && <p className="dashboard-note">Ton texte reste ici, sans envoi à ton équipe ou à une IA. Copie-le ou télécharge-le avant de quitter cet espace.</p>}
    <div className="enterprise-practice-tools"><button type="button" className="catalog-button secondary" disabled={!draft.trim()} onClick={() => setCompared(true)}>Comparer avec un exemple</button><button type="button" className="catalog-button secondary" disabled={!draft.trim()} onClick={() => { void copy() }}>Copier mon texte</button><button type="button" className="catalog-button secondary" disabled={!draft.trim()} onClick={download}>Télécharger (.txt)</button></div>
    <p role="status" className="dashboard-note">{exportStatus}</p>
    {compared && <section className="enterprise-practice-comparison" ref={feedback} tabIndex={-1} aria-label="Exemple commenté et repères de comparaison">
      <h3>Un exemple possible</h3>
      <LessonText glossary glossaryId={lessonId} text={practice.example}/>
      <h3>Pourquoi cet exemple convient</h3>
      <LessonText glossary glossaryId={lessonId} text={practice.explanation}/>
      <h3>Relis maintenant ton propre texte</h3>
      <p>Coche les points déjà présents dans ton texte, puis complète ce qui manque. Tu compares toi-même ; il n’y a pas de note automatique.</p>
      <div className="enterprise-practice-checklist">{practice.checklist.map((point, index) => <label key={point}><input type="checkbox" checked={Boolean(reviewed[index])} onChange={event => setReviewed(previous => ({ ...previous, [index]: event.target.checked }))}/><span><LessonText glossary glossaryId={lessonId} text={point}/></span></label>)}</div>
      <p>Plusieurs formulations peuvent convenir. Compare les idées plutôt que les mots de l’exemple. Tu peux modifier ta proposition ci-dessus.</p>
    </section>}
    {!twoPartAnswer && <p className="dashboard-note">Tu peux terminer cet atelier sans autre outil.</p>}
  </div>
}
