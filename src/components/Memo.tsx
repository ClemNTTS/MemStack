import type { CardRating } from '../types/card'

type MemoProps = {
  expression?: CardRating | 'unsure'
}

function Memo({ expression = 'recalled' }: MemoProps) {
  return <img className="memo" src={`${import.meta.env.BASE_URL}memo/${expression}.png`} alt="" width="80" height="80" />
}

export default Memo
