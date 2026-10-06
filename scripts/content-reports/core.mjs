import { createHash } from 'node:crypto'

export const correctionsPath = 'src/data/catalog/corrections.json'
export const maximumPasses = 2
const primaryHosts = new Set([
  'developer.mozilla.org', 'www.w3.org', 'www.typescriptlang.org', 'react.dev',
  'nodejs.org', 'cheatsheetseries.owasp.org', 'www.postgresql.org',
  'learn.microsoft.com', 'www.rabbitmq.com', 'docs.aws.amazon.com',
  'firebase.google.com', 'docs.docker.com', 'docs.github.com', 'docs.npmjs.com',
  'docs.cloud.google.com', 'cloud.google.com', 'developer.hashicorp.com',
  'kubernetes.io', 'opentelemetry.io', 'prometheus.io', 'sre.google',
  'www.rfc-editor.org', 'openid.net', 'playwright.dev', 'web.dev',
  'git-scm.com', 'developer.chrome.com',
])

export function contentHash(snapshot) {
  return createHash('sha256').update(snapshot).digest('hex')
}

export function snapshotFor(lesson, cards, cardId = '') {
  if (cardId) {
    const card = cards.find(card => card.id === cardId && lesson.cardIds.includes(card.id))
    if (!card) throw new Error('Unknown card')
    return JSON.stringify({ card })
  }
  return JSON.stringify({ lesson, cards: lesson.cardIds.map(id => {
    const card = cards.find(card => card.id === id)
    if (!card) throw new Error('Unknown card')
    return card
  }) })
}

export function validateReport(report, lessons, cards) {
  if (report.version !== 1 || !['factual', 'unclear', 'code', 'other'].includes(report.kind) ||
      typeof report.comment !== 'string' || report.comment.trim().length === 0 || report.comment.length > 2000 ||
      typeof report.cardId !== 'string' || typeof report.contentSnapshot !== 'string' || report.contentSnapshot.length > 12000 ||
      !/^[a-f0-9]{64}$/.test(report.contentVersion) || contentHash(report.contentSnapshot) !== report.contentVersion) {
    throw new Error('Invalid report')
  }
  const lesson = lessons.find(lesson => lesson.id === report.lessonId)
  if (!lesson || snapshotFor(lesson, cards, report.cardId) !== report.contentSnapshot) {
    throw new Error('Content changed or target unknown; manual review required')
  }
  return lesson
}

export function safeSourceUrl(value) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || !primaryHosts.has(url.hostname) ||
      url.username || url.password || url.port || url.hash) throw new Error('Source URL rejected')
  return url.href
}

export function lessonSources(markdown, lessonId) {
  const references = new Map([...markdown.matchAll(/^\[([^\]]+)\]:\s+(https:\/\/\S+)/gm)]
    .map(match => [match[1], match[2]]))
  const row = markdown.split('\n').find(line => line.startsWith(`| \`${lessonId}\` |`)) || ''
  const urls = [...row.matchAll(/\]\[([^\]]+)\]/g)].map(match => references.get(match[1]))
  return [...new Set(urls.filter(Boolean).map(safeSourceUrl))].slice(0, 3)
}

export function validateProposal(proposal, report, lesson, cards, consultedUrls) {
  if (!proposal || !['correct', 'no_change', 'needs_review'].includes(proposal.verdict) ||
      typeof proposal.reason !== 'string' || proposal.reason.length === 0 || proposal.reason.length > 1500) {
    throw new Error('Invalid author verdict')
  }
  if (proposal.verdict !== 'correct') return { ...proposal, patches: [], sources: [] }
  if (!Array.isArray(proposal.patches) || proposal.patches.length === 0 || proposal.patches.length > 8 ||
      !Array.isArray(proposal.sources) || proposal.sources.length === 0 || proposal.sources.length > 3 ||
      proposal.sources.some(url => !consultedUrls.includes(url))) throw new Error('Invalid correction evidence')
  const seen = new Set()
  for (const patch of proposal.patches) {
    if (!patch || Object.keys(patch).sort().join(',') !== 'field,id,target,value' ||
        typeof patch.value !== 'string' || !patch.value.trim() || patch.value.length > 4000 ||
        /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(patch.value)) throw new Error('Invalid text patch')
    const key = `${patch.target}/${patch.id}/${patch.field}`
    if (seen.has(key)) throw new Error('Duplicate patch')
    seen.add(key)
    if (report.cardId && (patch.target !== 'card' || patch.id !== report.cardId)) throw new Error('Card report scope exceeded')
    let original
    if (patch.target === 'card' && ['question', 'answer'].includes(patch.field) && lesson.cardIds.includes(patch.id)) {
      original = cards.find(card => card.id === patch.id)?.[patch.field]
    } else if (!report.cardId && patch.target === 'lesson' && patch.id === lesson.id && patch.field === 'title') {
      original = lesson.title
    } else if (!report.cardId && patch.target === 'step') {
      const step = lesson.steps.find(step => step.id === patch.id)
      const fields = { message: ['text'], question: ['prompt'], image: ['alt', 'caption'] }
      if (step && fields[step.type].includes(patch.field)) original = step[patch.field] ?? ''
    } else if (!report.cardId && patch.target === 'choice' && ['label', 'feedback'].includes(patch.field)) {
      const [stepId, choiceId, extra] = patch.id.split('/')
      const step = lesson.steps.find(step => step.id === stepId && step.type === 'question')
      if (!extra) original = step?.choices.find(choice => choice.id === choiceId)?.[patch.field]
    }
    if (typeof original !== 'string' || original === patch.value) throw new Error('Invalid target or unchanged patch')
  }
  return proposal
}

export function validateInspection(value) {
  if (!value || !['approve', 'reject', 'needs_review'].includes(value.verdict) ||
      typeof value.reason !== 'string' || !value.reason.trim() || value.reason.length > 1500) {
    throw new Error('Invalid inspection verdict')
  }
  return value
}

export function appendCorrection(document, entry) {
  if (document.version !== 1 || !Array.isArray(document.entries)) throw new Error('Invalid corrections document')
  if (document.entries.some(existing => existing.reportId === entry.reportId)) throw new Error('Already corrected')
  return { version: 1, entries: [...document.entries, entry] }
}

export function firestoreValue(value) {
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'number' && Number.isInteger(value)) return { integerValue: String(value) }
  if (typeof value === 'boolean') return { booleanValue: value }
  throw new Error('Unsupported Firestore field')
}

export function decodeDocument(document) {
  return Object.fromEntries(Object.entries(document.fields || {}).map(([key, value]) => [key,
    value.stringValue ?? (value.integerValue !== undefined ? Number(value.integerValue) : value.booleanValue ?? value.timestampValue),
  ]))
}
