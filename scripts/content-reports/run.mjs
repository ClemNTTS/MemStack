import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { processReport } from './process.mjs'
import { createFirestore, firestoreToken, createGithub, createMistral, fetchSource } from './services.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

async function verifyFiles(files) {
  const allowed = /^(src\/data\/catalog\/corrections\.json|docs\/content\/inspections\/[a-zA-Z0-9-]{1,128}\.md)$/
  for (const file of files) {
    if (!allowed.test(file.path)) throw new Error('Write path rejected')
    const destination = resolve(root, file.path)
    await mkdir(dirname(destination), { recursive: true })
    await writeFile(destination, file.content, 'utf8')
  }
  // Only fixed, repository-controlled verification commands; no model-generated command is executed.
  for (const args of [['test'], ['run', 'build']]) {
    const result = process.platform === 'win32'
      ? spawnSync('cmd.exe', ['/d', '/s', '/c', 'npm.cmd', ...args], { cwd: root, stdio: 'ignore', timeout: 180000 })
      : spawnSync('npm', args, { cwd: root, stdio: 'ignore', timeout: 180000 })
    if (result.error || result.status !== 0) throw new Error('Repository verification failed')
  }
}

async function main() {
  if (process.argv.includes('--check')) {
    const { catalogLessons, catalogCards } = await import('../../src/data/catalog/index.ts')
    const corrections = JSON.parse(await readFile(resolve(root, 'src/data/catalog/corrections.json'), 'utf8'))
    if (corrections.version !== 1 || !Array.isArray(corrections.entries)) throw new Error('Invalid correction registry')
    console.log(`Content worker ready: ${catalogLessons.length} lessons, ${catalogCards.length} cards. No network call or report processed.`)
    return
  }
  const required = ['MISTRAL_API_KEY', 'FIREBASE_SERVICE_ACCOUNT', 'GITHUB_TOKEN', 'GITHUB_REPOSITORY', 'GITHUB_SHA']
  if (required.some(key => !process.env[key])) throw new Error('Missing worker configuration')
  const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', timeout: 10000 })
  const changes = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8', timeout: 10000 })
  if (head.status !== 0 || changes.status !== 0 || head.stdout.trim() !== process.env.GITHUB_SHA
    || changes.stdout.trim()) throw new Error('Worker requires the exact clean checkout being reviewed')
  const token = await firestoreToken(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  const firestore = createFirestore(token)
  // Recover interrupted runs first. Limit one report per run, at most four inference calls.
  const report = await firestore.query('processing') || await firestore.query('pending')
  if (!report) {
    console.log('No pending content report.')
    return
  }
  const { catalogLessons, catalogCards } = await import('../../src/data/catalog/index.ts')
  const result = await processReport(report, {
    lessons: catalogLessons, cards: catalogCards,
    sourceMarkdown: await readFile(resolve(root, 'docs/content/SOURCES.md'), 'utf8'),
    corrections: JSON.parse(await readFile(resolve(root, 'src/data/catalog/corrections.json'), 'utf8')),
    download: fetchSource, complete: createMistral(process.env.MISTRAL_API_KEY, process.env.MISTRAL_MODEL),
    github: createGithub(process.env.GITHUB_TOKEN, process.env.GITHUB_REPOSITORY, process.env.GITHUB_SHA), firestore, verifyFiles,
  })
  console.log(result ? `Content report processing finished: ${result.status}.` : 'Another run owns the active report lease.')
}

main().catch(() => {
  console.error('Content worker failed. Check configuration, service permissions and workflow connectivity; provider details are intentionally not logged.')
  process.exitCode = 1
})
