import { useState } from 'react'
import EnterprisePracticeFeedback from './EnterprisePracticeFeedback'
import { enterprisePractices } from './GuidedEnterprisePractice'
import type { VerifyEnterprisePractice } from '../types/enterprise'
import { enterpriseLessonById } from '../data/enterprise'
import LessonText from '../components/LessonText'
import './enterprise-practice-guidance.css'

const claims = [
  { id: 'delay', text: 'Le client peut retourner son produit pendant 60 jours.', expected: 'contradicted', explanation: 'La politique prévoit 30 jours : le délai de 60 jours contredit le document.' },
  { id: 'fees', text: 'Les frais de retour sont pris en charge dans tous les cas.', expected: 'contradicted', explanation: 'La prise en charge est réservée aux produits endommagés. L’assistant IA a supprimé cette condition.' },
  { id: 'reference', text: 'La note RET-2026-14 confirme ces conditions.', expected: 'unverified', explanation: 'Cette note ne figure dans aucune pièce de l’exercice. Tu ne peux pas vérifier ce qu’elle dit : une référence plausible ne suffit pas.' },
]

export default function ReturnPolicyPractice({ lessonId, draft, onDraftChange, onVerify }: { lessonId: string; draft: string; onDraftChange: (draft: string) => void; onVerify: VerifyEnterprisePractice }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const practice = enterprisePractices[lessonId]
  const documents = enterpriseLessonById.get(lessonId)?.documents ?? []
  const labels: Record<string, string> = { supported: 'Confirmé par le document', contradicted: 'Contredit par le document', unverified: 'Non vérifiable ici' }
  const answer = draft.trim() ? `${claims.map(claim => `${claim.text} — ${labels[answers[claim.id]] ?? 'Pas encore choisi'}`).join('\n')}\n\nMa réponse au client : ${draft}` : ''
  const correct = claims.filter(claim => answers[claim.id] === claim.expected).length

  return <div className="enterprise-practice enterprise-claim-practice">
    <h2>Que peux-tu réellement affirmer au client ?</h2>
    <p>Tu aides Sami à relire un brouillon de l’assistant IA. Prépare ici une réponse fiable au client : aucun message réel n’est envoyé.</p>
    <h3>1. Compare le brouillon aux pièces du cas</h3>
    {documents.map(document => <aside className="enterprise-practice-source" key={document.src} aria-label={`Pièce à consulter : ${document.title}`}><h4>{document.title} · document fictif</h4><LessonText text={document.text}/></aside>)}
    <p>Pour chaque affirmation, choisis si elle est confirmée, contredite ou impossible à vérifier avec ces pièces. Une information absente n’est pas forcément fausse.</p>
    {claims.map((claim, index) => <div className="enterprise-claim" key={claim.id}>
      <label htmlFor={`claim-${claim.id}`}>{index + 1}. {claim.text}</label>
      <select id={`claim-${claim.id}`} value={answers[claim.id] ?? ''} onChange={event => { setAnswers(previous => ({ ...previous, [claim.id]: event.target.value })); setChecked(false) }}>
        <option value="">Choisis ton diagnostic…</option>
        <option value="supported">Confirmé par le document</option>
        <option value="contradicted">Contredit par le document</option>
        <option value="unverified">Non vérifiable ici</option>
      </select>
      {checked && <p className="enterprise-claim-explanation" data-correct={answers[claim.id] === claim.expected}>{answers[claim.id] === claim.expected ? '✓ Bien repéré. ' : '↻ À reprendre. '}{claim.explanation}</p>}
    </div>)}
    {checked && <p role="status">{correct} diagnostic{correct > 1 ? 's' : ''} correct{correct > 1 ? 's' : ''} sur 3. {correct === 3 ? 'Tu peux maintenant préparer une réponse fiable.' : 'Relis les explications, puis ajuste tes choix.'}</p>}
    <h3>2. Prépare une réponse au client</h3>
    <p>Respecte les règles du document et laisse de côté les affirmations sans preuve. Vérifie que chaque information de ta réponse est appuyée par une pièce du cas.</p>
    <label className="enterprise-response-draft">Ta réponse au client<textarea value={draft} onChange={event => onDraftChange(event.target.value)} rows={4} maxLength={2000} placeholder="Tu peux commencer par : « Vous pouvez retourner votre produit… »"/></label>
    <h3>3. Compare et ajuste</h3>
    <p>Affiche les explications et l’exemple pour relire ta proposition. Le retour IA est facultatif.</p>
    {practice && <EnterprisePracticeFeedback lessonId={lessonId} practice={practice} answer={answer} onVerify={onVerify}/>}
    <div className="enterprise-practice-tools"><button type="button" className="text-link" onClick={() => setChecked(previous => !previous)} aria-expanded={checked}>{checked ? 'Masquer les repères' : 'Comparer avec le document'}</button></div>
    {checked && <details className="enterprise-practice-example"><summary>Voir un exemple de réponse corrigée</summary><p>Vous pouvez retourner votre produit sous 30 jours. Les frais de retour sont pris en charge uniquement si le produit est endommagé.</p><p>Cette réponse conserve le délai et sa condition, sans reprendre la référence invérifiable. D’autres formulations conviennent aussi.</p></details>}

  </div>
}
