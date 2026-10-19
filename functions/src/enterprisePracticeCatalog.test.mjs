import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { validatePracticeRubric, practiceVersion, practiceMessages } from './enterprisePractice.mjs'

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const catalog = read('../../shared/enterpriseCurriculum.json')
const practices = read('../../src/data/enterprisePractices.json')
const rubrics = read('../../shared/enterprisePracticeRubrics.json')

test('all forty Enterprise activities have a trusted rubric and bounded independent provider case', () => {
  const ids = catalog.lessons.map(lesson => lesson.id).sort()
  assert.equal(ids.length, 40)
  assert.deepEqual(Object.keys(practices).sort(), ids)
  assert.deepEqual(Object.keys(rubrics.lessons).sort(), ids)
  assert.ok(Number.isSafeInteger(rubrics.version) && rubrics.version >= 1)
  for (const id of ids) {
    const rubric = validatePracticeRubric(rubrics.lessons[id])
    assert.match(practiceVersion(practices[id]), /^[a-f0-9]{64}$/)
    const messages = practiceMessages(practices[id], 'Une réponse fictive', rubric)
    assert.ok(Buffer.byteLength(JSON.stringify(messages), 'utf8') + 20000 + 900 <= 32000, id)
    const body = JSON.parse(messages[1].content)
    assert.deepEqual(body.essential, rubric.essential)
    assert.equal(body.case, practices[id].scenario)
    assert.ok(!Object.hasOwn(body, 'example'))
    assert.ok(!Object.hasOwn(body, 'uid'))
    assert.ok(!Object.hasOwn(body, 'hints'))
  }
})
