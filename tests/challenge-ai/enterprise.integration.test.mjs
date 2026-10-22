import test, { before,after } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { initializeTestEnvironment,assertFails } from '@firebase/rules-unit-testing'
import { doc,getDoc,setDoc } from 'firebase/firestore'
import { manageEnterpriseOrganization,joinEnterpriseOrganization,commitEnterpriseLearningAction,getEnterpriseWorkspace,exportEnterpriseData,deleteEnterpriseData,setEnterpriseLearningPreferences } from '../../functions/src/enterprise.mjs'
import { createEnterpriseOrganization,createEnterpriseCheckout,getEnterpriseBilling,processEnterpriseSubscriptionEvent,drainEnterpriseSeatSync } from '../../functions/src/enterpriseBilling.mjs'
const require = createRequire(new URL('../../functions/package.json',import.meta.url))
const {initializeApp,deleteApp} = require('firebase-admin/app')
const {getFirestore} = require('firebase-admin/firestore')
let app,db,environment
before(async()=>{
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('Emulator required')
  app = initializeApp({projectId:'demo-memstack-enterprise'},'enterprise-tests'); db = getFirestore(app)
  environment = await initializeTestEnvironment({projectId:'demo-memstack-enterprise',firestore:{rules:readFileSync(new URL('../../firestore.rules',import.meta.url),'utf8')}})
})
after(async()=>{if(environment) await environment.cleanup();if(app) await deleteApp(app)})
const now = Date.parse('2026-10-15T10:00:00Z')
const catalog = {version:1,lessons:[{id:'ent-first',chapterId:'chapter-one',cards:[{id:'ent-card'}]},{id:'ent-second',chapterId:'chapter-two',cards:[]}],challenges:[{id:'ent-case',title:'Une décision à vérifier',chapterId:'chapter-one',questions:Array.from({length:5},(_,index)=>({id:`q${index}`,prompt:`Quelle décision pour la situation ${index} ?`,options:[{id:'a',text:'Vérifier les informations'},{id:'b',text:'Publier sans relire'}]}))}]}
const keys = {version:1,challenges:{'ent-case':Object.fromEntries(catalog.challenges[0].questions.map(q=>[q.id,'a']))},explanations:{'ent-case':Object.fromEntries(catalog.challenges[0].questions.map(q=>[q.id,'Il faut vérifier les informations avant de les utiliser.']))}}
const preferenceCatalog = {...catalog,tracks:[{id:'ent-assistants'},{id:'ent-automation'}]}
const identity = (uid,admin=false) => ({uid,token:{firebase:{sign_in_provider:'google.com'},...(admin?{memstackAdmin:true}:{})}})
const lookup = async uid => ({email:`${uid}@example.com`,emailVerified:true,disabled:false,customClaims:{memstackAdmin:uid==='admin'}})
const context = (uid,data,admin=false) => ({db,auth:identity(uid,admin),lookup,data,now})
const act = (uid,data,date=now) => commitEnterpriseLearningAction({...context(uid,data),now:date,catalog,keys})
const action = (organizationId,type,fields={},requestId=`request-${type}-000000000`) => ({organizationId,requestId,type,...fields})
async function create(name,manager) {
  const created = await manageEnterpriseOrganization(context('admin',{action:'create',name,managerEmail:`${manager}@example.com`,requestId:`request-${manager}-${name.replaceAll(' ','-')}`},true))
  await joinEnterpriseOrganization(context(manager,{code:created.code}))
  return created.organizationId
}

