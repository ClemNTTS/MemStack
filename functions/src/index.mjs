import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineBoolean, defineInt, defineSecret, defineString } from 'firebase-functions/params'
import { AnalysisError, callMistral, publicAnalysis, validateAttemptId } from './analysis.mjs'
import { claimAnalysis } from './claim.mjs'

initializeApp()
const db = getFirestore()
const dossiers = JSON.parse(readFileSync(new URL('../catalog/challengeDossiers.json', import.meta.url), 'utf8')).challenges
const key = defineSecret('MISTRAL_API_KEY')
const enabled = defineBoolean('CHALLENGE_AI_ENABLED', { default: false })
const appCheck = defineBoolean('CHALLENGE_AI_REQUIRE_APP_CHECK', { default: true })
const invited = defineString('CHALLENGE_AI_INVITED_UIDS', { default: '' })
// No unversioned/latest alias: deliberately unset until evaluation and configuration.
const model = defineString('CHALLENGE_AI_MODEL', { default: '' })
const userLimit = defineInt('CHALLENGE_AI_USER_DAILY_LIMIT', { default: 5 })
const globalLimit = defineInt('CHALLENGE_AI_GLOBAL_DAILY_LIMIT', { default: 25 })
const tokenLimit = defineInt('CHALLENGE_AI_GLOBAL_RESERVED_TOKENS', { default: 400000 })

export const analyzeChallengeAttempt = onCall({ region: 'europe-west9', secrets: [key], timeoutSeconds: 90, memory: '256MiB', minInstances: 0, maxInstances: 2, concurrency: 10, enforceAppCheck: appCheck, cors: true }, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Connexion Google requise.')
  try {
    const attemptId = validateAttemptId(request.data)
    const uid = request.auth.uid
    const ref = db.doc(`users/${uid}/challengeAnalyses/${attemptId}`)
    // Existing feedback stays readable even when new calls are disabled.
    const now = Date.now()
    const claim = await claimAnalysis({ db, uid, attemptId, now, dossiers, timestamp: Timestamp.fromMillis(now), config: {
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
      const snapshot = await transaction.get(ref)
      const current = snapshot.data()
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
