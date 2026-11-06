import test, {before,after} from 'node:test'
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {readFileSync} from 'node:fs'
import {initializeTestEnvironment,assertFails} from '@firebase/rules-unit-testing'
import {doc,getDoc,setDoc} from 'firebase/firestore'
import {submitEnterpriseLessonAnswer,commitEnterpriseLearningAction,getEnterpriseWorkspace,getEnterpriseLessonDraft,saveEnterpriseLessonDraft,exportEnterpriseData,deleteEnterpriseData} from '../../functions/src/enterprise.mjs'
import {enterpriseDraftContentVersion} from '../../functions/src/enterpriseDraft.mjs'

const require = createRequire(new URL('../../functions/package.json',import.meta.url))
const {initializeApp,deleteApp} = require('firebase-admin/app')
const {getFirestore} = require('firebase-admin/firestore')
let app,db,environment
before(async()=>{
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Emulator required')
  app = initializeApp({projectId:'demo-memstack-lesson-assessments'},'enterprise-lesson-assessment-tests')
  db = getFirestore(app)
  environment = await initializeTestEnvironment({projectId:'demo-memstack-lesson-assessments',firestore:{rules:readFileSync(new URL('../../firestore.rules',import.meta.url),'utf8')}})
})
after(async()=>{if(environment) await environment.cleanup();if(app) await deleteApp(app)})

const now = Date.parse('2026-11-06T11:00:00Z')
const pilot = {id:'ent-answer-or-action',title:'Invitation fictive',chapterId:'foundation',prerequisiteLessonIds:[],cards:[],steps:[
  {id:'q1',type:'question',prompt:'Premier choix',correctOptionId:'a',options:[{id:'a',text:'Oui',feedback:'C’est une bonne raison.'},{id:'b',text:'Non',feedback:'Ce choix ne convient pas.'}]},
  {id:'q2',type:'question',prompt:'Second choix',correctOptionId:'b',options:[{id:'a',text:'Oui',feedback:'Ce choix ne convient pas.'},{id:'b',text:'Non',feedback:'C’est une bonne raison.'}]},
]}
const second = {...pilot,id:'next-lesson',prerequisiteLessonIds:[pilot.id]}
const catalog = {version:2,tracks:[],lessons:[pilot,second],challenges:[]}
const keys = {version:2,challenges:{}}
const contentVersion = enterpriseDraftContentVersion(pilot)
const lookup = async uid=>({email:`${uid}@example.com`,emailVerified:true,disabled:false})
const owner = 'assessment-owner', manager = 'assessment-manager', foreign = 'assessment-foreign'
const context = (org,data,uid=owner,date=now) => ({db,auth:{uid,token:{firebase:{sign_in_provider:'google.com'}}},lookup,data:{organizationId:org,...data},catalog,keys,practices:{},now:date})
const request = (questionId,optionId,requestId) => ({lessonId:pilot.id,questionId,optionId,requestId,contentVersion})
const answer = (org,questionId,optionId,requestId,uid=owner,date=now) => submitEnterpriseLessonAnswer(context(org,request(questionId,optionId,requestId),uid,date))
const complete = (org,lessonId=pilot.id,uid=owner,date=now) => commitEnterpriseLearningAction(context(org,{type:'lesson',lessonId,requestId:`complete-${lessonId}-request`},uid,date))
const assessmentRef = (org,uid=owner) => db.doc(`organizations/${org}/learners/${uid}/lessonAssessments/${pilot.id}`)
async function seed(org) {
  await db.doc(`organizations/${org}`).set({enabled:true,name:org,offer:'managed-pilot',seatLimit:20})
  for (const [uid,role] of [[owner,'learner'],[manager,'manager']]) {
    await db.doc(`organizations/${org}/members/${uid}`).set({active:true,role,alias:uid})
    await db.doc(`users/${uid}/enterpriseMemberships/${org}`).set({organizationId:org,active:true})
  }
}