test('cloud track preferences stay private per learner and organization, survive retries and respect access revocation', async () => {
  const uid = 'preferences-user'
  const first = await create('Preferences first',uid), second = await create('Preferences second',uid)
  const save = (organizationId,activeTrackId,actor=uid) => setEnterpriseLearningPreferences({...context(actor,{organizationId,activeTrackId}),catalog:preferenceCatalog})
  const read = (organizationId,actor=uid,activeCatalog=preferenceCatalog) => getEnterpriseWorkspace({...context(actor,{organizationId}),catalog:activeCatalog})
  assert.equal((await read(first)).settings,null)
  const settingsRef = db.doc(`organizations/${first}/learners/${uid}/settings/learning`)
  await settingsRef.set({futureSetting:'retained'})
  const firstResult = await save(first,'ent-assistants')
  assert.deepEqual(firstResult,{organizationId:first,settings:{activeTrackId:'ent-assistants',updatedAt:new Date(now).toISOString()}})
  assert.deepEqual(await save(first,'ent-assistants'),firstResult)
  await save(second,'ent-automation')
  assert.deepEqual((await read(first)).settings,firstResult.settings)
  assert.equal((await read(second)).settings.activeTrackId,'ent-automation')
  assert.equal((await settingsRef.get()).data().futureSetting,'retained')
  assert.equal((await db.collection(`organizations/${first}/learners/${uid}/lessons`).get()).size,0)
  assert.equal((await db.collection(`organizations/${first}/ranking`).get()).size,0)
  assert.equal((await db.doc(`users/${uid}/settings/learning`).get()).exists,false)
  await assert.rejects(save(first,'missing'),{code:'invalid-argument'})
  assert.equal((await read(first,uid,{...preferenceCatalog,tracks:[{id:'ent-automation'}]})).settings,null)
  assert.equal((await settingsRef.get()).data().activeTrackId,'ent-assistants')
  await assert.rejects(save(first,'ent-assistants','preferences-stranger'),{code:'permission-denied'})
  const invitation = await manageEnterpriseOrganization(context(uid,{action:'invite',organizationId:first,email:'preferences-colleague@example.com'}))
  await joinEnterpriseOrganization(context('preferences-colleague',{code:invitation.code}))
  assert.equal((await read(first,'preferences-colleague')).settings,null)
  await save(first,'ent-automation','preferences-colleague')
  assert.equal((await read(first)).settings.activeTrackId,'ent-assistants')
  await manageEnterpriseOrganization(context(uid,{action:'revoke',organizationId:first,uid:'preferences-colleague'}))
  await assert.rejects(save(first,'ent-assistants','preferences-colleague'),{code:'permission-denied'})
  await assert.rejects(read(first,'preferences-colleague'),{code:'permission-denied'})
  const browser = environment.authenticatedContext(uid).firestore()
  await assertFails(getDoc(doc(browser,settingsRef.path)))
  await assertFails(setDoc(doc(browser,settingsRef.path),{activeTrackId:'ent-automation'}))
  const exported = await exportEnterpriseData(db,uid)
  assert.equal(exported.find(row=>row.organizationId===first).collections.find(row=>row.name==='settings').rows[0].activeTrackId,'ent-assistants')
  await db.doc(`organizations/${first}`).update({enabled:false})
  await assert.rejects(save(first,'ent-assistants'),{code:'permission-denied'})
  await db.doc(`organizations/${first}`).update({enabled:true})
  await db.doc(`_accountLifecycle/${uid}`).set({status:'deleting'})
  await assert.rejects(save(first,'ent-assistants'),{code:'permission-denied'})
  await deleteEnterpriseData(db,uid)
  assert.equal((await settingsRef.get()).exists,false)
  assert.equal((await db.doc(`organizations/${second}/learners/${uid}/settings/learning`).get()).exists,false)
  assert.equal((await db.doc(`organizations/${first}/learners/preferences-colleague/settings/learning`).get()).exists,true)
})

