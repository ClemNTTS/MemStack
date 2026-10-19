import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { AnalysisError } from './analysis.mjs'
import { requireMember, currentAdminStatus } from './accessService.mjs'
import { scheduleServerReview } from './learningAccess.mjs'
import { defaultAlias, nextRankingActivity, activeStreak, validateAlias, rankingDay } from './worldRanking.mjs'
import { organizationHasAccess,queueEnterpriseSeatSync } from './enterpriseBilling.mjs'

const fail = (code, message) => { throw new AnalysisError(code, message) }
const id = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value)
const hash = value => createHash('sha256').update(value).digest('hex')
const exact = (data, keys) => data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === keys.length && keys.every(key => Object.hasOwn(data,key))
const orgPath = organizationId => `organizations/${organizationId}`
const learnerPath = (organizationId,uid) => `${orgPath(organizationId)}/learners/${uid}`
const canonical = value => value && typeof value === 'object' && !Array.isArray(value) ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])) : value

export async function enterpriseActor({db,auth,lookup}) {
  const uid = requireMember(auth)
  const [account,marker] = await Promise.all([lookup(uid),db.doc(`_accountLifecycle/${uid}`).get()])
  if (marker.exists || account.disabled || !account.email || !account.emailVerified) fail('permission-denied','Un compte actif avec une adresse vérifiée est requis.')
  return {uid,email:account.email.trim().toLowerCase(),account}
}

export async function membership(tx,db,organizationId,uid,manager = false,allowUnpaid = false,now = Date.now()) {
  if (!id(organizationId)) fail('invalid-argument','Organisation invalide.')
  const [org,member,marker] = await Promise.all([
    tx.get(db.doc(orgPath(organizationId))),tx.get(db.doc(`${orgPath(organizationId)}/members/${uid}`)),tx.get(db.doc(`_accountLifecycle/${uid}`))
  ])
  if (marker.exists || org.data()?.enabled!==true || (!allowUnpaid && !organizationHasAccess(org.data(),now)) || member.data()?.active !== true) fail('permission-denied','Cet espace entreprise n’est pas accessible.')
  if (manager && member.data().role !== 'manager') fail('permission-denied','Rôle responsable requis.')
  return {organization:org.data(),member:member.data()}
}

