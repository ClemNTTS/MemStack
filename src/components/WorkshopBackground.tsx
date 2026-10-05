import type { CSSProperties } from 'react'

type WorkshopBackgroundProps = {
  stage: 'lesson' | 'cards' | 'rest'
  beat: number
}

function WorkshopBackground({ stage, beat }: WorkshopBackgroundProps) {
  const style = { '--beat': beat % 2, '--stack': Math.min(3, Math.floor(beat / 2)) } as CSSProperties
  return (
    <div className="workshop" data-stage={stage} style={style} aria-hidden="true">
      <div className="workshop-axis"><span>MEMSTACK / ATELIER</span></div>
      <div className="workshop-plate plate-a"><span>01 / DÉCOUVRIR</span><i /></div>
      <div className="workshop-plate plate-b"><span>02 / COMPRENDRE</span><i /></div>
      <div className="workshop-plate plate-c"><span>03 / RETENIR</span><i /></div>
      <div className="workshop-stack">{[0, 1, 2].map((index) => <i key={index} style={{ '--index': index } as CSSProperties} />)}<span>UNE IDÉE À LA FOIS</span></div>
      <div className="workshop-registration">+<span>+</span></div>
    </div>
  )
}

export default WorkshopBackground
