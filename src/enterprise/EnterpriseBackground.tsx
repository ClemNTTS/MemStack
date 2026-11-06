import { BriefcaseBusiness, Check, MessageSquare, Network } from 'lucide-react'

function EnterpriseBackground() {
  return (
    <div className="enterprise-backdrop" aria-hidden="true">
      <div className="enterprise-backdrop-axis"><span>MEMSTACK / LE COLLECTIF</span></div>
      <div className="enterprise-backdrop-flow">
        <span className="enterprise-backdrop-caption">01 / UNE IDÉE</span>
        <div><BriefcaseBusiness size={26} strokeWidth={1.2} /><i /><MessageSquare size={26} strokeWidth={1.2} /></div>
        <span className="enterprise-backdrop-caption">DES USAGES À CONSTRUIRE</span>
      </div>
      <div className="enterprise-backdrop-sheet">
        <span className="enterprise-backdrop-caption">02 / PASSER À L’ACTION</span>
        <div><Check size={16} /><i /></div>
        <div><Check size={16} /><i /></div>
        <div><span /><i /></div>
      </div>
      <div className="enterprise-backdrop-network">
        <Network size={74} strokeWidth={.8} />
        <span className="enterprise-backdrop-caption">03 / AVANCER ENSEMBLE</span>
      </div>
      <div className="enterprise-backdrop-registration">+<span>+</span></div>
    </div>
  )
}

export default EnterpriseBackground
