import { useState } from 'react'
import type { Lesson } from '../types/lesson'
import { useProgress } from '../progress/ProgressProvider'
import LessonView from './LessonView'
import WorkshopBackground from './WorkshopBackground'
import Memo from './Memo'

function LessonReplay({ lesson }: { lesson: Lesson }) {
  const { progress } = useProgress()
  const access = Object.hasOwn(progress.completedLessons, lesson.id) ? 'allowed' : 'locked'
  const [finished, setFinished] = useState(false)
  const [beat, setBeat] = useState(0)
  return <main className="app-shell">
    <WorkshopBackground stage={finished ? 'rest' : 'lesson'} beat={beat} />
    {access !== 'allowed' ? <section><h1>Cette leçon t’attend</h1><p>Découvre cette leçon dans ta session du jour avant de la relire.</p><a href="/">Retour à l’atelier</a></section>
      : finished ? <section><Memo /><h1>Un rappel bienvenu.</h1><p>Tu as relu « {lesson.title} ».</p><a className="dashboard-cta" href="/">Retour à l’atelier ↗</a></section>
        : <LessonView lesson={lesson} progressLabel="Relecture · ta progression reste inchangée" onMessage={() => setBeat((value) => value + 1)} onComplete={() => setFinished(true)} completionLabel="Terminer la relecture" />}
  </main>
}

export default LessonReplay
