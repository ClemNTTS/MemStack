import test from 'node:test'
import assert from 'node:assert/strict'
import { validateEnterpriseAction, enterpriseActor } from './enterprise.mjs'

const catalog = {lessons:[{id:'ent-first',cards:[{id:'ent-card'}]}],challenges:[{id:'ent-case',questions:[{id:'q1',options:[{id:'a'},{id:'b'}]}]}]}
test('enterprise actions cannot inject another identity, dates, answers or developer content',()=>{
  const request = {organizationId:'org-one',requestId:'request-123456789',type:'lesson',lessonId:'ent-first'}
  assert.equal(validateEnterpriseAction(request,catalog).id,'ent-first')
  for (const data of [{...request,uid:'other'},{...request,completedAt:'2020-01-01'},{...request,lessonId:'docker-images'},{...request,organizationId:'../other'}]) assert.throws(()=>validateEnterpriseAction(data,catalog),{code:'invalid-argument'})
  assert.throws(()=>validateEnterpriseAction({organizationId:'org-one',requestId:'request-123456789',type:'challenge',challengeId:'ent-case',answers:{q1:'c'}},catalog),{code:'invalid-argument'})
})
test('enterprise identity checks the current account, verification and deletion marker',async()=>{
  const auth = {uid:'learner',token:{firebase:{sign_in_provider:'google.com'}}}
  const db = {doc:()=>({get:async()=>({exists:false})})}
  const account = {email:'Person@Example.com',emailVerified:true,disabled:false}
  assert.equal((await enterpriseActor({db,auth,lookup:async()=>account})).email,'person@example.com')
  for (const patch of [{disabled:true},{emailVerified:false},{email:null}]) await assert.rejects(enterpriseActor({db,auth,lookup:async()=>({...account,...patch})}),{code:'permission-denied'})
  await assert.rejects(enterpriseActor({db:{doc:()=>({get:async()=>({exists:true})})},auth,lookup:async()=>account}),{code:'permission-denied'})
})