test('independent learning paths enforce real foundation and branch prerequisites in server transactions', async () => {
  const organizationId = await create('Paths organization', 'paths-member')
  const pathCatalog = {
    version: 2,
    foundationLessonIds: ['ent-foundation'],
    lessons: [
      { id: 'ent-foundation', chapterId: 'foundation', cards: [] },
      { id: 'ent-path-a', chapterId: 'path-a', cards: [], prerequisiteLessonIds: ['ent-foundation'] },
      { id: 'ent-path-b', chapterId: 'path-b', cards: [], prerequisiteLessonIds: ['ent-foundation'] },
      { id: 'ent-path-a-finish', chapterId: 'path-a', cards: [], prerequisiteLessonIds: ['ent-path-a'] },
    ],
    challenges: [{ ...catalog.challenges[0], prerequisiteLessonIds: ['ent-path-a', 'ent-path-a-finish'] }],
  }
  const pathKeys = { ...keys, version: 2 }
  const submit = data => commitEnterpriseLearningAction({ ...context('paths-member', data), catalog: pathCatalog, keys: pathKeys })
  const lesson = lessonId => action(organizationId, 'lesson', { lessonId }, `request-paths-${lessonId}`)
  await assert.rejects(submit(lesson('ent-path-b')), { code: 'failed-precondition' })
  await submit(lesson('ent-foundation'))
  // A future or malformed completion cannot unlock a branch.
  const foundationRef = db.doc(`organizations/${organizationId}/learners/paths-member/lessons/ent-foundation`)
  for (const completedAt of ['invalid', new Date(now + 86400000).toISOString()]) {
    await foundationRef.set({ completedAt })
    await assert.rejects(submit(lesson('ent-path-b')), { code: 'failed-precondition' })
  }
  await foundationRef.set({ completedAt: new Date(now).toISOString() })
  await submit(lesson('ent-path-b'))
  await assert.rejects(submit(lesson('ent-path-a-finish')), { code: 'failed-precondition' })
  const challenge = action(organizationId, 'challenge', { challengeId: 'ent-case', catalogVersion: 2, answers: keys.challenges['ent-case'] }, 'request-paths-assessment')
  await assert.rejects(submit(challenge), { code: 'failed-precondition' })
  await submit(lesson('ent-path-a'))
  await submit(lesson('ent-path-a-finish'))
  assert.equal((await submit(challenge)).passed, true)
  assert.equal((await db.collection(`organizations/${organizationId}/learners/paths-member/lessons`).get()).size, 4)
})

test('only current administrators provision pilots; invitations are email-bound, expiring and one-use',async()=>{
  await assert.rejects(manageEnterpriseOrganization(context('intruder',{action:'create',name:'Forged',managerEmail:'intruder@example.com',requestId:'request-forged-admin'},true)),{code:'permission-denied'})
  const createRequest = {action:'create',name:'Invitation pilot',managerEmail:'invite-manager@example.com',requestId:'request-invitation-pilot'}
  const lostAcknowledgement = await manageEnterpriseOrganization(context('admin',createRequest,true))
  const created = await manageEnterpriseOrganization(context('admin',createRequest,true))
  assert.equal(created.organizationId,lostAcknowledgement.organizationId)
  assert.notEqual(created.code,lostAcknowledgement.code)
  await assert.rejects(joinEnterpriseOrganization(context('invite-manager',{code:lostAcknowledgement.code})),{code:'permission-denied'})
  await assert.rejects(joinEnterpriseOrganization(context('other',{code:created.code})),{code:'permission-denied'})
  await assert.rejects(joinEnterpriseOrganization({...context('invite-manager',{code:created.code}),now:now+8*86400000}),{code:'permission-denied'})
  await joinEnterpriseOrganization(context('invite-manager',{code:created.code}))
  await assert.rejects(joinEnterpriseOrganization(context('invite-manager',{code:created.code})),{code:'permission-denied'})
  assert.equal((await db.collection('_enterpriseInvitations').get()).docs.some(row=>row.id===created.code),false)
  assert.equal((await getEnterpriseWorkspace(context('invite-manager',{}))).organization.id,created.organizationId)
})

