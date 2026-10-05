import { useRef, useState } from 'react'
import type { CardProgress, CardRating, CardResult } from '../types/card'
import type { ReviewKind } from '../types/progress'
import type { SessionCard } from '../review/dailyQueue'
import Memo from './Memo'
import FlashCard from './FlashCard'

type CardSessionProps = {
  cards: SessionCard[]
  progress: Record<string, CardProgress>
  onRate: (result: CardResult, kind: ReviewKind) => boolean
  progressLabel: string
  nextLessonLabel: string
}

const ratingLabels: Record<CardRating, string> = {
  forgotten: 'Non, je ne l’avais pas retrouvée',
  recalled: 'Oui, je l’avais retrouvée',
}

function CardSession({ cards, progress, onRate, progressLabel, nextLessonLabel }: CardSessionProps) {
  const [results, setResults] = useState<CardResult[]>([])
  const ratedIds = useRef(new Set<string>())
  const [isRevealed, setIsRevealed] = useState(false)
  const currentItem = cards[results.length]
  const currentCard = currentItem?.card

  function rateCard(rating: CardRating) {
    if (!currentCard || !isRevealed || ratedIds.current.has(currentCard.id)) return

    const result = { cardId: currentCard.id, rating, reviewedAt: new Date().toISOString() }
    if (!onRate(result, currentItem.kind)) return
    ratedIds.current.add(currentCard.id)
    setResults((previous) => [...previous, result])
    setIsRevealed(false)
  }

  if (!currentCard) {
    return (
      <section className="card-session">
        <Memo />
        <p className="course-progress">{progressLabel}</p>
        <h1>Session terminée</h1>
        <p role="status">Tu as révisé {results.length} cartes.</p>
        <ul className="card-summary">
          {results.map((result, index) => (
            <li key={result.cardId}>
              <span>{cards[index].card.question}</span>
              <strong>{ratingLabels[result.rating]}</strong>
              <span>Prochaine révision : {new Date(progress[result.cardId].dueAt).toLocaleDateString('fr-FR')}</span>
            </li>
          ))}
        </ul>
        <p>Ta progression est sauvegardée dans ce navigateur.</p>
        <p>{nextLessonLabel}</p>
        <a className="primary-link" href="/today">Voir ma session du jour</a>
        <a href="/">Retour à l’accueil</a>
      </section>
    )
  }

  return (
    <section className="card-session" aria-label="Cartes de mémorisation">
      <h1>{currentItem.kind === 'new' ? 'Nouvelles cartes' : 'Révisions du jour'}</h1>
      <p className="course-progress">{progressLabel}</p>
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
        <p id="card-instructions" className="sr-only">
          {isRevealed ? 'Avais-tu retrouvé la réponse ? À gauche : non. À droite : oui. Glisse la carte ou choisis Mémo.' : 'Clique sur la carte pour révéler la réponse.'}
        </p>
      </article>
    </section>
  )
}

export default CardSession
