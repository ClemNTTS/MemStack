import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { getFirebaseServices } from '../firebase/client'
import { readCloudProgress, writeCloudProgress } from '../firebase/progress'
import type { LearningProgress } from '../types/progress'
import { decodeProgress, emptyProgress, loadProgress, saveProgress } from './storage'
import { accountProgressKey, mergeProgress } from './merge'

type ProgressContextValue = {
  user: User | null
  progress: LearningProgress
  status: string
  error: string
  ready: boolean
  revision: number
  persist: (next: LearningProgress) => boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  retry: () => void
  importLocal: () => void
  resetGuest: () => void
}
const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [progress, setProgress] = useState(emptyProgress)
  const [ready, setReady] = useState(false)
  const [revision, setRevision] = useState(0)
  const [status, setStatus] = useState('Chargement…')
  const [error, setError] = useState('')
  const current = useRef({ uid: null as string | null, progress: emptyProgress(), generation: 0, ready: false })
  const work = useRef(Promise.resolve())
  const [retryCount, setRetryCount] = useState(0)

  function synchronize() {
    const { uid, generation } = current.current
    if (!uid) return
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
      setError('')
      setStatus('Chargement…')
      try {
        let next: LearningProgress
        if (account) {
          const cache = window.localStorage.getItem(accountProgressKey(account.uid))
          const local = decodeProgress(cache)
          try { next = mergeProgress(await readCloudProgress(account.uid), local) }
          catch {
            if (cache === null) throw new Error('Cloud unavailable')
            next = local
          }
          if (disposed || current.current.generation !== generation) return
          window.localStorage.setItem(accountProgressKey(account.uid), JSON.stringify(next))
        } else next = loadProgress()
        if (disposed || current.current.generation !== generation) return
        current.current.progress = next
        current.current.ready = true
        setProgress(next)
        setRevision((value) => value + 1)
        setReady(true)
        setStatus(account ? 'Synchronisation…' : 'Progression locale · sans connexion')
        if (account) synchronize()
      } catch {
        if (disposed || current.current.generation !== generation) return
        setError('Impossible de charger la progression. Aucune donnée n’a été remplacée. Vérifie ta connexion ou ton stockage puis réessaie.')
        setStatus('Progression indisponible')
      }
    })
    return () => { disposed = true; current.current.generation++; unsubscribe() }
  }, [retryCount])

  useEffect(() => {
    const reconnect = () => { if (current.current.ready) synchronize() }
    window.addEventListener('online', reconnect)
    return () => window.removeEventListener('online', reconnect)
  }, [])

  function persist(next: LearningProgress): boolean {
    if (!current.current.ready) return false
    try {
      const uid = current.current.uid
      if (uid) window.localStorage.setItem(accountProgressKey(uid), JSON.stringify(next))
      else saveProgress(next)
      current.current.progress = next
      setProgress(next)
      if (uid) synchronize()
      return true
    } catch {
      setError('La sauvegarde sur cet appareil a échoué. Ta réponse n’a pas été validée.')
      return false
    }
  }

  async function login() {
    let timeout: ReturnType<typeof setTimeout> | undefined
    try {
      setError('')
      await Promise.race([
        signInWithPopup(getFirebaseServices().auth, new GoogleAuthProvider()),
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
  function importLocal() {
    if (!current.current.uid || !current.current.ready) return
    try {
      if (persist(mergeProgress(current.current.progress, loadProgress()))) setRevision((value) => value + 1)
    } catch { setError('Impossible de lire la progression sans compte. Aucune donnée n’a été importée.') }
  }

  function resetGuest() {
    if (current.current.uid || !window.confirm('Réinitialiser la progression sans compte de ce navigateur ? Cette action efface uniquement cette progression locale.')) return
    try { saveProgress(emptyProgress()); setRetryCount((value) => value + 1) }
    catch { setError('La réinitialisation locale a échoué.') }
  }

  return <ProgressContext.Provider value={{ user, progress, ready, revision, status, error, persist, login, logout, importLocal, resetGuest, retry: () => ready && user ? synchronize() : setRetryCount((value) => value + 1) }}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const value = useContext(ProgressContext)
  if (!value) throw new Error('ProgressProvider manquant')
  return value
}
