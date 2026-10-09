import { useEffect, useId, useRef, useState } from 'react'
import { submitContentReport } from '../firebase/contentReports'
import { useProgress } from '../progress/ProgressProvider'
import { contentVersion } from '../reports/contentReport'
import type { ReportContext, ReportKind } from '../reports/contentReport'
import './content-reports.css'

function ContentReportButton({ context }: { context: ReportContext }) {
  const { user, online } = useProgress()
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const privacyId = useId()
  const [kind, setKind] = useState<ReportKind>('factual')
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const reportId = useRef('')
  const activeUid = useRef(user?.uid)
  const generation = useRef(0)
  activeUid.current = user?.uid

  useEffect(() => {
    generation.current++
    dialog.current?.close()
    setComment('')
    setError('')
    setSent(false)
    setSending(false)
    reportId.current = ''
  }, [user?.uid, context.contentSnapshot])

  function open() {
    setSent(false)
    setError('')
    reportId.current = crypto.randomUUID()
    dialog.current?.showModal()
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending || !user || !online) return
    const uid = user.uid
    const operation = generation.current
    setSending(true)
    setError('')
    try {
      await submitContentReport(uid, reportId.current, {
        ...context, kind, comment, contentVersion: await contentVersion(context.contentSnapshot),
      })
      if (activeUid.current !== uid || generation.current !== operation) return
      setSent(true)
      setComment('')
    } catch {
      if (activeUid.current === uid && generation.current === operation) setError('Le signalement n’a pas pu être confirmé. Vérifie ta connexion puis réessaie.')
    } finally {
      if (activeUid.current === uid && generation.current === operation) setSending(false)
    }
  }

  return <>
    <button className="content-report-trigger" type="button" disabled={sending} onClick={open}>Signaler un problème</button>
    <dialog ref={dialog} className="content-report-dialog" aria-labelledby={titleId}>
      <div className="content-report-heading">
        <h2 id={titleId}>Un problème dans {context.targetType === 'analysis' ? 'ce retour IA' : context.targetType === 'challenge' ? 'ce défi' : context.cardId ? 'cette carte' : 'cette leçon'} ?</h2>
        <button className="sound-toggle" type="button" onClick={() => dialog.current?.close()}>Fermer</button>
      </div>
      {sent ? <div role="status"><p>Signalement enregistré. Une correction pourra être proposée après vérification.</p><button className="catalog-button" type="button" onClick={() => dialog.current?.close()}>Reprendre</button></div> : <form onSubmit={submit}>
        <label>Quel est le problème ?<select value={kind} disabled={sending} onChange={event => setKind(event.target.value as ReportKind)}>
          <option value="factual">Erreur technique</option>
          <option value="unclear">Explication ambiguë</option>
          <option value="code">Exemple de code incorrect</option>
          <option value="other">Autre problème</option>
        </select></label>
        <label>Décris ce qui pose problème<textarea required maxLength={2000} rows={5} value={comment} disabled={sending} onChange={event => setComment(event.target.value)} aria-describedby={privacyId} placeholder="Précise la phrase, la réponse ou l’exemple concerné." /></label>
        <p id={privacyId} className="content-report-note">{context.targetType ? 'Ce signalement demande une revue humaine. Il ne modifie ni ta tentative ni le verdict de l’examen. ' : 'Ton commentaire et le contenu concerné seront transmis à Mistral et pourront figurer dans une proposition de correction sur GitHub. '}N’inclus pas de données personnelles ni de secrets. Ton compte Google n’est pas transmis.</p>
        {error && <p role="alert" className="inline-error">{error}</p>}
        {!online && <p role="alert">Connexion Internet requise pour envoyer le signalement.</p>}
        <button className="catalog-button" type="submit" disabled={sending || !online || !user || !comment.trim()}>{sending ? 'Envoi…' : 'Envoyer le signalement'}</button>
      </form>}
    </dialog>
  </>
}

export default ContentReportButton
