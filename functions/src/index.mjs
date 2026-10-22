import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import Stripe from 'stripe'
import { submitLearningAction } from './learningAccess.mjs'
import { importLearningBatch } from './learningImport.mjs'
import { readWorldRanking, updateRankingAlias, removeRankingMember } from './worldRanking.mjs'
import { createSubscriptionCheckout, hasPermanentPremium, publicSubscriptionStatus, processSubscriptionEvent, resolveSubscriptionPrices, closeAccountBilling } from './subscription.mjs'
import { defineBoolean, defineInt, defineSecret, defineString } from 'firebase-functions/params'
import { AnalysisError, callMistral, publicAnalysis, validateAttemptId } from './analysis.mjs'
import { claimAnalysis } from './claim.mjs'
import { submitCheckedChallenge } from './challengeChecks.mjs'
import { createAccountLifecycle } from './accountLifecycle.mjs'
import { getAccessStatus, requireGoogle, requireMember, updateMemberAccess, validateMemberAccessRequest, currentAdminStatus } from './accessService.mjs'
import { getEnterpriseWorkspace as enterpriseWorkspace, setEnterpriseLearningPreferences as enterprisePreferences, manageEnterpriseOrganization as enterpriseManage, joinEnterpriseOrganization as enterpriseJoin, commitEnterpriseLearningAction as enterpriseCommit, deleteEnterpriseData } from './enterprise.mjs'
import { enterpriseCommercialTerms,createEnterpriseOrganization as enterpriseCreate,createEnterpriseCheckout as enterpriseCheckout,getEnterpriseBilling as enterpriseBilling,createEnterprisePortal as enterprisePortal,drainEnterpriseSeatSync,processEnterpriseSubscriptionEvent } from './enterpriseBilling.mjs'
import { assessEnterprisePractice, callPracticeMistral } from './enterprisePractice.mjs'

initializeApp()
const db = getFirestore()
const dossiers = JSON.parse(readFileSync(new URL('../catalog/challengeDossiers.json', import.meta.url), 'utf8')).challenges
const courses = JSON.parse(readFileSync(new URL('../catalog/curriculum.json', import.meta.url), 'utf8')).courses
const challengeQuestions = JSON.parse(readFileSync(new URL('../catalog/challengeQuestions.json', import.meta.url), 'utf8')).challenges
const challengeAnswerKeys = JSON.parse(readFileSync(new URL('../catalog/challengeAnswerKeys.json', import.meta.url), 'utf8')).challenges
challengeQuestions.push(...JSON.parse(readFileSync(new URL('../catalog/challengeQuestions.v3.json', import.meta.url), 'utf8')).challenges)
challengeAnswerKeys.push(...JSON.parse(readFileSync(new URL('../catalog/challengeAnswerKeys.v3.json', import.meta.url), 'utf8')).challenges)
const key = defineSecret('MISTRAL_API_KEY')
const enabled = defineBoolean('CHALLENGE_AI_ENABLED', { default: false })
const appCheck = defineBoolean('CHALLENGE_AI_REQUIRE_APP_CHECK', { default: true })
const invited = defineString('CHALLENGE_AI_INVITED_UIDS', { default: '' })
// No unversioned/latest alias: deliberately unset until evaluation and configuration.
const model = defineString('CHALLENGE_AI_MODEL', { default: '' })
const userLimit = defineInt('CHALLENGE_AI_USER_DAILY_LIMIT', { default: 5 })
const globalLimit = defineInt('CHALLENGE_AI_GLOBAL_DAILY_LIMIT', { default: 25 })
const tokenLimit = defineInt('CHALLENGE_AI_GLOBAL_RESERVED_TOKENS', { default: 400000 })

