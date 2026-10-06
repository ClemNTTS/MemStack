export type TextBlock = { type: 'text', text: string } | { type: 'code', text: string, language: string }

// Deliberately limited to fenced code and inline code; never interpret HTML.
export function parseTextBlocks(text: string): TextBlock[] {
  const blocks: TextBlock[] = []
  const fence = /^```([\w+-]*)[ \t]*\r?\n([\s\S]*?)^```[ \t]*(?:\r?\n|$)/gm
  let offset = 0
  for (const match of text.matchAll(fence)) {
    const before = text.slice(offset, match.index).trim()
    if (before) blocks.push({ type: 'text', text: before })
    blocks.push({ type: 'code', language: match[1], text: match[2].replace(/\r?\n$/, '') })
    offset = match.index! + match[0].length
  }
  const after = text.slice(offset).trim()
  if (after) blocks.push({ type: 'text', text: after })
  return blocks
}

export function parseInlineCode(text: string) {
  return text.split(/(`[^`\n]+`)/g).filter(Boolean).map(part => ({
    text: part.startsWith('`') && part.endsWith('`') ? part.slice(1, -1) : part,
    code: part.startsWith('`') && part.endsWith('`'),
  }))
}