test('two organizations and developer progress stay isolated; server orders lessons and schedules future cards',async()=>{
  const first = await create('First organization','dual-user'),second = await create('Second organization','dual-user')
  await db.doc('users/dual-user/lessons/ent-first').set({completedAt:new Date(now).toISOString()})
  await assert.rejects(act('dual-user',action(first,'lesson',{lessonId:'ent-second'})),{code:'failed-precondition'})
  const completed = action(first,'lesson',{lessonId:'ent-first'})
  await Promise.all([act('dual-user',completed),act('dual-user',completed)])
  assert.equal((await db.collection(`organizations/${first}/learners/dual-user/lessons`).get()).size,1)
  assert.equal((await db.collection('_worldRanking').get()).size,0)
  const a = await getEnterpriseWorkspace(context('dual-user',{organizationId:first})),b = await getEnterpriseWorkspace(context('dual-user',{organizationId:second}))
  assert.equal(Object.keys(a.progress.lessons).length,1); assert.equal(Object.keys(b.progress.lessons).length,0)
  assert.equal(a.ranking[0].streak,1); assert.equal(b.ranking.length,0)
  assert.equal(a.ranking[0].alias.includes('@'),false)
  for (const alias of ['Équipe Violette','Camille','Camille Dev']) await manageEnterpriseOrganization(context('dual-user',{action:'myAlias',organizationId:first,alias}))
  await assert.rejects(manageEnterpriseOrganization(context('dual-user',{action:'myAlias',organizationId:first,alias:'Encore'})),{code:'resource-exhausted'})
  await assert.rejects(manageEnterpriseOrganization(context('dual-user',{action:'myAlias',organizationId:second,alias:'person@example.com'})),{code:'invalid-argument'})
  const renamed = await getEnterpriseWorkspace(context('dual-user',{organizationId:first}))
  assert.equal(renamed.ranking[0].alias,'Camille Dev');assert.equal(renamed.ranking[0].streak,1)
  assert.notEqual((await db.doc(`organizations/${second}/members/dual-user`).get()).data().alias,'Camille Dev')
  await act('dual-user',{...completed,requestId:'request-old-lesson-nextday'},now+86400000)
  assert.equal((await db.doc(`organizations/${first}/ranking/dual-user`).get()).data().lastDay,'2026-10-15')
  const card = action(first,'card',{cardId:'ent-card',rating:'recalled'},'request-card-first-000')
  const result = await act('dual-user',card)
  assert.equal(result.event.kind,'new'); assert.ok(Date.parse(result.card.dueAt)>now)
  await assert.rejects(act('dual-user',{...card,requestId:'request-card-future-000'}),{code:'failed-precondition'})
  await assert.rejects(act('dual-user',{...completed,type:'lesson',lessonId:'ent-second'}),{code:'already-exists'})
  await assert.rejects(act('dual-user',action(first,'card',{cardId:'docker-card',rating:'recalled'})),{code:'invalid-argument'})
  await assert.rejects(getEnterpriseWorkspace(context('stranger',{organizationId:first})),{code:'permission-denied'})
})

test('challenge verdicts are deterministic, private keys remain server-side and revoked memberships block cached receipts',async()=>{
  const org = await create('Challenge organization','case-manager')
  const invitation = await manageEnterpriseOrganization(context('case-manager',{action:'invite',organizationId:org,email:'case-user@example.com'}))
  await joinEnterpriseOrganization(context('case-user',{code:invitation.code}))
  const answers = Object.fromEntries(catalog.challenges[0].questions.map(q=>[q.id,'a']))
  const attempt = action(org,'challenge',{challengeId:'ent-case',answers,catalogVersion:1},'request-challenge-first')
  await assert.rejects(act('case-user',attempt),{code:'failed-precondition'})
  await act('case-user',action(org,'lesson',{lessonId:'ent-first'}))
  const result = await act('case-user',attempt); assert.equal(result.passed,true);assert.equal(result.correct,5)
  assert.equal(result.catalogVersion,1);assert.equal(result.assessmentVersion,1)
  assert.equal(result.checks[0].explanation,keys.explanations['ent-case'].q0)
  assert.equal(result.checks[0].questionText,catalog.challenges[0].questions[0].prompt)
  assert.equal(result.checks[0].correctAnswerText,'Vérifier les informations')
  const changed = {...catalog,version:2,challenges:catalog.challenges.map(row=>({...row,title:'Titre modifié'}))}
  const repeated = await commitEnterpriseLearningAction({...context('case-user',attempt),catalog:changed,keys:{...keys,version:2}})
  assert.deepEqual(repeated,result)
  await assert.rejects(commitEnterpriseLearningAction({...context('case-user',{...attempt,requestId:'request-old-tab-version'}),catalog:changed,keys:{...keys,version:2}}),{code:'failed-precondition'})
  const retry = await act('case-user',{...attempt,requestId:'request-challenge-retry',answers:{...answers,q0:'b',q1:'b'}})
  assert.equal(retry.passed,false);assert.equal(retry.correct,3)
  await assert.rejects(manageEnterpriseOrganization(context('case-user',{action:'invite',organizationId:org,email:'outsider@example.com'})),{code:'permission-denied'})
  const before = await getEnterpriseWorkspace(context('case-manager',{organizationId:org}))
  const learner = before.members.find(row=>row.uid==='case-user')
  assert.deepEqual(learner.summary,{lessons:1,cards:0,attempts:2})
  const unusedInvitation = await manageEnterpriseOrganization(context('case-manager',{action:'invite',organizationId:org,email:'case-user@example.com'}))
  await manageEnterpriseOrganization(context('case-manager',{action:'revoke',organizationId:org,uid:'case-user'}))
  await assert.rejects(joinEnterpriseOrganization(context('case-user',{code:unusedInvitation.code})),{code:'permission-denied'})
  await assert.rejects(act('case-user',attempt),{code:'permission-denied'})
  await assert.rejects(getEnterpriseWorkspace(context('case-user',{organizationId:org})),{code:'permission-denied'})
  assert.equal((await getEnterpriseWorkspace(context('case-manager',{organizationId:org}))).ranking.some(row=>row.alias===learner.alias),false)
})