const callableOptions = { region: 'europe-west9', enforceAppCheck: true, maxInstances: 2, cors: true }
const enterpriseCatalog = JSON.parse(readFileSync(new URL('../catalog/enterpriseCurriculum.json', import.meta.url),'utf8'))
const enterpriseKeys = JSON.parse(readFileSync(new URL('../catalog/enterpriseAssessmentKeys.json', import.meta.url),'utf8'))
const enterprisePractices = JSON.parse(readFileSync(new URL('../catalog/enterprisePractices.json', import.meta.url),'utf8'))
const enterprisePracticeRubrics = JSON.parse(readFileSync(new URL('../catalog/enterprisePracticeRubrics.json', import.meta.url),'utf8'))
const practiceAiEnabled = defineBoolean('ENTERPRISE_PRACTICE_AI_ENABLED', { default: false })
const practiceAiModel = defineString('ENTERPRISE_PRACTICE_AI_MODEL', { default: '' })
const enterpriseContext = request => ({db,auth:request.auth,lookup:uid=>getAuth().getUser(uid),data:request.data})
export const assessEnterprisePracticeAnswer = onCall({ ...callableOptions, secrets: [key], timeoutSeconds: 60 }, request => accessCall(() => assessEnterprisePractice({
  ...enterpriseContext(request), catalog: enterpriseCatalog, practices: enterprisePractices, rubrics: enterprisePracticeRubrics,
  config: { enabled: practiceAiEnabled.value(), model: practiceAiModel.value().trim(), hasKey: Boolean(key.value()) },
  evaluate: ({ practice, answer, model, rubric }) => callPracticeMistral({ apiKey: key.value(), model, practice, answer, rubric }),
})))
export const getEnterpriseWorkspace = onCall(callableOptions,request=>accessCall(()=>enterpriseWorkspace({...enterpriseContext(request),catalog:enterpriseCatalog})))
export const setEnterpriseLearningPreferences = onCall(callableOptions,request=>accessCall(()=>enterprisePreferences({...enterpriseContext(request),catalog:enterpriseCatalog})))
export const manageEnterpriseOrganization = onCall(callableOptions,request=>accessCall(()=>enterpriseManage(enterpriseContext(request))))
export const joinEnterpriseOrganization = onCall(callableOptions,request=>accessCall(()=>enterpriseJoin(enterpriseContext(request))))
export const commitEnterpriseLearningAction = onCall(callableOptions,request=>accessCall(()=>enterpriseCommit({...enterpriseContext(request),catalog:enterpriseCatalog,keys:enterpriseKeys})))
export const getAdminStatus = onCall(callableOptions, request => accessCall(async () => {
  if (!request.data || typeof request.data !== 'object' || Array.isArray(request.data) || Object.keys(request.data).length) throw new HttpsError('invalid-argument','Paramètres invalides.')
  return currentAdminStatus({db,auth:request.auth,lookup:uid=>getAuth().getUser(uid)})
}))
export const getWorldRanking = onCall(callableOptions, request => accessCall(async () => {
  const uid = requireMember(request.auth)
  if (!request.data || Object.keys(request.data).length) throw new HttpsError('invalid-argument','Paramètres invalides.')
  return readWorldRanking(db,uid)
}))
export const setRankingAlias = onCall(callableOptions, request => accessCall(async () => {
  return updateRankingAlias(db,requireMember(request.auth),request.data)
}))
const learningCatalog = JSON.parse(readFileSync(new URL('../catalog/learning.json', import.meta.url), 'utf8'))
export const commitLearningAction = onCall(callableOptions, request => accessCall(async () => {
  const uid = requireMember(request.auth)
  return submitLearningAction({ db, uid, data: request.data, catalog: learningCatalog })
}))
export const importLearningProgress = onCall(callableOptions, request => accessCall(async () => {
  const uid = requireMember(request.auth)
  return importLearningBatch({ db,uid,data:request.data,catalog:learningCatalog })
}))
const subscriptionConfig = JSON.parse(readFileSync(new URL('../config/subscription.json', import.meta.url), 'utf8'))
const stripeKey = defineSecret('STRIPE_SECRET_KEY')
const stripeWebhookKey = defineSecret('STRIPE_WEBHOOK_SECRET')
const enterpriseSubscriptionsEnabled=defineBoolean('ENTERPRISE_SUBSCRIPTIONS_ENABLED',{default:false})
const enterpriseSubscriptionsLive=defineBoolean('ENTERPRISE_SUBSCRIPTIONS_LIVE_MODE',{default:false})
const enterprisePriceId=defineString('ENTERPRISE_SUBSCRIPTION_PRICE_ID',{default:''})
const enterprisePortalId=defineString('ENTERPRISE_PORTAL_CONFIGURATION_ID',{default:''})
const enterpriseBillingConfig=()=>({...enterpriseCommercialTerms,enabled:enterpriseSubscriptionsEnabled.value(),liveMode:enterpriseSubscriptionsLive.value(),priceId:enterprisePriceId.value(),portalConfigurationId:enterprisePortalId.value()})
const enterpriseStripe=()=>new Stripe(stripeKey.value(),{apiVersion:subscriptionConfig.apiVersion,maxNetworkRetries:1,timeout:15000})
async function requireEnterpriseTestAccount(request) {
  const uid=requireMember(request.auth)
  if(!enterpriseSubscriptionsLive.value() && !hasPermanentPremium((await db.doc(`users/${uid}/settings/premiumAccess`).get()).data())) throw new HttpsError('permission-denied','La qualification Stripe Entreprise est réservée aux comptes de test autorisés.')
}
export const createEnterpriseOrganization=onCall(callableOptions,request=>accessCall(async()=>{await requireEnterpriseTestAccount(request);return enterpriseCreate({...enterpriseContext(request),config:enterpriseBillingConfig()})}))
export const getEnterpriseBilling=onCall(callableOptions,request=>accessCall(()=>enterpriseBilling({...enterpriseContext(request),config:enterpriseBillingConfig()})))
export const createEnterpriseCheckout=onCall({...callableOptions,secrets:[stripeKey]},request=>accessCall(async()=>{await requireEnterpriseTestAccount(request);return enterpriseCheckout({...enterpriseContext(request),stripe:enterpriseStripe(),config:enterpriseBillingConfig()})}))
export const createEnterprisePortal=onCall({...callableOptions,secrets:[stripeKey]},request=>accessCall(async()=>{await requireEnterpriseTestAccount(request);return enterprisePortal({...enterpriseContext(request),stripe:enterpriseStripe(),config:enterpriseBillingConfig()})}))
export const retryEnterpriseBillingSync=onCall({...callableOptions,secrets:[stripeKey]},request=>accessCall(async()=>{
  await requireEnterpriseTestAccount(request)
  await enterpriseBilling({...enterpriseContext(request),config:enterpriseBillingConfig()})
  return drainEnterpriseSeatSync({db,stripe:enterpriseStripe(),organizationId:request.data.organizationId,config:enterpriseBillingConfig(),manual:true})
}))
export const syncEnterpriseMemberQuantity=onDocumentWritten({document:'_enterpriseSeatSync/{organizationId}',region:'europe-west9',maxInstances:2,retry:true,secrets:[stripeKey],timeoutSeconds:120},async event=>{
  if(!enterpriseSubscriptionsEnabled.value() || !event.data?.after.exists) return
  const before=event.data.before.data(),after=event.data.after.data()
  if(before?.revision===after.revision && before?.syncedRevision===after.syncedRevision) return
  if(after.revision<=(after.syncedRevision??0)) return
  await drainEnterpriseSeatSync({db,stripe:enterpriseStripe(),organizationId:event.params.organizationId,config:enterpriseBillingConfig()})
})
const subscriptionsEnabled = defineBoolean('SUBSCRIPTIONS_ENABLED', { default: false })
const subscriptionsLive = defineBoolean('SUBSCRIPTIONS_LIVE_MODE', { default: false })
const subscriptionPriceIds = defineString('SUBSCRIPTION_PRICE_IDS', { default: subscriptionConfig.priceCandidates.join(',') })
let stripeRuntime
async function billingRuntime() {
  if (!subscriptionsEnabled.value()) throw new HttpsError('failed-precondition', 'Les abonnements ne sont pas encore ouverts.')
  const liveMode = subscriptionsLive.value()
  if (!stripeRuntime || stripeRuntime.liveMode !== liveMode || Date.now() - stripeRuntime.loadedAt > 300000) {
    const stripe = new Stripe(stripeKey.value(), { apiVersion: subscriptionConfig.apiVersion, maxNetworkRetries: 1, timeout: 15000 })
    const prices = await resolveSubscriptionPrices(stripe, subscriptionPriceIds.value().split(',').map(value => value.trim()), liveMode)
    stripeRuntime = { stripe, liveMode, loadedAt: Date.now(), config: { ...subscriptionConfig, enabled: true, liveMode, prices } }
  }
  return stripeRuntime
}

