import assert from 'node:assert/strict'
import test from 'node:test'
import { firstLessonConversation } from './fictionalConversation.ts'

const one = 'ent-answer-or-action-message-1'
const two = 'ent-answer-or-action-message-2'
const three = 'ent-answer-or-action-message-3'
const four = 'ent-answer-or-action-message-4'

test('the fictional assistant response is withheld until the learner answers the draft question', () => {
  assert.deepEqual(firstLessonConversation(one, []).messages, [])
  const before = firstLessonConversation(two, [one])
  assert.equal(before.stage, 1)
  assert.deepEqual(before.messages.map(message => message.speaker), ['Léa'])
  const after = firstLessonConversation(two, [one, two])
  assert.equal(after.stage, 2)
  assert.deepEqual(after.messages.map(message => message.speaker), ['Léa', 'Assistant IA'])
  assert.ok(after.messages[1].text.includes('brouillon'))
  assert.ok(!after.messages.some(message => message.text.includes('salle Bleue')))
})

test('the supplied document and revised draft appear together after the document choice', () => {
  assert.equal(firstLessonConversation(three, [one, two]).stage, 2)
  const revised = firstLessonConversation(three, [one, two, three])
  assert.equal(revised.stage, 3)
  assert.equal(revised.messages.length, 4)
  assert.ok(revised.messages[2].document?.text.includes('salle Bleue'))
  assert.ok(revised.messages[3].text.includes('salle Bleue'))
  assert.equal(revised.handoff, false)
})

test('future checks cannot reveal later content and the final handoff never claims an actual send', () => {
  assert.equal(firstLessonConversation(two, [one, two, three, four]).stage, 2)
  assert.equal(firstLessonConversation(three, [one, three, four]).stage, 1)
  assert.equal(firstLessonConversation('unknown', [one, two, three, four]).stage, 0)
  const handoff = firstLessonConversation('ent-answer-or-action-practice-1', [one, two, three, four])
  assert.equal(handoff.stage, 4)
  assert.equal(handoff.handoff, true)
  assert.equal(handoff.messages.length, 4)
  assert.ok(handoff.messages.every(message => !message.text.includes('envoyé')))
})
