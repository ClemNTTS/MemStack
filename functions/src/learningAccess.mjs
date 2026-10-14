import { AnalysisError } from './analysis.mjs'
import { hasPermanentPremium, hasPremium } from './subscription.mjs'

const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
export function learningDay(now) {
  const parts = dateFormat.formatToParts(new Date(now))
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-')
}
export function learningDayBounds(now) {
  const midnight = Date.parse(`${learningDay(now)}T00:00:00Z`)
  const format = new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Paris',timeZoneName:'shortOffset'})
  const offset = value => Number(format.formatToParts(new Date(value)).find(part => part.type === 'timeZoneName').value.replace('GMT','')) * 3600000
  return [new Date(midnight-offset(midnight)).toISOString(),new Date(midnight+86400000-offset(midnight+86400000)).toISOString()]
}
export async function readDailyLearningUsage(transaction,db,uid,snapshot,now) {
  if (snapshot.exists) return snapshot.data()
  const [start,end] = learningDayBounds(now)
  const [lessons,reviews] = await Promise.all([
    transaction.get(db.collection(`users/${uid}/lessons`).where('completedAt','>=',start).where('completedAt','<',end)),
    transaction.get(db.collection(`users/${uid}/reviews`).where('reviewedAt','>=',start).where('reviewedAt','<',end))
  ])
  return { lessons:lessons.size,reviews:reviews.docs.filter(document => document.data().kind === 'review').length }
}
export function validateLearningAction(data) {
  const keys = data?.type === 'lesson' ? ['type', 'lessonId', 'requestId'] : ['type', 'cardId', 'rating', 'requestId']
  if (!data || typeof data !== 'object' || Array.isArray(data) || !['lesson', 'card'].includes(data.type)
    || Object.keys(data).length !== keys.length || !keys.every(key => Object.hasOwn(data,key))
    || typeof data.requestId !== 'string' || !/^[a-zA-Z0-9-]{16,128}$/.test(data.requestId)
    || typeof (data.lessonId ?? data.cardId) !== 'string' || !/^[a-zA-Z0-9-]{1,128}$/.test(data.lessonId ?? data.cardId)
    || (data.type === 'card' && !['recalled','forgotten'].includes(data.rating))) throw new AnalysisError('invalid-argument', 'Action d’apprentissage invalide.')
  return data
}
export function scheduleServerReview(cardId, rating, now, previous) {
  const elapsed = previous ? Math.max(0,(now - Date.parse(previous.lastReviewedAt)) / 86400000) : 0
  const intervalDays = rating === 'forgotten' || !previous ? 1 : Math.min(365,Math.max(previous.intervalDays,Math.floor(elapsed * 2)))
  return { cardId, intervalDays, lastReviewedAt: new Date(now).toISOString(), dueAt: new Date(now + intervalDays * 86400000).toISOString() }
}

export async function submitLearningAction({ db, uid, data, catalog, now = Date.now() }) {
  validateLearningAction(data)
  const lesson = catalog.find(lesson => data.type === 'lesson' ? lesson.id === data.lessonId : lesson.cardIds.includes(data.cardId))
  if (!lesson) throw new AnalysisError('invalid-argument','Contenu inconnu.')
  const receiptRef = db.doc(`users/${uid}/learningReceipts/${data.requestId}`)
  const day = learningDay(now)
  const usageRef = db.doc(`users/${uid}/learningUsage/${day}`)
  const lessonRef = db.doc(`users/${uid}/lessons/${lesson.id}`)
  return db.runTransaction(async transaction => {
    const [marker, receipt, paid, access, usage, completed] = await Promise.all([
      transaction.get(db.doc(`_accountLifecycle/${uid}`)), transaction.get(receiptRef),
      transaction.get(db.doc(`users/${uid}/settings/subscription`)), transaction.get(db.doc(`users/${uid}/settings/premiumAccess`)),
      transaction.get(usageRef), transaction.get(lessonRef)
    ])
    if (marker.exists) throw new AnalysisError('failed-precondition','Ce compte est en cours de suppression.')
    if (receipt.exists) {
      if (!Object.keys(data).every(key => receipt.data().request?.[key] === data[key])) throw new AnalysisError('already-exists','Cet identifiant appartient à une autre action.')
      return receipt.data().result
    }
    const premium = hasPermanentPremium(access.data()) || hasPremium(paid.data(),now)
    const count = await readDailyLearningUsage(transaction,db,uid,usage,now)
    if (![count.lessons,count.reviews].every(value => Number.isSafeInteger(value) && value >= 0)) throw new AnalysisError('failed-precondition','Le compteur est indisponible.')
    let result
    if (data.type === 'lesson') {
      if (completed.exists) return { type: 'lesson', lessonId: lesson.id, completedAt: completed.data().completedAt }
      else {
        if (!premium && count.lessons >= 1) throw new AnalysisError('resource-exhausted','Ta leçon quotidienne est déjà terminée. Reviens demain ou découvre Premium.')
        const completedAt = new Date(now).toISOString()
        transaction.create(lessonRef,{ completedAt })
        transaction.set(usageRef,{ ...count, lessons: count.lessons + 1 })
        result = { type: 'lesson', lessonId: lesson.id, completedAt }
      }
    } else {
      if (!completed.exists) throw new AnalysisError('failed-precondition','Termine la leçon avant ses cartes.')
      const cardRef = db.doc(`users/${uid}/cards/${data.cardId}`)
      const previous = (await transaction.get(cardRef)).data()
      const kind = previous ? 'review' : 'new'
      if (previous && (!Number.isFinite(Date.parse(previous.dueAt)) || Date.parse(previous.dueAt) > now)) throw new AnalysisError('failed-precondition','Cette carte n’est pas encore due.')
      if (kind === 'review' && !premium && count.reviews >= 5) throw new AnalysisError('resource-exhausted','Tes cinq cartes dues du jour sont déjà révisées. Reviens demain ou découvre Premium.')
      const card = scheduleServerReview(data.cardId,data.rating,now,previous)
      const event = { cardId: data.cardId, rating: data.rating, reviewedAt: card.lastReviewedAt, kind }
      const eventId = encodeURIComponent(`${event.cardId}_${event.reviewedAt}_${event.kind}_${event.rating}`)
      transaction.set(cardRef,card)
      transaction.create(db.doc(`users/${uid}/reviews/${eventId}`),event)
      if (kind === 'review') transaction.set(usageRef,{ ...count,reviews:count.reviews + 1 })
      result = { type: 'card', card, event }
    }
    transaction.create(receiptRef,{ request: data, result })
    return result
  })
}