export async function manageEnterpriseOrganization({db,auth,lookup,data,now = Date.now()}) {
  const actor = await enterpriseActor({db,auth,lookup})
  const isAdmin = (await currentAdminStatus({db,auth,lookup})).admin
  if (data?.action === 'create') {
    if (!exact(data,['action','name','managerEmail','requestId']) || !id(data.requestId) || data.requestId.length < 16 || typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.trim().length > 100 || !validEmail(data.managerEmail)) fail('invalid-argument','Nom, adresse du responsable et identifiant de demande requis.')
    if (!isAdmin) fail('permission-denied','Création réservée à l’administration MemStack.')
    const candidateId = randomUUID(), code = randomBytes(24).toString('base64url')
    const organizationId = await db.runTransaction(async tx => {
      const receiptRef = db.doc(`_enterpriseProvisioning/${actor.uid}_${data.requestId}`)
      const [marker,receipt] = await Promise.all([tx.get(db.doc(`_accountLifecycle/${actor.uid}`)),tx.get(receiptRef)])
      if (marker.exists) fail('permission-denied','Compte indisponible.')
      const previous = receipt.data()
      if (previous && JSON.stringify(canonical(previous.request)) !== JSON.stringify(canonical(data))) fail('already-exists','Cet identifiant correspond à une autre création.')
      const organizationId = previous?.organizationId ?? candidateId
      if (previous) {
        const organization = await tx.get(db.doc(orgPath(organizationId)))
        if (organization.data()?.enabled !== true) fail('failed-precondition','Organisation désactivée ou indisponible.')
        // Rotate on acknowledgement loss: preserve only hashes and provision one organization.
        tx.delete(db.doc(`_enterpriseInvitations/${previous.invitationHash}`))
      } else {
        tx.create(db.doc(orgPath(organizationId)),{name:data.name.trim(),enabled:true,createdAt:new Date(now).toISOString(),createdBy:actor.uid,offer:'managed-pilot',seatLimit:200})
      }
      tx.create(db.doc(`_enterpriseInvitations/${hash(code)}`),{organizationId,email:data.managerEmail.trim().toLowerCase(),role:'manager',createdAt:now,expiresAt:now+7*86400000,createdBy:actor.uid,usedBy:null})
      tx.set(receiptRef,{request:data,organizationId,invitationHash:hash(code),actorUid:actor.uid})
      return organizationId
    })
    return {organizationId,code}
  }
  if (!id(data?.organizationId)) fail('invalid-argument','Organisation invalide.')
  const organizationId = data.organizationId
  if (data.action === 'enable') {
    if (!isAdmin) fail('permission-denied','Administration MemStack requise.')
    if (!exact(data,['action','organizationId','enabled']) || typeof data.enabled !== 'boolean') fail('invalid-argument','Paramètres invalides.')
    await db.runTransaction(async tx => {
      if ((await tx.get(db.doc(`_accountLifecycle/${actor.uid}`))).exists) fail('permission-denied','Compte indisponible.')
      tx.update(db.doc(orgPath(organizationId)),{enabled:data.enabled})
    })
    return {organizationId,enabled:data.enabled}
  }
  if (data.action === 'myAlias') {
    if (!exact(data,['action','organizationId','alias'])) fail('invalid-argument','Paramètres invalides.')
    const alias = validateAlias({alias:data.alias})
    await db.runTransaction(async tx => {
      const {member} = await membership(tx,db,organizationId,actor.uid,false,false,now)
      const rankRef = db.doc(`${orgPath(organizationId)}/ranking/${actor.uid}`), ranking = await tx.get(rankRef)
      const day = rankingDay(now), edits = member.aliasEditedDay===day ? member.aliasEdits : 0
      if (edits>=3) fail('resource-exhausted','Tu peux modifier ton pseudo trois fois par jour dans cette organisation.')
      tx.update(db.doc(`${orgPath(organizationId)}/members/${actor.uid}`),{alias,aliasEditedDay:day,aliasEdits:edits+1})
      if (ranking.exists) tx.update(rankRef,{alias})
    })
    return {organizationId,alias}
  }
  if (data.action === 'invite' || data.action === 'inviteManager') {
    if (!exact(data,['action','organizationId','email']) || !validEmail(data.email)) fail('invalid-argument','Adresse email invalide.')
    if (data.action==='inviteManager' && !isAdmin) fail('permission-denied','Administration MemStack requise.')
    const code = randomBytes(24).toString('base64url')
    await db.runTransaction(async tx => {
      if (data.action==='inviteManager') {
        const [marker,organization] = await Promise.all([tx.get(db.doc(`_accountLifecycle/${actor.uid}`)),tx.get(db.doc(orgPath(organizationId)))])
        if (marker.exists || !organization.exists) fail('permission-denied','Organisation ou compte indisponible.')
      } else await membership(tx,db,organizationId,actor.uid,true,false,now)
      const budgetRef = db.doc(`${orgPath(organizationId)}/limits/invitations`), budget = (await tx.get(budgetRef)).data()
      const count = budget?.window > now-3600000 ? budget.count : 0
      if (count >= 30) fail('resource-exhausted','Limite de trente invitations par heure atteinte.')
      tx.set(budgetRef,{count:count+1,window:count ? budget.window : now})
      tx.create(db.doc(`_enterpriseInvitations/${hash(code)}`),{organizationId,email:data.email.trim().toLowerCase(),role:data.action==='inviteManager'?'manager':'learner',createdAt:now,expiresAt:now+7*86400000,createdBy:actor.uid,usedBy:null})
    })
    return {organizationId,code}
  }
  if (data.action === 'revoke') {
    if (!exact(data,['action','organizationId','uid']) || !id(data.uid) || data.uid === actor.uid) fail('invalid-argument','Membre invalide : le responsable ne peut pas se retirer lui-même.')
    await db.runTransaction(async tx => {
      const {organization} = await membership(tx,db,organizationId,actor.uid,true,false,now)
      const ref = db.doc(`${orgPath(organizationId)}/members/${data.uid}`), member = await tx.get(ref)
      if (!member.exists || member.data().role === 'manager') fail('permission-denied','Un responsable ne peut retirer un autre responsable.')
      if(organization.offer==='stripe-enterprise') {
        const members=await tx.get(db.collection(`${orgPath(organizationId)}/members`).where('active','==',true))
        await queueEnterpriseSeatSync(tx,db,organizationId,members.size-(member.data().active?1:0))
      }
      tx.update(ref,{active:false,revokedAt:now})
      tx.set(db.doc(`users/${data.uid}/enterpriseMemberships/${organizationId}`),{active:false},{merge:true})
      tx.delete(db.doc(`${orgPath(organizationId)}/ranking/${data.uid}`))
    })
    return {organizationId,revoked:true}
  }
  fail('invalid-argument','Action inconnue.')
}
const validEmail = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export async function joinEnterpriseOrganization({db,auth,lookup,data,now = Date.now()}) {
  const actor = await enterpriseActor({db,auth,lookup})
  if (!exact(data,['code']) || typeof data.code !== 'string' || !/^[A-Za-z0-9_-]{32}$/.test(data.code)) fail('invalid-argument','Code d’invitation invalide.')
  return db.runTransaction(async tx => {
    const ref = db.doc(`_enterpriseInvitations/${hash(data.code)}`), invitation = (await tx.get(ref)).data()
    if (!invitation || invitation.email !== actor.email || invitation.expiresAt <= now || invitation.usedBy) fail('permission-denied','Invitation expirée, déjà utilisée ou destinée à une autre adresse.')
    const organizationId = invitation.organizationId
    const [org,marker,members,previous,spaces] = await Promise.all([
      tx.get(db.doc(orgPath(organizationId))),tx.get(db.doc(`_accountLifecycle/${actor.uid}`)),
      tx.get(db.collection(`${orgPath(organizationId)}/members`).where('active','==',true)),
      tx.get(db.doc(`${orgPath(organizationId)}/members/${actor.uid}`)),
      tx.get(db.collection(`users/${actor.uid}/enterpriseMemberships`).where('active','==',true).limit(20))
    ])
    if (marker.exists || org.data()?.enabled !== true) fail('permission-denied','Organisation indisponible.')
    if(invitation.role!=='manager' && !organizationHasAccess(org.data(),now)) fail('permission-denied','L’abonnement de cette organisation n’est pas actif.')
    const promoting = previous.data()?.active === true && previous.data()?.role === 'learner' && invitation.role === 'manager'
    if (previous.data()?.active === true && !promoting) fail('already-exists','Tu appartiens déjà à cette organisation.')
    if (previous.data()?.revokedAt && (!Number.isFinite(invitation.createdAt) || invitation.createdAt <= previous.data().revokedAt)) fail('permission-denied','Cette invitation précède le retrait d’accès. Demande une nouvelle invitation.')
    if (!promoting && spaces.size >= 20) fail('resource-exhausted','Limite de vingt espaces entreprise atteinte.')
    if (!promoting && members.size >= org.data().seatLimit) fail('resource-exhausted','Le nombre de places de cette organisation est atteint.')
    const member = {...(previous.data()??{}),active:true,role:invitation.role,alias:previous.data()?.alias??defaultAlias(`${organizationId}:${actor.uid}`),joinedAt:promoting?previous.data().joinedAt:new Date(now).toISOString()}
    if(org.data().offer==='stripe-enterprise') await queueEnterpriseSeatSync(tx,db,organizationId,members.size+(promoting?0:1))
    tx.set(db.doc(`${orgPath(organizationId)}/members/${actor.uid}`),member)
    tx.set(db.doc(`users/${actor.uid}/enterpriseMemberships/${organizationId}`),{organizationId,active:true})
    tx.update(ref,{usedBy:actor.uid,usedAt:now})
    return {organizationId}
  })
}

