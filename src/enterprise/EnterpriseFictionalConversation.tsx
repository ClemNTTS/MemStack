import { useEffect, useRef, useState } from 'react'
import { FileText, MessageCircle, X } from 'lucide-react'
import { firstLessonConversation } from './fictionalConversation'
import './enterprise-fictional-conversation.css'

type Props = { stepId: string; checkedIds: readonly string[]; disabled?: boolean }

export default function EnterpriseFictionalConversation({ stepId, checkedIds, disabled = false }: Props) {
  const conversation = firstLessonConversation(stepId, checkedIds)
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const latestMessage = useRef<HTMLLIElement>(null)
  const previousStage = useRef(conversation.stage)
  const autoOpened = useRef(new Set<number>())

  useEffect(() => {
    const previous = previousStage.current
    previousStage.current = conversation.stage
    if (conversation.stage < previous) autoOpened.current.clear()
    if (!disabled && conversation.stage > previous && (conversation.stage === 2 || conversation.stage === 3) && !autoOpened.current.has(conversation.stage)) {
      autoOpened.current.add(conversation.stage)
      setOpen(true)
    }
  }, [conversation.stage, disabled])

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) {
      element.showModal()
      closeButton.current?.focus({ preventScroll: true })
      latestMessage.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    } else if (!open && element.open) element.close()
  }, [open, conversation.stage])

  function close() {
    setOpen(false)
  }

  return <div className="enterprise-fictional-conversation">
    <button ref={trigger} type="button" className="fictional-conversation-trigger" disabled={disabled} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} aria-controls="fictional-conversation-dialog">
      <MessageCircle size={18} aria-hidden="true" />
      <span>Voir la conversation <small>{conversation.label}</small></span>
    </button>
    <dialog ref={dialog} id="fictional-conversation-dialog" className="fictional-conversation-dialog" aria-labelledby="fictional-conversation-title" aria-describedby="fictional-conversation-description" onCancel={event => { event.preventDefault(); close() }} onClose={() => { setOpen(false); trigger.current?.focus({ preventScroll: true }) }}>
      <header className="fictional-conversation-heading">
        <div><p>Le cas de ta collègue Léa</p><h2 id="fictional-conversation-title">Léa et son assistant IA</h2></div>
        <button ref={closeButton} className="fictional-conversation-close" type="button" aria-label="Fermer la conversation et revenir à la leçon" onClick={close}><X size={20} aria-hidden="true" /></button>
      </header>
      <p id="fictional-conversation-description" className="fictional-conversation-description">Conversation fictive · elle évolue avec la leçon. Aucun outil réel n’est connecté.</p>
      <div className="fictional-conversation-scroll">
        {conversation.messages.length ? <ol className="fictional-conversation-messages" aria-label="Échanges fictifs de Léa avec son assistant IA">{conversation.messages.map((message, index) => <li key={message.id} data-speaker={message.speaker === 'Léa' ? 'learner' : 'assistant'} ref={index === conversation.messages.length - 1 ? latestMessage : undefined}>
          <span className="fictional-conversation-speaker">{message.speaker}</span>
          <p>{message.text}</p>
          {message.document && <aside className="fictional-conversation-document" aria-label="Document fictif partagé par Léa"><strong><FileText size={16} aria-hidden="true" />{message.document.title}</strong><p>{message.document.text}</p></aside>}
        </li>)}</ol> : <p className="fictional-conversation-empty">Léa va bientôt écrire son premier prompt. Ses échanges avec l’assistant IA apparaîtront ici au fil de tes choix.</p>}
        {conversation.handoff && <aside className="fictional-conversation-handoff"><strong>Le brouillon est prêt. L’envoi reste à faire.</strong><p>Léa ouvre sa boîte mail, vérifie le texte et les destinataires, puis peut envoyer elle-même. L’assistant IA de cet exemple n’a pas accès à sa boîte mail.</p></aside>}
      </div>
      <footer className="fictional-conversation-footer"><span>Simulation pédagogique · aucun mail envoyé</span><button className="catalog-button" type="button" onClick={close}>Revenir à la leçon</button></footer>
    </dialog>
  </div>
}
