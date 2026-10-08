import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// Reuse the existing MemStack mascot. Only resize and compose onto an opaque square.
const source = new URL('../public/memo/recalled.png', import.meta.url)
const output = new URL('../public/icons/', import.meta.url)
await mkdir(output, { recursive: true })
for (const [name, size, ratio] of [
  ['favicon', 48, .84],
  ['apple-touch-icon', 180, .84],
  ['icon-192', 192, .84],
  ['icon-512', 512, .84],
  // A square of side 56% fits entirely inside the maskable 80% diameter safe circle.
  ['icon-maskable-512', 512, .56],
]) {
  const extent = Math.round(size * ratio)
  const mascot = await sharp(fileURLToPath(source))
    .resize(extent, extent, { fit: 'contain', background: '#f7f3ed00' })
    .png().toBuffer()
  await sharp({ create: { width: size, height: size, channels: 3, background: '#f7f3ed' } })
    .composite([{ input: mascot, gravity: 'center' }])
    .png().toFile(fileURLToPath(new URL(`${name}.png`, output)))
}