export function validateEnterpriseAction(data,catalog) {
  const base = ['organizationId','requestId','type']
  const fields = data?.type === 'lesson' ? ['lessonId'] : data?.type === 'card' ? ['cardId','rating'] : ['challengeId','answers','catalogVersion']
  if (!exact(data,[...base,...fields]) || !id(data.organizationId) || !id(data.requestId) || data.requestId.length < 16 || !['lesson','card','challenge'].includes(data.type)) fail('invalid-argument','Action invalide.')
  if (data.type === 'card' && !['recalled','forgotten'].includes(data.rating)) fail('invalid-argument','Révision invalide.')
  if (data.type === 'challenge' && (!Number.isSafeInteger(data.catalogVersion) || data.catalogVersion<1)) fail('invalid-argument','Version du défi requise.')
  const entry = data.type === 'challenge' ? catalog.challenges.find(row=>row.id===data.challengeId) : catalog.lessons.find(row=>data.type==='lesson' ? row.id===data.lessonId : row.cards.some(card=>card.id===data.cardId))
  if (!entry) fail('invalid-argument','Contenu entreprise inconnu.')
  if (data.type === 'challenge' && (!exact(data.answers,entry.questions.map(q=>q.id)) || !entry.questions.every(q=>q.options.some(option=>option.id===data.answers[q.id])))) fail('invalid-argument','Réponds à chaque question avec une proposition valide.')
  return entry
}

