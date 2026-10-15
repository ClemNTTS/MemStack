import { createHash } from 'node:crypto'
import { AnalysisError } from './analysis.mjs'

const format = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
export function rankingDay(now) {
  const parts = format.formatToParts(new Date(now))
  return ['year','month','day'].map(type => parts.find(part => part.type === type).value).join('-')
}
const dayNumber = day => Date.parse(`${day}T00:00:00Z`) / 86400000
const previousDay = day => new Date(Date.parse(`${day}T00:00:00Z`) - 86400000).toISOString().slice(0,10)
export const defaultAlias = uid => `Mémo ${createHash('sha256').update(uid).digest('hex').slice(0,6).toUpperCase()}`
export function seedRanking(uid, dates, now = Date.now()) {
  const days = [...new Set(dates.filter(value => Number.isFinite(Date.parse(value)) && Date.parse(value) <= now).map(value => rankingDay(Date.parse(value))))].sort()
  let streak = 0, lastDay = null
  for (const day of days) { streak = lastDay && dayNumber(day) === dayNumber(lastDay) + 1 ? streak + 1 : 1; lastDay = day }
  return { alias: defaultAlias(uid), streak, lastDay }
}
export function activeStreak(state, now = Date.now()) {
  const day = rankingDay(now)
  return state?.lastDay && [day,previousDay(day)].includes(state.lastDay) ? state.streak : 0
}
export function nextRankingActivity(state, now = Date.now()) {
  const day = rankingDay(now)
  if (state.lastDay === day) return state
  return { ...state, lastDay: day, streak: state.lastDay === previousDay(day) ? state.streak + 1 : 1 }
}
const memberRef = (db,uid) => db.doc(`_worldRanking/${uid}`)
const dayRef = (db,day,uid) => db.doc(`_worldRankingDays/${day}/members/${uid}`)
export async function ensureRankingMember(db, uid, now = Date.now()) {
  const ref = memberRef(db,uid)
  if ((await ref.get()).exists) return
  const [lessons,reviews] = await Promise.all(['lessons','reviews'].map(name => db.collection(`users/${uid}/${name}`).get()))
  const state = seedRanking(uid,[...lessons.docs.map(doc => doc.data().completedAt),...reviews.docs.map(doc => doc.data().reviewedAt)],now)
  await db.runTransaction(async tx => {
    const [marker,current] = await Promise.all([tx.get(db.doc(`_accountLifecycle/${uid}`)),tx.get(ref)])
    if (marker.exists) throw new AnalysisError('failed-precondition','Ce compte est en cours de suppression.')
    if (current.exists) return
    tx.create(ref,state)
    if (activeStreak(state,now) > 0) tx.set(dayRef(db,state.lastDay,uid),{alias:state.alias,streak:state.streak})
  })
}
export function recordRankingActivity(tx, db, uid, state, now) {
  const next = nextRankingActivity(state,now)
  if (next === state) return
  if (state.lastDay) tx.delete(dayRef(db,state.lastDay,uid))
  tx.set(memberRef(db,uid),next)
  tx.set(dayRef(db,next.lastDay,uid),{alias:next.alias,streak:next.streak})
}
export async function readWorldRanking(db,uid,now = Date.now()) {
  await ensureRankingMember(db,uid,now)
  const [marker,member] = await Promise.all([db.doc(`_accountLifecycle/${uid}`).get(),memberRef(db,uid).get()])
  if (marker.exists || !member.exists) throw new AnalysisError('failed-precondition','Ce compte est indisponible.')
  const day = rankingDay(now), days = [day,previousDay(day)]
  const collections = days.map(value => db.collection(`_worldRankingDays/${value}/members`))
  const score = activeStreak(member.data(),now)
  const [tops,better,total] = await Promise.all([
    Promise.all(collections.map(ref => ref.orderBy('streak','desc').limit(20).get())),
    Promise.all(collections.map(ref => ref.where('streak','>',score).count().get())),
    db.collection('_worldRanking').count().get()
  ])
  const rows = new Map()
  for (const snapshot of tops) for (const doc of snapshot.docs) if (!rows.has(doc.id)) rows.set(doc.id,{id:doc.id,...doc.data()})
  if (rows.size < 20) {
    const inactive = await db.collection('_worldRanking').limit(20).get()
    for (const doc of inactive.docs) if (!rows.has(doc.id) && activeStreak(doc.data(),now) === 0) rows.set(doc.id,{id:doc.id,alias:doc.data().alias,streak:0})
  }
  const sorted = [...rows.values()].sort((a,b) => b.streak - a.streak || a.id.localeCompare(b.id)).slice(0,20)
  let rank = 0, last = -1
  const leaders = sorted.map((row,index) => { if (row.streak !== last) {rank=index+1;last=row.streak} return {rank,alias:row.alias,streak:row.streak,isYou:row.id===uid} })
  return { day, participants:total.data().count, leaders, self:{alias:member.data().alias,streak:score,rank:better.reduce((sum,snapshot) => sum+snapshot.data().count,1)} }
}
export function validateAlias(data) {
  if (!data || Object.keys(data).length !== 1 || typeof data.alias !== 'string') throw new AnalysisError('invalid-argument','Pseudo invalide.')
  const alias = data.alias.trim().normalize('NFC')
  if (alias.length < 2 || alias.length > 24 || !/^[\p{L}\p{N} ._-]+$/u.test(alias)) throw new AnalysisError('invalid-argument','Choisis un pseudo de 2 à 24 caractères : lettres, chiffres, espaces, tirets ou points.')
  return alias
}
export async function updateRankingAlias(db,uid,data,now = Date.now()) {
  const alias = validateAlias(data)
  await ensureRankingMember(db,uid,now)
  await db.runTransaction(async tx => {
    const [marker,snapshot] = await Promise.all([tx.get(db.doc(`_accountLifecycle/${uid}`)),tx.get(memberRef(db,uid))])
    if (marker.exists || !snapshot.exists) throw new AnalysisError('failed-precondition','Ce compte est indisponible.')
    const state = snapshot.data(), day = rankingDay(now)
    const edits = state.aliasEditedDay === day ? state.aliasEdits : 0
    if (edits >= 3) throw new AnalysisError('resource-exhausted','Tu peux changer de pseudo trois fois par jour.')
    tx.update(memberRef(db,uid),{alias,aliasEditedDay:day,aliasEdits:edits+1})
    if (activeStreak(state,now) > 0) tx.set(dayRef(db,state.lastDay,uid),{alias,streak:state.streak})
  })
  return {alias}
}
export async function removeRankingMember(db,uid) {
  await db.runTransaction(async tx => {
    const ref = memberRef(db,uid), snapshot = await tx.get(ref)
    if (snapshot.data()?.lastDay) tx.delete(dayRef(db,snapshot.data().lastDay,uid))
    tx.delete(ref)
  })
}
