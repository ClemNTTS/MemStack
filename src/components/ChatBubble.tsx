import type { ReactNode } from 'react'
import Memo from './Memo'

type ChatBubbleProps = {
  children: ReactNode
  avatar?: boolean
  question?: boolean
  feedback?: boolean
}

function ChatBubble({ children, avatar = true, question = false, feedback = false }: ChatBubbleProps) {
  return (
    <div className={`chat-row${avatar ? '' : ' chat-row-continuation'}${feedback ? ' chat-row-feedback' : ''}`}>
      <div className="chat-avatar" aria-hidden="true">{avatar && <Memo expression={question ? 'unsure' : 'recalled'} />}</div>
      <div className="chat-message">
        {avatar && <span className="chat-author">Mémo <span>{question ? 'Une petite question' : 'Ton compagnon de découverte'}</span></span>}
        <div className="lesson-bubble">{children}</div>
        {question && <span className="typing-cue" aria-hidden="true"><i /><i /><i /></span>}
      </div>
    </div>
  )
}

export default ChatBubble
