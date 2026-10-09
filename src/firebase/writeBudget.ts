import { doc, serverTimestamp, Timestamp } from 'firebase/firestore'
import type { Firestore, Transaction } from 'firebase/firestore'

const limits = { attempts: 20, reports: 10 }

export async function reserveWrite(transaction: Transaction, db: Firestore, uid: string, kind: keyof typeof limits, documentId: string) {
  const ref = doc(db, 'users', uid, 'writeBudgets', kind)
  const snapshot = await transaction.get(ref)
  const previous = snapshot.data()
  const startedAt = previous?.windowStartedAt
  const active = startedAt instanceof Timestamp && Date.now() - startedAt.toMillis() < 3600000
  const count = active ? previous?.count + 1 : 1
  if (count > limits[kind]) throw new Error(kind === 'reports' ? 'Limite de 10 signalements par heure atteinte. Réessaie plus tard.' : 'Limite de 20 tentatives par heure atteinte. Réessaie plus tard.')
  transaction.set(ref, { count, windowStartedAt: active ? startedAt : serverTimestamp(), documentId })
}
