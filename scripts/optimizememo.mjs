import { stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const memoDirectory = new URL('../public/memo/', import.meta.url)

for (const name of ['forgotten', 'learning', 'recalled', 'unsure']) {
  const source = fileURLToPath(new URL(`${name}.png`, memoDirectory))
  const target = fileURLToPath(new URL(`${name}.webp`, memoDirectory))
  await sharp(source)
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 100, effort: 6 })
    .toFile(target)
  const [original, optimized] = await Promise.all([stat(source), stat(target)])
  console.log(`${name}: ${original.size} → ${optimized.size} bytes`)
}
