import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { enterpriseLessonGlossaries, splitGlossaryText } from './lessonGlossary.ts'
import { parseInlineCode, parseTextBlocks } from '../lesson/formatText.ts'

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
  const straight = splitGlossaryText("règle d'escalade", 'ent-human-escalation')
  const curly = splitGlossaryText('règle d’escalade', 'ent-human-escalation')
  assert.ok(straight[0].entry)
  assert.equal(straight[0].entry?.id, 'human-escalation-rule')
  assert.equal(straight[0].entry?.id, curly[0].entry?.id)
})

test('ordinary vocabulary is left plain while essential AI and safety concepts remain available', () => {
  for (const lessonId of Object.keys(enterpriseLessonGlossaries)) {
    const text = 'Une messagerie, des destinataires, un brouillon, des messages envoyés, un glossaire et un objet.'
    assert.equal(splitGlossaryText(text, lessonId).some(part => part.entry), false, lessonId)
  }
  const concepts = [
    ['ent-answer-or-action', 'prompt', 'ent-start-prompt'],
    ['ent-minimum-data', 'minimisation', 'data-minimization'],
    ['ent-hostile-document', 'injection de prompt', 'prompt-injection'],
    ['ent-agents-permissions', 'conditions d’arrêt', 'stop-conditions'],
    ['ent-automation-exceptions', 'Idempotence', 'ent-automation-exceptions-term-2'],
  ]
  for (const [lessonId, text, entryId] of concepts) {
    assert.equal(splitGlossaryText(text, lessonId)[0].entry?.id, entryId, text)
  }
})

test('one explicit reading scope deduplicates concepts across paragraphs and inline code fragments', () => {
  const text = 'Un prompt avant `du code` et des prompts.\n\nCe prompt fournit le contexte.\n\nLe contexte reste utile.'
  const seen = new Set<string>()
  const blocks = parseTextBlocks(text).map(block => {
    assert.equal(block.type, 'text')
    return parseInlineCode(block.text).map(part => part.code
      ? { text: part.text, code: true }
      : { text: part.text, code: false, fragments: splitGlossaryText(part.text, '', seen) })
  })
  const highlighted = blocks.flatMap(parts => parts.flatMap(part => part.fragments ?? [])).flatMap(part => part.entry ? [part.entry.id] : [])
  assert.deepEqual(highlighted, ['prompt', 'context'])
  assert.equal(blocks.map(parts => parts.map(part => part.fragments?.map(fragment => fragment.text).join('') ?? part.text).join('')).join('\n\n'), text.replace('`du code`', 'du code'))
  assert.equal(splitGlossaryText('prompt')[0].entry?.id, 'prompt')
  assert.equal(splitGlossaryText('prompt')[0].entry?.id, 'prompt')
})

test('code fragments do not consume the first explainable occurrence in surrounding prose', () => {
  const seen = new Set<string>()
  const fragments = parseInlineCode('`prompt` puis un prompt.').flatMap(part => part.code ? [] : splitGlossaryText(part.text, '', seen))
  assert.deepEqual(fragments.flatMap(part => part.entry ? [part.entry.id] : []), ['prompt'])
  assert.equal(splitGlossaryText('prompt', '', seen).some(part => part.entry), false)
  assert.equal(splitGlossaryText('prompt', '', new Set<string>())[0].entry?.id, 'prompt')
})

test('the review register accounts for every original local definition and its final decision', () => {
  const register = readFileSync(new URL('../../docs/content/ENTERPRISE_GLOSSARY_GUIDANCE_20261022.md', import.meta.url), 'utf8')
  const rows = register.split('\n').filter(line => line.startsWith('| ent-')).map(line => line.split('|').slice(1, -1).map(cell => cell.trim()))
  assert.equal(rows.length, 190)
  assert.equal(new Set(rows.map(([lessonId, entryId]) => `${lessonId}:${entryId}`)).size, 190)
  const active = Object.entries(enterpriseLessonGlossaries).flatMap(([lessonId, entries]) => entries.map(entry => `${lessonId}:${entry.id}`)).sort()
  assert.deepEqual(rows.filter(([, , , decision]) => decision !== 'Retirer').map(([lessonId, entryId]) => `${lessonId}:${entryId}`).sort(), active)
  assert.equal(rows.filter(([, , , decision]) => decision === 'Retirer').length, 28)
})