test('disabled organizations and account deletion deny reads/writes, export and cleanup cover private enterprise progress',async()=>{
  const org = await create('Lifecycle organization','lifecycle-user')
  const completed = action(org,'lesson',{lessonId:'ent-first'})
  await act('lifecycle-user',completed)
  const exported = await exportEnterpriseData(db,'lifecycle-user')
  assert.equal(exported[0].collections.find(row=>row.name==='lessons').rows.length,1)
  await manageEnterpriseOrganization(context('admin',{action:'enable',organizationId:org,enabled:false},true))
  await assert.rejects(act('lifecycle-user',completed),{code:'permission-denied'})
  await assert.rejects(getEnterpriseWorkspace(context('lifecycle-user',{organizationId:org})),{code:'permission-denied'})
  await manageEnterpriseOrganization(context('admin',{action:'enable',organizationId:org,enabled:true},true))
  await db.doc('_accountLifecycle/lifecycle-user').set({status:'deleting'})
  await assert.rejects(act('lifecycle-user',completed),{code:'permission-denied'})
  await deleteEnterpriseData(db,'lifecycle-user')
  assert.equal((await db.collection(`organizations/${org}/learners/lifecycle-user/lessons`).get()).size,0)
  assert.equal((await db.doc(`organizations/${org}/members/lifecycle-user`).get()).exists,false)
  assert.equal((await db.collection('_enterpriseInvitations').where('usedBy','==','lifecycle-user').get()).size,0)
  assert.equal((await db.doc(`organizations/${org}`).get()).data().enabled,false)
  await assert.rejects(manageEnterpriseOrganization(context('intruder',{action:'inviteManager',organizationId:org,email:'successor@example.com'})),{code:'permission-denied'})
  const recovery = await manageEnterpriseOrganization(context('admin',{action:'inviteManager',organizationId:org,email:'successor@example.com'},true))
  await assert.rejects(joinEnterpriseOrganization(context('successor',{code:recovery.code})),{code:'permission-denied'})
  await manageEnterpriseOrganization(context('admin',{action:'enable',organizationId:org,enabled:true},true))
  await joinEnterpriseOrganization(context('successor',{code:recovery.code}))
  assert.equal((await getEnterpriseWorkspace(context('successor',{organizationId:org}))).organization.role,'manager')
})

test('Firestore clients cannot forge memberships, read organization progress or alter ranking even with a claimed manager role',async()=>{
  const client = environment.authenticatedContext('dual-user',{firebase:{sign_in_provider:'google.com'},memstackAdmin:true,role:'manager'}).firestore()
  await assertFails(setDoc(doc(client,'organizations/forged/members/dual-user'),{active:true,role:'manager'}))
  await assertFails(setDoc(doc(client,'users/dual-user/enterpriseMemberships/forged'),{active:true}))
  await assertFails(getDoc(doc(client,'organizations/forged/learners/dual-user/lessons/ent-first')))
  await assertFails(setDoc(doc(client,'organizations/forged/ranking/dual-user'),{streak:999}))
  await assertFails(getDoc(doc(client,'_enterpriseInvitations/code')))
})

