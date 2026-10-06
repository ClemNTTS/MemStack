import assert from 'node:assert/strict'
import test from 'node:test'
import { parseInlineCode, parseTextBlocks } from '../lesson/formatText.ts'

test('fenced code separates explanation from commands and preserves indentation', () => {
  assert.deepEqual(parseTextBlocks('Exemple :\n\n```bash\ndocker run \\\n  mon-app\n```\n\nExplication.'), [
    { type: 'text', text: 'Exemple :' },
    { type: 'code', language: 'bash', text: 'docker run \\\n  mon-app' },
    { type: 'text', text: 'Explication.' },
  ])
})

test('multiple code blocks preserve JSX, HTML, backticks and CRLF as literal code', () => {
  const result = parseTextBlocks('```jsx\r\n<span>{`value`}</span>\r\n```\r\n```\n<script>example</script>\n```')
  assert.deepEqual(result, [
    { type: 'code', language: 'jsx', text: '<span>{`value`}</span>' },
    { type: 'code', language: '', text: '<script>example</script>' },
  ])
  assert.deepEqual(parseInlineCode('Port `3000` puis texte'), [
    { text: 'Port ', code: false }, { text: '3000', code: true }, { text: ' puis texte', code: false },
  ])
})

test('ordinary prose and an unfinished fence remain readable', () => {
  assert.deepEqual(parseTextBlocks('Un message.'), [{ type: 'text', text: 'Un message.' }])
  assert.deepEqual(parseTextBlocks('```js\nconst x = 1'), [{ type: 'text', text: '```js\nconst x = 1' }])
})
