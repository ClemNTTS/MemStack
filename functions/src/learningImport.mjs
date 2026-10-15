import { createHash } from 'node:crypto'
import { AnalysisError } from './analysis.mjs'
import { hasPremium, hasPermanentPremium } from './subscription.mjs'
import { learningDay, readDailyLearningUsage } from './learningAccess.mjs'
import { ensureRankingMember } from './worldRanking.mjs'

const exact = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value,key))
const validDate = (value, now) => typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value && Date.parse(value) <= now
export async function importLearningBatch({ db, uid, data, catalog, now = Date.now() }) {
  if (!exact(data,['lessons','cards','events']) || ![data.lessons,data.cards,data.events].every(Array.isArray)
    || data.lessons.length + data.cards.length + data.events.length > 20 || data.lessons.length + data.cards.length + data.events.length === 0) throw new AnalysisError('invalid-argument','Import invalide ou trop grand.')
  const byLesson = new Map(catalog.map(lesson => [lesson.id,lesson]))
  const byCard = new Map(catalog.flatMap(lesson => lesson.cardIds.map(id => [id,lesson.id])))
  for (const lesson of data.lessons) if (!exact(lesson,['id','completedAt']) || !byLesson.has(lesson.id) || !validDate(lesson.completedAt,now)) throw new AnalysisError('invalid-argument','Leçon importée invalide.')
  for (const card of data.cards) if (!exact(card,['cardId','intervalDays','lastReviewedAt','dueAt']) || !byCard.has(card.cardId) || !Number.isInteger(card.intervalDays) || card.intervalDays < 1 || card.intervalDays > 365
    || !validDate(card.lastReviewedAt,now) || typeof card.dueAt !== 'string' || !Number.isFinite(Date.parse(card.dueAt))
    || new Date(card.dueAt).toISOString() !== card.dueAt || Date.parse(card.dueAt) !== Date.parse(card.lastReviewedAt) + card.intervalDays * 86400000) throw new AnalysisError('invalid-argument','Carte importée invalide.')
  for (const event of data.events) if (!exact(event,['cardId','rating','reviewedAt','kind']) || !byCard.has(event.cardId) || !['recalled','forgotten'].includes(event.rating) || !['new','review'].includes(event.kind) || !validDate(event.reviewedAt,now)) throw new AnalysisError('invalid-argument','Historique importé invalide.')
  const eventId = event => encodeURIComponent(`${event.cardId}_${event.reviewedAt}_${event.kind}_${event.rating}`)
  if (new Set(data.lessons.map(value => value.id)).size !== data.lessons.length || new Set(data.cards.map(value => value.cardId)).size !== data.cards.length || new Set(data.events.map(eventId)).size !== data.events.length) throw new AnalysisError('invalid-argument','Import dupliqué.')
  // Register before importing so supplied historical dates never seed a new global streak.
  await ensureRankingMember(db,uid,now)
  const importId = createHash('sha256').update(JSON.stringify(data)).digest('hex')
  const receiptRef = db.doc(`users/${uid}/learningImports/${importId}`)
  return db.runTransaction(async transaction => {
    const [marker,receipt,paid,access,usage] = await Promise.all([
      transaction.get(db.doc(`_accountLifecycle/${uid}`)),transaction.get(receiptRef),
      transaction.get(db.doc(`users/${uid}/settings/subscription`)),transaction.get(db.doc(`users/${uid}/settings/premiumAccess`)),
      transaction.get(db.doc(`users/${uid}/learningUsage/${learningDay(now)}`))
    ])
    if (marker.exists) throw new AnalysisError('failed-precondition','Suppression de compte en cours.')
    if (receipt.exists) return { imported:true }
    const lessonIds = [...new Set([...data.lessons.map(lesson => lesson.id),...data.cards.map(card => byCard.get(card.cardId)),...data.events.map(event => byCard.get(event.cardId))])]
    const lessonRefs = lessonIds.map(id => db.doc(`users/${uid}/lessons/${id}`))
    const cardRefs = data.cards.map(card => db.doc(`users/${uid}/cards/${card.cardId}`))
    const eventRefs = data.events.map(event => db.doc(`users/${uid}/reviews/${eventId(event)}`))
    const [lessons,cards,events] = await Promise.all([
      Promise.all(lessonRefs.map(ref => transaction.get(ref))),Promise.all(cardRefs.map(ref => transaction.get(ref))),Promise.all(eventRefs.map(ref => transaction.get(ref)))
    ])
    const completed = new Set(lessonIds.filter((_,index) => lessons[index].exists))
    const newLessons = data.lessons.filter(lesson => !completed.has(lesson.id))
    for (const lesson of newLessons) completed.add(lesson.id)
    if ([...data.cards,...data.events].some(value => !completed.has(byCard.get(value.cardId)))) throw new AnalysisError('failed-precondition','Importe d’abord la leçon liée aux cartes.')
    const newEvents = data.events.filter((_,index) => !events[index].exists)
    const changedCards = data.cards.filter((card,index) => !cards[index].exists || Date.parse(card.lastReviewedAt) > Date.parse(cards[index].data().lastReviewedAt))
    const practiceCount = newEvents.length + changedCards.filter(card => !newEvents.some(event => event.cardId === card.cardId)).length
    if (!newLessons.length && !practiceCount) return { imported:true }
    const count = await readDailyLearningUsage(transaction,db,uid,usage,now)
    if (![count.lessons,count.reviews].every(value => Number.isSafeInteger(value) && value >= 0)) throw new AnalysisError('failed-precondition','Compteur indisponible.')
    const premium = hasPremium(paid.data(),now) || hasPermanentPremium(access.data())
    if (!premium && (count.lessons + newLessons.length > 1 || count.reviews + practiceCount > 5)) throw new AnalysisError('resource-exhausted','L’import a atteint les limites gratuites du jour. Les données restantes restent sur cet appareil ; reprends demain ou avec Premium.')
    for (const lesson of newLessons) transaction.create(db.doc(`users/${uid}/lessons/${lesson.id}`),{ completedAt:lesson.completedAt })
    for (const card of changedCards) transaction.set(db.doc(`users/${uid}/cards/${card.cardId}`),card)
    for (const event of newEvents) transaction.create(db.doc(`users/${uid}/reviews/${eventId(event)}`),event)
    if (newLessons.length || practiceCount) transaction.set(db.doc(`users/${uid}/learningUsage/${learningDay(now)}`),{ lessons:count.lessons + newLessons.length,reviews:count.reviews + practiceCount })
    transaction.create(receiptRef,{ importedAt:new Date(now).toISOString() })
    return { imported:true }
  })
}
