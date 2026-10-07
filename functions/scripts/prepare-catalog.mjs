import { copyFile, mkdir } from 'node:fs/promises'

await mkdir(new URL('../catalog/', import.meta.url), { recursive: true })
await copyFile(new URL('../../shared/challengeDossiers.json', import.meta.url), new URL('../catalog/challengeDossiers.json', import.meta.url))