export const getSubscriptionStatus = onCall(callableOptions, request => accessCall(async () => {
  const uid = requireMember(request.auth)
  if (!request.data || Object.keys(request.data).length) throw new HttpsError('invalid-argument', 'Paramètres invalides.')
  if ((await db.doc(`_accountLifecycle/${uid}`).get()).exists) throw new HttpsError('failed-precondition', 'Suppression de compte en cours.')
  const [entitlement, access, billing] = await Promise.all(['subscription','premiumAccess','billing'].map(name => db.doc(name === 'billing' ? `users/${uid}/billing/stripe` : `users/${uid}/settings/${name}`).get()))
  return publicSubscriptionStatus({entitlement:entitlement.data(),access:access.data(),billing:billing.data(),enabled:subscriptionsEnabled.value(),liveMode:subscriptionsLive.value()})
}))

export const createPremiumCheckout = onCall({ ...callableOptions, secrets: [stripeKey] }, request => accessCall(async () => {
  const uid = requireMember(request.auth)
  if (!subscriptionsLive.value() && !hasPermanentPremium((await db.doc(`users/${uid}/settings/premiumAccess`).get()).data())) throw new HttpsError('permission-denied','La qualification Stripe est réservée aux comptes de test autorisés.')
  const { stripe, config } = await billingRuntime()
  return createSubscriptionCheckout({ db, stripe, uid, data: request.data, config })
}))

