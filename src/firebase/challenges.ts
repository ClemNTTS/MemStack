import { collection, doc, getDocFromServer, getDocsFromServer, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore'
import { acknowledgeChallengeAttempt, decodeChallengeAttempt, matchesAttemptSubmission, validateChallengeForm } from '../challenges/attemptModel'
import type { ChallengeAttempt } from '../types/challenge'
import { getFirebaseServices } from './client'
import { challenges } from '../data/challenges'

function requireAccount(uid: string) {
  const services = getFirebaseServices()
  if (!navigator.onLine || services.auth.currentUser?.uid !== uid) throw new Error('Connexion requise')
  return services
}

function decodeServerAttempt(id: string, data: Record<string, unknown>): ChallengeAttempt {
  const submittedAt = data.submittedAt
  if (!(submittedAt instanceof Timestamp)) throw new Error('Date de tentative invalide')
  const attempt = decodeChallengeAttempt(id, { ...data, submittedAt: submittedAt.toDate().toISOString() })
  if (!attempt) throw new Error('Tentative invalide')
  return attempt
}

async function readAttempt(uid: string, id: string): Promise<ChallengeAttempt | null> {
  const { db } = requireAccount(uid)
  const snapshot = await getDocFromServer(doc(db, 'users', uid, 'challengeAttempts', id))
  requireAccount(uid)
  return snapshot.exists() ? decodeServerAttempt(snapshot.id, snapshot.data()) : null
}

export async function readChallengeAttempts(uid: string): Promise<ChallengeAttempt[]> {
  const { db } = requireAccount(uid)
  const snapshot = await getDocsFromServer(collection(db, 'users', uid, 'challengeAttempts'))
  requireAccount(uid)
  return snapshot.docs.map(entry => decodeServerAttempt(entry.id, entry.data()))
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))
}

export async function submitChallengeAttempt(uid: string, id: string, challengeId: string, observations: string, actions: string): Promise<ChallengeAttempt> {
  if (!/^[a-zA-Z0-9-]{1,128}$/.test(id)) throw new Error('Identifiant de tentative invalide')
  const form = validateChallengeForm(challengeId, observations, actions)
  const { answer } = form
  const challengeVersion = challenges.find(challenge => challenge.id === challengeId)!.version
  const { db } = requireAccount(uid)
  const ref = doc(db, 'users', uid, 'challengeAttempts', id)
  return acknowledgeChallengeAttempt(async () => {
    await runTransaction(db, async transaction => {
      requireAccount(uid)
      const existing = await transaction.get(ref)
      requireAccount(uid)
      if (existing.exists()) {
        const attempt = decodeServerAttempt(existing.id, existing.data())
        if (!matchesAttemptSubmission(attempt, challengeId, challengeVersion, answer)) throw new Error('Tentative déjà utilisée')
      } else {
        transaction.set(ref, { version: 2, challengeId, challengeVersion, ...form, submittedAt: serverTimestamp(), outcome: '' })
      }
    })
  }, () => readAttempt(uid, id), challengeId, challengeVersion, answer)
}
