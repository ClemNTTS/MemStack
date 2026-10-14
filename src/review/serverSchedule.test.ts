import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { scheduleReview } from './schedule.ts'
const require=createRequire(import.meta.url)
const { scheduleServerReview }=require('../../functions/src/learningAccess.mjs')
test('trusted server scheduling preserves the existing client scheduling contract',()=>{
  const now=Date.parse('2026-10-14T10:00:00Z')
  for(const rating of ['recalled','forgotten'] as const) for(const days of [0,1,2,12,400]) {
    const previous={cardId:'one',intervalDays:12,lastReviewedAt:new Date(now-days*86400000).toISOString(),dueAt:new Date(now-1000).toISOString()}
    assert.deepEqual(scheduleServerReview('one',rating,now,previous),scheduleReview({cardId:'one',rating,reviewedAt:new Date(now).toISOString()},previous))
    assert.deepEqual(scheduleServerReview('one',rating,now),scheduleReview({cardId:'one',rating,reviewedAt:new Date(now).toISOString()}))
  }
})
