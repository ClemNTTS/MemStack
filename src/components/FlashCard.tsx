import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import type { Card, CardRating } from '../types/card'
import { getSwipeRating } from './cardGesture'
import './flashCardMotion.css'

type FlashCardProps = {
  card: Card
  isRevealed: boolean
  onFlip: () => void
  onRate: (rating: CardRating) => boolean | Promise<boolean>
  isSaving?: boolean
  pendingRating?: CardRating | null
}

function FlashCard({ card, isRevealed, onFlip, onRate, isSaving = false, pendingRating = null }: FlashCardProps) {
  const start = useRef<{ x: number, y: number, pointerId: number } | null>(null)
  const suppressClick = useRef(false)
  const swipePending = useRef(false)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const direction = Math.abs(offset) > 14 ? (offset < 0 ? 'forgotten' : 'recalled') : undefined

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (isSaving || swipePending.current || !event.isPrimary || event.button !== 0) return
    start.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }
    suppressClick.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  async function finishDrag(event: PointerEvent<HTMLButtonElement>) {
    const origin = start.current
    if (!origin || origin.pointerId !== event.pointerId) return
    start.current = null
    setIsDragging(false)
    const dx = event.clientX - origin.x
    const dy = event.clientY - origin.y
    suppressClick.current = Math.hypot(dx, dy) > 8
    const rating = getSwipeRating(dx, dy)
    if (!isRevealed || !rating || isSaving || swipePending.current) {
      setOffset(0)
      return
    }
    // Keep the release pose until confirmation; a failed save springs back.
    setOffset(Math.max(-120, Math.min(120, dx * 0.8)))
    swipePending.current = true
    try {
      if (!await onRate(rating)) setOffset(0)
    } catch {
      setOffset(0)
    } finally {
      swipePending.current = false
    }
  }

  return (
    <button
      className={`flash-card${isDragging ? ' flash-card--dragging' : ''}${isSaving ? ' flash-card--saving' : ''}`}
      type="button"
      aria-label={isRevealed ? 'Masquer la réponse' : 'Révéler la réponse'}
      aria-pressed={isRevealed}
      aria-describedby="card-instructions"
      aria-disabled={isSaving}
      data-direction={pendingRating ?? direction}
      style={{ '--card-drag-x': `${offset}px`, '--card-drag-angle': `${offset / 22}deg`, '--card-drag-lift': `${-Math.abs(offset) / 18}px`, '--card-intent-opacity': Math.min(1, Math.abs(offset) / 60) } as CSSProperties}
      onClick={() => {
        if (!suppressClick.current && !isSaving) onFlip()
        suppressClick.current = false
      }}
      onPointerDown={startDrag}
      onPointerMove={(event) => {
        const origin = start.current
        if (!origin || origin.pointerId !== event.pointerId) return
        const dx = event.clientX - origin.x
        const dy = event.clientY - origin.y
        if (isRevealed && !isSaving && Math.abs(dx) > Math.abs(dy)) {
          setIsDragging(true)
          setOffset(Math.max(-120, Math.min(120, dx * 0.8)))
        }
      }}
      onPointerUp={finishDrag}
      onPointerCancel={() => {
        start.current = null
        setIsDragging(false)
        suppressClick.current = true
        setOffset(0)
      }}
      onLostPointerCapture={() => {
        // Normal pointerup releases capture too; finishDrag owns that pose.
        if (!start.current) return
        start.current = null
        setIsDragging(false)
        setOffset(0)
      }}
      onKeyDown={(event) => {
        if (!isRevealed || isSaving || event.repeat) return
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          onRate(event.key === 'ArrowLeft' ? 'forgotten' : 'recalled')
        }
      }}
    >
      <span className="flash-card-inner">
        <span className="flash-card-face flash-card-front" aria-hidden={isRevealed}>
          <span className="flash-card-side">À toi de trouver</span>
          <span className="flash-card-content">Cherche la réponse de tête, sans l’écrire.</span>
          <span className="flash-card-action">Révéler la réponse</span>
        </span>
        <span className="flash-card-face flash-card-back" aria-hidden={!isRevealed}>
          <span className="flash-card-side">Réponse</span>
          <span className="flash-card-content">{card.answer}</span>
          <span className="flash-card-action" aria-hidden="true">{'\u00a0'}</span>
        </span>
      </span>
      <span className="flash-card-intent" aria-hidden="true">{(pendingRating ?? direction) === 'forgotten' ? '← À retrouver' : 'Retrouvée ✓'}</span>
      <span className="sr-only" aria-live="polite">{isRevealed ? card.answer : ''}</span>
    </button>
  )
}

export default FlashCard