test('administrator invitations promote an existing learner without a new seat or resetting progress; ordinary invitations cannot change roles',async()=>{
  const org = await create('Promotion organization','promotion-owner')
  const invitation = await manageEnterpriseOrganization(context('promotion-owner',{action:'invite',organizationId:org,email:'promotion-user@example.com'}))
  await joinEnterpriseOrganization(context('promotion-user',{code:invitation.code}))
  await act('promotion-user',action(org,'lesson',{lessonId:'ent-first'}))
  const memberRef = db.doc(`organizations/${org}/members/promotion-user`)
  const before = (await memberRef.get()).data()
  const rankBefore = (await db.doc(`organizations/${org}/ranking/promotion-user`).get()).data()
  await db.doc(`organizations/${org}`).update({seatLimit:2})
  const ordinary = await manageEnterpriseOrganization(context('promotion-owner',{action:'invite',organizationId:org,email:'promotion-user@example.com'}))
  await assert.rejects(joinEnterpriseOrganization(context('promotion-user',{code:ordinary.code})),{code:'already-exists'})
  assert.equal((await memberRef.get()).data().role,'learner')
  const promotion = await manageEnterpriseOrganization(context('admin',{action:'inviteManager',organizationId:org,email:'promotion-user@example.com'},true))
  await assert.rejects(joinEnterpriseOrganization(context('promotion-user',{code:promotion.code,role:'manager'})),{code:'invalid-argument'})
  await joinEnterpriseOrganization({...context('promotion-user',{code:promotion.code}),now:now+1000})
  assert.deepEqual((await memberRef.get()).data(),{...before,role:'manager'})
  assert.deepEqual((await db.doc(`organizations/${org}/ranking/promotion-user`).get()).data(),rankBefore)
  assert.equal((await getEnterpriseWorkspace(context('promotion-user',{organizationId:org}))).progress.lessons['ent-first'].completedAt,new Date(now).toISOString())
  assert.equal((await db.collection(`organizations/${org}/members`).get()).size,2)
  const alreadyManager = await manageEnterpriseOrganization(context('admin',{action:'inviteManager',organizationId:org,email:'promotion-user@example.com'},true))
  await assert.rejects(joinEnterpriseOrganization(context('promotion-user',{code:alreadyManager.code})),{code:'already-exists'})
})

