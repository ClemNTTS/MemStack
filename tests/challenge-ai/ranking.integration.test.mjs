import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {ensureRankingMember,readWorldRanking,recordRankingActivity,updateRankingAlias,removeRankingMember} from '../../functions/src/worldRanking.mjs'
const require = createRequire(new URL('../../functions/package.json',import.meta.url))
const {initializeApp,deleteApp} = require('firebase-admin/app')
const {getFirestore} = require('firebase-admin/firestore')
let app,db
const now = Date.parse('2026-10-15T12:00:00Z')
before(()=>{if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Emulator required');app=initializeApp({projectId:'demo-memstack-ranking'},'ranking-tests');db=getFirestore(app)})
after(async()=>{await deleteApp(app)})
async function activity(uid,date=now) {
  await ensureRankingMember(db,uid,date)
  await db.runTransaction(async tx=>{
    const snapshot=await tx.get(db.doc(`_worldRanking/${uid}`))
    recordRankingActivity(tx,db,uid,snapshot.data(),date)
  })
}
test('all members are ranked, ties share a place, concurrent activity cannot inflate a streak and old buckets are removed',async()=>{
  const uid='ranking-active', second='ranking-second', inactive='ranking-inactive'
  await Promise.all([ensureRankingMember(db,inactive,now),activity(uid,now-86400000),activity(second,now-86400000)])
  await Promise.all(Array.from({length:5},()=>activity(uid)))
  await activity(second)
  let ranking=await readWorldRanking(db,uid,now)
  assert.equal(ranking.participants,3)
  assert.equal(ranking.self.streak,2)
  assert.equal(ranking.self.rank,1)
  assert.equal(ranking.leaders.filter(row=>row.streak===2).every(row=>row.rank===1),true)
  assert.equal(ranking.leaders.filter(row=>row.isYou).length,1)
  assert.equal((await db.doc(`_worldRankingDays/2026-10-14/members/${uid}`).get()).exists,false)
  assert.equal((await readWorldRanking(db,inactive,now)).self.rank,3)
  ranking=await readWorldRanking(db,uid,now+2*86400000)
  assert.equal(ranking.self.streak,0)
  assert.equal(ranking.self.rank,1)
  assert.equal(JSON.stringify(ranking).includes(uid),false)
})
test('alias changes are acknowledged, rate limited, blocked during deletion and removed with membership',async()=>{
  const uid='ranking-active'
  await updateRankingAlias(db,uid,{alias:'Mon pseudo'},now)
  assert.equal((await readWorldRanking(db,uid,now)).leaders.find(row=>row.isYou).alias,'Mon pseudo')
  await updateRankingAlias(db,uid,{alias:'Autre pseudo'},now)
  await updateRankingAlias(db,uid,{alias:'Dernier pseudo'},now)
  await assert.rejects(updateRankingAlias(db,uid,{alias:'Encore'},now),{code:'resource-exhausted'})
  await db.doc(`_accountLifecycle/${uid}`).set({status:'deleting'})
  await assert.rejects(updateRankingAlias(db,uid,{alias:'Revenir'},now+86400000),{code:'failed-precondition'})
  await removeRankingMember(db,uid)
  assert.equal((await db.doc(`_worldRanking/${uid}`).get()).exists,false)
  assert.equal((await db.doc(`_worldRankingDays/2026-10-15/members/${uid}`).get()).exists,false)
})
