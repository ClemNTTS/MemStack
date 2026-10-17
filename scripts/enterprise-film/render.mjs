import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import sharp from 'sharp'
import { frame } from './draw.mjs'
import { film, scenes } from './timeline.mjs'

const args = process.argv.slice(2)
const option = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1] }
const width = Number(option('--width') || film.width)
const height = Math.round(width * film.height / film.width)
const fps = Number(option('--fps') || film.fps)
const png = time => sharp(Buffer.from(frame(time, width, height))).png().toBuffer()
const ensure = async file => { await mkdir(path.dirname(path.resolve(file)), { recursive: true }); return file }

async function still(time, file) {
  await writeFile(await ensure(file), await png(time))
  console.log(`Still ${time}s → ${file}`)
}

async function contactSheet(file) {
  const times = option('--times') ? option('--times').split(',').map(Number) : scenes.map(scene => scene.start + (scene.end - scene.start) * .65)
  const rows = Math.ceil(times.length / 2)
  const items = await Promise.all(times.map(async (time, i) => ({ input: await sharp(await png(time)).resize(640, 360).png().toBuffer(), left: (i % 2) * 640, top: Math.floor(i / 2) * 390 })))
  const captions = `<svg width="1280" height="${rows * 390}">${times.map((time, i) => `<text x="${(i % 2) * 640 + 14}" y="${Math.floor(i / 2) * 390 + 381}" fill="#30263d" font-family="Segoe UI" font-size="16">${time.toFixed(2)} s</text>`).join('')}</svg>`
  await sharp({ create: { width: 1280, height: rows * 390, channels: 4, background: '#e8e3dc' } }).composite([...items, { input: Buffer.from(captions), left: 0, top: 0 }]).png().toFile(await ensure(file))
  console.log(`Contact sheet → ${file}`)
}

async function render(file) {
  await ensure(file)
  const webm = file.endsWith('.webm')
  const codec = webm ? ['-c:v', 'libvpx-vp9', '-crf', '31', '-b:v', '0', '-row-mt', '1', '-cpu-used', '3'] : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-movflags', '+faststart']
  const child = spawn(option('--ffmpeg') || 'ffmpeg', ['-y', '-hide_banner', '-loglevel', 'warning', '-f', 'image2pipe', '-vcodec', 'png', '-framerate', String(fps), '-i', 'pipe:0', '-an', ...codec, '-pix_fmt', 'yuv420p', file], { stdio: ['pipe', 'inherit', 'inherit'] })
  const completion = once(child, 'close')
  child.on('error', error => { console.error(error.message); process.exitCode = 1 })
  const count = Math.round(film.duration * fps)
  for (let index = 0; index < count; index++) {
    if (child.exitCode !== null) throw new Error(`ffmpeg exited ${child.exitCode}`)
    if (!child.stdin.write(await png(index / fps))) await once(child.stdin, 'drain')
    if (index % (fps * 4) === 0) console.log(`${index}/${count} frames (${Math.round(index / count * 100)}%)`)
  }
  child.stdin.end()
  const [code] = await completion
  if (code !== 0) throw new Error(`ffmpeg exited ${code}`)
  console.log(`Rendered ${count} frames → ${file}`)
}

if (args.includes('--still')) {
  const index = args.indexOf('--still')
  await still(Number(args[index + 1]), args[index + 2] || '.npm-cache/enterprise-film/still.png')
} else if (args.includes('--contact-sheet')) {
  await contactSheet(option('--contact-sheet') || '.npm-cache/enterprise-film/contact-sheet.png')
} else if (args.includes('--render')) {
  await render(option('--render'))
} else {
  console.log('node scripts/enterprise-film/render.mjs --still 14 output.png | --contact-sheet output.png | --render output.mp4 [--width 1920] [--fps 30] [--ffmpeg path]')
}