test('assessment answers are transactional, sequential, immutable and idempotent',async()=>{
  const org = 'lesson-assessment-transactions'
  await seed(org)
  await assert.rejects(complete(org),{code:'failed-precondition'})
  await assert.rejects(answer(org,'q2','b','skip-first-question'),{code:'failed-precondition'})
  const [one,two] = await Promise.all([answer(org,'q1','b','first-answer-request'),answer(org,'q1','b','first-answer-request')])
  assert.deepEqual(one,two)
  await assert.rejects(answer(org,'q1','a','change-answer-request'),{code:'already-exists'})
  await assert.rejects(answer(org,'q2','b','first-answer-request'),{code:'already-exists'})
  const failed = await answer(org,'q2','b','last-answer-request')
  assert.equal(failed.correct,1)
  assert.equal(failed.passed,false)
  assert.equal(failed.retryAt,'2026-11-06T23:00:00.000Z')
  await assert.rejects(complete(org),{code:'failed-precondition'})
  await assert.rejects(complete(org,second.id),{code:'failed-precondition'})
  assert.equal((await db.doc(`organizations/${org}/members/${owner}`).get()).data().summary,undefined)
  assert.equal((await db.doc(`organizations/${org}/ranking/${owner}`).get()).exists,false)
  assert.equal((await getEnterpriseWorkspace(context(org,{}))).lessonAssessments[pilot.id].correct,1)

  const racingOrg = 'lesson-assessment-racing-answers'
  await seed(racingOrg)
  const raced = await Promise.allSettled([
    answer(racingOrg,'q1','a','racing-first-answer-a'),
    answer(racingOrg,'q1','b','racing-first-answer-b'),
  ])
  assert.equal(raced.filter(result=>result.status==='fulfilled').length,1)
  assert.equal(raced.filter(result=>result.status==='rejected' && result.reason.code==='already-exists').length,1)
  const winner = raced.find(result=>result.status==='fulfilled').value
  assert.equal((await assessmentRef(racingOrg).get()).data().answers.q1,winner.answers.q1)
})

test('a failed attempt unlocks a fresh attempt at Paris midnight and only passing permits completion',async()=>{
  const org = 'lesson-assessment-midnight'
  await seed(org)
  await answer(org,'q1','b','failed-first-request')
  const failed = await answer(org,'q2','a','failed-final-request')
  const midnight = Date.parse(failed.retryAt)
  await assert.rejects(answer(org,'q1','a','same-day-retry-request',owner,midnight-1),{code:'already-exists'})
  const fresh = await answer(org,'q1','a','next-day-first-request',owner,midnight)
  assert.equal(fresh.attemptDay,'2026-11-07')
  assert.deepEqual(fresh.answers,{q1:'a'})
  const passed = await answer(org,'q2','b','next-day-final-request',owner,midnight+1)
  assert.equal(passed.passed,true)
  await complete(org,pilot.id,owner,midnight+2)
  await assert.rejects(complete(org,second.id,owner,midnight+3),{code:'failed-precondition'})
  for (const [questionId,optionId] of [['q1','a'],['q2','b']]) await submitEnterpriseLessonAnswer(context(org,{lessonId:second.id,questionId,optionId,requestId:`second-lesson-${questionId}-request`,contentVersion:enterpriseDraftContentVersion(second)},owner,midnight+3))
  await complete(org,second.id,owner,midnight+4)
  const history = await db.collection(`organizations/${org}/learners/${owner}/lessonAssessmentAttempts`).get()
  assert.equal(history.docs.filter(row=>row.data().lessonId===pilot.id).length,2)
  assert.equal(history.docs.filter(row=>row.data().lessonId===second.id).length,1)
  assert.equal(history.docs.find(row=>row.data().attemptDay==='2026-11-06').data().correct,0)
  const oldAcknowledgement = await answer(org,'q2','a','failed-final-request',owner,midnight+4)
  assert.equal(oldAcknowledgement.correct,0)
  assert.equal((await assessmentRef(org).get()).data().passed,true)
})

test('assessments are private across users and organizations and exported/deleted with the account',async()=>{
  const org = 'lesson-assessment-private', other = 'lesson-assessment-other'
  await seed(org); await seed(other)
  await answer(org,'q1','a','owner-first-question')
  await answer(other,'q1','b','other-first-question')
  await assert.rejects(answer(org,'q1','a','foreign-first-question',foreign),{code:'permission-denied'})
  await answer(org,'q1','b','manager-first-question',manager)
  assert.equal((await assessmentRef(org).get()).data().answers.q1,'a')
  assert.equal((await assessmentRef(org,manager).get()).data().answers.q1,'b')
  assert.equal((await assessmentRef(other).get()).data().answers.q1,'b')
  for (const uid of [owner,manager]) {
    const client = environment.authenticatedContext(uid).firestore()
    for (const collection of ['lessonAssessments','lessonAssessmentAttempts','lessonAssessmentReceipts']) {
      await assertFails(setDoc(doc(client,`organizations/${org}/learners/${owner}/${collection}/forged`),{passed:true}))
      await assertFails(getDoc(doc(client,`organizations/${org}/learners/${owner}/${collection}/${pilot.id}`)))
    }
  }
  const exported = await exportEnterpriseData(db,owner)
  assert.equal(exported.find(row=>row.organizationId===org).collections.find(group=>group.name==='lessonAssessments').rows.length,1)
  await deleteEnterpriseData(db,owner,`${owner}@example.com`)
  assert.equal((await assessmentRef(org).get()).exists,false)
  assert.equal((await assessmentRef(other).get()).exists,false)
  assert.equal((await assessmentRef(org,manager).get()).exists,true)
})

