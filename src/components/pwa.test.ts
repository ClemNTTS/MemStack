import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import sharp from 'sharp'

const publicRoot = new URL('../../public/', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('manifest.webmanifest', publicRoot), 'utf8')) as {
  id: string, name: string, start_url: string, scope: string, display: string,
  icons: { src: string, sizes: string, type: string, purpose: string }[]
}

test('installable manifest supplies standalone launch and required PNG icons', () => {
  assert.ok(manifest.name.trim())
  assert.equal(manifest.display, 'standalone')
  assert.ok(manifest.icons.some(icon => icon.sizes === '192x192' && icon.purpose === 'any'))
  assert.ok(manifest.icons.some(icon => icon.sizes === '512x512' && icon.purpose === 'any'))
  assert.ok(manifest.icons.some(icon => icon.purpose === 'maskable'))
})

test('launch, identity and icons stay inside deployment scope at root and under a base path', () => {
  for (const base of ['https://memstack.fr/', 'https://example.test/MemStack/']) {
    const manifestUrl = new URL('manifest.webmanifest', base)
    const scope = new URL(manifest.scope, manifestUrl)
    for (const href of [manifest.id, manifest.start_url, ...manifest.icons.map(icon => icon.src)]) {
      const target = new URL(href, manifestUrl)
      assert.equal(target.origin, scope.origin)
      assert.ok(target.pathname.startsWith(scope.pathname), target.href)
    }
  }
})

test('advertised and Apple icons are real readable PNGs at the stated sizes', async () => {
  for (const icon of [...manifest.icons, { src: 'icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }, { src: 'icons/favicon.png', sizes: '48x48', type: 'image/png' }]) {
    const file = readFileSync(new URL(icon.src, publicRoot))
    const metadata = await sharp(file).metadata()
    assert.equal(icon.type, 'image/png')
    assert.equal(metadata.format, 'png')
    assert.equal(`${metadata.width}x${metadata.height}`, icon.sizes)
    // Decode the entire file, so truncated pixel data cannot pass through header inspection.
    await sharp(file).raw().toBuffer()
  }
})

test('maskable artwork is opaque and leaves the outer mask region clear', async () => {
  const icon = manifest.icons.find(icon => icon.purpose === 'maskable')!
  const { data, info } = await sharp(readFileSync(new URL(icon.src, publicRoot))).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const background = [247, 243, 237]
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const offset = (y * info.width + x) * 4
    assert.equal(data[offset + 3], 255)
    if (Math.hypot(x + .5 - info.width / 2, y + .5 - info.height / 2) > info.width * .4) {
      assert.deepEqual([...data.subarray(offset, offset + 3)], background)
    }
  }
})
