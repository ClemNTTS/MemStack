import test from 'node:test'
import assert from 'node:assert/strict'
import {currentAdminStatus} from './accessService.mjs'

test('administration checks current privileges and does not depend on old AI invitations',async()=>{
  const auth={uid:'owner',token:{firebase:{sign_in_provider:'google.com'},memstackAdmin:true}}
  let lookups=0
  const options={db:{doc:()=>({get:async()=>({exists:false})})},auth,lookup:async uid=>{assert.equal(uid,'owner');lookups++;return {disabled:false,customClaims:{memstackAdmin:true}}}}
  assert.deepEqual(await currentAdminStatus(options),{admin:true})
  assert.equal(lookups,1)
  assert.deepEqual(await currentAdminStatus({...options,lookup:async()=>({customClaims:{}})}),{admin:false})
  assert.deepEqual(await currentAdminStatus({...options,lookup:async()=>({disabled:true,customClaims:{memstackAdmin:true}})}),{admin:false})
  assert.deepEqual(await currentAdminStatus({...options,db:{doc:()=>({get:async()=>({exists:true})})}}),{admin:false})
})
test('members, email identities and stale claims cannot acquire administration access',async()=>{
  const noRead=()=>{throw new Error('No privileged lookup allowed')}
  const options={db:{doc:noRead},lookup:noRead}
  assert.deepEqual(await currentAdminStatus({...options,auth:{uid:'member',token:{firebase:{sign_in_provider:'google.com'}}}}),{admin:false})
  assert.deepEqual(await currentAdminStatus({...options,auth:{uid:'email',token:{firebase:{sign_in_provider:'password'},email_verified:true,memstackAdmin:true}}}),{admin:false})
  await assert.rejects(currentAdminStatus({...options,auth:null}),{code:'unauthenticated'})
})
