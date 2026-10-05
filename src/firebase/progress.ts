import { collection, doc, getDocsFromServer, runTransaction } from 'firebase/firestore'
import type { LearningProgress } from '../types/progress'
import { decodeProgress } from '../progress/storage'
import { mergeProgress, reviewEventId } from '../progress/merge'
import { getFirebaseServices } from './client'

const syncedEvents = new Map<string, Set<string>>()

export async function readCloudProgress(uid: string): Promise<LearningProgress> {
  const { db } = getFirebaseServices()
  const [lessons, cards, reviews] = await Promise.all(['lessons', 'cards', 'reviews'].map((name) =>
    getDocsFromServer(collection(db, 'users', uid, name)),
  ))
  const progress = decodeProgress(JSON.stringify({
    version: 1,
    completedLessons: Object.fromEntries(lessons.docs.map((item) => [item.id, item.data().completedAt])),
    cards: Object.fromEntries(cards.docs.map((item) => [item.id, item.data()])),
    history: reviews.docs.map((item) => item.data()),
  }))
  syncedEvents.set(uid, new Set(progress.history.map(reviewEventId)))
  return progress
}

export async function writeCloudProgress(uid: string, next: LearningProgress): Promise<void> {
  const { db } = getFirebaseServices()
  if (!Object.keys(next.completedLessons).length && !Object.keys(next.cards).length && !next.history.length) {
    await getDocsFromServer(collection(db, 'users', uid, 'lessons'))
    return
  }
  // Read before writing; transaction retries preserve newer answers from another device.
  await runTransaction(db, async (transaction) => {
    const lessonRefs = Object.keys(next.completedLessons).map((id) => doc(db, 'users', uid, 'lessons', id))
    const cardRefs = Object.keys(next.cards).map((id) => doc(db, 'users', uid, 'cards', id))
    const snapshots = await Promise.all([...lessonRefs, ...cardRefs].map((ref) => transaction.get(ref)))
    const previous = decodeProgress(JSON.stringify({
      version: 1,
      completedLessons: Object.fromEntries(snapshots.slice(0, lessonRefs.length).filter((item) => item.exists()).map((item) => [item.id, item.data()!.completedAt])),
      cards: Object.fromEntries(snapshots.slice(lessonRefs.length).filter((item) => item.exists()).map((item) => [item.id, item.data()])),
      history: [],
    }))
    const merged = mergeProgress(previous, next)
    for (const ref of lessonRefs) {
      if (previous.completedLessons[ref.id] !== merged.completedLessons[ref.id]) transaction.set(ref, { completedAt: merged.completedLessons[ref.id] })
    }
    for (const ref of cardRefs) {
      if (JSON.stringify(previous.cards[ref.id]) !== JSON.stringify(merged.cards[ref.id])) transaction.set(ref, merged.cards[ref.id])
    }
  })
  // Idempotent event documents avoid duplicates when an interrupted sync is retried.
  // Separate small transactions stay below Firestore write limits for a large local import.
  for (const event of next.history) {
    const id = reviewEventId(event)
    const known = syncedEvents.get(uid) ?? new Set<string>()
    syncedEvents.set(uid, known)
    if (known.has(id)) continue
    const ref = doc(db, 'users', uid, 'reviews', reviewEventId(event))
    await runTransaction(db, async (transaction) => {
      const existing = await transaction.get(ref)
      if (!existing.exists()) transaction.set(ref, event)
    })
    known.add(id)
  }
}
