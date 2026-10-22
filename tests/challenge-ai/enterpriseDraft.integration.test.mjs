import test, { before,after } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { initializeTestEnvironment,assertFails } from '@firebase/rules-unit-testing'
import { doc,getDoc,setDoc,deleteDoc } from 'firebase/firestore'
import { getEnterpriseLessonDraft,saveEnterpriseLessonDraft,getEnterpriseWorkspace,commitEnterpriseLearningAction,exportEnterpriseData,deleteEnterpriseData } from '../../functions/src/enterprise.mjs'
import { enterpriseDraftContentVersion,ENTERPRISE_DRAFT_LIFETIME } from '../../functions/src/enterpriseDraft.mjs'

const require = createRequire(new URL('../../functions/package.json',import.meta.url))
const {initializeApp,deleteApp} = require('firebase-admin/app')
const {getFirestore} = require('firebase-admin/firestore')
let app,db,environment
before(async()=>{
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Emulator required')
  app = initializeApp({projectId:'demo-memstack-enterprise-drafts'},'enterprise-draft-tests')
  db = getFirestore(app)
  environment = await initializeTestEnvironment({projectId:'demo-memstack-enterprise-drafts',firestore:{rules:readFileSync(new URL('../../firestore.rules',import.meta.url),'utf8')}})
})
after(async()=>{if(environment) await environment.cleanup();if(app) await deleteApp(app)})
const now = Date.parse('2026-10-22T10:00:00Z')
const lesson = {id:'ent-plausible-not-proven',title:'Cas fictif',prerequisiteLessonIds:[],cards:[],steps:[
  {id:'intro',type:'message',text:'Le cas fictif'},
  {id:'practice',type:'message',text:'Pratique · Prépare ta réponse.'},
  {id:'q1',type:'question',correctOptionId:'a',options:[{id:'a'},{id:'b'}]},
  {id:'q2',type:'question',correctOptionId:'b',options:[{id:'a'},{id:'b'}]},
  {id:'end',type:'message',text:'Bilan'},
]}
const practice = {scenario:'Pièces fictives',task:'Prépare une réponse au client.'}
const catalog = {version:2,tracks:[],lessons:[lesson,{...lesson,id:'ent-second',prerequisiteLessonIds:[lesson.id]}],challenges:[]}
const practices = {[lesson.id]:practice,'ent-second':practice}
const owner = 'draft-owner', manager = 'draft-manager'
const lookup = async uid=>({email:`${uid}@example.com`,emailVerified:true,disabled:false})
const context = (organizationId,uid=owner,data={},date=now,activeCatalog=catalog,activePractices=practices) => ({db,auth:{uid,token:{firebase:{sign_in_provider:'google.com'}}},lookup,data:{organizationId,...data},catalog:activeCatalog,practices:activePractices,now:date})
const state = (draft='Production privée fictive') => ({stepId:'q1',answers:{q1:'b'},checkedIds:['q1'],draft,practiceAnswers:{delay:'contradicted',fees:'contradicted',reference:'unverified'}})
const mutation = (revision=0,mutationId='draft-mutation-initial',value=state()) => ({lessonId:lesson.id,contentVersion:enterpriseDraftContentVersion(lesson,practice),expectedRevision:revision,mutationId,state:value})
const save = (org,data,uid=owner,date=now) => saveEnterpriseLessonDraft(context(org,uid,data,date))
const read = (org,uid=owner,date=now,activeCatalog=catalog,activePractices=practices) => getEnterpriseLessonDraft(context(org,uid,{lessonId:lesson.id},date,activeCatalog,activePractices))
const ref = (org,uid=owner) => db.doc(`organizations/${org}/learners/${uid}/lessonDrafts/${lesson.id}`)
async function seed(org) {
  await db.doc(`organizations/${org}`).set({enabled:true,name:org,offer:'managed-pilot',seatLimit:20})
  for (const [uid,role] of [[owner,'learner'],[manager,'manager']]) {
    await db.doc(`organizations/${org}/members/${uid}`).set({active:true,role,alias:uid})
    await db.doc(`users/${uid}/enterpriseMemberships/${org}`).set({organizationId:org,active:true})
  }
}

