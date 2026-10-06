import { parseInlineCode, parseTextBlocks } from '../lesson/formatText'
import './lesson-text.css'

export function InlineLessonText({ text }: { text: string }) {
  return <>{parseInlineCode(text).map((part, index) => part.code
    ? <code className="lesson-inline-code" key={index}>{part.text}</code>
    : <span key={index}>{part.text}</span>)}</>
}

function LessonText({ text }: { text: string }) {
  return <div className="lesson-rich-text">{parseTextBlocks(text).map((block, index) => block.type === 'code'
    ? <div className="lesson-code-block" key={index}>
      {block.language && <span className="lesson-code-language">{block.language}</span>}
      <pre tabIndex={0} aria-label={`Exemple de code${block.language ? ` · ${block.language}` : ''}`}><code>{block.text}</code></pre>
    </div>
    : <p key={index}><InlineLessonText text={block.text} /></p>)}</div>
}

export default LessonText
