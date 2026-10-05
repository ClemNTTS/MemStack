import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Card, CardRating } from '../types/card'
import { getSwipeRating } from './cardGesture'

type FlashCardProps = {
  card: Card
  isRevealed: boolean
  onFlip: () => void
  onRate: (rating: CardRating) => void
}

function FlashCard({ card, isRevealed, onFlip, onRate }: FlashCardProps) {
  const start = useRef<{ x: number, y: number, pointerId: number } | null>(null)
  const suppressClick = useRef(false)
  const [offset, setOffset] = useState(0)

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0) return
    start.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }
    suppressClick.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function finishDrag(event: PointerEvent<HTMLButtonElement>) {
    const origin = start.current
    if (!origin || origin.pointerId !== event.pointerId) return
    start.current = null
    setOffset(0)
    const dx = event.clientX - origin.x
    const dy = event.clientY - origin.y
    suppressClick.current = Math.hypot(dx, dy) > 8
    const rating = getSwipeRating(dx, dy)
    if (isRevealed && rating) onRate(rating)
  }

  return (
    <button
      className="flash-card"
      type="button"
      aria-label={isRevealed ? 'Masquer la réponse' : 'Révéler la réponse'}
      aria-pressed={isRevealed}
      aria-describedby="card-instructions"
      style={{ transform: `translateX(${offset}px)` }}
      onClick={() => {
        if (!suppressClick.current) onFlip()
        suppressClick.current = false
      }}
      onPointerDown={startDrag}
      onPointerMove={(event) => {
        const origin = start.current
        if (!origin || origin.pointerId !== event.pointerId) return
        const dx = event.clientX - origin.x
        const dy = event.clientY - origin.y
        if (isRevealed && Math.abs(dx) > Math.abs(dy)) setOffset(Math.max(-80, Math.min(80, dx)))
      }}
      onPointerUp={finishDrag}
      onPointerCancel={() => {
        start.current = null
        suppressClick.current = true
        setOffset(0)
      }}
      onLostPointerCapture={() => {
        start.current = null
        setOffset(0)
      }}
      onKeyDown={(event) => {
        if (!isRevealed || event.repeat) return
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          onRate(event.key === 'ArrowLeft' ? 'forgotten' : 'recalled')
        }
      }}
    >
      <span className="flash-card-side">{isRevealed ? 'Réponse' : 'À toi de trouver'}</span>
      <span className="flash-card-content" aria-live="polite">
        {isRevealed ? card.answer : 'Retrouve la réponse, puis retourne la carte.'}
      </span>
      <span className="flash-card-action" aria-hidden="true">{isRevealed ? '\u00a0' : 'Retourner la carte'}</span>
    </button>
  )
}

export default FlashCard
