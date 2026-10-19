import { useState } from 'react'
import EnterprisePracticeFeedback from './EnterprisePracticeFeedback'
import { enterprisePractices } from './GuidedEnterprisePractice'
import type { VerifyEnterprisePractice } from '../types/enterprise'

const claims = [
  { id: 'delay', text: 'Le client peut retourner son produit pendant 60 jours.', expected: 'contradicted', explanation: 'La politique prévoit 30 jours : le délai de 60 jours contredit le document.' },
  { id: 'fees', text: 'Les frais de retour sont pris en charge dans tous les cas.', expected: 'contradicted', explanation: 'La prise en charge est réservée aux produits endommagés. L’assistant IA a supprimé cette condition.' },
  { id: 'reference', text: 'La note RET-2026-14 confirme ces conditions.', expected: 'unverified', explanation: 'Cette note ne figure dans aucune pièce de l’exercice. Tu ne peux pas vérifier ce qu’elle dit : une référence plausible ne suffit pas.' },
]

export default function ReturnPolicyPractice({ lessonId, draft, onDraftChange, onVerify }: { lessonId: string; draft: string; onDraftChange: (draft: string) => void; onVerify: VerifyEnterprisePractice }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const practice = enterprisePractices[lessonId]
  const labels: Record<string, string> = { supported: 'Confirmé par le document', contradicted: 'Contredit par le document', unverified: 'Non vérifiable ici' }
  const answer = draft.trim() ? `${claims.map(claim => `${claim.text} — ${labels[answers[claim.id]] ?? 'Pas encore choisi'}`).join('\n')}\n\nMa réponse au client : ${draft}` : ''
  const correct = claims.filter(claim => answers[claim.id] === claim.expected).length

  return <div className="enterprise-practice enterprise-claim-practice">
    <h2>Que peux-tu réellement affirmer au client ?</h2>
    <p>Compare chaque affirmation au document affiché plus haut. L’objectif : repérer ce qui est faux et ce qui manque de preuve.</p>
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
    <label className="enterprise-response-draft">À toi : propose une réponse au client qui respecte les deux règles.<textarea value={draft} onChange={event => onDraftChange(event.target.value)} rows={4} maxLength={2000} placeholder="Tu peux commencer par : « Vous pouvez retourner votre produit… »"/></label>
    {practice && <EnterprisePracticeFeedback lessonId={lessonId} practice={practice} answer={answer} onVerify={onVerify}/>}
    <div className="enterprise-practice-tools"><button type="button" className="text-link" onClick={() => setChecked(previous => !previous)} aria-expanded={checked}>{checked ? 'Masquer les repères' : 'Comparer avec le document'}</button></div>
    {checked && <details className="enterprise-practice-example"><summary>Voir un exemple de réponse corrigée</summary><p>Vous pouvez retourner votre produit sous 30 jours. Les frais de retour sont pris en charge uniquement si le produit est endommagé.</p><p>Cette réponse conserve le délai et sa condition, sans reprendre la référence invérifiable. D’autres formulations conviennent aussi.</p></details>}

  </div>
}
