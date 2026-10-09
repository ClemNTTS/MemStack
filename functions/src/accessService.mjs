import { AnalysisError, RESERVED_TOKENS } from './analysis.mjs'

export function requireGoogle(auth, admin = false) {
  if (!auth || auth.token?.firebase?.sign_in_provider !== 'google.com') throw new AnalysisError('unauthenticated', 'Connexion Google requise.')
  if (admin && auth.token.memstackAdmin !== true) throw new AnalysisError('permission-denied', 'Accès administrateur requis.')
  return auth.uid
}

export function isInvited(access, uid, invited) {
  return Object.hasOwn(access ?? {}, 'betaInvited') ? access.betaInvited === true : invited.includes(uid)
}

export function validateMemberAccessRequest(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length !== 3
    || !Object.keys(data).every(key => ['email', 'aiEnabled', 'betaInvited'].includes(key))
    || typeof data.email !== 'string' || data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
    || typeof data.aiEnabled !== 'boolean' || typeof data.betaInvited !== 'boolean') throw new AnalysisError('invalid-argument', 'Paramètres invalides.')
  return data
}

async function requireActive(transaction, db, uid) {
  if ((await transaction.get(db.doc(`_accountLifecycle/${uid}`))).exists) throw new AnalysisError('failed-precondition', 'Ce compte est en cours de suppression.')
}

export async function getAccessStatus({ db, auth, config, now }) {
  const uid = requireGoogle(auth)
  const day = new Date(now).toISOString().slice(0, 10)
  return db.runTransaction(async transaction => {
    await requireActive(transaction, db, uid)
    const [accessSnapshot, usageSnapshot, globalSnapshot] = await Promise.all([
      transaction.get(db.doc(`users/${uid}/settings/challengeAccess`)),
      transaction.get(db.doc(`users/${uid}/challengeAiUsage/${day}`)),
      transaction.get(db.doc(`_challengeAiUsage/${day}`)),
    ])
    const access = accessSnapshot.data() ?? {}
    const usage = usageSnapshot.data() ?? {}
    const global = globalSnapshot.data() ?? {}
    const limit = config.limits.user
    if (Object.values(config.limits).some(value => !Number.isSafeInteger(value) || value < 1)
      || [usage.requests ?? 0, global.requests ?? 0, global.reservedTokens ?? 0].some(value => !Number.isSafeInteger(value) || value < 0)) throw new AnalysisError('unavailable', 'Quota indisponible.')
    const remaining = Math.max(0, limit - (usage.requests ?? 0))
    const globalAvailable = (global.requests ?? 0) < config.limits.global && (global.reservedTokens ?? 0) + RESERVED_TOKENS <= config.limits.tokens
    return { aiEnabled: access.aiEnabled === true, invited: isInvited(access, uid, config.invited), serviceEnabled: config.enabled === true, dailyLimit: limit, remaining, globalAvailable, resetsAt: new Date(Date.parse(`${day}T00:00:00Z`) + 86400000).toISOString(), admin: auth.token.memstackAdmin === true }
  })
}

export async function updateMemberAccess({ db, auth, targetUid, aiEnabled, betaInvited, timestamp }) {
  const actorUid = requireGoogle(auth, true)
  if (typeof targetUid !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(targetUid) || typeof aiEnabled !== 'boolean' || typeof betaInvited !== 'boolean') throw new AnalysisError('invalid-argument', 'Droits invalides.')
  const audit = db.collection('_challengeAccessAudit').doc()
  return db.runTransaction(async transaction => {
    await requireActive(transaction, db, actorUid)
    await requireActive(transaction, db, targetUid)
    const ref = db.doc(`users/${targetUid}/settings/challengeAccess`)
    const before = (await transaction.get(ref)).data() ?? {}
    transaction.set(ref, { ...before, aiEnabled, betaInvited })
    transaction.create(audit, { actorUid, targetUid, aiEnabled, betaInvited, previousAiEnabled: before.aiEnabled === true, previousBetaInvited: typeof before.betaInvited === 'boolean' ? before.betaInvited : null, createdAt: timestamp })
    return { aiEnabled, betaInvited }
  })
}