export const createPremiumPortal = onCall({ ...callableOptions, secrets: [stripeKey] }, request => accessCall(async () => {
  const uid = requireMember(request.auth)
  if (!subscriptionsLive.value() && !hasPermanentPremium((await db.doc(`users/${uid}/settings/premiumAccess`).get()).data())) throw new HttpsError('permission-denied','La qualification Stripe est réservée aux comptes de test autorisés.')
  if (!request.data || Object.keys(request.data).length) throw new HttpsError('invalid-argument', 'Paramètres invalides.')
  if ((await db.doc(`_accountLifecycle/${uid}`).get()).exists) throw new HttpsError('failed-precondition', 'Suppression de compte en cours.')
  const { stripe, liveMode } = await billingRuntime()
  const state = (await db.doc(`users/${uid}/billing/stripe`).get()).data()
  if (!state?.customerId || state.liveMode !== liveMode) throw new HttpsError('failed-precondition', 'Aucun abonnement à gérer.')
  const session = await stripe.billingPortal.sessions.create({ customer: state.customerId, return_url: 'https://memstack.fr/#/profile' })
  return { url: session.url }
}))

export const stripeSubscriptionWebhook = onRequest({ region: 'europe-west9', maxInstances: 2, timeoutSeconds: 60,
  secrets: [stripeKey, stripeWebhookKey] }, async (request, response) => {
  if (request.method !== 'POST') { response.status(405).send('Method not allowed'); return }
  if (!subscriptionsEnabled.value() && !enterpriseSubscriptionsEnabled.value()) { response.status(503).send('Billing disabled'); return }
  const stripe = new Stripe(stripeKey.value(), { apiVersion: subscriptionConfig.apiVersion, maxNetworkRetries: 1, timeout: 15000 })
  let event
  try { event = stripe.webhooks.constructEvent(request.rawBody, request.headers['stripe-signature'], stripeWebhookKey.value()) }
  catch { response.status(400).send('Invalid signature'); return }
  try {
    let enterpriseHandled=false
    if(enterpriseSubscriptionsEnabled.value() && event.livemode===enterpriseSubscriptionsLive.value()) {
      const result=await processEnterpriseSubscriptionEvent({db,stripe,event,config:enterpriseBillingConfig()})
      enterpriseHandled=result.scope==='enterprise' || result.ignored!==true
    }
    if(!enterpriseHandled && subscriptionsEnabled.value() && event.livemode===subscriptionsLive.value()) {
      const { config } = await billingRuntime()
      await processSubscriptionEvent({ db, stripe, event, config })
    }
    response.status(200).send('Received')
  } catch { response.status(503).send('Retry later') }
})
const lifecycle = createAccountLifecycle({ db, auth: getAuth(), beforeDelete: async uid => {
  if ((await db.doc(`users/${uid}/billing/stripe`).get()).exists) {
    const stripe = new Stripe(stripeKey.value(),{apiVersion:subscriptionConfig.apiVersion,maxNetworkRetries:1,timeout:15000})
    await closeAccountBilling({db,stripe,uid,liveMode:subscriptionsLive.value()})
  }
  await removeRankingMember(db,uid)
  await deleteEnterpriseData(db,uid,(await getAuth().getUser(uid)).email)
} })
export const exportAccountData = onCall({ ...callableOptions, timeoutSeconds: 540, concurrency: 1 }, lifecycle.exportAccountData)
export const deleteAccountData = onCall({ ...callableOptions, secrets:[stripeKey], timeoutSeconds: 540, concurrency: 1 }, lifecycle.deleteAccountData)

