import { AnalysisError, PROMPT_VERSION, RESERVED_TOKENS, checkQuota, existingDecision, validateAttempt } from './analysis.mjs'
import { isInvited } from './accessService.mjs'

// Dependency injection lets tests exercise the same transactional path as production.
export async function claimAnalysis({ db, uid, attemptId, now, config, dossiers, timestamp }) {
  const ref = db.doc(`users/${uid}/challengeAnalyses/${attemptId}`)
  const day = new Date(now).toISOString().slice(0, 10)
  const userQuota = db.doc(`users/${uid}/challengeAiUsage/${day}`)
  const globalQuota = db.doc(`_challengeAiUsage/${day}`)
  return db.runTransaction(async transaction => {
    if ((await transaction.get(db.doc(`_accountLifecycle/${uid}`))).exists) throw new AnalysisError('failed-precondition', 'Ce compte est en cours de suppression.')
    const access = await transaction.get(db.doc(`users/${uid}/settings/challengeAccess`))
    if (access.data()?.aiEnabled !== true) throw new AnalysisError('permission-denied', 'L’accès à l’option IA est requis.')
    const saved = await transaction.get(ref)
    const existing = saved.exists ? saved.data() : null
    const decision = existingDecision(existing, now)
    if (decision === 'needs_review') {
      const result = { ...existing, status: 'needs_review', message: '' }
      transaction.update(ref, { status: result.status, message: result.message })
      return { result }
    }
    if (decision === 'return') return { result: existing }
    if (!config.enabled || !isInvited(access.data(), uid, config.invited)) throw new AnalysisError('permission-denied', 'Les analyses IA sont réservées à la bêta invitée.')
    if (!config.model || config.model.includes('latest') || !config.hasKey) throw new AnalysisError('failed-precondition', 'Le service d’analyse n’est pas configuré.')
    const attemptSnapshot = await transaction.get(db.doc(`users/${uid}/challengeAttempts/${attemptId}`))
    const attempt = attemptSnapshot.data()
    const dossier = validateAttempt(attempt, dossiers)
    const [userSnapshot, globalSnapshot] = await Promise.all([transaction.get(userQuota), transaction.get(globalQuota)])
    const user = userSnapshot.data() ?? {}
    const global = globalSnapshot.data() ?? {}
    const limits = config.limits
    if (Object.values(limits).some(value => !Number.isSafeInteger(value) || value < 1)) throw new AnalysisError('failed-precondition', 'Quota non configuré.')
    checkQuota(user, global, limits)
    transaction.set(userQuota, { requests: (user.requests ?? 0) + 1 })
    transaction.set(globalQuota, { requests: (global.requests ?? 0) + 1, reservedTokens: (global.reservedTokens ?? 0) + RESERVED_TOKENS })
    const result = { status: 'processing', message: '', challengeVersion: dossier.version, rubricVersion: dossier.rubricVersion, model: config.model, promptVersion: PROMPT_VERSION, leaseUntil: now + 120000, createdAt: timestamp }
    transaction.create(ref, result)
    return { attempt, dossier, result, start: true }
  })
}
