import test from 'node:test'
import assert from 'node:assert/strict'
import { challengeDraftKey, loadChallengeDraft, removeChallengeDraft, saveChallengeDraft } from './challengeDraft.ts'

test('drafts isolate accounts and dossier versions and clear only the acknowledged draft', () => {
  const values = new Map<string, string>()
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) }, removeItem: (key: string) => { values.delete(key) } }
  const draft = { observations: 'Diagnostic', actions: 'Vérifier' }
  saveChallengeDraft(storage, 'alice', 'challenge', 2, draft)
  saveChallengeDraft(storage, 'bob', 'challenge', 2, draft)
  assert.deepEqual(loadChallengeDraft(storage, 'alice', 'challenge', 2), draft)
  assert.deepEqual(loadChallengeDraft(storage, 'alice', 'challenge', 3), { observations: '', actions: '' })
  removeChallengeDraft(storage, 'alice', 'challenge', 2)
  assert.deepEqual(loadChallengeDraft(storage, 'bob', 'challenge', 2), draft)
  assert.notEqual(challengeDraftKey('a:b', 'c', 1), challengeDraftKey('a', 'b:c', 1))
})

test('invalid persisted drafts cannot restore oversized fields', () => {
  assert.throws(() => loadChallengeDraft({ getItem: () => JSON.stringify({ observations: 'x'.repeat(2001), actions: '' }), setItem() {}, removeItem() {} }, 'a', 'b', 1))
})
