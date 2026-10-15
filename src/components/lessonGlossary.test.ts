import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { enterpriseLessonGlossaries, splitGlossaryText } from './lessonGlossary.ts'

test('glossary matches accented French word boundaries without changing the text', () => {
  const text = 'Un contexte, des prompts, le RAG : contextualiser ne suffit pas.'
  const parts = splitGlossaryText(text)
  assert.equal(parts.map(part => part.text).join(''), text)
  assert.deepEqual(parts.filter(part => part.entry).map(part => part.entry!.id), ['context', 'prompt', 'rag'])
})

test('glossary prefers a complete AI concept and avoids highlighting every repetition', () => {
  const text = 'Un agent IA utilise un prompt. Ce prompt reste un prompt.'
  const parts = splitGlossaryText(text)
  assert.equal(parts.map(part => part.text).join(''), text)
  assert.deepEqual(parts.filter(part => part.entry).map(part => part.text), ['agent IA', 'prompt'])
  assert.equal(splitGlossaryText('Un agent commercial appelle.').some(part => part.entry), false)
})

test('every enterprise lesson has reviewed definitions that match its teaching text', () => {
  const curriculum = JSON.parse(readFileSync(new URL('../../shared/enterpriseCurriculum.json', import.meta.url), 'utf8'))
  const practices = JSON.parse(readFileSync(new URL('../data/enterprisePractices.json', import.meta.url), 'utf8'))
  assert.deepEqual(Object.keys(enterpriseLessonGlossaries).sort(), curriculum.lessons.map((lesson: { id: string }) => lesson.id).sort())
  for (const lesson of curriculum.lessons) {
    const texts = lesson.steps.flatMap((step: { text?: string; prompt?: string; options?: { feedback: string }[] }) => [step.text ?? '', step.prompt ?? '', ...step.options?.map(option => option.feedback) ?? []])
    const practice = practices[lesson.id]
    if (practice) texts.push(practice.scenario, practice.task, practice.starter, practice.example, practice.explanation, ...practice.checklist)
    const matched = new Set(texts.flatMap((text: string) => splitGlossaryText(text, lesson.id).flatMap(part => part.entry ? [part.entry.id] : [])))
    const definitions = enterpriseLessonGlossaries[lesson.id]
    assert.ok(definitions.length > 0, lesson.id)
    assert.equal(new Set(definitions.map(entry => entry.id)).size, definitions.length, lesson.id)
    for (const entry of definitions) {
      assert.ok(entry.title && entry.definition.length > 50 && entry.terms.length, `${lesson.id}: ${entry.id}`)
      assert.ok(matched.has(entry.id), `${lesson.id}: unreachable definition ${entry.id}`)
      for (const term of entry.terms) assert.equal(splitGlossaryText(term, lesson.id)[0].entry?.id, entry.id, term)
    }
  }
})

test('lesson-specific definitions do not leak to another lesson and apostrophe variants match', () => {
  assert.ok(splitGlossaryText('minimisation', 'ent-minimum-data').some(part => part.entry))
  assert.ok(!splitGlossaryText('minimisation', 'ent-plausible-not-proven').some(part => part.entry))
  const straight = splitGlossaryText("identifiant de l'opération", 'ent-answer-or-action')
  const curly = splitGlossaryText('identifiant de l’opération', 'ent-answer-or-action')
  assert.ok(straight[0].entry)
  assert.equal(straight[0].entry?.id, curly[0].entry?.id)
})
