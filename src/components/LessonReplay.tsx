import { appHref } from '../navigation/browser'
import { useRef, useState } from 'react'
import type { Lesson } from '../types/lesson'
import type { Challenge } from '../types/challenge'
import { useProgress } from '../progress/ProgressProvider'
import LessonView from './LessonView'
import WorkshopBackground from './WorkshopBackground'
import Memo from './Memo'
import LessonText, { InlineLessonText } from './LessonText'
import { catalogCards } from '../data/catalog'

function LessonReplay({ lesson, returnChallenge }: { lesson: Lesson, returnChallenge?: Challenge }) {
  const { progress } = useProgress()
  const access = Object.hasOwn(progress.completedLessons, lesson.id) ? 'allowed' : 'locked'
  const [finished, setFinished] = useState(false)
  const [beat, setBeat] = useState(0)
  const summaryRef = useRef<HTMLDialogElement>(null)
  const takeaway = lesson.steps.find(step => step.type === 'message' && !step.nextStepId)
  return <main className="app-shell">
    <WorkshopBackground stage={finished ? 'rest' : 'lesson'} beat={beat} />
    {returnChallenge && access === 'allowed' && <aside className="challenge-replay-context" aria-label="Révision pour un défi"><p>Révision pour « {returnChallenge.title} »</p><a className="text-link" href={appHref(`/challenges/${returnChallenge.id}`)}>Revenir au défi →</a></aside>}
    {access !== 'allowed' ? <section className="learning-empty"><Memo /><h1>Cette leçon t’attend</h1><p>Découvre cette leçon dans ta session du jour avant de la relire.</p><a className="dashboard-cta" href={appHref('/courses')}>Voir les parcours →</a></section>
      : finished ? <section className="learning-empty"><Memo /><h1>Un rappel bienvenu.</h1><p>Tu as relu « {lesson.title} ».</p><a className="dashboard-cta" href={appHref(returnChallenge ? `/challenges/${returnChallenge.id}` : '/library')}>{returnChallenge ? 'Refaire l’examen →' : 'Retour à la bibliothèque ↗'}</a></section>
        : <LessonView lesson={lesson} progressLabel="Relecture · ta progression reste inchangée" onMessage={() => setBeat((value) => value + 1)} onComplete={() => setFinished(true)} completionLabel="Terminer la relecture" onShowSummary={() => summaryRef.current?.showModal()} />}
    {access === 'allowed' && <dialog className="lesson-image-dialog lesson-summary-dialog" ref={summaryRef} aria-labelledby="lesson-summary-title"><div className="lesson-image-dialog-header"><h2 id="lesson-summary-title">L’essentiel · {lesson.title}</h2><button className="sound-toggle" type="button" onClick={() => summaryRef.current?.close()}>Fermer</button></div>{takeaway?.type === 'message' && <p>{takeaway.text}</p>}<dl>{lesson.cardIds.map(id => {
      const card = catalogCards.find(card => card.id === id)!
      return <div key={id}><dt><InlineLessonText text={card.question} /></dt><dd><LessonText text={card.answer} /></dd></div>
    })}</dl><p className="dashboard-note">Cette consultation ne modifie pas tes échéances de révision.</p></dialog>}
  </main>
}

export default LessonReplay
