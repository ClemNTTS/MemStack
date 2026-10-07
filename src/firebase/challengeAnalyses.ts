import { getApp } from 'firebase/app'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import { doc, getDocFromServer } from 'firebase/firestore'
import { getFirebaseServices } from './client'
import { decodeChallengeAnalysis } from '../challenges/analysisModel'
import type { ChallengeAnalysis } from '../types/challenge'

export const challengeAiEnabled = import.meta.env.VITE_CHALLENGE_AI_ENABLED === 'true'
let emulatorConnected = false

function requireAccount(uid: string) {
  const services = getFirebaseServices()
  if (!navigator.onLine || services.auth.currentUser?.uid !== uid) throw new Error('Connexion requise')
  return services
}

export async function readChallengeAnalysis(uid: string, attemptId: string): Promise<ChallengeAnalysis | null> {
  const { db } = requireAccount(uid)
  const snapshot = await getDocFromServer(doc(db, 'users', uid, 'challengeAnalyses', attemptId))
  requireAccount(uid)
  if (!snapshot.exists()) return null
  const analysis = decodeChallengeAnalysis(snapshot.data())
  if (!analysis) throw new Error('Retour invalide')
  return analysis
}

export async function analyzeChallengeAttempt(uid: string, attemptId: string): Promise<ChallengeAnalysis> {
  if (!challengeAiEnabled) throw new Error('Analyse IA désactivée')
  requireAccount(uid)
  const functions = getFunctions(getApp(), 'europe-west9')
  if (import.meta.env.VITE_FIREBASE_EMULATORS === 'true' && ['localhost', '127.0.0.1'].includes(location.hostname) && !emulatorConnected) {
    connectFunctionsEmulator(functions, 'localhost', 5001)
    emulatorConnected = true
  }
  const result = await httpsCallable<{ attemptId: string }, unknown>(functions, 'analyzeChallengeAttempt', { timeout: 120000 })({ attemptId })
  requireAccount(uid)
  const analysis = decodeChallengeAnalysis(result.data)
  if (!analysis) throw new Error('Retour invalide')
  return analysis
}
