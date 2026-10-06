import { doc, getDocFromServer, serverTimestamp, setDoc } from 'firebase/firestore'
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
      version: 1,
      ...data,
      createdAt: serverTimestamp(),
      status: 'pending',
    })
  } catch (error) {
    // A lost acknowledgement must not create another report on retry.
    if (!navigator.onLine || auth.currentUser?.uid !== uid) throw error
    const existing = await getDocFromServer(ref)
    if (!existing.exists() || !Object.entries(data).every(([key, value]) => existing.data()?.[key] === value)) throw error
  }
}
