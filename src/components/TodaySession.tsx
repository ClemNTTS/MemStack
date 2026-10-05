import { useRef, useState } from 'react'
import type { Card, CardResult } from '../types/card'
import type { Lesson } from '../types/lesson'
import type { LearningProgress, ReviewKind } from '../types/progress'
import { emptyProgress, loadProgress, saveProgress } from '../progress/storage'
import { createDailyQueue } from '../review/dailyQueue'
import type { SessionCard } from '../review/dailyQueue'
import { scheduleReview } from '../review/schedule'
import CardSession from './CardSession'
import LessonView from './LessonView'
import Memo from './Memo'

type TodaySessionProps = { lesson: Lesson, cards: Card[] }

function TodaySession({ lesson, cards }: TodaySessionProps) {
  const [initial] = useState(() => {
    try { return { progress: loadProgress(), error: '' } }
    catch { return { progress: emptyProgress(), error: 'Impossible de lire la progression locale. Réessaie ou réinitialise-la pour continuer.' } }
  })
  const [progress, setProgress] = useState(initial.progress)
  const currentProgress = useRef(initial.progress)
  const [error, setError] = useState(initial.error)
  const [queue, setQueue] = useState<SessionCard[] | null>(() =>
    Object.hasOwn(initial.progress.completedLessons, lesson.id)
      ? createDailyQueue(cards, lesson.cardIds, initial.progress)
      : null,
  )
  const now = Date.now()
  const knownCards = cards.map((card) => progress.cards[card.id]).filter((state) => Boolean(state))
  const dueRemaining = knownCards.filter((state) => Date.parse(state.dueAt) <= now).length
  const nextDue = knownCards.map((state) => state.dueAt).sort()[0]

  function persist(next: LearningProgress): boolean {
    try {
      saveProgress(next)
      currentProgress.current = next
      setProgress(next)
      setError('')
      return true
    } catch {
      setError('La sauvegarde locale a échoué. Ta réponse n’a pas été validée ; réessaie lorsque le stockage est disponible.')
      return false
    }
  }

  function completeLesson() {
    const next = {
      ...currentProgress.current,
      completedLessons: { ...currentProgress.current.completedLessons, [lesson.id]: new Date().toISOString() },
    }
    if (persist(next)) setQueue(createDailyQueue(cards, lesson.cardIds, next))
  }

  function rateCard(result: CardResult, kind: ReviewKind): boolean {
    const previous = currentProgress.current
    return persist({
      ...previous,
      cards: { ...previous.cards, [result.cardId]: scheduleReview(result, previous.cards[result.cardId]) },
      history: [...previous.history, { ...result, kind }],
    })
  }

  if (initial.error && error) {
    return (
      <section>
        <h1>Progression indisponible</h1>
        <p role="alert">{error}</p>
        <button className="lesson-choice" onClick={() => window.location.reload()}>Réessayer</button>
        <button className="lesson-choice" onClick={() => {
          if (persist(emptyProgress())) setQueue(null)
        }}>Réinitialiser la progression locale</button>
      </section>
    )
  }

  return (
    <>
      {error && <p role="alert">{error}</p>}
      {queue === null ? <LessonView lesson={lesson} onComplete={completeLesson} /> : queue.length > 0 ? (
        <CardSession cards={queue} progress={progress.cards} onRate={rateCard} />
      ) : (
        <section>
          <Memo />
          <h1>{dueRemaining ? 'Session du jour terminée' : 'Tu es à jour'}</h1>
          {dueRemaining ? (
            <p>Tu as atteint tes cinq révisions du jour. Il reste {dueRemaining} cartes dues ; reviens demain pour continuer.</p>
          ) : (
            <>
              <p>La leçon est terminée et aucune carte n’est due pour le moment.</p>
              {nextDue && <p>Prochaine révision : {new Date(nextDue).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}.</p>}
            </>
          )}
          <p>De nouvelles leçons seront ajoutées au parcours.</p>
          <a href="/">Retour à l’accueil</a>
        </section>
      )}
    </>
  )
}

export default TodaySession