export function enterprisePrerequisites(entry, catalog, kind = 'lesson') {
  let required = entry.prerequisiteLessonIds
  if (required === undefined && kind === 'challenge') {
    required = catalog.lessons.filter(row => row.chapterId === entry.chapterId && !row.continuous).map(row => row.id)
  }
  if (required === undefined) {
    const foundationIndex = catalog.foundationLessonIds?.indexOf(entry.id) ?? -1
    const index = catalog.lessons.findIndex(row => row.id === entry.id)
    required = foundationIndex >= 0
      ? catalog.foundationLessonIds.slice(0, foundationIndex)
      : index > 0 ? [catalog.lessons[index - 1].id] : []
  }
  if (!Array.isArray(required) || new Set(required).size !== required.length
    || required.some(requiredId => requiredId === entry.id || !catalog.lessons.some(row => row.id === requiredId))) {
    fail('unavailable', 'Les prérequis de cette mission sont indisponibles.')
  }
  return required
}

export async function commitEnterpriseLearningAction({db,auth,lookup,data,catalog,keys,now = Date.now()}) {
  const {uid} = await enterpriseActor({db,auth,lookup})
  if (!Number.isSafeInteger(catalog.version) || catalog.version<1 || keys.version!==catalog.version) fail('unavailable','Version du contenu indisponible.')
  const entry = validateEnterpriseAction(data,catalog), base = learnerPath(data.organizationId,uid)
  return db.runTransaction(async tx => {
    const {member} = await membership(tx,db,data.organizationId,uid,false,false,now)
    const receiptRef = db.doc(`${base}/receipts/${data.requestId}`), budgetRef = db.doc(`${base}/limits/actions`), rankRef = db.doc(`${orgPath(data.organizationId)}/ranking/${uid}`)
    const [receipt,budget,ranking] = await Promise.all([tx.get(receiptRef),tx.get(budgetRef),tx.get(rankRef)])
    if (receipt.exists) {
      if (JSON.stringify(canonical(receipt.data().request)) !== JSON.stringify(canonical(data))) fail('already-exists','Identifiant déjà utilisé.')
      return receipt.data().result
    }
    if (data.type==='challenge' && data.catalogVersion!==catalog.version) fail('failed-precondition','Le défi a été mis à jour. Actualise la page avant de répondre.')
    const count = budget.data()?.window > now-3600000 ? budget.data().count : 0
    if (count >= 120) fail('resource-exhausted','Limite de sécurité atteinte, réessaie plus tard.')
    let result, activity = true
    const summary = {lessons:member.summary?.lessons ?? 0,cards:member.summary?.cards ?? 0,attempts:member.summary?.attempts ?? 0}
    if (data.type === 'lesson') {
      const current = await tx.get(db.doc(`${base}/lessons/${entry.id}`))
      if (!current.exists) {
        const required = enterprisePrerequisites(entry, catalog)
        const previous = await Promise.all(required.map(requiredId => tx.get(db.doc(`${base}/lessons/${requiredId}`))))
        if (previous.some(row => !row.exists || !Number.isFinite(Date.parse(row.data().completedAt)) || Date.parse(row.data().completedAt) > now)) {
          fail('failed-precondition', 'Termine les missions prérequises avant celle-ci.')
        }
      }
      result = {type:'lesson',lessonId:entry.id,completedAt:current.data()?.completedAt ?? new Date(now).toISOString()}
      activity = !current.exists
      if (!current.exists) {
        tx.create(db.doc(`${base}/lessons/${entry.id}`),{completedAt:result.completedAt})
        summary.lessons++
      }
    } else if (data.type === 'card') {
      const [lesson,previous] = await Promise.all([tx.get(db.doc(`${base}/lessons/${entry.id}`)),tx.get(db.doc(`${base}/cards/${data.cardId}`))])
      if (!lesson.exists) fail('failed-precondition','Termine la mission avant ses cartes.')
      if (previous.exists && (!Number.isFinite(Date.parse(previous.data().dueAt)) || Date.parse(previous.data().dueAt)>now)) fail('failed-precondition','Cette carte n’est pas encore due.')
      const card = scheduleServerReview(data.cardId,data.rating,now,previous.data())
      const event = {cardId:data.cardId,rating:data.rating,reviewedAt:card.lastReviewedAt,kind:previous.exists?'review':'new'}
      tx.set(db.doc(`${base}/cards/${data.cardId}`),card)
      tx.create(db.doc(`${base}/reviews/${data.requestId}`),event)
      result = {type:'card',card,event}
      if (!previous.exists) summary.cards++
    } else {
      const required = enterprisePrerequisites(entry, catalog, 'challenge')
      const completed = await Promise.all(required.map(requiredId => tx.get(db.doc(`${base}/lessons/${requiredId}`))))
      if (completed.some(row=>!row.exists || !Number.isFinite(Date.parse(row.data().completedAt)) || Date.parse(row.data().completedAt) > now)) fail('failed-precondition','Termine les missions prérequises avant cette mise en situation.')
      const key = keys.challenges[entry.id]
      if (!key || !entry.questions.every(q=>q.options.some(o=>o.id===key[q.id]))) fail('unavailable','Correction indisponible.')
      const explanations = keys.explanations?.[entry.id]
      if (!explanations || !entry.questions.every(q=>typeof explanations[q.id]==='string' && explanations[q.id].trim())) fail('unavailable','Explications de correction indisponibles.')
      const checks = entry.questions.map(q=>({questionId:q.id,correct:data.answers[q.id]===key[q.id],correctOptionId:key[q.id],explanation:explanations[q.id],questionText:q.prompt,correctAnswerText:q.options.find(option=>option.id===key[q.id]).text,selectedAnswerText:q.options.find(option=>option.id===data.answers[q.id]).text}))
      const correct = checks.filter(row=>row.correct).length
      result = {type:'challenge',id:data.requestId,challengeId:entry.id,catalogVersion:catalog.version,assessmentVersion:keys.version,challengeTitle:entry.title,submittedAt:new Date(now).toISOString(),answers:data.answers,checks,correct,total:checks.length,passed:correct/checks.length>0.7}
      tx.create(db.doc(`${base}/attempts/${data.requestId}`),result)
      summary.attempts++
    }
    tx.set(budgetRef,{count:count+1,window:count?budget.data().window:now})
    tx.create(receiptRef,{request:data,result})
    if (activity) {
      tx.set(rankRef,nextRankingActivity(ranking.data() ?? {alias:member.alias,streak:0,lastDay:null},now))
      tx.update(db.doc(`${orgPath(data.organizationId)}/members/${uid}`),{summary,lastActivityAt:new Date(now).toISOString()})
    }
    return result
  })
}

