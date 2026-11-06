import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseServices } from './client'
import type { EnterpriseLessonAssessment } from '../types/enterprise'

export type EnterpriseLessonAnswerInput = {
  organizationId: string
  lessonId: string
  questionId: string
  optionId: string
  contentVersion: string
  requestId: string
}

export async function submitEnterpriseLessonAnswer(uid: string, input: EnterpriseLessonAnswerInput) {
  const { auth } = getFirebaseServices()
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Une connexion vérifiée est requise.')
  const result = await httpsCallable<EnterpriseLessonAnswerInput, EnterpriseLessonAssessment>(getFunctions(auth.app, 'europe-west9'), 'submitEnterpriseLessonAnswer')(input)
  if (auth.currentUser?.uid !== uid) throw new Error('Le compte actif a changé.')
  return result.data
}