test('draft CAS, duplicate acknowledgements and clear tombstones never overwrite a newer production',async()=>{
  const org = 'draft-cas'
  await seed(org)
  assert.equal((await read(org)).revision,0)
  const first = mutation()
  const [one,two] = await Promise.all([save(org,first),save(org,first)])
  assert.deepEqual(one,two)
  assert.equal(one.revision,1)
  assert.equal((await db.doc(`organizations/${org}/learners/${owner}/limits/lessonDrafts`).get()).data().count,1)
  await assert.rejects(save(org,{...first,state:state('Payload remplacé')}),{code:'already-exists'})
  const concurrent = await Promise.allSettled([
    save(org,mutation(1,'draft-concurrent-a',state('Production A'))),
    save(org,mutation(1,'draft-concurrent-b',state('Production B'))),
  ])
  assert.equal(concurrent.filter(result=>result.status==='fulfilled').length,1)
  assert.equal(concurrent.find(result=>result.status==='rejected').reason.code,'failed-precondition')
  assert.equal((await read(org)).revision,2)
  const clear = mutation(2,'draft-clear-mutation',null)
  const cleared = await save(org,clear)
  assert.equal(cleared.state,null)
  assert.equal(cleared.revision,3)
  assert.deepEqual(await save(org,clear),cleared)
  await assert.rejects(save(org,first),{code:'failed-precondition'})
  assert.equal(JSON.stringify((await ref(org).get()).data()).includes('Production'),false)
  await save(org,mutation(3,'draft-after-clear-new',state('Nouvelle production')))
  await assert.rejects(save(org,clear),{code:'failed-precondition'})
  assert.equal((await read(org)).state.draft,'Nouvelle production')
  const budgetRef = db.doc(`organizations/${org}/learners/${owner}/limits/lessonDrafts`)
  await budgetRef.set({window:now,count:120})
  await assert.rejects(save(org,mutation(4,'draft-budget-exhausted')),{code:'resource-exhausted'})
  assert.equal((await read(org)).revision,4)
  assert.equal((await save(org,mutation(3,'draft-after-clear-new',state('Nouvelle production')))).revision,4)
})

test('workspace exposes only valid summaries and purges incompatible or expired production opportunistically',async()=>{
  const org = 'draft-expiry'
  await seed(org)
  await save(org,mutation())
  const workspace = await getEnterpriseWorkspace(context(org))
  assert.equal(workspace.lessonDrafts[0].stepId,'q1')
  assert.equal(Object.hasOwn(workspace.lessonDrafts[0],'state'),false)
  assert.equal(JSON.stringify(workspace).includes('Production privée fictive'),false)
  const changedCatalog = {...catalog,lessons:[{...lesson,title:'Contenu modifié'},catalog.lessons[1]]}
  const changed = await read(org,owner,now,changedCatalog)
  assert.equal(changed.notice,'content-changed')
  assert.equal(changed.state,null)
  assert.equal(changed.revision,2)
  assert.equal(Object.hasOwn((await ref(org).get()).data(),'lastMutationId'),false)
  await save(org,mutation(2,'draft-activity-version'))
  const changedPractice = {[lesson.id]:{...practice,task:'Consigne modifiée uniquement'}}
  const activityChanged = await read(org,owner,now,catalog,changedPractice)
  assert.equal(activityChanged.notice,'content-changed')
  assert.equal(activityChanged.revision,4)
  const latest = mutation(4,'draft-expiration-save')
  await save(org,latest)
  await assert.rejects(save(org,latest,owner,now+ENTERPRISE_DRAFT_LIFETIME),{code:'failed-precondition'})
  const expired = await read(org,owner,now+ENTERPRISE_DRAFT_LIFETIME)
  assert.equal(expired.notice,'expired')
  assert.equal(expired.revision,6)
  assert.equal(expired.state,null)
  assert.equal((await getEnterpriseWorkspace(context(org,owner,{},now+ENTERPRISE_DRAFT_LIFETIME))).lessonDrafts.length,0)
  assert.equal(JSON.stringify((await ref(org).get()).data()).includes('Production privée fictive'),false)
  // A malformed or incompatible saved step cannot produce an invalid resume CTA.
  await ref(org).set({...expired,state:{...state(),stepId:'missing'},expiresAt:new Date(now+1000).toISOString()})
  assert.equal((await getEnterpriseWorkspace(context(org))).lessonDrafts.length,0)
  assert.equal((await read(org)).state,null)
})

