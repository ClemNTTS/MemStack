import { collection, doc, documentId, getDocFromServer, getDocsFromServer, limit, orderBy, query, runTransaction, serverTimestamp, startAfter } from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import { decodeContentReport } from '../reports/reportStatus'
import { validateContentReport } from '../reports/contentReport'
import type { ContentReportInput } from '../reports/contentReport'
import { getFirebaseServices } from './client'
import { reserveWrite } from './writeBudget'

export async function submitContentReport(uid: string, id: string, input: ContentReportInput): Promise<void> {
  const { auth, db } = getFirebaseServices()
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Connexion requise')
  const data = validateContentReport(input)
  const ref = doc(db, 'users', uid, 'contentReports', id)
  try {
    await runTransaction(db, async transaction => {
      const existing = await transaction.get(ref)
      if (existing.exists()) {
        if (!Object.entries(data).every(([key, value]) => existing.data()?.[key] === value)) throw new Error('Signalement déjà utilisé')
        return
      }
      await reserveWrite(transaction, db, uid, 'reports', id)
      transaction.set(ref, {
        version: input.targetType ? 2 : 1,
        ...data,
        createdAt: serverTimestamp(),
        status: input.targetType ? 'needs_review' : 'pending',
      })
    })
  } catch (error) {
    // A lost acknowledgement must not create another report on retry.
    if (!navigator.onLine || auth.currentUser?.uid !== uid) throw error
    const existing = await getDocFromServer(ref)
    if (!existing.exists() || !Object.entries(data).every(([key, value]) => existing.data()?.[key] === value)) throw error
  }
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Connexion requise')
}

export type ReportCursor = QueryDocumentSnapshot<DocumentData>

export async function readContentReports(uid: string, cursor?: ReportCursor) {
  const { auth, db } = getFirebaseServices()
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Connexion requise')
  const result = await getDocsFromServer(query(collection(db, 'users', uid, 'contentReports'),
    orderBy('createdAt', 'desc'), orderBy(documentId(), 'desc'), ...(cursor ? [startAfter(cursor)] : []), limit(21)))
  if (!navigator.onLine || auth.currentUser?.uid !== uid) throw new Error('Connexion requise')
  const page = result.docs.slice(0, 20)
  return { reports: page.map(entry => decodeContentReport(entry.id, entry.data())),
    cursor: page.at(-1), hasMore: result.docs.length > 20 }
}
