import { doc, getDocFromServer } from 'firebase/firestore'
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import { getFirebaseServices } from './client'
import type { CardProgress, CardRating } from '../types/card'
import type { ReviewEvent } from '../types/progress'

export type LearningAction = { type: 'lesson', lessonId: string, requestId: string } | { type: 'card', cardId: string, rating: CardRating, requestId: string }
export type LearningActionResult = { type: 'lesson', lessonId: string, completedAt: string } | { type: 'card', card: CardProgress, event: ReviewEvent }
let emulatorConnected = false
export async function saveLearningAction(uid: string, action: LearningAction): Promise<LearningActionResult> {
  const { auth, db } = getFirebaseServices()
  if (auth.currentUser?.uid !== uid || !navigator.onLine) throw new Error('Connexion et Internet requises.')
  const functions = getFunctions(auth.app, 'europe-west9')
  if (import.meta.env.VITE_FIREBASE_EMULATORS === 'true' && !emulatorConnected) { connectFunctionsEmulator(functions,'localhost',5001); emulatorConnected = true }
  let result: LearningActionResult
  try { result = (await httpsCallable<LearningAction,LearningActionResult>(functions,'commitLearningAction')(action)).data }
  catch (error) {
    const receipt = await getDocFromServer(doc(db,'users',uid,'learningReceipts',action.requestId))
    if (!receipt.exists() || !Object.keys(action).every(key => receipt.data().request?.[key] === action[key as keyof LearningAction])) throw error
    result = receipt.data().result as LearningActionResult
  }
  if (auth.currentUser?.uid !== uid || result.type !== action.type) throw new Error('Réponse serveur incompatible.')
  return result
}
