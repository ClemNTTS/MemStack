import { appHref } from '../navigation/browser'
import { useRef, useState } from 'react'
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
  nextLessonLabel: string
  onContinueReviews?: () => void
  onContinueLearningCards?: () => void
  onChooseLesson?: () => void
  environment?: { homeHref: string; label: string }
}

const ratingLabels: Record<CardRating, string> = {
  forgotten: 'Non, je ne l’avais pas retrouvée',
  recalled: 'Oui, je l’avais retrouvée',
}

function CardSession({ cards, progress, onRate, progressLabel, nextLessonLabel, onContinueReviews, onContinueLearningCards, onChooseLesson, environment }: CardSessionProps) {
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
      <section className="card-session">
        <Memo />
        <p className="course-progress">{progressLabel}</p>
        <h1>Lot terminé</h1>
        <p role="status">Tu as travaillé {results.length} cartes. Tu peux t’arrêter ici ou continuer à ton rythme.</p>
        <ul className="card-summary">
          {results.map((result, index) => (
            <li key={result.cardId}>
              <span>{cards[index].card.question}</span>
              <strong>{ratingLabels[result.rating]}</strong>
              <span>Prochaine révision : {new Date(progress[result.cardId].dueAt).toLocaleDateString('fr-FR')}</span>
            </li>
          ))}
        </ul>
        <p>{environment ? 'Tes réponses ont été enregistrées dans cette organisation. Tes cartes reviendront aux dates indiquées ; tu peux t’arrêter ici.' : 'Ta progression est sauvegardée et sa synchronisation est suivie dans le menu Compte.'}</p>
        <p>{nextLessonLabel}</p>
        <nav className="learning-empty-actions" aria-label="Après le lot">
          {onContinueReviews && <button className="catalog-button" type="button" onClick={onContinueReviews}>Réviser encore</button>}
          {onContinueLearningCards && <button className="catalog-button secondary" type="button" onClick={onContinueLearningCards}>Reprendre mes nouvelles cartes</button>}
          {onChooseLesson
            ? <button className="catalog-button secondary" type="button" onClick={onChooseLesson}>{environment ? 'Choisir une mission' : 'Choisir la prochaine leçon'}</button>
            : <a href={appHref('/today')}>Choisir ma session</a>}
          {environment ? <a href={environment.homeHref}>Retrouver {environment.label}</a> : <><a href={appHref('/courses')}>Explorer les parcours</a>
          <a href={appHref('/library')}>Relire mes leçons</a>
          <a href={appHref('/')}>Retour à l’accueil</a></>}
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
