import test from 'node:test'
import assert from 'node:assert/strict'
import { ENTERPRISE_DRAFT_LIFETIME, enterpriseDraftContentVersion, enterpriseDraftMutationHash, enterpriseDraftTombstone, resolveEnterpriseDraft, validateEnterpriseDraftRequest, validateEnterpriseDraftState } from './enterpriseDraft.mjs'

const lesson = {
  id:'ent-plausible-not-proven',steps:[
    {id:'intro',type:'message',text:'Le cas fictif'},
    {id:'practice',type:'message',text:'Pratique · Prépare ta réponse.'},
    {id:'q1',type:'question',correctOptionId:'a',options:[{id:'a'},{id:'b'}]},
    {id:'q2',type:'question',correctOptionId:'b',options:[{id:'a'},{id:'b'}]},
    {id:'end',type:'message',text:'Bilan'},
  ],
}
const practice = {task:'Une réponse fictive à préparer'}
const state = () => ({stepId:'q1',answers:{q1:'b'},checkedIds:['q1'],draft:'Une proposition fictive',practiceAnswers:{delay:'contradicted'}})
const contentVersion = enterpriseDraftContentVersion(lesson,practice)
const now = Date.parse('2026-10-22T10:00:00Z')
const context = {organizationId:'org-one',lesson,contentVersion,now}
const saved = () => ({revision:4,contentVersion,state:state(),updatedAt:new Date(now).toISOString(),expiresAt:new Date(now+ENTERPRISE_DRAFT_LIFETIME).toISOString(),lastMutationId:'mutation-123456789'})

test('draft state restores current errors but rejects skipped, future and invented question history', () => {
  assert.deepEqual(validateEnterpriseDraftState(state(),lesson),state())
  const end = {...state(),stepId:'end',answers:{q1:'a',q2:'b'},checkedIds:['q1','q2']}
  assert.deepEqual(validateEnterpriseDraftState(end,lesson),end)
  for (const patch of [
    {stepId:'unknown'}, {answers:{q1:'missing'}}, {answers:{q2:'b'}}, {checkedIds:['q2']},
    {checkedIds:['q1','q1']}, {stepId:'q2'}, {stepId:'q2',answers:{q1:'a'},checkedIds:[]},
    {stepId:'intro'}, {practiceAnswers:{delay:'guessed'}}, {practiceAnswers:{secret:'supported'}},
    {draft:'a'.repeat(5001)}, {draft:'🧠'.repeat(2500),extra:'ignored'}, {answers:[]}, {checkedIds:['q1'],note:'unexpected'},
  ]) assert.throws(()=>validateEnterpriseDraftState({...state(),...patch},lesson),{code:'invalid-argument'})
  assert.throws(()=>validateEnterpriseDraftState(state(),{...lesson,id:'ent-other'}),{code:'invalid-argument'})
  assert.throws(()=>validateEnterpriseDraftState(null,lesson),{code:'invalid-argument'})
})

test('content fingerprints cover both lesson and standalone activity, with no identity dependence', () => {
  assert.notEqual(contentVersion,enterpriseDraftContentVersion({...lesson,title:'Changed'},practice))
  assert.notEqual(contentVersion,enterpriseDraftContentVersion(lesson,{task:'Changed'}))
  assert.equal(enterpriseDraftContentVersion(lesson,undefined),enterpriseDraftContentVersion(lesson,null))
  assert.match(contentVersion,/^[a-f0-9]{64}$/)
})

test('draft requests reject impersonation, stale content and unbounded revision or mutation keys', () => {
  const data = {organizationId:'org-one',lessonId:lesson.id,expectedRevision:0,mutationId:'mutation-123456789',contentVersion,state:state()}
  const catalog = {lessons:[lesson]}, practices = {[lesson.id]:practice}
  assert.equal(validateEnterpriseDraftRequest(data,catalog,practices,true).lesson.id,lesson.id)
  assert.equal(validateEnterpriseDraftRequest({...data,state:null},catalog,practices,true).contentVersion,contentVersion)
  for (const patch of [{uid:'other'},{organizationId:'../other'},{lessonId:'missing'},{expectedRevision:-1},{expectedRevision:Number.MAX_SAFE_INTEGER},{mutationId:'short'},{state:undefined}]) {
    assert.throws(()=>validateEnterpriseDraftRequest({...data,...patch},catalog,practices,true),{code:'invalid-argument'})
  }
  assert.throws(()=>validateEnterpriseDraftRequest({...data,contentVersion:'a'.repeat(64)},catalog,practices,true),{code:'failed-precondition'})
})

test('logical expiry and version changes purge production while preserving a strictly newer revision', () => {
  assert.equal(resolveEnterpriseDraft(saved(),context).snapshot.revision,4)
  assert.equal(resolveEnterpriseDraft(saved(),context).purge,null)
  for (const [patch,extra,notice] of [
    [{expiresAt:new Date(now).toISOString()},{},'expired'],
    [{contentVersion:'old'},{},'content-changed'],
    [{},{completed:true},'completed'],
    [{state:{...state(),stepId:'missing'}},{},'invalid-state'],
  ]) {
    const result = resolveEnterpriseDraft({...saved(),...patch},{...context,...extra})
    assert.equal(result.snapshot.state,null)
    assert.equal(result.snapshot.revision,5)
    assert.equal(result.snapshot.notice,notice)
    assert.equal(Object.hasOwn(result.purge,'expiresAt'),false)
    assert.equal(JSON.stringify(result.purge).includes('Une proposition fictive'),false)
    assert.equal(Object.hasOwn(result.purge,'lastMutationId'),false)
  }
  assert.equal(resolveEnterpriseDraft(undefined,context).snapshot.revision,0)
  assert.equal(resolveEnterpriseDraft(undefined,context).snapshot.state,null)
})

test('clear markers keep their revision and mutation hashes ignore only object key order', () => {
  const tombstone = enterpriseDraftTombstone(saved(),contentVersion,now)
  assert.equal(tombstone.revision,5)
  assert.equal(resolveEnterpriseDraft(tombstone,context).snapshot.revision,5)
  assert.equal(resolveEnterpriseDraft(tombstone,context).purge,null)
  assert.equal(enterpriseDraftMutationHash({a:1,state:{b:2,c:3}}),enterpriseDraftMutationHash({state:{c:3,b:2},a:1}))
  assert.notEqual(enterpriseDraftMutationHash({state:state()}),enterpriseDraftMutationHash({state:{...state(),draft:'Autre texte'}}))
})