export const submitDeterministicChallenge = onCall(callableOptions, request => accessCall(async () => {
  const uid = requireMember(request.auth)
  const now = Date.now()
  const attempt = await submitCheckedChallenge({ db, uid, data: request.data, questions: challengeQuestions,
    answerKeys: challengeAnswerKeys, dossiers, courses, now, timestamp: Timestamp.fromMillis(now) })
  return { id: request.data.attemptId, ...attempt, submittedAt: attempt.submittedAt.toDate().toISOString() }
}))

async function accessCall(action) {
  try { return await action() } catch (error) {
    if (error instanceof AnalysisError) throw new HttpsError(error.code, error.message)
    if (error instanceof HttpsError) throw error
    throw new HttpsError('unavailable', 'Le service est temporairement indisponible.')
  }
}

export const getChallengeAccessStatus = onCall(callableOptions, request => accessCall(async () => {
  if (!request.data || typeof request.data !== 'object' || Array.isArray(request.data) || Object.keys(request.data).length) throw new HttpsError('invalid-argument', 'Paramètres invalides.')
  return getAccessStatus({ db, auth: request.auth, now: Date.now(), config: {
    enabled: enabled.value(), invited: invited.value().split(',').map(value => value.trim()),
    limits: { user: userLimit.value(), global: globalLimit.value(), tokens: tokenLimit.value() }
  } })
}))

export const updateChallengeMemberAccess = onCall(callableOptions, request => accessCall(async () => {
  const actorUid = requireGoogle(request.auth, true)
  // Check current privileges as well as the token: a revoked role cannot use a stale token.
  if ((await getAuth().getUser(actorUid)).customClaims?.memstackAdmin !== true) throw new HttpsError('permission-denied', 'Accès administrateur requis.')
  const data = validateMemberAccessRequest(request.data)
  let target
  try { target = await getAuth().getUserByEmail(data.email) } catch (error) {
    if (error.code === 'auth/user-not-found') throw new HttpsError('not-found', 'Compte introuvable.')
    throw error
  }
  if (!target.providerData.some(provider => provider.providerId === 'google.com')) throw new HttpsError('failed-precondition', 'Un compte Google est requis.')
  return updateMemberAccess({ db, auth: request.auth, targetUid: target.uid, aiEnabled: data.aiEnabled, betaInvited: data.betaInvited, timestamp: Timestamp.now() })
}))

export const analyzeChallengeAttempt = onCall({ region: 'europe-west9', secrets: [key], timeoutSeconds: 90, memory: '256MiB', minInstances: 0, maxInstances: 2, concurrency: 10, enforceAppCheck: appCheck, cors: true }, async request => {
  try {
    requireGoogle(request.auth)
    const attemptId = validateAttemptId(request.data)
    const uid = request.auth.uid
    const ref = db.doc(`users/${uid}/challengeAnalyses/${attemptId}`)
    // Existing feedback stays readable even when new calls are disabled.
    const now = Date.now()
    const claim = await claimAnalysis({ db, uid, attemptId, now, dossiers, courses, timestamp: Timestamp.fromMillis(now), config: {
      enabled: enabled.value(), invited: invited.value().split(',').map(value => value.trim()), model: model.value().trim(), hasKey: Boolean(key.value()),
      limits: { user: userLimit.value(), global: globalLimit.value(), tokens: tokenLimit.value() }
    } })
    if (!claim.start) return publicAnalysis(claim.result)
    let result
    try {
      const feedback = await callMistral({ apiKey: key.value(), model: claim.result.model, dossier: claim.dossier, attempt: claim.attempt })
      result = { status: 'completed', ...feedback, completedAt: Timestamp.now() }
    } catch {
      result = { status: 'needs_review', message: '' }
    }
    // A stale claimant cannot overwrite another terminal result.
    const persisted = await db.runTransaction(async transaction => {
      if ((await transaction.get(db.doc(`_accountLifecycle/${uid}`))).exists) throw new AnalysisError('failed-precondition', 'Ce compte est en cours de suppression.')
      const snapshot = await transaction.get(ref)
      const current = snapshot.data()
      if (!current) throw new AnalysisError('failed-precondition', 'Cette analyse n’est plus disponible.')
      if (current.status !== 'processing') return current
      transaction.update(ref, result)
      return { ...current, ...result }
    })
    return publicAnalysis(persisted)
  } catch (error) {
    if (error instanceof AnalysisError) throw new HttpsError(error.code, error.message)
    // Never expose or log provider payloads, personal answers or credentials.
    throw new HttpsError('unavailable', 'Le service d’analyse est temporairement indisponible.')
  }
})
