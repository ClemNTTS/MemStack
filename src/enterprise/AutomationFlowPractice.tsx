import { useState } from 'react'
import { advanceAutomationSimulation, startAutomationSimulation } from './automationSimulation'
import type { AutomationCase, AutomationAction } from './automationSimulation'

const cases: { id: AutomationCase; title: string; context: string }[] = [
  { id: 'duplicate', title: '1. Demande renvoyée', context: 'INT-88 arrive une deuxième fois. La fiche INT-88 existe déjà et son état est confirmé. Il s’agit de la même demande métier.' },
  { id: 'incomplete', title: '2. Dossier incomplet', context: 'INT-89 arrive sans adresse d’intervention. Aucune fiche n’existe dans l’outil de destination. Le planificateur est responsable du complément.' },
  { id: 'notification', title: '3. Notification en échec', context: 'INT-88 : fiche créée à 09:00, notification échouée à 09:01. Le planificateur a retrouvé et vérifié la fiche. Dans cette simulation, les deux nouvelles tentatives échouent aussi. Le délai est à convenir avec le référent ; aucun temps réel ne s’écoule ici.' },
]

export default function AutomationFlowPractice() {
  const [state, setState] = useState(() => startAutomationSimulation('duplicate'))
  const scenario = cases.find(item => item.id === state.kind)!
  const [visited, setVisited] = useState<AutomationCase[]>([])
  function act(action: AutomationAction) {
    const next = advanceAutomationSimulation(state, action)
    setState(next)
    if (next.done) setVisited(previous => [...new Set([...previous, state.kind])])
  }
  return <section className="enterprise-practice enterprise-flow-practice" aria-label="Laboratoire local de reprise d’un flux">
    <p className="lesson-category">Laboratoire fictif · sans connexion à un outil</p><h2>Fais circuler la demande sans doublon</h2>
    <p>Trois incidents pour observer l’effet d’une décision. Les boutons simulent des étapes dans cette page : aucun message n’est envoyé, aucun code apprenant n’est exécuté. Ce laboratoire ne prouve pas qu’une automatisation réelle fonctionne.</p>
    <div className="enterprise-practice-tools" aria-label="Choisir un incident">{cases.map(item => <button className="catalog-button secondary" aria-pressed={state.kind === item.id} key={item.id} onClick={() => setState(startAutomationSimulation(item.id))}>{item.title}{visited.includes(item.id) ? ' ✓' : ''}</button>)}</div>
    <h3>{scenario.title}</h3><p>{scenario.context}</p>
    <ol className="enterprise-flow-stages" aria-label="Étapes du flux"><li>Référence reçue</li><li>Recherche de l’existant</li><li>Complément ou fiche</li><li>Notification ou alerte</li></ol>
    <dl className="enterprise-flow-state"><div><dt>Fiches dans la destination</dt><dd>{state.cards}</dd></div><div><dt>File à compléter</dt><dd>{state.waiting ? 'INT-89 · adresse · planificateur' : 'Aucune nouvelle entrée'}</dd></div><div><dt>Nouvelles tentatives de notification</dt><dd>{state.retries} / 2{state.kind !== 'notification' ? ' · non nécessaires ici' : ''}</dd></div></dl>
    <fieldset disabled={state.done}><legend>Quelle étape lancer maintenant ?</legend><div className="enterprise-practice-tools"><button className="catalog-button secondary" onClick={() => act('create')}>Simuler une recréation</button>{state.kind === 'duplicate' && <button className="catalog-button secondary" onClick={() => act('reuse')}>Retrouver et garder la fiche existante</button>}{state.kind === 'incomplete' && <button className="catalog-button secondary" onClick={() => act('request')}>Demander l’adresse et mettre en attente</button>}{state.kind === 'notification' && <><button className="catalog-button secondary" onClick={() => act('retry')}>Reprendre seulement la notification</button><button className="catalog-button secondary" onClick={() => act('alert')}>Alerter le planificateur</button></>}</div></fieldset>
    <p role="status" className="enterprise-feedback">{state.message || 'Observe ce qui existe déjà avant de choisir.'}</p>
    {state.done && <><p>Incident exploré. Passe à un autre cas ou recommence pour comparer les décisions.</p><button className="catalog-button secondary" onClick={() => setState(startAutomationSimulation(state.kind))}>Recommencer ce cas</button></>}
    <p className="dashboard-note">{visited.length}/3 incidents explorés dans cette visite. Aucune progression n’est enregistrée par ce laboratoire. En situation réelle, le référent doit aussi configurer la protection contre deux traitements simultanés.</p>
  </section>
}
