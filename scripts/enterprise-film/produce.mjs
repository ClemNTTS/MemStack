import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'
import { frame } from './draw.mjs'

const work = '.npm-cache/enterprise-film'
const destination = 'public/enterprise/video'
await mkdir(work, { recursive: true })
await mkdir(destination, { recursive: true })

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', windowsHide: true })
    child.on('error', reject)
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)))
  })
}

if (!process.argv.includes('--skip-render')) {
  await run(process.execPath, ['scripts/enterprise-film/render.mjs', '--render', `${work}/master-silent.mp4`])
}
await run(process.env.PYTHON || 'python', ['scripts/enterprise-film/soundtrack.py', `${work}/soundtrack.wav`])
if (!process.argv.includes('--skip-narration')) {
  await run(process.env.PYTHON || 'python', ['scripts/enterprise-film/narration.py'])
}

const inputs = ['-y', '-hide_banner', '-loglevel', 'warning', '-i', `${work}/master-silent.mp4`, '-i', `${work}/soundtrack.wav`, '-i', `${work}/narration.wav`]
const mix = '[1:a]loudnorm=I=-22:TP=-3:LRA=7,volume=0.55[music];[2:a]highpass=f=80,loudnorm=I=-16:TP=-2:LRA=7,asplit=2[voice][detector];[music][detector]sidechaincompress=threshold=0.025:ratio=6:attack=15:release=250[bed];[bed][voice]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.89:level=false[mix]'
const sound = ['-filter_complex', mix, '-map', '0:v:0', '-map', '[mix]', '-ar', '48000', '-shortest']
const metadata = ['-metadata', 'title=MemStack Entreprise - Faites de l’IA une compétence collective', '-metadata', 'comment=Original motion design, original 120 BPM instrumental and local French synthetic narration (Kokoro ff_siwis).']
await run('ffmpeg', [...inputs, ...sound, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', ...metadata, `${destination}/memstack-entreprise.mp4`])
await run('ffmpeg', [...inputs, ...sound, '-c:v', 'libvpx-vp9', '-crf', '32', '-b:v', '0', '-row-mt', '1', '-cpu-used', '4', '-pix_fmt', 'yuv420p', '-c:a', 'libopus', '-b:a', '96k', ...metadata, `${destination}/memstack-entreprise.webm`])
await sharp(Buffer.from(frame(44.5))).webp({ quality: 92 }).toFile(`${destination}/memstack-entreprise-poster.webp`)
await run(process.execPath, ['scripts/enterprise-film/render.mjs', '--contact-sheet', `${work}/contact-sheet-final.png`])
await sharp(`${work}/contact-sheet-final.png`).webp({ quality: 88 }).toFile('docs/video/ENTERPRISE_FILM_STORYBOARD.webp')
console.log(`Film exports ready in ${destination}`)