export async function getEnterpriseWorkspace({db,auth,lookup,data,now = Date.now()}) {
  const {uid} = await enterpriseActor({db,auth,lookup})
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).some(key=>key!=='organizationId') || (data.organizationId !== undefined && !id(data.organizationId))) fail('invalid-argument','Paramètres invalides.')
  return db.runTransaction(async tx => {
    const indexes = await tx.get(db.collection(`users/${uid}/enterpriseMemberships`).where('active','==',true).limit(20))
    const organizations = []
    for (const index of indexes.docs) {
      const [org,member] = await Promise.all([tx.get(db.doc(orgPath(index.id))),tx.get(db.doc(`${orgPath(index.id)}/members/${uid}`))])
      if (org.data()?.enabled && member.data()?.active) organizations.push({id:index.id,name:org.data().name,role:member.data().role,learningEnabled:organizationHasAccess(org.data(),now)})
    }
    const organizationId = data.organizationId ?? organizations[0]?.id
    if (!organizationId) return {organizations,organization:null,progress:{lessons:{},cards:{},reviews:[],attempts:[]},ranking:[],members:[]}
    const {organization,member} = await membership(tx,db,organizationId,uid,false,true,now)
    if(!organizationHasAccess(organization,now)) return {organizations,organization:{id:organizationId,name:organization.name,role:member.role,learningEnabled:false},progress:{lessons:{},cards:{},reviews:[],attempts:[]},ranking:[],members:[]}
    const base = learnerPath(organizationId,uid)
    const [lessons,cards,reviews,attempts,ranks,members] = await Promise.all([
      tx.get(db.collection(`${base}/lessons`).limit(200)),tx.get(db.collection(`${base}/cards`).limit(2000)),
      tx.get(db.collection(`${base}/reviews`).orderBy('reviewedAt','desc').limit(500)),tx.get(db.collection(`${base}/attempts`).orderBy('submittedAt','desc').limit(100)),
      tx.get(db.collection(`${orgPath(organizationId)}/ranking`).limit(200)),member.role==='manager'?tx.get(db.collection(`${orgPath(organizationId)}/members`).where('active','==',true).limit(200)):Promise.resolve(null)
    ])
    const rows = ranks.docs.map(row=>({uid:row.id,...row.data(),streak:activeStreak(row.data(),now)})).sort((a,b)=>b.streak-a.streak||a.uid.localeCompare(b.uid))
    let rank = 0, last = -1
    const ranking = rows.map((row,index)=>{if(row.streak!==last){rank=index+1;last=row.streak} return {alias:row.alias,streak:row.streak,rank,self:row.uid===uid}})
    return {organizations,organization:{id:organizationId,name:organization.name,role:member.role,learningEnabled:true},progress:{lessons:Object.fromEntries(lessons.docs.map(row=>[row.id,row.data()])),cards:Object.fromEntries(cards.docs.map(row=>[row.id,row.data()])),reviews:reviews.docs.map(row=>row.data()),attempts:attempts.docs.map(row=>row.data())},ranking,members:members?.docs.map(row=>({uid:row.id,alias:row.data().alias,role:row.data().role,active:row.data().active,summary:row.data().summary??{lessons:0,cards:0,attempts:0},lastActivityAt:row.data().lastActivityAt??null}))??[]}
  })
}

