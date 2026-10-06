import { doc, runTransaction } from 'firebase/firestore'
import { catalogCourses } from '../data/catalog'
import { applyLearningPreferencePatch, migrateLearningPreferences } from '../progress/preferenceModel'
import type { LearningPreferencePatch, LearningPreferences } from '../progress/preferenceModel'
import { getFirebaseServices } from './client'

const courseIds = new Set(catalogCourses.map(course => course.id))

export async function bootstrapCloudPreferences(uid: string, localDefaults: LearningPreferences): Promise<LearningPreferences> {
  const { db } = getFirebaseServices()
  const ref = doc(db, 'users', uid, 'settings', 'learning')
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const preferences = migrateLearningPreferences(snapshot.exists() ? snapshot.data() : undefined, localDefaults, courseIds)
    if (!snapshot.exists()) transaction.set(ref, { version: 1, ...preferences })
    return preferences
  })
}

export async function updateCloudPreferences(uid: string, patch: LearningPreferencePatch): Promise<LearningPreferences> {
  const { db } = getFirebaseServices()
  const ref = doc(db, 'users', uid, 'settings', 'learning')
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) throw new Error('Préférences cloud non initialisées')
    // Always patch the latest committed pair; another device may have changed the other field.
    const preferences = applyLearningPreferencePatch(snapshot.data(), patch, courseIds)
    transaction.set(ref, { version: 1, ...preferences })
    return preferences
  })
}
