import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { submitLearningAction, learningDay } from '../../functions/src/learningAccess.mjs'
import { importLearningBatch } from '../../functions/src/learningImport.mjs'
const require = createRequire(new URL('../../functions/package.json',import.meta.url))
const { initializeApp,deleteApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
let app,db
before(() => { if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Emulator required'); app = initializeApp({ projectId:'demo-memstack-learning' },'learning-tests'); db = getFirestore(app) })
after(async () => { if (app) await deleteApp(app) })
const catalog = [{ id:'lesson-one',cardIds:Array.from({length:9},(_,i)=>`card-${i}`) },{ id:'lesson-two',cardIds:['second-card'] }]
const now = Date.parse('2026-10-14T10:00:00Z')
const invoke = (uid,data,date=now) => submitLearningAction({db,uid,data,catalog,now:date})
const lesson = (id,requestId='request-lesson-one') => ({type:'lesson',lessonId:id,requestId})
const card = (id,requestId=`request-${id}-one`) => ({type:'card',cardId:id,rating:'recalled',requestId})
async function due(uid,count=6) {
  await db.doc(`users/${uid}/lessons/lesson-one`).set({completedAt:'2026-10-10T10:00:00.000Z'})
  for (let i=0;i<count;i++) await db.doc(`users/${uid}/cards/card-${i}`).set({cardId:`card-${i}`,intervalDays:1,lastReviewedAt:'2026-10-10T10:00:00.000Z',dueAt:'2026-10-11T10:00:00.000Z'})
}

test('concurrent tabs cannot consume two free lessons and retries charge once',async()=>{
  const uid='free-lessons'
  const results = await Promise.allSettled([invoke(uid,lesson('lesson-one')),invoke(uid,lesson('lesson-two','request-lesson-two'))])
  assert.equal(results.filter(result=>result.status==='fulfilled').length,1)
  const accepted = results[0].status==='fulfilled' ? lesson('lesson-one') : lesson('lesson-two','request-lesson-two')
  await invoke(uid,accepted)
  assert.equal((await db.doc(`users/${uid}/learningUsage/${learningDay(now)}`).get()).data().lessons,1)
  await assert.rejects(invoke(uid,{...accepted,lessonId:accepted.lessonId==='lesson-one'?'lesson-two':'lesson-one'}),{code:'already-exists'})
  assert.equal((await db.collection(`users/${uid}/lessons`).get()).size,1)
})

test('six concurrent reviews yield five writes, introduction stays free and future cards stay unavailable',async()=>{
  const uid='free-reviews'; await due(uid)
  const results=await Promise.allSettled(Array.from({length:6},(_,i)=>invoke(uid,card(`card-${i}`))))
  assert.equal(results.filter(result=>result.status==='fulfilled').length,5)
  const usage=(await db.doc(`users/${uid}/learningUsage/${learningDay(now)}`).get()).data()
  assert.equal(usage.reviews,5)
  const introduced=await invoke(uid,card('card-8'))
  assert.equal(introduced.event.kind,'new')
  assert.equal((await db.doc(`users/${uid}/learningUsage/${learningDay(now)}`).get()).data().reviews,5)
  await assert.rejects(invoke(uid,card('card-8','request-future-card-eight')),{code:'failed-precondition'})
  assert.equal((await db.collection(`users/${uid}/reviews`).get()).size,6)
})

test('permanent premium removes daily caps, expired subscriptions do not and deletion prevents writes',async()=>{
  const uid='permanent-learner'; await due(uid)
  await db.doc(`users/${uid}/settings/premiumAccess`).set({version:1,permanent:true})
  await invoke(uid,lesson('lesson-two','request-permanent-lesson'))
  const results=await Promise.all(Array.from({length:6},(_,i)=>invoke(uid,card(`card-${i}`))))
  assert.equal(results.length,6)
  await db.doc(`_accountLifecycle/${uid}`).set({status:'deleting'})
  await assert.rejects(invoke(uid,card('card-8')),{code:'failed-precondition'})
  const expired='expired-learner'; await due(expired)
  await db.doc(`users/${expired}/settings/subscription`).set({version:1,source:'stripe',status:'premium',premiumUntil:'2026-10-13T10:00:00.000Z'})
  for(let i=0;i<5;i++) await invoke(expired,card(`card-${i}`))
  await assert.rejects(invoke(expired,card('card-5')),{code:'resource-exhausted'})
})

test('imports preserve historical dates without bypassing todays allowance or duplicating writes',async()=>{
  const uid='import-learner'
  const data={lessons:[{id:'lesson-one',completedAt:'2026-01-01T10:00:00.000Z'}],cards:[],events:[]}
  await importLearningBatch({db,uid,data,catalog,now})
  await importLearningBatch({db,uid,data,catalog,now})
  assert.equal((await db.doc(`users/${uid}/lessons/lesson-one`).get()).data().completedAt,'2026-01-01T10:00:00.000Z')
  await assert.rejects(invoke(uid,lesson('lesson-two','request-after-import')),{code:'resource-exhausted'})
  await invoke(uid,lesson('lesson-two','request-after-import'),now+86400000)
  assert.equal((await db.collection(`users/${uid}/lessons`).get()).size,2)
})

test('activation counts real lessons already completed today before the server counter existed',async()=>{
  const uid='legacy-today'
  await db.doc(`users/${uid}/lessons/lesson-one`).set({completedAt:new Date(now-1000).toISOString()})
  await assert.rejects(invoke(uid,lesson('lesson-two','request-legacy-second')),{code:'resource-exhausted'})
  assert.equal((await db.collection(`users/${uid}/lessons`).get()).size,1)
})