test('historical completed lessons remain valid without a new assessment',async()=>{
  const org = 'lesson-assessment-legacy'
  await seed(org)
  await db.doc(`organizations/${org}/learners/${owner}/lessons/${pilot.id}`).set({completedAt:new Date(now-1000).toISOString()})
  assert.equal((await complete(org)).completedAt,new Date(now-1000).toISOString())
  await assert.rejects(answer(org,'q1','a','legacy-replay-request'),{code:'failed-precondition'})
  assert.equal((await assessmentRef(org).get()).exists,false)
})

test('new lesson content recovers an uncommitted pass without erasing history or reopening a failed day',async()=>{
  const org = 'lesson-assessment-new-content'
  await seed(org)
  await answer(org,'q1','a','old-content-first-answer')
  await answer(org,'q2','b','old-content-final-answer')
  const updatedLesson = {...pilot,title:'Invitation fictive mise à jour'}
  const updatedCatalog = {...catalog,lessons:[updatedLesson,second]}
  const updatedVersion = enterpriseDraftContentVersion(updatedLesson)
  const changedContext = (data,date=now) => ({...context(org,data,owner,date),catalog:updatedCatalog})
  await assert.rejects(commitEnterpriseLearningAction(changedContext({type:'lesson',lessonId:pilot.id,requestId:'new-content-complete-early'})),{code:'failed-precondition'})
  await assert.rejects(submitEnterpriseLessonAnswer(changedContext(request('q1','a','old-content-first-answer'))),{code:'failed-precondition'})
  const restarted = await submitEnterpriseLessonAnswer(changedContext({...request('q1','a','new-content-first-answer'),contentVersion:updatedVersion}))
  assert.equal(restarted.contentVersion,updatedVersion)
  assert.equal(restarted.finished,false)
  assert.deepEqual(restarted.answers,{q1:'a'})
  assert.equal((await db.collection(`organizations/${org}/learners/${owner}/lessonAssessmentAttempts`).get()).size,2)
  await submitEnterpriseLessonAnswer(changedContext({...request('q2','b','new-content-final-answer'),contentVersion:updatedVersion}))
  await commitEnterpriseLearningAction(changedContext({type:'lesson',lessonId:pilot.id,requestId:'new-content-complete-pass'}))
  assert.equal((await db.doc(`organizations/${org}/members/${owner}`).get()).data().summary.lessons,1)

  const failedOrg = 'lesson-assessment-new-content-failed'
  await seed(failedOrg)
  await answer(failedOrg,'q1','b','old-content-failed-first')
  await answer(failedOrg,'q2','b','old-content-failed-final')
  await assert.rejects(submitEnterpriseLessonAnswer({...context(failedOrg,{...request('q1','a','new-content-failed-retry'),contentVersion:updatedVersion}),catalog:updatedCatalog}),{code:'resource-exhausted'})
  assert.equal((await assessmentRef(failedOrg).get()).data().answers.q1,'b')
})

test('a fresh draft saved tomorrow survives reload before the new assessment starts',async()=>{
  const org = 'lesson-assessment-fresh-draft'
  await seed(org)
  await answer(org,'q1','b','fresh-draft-failed-first')
  const failed = await answer(org,'q2','b','fresh-draft-failed-last')
  const tomorrow = Date.parse(failed.retryAt)+1000
  const before = await getEnterpriseLessonDraft(context(org,{lessonId:pilot.id},owner,tomorrow))
  const state = {stepId:'q1',answers:{},checkedIds:[],draft:'',practiceAnswers:{}}
  const saved = await saveEnterpriseLessonDraft(context(org,{lessonId:pilot.id,contentVersion,expectedRevision:before.revision,mutationId:'fresh-draft-tomorrow-save',state},owner,tomorrow))
  assert.ok(Date.parse(saved.updatedAt)>=Date.parse(failed.retryAt))
  assert.deepEqual((await getEnterpriseLessonDraft(context(org,{lessonId:pilot.id},owner,tomorrow+1))).state,state)
  const workspace = await getEnterpriseWorkspace(context(org,{},owner,tomorrow+1))
  assert.equal(workspace.lessonAssessments[pilot.id].finished,true)
  assert.equal(workspace.lessonDrafts.find(draft=>draft.lessonId===pilot.id).updatedAt,saved.updatedAt)
  const fresh = await answer(org,'q1','a','fresh-draft-new-answer',owner,tomorrow+2)
  assert.equal(fresh.finished,false)
  assert.equal(fresh.attemptDay,'2026-11-07')
})
