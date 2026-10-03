import { useState } from 'react'
import type { Card } from '../types/card'
import type { Lesson } from '../types/lesson'
import CardSession from './CardSession'
import LessonView from './LessonView'

type TodaySessionProps = {
  lesson: Lesson
  cards: Card[]
}

function TodaySession({ lesson, cards }: TodaySessionProps) {
  const [isLessonComplete, setIsLessonComplete] = useState(false)
  const lessonCards = lesson.cardIds.map((id) => {
    const card = cards.find((candidate) => candidate.id === id)
    if (!card) throw new Error(`Carte introuvable : ${id}`)
    return card
  })

  return isLessonComplete
    ? <CardSession cards={lessonCards} />
    : <LessonView lesson={lesson} onComplete={() => setIsLessonComplete(true)} />
}

export default TodaySession
