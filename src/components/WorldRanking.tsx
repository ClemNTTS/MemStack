import { useEffect, useState } from 'react'
import { getWorldRanking, setRankingAlias } from '../firebase/worldRanking'
import type { WorldRankingData } from '../firebase/worldRanking'
import { useProgress } from '../progress/ProgressProvider'
import { appHref } from '../navigation/browser'
import './worldRanking.css'

export default function WorldRanking({ compact = false, editable = false }: { compact?: boolean, editable?: boolean }) {
  const account = useProgress()
  const [data,setData] = useState<WorldRankingData | null>(null)
  const [error,setError] = useState('')
  const [alias,setAlias] = useState('')
  const [busy,setBusy] = useState(false)
  const [message,setMessage] = useState('')
  const [revision,setRevision] = useState(0)
  useEffect(() => {
    let cancelled = false
    setData(null);setError('');setMessage('');setAlias('')
    void getWorldRanking().then(value => { if (!cancelled) {setData(value);setAlias(value.self.alias)} })
      .catch(() => {if (!cancelled) setError('Le classement est momentanément indisponible.')})
    return () => {cancelled = true}
  },[account.user?.uid,revision])
  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    const uid = account.user?.uid
    setBusy(true);setMessage('')
    try {
      await setRankingAlias(alias)
      if (account.user?.uid !== uid) return
      const next = await getWorldRanking()
      setData(next);setAlias(next.self.alias);setMessage('Ton pseudo public est enregistré.')
    } catch {setMessage('Le pseudo n’a pas été enregistré. Utilise 2 à 24 caractères ; trois changements par jour maximum.')}
    finally {setBusy(false)}
  }
  return <section className={`overview-panel world-ranking ${compact?'world-ranking-compact':''}`} aria-label="Classement mondial">
    <header><p className="lesson-category">Ensemble, chaque jour</p><h2>Classement mondial <span aria-hidden="true">♜</span></h2></header>
    {!data && !error && <p role="status">On retrouve les séries…</p>}
    {error && <p role="alert">{error} <button className="auth-link" onClick={()=>setRevision(value=>value+1)}>Réessayer</button></p>}
    {data && <>
      <p className="ranking-caption">Les séries quotidiennes · {data.participants} membre{data.participants>1?'s':''}</p>
      <ol className="ranking-list">{data.leaders.slice(0,compact?3:20).map((member,index)=><li key={`${member.alias}-${index}`} data-you={member.isYou}><span className="ranking-place">{member.rank}</span><span className="ranking-alias">{member.alias}{member.isYou && <small>toi</small>}</span><strong>{member.streak}<span> j</span></strong></li>)}</ol>
      <div className="ranking-self"><span>Ta place <strong>#{data.self.rank}</strong></span><span>{data.self.streak} jour{data.self.streak>1?'s':''} de suite</span></div>
      {compact ? <a className="text-link" href={appHref('/ranking')}>Voir le classement →</a> : <p className="ranking-caption">Une leçon ou une carte dans la journée prolonge ta série. Heure de Paris ; un jour sans activité remet la série à zéro après le lendemain. Les séries égales partagent la même place.</p>}
      {editable && <form className="ranking-alias-form" onSubmit={event=>{void save(event)}}><label htmlFor="ranking-alias">Ton pseudo public</label><p>Visible dans le classement. Ton email reste privé.</p><div><input id="ranking-alias" required minLength={2} maxLength={24} value={alias} disabled={busy} onChange={event=>setAlias(event.target.value)} autoComplete="nickname" /><button className="catalog-button secondary" disabled={busy || !account.online}>{busy?'Enregistrement…':'Enregistrer'}</button></div><p role="status">{message}</p></form>}
    </>}
  </section>
}
