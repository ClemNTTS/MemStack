export type TextBlock = { type: 'text', text: string } | { type: 'code', text: string, language: string }

// Deliberately limited to paragraphs, fenced code and inline code; never interpret HTML.
export function parseTextBlocks(text: string): TextBlock[] {
  const blocks: TextBlock[] = []
  const prose = (value: string) => value.split(/\r?\n[ \t]*\r?\n/).map(paragraph => paragraph.trim()).filter(Boolean).forEach(paragraph => blocks.push({ type: 'text', text: paragraph }))
  const fence = /^```([\w+-]*)[ \t]*\r?\n([\s\S]*?)^```[ \t]*(?:\r?\n|$)/gm
  let offset = 0
  for (const match of text.matchAll(fence)) {
    const before = text.slice(offset, match.index).trim()
    if (before) prose(before)
    blocks.push({ type: 'code', language: match[1], text: match[2].replace(/\r?\n$/, '') })
    offset = match.index! + match[0].length
  }
  const after = text.slice(offset).trim()
  if (after) prose(after)
  return blocks
}

export function parseInlineCode(text: string) {
  return text.split(/(`[^`\n]+`)/g).filter(Boolean).map(part => ({
    text: part.startsWith('`') && part.endsWith('`') ? part.slice(1, -1) : part,
    code: part.startsWith('`') && part.endsWith('`'),
  }))
}
