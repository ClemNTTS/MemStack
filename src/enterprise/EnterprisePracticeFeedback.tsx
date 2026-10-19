import { useEffect, useRef, useState } from 'react'
import type { EnterprisePracticeFeedback as Feedback, VerifyEnterprisePractice } from '../types/enterprise'
import type { EnterprisePractice } from './GuidedEnterprisePractice'

export default function EnterprisePracticeFeedback({ lessonId, practice, answer, onVerify }: { lessonId: string; practice: EnterprisePractice; answer: string; onVerify: VerifyEnterprisePractice }) {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const operation = useRef(0)
  const verifier = useRef(onVerify)
  verifier.current = onVerify
  useEffect(() => {
    operation.current++
    setFeedback(null); setError(''); setPending(false)
    return () => { operation.current++ }
  }, [answer, lessonId, practice, onVerify])

  async function verify() {
    if (!answer.trim() || pending) return
    const token = ++operation.current
    const verifyAnswer = onVerify
    setPending(true); setError(''); setFeedback(null)
    try {
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(practice)))
      const version = [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('')
      if (operation.current !== token || verifier.current !== verifyAnswer) return
      const result = await verifyAnswer(lessonId, answer, version)
      if (operation.current === token && verifier.current === verifyAnswer) setFeedback(result)
    } catch (cause) {
      if (operation.current !== token || verifier.current !== verifyAnswer) return
      const code = (cause as { code?: string })?.code
      setError(code === 'functions/resource-exhausted'
        ? 'Les vérifications IA disponibles aujourd’hui ont été utilisées. Tu peux consulter l’exemple ou revenir demain.'
        : code === 'functions/failed-precondition'
          ? 'Le retour IA n’est pas disponible pour cet atelier pour le moment. Tu peux consulter l’exemple ou recharger la page.'
          : 'Mémo n’a pas pu vérifier ta réponse. Elle est toujours ici : réessaie dans une minute ou consulte l’exemple.')
    } finally { if (operation.current === token && verifier.current === verifyAnswer) setPending(false) }
  }

  return <div className="enterprise-practice-ai">
    <p className="dashboard-note">En cliquant, tu envoies ta réponse et ce cas fictif à Mistral pour un retour IA. Utilise uniquement les informations de l’exercice.</p>
    <button type="button" className="catalog-button" disabled={!answer.trim() || pending} onClick={() => { void verify() }}>{pending ? 'Mémo regarde ta réponse…' : 'Vérifier ma réponse'}</button>
    {pending && <p role="status">Le retour arrive dans quelques instants.</p>}
    {error && <p role="alert" className="enterprise-feedback">{error}</p>}
    {feedback && <section className="enterprise-feedback enterprise-practice-ai-result" data-correct={feedback.status === 'good'} role="status" aria-live="polite">
      <h3>{feedback.status === 'good' ? 'Bien joué !' : feedback.status === 'almost' ? 'Tu y es presque !' : 'On reprend ensemble ?'}</h3>
      <p>{feedback.message}</p>
      {feedback.strengths.length > 0 && <ul>{feedback.strengths.map(point => <li key={point}>{point}</li>)}</ul>}
      {feedback.nextStep && <p><strong>Pour avancer : </strong>{feedback.nextStep}</p>}
      <small>Retour proposé par IA · tu peux ajuster ta réponse et réessayer.</small>
    </section>}
  </div>
}
