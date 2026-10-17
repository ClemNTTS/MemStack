import { scenes, progress as p, mix, sceneOpacity, clamp } from './timeline.mjs'
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'

// Reuse the product's approved transparent mascot artwork. PNG embedding keeps
// rendering independent of the host SVG engine's WebP support.
const memoArtwork = Object.fromEntries(await Promise.all([
  ['guide', 'journey-guide.webp'],
  ['learning', 'learning.webp'],
  ['celebrate', 'journey-celebrate.webp']
].map(async ([name, file]) => {
  const source = await readFile(new URL(`../../public/memo/${file}`, import.meta.url))
  const png = await sharp(source).resize({ width: 400, height: 400, fit: 'inside' }).png().toBuffer()
  return [name, `data:image/png;base64,${png.toString('base64')}`]
})))

const C = { paper: '#f5f2eb', ink: '#30263d', purple: '#75539d', lilac: '#eadcf5', sage: '#b6c6b7', muted: '#766780', white: '#fffdf9', line: '#d7cddd' }
const xml = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const group = (body, attrs = '') => `<g ${attrs}>${body}</g>`
const rect = (x, y, w, h, fill, r = 20, rest = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${rest}/>`
const text = (s, x, y, size = 30, color = C.ink, weight = 600, rest = '') => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" ${rest}>${xml(s)}</text>`
const line = (x1, y1, x2, y2, color = C.line, width = 2, rest = '') => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${rest}/>`
const circle = (x, y, r, fill, rest = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${rest}/>`
const arrow = (x, y, len, amount = 1, color = C.purple) => group(line(x, y, x + len, y, color, 3) + `<path d="M${x + len - 8} ${y - 7}l8 7-8 7" fill="none" stroke="${color}" stroke-width="3"/>`, `opacity="${amount}"`)
const enter = (body, t, delay = 0, x = 0, y = 24) => { const a = p(t, delay); return group(body, `opacity="${a}" transform="translate(${x * (1 - a)} ${y * (1 - a)})"`) }
const tag = () => ''
const check = (x, y, amount = 1) => `<path d="M${x} ${y}l7 7 14-16" fill="none" stroke="${C.purple}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="32" stroke-dashoffset="${32 * (1 - amount)}" opacity="${amount > 0 ? 1 : 0}"/>`
const ring = (x, y, r, color = C.purple) => circle(x, y, r, 'none', `stroke="${color}" stroke-width="2"`)

function memo(name, x, y, size, t, delay) {
  const amount = p(t, delay, .6)
  const scale = mix(.84, 1, amount)
  const center = size / 2
  return group(`<image href="${memoArtwork[name]}" x="${-center}" y="${-center}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"/>`, `opacity="${amount}" transform="translate(${x + center} ${y + center + 12 * (1 - amount)}) scale(${scale})"`)
}

function title(label, headline, subtitle, t) {
  return enter(tag(label, 96, 116), t, .1) + enter(text(headline, 96, 190, 64, C.ink, 700, 'letter-spacing="-2"'), t, .18) + enter(text(subtitle, 98, 249, 34, C.muted, 400), t, .35)
}

function sheet(x, y, w, h, label, accent = C.lilac, amount = 1) {
  return rect(x + 3, y + 7, w, h, '#30263d', 20, 'opacity=".045"') + rect(x, y, w, h, C.white, 20, `stroke="${C.line}"`) + rect(x + 20, y + 22, 42, 5, accent, 2) + text(label, x + 20, y + 61, 23, C.ink, 600) + [0, 1, 2].map(i => line(x + 21, y + 91 + i * 17, x + 21 + (w - 44) * (.9 - .2 * (i % 2)) * amount, y + 91 + i * 17, C.line, 4)).join('')
}

function ideas(t) {
  const a = p(t, 2, 1.1)
  let out = tag('MEMSTACK ENTREPRISE', 96, 116)
  out += text('Votre équipe a des idées.', 96, 194, 68, C.ink, 700, 'letter-spacing="-2.3"')
  out += enter(text('Donnez-leur une méthode.', 96, 255, 43, C.purple, 600, 'letter-spacing="-1.4"'), t, 1)
  out += memo('guide', 1030, 80, 150, t, .25)
  const labels = ['Mieux rédiger', 'Relier les tâches', 'Créer un projet']
  const starts = [[145, 398, -9], [500, 345, 5], [852, 390, -4]]
  for (let i = 0; i < 3; i++) {
    const [x, y, rot] = starts[i]
    const targetX = 146 + i * 343
    const xx = mix(x, targetX, a), yy = mix(y, 365, a), angle = rot * (1 - a)
    out += enter(group(sheet(-132, -30, 264, 191, labels[i], [C.lilac, C.sage, C.lilac][i]), `transform="translate(${xx + 132} ${yy + 30}) rotate(${angle})"`), t, .5 + i * .18)
    if (i < 2) out += arrow(435 + i * 343, 456, 35, p(t, 2.5 + i * .2))
  }
  return out
}

function assistants(t) {
  let out = title('01 / ASSISTANTS IA', 'Assistants IA', 'Du contexte à un résultat utile.', t)
  out += enter(sheet(98, 329, 257, 220, 'Un objectif clair', C.lilac, p(t, .8)), t, .4, -40, 0)
  out += enter(sheet(383, 363, 257, 220, 'Les bons documents', C.sage, p(t, 1.2)), t, .8, -40, 0)
  out += arrow(671, 450, 62, p(t, 1.8))
  const x = 775, y = 320
  out += enter(rect(x, y, 405, 280, C.ink, 26) + tag('LE LIVRABLE', x + 30, y + 44, '#cdb6e4') + text('Une synthèse', x + 30, y + 99, 36, C.white, 600) + text('qui fait avancer.', x + 30, y + 143, 36, C.white, 600) + [0,1,2].map(i => line(x + 32, y + 192 + 19 * i, x + 32 + (310 - i * 29) * p(t, 2.2 + i * .16), y + 192 + 19 * i, '#bba5cf', 4)).join(''), t, 1.7, 35, 0)
  return out
}

function automation(t) {
  let out = title('02 / AUTOMATISATION', 'Automatisation', 'Des tâches reliées. Une méthode partagée.', t)
  const nodes = [ ['Demande', 98], ['Traitement', 485], ['Suivi', 872] ]
  nodes.forEach(([label, x], i) => {
    out += enter(rect(x, 352, 294, 150, i === 1 ? C.ink : C.white, 24, `stroke="${C.line}"`) + circle(x + 35, 388, 8, i === 1 ? C.sage : C.purple) + text(label, x + 28, 456, 33, i === 1 ? C.white : C.ink), t, .4 + i * .45)
    if (i < 2) {
      const a = p(t, .9 + i * .45)
      out += line(x + 303, 428, x + 378, 428, C.purple, 3, `stroke-dasharray="75" stroke-dashoffset="${75 * (1 - a)}" opacity="${a > 0 ? 1 : 0}"`)
      out += circle(x + 303 + 75 * ((t * .45 + i * .3) % 1), 428, 5, C.purple, `opacity="${a}"`)
    }
  })
  const a = p(t, 2.3, 1)
  out += `<path d="M632 512v58q0 18 18 18h350q20 0 20-20v-55" fill="none" stroke="${C.purple}" stroke-width="2.5" stroke-dasharray="7 7" opacity="${a}"/>`
  out += enter(rect(688, 562, 277, 50, C.lilac, 25) + text('Prévoir les reprises', 826, 595, 27, C.purple, 600, 'text-anchor="middle"'), t, 2.7)
  return out
}

function projects(t) {
  let out = title('03 / PROJETS NUMÉRIQUES', 'Projets numériques', 'De l’idée à une première version.', t)
  const a = p(t, .5, 1.3)
  out += enter(rect(97, 333, 294, 238, C.lilac, 25) + tag('CADRER', 125, 375) + text('Le besoin.', 125, 428, 35) + text('Le périmètre.', 125, 475, 35) + text('Les étapes.', 125, 522, 35), t, .4)
  out += arrow(419, 447, 57, p(t, 1))
  out += enter(rect(510, 322, 664, 282, C.white, 24, `stroke="${C.line}"`) + circle(537, 345, 4, C.sage) + circle(552, 345, 4, C.lilac) + circle(567, 345, 4, C.line) + line(511, 365, 1173, 365) + rect(535, 388, 173, 188, C.ink, 13) + rect(731, 390, 214 * a, 19, C.lilac, 7) + rect(731, 429, 412 * a, 8, C.line, 4) + rect(731, 449, 357 * a, 8, C.line, 4) + rect(731, 488, 194 * a, 85, C.lilac, 12) + rect(948, 488, 194 * a, 85, '#e4e9df', 12) + text('Première', 553, 447, 27, C.white) + text('version', 553, 484, 27, C.white), t, 1.2, 40, 0)
  out += enter(rect(864, 575, 281, 55, C.sage, 27) + text('Tester → améliorer', 1004, 610, 27, C.ink, 600, 'text-anchor="middle"'), t, 2.6)
  return out
}

function practice(t) {
  let out = title('LA MÉTHODE MEMSTACK', 'Apprendre en faisant', 'Un cas concret. Un livrable. Un exemple expliqué.', t)
  out += memo('learning', 1030, 70, 150, t, .6)
  const cards = [['01', 'Le cas', '', C.lilac], ['02', 'Votre livrable', '', '#e4e9df'], ['03', 'L’exemple', '', C.lilac]]
  cards.forEach(([n, label, sub, bg], i) => {
    const x = 98 + i * 365
    let graphic = ''
    if (i === 0) graphic = [0, 1, 2].map(j => line(x + 28, 425 + j * 28, x + 272 - j * 22, 425 + j * 28, C.line, 6)).join('')
    if (i === 1) graphic = `<path d="M${x + 28} 473q40-59 80-25t74-8 80-23" fill="none" stroke="${C.purple}" stroke-width="5" stroke-linecap="round" stroke-dasharray="280" stroke-dashoffset="${280 * (1 - p(t, 2.3, 1.6))}"/>` + circle(x + 262, 418, 9, C.sage, `opacity="${p(t, 3.4)}"`)
    if (i === 2) graphic = rect(x + 27, 415, 262, 28, C.lilac, 6) + line(x + 40, 428, x + 232, 428, C.purple, 4) + line(x + 28, 468, x + 264, 468, C.line, 5) + `<path d="M${x + 145} 488q75 30 145-5" fill="none" stroke="${C.sage}" stroke-width="5" stroke-dasharray="160" stroke-dashoffset="${160 * (1 - p(t, 3.6, 1))}"/>`
    out += enter(rect(x, 334, 346, 249, i === 1 ? '#f0f2eb' : C.white, 24, `stroke="${C.line}"`) + text(label, x + 26, 384, 33) + graphic, t, .5 + i * .5)
  })
  return out
}

function collective(t) {
  let out = title('DANS LA DURÉE', 'Progresser ensemble', 'Des parcours. Des révisions. Des repères d’équipe.', t)
  const columns = [['Assistants IA', C.lilac], ['Automatisation', '#e4e9df'], ['Projets numériques', C.lilac]]
  columns.forEach(([label, bg], i) => {
    const x = 98 + i * 365
    out += enter(rect(x, 326, 345, 110, bg, 23) + text(label, x + 25, 390, 29), t, .4 + i * .2)
    for (let j = 0; j < 3; j++) out += enter(circle(x + 48 + j * 85, 483, 23, C.white, `stroke="${C.line}"`) + check(x + 38 + j * 85, 483, p(t, 1.5 + i * .25 + j * .16)), t, 1.2 + i * .2 + j * .1)
    out += line(x + 171, 521, x + 171, 560, C.purple, 2, `opacity="${p(t, 2.4)}"`)
  })
  out += enter(rect(98, 559, 1076, 66, C.ink, 21) + circle(269, 592, 9, C.lilac) + circle(634, 592, 9, C.lilac) + circle(999, 592, 9, C.lilac) + line(290, 592, 610, 592, '#a68bbd', 3) + line(654, 592, 975, 592, '#a68bbd', 3), t, 2.8)
  out += `<path d="M268 640q365 91 731 0" fill="none" stroke="${C.purple}" stroke-width="3" stroke-dasharray="750" stroke-dashoffset="${750 * (1 - p(t, 3.4, 1.5))}"/>`
  return out
}

function signature(t) {
  let out = rect(0, 0, 1280, 720, C.ink, 0)
  out += circle(1182, 107, 320, '#42324e', 'opacity=".42"')
  out += enter(text('MemStack Entreprise', 96, 126, 30, C.white, 700), t, .25)
  out += enter(text('Faites de l’IA', 96, 277, 82, C.white, 700, 'letter-spacing="-3"'), t, .5)
  out += enter(text('une compétence', 96, 373, 82, C.white, 700, 'letter-spacing="-3"'), t, .7)
  out += enter(text('collective.', 96, 469, 82, C.lilac, 700, 'letter-spacing="-3"'), t, .9)
  const a = p(t, 1.45, 1.2)
  out += `<path d="M100 493Q280 480 464 494" fill="none" stroke="${C.sage}" stroke-width="8" stroke-linecap="round" stroke-dasharray="370" stroke-dashoffset="${370 * (1 - a)}" opacity="${a > 0 ? 1 : 0}"/>`
  out += memo('celebrate', 900, 300, 250, t, 1.15)
  out += enter(text('Découvrir les parcours', 98, 598, 32, C.white, 600) + arrow(446, 587, 32, 1, C.lilac) + text('memstack.fr', 98, 665, 28, C.lilac, 400), t, 2.1)
  return out
}

const drawers = { ideas, assistants, automation, projects, practice, collective, signature }

// A single document changes size, position and material across every cut.
// Its full-opacity midpoint masks the outgoing composition before the next
// scene builds from that same shape; text never morphs into unreadable glyphs.
const bridges = [
  [5, [832, 365, 264, 191], [98, 329, 257, 220], C.white],
  [11, [775, 320, 405, 280], [98, 352, 294, 150], C.lilac],
  [17, [872, 352, 294, 150], [98, 333, 294, 238], C.lilac],
  [23, [510, 322, 664, 282], [463, 334, 346, 249], '#e4e9df'],
  [31, [828, 334, 346, 249], [828, 326, 345, 110], C.lilac],
  [39, [98, 559, 1076, 66], [905, 244, 205, 147], C.lilac]
]

function bridge(time) {
  let out = ''
  for (const [cut, source, target, fill] of bridges) {
    if (Math.abs(time - cut) > .48) continue
    const raw = clamp((time - cut + .48) / .96)
    const smooth = raw * raw * (3 - 2 * raw)
    const [x, y, w, h] = source.map((value, i) => mix(value, target[i], smooth))
    const opacity = Math.min(1, raw * 5, (1 - raw) * 5)
    const content = rect(x, y, w, h, fill, 24, `stroke="${C.line}"`) + [0, 1, 2].map(i => line(x + 25, y + h * (.35 + i * .13), x + w * (.78 - i * .08), y + h * (.35 + i * .13), '#a98fbc', 4)).join('')
    out += group(content, `opacity="${opacity}"`)
  }
  return out
}

export function frame(time, width = 1920, height = 1080) {
  const t = clamp(time, 0, 47.999)
  let body = rect(0, 0, 1280, 720, C.paper, 0)
  body += circle(1200, 40, 280, C.lilac, 'opacity=".24"') + circle(32, 716, 190, C.sage, 'opacity=".11"')
  for (const scene of scenes) {
    const opacity = scene.name === 'ideas' && t < .3 ? 1 : scene.name === 'signature' && t >= 47 ? 1 : sceneOpacity(t, scene)
    if (opacity > 0) body += group(drawers[scene.name](t - scene.start), `opacity="${opacity}"`)
  }
  body += bridge(t)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1280 720"><defs><style>text{font-family:'Segoe UI',Arial,sans-serif}</style></defs>${body}</svg>`
}
