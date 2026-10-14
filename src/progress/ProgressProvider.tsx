import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { getFirebaseServices } from '../firebase/client'
import { readCloudProgress, writeCloudProgress, importProgressOnServer } from '../firebase/progress'
import type { LearningProgress } from '../types/progress'
import { decodeProgress, emptyProgress, loadProgress } from './storage'
import { accountProgressKey, mergeProgress, reviewEventId } from './merge'
import { saveLearningAction } from '../firebase/learningActions'
import type { LearningAction } from '../firebase/learningActions'
import type { CardRating } from '../types/card'

type ProgressContextValue = {
  user: User | null
  progress: LearningProgress
  status: string
  error: string
  ready: boolean
  online: boolean
  authResolved: boolean
  revision: number
  persist: (next: LearningProgress) => boolean
  completeLesson: (lessonId: string) => Promise<LearningProgress>
  reviewCard: (cardId: string, rating: CardRating, requestId: string) => Promise<LearningProgress>
  login: () => Promise<void>
  logout: () => Promise<void>
  retry: () => void
  importLocal: () => void
}
export const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [progress, setProgress] = useState(emptyProgress)
  const [ready, setReady] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [authResolved, setAuthResolved] = useState(false)
  const [revision, setRevision] = useState(0)
  const [status, setStatus] = useState('Chargement…')
  const [error, setError] = useState('')
  const current = useRef({ uid: null as string | null, progress: emptyProgress(), generation: 0, ready: false })
  const work = useRef(Promise.resolve())
  const [retryCount, setRetryCount] = useState(0)

  async function commit(action: LearningAction) {
    const { uid, generation } = current.current
    if (!uid || !current.current.ready || !navigator.onLine) throw new Error('Connexion requise.')
    const result = await saveLearningAction(uid,action)
    if (current.current.generation !== generation || current.current.uid !== uid) throw new Error('Compte modifié.')
    const previous = current.current.progress
    const next: LearningProgress = result.type === 'lesson'
      ? { ...previous,completedLessons:{ ...previous.completedLessons,[result.lessonId]:result.completedAt } }
      : mergeProgress(previous,{ version:1,completedLessons:{},cards:{ [result.card.cardId]:result.card },history:[result.event] })
    current.current.progress = next
    setProgress(next)
    try { window.localStorage.setItem(accountProgressKey(uid),JSON.stringify(next)) } catch { /* The server acknowledgement remains authoritative. */ }
    setStatus('Progression synchronisée')
    return next
  }

  function synchronize() {
    const { uid, generation } = current.current
    if (!uid || !navigator.onLine) return
    setStatus('Synchronisation…')
    work.current = work.current.catch(() => {}).then(async () => {
      if (current.current.generation !== generation || !current.current.ready) return
      const snapshot = current.current.progress
      try {
        await writeCloudProgress(uid, snapshot)
        if (current.current.generation !== generation) return
        setStatus(snapshot === current.current.progress ? 'Progression synchronisée' : 'Synchronisation…')
        setError('')
      } catch {
        if (current.current.generation !== generation) return
        current.current.ready = false
        setReady(false)
        setStatus('Sauvegardée sur cet appareil · synchronisation en attente')
        setError('La synchronisation a échoué. Tes réponses restent sauvegardées sur cet appareil. Vérifie ta connexion puis réessaie.')
      }
    })
  }

  useEffect(() => {
    let disposed = false
    const { auth } = getFirebaseServices()
    const unsubscribe = onAuthStateChanged(auth, async (account) => {
      const generation = ++current.current.generation
      current.current.ready = false
      current.current.uid = account?.uid ?? null
      setReady(false)
      setUser(account)
      setAuthResolved(true)
      setError('')
      setStatus('Chargement…')
      if (!account) {
        current.current.progress = emptyProgress()
        setProgress(emptyProgress())
        setStatus('Connexion requise')
        return
      }
      if (!account.emailVerified) {
        current.current.progress = emptyProgress()
        setProgress(emptyProgress())
        setStatus('Adresse email à vérifier')
        return
      }
      if (!navigator.onLine) {
        setStatus('Connexion Internet requise')
        return
      }
      try {
        // Let any interrupted write finish before reconciling with the server.
        await work.current.catch(() => {})
        if (disposed || current.current.generation !== generation) return
        const local = decodeProgress(window.localStorage.getItem(accountProgressKey(account.uid)))
        const cloud = await readCloudProgress(account.uid)
        const serverLearning = import.meta.env.VITE_SERVER_LEARNING_ENABLED === 'true'
        const next = serverLearning ? cloud : mergeProgress(cloud, local)
        const known = new Set(cloud.history.map(reviewEventId))
        const pending = Object.keys(local.completedLessons).some(id => !Object.hasOwn(cloud.completedLessons,id))
          || Object.values(local.cards).some(card => !cloud.cards[card.cardId] || Date.parse(card.lastReviewedAt) > Date.parse(cloud.cards[card.cardId].lastReviewedAt))
          || local.history.some(event => !known.has(reviewEventId(event)))
        if (serverLearning && pending) window.localStorage.setItem(`${accountProgressKey(account.uid)}.pending-import`,JSON.stringify(local))
        if (disposed || current.current.generation !== generation || !navigator.onLine) return
        if (!serverLearning) await writeCloudProgress(account.uid, next)
        if (disposed || current.current.generation !== generation || !navigator.onLine) return
        window.localStorage.setItem(accountProgressKey(account.uid), JSON.stringify(next))
        current.current.progress = next
        current.current.ready = true
        setProgress(next)
        setRevision((value) => value + 1)
        setReady(true)
        setStatus('Progression synchronisée')
      } catch {
        if (disposed || current.current.generation !== generation) return
        setError('Impossible de charger la progression. Aucune donnée n’a été remplacée. Vérifie ta connexion ou ton stockage puis réessaie.')
        setStatus('Progression indisponible')
      }
    })
    return () => { disposed = true; current.current.generation++; unsubscribe() }
  }, [retryCount])

  useEffect(() => {
    const disconnect = () => {
      current.current.generation++
      current.current.ready = false
      setReady(false)
      setOnline(false)
      setStatus('Connexion Internet requise')
    }
    const reconnect = () => {
      setOnline(true)
      setRetryCount((value) => value + 1)
    }
    window.addEventListener('offline', disconnect)
    window.addEventListener('online', reconnect)
    return () => {
      window.removeEventListener('offline', disconnect)
      window.removeEventListener('online', reconnect)
    }
  }, [])

  function persist(next: LearningProgress): boolean {
    const uid = current.current.uid
    if (!current.current.ready || !uid || !navigator.onLine) return false
    try {
      window.localStorage.setItem(accountProgressKey(uid), JSON.stringify(next))
      current.current.progress = next
      setProgress(next)
      synchronize()
      return true
    } catch {
      setError('La sauvegarde sur cet appareil a échoué. Ta réponse n’a pas été validée.')
      return false
    }
  }

  async function login() {
    if (!navigator.onLine) return
    let timeout: ReturnType<typeof setTimeout> | undefined
    try {
      setError('')
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await Promise.race([
        signInWithPopup(getFirebaseServices().auth, provider),
        new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('Sign-in timeout')), 90000) }),
      ])
    } catch {
      setError('Connexion Google interrompue ou indisponible. Autorise la fenêtre de connexion et réessaie.')
    } finally { clearTimeout(timeout) }
  }
  async function logout() {
    try { await signOut(getFirebaseServices().auth) }
    catch { setError('La déconnexion a échoué. Réessaie.') }
  }
  async function importLocal() {
    if (!current.current.uid || !current.current.ready) return
    if (import.meta.env.VITE_SERVER_LEARNING_ENABLED === 'true') {
      const { uid,generation } = current.current
      const backupKey = `${accountProgressKey(uid)}.pending-import`
      const local = decodeProgress(window.localStorage.getItem(backupKey))
      const pending = mergeProgress(local,loadProgress())
      window.localStorage.setItem(backupKey,JSON.stringify(pending))
      setStatus('Import de ta progression…')
      let failure = ''
      try { await importProgressOnServer(uid,pending) }
      catch (error) { failure = error instanceof Error ? error.message : 'L’import a été interrompu. Les données restent sur cet appareil.' }
      try {
        const next = await readCloudProgress(uid)
        if (current.current.generation !== generation) return
        current.current.progress = next
        setProgress(next)
        window.localStorage.setItem(accountProgressKey(uid),JSON.stringify(next))
        if (!failure) window.localStorage.removeItem(backupKey)
        setRevision(value => value + 1)
        setError(failure)
        setStatus(failure ? 'Import partiel · données restantes conservées' : 'Progression importée et synchronisée')
      } catch { if (current.current.generation === generation) setError('L’import n’a pas pu être confirmé. Les données d’origine restent sur cet appareil.') }
      return
    }
    try {
      if (persist(mergeProgress(current.current.progress, loadProgress()))) setRevision((value) => value + 1)
    } catch { setError('Impossible de lire la progression sans compte. Aucune donnée n’a été importée.') }
  }

  return <ProgressContext.Provider value={{ user, progress, ready, online, authResolved, revision, status, error, persist,
    completeLesson: lessonId => commit({ type:'lesson',lessonId,requestId:`lesson-${lessonId}` }),
    reviewCard: (cardId,rating,requestId) => commit({ type:'card',cardId,rating,requestId }),
    login, logout, importLocal, retry: () => { if (navigator.onLine) setRetryCount((value) => value + 1) } }}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const value = useContext(ProgressContext)
  if (!value) throw new Error('ProgressProvider manquant')
  return value
}
