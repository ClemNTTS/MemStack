import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { catalogCourses } from '../data/catalog'
import { dockerCourse } from '../data/dockerCourse'
import { useProgress } from './ProgressProvider'

type LearningPreference = {
  activeCourseId: string
  setActiveCourseId: (id: string) => boolean
  dailyLessonGoal: number
  setDailyLessonGoal: (goal: number) => boolean
}

const LearningPreferenceContext = createContext<LearningPreference | null>(null)
const courseIds = new Set(catalogCourses.map(course => course.id))

function preferenceKey(uid: string) {
  return `memstack.learning-preference.v1.${uid}`
}

function loadPreference(uid: string | null) {
  if (!uid) return dockerCourse.id
  try {
    const stored = window.localStorage.getItem(preferenceKey(uid))
    return stored && courseIds.has(stored) ? stored : dockerCourse.id
  } catch {
    return dockerCourse.id
  }
}

function goalKey(uid: string) { return `memstack.learning-goal.v1.${uid}` }

function loadGoal(uid: string | null) {
  if (!uid) return 1
  try {
    const goal = Number(window.localStorage.getItem(goalKey(uid)))
    return Number.isInteger(goal) && goal >= 1 && goal <= 10 ? goal : 1
  } catch { return 1 }
}

function AccountLearningPreference({ uid, children }: { uid: string | null, children: ReactNode }) {
  const account = useProgress()
  const [activeCourseId, setCourse] = useState(() => loadPreference(uid))
  const [dailyLessonGoal, setGoal] = useState(() => loadGoal(uid))

  function setActiveCourseId(id: string): boolean {
    if (!uid || !account.ready || !account.online || !courseIds.has(id)) return false
    try {
      window.localStorage.setItem(preferenceKey(uid), id)
      setCourse(id)
      return true
    } catch {
      return false
    }
  }

  function setDailyLessonGoal(goal: number): boolean {
    if (!uid || !account.ready || !account.online || !Number.isInteger(goal) || goal < 1 || goal > 10) return false
    try {
      window.localStorage.setItem(goalKey(uid), String(goal))
      setGoal(goal)
      return true
    } catch { return false }
  }

  return <LearningPreferenceContext.Provider value={{ activeCourseId, setActiveCourseId, dailyLessonGoal, setDailyLessonGoal }}>{children}</LearningPreferenceContext.Provider>
}

export function LearningPreferenceProvider({ children }: { children: ReactNode }) {
  const { user } = useProgress()
  return <AccountLearningPreference key={user?.uid ?? 'signed-out'} uid={user?.uid ?? null}>{children}</AccountLearningPreference>
}

export function useLearningPreference() {
  const preference = useContext(LearningPreferenceContext)
  if (!preference) throw new Error('LearningPreferenceProvider manquant')
  return preference
}
