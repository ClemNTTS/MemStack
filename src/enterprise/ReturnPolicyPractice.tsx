import { useState } from 'react'

const claims = [
  { id: 'delay', text: 'Le client peut retourner son produit pendant 60 jours.', expected: 'contradicted', explanation: 'La politique prévoit 30 jours : le délai de 60 jours contredit le document.' },
  { id: 'fees', text: 'Les frais de retour sont pris en charge dans tous les cas.', expected: 'contradicted', explanation: 'La prise en charge est réservée aux produits endommagés. L’assistant IA a supprimé cette condition.' },
  { id: 'reference', text: 'La note RET-2026-14 confirme ces conditions.', expected: 'unverified', explanation: 'Cette note ne figure dans aucune pièce de l’exercice. Tu ne peux pas vérifier ce qu’elle dit : une référence plausible ne suffit pas.' },
]

export default function ReturnPolicyPractice() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [draft, setDraft] = useState('')
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
    <button type="button" className="catalog-button secondary" disabled={claims.some(claim => !answers[claim.id])} onClick={() => setChecked(true)}>Comparer avec le document</button>
    {checked && <p role="status">{correct} diagnostic{correct > 1 ? 's' : ''} correct{correct > 1 ? 's' : ''} sur 3. {correct === 3 ? 'Tu peux maintenant préparer une réponse fiable.' : 'Relis les explications, puis ajuste tes choix.'}</p>}
    <label className="enterprise-response-draft">À toi : propose une réponse au client qui respecte les deux règles.<textarea value={draft} onChange={event => setDraft(event.target.value)} rows={4} maxLength={2000} placeholder="Tu peux commencer par : « Vous pouvez retourner votre produit… »"/></label>
    {checked && <details className="enterprise-practice-example"><summary>Voir un exemple de réponse corrigée</summary><p>Vous pouvez retourner votre produit sous 30 jours. Les frais de retour sont pris en charge uniquement si le produit est endommagé.</p><p>Cette réponse conserve le délai et sa condition, sans reprendre la référence invérifiable. D’autres formulations conviennent aussi.</p></details>}
    <p>Tu peux ajuster tes choix autant que tu veux. Copie ton brouillon avant de quitter cette page si tu veux le garder.</p>
  </div>
}