test('lesson completion and draft writes serialize, then completed missions reject all late saves and retries',async()=>{
  const org = 'draft-completion'
  await seed(org)
  await save(org,mutation())
  const late = mutation(1,'draft-concurrent-completion',state('Texte concurrent'))
  const completion = commitEnterpriseLearningAction({...context(org,owner,{type:'lesson',lessonId:lesson.id,requestId:'draft-complete-request'}),keys:{version:2}})
  const outcomes = await Promise.allSettled([completion,save(org,late)])
  assert.equal(outcomes[0].status,'fulfilled')
  assert.equal((await ref(org).get()).data().state,null)
  await assert.rejects(save(org,late),{code:'failed-precondition'})
  const completed = await read(org)
  assert.equal(completed.notice,'completed')
  assert.equal(completed.state,null)
  assert.equal((await getEnterpriseWorkspace(context(org))).lessonDrafts.length,0)
  assert.equal(JSON.stringify((await ref(org).get()).data()).includes('Texte concurrent'),false)
})

test('drafts remain owner-only across accounts and organizations, enforce prerequisites and export/delete with the account',async()=>{
  const first = 'draft-private-first', second = 'draft-private-second'
  await seed(first); await seed(second)
  await save(first,mutation())
  await save(second,mutation(0,'draft-second-org-write',state('Autre organisation')))
  assert.equal((await read(first,manager)).state,null)
  assert.equal((await read(second)).state.draft,'Autre organisation')
  assert.equal(JSON.stringify(await getEnterpriseWorkspace(context(first,manager))).includes('Production privée fictive'),false)
  await assert.rejects(getEnterpriseLessonDraft(context(first,manager,{lessonId:lesson.id,uid:owner})),{code:'invalid-argument'})
  const secondLesson = catalog.lessons[1]
  await assert.rejects(save(first,{...mutation(),lessonId:secondLesson.id,contentVersion:enterpriseDraftContentVersion(secondLesson,practice),state:{...state(),practiceAnswers:{}}}),{code:'failed-precondition'})
  const browser = environment.authenticatedContext(owner).firestore()
  await assertFails(getDoc(doc(browser,ref(first).path)))
  await assertFails(setDoc(doc(browser,ref(first).path),{state:state()}))
  await assertFails(deleteDoc(doc(browser,ref(first).path)))
  const managerBrowser = environment.authenticatedContext(manager,{enterpriseManager:true}).firestore()
  await assertFails(getDoc(doc(managerBrowser,ref(first).path)))
  await assertFails(setDoc(doc(managerBrowser,ref(first).path),{state:state()}))
  await assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(),ref(first).path)))
  for (const current of [
    async uid=>({...await lookup(uid),disabled:true}),
    async uid=>({...await lookup(uid),emailVerified:false}),
  ]) {
    await assert.rejects(getEnterpriseLessonDraft({...context(first,owner,{lessonId:lesson.id}),lookup:current}),{code:'permission-denied'})
    await assert.rejects(saveEnterpriseLessonDraft({...context(first,owner,mutation()),lookup:current}),{code:'permission-denied'})
  }
  await db.doc(`organizations/${first}/members/${owner}`).update({active:false})
  await assert.rejects(read(first),{code:'permission-denied'})
  await assert.rejects(save(first,mutation()),{code:'permission-denied'})
  await db.doc(`organizations/${first}/members/${owner}`).update({active:true})
  await db.doc(`organizations/${first}`).update({enabled:false})
  await assert.rejects(read(first),{code:'permission-denied'})
  await db.doc(`organizations/${first}`).update({enabled:true})
  await db.doc(`organizations/${first}`).update({offer:'stripe-enterprise',entitlement:{status:'inactive',seatLimit:20,paidUntil:null}})
  await assert.rejects(read(first),{code:'permission-denied'})
  await assert.rejects(save(first,mutation()),{code:'permission-denied'})
  await db.doc(`organizations/${first}`).update({offer:'managed-pilot'})
  const exported = await exportEnterpriseData(db,owner)
  assert.equal(exported.find(row=>row.organizationId===first).collections.find(row=>row.name==='lessonDrafts').rows[0].state.draft,'Production privée fictive')
  await save(first,mutation(0,'draft-manager-own-note',state('Production responsable')),manager)
  await save(second,mutation(0,'draft-manager-second',state('Responsable seconde organisation')),manager)
  assert.equal((await read(first)).state.draft,'Production privée fictive')
  assert.equal((await read(first,manager)).state.draft,'Production responsable')
  assert.equal((await read(second)).state.draft,'Autre organisation')
  assert.equal((await read(second,manager)).state.draft,'Responsable seconde organisation')
  await db.doc(`_accountLifecycle/${owner}`).set({status:'deleting'})
  await assert.rejects(save(first,mutation()),{code:'permission-denied'})
  await deleteEnterpriseData(db,owner)
  assert.equal((await ref(first).get()).exists,false)
  assert.equal((await ref(second).get()).exists,false)
  assert.equal((await ref(first,manager).get()).data().state.draft,'Production responsable')
})
