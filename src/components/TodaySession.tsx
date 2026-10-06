import { appHref, currentRoute } from '../navigation/browser'
import { useEffect, useRef, useState } from 'react'
import { lessonDraftKey } from '../lesson/lessonDraft'
import type { Card, CardResult } from '../types/card'
import type { Course } from '../types/course'
import type { Lesson } from '../types/lesson'
import type { LearningProgress, ReviewKind } from '../types/progress'
import { useProgress } from '../progress/ProgressProvider'
import type { SessionCard } from '../review/dailyQueue'
import { createLearningQueue, planLearning } from '../review/catalogPlan'
import type { LearningMode } from '../review/catalogPlan'
import { scheduleReview } from '../review/schedule'
import CardSession from './CardSession'
import LessonView from './LessonView'
import Memo from './Memo'
import WorkshopBackground from './WorkshopBackground'

type TodaySessionProps = { course: Course, lessons: Lesson[], cards: Card[], mode?: LearningMode, initialAction?: 'lesson' | 'cards', onSessionRoute?: (route: string) => void }

function LearningSession({ course, lessons, cards, mode = 'today', initialAction, onSessionRoute }: TodaySessionProps) {
  const [visualBeat, setVisualBeat] = useState(0)
  const account = useProgress()
  const [initial] = useState(() => ({ progress: account.progress }))
  const [progress, setProgress] = useState(initial.progress)
  const currentProgress = useRef(initial.progress)
  const [error, setError] = useState('')
  const [lesson, setLesson] = useState<Lesson | undefined>(() => {
    if (mode !== 'today') return undefined
    const route = currentRoute()
    const params = new URLSearchParams(route.split('?')[1] ?? '')
    const lessonId = params.get('lesson')
    if (lessonId) return lessons.find(item => item.id === lessonId && course.lessonIds.includes(item.id) && !initial.progress.completedLessons[item.id])
    return params.get('start') === 'lesson' ? planLearning(course, initial.progress).lesson : undefined
  })
  const [queue, setQueue] = useState<SessionCard[] | null>(() => initialAction === 'cards' ? createLearningQueue(initial.progress, mode) : null)
  const [batch, setBatch] = useState(0)
  const [justCompletedLessonTitle, setJustCompletedLessonTitle] = useState('')
  const currentPlan = planLearning(course, progress)
  const progressLabel = `${currentPlan.completedCount} leçon${currentPlan.completedCount > 1 ? 's' : ''} sur ${course.lessonIds.length} terminée${currentPlan.completedCount > 1 ? 's' : ''}`
  const nextLessonLabel = currentPlan.nextLesson
    ? `Prochaine leçon : ${currentPlan.nextLesson.title}`
    : `Parcours « ${course.title} » terminé. Les révisions continuent.`
  const now = Date.now()
  const knownCards = cards.map((card) => progress.cards[card.id]).filter((state) => Boolean(state))
  const dueRemaining = knownCards.filter((state) => Date.parse(state.dueAt) <= now).length
  const nextDue = knownCards.filter(state => Date.parse(state.dueAt) > now).map(state => state.dueAt).sort()[0]

  function setSessionRoute(path: string) {
    window.history.replaceState(null, '', appHref(path))
    onSessionRoute?.(path)
  }

  useEffect(() => {
    if (lesson) setSessionRoute(`/today?start=lesson&lesson=${encodeURIComponent(lesson.id)}`)
  }, [lesson])

  function returnToChoice() {
    setSessionRoute(mode === 'reviews' ? '/reviews' : '/today')
    setLesson(undefined)
    setQueue(null)
  }

  function chooseLesson() {
    if (mode !== 'today') return
    const nextLesson = planLearning(course, currentProgress.current).lesson
    if (!nextLesson) return
    setJustCompletedLessonTitle('')
    setQueue(null)
    setLesson(nextLesson)
  }

  function openCards(kind: LearningMode, next = currentProgress.current) {
    const nextQueue = createLearningQueue(next, kind)
    setSessionRoute(mode === 'reviews' ? '/reviews' : '/today?start=cards')
    setLesson(undefined)
    setQueue(nextQueue.length ? nextQueue : null)
    setBatch(value => value + 1)
  }

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
      completedLessons: { ...currentProgress.current.completedLessons, [lesson.id]: currentProgress.current.completedLessons[lesson.id] ?? new Date().toISOString() },
    }
    if (persist(next)) {
      try {
        if (account.user) window.sessionStorage.removeItem(lessonDraftKey(account.user.uid, lesson.id))
      } catch {
        // Completed lessons are never resumed from the tab cache.
      }
      setJustCompletedLessonTitle(lesson.title)
      returnToChoice()
    }
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
      <WorkshopBackground stage={lesson ? 'lesson' : queue?.length ? 'cards' : 'rest'} beat={visualBeat} />
      {error && <p role="alert">{error}</p>}
      {queue === null && lesson ? (
        <LessonView key={lesson.id} draftKey={account.user ? lessonDraftKey(account.user.uid, lesson.id) : undefined} progressLabel={progressLabel} lesson={lesson} onComplete={completeLesson} onMessage={() => setVisualBeat((beat) => beat + 1)} />
      ) : queue && queue.length > 0 ? (
        <CardSession
          key={batch}
          progressLabel={`Tous les parcours · ${knownCards.length} cartes découvertes`}
          nextLessonLabel={nextLessonLabel}
          cards={queue}
          progress={progress.cards}
          onRate={rateCard}
          onContinueReviews={dueRemaining ? () => openCards('reviews') : undefined}
          onContinueLearningCards={mode === 'today' && currentPlan.pendingCardIds.length ? () => openCards('today') : undefined}
          onChooseLesson={mode === 'today' ? returnToChoice : undefined}
        />
      ) : (
        <section className="learning-empty">
          {mode === 'today' && <p className="course-progress">{course.theme} · {course.title} — {progressLabel}</p>}
          <Memo />
          <p className="lesson-category">{mode === 'reviews' ? 'Tes révisions · tous les parcours' : 'Ton espace d’apprentissage'}</p>
          <h1>{mode === 'reviews' ? 'Un petit rappel ?' : justCompletedLessonTitle ? 'Leçon terminée' : 'À ton rythme.'}</h1>
          <div className="learning-empty-copy">
            {justCompletedLessonTitle && mode === 'today' && <p role="status">« {justCompletedLessonTitle} » est terminée et ta progression est sauvegardée.</p>}
            <p>{mode === 'reviews' ? 'Des lots de cinq cartes maximum. Tu choisis de continuer ou de faire une pause.' : justCompletedLessonTitle ? 'Si tu as encore un peu de temps, consolide tes nouvelles cartes ou révise. Tu peux aussi t’arrêter ici et revenir plus tard.' : 'Une leçon conseillée, des cartes à consolider ou quelques révisions : choisis ce dont tu as envie.'}</p>
          </div>
          <div className="learning-options">
            {mode === 'today' && <article className="overview-panel">
              <p className="lesson-category">Découvrir · {course.title}</p>
              <h2>{currentPlan.nextLesson?.title ?? 'Parcours terminé'}</h2>
              {currentPlan.lesson
                ? <><p>{currentPlan.lesson.estimatedMinutes} min pour la leçon conseillée. Tu peux en découvrir plusieurs si tu le souhaites.</p><button className="catalog-button" type="button" onClick={chooseLesson}>Découvrir la leçon</button></>
                : <><p>Tu as parcouru toutes les leçons. Tes cartes restent disponibles pour réviser.</p><a href={appHref('/courses')}>Choisir un autre parcours</a></>}
            </article>}
            {mode === 'today' && <article className="overview-panel">
              <p className="lesson-category">Consolider</p>
              <h2>{currentPlan.pendingCardIds.length ? `${currentPlan.pendingCardIds.length} nouvelles cartes` : 'Tes cartes ont toutes été découvertes'}</h2>
              <p>Retrouve les cartes des leçons déjà terminées, puis jusqu’à cinq révisions dues.</p>
              {currentPlan.pendingCardIds.length > 0 && <button className="catalog-button secondary" type="button" onClick={() => openCards('today')}>Consolider mes cartes</button>}
            </article>}
            <article className="overview-panel">
              <p className="lesson-category">Réviser · tous les parcours</p>
              <h2>{dueRemaining ? `${dueRemaining} cartes dues` : 'Tes révisions sont à jour'}</h2>
              {dueRemaining
                ? <><p>Un lot de cinq cartes maximum, sans nouvelle carte. Tu pourras en lancer un autre ensuite.</p><button className="catalog-button secondary" type="button" onClick={() => openCards('reviews')}>Réviser mes cartes</button></>
                : <><p>Aucune carte n’est due pour le moment.</p>{nextDue && <p>Prochaine révision : {new Date(nextDue).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}.</p>}</>}
            </article>
          </div>
          <nav className="learning-empty-actions" aria-label="Continuer à apprendre">
            {mode === 'reviews' && <a className="primary-link" href={appHref('/today')}>Découvrir ou consolider</a>}
            <a href={appHref('/courses')}>Explorer les parcours</a>
            <a href={appHref('/library')}>Relire mes leçons</a>
          </nav>
        </section>
      )}
    </>
  )
}

function TodaySession(props: TodaySessionProps) {
  const account = useProgress()
  return <LearningSession key={`${account.user?.uid}:${account.revision}:${props.course.id}:${props.mode ?? 'today'}`} {...props} />
}

export default TodaySession
