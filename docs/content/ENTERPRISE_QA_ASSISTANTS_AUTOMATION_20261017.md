# Q&A pédagogique — Assistants et automatisation

Date : 17 octobre 2026. Revue indépendante par agent, et non session humaine. Aucun contenu applicatif modifié par cet inspecteur.

## Résolution indépendante avant consultation des clés privées

Dossiers publics et ateliers lus avant `shared/enterpriseAssessmentKeys.json`. Les bonnes réponses des questions de leçon sont présentes dans le catalogue public : elles n'ont donc pas été masquées lors des premières lectures ; aucune prétention d'aveugle pour les 24 questions de leçon. En revanche les dix questions de situation ont été résolues avant ouverture du fichier de clés.

- ent-challenge-assistants-delivery : Q1 option-2 (livrable joint et statuts), Q2 option-3 (capacité/proximité, 480 €, condition), Q3 option-1 (faits seuls), Q4 option-2 (défaut précis puis nouveaux essais), Q5 option-3 (méthode transmissible).
- ent-challenge-automation-workflow : Q1 option-1 (fiche unique), Q2 option-2 (préserver confirmé), Q3 option-3 (file séparée), Q4 option-1 (reprendre étape manquante), Q5 option-3 (critères, accès et répétition).

Ces réponses sont consignées avant lecture des clés. Verdict et revue détaillée suivent après confrontation.

## Verdict

Les dix réponses indépendantes concordent avec les dix clés et leurs explications. Aucune erreur factuelle bloquante ou contradiction de correction trouvée. Les 12 leçons, 24 questions, 36 cartes, 12 ateliers et deux situations ont été lus. Validation du contenu comme préparation guidée, avec réserves pédagogiques ci-dessous ; aucune qualification de maîtrise opérationnelle.

## Findings à traiter

- **P1 pédagogique — transfert insuffisamment testé**, `ent-challenge-assistants-delivery` Q2/Q4 : mêmes salles A/B/C, capacités, coûts, temps et variante remise de 10 % que les leçons `options`/`iterate`. Changer le dossier, les chiffres et le défaut de sortie oblige à réappliquer la méthode. L’autre situation change les IDs et l’organisation mais reprend inscription répétée/incomplète/notification ; acceptable pour une consolidation, limitée pour un examen de transfert.
- **P2 pédagogique — distracteurs très faciles**, notamment `brief` Q1 (texte long / expert), `map` Q1 (liste logiciels), `select` Q2 (justification plus longue), `handover` Q2 (changer titre), situation assistants Q5 (promesse universelle). Remplacer au moins une option par une démarche plausible mais incomplète, de longueur voisine. Les feedbacks actuels expliquent correctement le défaut ; les maintenir causaux après réécriture.
- **P2 expérience — productions longues non conservées**, `GuidedEnterprisePractice.tsx` : brouillon uniquement dans `useState`, avertissement « copie avant de quitter ». L'utilisateur peut perdre un livrable en naviguant. Recommander copie/téléchargement explicite et conservation de session indépendante par leçon si compatible avec la confidentialité, sans transmettre aux managers. Les critères ne deviennent visibles qu'après comparaison : les rendre lisibles avant production aiderait l'auto-évaluation.
- **P2 portée — réaliser une automatisation réelle reste facultatif**. La progression prépare cartes/contrats/essais, mais ne construit pas de flux dans MemStack. Le contrat le dit honnêtement. Conserver cette précision dans landing, parcours et récapitulatif ; proposer un petit exemple de configuration annoté ou un simulateur local pour rendre les passages concrets sans exiger outil externe.

## Inspection traçable par leçon

Le verdict « cohérent » signifie dossier autonome, objectif/atelier/cartes/QCM alignés, non compétence professionnelle démontrée. Questions désignées Q1/Q2 sous le préfixe ID de la ligne.

