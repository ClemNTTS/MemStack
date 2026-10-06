import { createSign } from 'node:crypto'
import { safeSourceUrl, decodeDocument, firestoreValue } from './core.mjs'

async function requestJson(url, options = {}, fetcher = fetch) {
  const response = await fetcher(url, { ...options, signal: AbortSignal.timeout(60000), redirect: 'error' })
  if (!response.ok) throw new Error(`Remote request failed (${response.status})`)
  return response.json()
}

export async function firestoreToken(account, fetcher = fetch) {
  if (account.project_id !== 'memstack-9f581' || typeof account.client_email !== 'string' ||
      !account.client_email.endsWith('.iam.gserviceaccount.com') || typeof account.private_key !== 'string') {
    throw new Error('Invalid Firebase service account')
  }
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({ iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600 })).toString('base64url')
  const unsigned = `${header}.${payload}`
  const signature = createSign('RSA-SHA256').update(unsigned).sign(account.private_key, 'base64url')
  const body = new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` })
  const result = await requestJson('https://oauth2.googleapis.com/token', { method: 'POST', body }, fetcher)
  if (typeof result.access_token !== 'string') throw new Error('Missing Firebase access token')
  return result.access_token
}

export function createFirestore(token, fetcher = fetch) {
  const base = 'https://firestore.googleapis.com/v1/projects/memstack-9f581/databases/(default)/documents'
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  return {
    async query(status) {
      const result = await requestJson(`${base}:runQuery`, { method: 'POST', headers, body: JSON.stringify({ structuredQuery: {
        from: [{ collectionId: 'contentReports', allDescendants: true }],
        where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: status } } }, limit: 1,
      } }) }, fetcher)
      const document = result.find(entry => entry.document)?.document
      if (!document) return null
      if (!/^projects\/memstack-9f581\/databases\/\(default\)\/documents\/users\/[^/]+\/contentReports\/[a-zA-Z0-9-]+$/.test(document.name)) {
        throw new Error('Invalid report document path')
      }
      return { ...decodeDocument(document), documentName: document.name, updateTime: document.updateTime,
        reportId: document.name.split('/').at(-1) }
    },
    async patch(report, changes) {
      const url = new URL(`https://firestore.googleapis.com/v1/${report.documentName}`)
      for (const key of Object.keys(changes)) url.searchParams.append('updateMask.fieldPaths', key)
      url.searchParams.set('currentDocument.updateTime', report.updateTime)
      const result = await requestJson(url.href, { method: 'PATCH', headers,
        body: JSON.stringify({ fields: Object.fromEntries(Object.entries(changes).map(([key, value]) => [key, firestoreValue(value)])) }) }, fetcher)
      return { ...report, ...changes, updateTime: result.updateTime }
    },
  }
}

export async function fetchSource(url, fetcher = fetch) {
  let current = safeSourceUrl(url)
  for (let redirect = 0; redirect < 4; redirect += 1) {
    const response = await fetcher(current, { redirect: 'manual', signal: AbortSignal.timeout(20000) })
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      if (!location) throw new Error('Missing source redirect')
      current = safeSourceUrl(new URL(location, current).href)
      await response.body?.cancel()
      continue
    }
    if (!response.ok || !/text\/(html|plain)/i.test(response.headers.get('content-type') || '')) {
      throw new Error('Primary source unavailable')
    }
    const reader = response.body.getReader()
    let total = 0
    const chunks = []
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        total += value.length
        if (total > 524288) throw new Error('Primary source too large')
        chunks.push(value)
      }
    } finally {
      await reader.cancel()
    }
    let text = Buffer.concat(chunks).toString('utf8')
    text = text.replace(/<(script|style|nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    const main = text.match(/<(?:main|article)\b[^>]*>([\s\S]*)<\/(?:main|article)>/i)
    text = (main?.[1] || text).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
    if (text.length < 100) throw new Error('Primary source unreadable')
    // A bounded excerpt is evidence; the agent must abstain when it does not support a correction.
    return { url, excerpt: text.slice(0, 12000) }
  }
  throw new Error('Too many source redirects')
}

export function createMistral(apiKey, model = 'mistral-small-latest', fetcher = fetch) {
  if (!apiKey || !/^[a-zA-Z0-9._-]{1,100}$/.test(model)) throw new Error('Missing or invalid Mistral configuration')
  return async function complete(system, payload) {
    const result = await requestJson('https://api.mistral.ai/v1/chat/completions', { method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, temperature: 0.1, max_tokens: 2500, response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: JSON.stringify(payload) }] }),
    }, fetcher)
    const choice = result.choices?.[0]
    if (choice?.finish_reason !== 'stop' || typeof choice.message?.content !== 'string' || choice.message.content.length > 24000) {
      throw new Error('Incomplete Mistral result')
    }
    return JSON.parse(choice.message.content)
  }
}

export function createGithub(token, repository, expectedSha, fetcher = fetch) {
  if (!token || !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repository)) throw new Error('Invalid GitHub configuration')
  if (!/^[a-f0-9]{40}$/.test(expectedSha || '')) throw new Error('Missing verified checkout SHA')
  const base = `https://api.github.com/repos/${repository}`
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' }
  const call = (path, data) => requestJson(`${base}${path}`, { headers, ...(data ? { method: 'POST', body: JSON.stringify(data) } : {}) }, fetcher)
  return {
    async findPullRequest(branch) {
      const [owner] = repository.split('/')
      const entries = await call(`/pulls?state=all&head=${encodeURIComponent(`${owner}:${branch}`)}&per_page=10`)
      return entries[0] || null
    },
    async openPullRequest(branch, files, lessonId) {
      const main = await call('/git/ref/heads/main')
      if (main.object.sha !== expectedSha) throw new Error('Main changed after checkout; manual review required')
      const commit = await call(`/git/commits/${main.object.sha}`)
      const tree = await call('/git/trees', { base_tree: commit.tree.sha,
        tree: files.map(file => ({ path: file.path, mode: '100644', type: 'blob', content: file.content })) })
      const next = await call('/git/commits', { message: `Propose content correction for ${lessonId}`, tree: tree.sha, parents: [main.object.sha] })
      // Never update an existing branch: a crash after creating it requires manual recovery.
      await call('/git/refs', { ref: `refs/heads/${branch}`, sha: next.sha })
      return call('/pulls', { head: branch, base: 'main', draft: true,
        title: `Review content correction: ${lessonId}`,
        body: 'Automated proposal following a content report. A separate pedagogical inspection approved the bounded text correction.\n\nSee the correction entry and inspection record for consulted primary sources. Repository tests and production build passed before this pull request was opened.\n\nHuman review and merge are required. No learner identifier or raw report comment is published.' })
    },
  }
}