test('paid organization access and automatic member quantities stay separate from consumer Premium, including invitations, revocation and deletion',async()=>{
  const config={enabled:true,liveMode:false,priceId:'price_organizationTest',unitAmount:1000,interval:'month',taxBehavior:'inclusive'}
  const price={id:config.priceId,active:true,livemode:false,currency:'eur',unit_amount:1000,tax_behavior:'inclusive',type:'recurring',billing_scheme:'per_unit',recurring:{interval:'month',interval_count:1,usage_type:'licensed'}}
  let providerSubscription=null,customer=null,createdCustomers=0,checkouts=[]
  const stripe={prices:{retrieve:async()=>price},customers:{create:async data=>{createdCustomers++;customer={id:'cus_organizationTest',livemode:false,...data};return customer},retrieve:async()=>customer},
    subscriptions:{list:async()=>({has_more:false,data:providerSubscription?[providerSubscription]:[]}),retrieve:async()=>structuredClone(providerSubscription),update:async(id,data)=>{providerSubscription.items.data[0].quantity=data.items[0].quantity;return structuredClone(providerSubscription)},cancel:async()=>{providerSubscription.status='canceled';return structuredClone(providerSubscription)}},
    checkout:{sessions:{create:async(data,options)=>{checkouts.push({...data,idempotencyKey:options.idempotencyKey});return {url:'https://checkout.stripe.com/test_organization'}}}}}
  const creation={name:'Automatic licensed organization',requestId:'request-billing-org-create'}
  const created=await createEnterpriseOrganization({...context('billing-manager',creation),config})
  assert.deepEqual(await createEnterpriseOrganization({...context('billing-manager',creation),config}),created)
  const organizationId=created.organizationId
  assert.equal((await getEnterpriseWorkspace(context('billing-manager',{organizationId}))).organization.learningEnabled,false)
  await assert.rejects(act('billing-manager',action(organizationId,'lesson',{lessonId:'ent-first'})),{code:'permission-denied'})
  await assert.rejects(manageEnterpriseOrganization(context('billing-manager',{action:'invite',organizationId,email:'billing-learner@example.com'})),{code:'permission-denied'})
  assert.equal((await getEnterpriseBilling({...context('billing-manager',{organizationId}),config})).activeMembers,1)
  await createEnterpriseCheckout({...context('billing-manager',{organizationId,requestId:'request-billing-checkout'}),config,stripe})
  await createEnterpriseCheckout({...context('billing-manager',{organizationId,requestId:'request-billing-checkout'}),config,stripe})
  assert.equal(createdCustomers,1);assert.equal(checkouts[0].line_items[0].quantity,1)
  assert.match(checkouts[0].success_url,new RegExp(`org=${organizationId}`))
  providerSubscription={id:'sub_organizationTest',customer:customer.id,livemode:false,metadata:{memstackOrganizationId:organizationId},status:'active',latest_invoice:{status:'paid'},items:{data:[{id:'si_organizationTest',quantity:1,price,current_period_end:Math.floor(now/1000)+30*86400}]}}
  const event={id:'evt_organizationPaid',type:'invoice.paid',livemode:false,created:Math.floor(now/1000),data:{object:{subscription:providerSubscription.id}}}
  await processEnterpriseSubscriptionEvent({db,stripe,event,config,now})
  assert.equal((await getEnterpriseWorkspace(context('billing-manager',{organizationId}))).organization.learningEnabled,true)
  assert.equal((await db.doc('users/billing-manager/settings/subscription').get()).exists,false)
  assert.equal((await db.doc(`_enterpriseSeatSync/${organizationId}`).get()).exists,false)
  const invitation=await manageEnterpriseOrganization(context('billing-manager',{action:'invite',organizationId,email:'billing-learner@example.com'}))
  assert.equal((await db.doc(`_enterpriseSeatSync/${organizationId}`).get()).exists,false)
  await joinEnterpriseOrganization(context('billing-learner',{code:invitation.code}))
  assert.equal((await db.doc(`_enterpriseSeatSync/${organizationId}`).get()).data().desiredQuantity,2)
  await drainEnterpriseSeatSync({db,stripe,organizationId,config,now})
  assert.equal(providerSubscription.items.data[0].quantity,2)
  await manageEnterpriseOrganization(context('billing-manager',{action:'revoke',organizationId,uid:'billing-learner'}))
  await drainEnterpriseSeatSync({db,stripe,organizationId,config,now})
  assert.equal(providerSubscription.items.data[0].quantity,1)
  await assert.rejects(act('billing-learner',action(organizationId,'lesson',{lessonId:'ent-first'})),{code:'permission-denied'})
  await deleteEnterpriseData(db,'billing-manager','billing-manager@example.com')
  assert.equal((await db.doc(`_enterpriseSeatSync/${organizationId}`).get()).data().desiredQuantity,0)
  await drainEnterpriseSeatSync({db,stripe,organizationId,config,now})
  assert.equal(providerSubscription.status,'canceled')
  assert.equal((await db.doc(`organizations/${organizationId}`).get()).data().enabled,false)
  const recovery=await manageEnterpriseOrganization(context('admin',{action:'inviteManager',organizationId,email:'billing-successor@example.com'},true))
  await manageEnterpriseOrganization(context('admin',{action:'enable',organizationId,enabled:true},true))
  await joinEnterpriseOrganization(context('billing-successor',{code:recovery.code}))
  assert.equal((await getEnterpriseWorkspace(context('billing-successor',{organizationId}))).organization.learningEnabled,false)
  await createEnterpriseCheckout({...context('billing-successor',{organizationId,requestId:'request-billing-resubscribe'}),config,stripe})
  assert.equal(createdCustomers,1)
  assert.equal(checkouts[0].idempotencyKey,checkouts[1].idempotencyKey)
  assert.notEqual(checkouts[2].idempotencyKey,checkouts[0].idempotencyKey)
})
