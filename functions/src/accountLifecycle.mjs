import { HttpsError } from 'firebase-functions/v2/https'

const MAX_DOCUMENTS = 5000
const MAX_BYTES = 8 * 1024 * 1024

export function requireOwnAccount(request, deleting = false, now = Date.now()) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Connexion Google requise.')
  if (request.auth.token.firebase?.sign_in_provider !== 'google.com') throw new HttpsError('permission-denied', 'Connexion Google requise.')
  if (!request.app) throw new HttpsError('failed-precondition', 'Attestation de l’application requise.')
  const expected = deleting ? ['confirmation'] : []
  if (!request.data || typeof request.data !== 'object' || Array.isArray(request.data)
    || Object.keys(request.data).some(key => !expected.includes(key))) throw new HttpsError('invalid-argument', 'Paramètres invalides.')
  if (deleting) {
    const token = request.auth.token
    if (token.firebase?.sign_in_provider !== 'google.com' || !Number.isFinite(token.auth_time)
      || token.auth_time * 1000 > now || now - token.auth_time * 1000 > 300000) {
      throw new HttpsError('failed-precondition', 'Reconnecte-toi avec Google avant la suppression.')
    }
    if (request.data.confirmation !== 'SUPPRIMER') throw new HttpsError('invalid-argument', 'Confirmation requise.')
  }
  return request.auth.uid
}

export function serializeAccountValue(value) {
  if (value === null || typeof value !== 'object') return value
  if (typeof value.toDate === 'function') return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(serializeAccountValue)
  if (typeof value.path === 'string' && typeof value.get === 'function') return { reference: value.path }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeAccountValue(item)]))
}

// Traverse even missing parent documents: Firestore permits their subcollections.
export async function exportAccountTree(db, uid) {
  const documents = []
  let bytes = 0
  async function visit(ref) {
    const snapshot = await ref.get()
    if (snapshot.exists) {
      const item = { path: ref.path.slice(`users/${uid}`.length) || '/', data: serializeAccountValue(snapshot.data()) }
      bytes += Buffer.byteLength(JSON.stringify(item))
      if (documents.length >= MAX_DOCUMENTS || bytes > MAX_BYTES) throw new HttpsError('resource-exhausted', 'Export trop volumineux. Contacte l’administrateur pour un export complet.')
      documents.push(item)
    }
    for (const collection of await ref.listCollections()) {
      for (const child of await collection.listDocuments()) await visit(child)
    }
  }
  await visit(db.doc(`users/${uid}`))
  return documents
}

async function ownAudits(db, uid) {
  const collection = db.collection('_challengeAccessAudit')
  const results = await Promise.all(['actorUid', 'targetUid'].map(field => collection.where(field, '==', uid).get()))
  const entries = new Map()
  for (const result of results) for (const doc of result.docs) entries.set(doc.id, doc)
  return [...entries.values()]
}

export function createAccountLifecycle({ db, auth }) {
  return {
    exportAccountData: async request => {
      const uid = requireOwnAccount(request)
      if ((await db.doc(`_accountLifecycle/${uid}`).get()).exists) throw new HttpsError('failed-precondition', 'Suppression en cours ou terminée.')
      const account = await auth.getUser(uid)
      const documents = await exportAccountTree(db, uid)
      const audit = (await ownAudits(db, uid)).map(entry => {
        const data = serializeAccountValue(entry.data())
        return { id: entry.id, ...data, actorUid: data.actorUid === uid ? uid : null, targetUid: data.targetUid === uid ? uid : null }
      })
      const output = { version: 1, exportedAt: new Date().toISOString(), account: { uid, email: account.email ?? null, displayName: account.displayName ?? null, createdAt: account.metadata.creationTime, lastSignInAt: account.metadata.lastSignInTime }, documents, accessAudit: audit }
      if (Buffer.byteLength(JSON.stringify(output)) > MAX_BYTES) throw new HttpsError('resource-exhausted', 'Export trop volumineux. Contacte l’administrateur.')
      if ((await db.doc(`_accountLifecycle/${uid}`).get()).exists) throw new HttpsError('failed-precondition', 'Suppression en cours.')
      return output
    },
    deleteAccountData: async request => {
      const uid = requireOwnAccount(request, true)
      const marker = db.doc(`_accountLifecycle/${uid}`)
      // Persistent minimal marker closes client, worker and in-flight analysis races.
      await marker.set({ status: 'deleting' })
      for (const entry of await ownAudits(db, uid)) {
        const data = entry.data()
        const patch = {}
        if (data.actorUid === uid) patch.actorUid = null
        if (data.targetUid === uid) patch.targetUid = null
        await entry.ref.update(patch)
      }
      await db.recursiveDelete(db.doc(`users/${uid}`))
      // Verify no own documents remain, including descendants of missing parents.
      if ((await exportAccountTree(db, uid)).length !== 0) throw new HttpsError('unavailable', 'Suppression incomplète. Réessaie.')
      try { await auth.deleteUser(uid) } catch (error) { if (error.code !== 'auth/user-not-found') throw error }
      await marker.set({ status: 'deleted' })
      return { deleted: true }
    }
  }
}
