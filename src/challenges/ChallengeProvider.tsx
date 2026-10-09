import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { readChallengeAttempts, submitChallengeAttempt } from '../firebase/challenges'
import { readChallengeAccess } from '../firebase/challengeAccess'
import { challengeAiEnabled, readChallengeAnalyses } from '../firebase/challengeAnalyses'
import { useProgress } from '../progress/ProgressProvider'
import type { ChallengeAnalysis, ChallengeAttempt } from '../types/challenge'
import { validateChallengeForm } from './attemptModel'
import { challenges } from '../data/challenges'
import { catalogCourses } from '../data/catalog'
import { getChallengeThemeProgress } from './themeAccess'

type ChallengeContextValue = {
  attempts: ChallengeAttempt[]
  analyses: Record<string, ChallengeAnalysis>
  analysesLoading: boolean
  analysesReady: boolean
  analysesError: string
  refreshAnalyses: () => void
  loading: boolean
  ready: boolean
  saving: boolean
  error: string
  retry: () => void
  submitAttempt: (challengeId: string, observations: string, actions: string) => Promise<ChallengeAttempt | null>
}

const ChallengeContext = createContext<ChallengeContextValue | null>(null)

function AccountChallenges({ uid, children }: { uid: string, children: ReactNode }) {
  const account = useProgress()
  const [attempts, setAttempts] = useState<ChallengeAttempt[]>([])
  const [analyses, setAnalyses] = useState<Record<string, ChallengeAnalysis>>({})
  const [analysesLoading, setAnalysesLoading] = useState(true)
  const [analysesReady, setAnalysesReady] = useState(false)
  const [analysesError, setAnalysesError] = useState('')
  const [analysesRevision, setAnalysesRevision] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const generation = useRef(0)
  const loaded = useRef(false)
  const inFlight = useRef(false)
  const pending = useRef<{ id: string, challengeId: string, answer: string } | null>(null)

  useEffect(() => {
    let active = true
    setAnalyses({})
    setAnalysesReady(false)
    setAnalysesLoading(true)
    setAnalysesError('')
    if (!account.ready || !account.online || loading || error) {
      setAnalysesLoading(loading || !account.ready)
      return () => { active = false }
    }
    readChallengeAnalyses(uid).then(next => {
      if (!active || !navigator.onLine) return
      setAnalyses(next)
      setAnalysesReady(true)
      setAnalysesLoading(false)
    }).catch(() => {
      if (!active) return
      setAnalysesError('Impossible de retrouver les résultats IA. Vérifie ta connexion puis réessaie.')
      setAnalysesLoading(false)
    })
    return () => { active = false }
  }, [uid, account.ready, account.online, loading, error, analysesRevision, retryCount])

  useEffect(() => {
    const operation = ++generation.current
    loaded.current = false
    inFlight.current = false
    setSaving(false)
    setAttempts([])
    setLoading(true)
    setError('')
    if (!account.ready || !account.online) return
    readChallengeAccess(uid).then(allowed => {
      if (!allowed) throw new Error('Accès IA requis')
      return readChallengeAttempts(uid)
    }).then(next => {
      if (generation.current !== operation || !navigator.onLine) return
      loaded.current = true
      setAttempts(next)
      setLoading(false)
    }).catch(() => {
      if (generation.current !== operation) return
      setError('Impossible de retrouver tes tentatives. Vérifie ta connexion puis réessaie.')
      setLoading(false)
    })
    return () => { generation.current++ }
  }, [uid, account.ready, account.online, retryCount])

  function canSave() {
    return loaded.current && account.ready && account.online && navigator.onLine && !inFlight.current
  }

  function remember(attempt: ChallengeAttempt) {
    setAttempts(previous => [attempt, ...previous.filter(entry => entry.id !== attempt.id)]
      .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt)))
  }

  async function submitAttempt(challengeId: string, observations: string, actions: string): Promise<ChallengeAttempt | null> {
    if (!challengeAiEnabled || !canSave()) return null
    const challenge = challenges.find(entry => entry.id === challengeId)
    if (!challenge || !getChallengeThemeProgress(challenge, catalogCourses, account.progress.completedLessons).unlocked) {
      setError('Termine toutes les leçons de cette thématique avant de commencer un défi.')
      return null
    }
    let answer: string
    try { answer = validateChallengeForm(challengeId, observations, actions).answer }
    catch { setError('Complète les deux champs, avec 4 000 caractères maximum au total.'); return null }
    const operation = generation.current
    inFlight.current = true
    setSaving(true)
    setError('')
    try {
      if (!pending.current || pending.current.challengeId !== challengeId || pending.current.answer !== answer) {
        pending.current = { id: crypto.randomUUID(), challengeId, answer }
      }
      const attempt = await submitChallengeAttempt(uid, pending.current.id, challengeId, observations, actions)
      if (generation.current !== operation || !navigator.onLine) return null
      remember(attempt)
      pending.current = null
      return attempt
    } catch {
      if (generation.current === operation) setError('La tentative n’a pas été confirmée. Ta réponse reste affichée ; réessaie pour la sauvegarder.')
      return null
    } finally {
      if (generation.current === operation) {
        inFlight.current = false
        setSaving(false)
      }
    }
  }

  return <ChallengeContext.Provider value={{ attempts, analyses, analysesLoading,
    analysesReady: analysesReady && account.ready && account.online && !loading && !error,
    analysesError, refreshAnalyses: () => setAnalysesRevision(value => value + 1),
    loading, ready: loaded.current && !loading && account.ready && account.online, saving, error,
    retry: () => { if (!inFlight.current && navigator.onLine) setRetryCount(value => value + 1) }, submitAttempt }}>
    {children}
  </ChallengeContext.Provider>
}

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const { user, revision } = useProgress()
  if (!user) return null
  return <AccountChallenges key={`${user.uid}-${revision}`} uid={user.uid}>{children}</AccountChallenges>
}

export function useChallenges() {
  const value = useContext(ChallengeContext)
  if (!value) throw new Error('ChallengeProvider manquant')
  return value
}
