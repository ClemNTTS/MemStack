import { appHref } from '../navigation/browser'
import { useEffect, useRef, useState } from 'react'
import type { CardProgress, CardRating, CardResult } from '../types/card'
import type { ReviewKind } from '../types/progress'
import type { SessionCard } from '../review/dailyQueue'
import Memo from './Memo'
import FlashCard from './FlashCard'
import { catalogLessons } from '../data/catalog'
import { cardReportContext } from '../reports/contentReport'
import ContentReportButton from './ContentReportButton'
import './cardSessionGuidance.css'

type CardSessionProps = {
  cards: SessionCard[]
  progress: Record<string, CardProgress>
  onRate: (result: CardResult, kind: ReviewKind) => boolean | Promise<boolean>
  progressLabel: string
  onContinueReviews?: () => void
  onContinueLearningCards?: () => void
  environment?: { homeHref: string; label: string }
}

const ratingLabels: Record<CardRating, string> = {
  forgotten: 'Non, je ne l’avais pas retrouvée',
  recalled: 'Oui, je l’avais retrouvée',
}

function CardSession({ cards, progress, onRate, progressLabel, onContinueReviews, onContinueLearningCards, environment }: CardSessionProps) {
  const [results, setResults] = useState<CardResult[]>([])
  const ratedIds = useRef(new Set<string>())
  const [isRevealed, setIsRevealed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pendingRating, setPendingRating] = useState<CardRating | null>(null)
  const [saveFailed, setSaveFailed] = useState(false)
  const [guideOpen, setGuideOpen] = useState(() => Object.keys(progress).length === 0)
  const savingRef = useRef(false)
  const currentItem = cards[results.length]
  const currentCard = currentItem?.card
  const completeTitle = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!currentCard && results.length > 0) completeTitle.current?.focus()
  }, [currentCard, results.length])

  async function rateCard(rating: CardRating) {
    if (!currentCard || !isRevealed || savingRef.current || ratedIds.current.has(currentCard.id)) return false

    const result = { cardId: currentCard.id, rating, reviewedAt: new Date().toISOString() }
    savingRef.current = true
    setSaving(true)
    setPendingRating(rating)
    setSaveFailed(false)
    let saved = false
    try {
      saved = await onRate(result, currentItem.kind)
      if (!saved) { setSaveFailed(true); return false }
      ratedIds.current.add(currentCard.id)
      setResults((previous) => [...previous, result])
      setIsRevealed(false)
      setGuideOpen(false)
      return true
    } catch {
      setSaveFailed(true)
      return false
    } finally {
      savingRef.current = false
      setSaving(false)
      setPendingRating(null)
    }
  }

  if (!currentCard) {
    return (
      <section className="card-session card-session-complete" aria-labelledby="card-complete-title">
        <Memo />
        <p className="lesson-category">{environment ? 'Dans ton organisation' : 'Ton apprentissage'}</p>
        <h1 id="card-complete-title" ref={completeTitle} tabIndex={-1}>Une pause bien méritée.</h1>
        <p role="status">{results.length} carte{results.length > 1 ? 's' : ''} travaillée{results.length > 1 ? 's' : ''}, c’est enregistré.</p>
        <p className="card-complete-note">Tes prochains rappels sont programmés. À ton rythme pour la suite.</p>
        <nav className="card-complete-actions" aria-label="Après les cartes">
          <a className="catalog-button" href={environment?.homeHref ?? appHref('/')}>{environment ? 'Retrouver mon parcours' : 'Retour à l’accueil'}</a>
          {onContinueReviews
            ? <button className="catalog-button secondary" type="button" onClick={onContinueReviews}>Réviser encore</button>
            : onContinueLearningCards && <button className="catalog-button secondary" type="button" onClick={onContinueLearningCards}>Continuer mes cartes</button>}
        </nav>
      </section>
    )
  }

  return (
    <section className="card-session" aria-label="Cartes de mémorisation">
      <header className="card-session-heading">
        <h1>{currentItem.kind === 'new' ? 'Nouvelles cartes' : 'Révisions du jour'}</h1>
        <p className="course-progress">{progressLabel}</p>
        <p className="card-session-count">Carte {results.length + 1} sur {cards.length}</p>
      </header>
      <div className="card-session-workspace">
        <details className="card-session-guide" open={guideOpen} onToggle={event => setGuideOpen(event.currentTarget.open)}>
          <summary>Comment utiliser les cartes ?</summary>
          <ol>
            <li>Cherche la réponse de tête, sans l’écrire.</li>
            <li>Révèle, puis compare avec ta réponse de tête.</li>
            <li>Choisis <strong>Oui</strong> si tu avais retrouvé l’essentiel, sinon <strong>Non</strong>, même si tu reconnais la réponse.</li>
          </ol>
          <p>Ton choix programme ton prochain rappel.</p>
        </details>
        <article className="card-stage" key={currentCard.id}>
          <h2 className="card-question">{currentCard.question}</h2>
          <p id="card-instructions" className="card-session-instruction">{isRevealed ? 'Avais-tu retrouvé l’idée essentielle avant de lire la réponse ? Choisis Non ou Oui.' : 'Cherche la réponse de tête, puis clique sur la carte pour la révéler.'}</p>
          <div className="card-deck">
            <button className="memo-rating" type="button" data-selected={pendingRating === 'forgotten'} disabled={!isRevealed || saving} aria-label={ratingLabels.forgotten} title={ratingLabels.forgotten} onClick={() => { void rateCard('forgotten') }}>
              <Memo expression="forgotten" />
              <span aria-hidden="true" className="rating-symbol">← ×</span>
              <span className="card-rating-label" aria-hidden="true">Non</span>
            </button>
            <FlashCard card={currentCard} isRevealed={isRevealed} isSaving={saving} pendingRating={pendingRating} onFlip={() => setIsRevealed((previous) => !previous)} onRate={rateCard} />
            <button className="memo-rating" type="button" data-selected={pendingRating === 'recalled'} disabled={!isRevealed || saving} aria-label={ratingLabels.recalled} title={ratingLabels.recalled} onClick={() => { void rateCard('recalled') }}>
              <Memo expression="recalled" />
              <span aria-hidden="true" className="rating-symbol">✓ →</span>
              <span className="card-rating-label" aria-hidden="true">Oui</span>
            </button>
          </div>
          <p className="card-save-status" role="status">{saving ? 'Enregistrement de ta réponse…' : saveFailed ? 'Enregistrement impossible. Ta carte reste ici ; tu peux réessayer.' : '\u00a0'}</p>
          {!environment && <ContentReportButton context={cardReportContext(currentCard, catalogLessons)} />}
        </article>
      </div>
    </section>
  )
}

export default CardSession
