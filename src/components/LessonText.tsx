import { parseInlineCode, parseTextBlocks } from '../lesson/formatText'
import './lesson-text.css'
import GlossaryTerm from './GlossaryTerm'
import { splitGlossaryText } from './lessonGlossary'

export function InlineLessonText({ text, glossary = false, glossaryId }: { text: string; glossary?: boolean; glossaryId?: string }) {
  return <>{parseInlineCode(text).map((part, index) => part.code
    ? <code className="lesson-inline-code" key={index}>{part.text}</code>
    : <span key={index}>{glossary ? splitGlossaryText(part.text, glossaryId).map((fragment, position) => fragment.entry ? <GlossaryTerm key={position} text={fragment.text} entry={fragment.entry}/> : fragment.text) : part.text}</span>)}</>
}

function LessonText({ text, glossary = false, glossaryId }: { text: string; glossary?: boolean; glossaryId?: string }) {
  return <div className="lesson-rich-text">{parseTextBlocks(text).map((block, index) => block.type === 'code'
    ? <div className="lesson-code-block" key={index}>
      {block.language && <span className="lesson-code-language">{block.language}</span>}
      <pre tabIndex={0} aria-label={`Exemple de code${block.language ? ` · ${block.language}` : ''}`}><code>{block.text}</code></pre>
    </div>
    : <p key={index}><InlineLessonText text={block.text} glossary={glossary} glossaryId={glossaryId} /></p>)}</div>
}

export default LessonText
