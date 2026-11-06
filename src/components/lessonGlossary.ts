import enterpriseGlossaries from '../data/enterpriseGlossary.json' with { type: 'json' }

export type GlossaryEntry = { id: string; terms: readonly string[]; title: string; definition: string }

export const lessonGlossary: readonly GlossaryEntry[] = [
  { id: 'prompt', terms: ['prompt', 'prompts', 'prompting'], title: 'Prompt', definition: 'La demande que tu donnes à un assistant IA : ce qu’il doit faire, les informations utiles et la forme attendue. Exemple : « Résume ce document en trois points, sans ajouter d’information. »' },
  { id: 'context', terms: ['contexte'], title: 'Contexte', definition: 'Les informations fournies à l’assistant IA pour traiter ta demande : conversation, documents, contraintes ou exemples. Exemple : joindre la politique de retour pour préparer une réponse à un client.' },
  { id: 'agent', terms: ['agent IA', 'agents IA', 'agent outillé', 'agents outillés'], title: 'Agent IA', definition: 'Un système qui peut enchaîner des étapes et utiliser des outils pour atteindre un objectif. Ses actions dépendent de ses accès : consulter une commande ne lui donne pas forcément le droit de rembourser.' },
  { id: 'rag', terms: ['RAG'], title: 'Recherche documentaire (RAG)', definition: 'Une méthode qui recherche des passages dans des documents et les fournit à l’assistant IA pour préparer sa réponse. Il faut toujours vérifier que les passages trouvés soutiennent ce qu’il affirme.' },
  { id: 'hallucination', terms: ['hallucination', 'hallucinations'], title: 'Hallucination', definition: 'Une information inventée ou incorrecte présentée comme vraie par une IA. Exemple : une référence de document qui paraît officielle, mais qui n’existe pas.' },
  { id: 'token', terms: ['token', 'tokens'], title: 'Token', definition: 'Un petit morceau de texte traité par un modèle IA : un mot, une partie de mot ou un signe. Le nombre de tokens peut limiter la taille des échanges et contribuer au coût du service.' },
  { id: 'personal-data', terms: ['données personnelles', 'donnée personnelle'], title: 'Données personnelles', definition: 'Des informations qui permettent d’identifier une personne, directement ou en les croisant. Exemple : un nom, un email nominatif ou un numéro de client associé à une personne.' },
  { id: 'anonymization', terms: ['anonymisation', 'anonymiser'], title: 'Anonymisation', definition: 'Transformer des données pour que les personnes ne puissent plus être identifiées de façon raisonnablement possible. Retirer seulement les noms ne suffit pas si d’autres détails permettent de les retrouver.' },
  { id: 'pseudonymization', terms: ['pseudonymisation', 'pseudonymiser'], title: 'Pseudonymisation', definition: 'Remplacer les identifiants d’une personne par un code ou un autre nom. Si un lien permet de retrouver son identité, les données restent personnelles.' },
  { id: 'permissions', terms: ['permissions'], title: 'Permissions', definition: 'Les droits accordés à un outil ou à un utilisateur : lire, modifier, envoyer ou supprimer, par exemple. Pour un assistant IA, on ne donne que les droits nécessaires à sa tâche.' },
  { id: 'pilot', terms: ['pilote'], title: 'Pilote', definition: 'Un essai limité avant un déploiement plus large : une petite équipe, des tâches précises, une durée et des critères de réussite. Il sert à décider de poursuivre, de modifier ou d’arrêter.' },
] as const

export const enterpriseLessonGlossaries = enterpriseGlossaries as Record<string, GlossaryEntry[]>
const normalizeTerm = (term: string) => term.toLocaleLowerCase('fr').replace(/[’‘]/g, "'").normalize('NFC')

function glossaryMatcher(lessonId: string) {
  const entries = [...lessonGlossary, ...enterpriseLessonGlossaries[lessonId] ?? []]
  const entriesByTerm = new Map(entries.flatMap(entry => entry.terms.map(term => [normalizeTerm(term), entry] as const)))
  const terms = [...entriesByTerm.keys()].sort((a, b) => b.length - a.length)
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['’‘]"))
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])(${terms.join('|')})(?![\\p{L}\\p{N}_])`, 'giu')
  return { entriesByTerm, pattern }
}

export function splitGlossaryText(text: string, lessonId = '', seen = new Set<string>()) {
  const { entriesByTerm, pattern } = glossaryMatcher(lessonId)
  const parts: { text: string; entry?: GlossaryEntry }[] = []
  let offset = 0
  for (const match of text.matchAll(pattern)) {
    const entry = entriesByTerm.get(normalizeTerm(match[0]))!
    if (seen.has(entry.id)) continue
    if (match.index > offset) parts.push({ text: text.slice(offset, match.index) })
    parts.push({ text: match[0], entry })
    seen.add(entry.id)
    offset = match.index + match[0].length
  }
  if (offset < text.length) parts.push({ text: text.slice(offset) })
  return parts
}
