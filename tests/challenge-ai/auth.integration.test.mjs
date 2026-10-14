import test from 'node:test'
import assert from 'node:assert/strict'
import {initializeApp,deleteApp} from 'firebase/app'
import {getAuth,connectAuthEmulator,signInWithCredential,GoogleAuthProvider,updatePassword,signInWithEmailAndPassword,signOut,sendPasswordResetEmail,confirmPasswordReset} from 'firebase/auth'
import {requireMember} from '../../functions/src/accessService.mjs'

test('linking a password to a verified Google account preserves its UID and password reset preserves that identity',async()=>{
  assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST,'127.0.0.1:9099','Local Auth emulator required; production access prohibited')
  const app=initializeApp({projectId:'demo-memstack',apiKey:'demo-key'},'auth-qualification')
  const auth=getAuth(app)
  connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true})
  const email=`google-link-${Date.now()}@example.invalid`
  const encoded=value=>Buffer.from(JSON.stringify(value)).toString('base64url')
  const fakeGoogleToken=`${encoded({alg:'none',typ:'JWT'})}.${encoded({sub:'google-fictive-'+Date.now(),email,email_verified:true,name:'Google fictif',iss:'https://accounts.google.com',aud:'demo-client',exp:Math.floor(Date.now()/1000)+3600})}.`
  try {
    const google=await signInWithCredential(auth,GoogleAuthProvider.credential(fakeGoogleToken))
    const uid=google.user.uid
    assert.equal(google.user.emailVerified,true)
    await updatePassword(google.user,'Qualification-google-fictive-2026!')
    assert.equal(auth.currentUser.uid,uid)
    await signOut(auth)
    const linked=await signInWithEmailAndPassword(auth,email,'Qualification-google-fictive-2026!')
    assert.equal(linked.user.uid,uid)
    const token=await linked.user.getIdTokenResult(true)
    assert.equal(token.signInProvider,'password')
    assert.equal(requireMember({uid,token:token.claims}),uid)
    await sendPasswordResetEmail(auth,email)
    const codes=await (await fetch('http://127.0.0.1:9099/emulator/v1/projects/demo-memstack/oobCodes')).json()
    const code=codes.oobCodes.filter(value=>value.email===email && value.requestType==='PASSWORD_RESET').at(-1).oobCode
    await confirmPasswordReset(auth,code,'Qualification-reset-fictive-2026!')
    await signOut(auth)
    await assert.rejects(signInWithEmailAndPassword(auth,email,'Qualification-google-fictive-2026!'))
    assert.equal((await signInWithEmailAndPassword(auth,email,'Qualification-reset-fictive-2026!')).user.uid,uid)
  } finally {await signOut(auth);await deleteApp(app)}
})
