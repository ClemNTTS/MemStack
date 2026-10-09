import { collection, doc, getDocFromServer, getDocsFromServer, serverTimestamp, setDoc } from 'firebase/firestore'
import { decodeContentReport } from '../reports/reportStatus'
import { validateContentReport } from '../reports/contentReport'
import type { ContentReportInput } from '../reports/contentReport'
import { getFirebaseServices } from './client'

export async function submitContentReport(uid: string, id: string, input: ContentReportInput): Promise<void> {
  const { auth, db } = getFirebaseServices()
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Connexion requise')
  const data = validateContentReport(input)
  const ref = doc(db, 'users', uid, 'contentReports', id)
  try {
    await setDoc(ref, {
      version: input.targetType ? 2 : 1,
      ...data,
      createdAt: serverTimestamp(),
      status: input.targetType ? 'needs_review' : 'pending',
    })
  } catch (error) {
    // A lost acknowledgement must not create another report on retry.
    if (!navigator.onLine || auth.currentUser?.uid !== uid) throw error
    const existing = await getDocFromServer(ref)
    if (!existing.exists() || !Object.entries(data).every(([key, value]) => existing.data()?.[key] === value)) throw error
  }
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Connexion requise')
}

export async function readContentReports(uid: string) {
  const { auth, db } = getFirebaseServices()
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Connexion requise')
  const result = await getDocsFromServer(collection(db, 'users', uid, 'contentReports'))
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Connexion requise')
  return result.docs.map(entry => decodeContentReport(entry.id, entry.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id))
}
