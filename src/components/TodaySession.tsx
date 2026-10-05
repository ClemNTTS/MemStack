import { useRef, useState } from 'react'
import type { Card, CardResult } from '../types/card'
import type { Course } from '../types/course'
import type { Lesson } from '../types/lesson'
import type { LearningProgress, ReviewKind } from '../types/progress'
import { useProgress } from '../progress/ProgressProvider'
import { createDailyQueue } from '../review/dailyQueue'
import type { SessionCard } from '../review/dailyQueue'
import { planCourse } from '../review/coursePlan'
import { scheduleReview } from '../review/schedule'
import CardSession from './CardSession'
import LessonView from './LessonView'
import Memo from './Memo'
import WorkshopBackground from './WorkshopBackground'

type TodaySessionProps = { course: Course, lessons: Lesson[], cards: Card[] }

function TodaySession({ course, lessons, cards }: TodaySessionProps) {
  const [visualBeat, setVisualBeat] = useState(0)
  const account = useProgress()
  const [initial] = useState(() => ({ progress: account.progress }))
  const [progress, setProgress] = useState(initial.progress)
  const currentProgress = useRef(initial.progress)
  const [error, setError] = useState('')
  const [plan] = useState(() => planCourse(course, lessons, initial.progress))
  const lesson = plan.lesson
  const [queue, setQueue] = useState<SessionCard[] | null>(() =>
    lesson ? null : createDailyQueue(cards, plan.pendingCardIds, initial.progress),
  )
  const currentPlan = planCourse(course, lessons, progress)
  const progressLabel = `${currentPlan.completedCount} leçon${currentPlan.completedCount > 1 ? 's' : ''} sur ${course.lessonIds.length} terminée${currentPlan.completedCount > 1 ? 's' : ''}`
  const nextLessonLabel = currentPlan.nextLesson
    ? `${currentPlan.learnedToday ? 'Demain' : 'Prochaine leçon'} : ${currentPlan.nextLesson.title}`
    : 'Parcours Docker terminé. Les révisions continuent.'
  const now = Date.now()
  const knownCards = cards.map((card) => progress.cards[card.id]).filter((state) => Boolean(state))
  const dueRemaining = knownCards.filter((state) => Date.parse(state.dueAt) <= now).length
  const nextDue = knownCards.map((state) => state.dueAt).sort()[0]

  function persist(next: LearningProgress): boolean {
    try {
      if (!account.persist(next)) throw new Error('Save failed')
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
    if (!lesson) return
    const next = {
      ...currentProgress.current,
      completedLessons: { ...currentProgress.current.completedLessons, [lesson.id]: new Date().toISOString() },
    }
    if (persist(next)) setQueue(createDailyQueue(cards, planCourse(course, lessons, next).pendingCardIds, next))
  }

  function rateCard(result: CardResult, kind: ReviewKind): boolean {
    const previous = currentProgress.current
    return persist({
      ...previous,
      cards: { ...previous.cards, [result.cardId]: scheduleReview(result, previous.cards[result.cardId]) },
      history: [...previous.history, { ...result, kind }],
    })
  }

  return (
    <>
      <WorkshopBackground stage={queue === null ? 'lesson' : queue.length ? 'cards' : 'rest'} beat={visualBeat} />
      {error && <p role="alert">{error}</p>}
      {queue === null && lesson ? (
        <LessonView progressLabel={progressLabel} lesson={lesson} onComplete={completeLesson} onMessage={() => setVisualBeat((beat) => beat + 1)} />
      ) : queue && queue.length > 0 ? (
        <CardSession progressLabel={progressLabel} nextLessonLabel={nextLessonLabel} cards={queue} progress={progress.cards} onRate={rateCard} />
      ) : (
        <section>
          <p className="course-progress">{course.theme} · {course.title} — {progressLabel}</p>
          <Memo />
          <h1>{dueRemaining ? 'Session du jour terminée' : 'Tu es à jour'}</h1>
          {dueRemaining ? (
            <p>Tu as atteint tes cinq révisions du jour. Il reste {dueRemaining} cartes dues ; reviens demain pour continuer.</p>
          ) : (
            <>
              <p>Aucune carte n’est due pour le moment.</p>
              {nextDue && <p>Prochaine révision : {new Date(nextDue).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}.</p>}
            </>
          )}
          <p>{nextLessonLabel}</p>
          <a href="/">Retour à l’accueil</a>
        </section>
      )}
    </>
  )
}

export default TodaySession