| ID | Dossier et livrable | Jargon, feedback et distracteurs | Sources/omissions et verdict |
|---|---|---|---|
| `ent-assistants-brief` | RH Boréal, informations suffisantes, brief + deux critères observables ; exemple respecte l'ordinateur fourni. | Brief/livrable expliqués ; Q1=2 Q2=3, feedback causal. Distracteurs trop éloignés d'une erreur métier subtile. | Principes de demande claire sourcés. Date lundi relative acceptable dans fiction. Cohérent. |
| `ent-assistants-documents` | 40×6=240 puis +25=265 ; minimum 30 respecté ; budget produits 280 correctement distingué du total. Tableau + question de validation réalisables. | Sources de pièces explicites ; Q1=2 Q2=1, explications correctes. | Trois micro-pièces plutôt que vrais documents : bon premier niveau, compléter plus tard par pièce plus longue ou conflit de versions. Cohérent. |
| `ent-assistants-meeting` | Décision lundi, grille Zoé jeudi, samedi proposé, bilan ouvert. Demande + quatre lignes + suivi cohérents. | Catégories définies ; Q1=3 Q2=1. Faux engagements bien expliqués. | Peut produire surtout du classement humain : l'étape prompt reste demandée et transfert optionnel présent. Cohérent. |
| `ent-assistants-options` | Capacité et budget éliminatoires, proximité préférée ; C économise dix minutes contre 30 € supplémentaires vs B. | Contraintes/préférences expliquées ; Q1=1 Q2=2. Un distracteur « toujours C » trop voyant. | Disponibilité/équipement inconnus explicités. Prix de salle fictif sans promesse outil. Cohérent ; modifier sa reprise quasi identique en situation finale. |
| `ent-assistants-iterate` | Cas A et B disponibles, diagnostic versions + changement de prompt + attendus + modèle conservable ; pas de perte du bon résultat A. | Itération définie ; Q1=3 Q2=2. Feedback ne confond pas style/qualité. | Deux cas démontrent la méthode sans généralisation. Le dossier devrait varier en situation finale. Cohérent. |
| `ent-assistants-team-playbook` | Méthode six rubriques, Camille/revue datée, 20−14=6 ; essai nouveau cas et limites. | Champs remplaçables et temps complet explicités ; Q1=2 Q2=1. | Guide de prompting soutient structure, pas à lui seul tout le travail organisationnel : présentation comme méthode éditoriale raisonnable, sans revendication scientifique. Cohérent. |
| `ent-automation-map` | 30/semaine dont quatre incomplets ; cinq à sept étapes, Lina/Karim, ligne ≠ devis envoyé. | Déclencheur/action expliqués ; Q1=1 Q2=2. Carte exemple ne nomme pas un logiciel absent des pièces, ce qui est correct. | Flux proposé peut aller plus loin que la seule ressaisie : exemple garde brouillon manuel Lina et prix/envoi Karim. Ajouter éventuellement une cible de gain après mesure ; cohérent. |
| `ent-automation-select` | Seuil 500 inclus, table service→responsable, branche inconnue, décision humaine ; fiche de sélection faisable. | Workflow/connecteur/règle déterministe définis ; Q1=2 Q2=1. Q2 distracteurs trop faibles. | Contrats/opérations/droits non supposés. Source Microsoft décrit déclencheurs et partage, pas matrice comparative de choix : pas de claim universel. Cohérent. |
| `ent-automation-data-contract` | Cinq champs, inscription vs session, format date non ambigu, file distincte des invalides, état protégé. | Mapping/source de référence définis ; Q1=3 Q2=2. | Source n8n déduplication pertinente pour répétition, faible pour contrat de schéma/date : ajouter une source primaire validation de données si souhait de couvrir chaque principe. Le contenu ne prétend pas garantir une protection atomique. Cohérent. |
| `ent-automation-exceptions` | INT-88 fiche existe, notification manque ; INT-89 sans adresse ; tableau reprise et traces complets. | Idempotence expliquée avec limite concurrence ; Q1=1 Q2=3. | Deux nouvelles tentatives sont règle fictive, pas recommandation universelle. Docs Microsoft/n8n cohérentes. La checklist « deux tentatives maximum » peut être comprise comme deux au total ; écrire « deux nouvelles tentatives maximum » pour aligner scénario. Cohérent, petite ambiguïté à corriger. |
| `ent-automation-pilot` | 20 événements =16 uniques+2 répétitions+2 invalides ; 30 min net, six lots compensent 180 min hors coûts. | Pilote défini ; Q1=2 Q2=3. | Pas de preuve tous volumes, coûts absents rappelés. Les seuils zéro doublon/invention sont fournis et permettent décision. Cohérent. |
| `ent-automation-handover` | Rôles Malik/Inès/référent, compte Nora distinct, reprise INT-88, copie inactive, arrêt/repli/revue. | Exécution/modification/connexions distinguées ; Q1=1 Q2=2. Q2 distracteurs trop évidents. | Source Microsoft soutient séparation rôles/connexions ; n8n soutient reprise. Une fiche peut être plus courte : critères plutôt que syntaxe imposée. Cohérent. |

## Sources contrôlées le 17 octobre 2026

Les sept URL du corpus sont accessibles. Vérification ciblée des passages utiles, sans certifier toutes fonctionnalités des outils :

- [Anthropic — Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) : clarté du format, contexte, diversité des exemples, séparation des documents.
- [OpenAI — Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) : guide primaire de prompting ; les gains chiffrés restent des données fictives locales, pas une promesse de cette source.
- [Microsoft — Triggers](https://learn.microsoft.com/en-us/power-automate/triggers-introduction) : déclenchement automatique, manuel, planifié.
- [Microsoft — Share a cloud flow](https://learn.microsoft.com/en-us/power-automate/create-team-flows) : propriétaires, utilisateurs d'exécution, connexions.
- [Microsoft — Error handling](https://learn.microsoft.com/en-us/power-automate/guidance/coding-guidelines/error-handling) : erreurs transitoires, délais et nombre maximum de reprises configurés.
- [n8n — Handle errors](https://docs.n8n.io/build/flow-logic/handle-errors-gracefully.md) : workflow d'erreur et données de reprise ; erreurs de déclencheur pouvant manquer d'identifiant d'exécution.
- [n8n — Remove Duplicates](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.removeduplicates) : historique et portée de déduplication ; cela ne prouve pas une idempotence concurrente universelle.

## Recommandation de livraison

Corriger l'ambiguïté des deux nouvelles tentatives, renouveler le dossier de situation assistants et renforcer quelques distracteurs avant validation finale. Les ajouts sont une base utile pour découvrir et préparer des pratiques ; les durées de 15 minutes et le transfert en poste doivent être validés par de vrais utilisateurs. La suite de cette inspection est une simulation de personas documentée séparément, sans présenter les sorties d'agent comme des résultats humains.
