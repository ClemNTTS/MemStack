import assert from 'node:assert/strict'
import test from 'node:test'
import { assetHref, routeFromLocation, routeHref } from '../navigation/urls.ts'

test('Pages links preserve the repository base and session intent', () => {
  assert.equal(routeHref('/today?start=cards', '/MemStack/'), '/MemStack/#/today?start=cards')
  assert.equal(routeHref('/', '/MemStack/'), '/MemStack/#/')
  assert.equal(routeHref('/reviews', '/'), '/reviews')
  assert.equal(routeHref('/challenges/docker-images-diagnostic', '/MemStack/'), '/MemStack/#/challenges/docker-images-diagnostic')
})

test('Pages routes survive reloads and local paths remain unchanged', () => {
  assert.equal(routeFromLocation({ pathname: '/MemStack/', search: '', hash: '#/lessons/docker-images-containers' }, '/MemStack/'), '/lessons/docker-images-containers')
  assert.equal(routeFromLocation({ pathname: '/MemStack/', search: '', hash: '#/today?start=lesson' }, '/MemStack/'), '/today?start=lesson')
  assert.equal(routeFromLocation({ pathname: '/MemStack/', search: '', hash: '' }, '/MemStack/'), '/')
  assert.equal(routeFromLocation({ pathname: '/today', search: '?start=cards', hash: '' }, '/'), '/today?start=cards')
  assert.equal(routeFromLocation({ pathname: '/MemStack/', search: '', hash: '#/challenges/docker-images-diagnostic' }, '/MemStack/'), '/challenges/docker-images-diagnostic')
})

test('local illustrations use the repository base without rewriting external images', () => {
  assert.equal(assetHref('/lessons/catalog/docker-persistence.svg', '/MemStack/'), '/MemStack/lessons/catalog/docker-persistence.svg')
  assert.equal(assetHref('/memo/learning.png', '/'), '/memo/learning.png')
  assert.equal(assetHref('https://example.com/image.png', '/MemStack/'), 'https://example.com/image.png')
})

test('custom domain Pages routes retain fragments at the root', () => {
  assert.equal(routeHref('/courses', '/', true), '/#/courses')
  assert.equal(routeHref('/today?start=cards', '/', true), '/#/today?start=cards')
  assert.equal(routeFromLocation({ pathname: '/', search: '', hash: '#/challenges/docker-images-diagnostic' }, '/', true), '/challenges/docker-images-diagnostic')
  assert.equal(routeFromLocation({ pathname: '/', search: '', hash: '#/today?start=cards' }, '/', true), '/today?start=cards')
  assert.equal(assetHref('/memo/learning.png', '/'), '/memo/learning.png')
})
