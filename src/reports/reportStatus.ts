export const reportStatuses = {
  pending: ['Reçu', 'En attente de traitement. Aucune date de correction garantie.'],
  processing: ['En cours', 'Une proposition est en cours de vérification.'],
  needs_review: ['Revue humaine nécessaire', 'Une personne doit examiner ce signalement. Aucun verdict d’examen ne sera modifié.'],
  no_change: ['Sans modification', 'La vérification n’a pas retenu de correction.'],
  pr_open: ['Correction proposée', 'La proposition attend une revue humaine sur GitHub.'],
  pr_closed: ['Proposition fermée', 'La proposition a été fermée sans fusion.'],
  pr_merged: ['Correction intégrée', 'La correction est intégrée au dépôt. Sa publication sur le site reste à confirmer.'],
  published: ['Correction publiée', 'Un déploiement GitHub Pages réussi contient la correction fusionnée.'],
} as const

export type ReportStatus = keyof typeof reportStatuses
export type ReportRecord = { id: string, status: ReportStatus, comment: string, kind: string, createdAt: string,
  lessonId: string, cardId: string, contentVersion: string, targetType?: string, challengeId?: string,
  challengeVersion?: number, rubricVersion?: number, promptVersion?: string, model?: string, attemptId?: string, prUrl?: string,
  deploymentSha?: string, deploymentUrl?: string }

export function reportPullRequestUrl(value: unknown): string | undefined {
  return typeof value === 'string' && /^https:\/\/github\.com\/ClemNTTS\/MemStack\/pull\/[1-9][0-9]*$/.test(value) ? value : undefined
}

export function decodeContentReport(id: string, data: Record<string, unknown>): ReportRecord {
  if (!Object.hasOwn(reportStatuses, String(data.status)) || ![1, 2].includes(data.version as number)
    || typeof data.comment !== 'string' || typeof data.contentVersion !== 'string'
    || !/^[a-f0-9]{64}$/.test(data.contentVersion) || typeof data.lessonId !== 'string' || typeof data.cardId !== 'string') {
    throw new Error('Signalement illisible')
  }
  if (data.version === 2 && (!['challenge', 'analysis'].includes(String(data.targetType))
    || typeof data.challengeId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.challengeId)
    || !Number.isInteger(data.challengeVersion) || !Number.isInteger(data.rubricVersion)
    || typeof data.attemptId !== 'string' || typeof data.promptVersion !== 'string' || typeof data.model !== 'string')) throw new Error('Cible illisible')
  if (data.status === 'published' && (typeof data.deploymentSha !== 'string' || !/^[a-f0-9]{40}$/.test(data.deploymentSha))) throw new Error('Version publiée absente')
  const timestamp = data.createdAt as { toDate?: () => Date } | undefined
  const date = typeof data.createdAt === 'string' ? new Date(data.createdAt) : timestamp?.toDate?.()
  if (!date || !Number.isFinite(date.getTime())) throw new Error('Date du signalement invalide')
  return { id, status: data.status as ReportStatus, comment: data.comment, kind: String(data.kind),
    createdAt: date.toISOString(), lessonId: data.lessonId, cardId: data.cardId, contentVersion: data.contentVersion,
    ...(data.version === 2 ? { targetType: String(data.targetType), challengeId: String(data.challengeId),
      challengeVersion: Number(data.challengeVersion), rubricVersion: Number(data.rubricVersion),
      promptVersion: String(data.promptVersion), model: String(data.model), attemptId: String(data.attemptId) } : {}),
    prUrl: reportPullRequestUrl(data.prUrl),
    deploymentSha: typeof data.deploymentSha === 'string' && /^[a-f0-9]{40}$/.test(data.deploymentSha) ? data.deploymentSha : undefined,
    deploymentUrl: typeof data.deploymentUrl === 'string' && /^https:\/\/github\.com\/ClemNTTS\/MemStack\/actions\/runs\/[1-9][0-9]*$/.test(data.deploymentUrl) ? data.deploymentUrl : undefined }
}
