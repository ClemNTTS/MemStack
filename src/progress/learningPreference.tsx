import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { catalogCourses } from '../data/catalog'
import { dockerCourse } from '../data/dockerCourse'
import { bootstrapCloudPreferences, updateCloudPreferences } from '../firebase/preferences'
import type { LearningPreferences } from './preferenceModel'
import { useProgress } from './ProgressProvider'

type LearningPreference = LearningPreferences & {
  setActiveCourseId: (id: string) => Promise<boolean>
  setDailyLessonGoal: (goal: number) => Promise<boolean>
  saving: boolean
  error: string
}

const LearningPreferenceContext = createContext<LearningPreference | null>(null)
const courseIds = new Set(catalogCourses.map(course => course.id))

function preferenceKey(uid: string) { return `memstack.learning-preference.v1.${uid}` }
function goalKey(uid: string) { return `memstack.learning-goal.v1.${uid}` }

function loadLocalPreferences(uid: string): LearningPreferences {
  let activeCourseId = dockerCourse.id
  let dailyLessonGoal = 1
  try {
    const stored = window.localStorage.getItem(preferenceKey(uid))
    if (stored && courseIds.has(stored)) activeCourseId = stored
    const goal = Number(window.localStorage.getItem(goalKey(uid)))
    if (Number.isInteger(goal) && goal >= 1 && goal <= 10) dailyLessonGoal = goal
  } catch { /* Cloud preferences remain available when browser storage is denied. */ }
  return { activeCourseId, dailyLessonGoal }
}

function cachePreferences(uid: string, preferences: LearningPreferences) {
  try {
    window.localStorage.setItem(preferenceKey(uid), preferences.activeCourseId)
    window.localStorage.setItem(goalKey(uid), String(preferences.dailyLessonGoal))
  } catch { /* The acknowledged cloud write is authoritative. */ }
}

function AccountLearningPreference({ uid, children }: { uid: string, children: ReactNode }) {
  const account = useProgress()
  const [preferences, setPreferences] = useState<LearningPreferences | null>(null)
  const [loadingError, setLoadingError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const generation = useRef(0)
  const inFlight = useRef(false)

  useEffect(() => {
    const operation = ++generation.current
    setPreferences(null)
    setLoadingError('')
    if (!account.ready || !account.online) return
    bootstrapCloudPreferences(uid, loadLocalPreferences(uid)).then(next => {
      if (generation.current !== operation || !navigator.onLine) return
      cachePreferences(uid, next)
      setPreferences(next)
    }).catch(() => {
      if (generation.current !== operation) return
      setLoadingError('Impossible de charger tes préférences. Vérifie ta connexion puis réessaie.')
    })
    return () => { generation.current++ }
  }, [uid, account.ready, account.online, retryCount])

  async function save(patch: Partial<LearningPreferences>): Promise<boolean> {
    if (!preferences || !account.ready || !account.online || !navigator.onLine || inFlight.current) return false
    const operation = generation.current
    inFlight.current = true
    setSaving(true)
    setError('')
    try {
      const next = await updateCloudPreferences(uid, patch)
      if (generation.current !== operation || !navigator.onLine) return false
      cachePreferences(uid, next)
      setPreferences(next)
      return true
    } catch {
      if (generation.current === operation) setError('La sauvegarde a échoué. Ton choix précédent est conservé. Vérifie ta connexion puis réessaie.')
      return false
    } finally {
      if (generation.current === operation) {
        inFlight.current = false
        setSaving(false)
      }
    }
  }

  function setActiveCourseId(id: string) {
    return courseIds.has(id) ? save({ activeCourseId: id }) : Promise.resolve(false)
  }

  function setDailyLessonGoal(goal: number) {
    return Number.isInteger(goal) && goal >= 1 && goal <= 10 ? save({ dailyLessonGoal: goal }) : Promise.resolve(false)
  }

  if (!preferences) return <main className="app-shell"><section className="overview-panel">
    <h1>Ton atelier avec Mémo</h1>
    {loadingError ? <><p role="alert">{loadingError}</p><button className="catalog-button" type="button" onClick={() => setRetryCount(value => value + 1)}>Réessayer</button></> : <p role="status">Mémo retrouve ton parcours et ton rythme…</p>}
    {loadingError && <button className="catalog-button secondary" type="button" onClick={() => { void account.logout() }}>Changer de compte</button>}
  </section></main>

  return <LearningPreferenceContext.Provider value={{ ...preferences, setActiveCourseId, setDailyLessonGoal, saving, error }}>{children}</LearningPreferenceContext.Provider>
}

export function LearningPreferenceProvider({ children }: { children: ReactNode }) {
  const { user, revision } = useProgress()
  if (!user) return null
  return <AccountLearningPreference key={`${user.uid}-${revision}`} uid={user.uid}>{children}</AccountLearningPreference>
}

export function useLearningPreference() {
  const preference = useContext(LearningPreferenceContext)
  if (!preference) throw new Error('LearningPreferenceProvider manquant')
  return preference
}