export async function exportEnterpriseData(db,uid) {
  const indexes = await db.collection(`users/${uid}/enterpriseMemberships`).get()
  const output = []
  for (const index of indexes.docs) {
    const organizationId = index.id, base = learnerPath(organizationId,uid)
    const collections = await Promise.all(['lessons','cards','reviews','attempts','receipts','limits','practiceFeedback'].map(async name=>({name,rows:(await db.collection(`${base}/${name}`).limit(5001).get()).docs.map(row=>({id:row.id,...row.data()}))})))
    if (collections.some(group=>group.rows.length>5000)) fail('resource-exhausted','Export entreprise trop volumineux, contacte l’administration.')
    const [member,ranking] = await Promise.all([db.doc(`${orgPath(organizationId)}/members/${uid}`).get(),db.doc(`${orgPath(organizationId)}/ranking/${uid}`).get()])
    output.push({organizationId,membership:member.data()??null,ranking:ranking.data()??null,collections})
  }
  return output
}
export async function deleteEnterpriseData(db,uid,email) {
  const indexes = await db.collection(`users/${uid}/enterpriseMemberships`).get()
  for (const index of indexes.docs) {
    await db.runTransaction(async tx=>{
      const [member,managers,organization] = await Promise.all([
        tx.get(db.doc(`${orgPath(index.id)}/members/${uid}`)),
        tx.get(db.collection(`${orgPath(index.id)}/members`).where('active','==',true)),
        tx.get(db.doc(orgPath(index.id)))
      ])
      const lastManager=member.data()?.role==='manager' && !managers.docs.some(row=>row.id!==uid && row.data().role==='manager')
      if(organization.data()?.offer==='stripe-enterprise') await queueEnterpriseSeatSync(tx,db,index.id,lastManager?0:Math.max(0,managers.size-(member.data()?.active?1:0)))
      if (organization.exists && lastManager) tx.update(db.doc(orgPath(index.id)),{enabled:false,...(organization.data().offer==='stripe-enterprise'?{entitlement:{...(organization.data().entitlement??{}),status:'inactive',seatLimit:0,paidUntil:null}}:{})})
      tx.delete(db.doc(`${orgPath(index.id)}/members/${uid}`))
      tx.delete(db.doc(`${orgPath(index.id)}/ranking/${uid}`))
    })
    await db.recursiveDelete(db.doc(learnerPath(index.id,uid)))
  }
  const invitations = await db.collection('_enterpriseInvitations').where('createdBy','==',uid).get()
  for (const invitation of invitations.docs) await invitation.ref.update({createdBy:null})
  const usedInvitations = await db.collection('_enterpriseInvitations').where('usedBy','==',uid).get()
  for (const invitation of usedInvitations.docs) await invitation.ref.delete()
  if (email) {
    const addressed = await db.collection('_enterpriseInvitations').where('email','==',email.trim().toLowerCase()).get()
    for (const invitation of addressed.docs) await invitation.ref.delete()
  }
  const organizations = await db.collection('organizations').where('createdBy','==',uid).get()
  for (const organization of organizations.docs) await organization.ref.update({createdBy:null})
  const provisioning = await db.collection('_enterpriseProvisioning').where('actorUid','==',uid).get()
  for (const receipt of provisioning.docs) await receipt.ref.delete()
  const selfService = await db.collection('_enterpriseSelfService').where('actorUid','==',uid).get()
  for (const receipt of selfService.docs) await receipt.ref.delete()
}
