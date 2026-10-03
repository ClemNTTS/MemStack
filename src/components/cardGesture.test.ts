import assert from 'node:assert/strict'
import test from 'node:test'
import { getSwipeRating } from './cardGesture.ts'

test('horizontal swipes map left to forgotten and right to recalled', () => {
  assert.equal(getSwipeRating(-80, 10), 'forgotten')
  assert.equal(getSwipeRating(80, -10), 'recalled')
})

test('taps, short drags and vertical scrolling do not rate a card', () => {
  assert.equal(getSwipeRating(0, 0), undefined)
  assert.equal(getSwipeRating(59, 0), undefined)
  assert.equal(getSwipeRating(90, 100), undefined)
  assert.equal(getSwipeRating(-80, -80), undefined)
})
