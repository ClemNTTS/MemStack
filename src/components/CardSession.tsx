import { useState } from 'react'
import type { Card, CardProgress, CardRating, CardResult } from '../types/card'
import { scheduleReview } from '../review/schedule'
import Memo from './Memo'
import FlashCard from './FlashCard'

type CardSessionProps = {
  cards: Card[]
}

const ratingLabels: Record<CardRating, string> = {
  forgotten: 'Non, je ne l’avais pas retrouvée',
  recalled: 'Oui, je l’avais retrouvée',
}

function CardSession({ cards }: CardSessionProps) {
  const [{ results, progress }, setSession] = useState<{
    results: CardResult[]
    progress: Record<string, CardProgress>
  }>({ results: [], progress: {} })
  const [isRevealed, setIsRevealed] = useState(false)
  const currentCard = cards[results.length]

  function rateCard(rating: CardRating) {
    if (!currentCard || !isRevealed) return

    const result = { cardId: currentCard.id, rating, reviewedAt: new Date().toISOString() }
    setSession((previous) => previous.results.length === results.length ? {
      results: [...previous.results, result],
      progress: {
        ...previous.progress,
        [currentCard.id]: scheduleReview(result, previous.progress[currentCard.id]),
      },
    } : previous)
    setIsRevealed(false)
  }

  if (!currentCard) {
    return (
      <section className="card-session">
        <Memo />
        <h1>Session terminée</h1>
        <p role="status">Tu as révisé {results.length} cartes.</p>
        <ul className="card-summary">
          {results.map((result, index) => (
            <li key={result.cardId}>
              <span>{cards[index].question}</span>
              <strong>{ratingLabels[result.rating]}</strong>
              <span>Prochaine révision : {new Date(progress[result.cardId].dueAt).toLocaleDateString('fr-FR')}</span>
            </li>
          ))}
        </ul>
        <p>Ta progression reste en mémoire et sera perdue si tu recharges la page.</p>
        <a href="/">Retour à l’accueil</a>
      </section>
    )
  }

  return (
    <section className="card-session" aria-label="Cartes de mémorisation">
      <h1>Nouvelles cartes</h1>
      <p>Carte {results.length + 1} sur {cards.length}</p>
      <article className="card-stage" key={currentCard.id}>
        <h2 className="card-question">{currentCard.question}</h2>
        <div className="card-deck">
          <button className="memo-rating" type="button" disabled={!isRevealed} aria-label={ratingLabels.forgotten} title={ratingLabels.forgotten} onClick={() => rateCard('forgotten')}>
            <Memo expression="forgotten" />
            <span aria-hidden="true">← ×</span>
          </button>
          <FlashCard card={currentCard} isRevealed={isRevealed} onFlip={() => setIsRevealed((previous) => !previous)} onRate={rateCard} />
          <button className="memo-rating" type="button" disabled={!isRevealed} aria-label={ratingLabels.recalled} title={ratingLabels.recalled} onClick={() => rateCard('recalled')}>
            <Memo expression="recalled" />
            <span aria-hidden="true">✓ →</span>
          </button>
        </div>
        <p id="card-instructions" className="card-instructions">
          {isRevealed ? 'Avais-tu retrouvé la réponse ? À gauche : non. À droite : oui. Glisse la carte ou choisis Mémo.' : 'Clique sur la carte pour révéler la réponse.'}
        </p>
        <p className="card-legend">Une réponse sans l’idée essentielle compte comme non ; une réponse retrouvée après réflexion compte comme oui.</p>
      </article>
    </section>
  )
}

export default CardSession
