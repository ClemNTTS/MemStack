# Revue Q&A indépendante — refonte Entreprise

Date : 17 octobre 2026. Revue par agents, sans validation utilisateur humaine. Responsable : agent Q&A ; revue assistants/automatisation déléguée à un agent pédagogique distinct. Les simulations de salariés suivent cette première revue ; l'inspection visuelle du frontend appartient à une phase ultérieure.

## Périmètre réellement examiné

Catalogue v2 : 18 nouvelles leçons, leurs 36 questions, 54 cartes, 18 ateliers, 3 nouvelles situations (15 questions) et glossaires. Relecture complémentaire des deux fondations existantes `ent-answer-or-action` et `ent-useful-request`. Les 22 leçons historiques sont conservées comme ressources ; la présente revue ne prétend pas les requalifier toutes. Fichiers : `shared/enterpriseCurriculum.json`, `shared/enterpriseAssessmentKeys.json`, `src/data/enterprisePractices.json`, `src/data/enterpriseGlossary.json`, `src/enterprise/GuidedEnterprisePractice.tsx` et contrat `docs/ENTERPRISE_REDESIGN_PLAN.md`.

L'agent Q&A a lu intégralement les six leçons projets : messages, questions, feedbacks, cartes et ateliers ; l'agent délégué a effectué cette lecture pour les douze autres. Voir [rapport assistants et automatisation](ENTERPRISE_QA_ASSISTANTS_AUTOMATION_20261017.md). Aucune clé de correction n'est importée dans le frontend par ce travail documentaire.

## Résolution indépendante des situations

Les choix ci-dessous ont été déduits à la lecture des pièces publiques avant ouverture du fichier de clés. Les situations ne sont pas des épreuves de production en outil réel.

| Situation | Réponses déduites Q1 à Q5 | Justification déterminante | Comparaison aux clés |
| --- | --- | --- | --- |
| `ent-challenge-assistants-delivery` | 2, 3, 1, 2, 3 | Relier pièces ; C satisfait 12 places/500 € et proximité ; distinguer décision/proposition ; retirer remise ajoutée puis rejouer ; transmettre méthode complète. | 5/5 concordantes |
| `ent-challenge-automation-workflow` | 1, 2, 3, 1, 3 | Entrée complète ; ID existant conservé avec état confirmé ; incomplet en file distincte ; reprendre notification sans recréer ; reprise et connexions démontrées. | 5/5 concordantes |
| `ent-challenge-projects-launch` | 1, 2, 3, 1, 2 | Catalogue validé ; livraison bornée ; prototype pour observer ; paiement à recadrer ; entretien/tests/repli avant publication. | 5/5 concordantes |

Calculs relus : 30 appels Cyprès = 18 + 8 + 4 ; C à 480 € respecte le plafond de 500 €, A manque de deux places ; 20 − 14 = 6 minutes sur le cas fourni, sans extrapolation universelle. La revue détaillée automatisation contrôle ses calculs de gain séparément.

## Matrice des 18 leçons

Les constats couvrent objectif, pièces disponibles, atelier, questions/feedbacks et cartes. « Cohérent » signifie faisable avec les données et aligné avec l'objectif ; ce n'est ni une preuve de transfert humain ni une certification.

| ID | Contrôle concret / réserve |
| --- | --- |
| `ent-assistants-brief` | Délégation de livrable et contraintes ; détail au rapport délégué. |
| `ent-assistants-documents` | Assemblage de pièces, arbitrage des inconnues ; détail au rapport délégué. |
| `ent-assistants-meeting` | Décisions, actions, propositions distinctes ; détail au rapport délégué. |
| `ent-assistants-options` | Comparaison de solutions et calculs ; détail au rapport délégué. |
| `ent-assistants-iterate` | Même grille et cas rejoués ; détail au rapport délégué. |
| `ent-assistants-team-playbook` | Transmission et essai sans l'auteur ; détail au rapport délégué. |
| `ent-automation-map` | Entrée, étapes, sortie et responsabilités ; détail au rapport délégué. |
| `ent-automation-select` | Choix d'un premier lien et rôle de l'IA ; détail au rapport délégué. |
| `ent-automation-data-contract` | Champs requis et propriétaire des états ; détail au rapport délégué. |
| `ent-automation-exceptions` | Répétitions et reprises par étape ; détail au rapport délégué. |
| `ent-automation-pilot` | Gain net et critères d'extension ; détail au rapport délégué. |
| `ent-automation-handover` | Version commune, référent et remplaçant ; détail au rapport délégué. |
| `ent-projects-outcome` | Cohérent : 18/30 motive horaires, sans promesse de suppression des appels ; fiche et prompt comparatif réalisables. |
| `ent-projects-specification` | Cohérent : deux fiches avec heure/durée/salle ; année explicitement absente ; demande de réalisation possible sans publication. |
| `ent-projects-prototype` | Cohérent pour grille et protocole ; textes/maquette non fournis, donc observation réelle impossible ici. Trois options et deux tâches présentes. |
| `ent-projects-iteration` | Cohérent : jardin Nord/Sud 35 €/h, haie Nord sur devis, compost Sud 12 €/sac ; zones puis boutons, préservation/reprise prévues. |
| `ent-projects-release` | Cohérent pour plan de recette ; fiches A/B seulement désignées, demande de clarification auteur ; deux inscriptions distinctes après A/B/A, mécanisme technique à confirmer. |
| `ent-projects-maintenance` | Cohérent : Lila/Rémi, 2 h d'arbitrage, inconnues explicites ; besoin d'une synthèse finale assemblant les étapes d'un même projet. |

## Constats et demandes aux auteurs

| Réf. | Niveau | Constat | Action demandée / statut |
| --- | --- | --- | --- |
| QA-01 | P2 | Plusieurs QCM opposent une bonne réponse détaillée à deux extrêmes absurdes. La réussite peut refléter l'identification de la réponse raisonnable. | Renforcer les distracteurs des trois situations avec propositions professionnellement plausibles. Transmis au manager contenu. |
| QA-02 | P2 | Six cas projets indépendants produisent six fragments plutôt qu'un dossier final repris d'étape en étape. | Ajouter une structure de rassemblement et une consigne de transfert finale. Transmis au manager contenu. |
| QA-03 | P2 | Atelier lancement cite fiches A/B sans leurs champs ; pas bloquant pour écrire un plan, insuffisant pour faire une saisie réelle. | Clarifier qu'il s'agit d'identités de test distinctes à préparer et d'un plan simulé. Transmis au manager contenu. |
| QA-04 | P2 UI | Critères initialement visibles seulement après comparaison ; l'apprenant ne voit pas toute sa grille avant rédaction. Brouillon initialement perdu en quittant. | Montrer critères avant saisie et proposer conservation explicite ; garder confidentialité et séparation organisation/personnel. Transmis au responsable frontend. |
| QA-05 | Limite | Tous les ateliers sont des productions de texte comparées à un exemple, sans exécution IA, automatisation ou code. | Promesse exacte : préparer des méthodes et livrables, puis transfert facultatif vers outil autorisé. Ne pas promettre site publié ou automatisation connectée pendant le cours. |

Le texte des nouvelles pratiques privilégie désormais des productions utiles (courriel, réunion, comparaison, processus, spécification) ; la vérification soutient leur qualité. Les deux fondations gardent un exemple prudent de remboursement : acceptable comme démarrage court, à condition que le frontend expose rapidement les trois parcours appliqués.

## Vérification des sources projets

Sources primaires consultées le 17 octobre 2026 : [GOV.UK — user stories](https://www.gov.uk/service-manual/agile-delivery/writing-user-stories) pour public/action/but et critères ; [W3C — Easy Checks](https://www.w3.org/WAI/test-evaluate/easy-checks/) pour contrôles initiaux explicitement non exhaustifs ; [GOV.UK — live phase](https://www.gov.uk/service-manual/agile-delivery/how-the-live-phase-works) pour entretien, itération, appareils et accessibilité ; [GitHub — sauvegarde de dépôt](https://docs.github.com/en/repositories/archiving-a-github-repository/backing-up-a-repository) pour distinguer périmètres de sauvegarde et restauration. Ces recommandations étayent les méthodes, pas une garantie de résultat commercial ou de conformité.

## Verdict initial et suites

Pas d'erreur factuelle bloquante relevée dans les pièces examinées. Réserves pédagogiques concrètes QA-01 à QA-03 transmises avant phase UI. Retour simulé manager PME : [rapport projets](ENTERPRISE_PERSONA_PROJECTS_20261017.md). Les autres personas et la clôture des corrections sont consignés par la suite, sans présenter une simulation d'agent comme un test avec salarié réel.

## Première clôture après retour auteur

Relecture des fichiers corrigés le 17 octobre :

- QA-02 fermé : l'atelier `ent-projects-maintenance` rassemble désormais un dossier Cyprès en six rubriques. Le rappel des pièces dans la consigne permet de le rédiger sans rechercher un document externe. L'exemple montre une cohérence entre besoin, choix, modification, contrôles et reprise.
- QA-03 fermé : scénario `ent-projects-release` définit A/B comme identités de test distinctes avec champs à préparer par l'équipe technique ; ce ne sont plus de prétendues fiches fournies.
- QA-01 partiellement fermé : Q1–Q3 de la situation projets opposent désormais des réalisations partielles/anticipées plausibles au périmètre validé. La pièce distingue explicitement écrans et site public. Nouvelle résolution : 1/2/3/1/2, toujours justifiée. Le renouvellement assistants et la précision automatisation restent suivis séparément.
- Nouvelle demande QA-06 : `ent-automation-exceptions` distingue mal « deux tentatives » de « deux nouvelles tentatives » dans sa checklist. Le scénario impose au plus deux reprises après l'échec initial ; demande de formulation identique transmise à l'auteur.

La simulation projets a été confrontée aux corrections : le dossier final peut être assemblé avec public clients, besoin horaires, trois critères (horaires/adresse/préparation), approche en maquette à confirmer, modification limitée, tests et responsabilités. Les inconnues techniques restent attribuées à un référent plutôt qu'inventées. Ce contrôle ferme une lacune d'instruction ; il ne mesure pas la réussite d'un salarié novice.

QA-06 fermé après relecture : la checklist dit désormais « Deux nouvelles tentatives de notification au maximum après l’échec initial, puis alerte au planificateur. » Le total autorisé est donc l'essai initial et au plus deux reprises pour ce cas fictif, sans ambiguïté sur un prétendu standard universel.

Rapports de simulation supplémentaires : [assistant administratif et commercial](ENTERPRISE_PERSONA_ASSISTANTS_20261017.md), [référent automatisation non développeur](ENTERPRISE_PERSONA_AUTOMATION_20261017.md). Ils couvrent les douze ateliers restants avec productions écrites et signalent explicitement que les mêmes agents avaient vu les exemples en QA. Une seconde lecture par un agent frais, avec productions enregistrées avant ouverture des exemples, complète cette limite de méthode.

Demandes issues de ces simulations : préciser que « attendu jeudi » ne devient pas « confirmé prêt jeudi » dans l'itération d'un message ; simuler les pannes en environnement d'essai avec référent lors du transfert facultatif. Pour l'interface : critères visibles tôt, export du texte, explication du vocabulaire de contrat de données et du statut d'auto-comparaison.

## Clôture du dossier Assistants renouvelé

L'auteur a remplacé la situation finale par une présentation de partenaires pour 18 personnes, plafond 720 €, proximité de gare. Nouvelle résolution Q1–Q5 : **1, 2, 3, 2, 1**, confrontée aux nouvelles clés et explications : 5/5 concordantes. Le premier tableau de ce rapport conserve la trace de la version initialement inspectée ; il ne décrit plus les réponses finales de cette situation.

Recalculs : A (20 places, 680 €, 8 min) et B (18 places, 620 €, 25 min) satisfont capacité et plafond ; la priorité de transport favorise A pour 60 € de plus et 17 minutes de moins. C n'offre que 16 places. Le compte rendu n'attribue pas la réservation à Rami, chargé de la seule trame. V2-B transforme une attente de visuels en achèvement et envoi non établis ; correction ciblée puis reprise A/B. 25 − 17 = 8 minutes sur un seul cas, sans promesse de gain universel. Aucun choix correct ne nécessite de compléter une pièce absente.

QA-01 fermé sur le défaut prioritaire de copie des données du cours : contexte, chiffres, défaut de message et position des bonnes réponses renouvelés. La difficulté demeure celle d'une consolidation guidée, sans prétention de test professionnel indépendant. Les distracteurs peuvent encore être étalonnés par des essais humains.

Autres clôtures relues : la checklist et l'explication d'itération préservent le statut « attendu » ; le transfert de panne est explicitement réservé à un environnement de test avec référent ; l'amorce de maintenance contient les six rubriques du dossier Cyprès.

## Lecture par agent frais

[Rapport de l'agent frais](ENTERPRISE_PERSONA_FRESH_20261017.md) : six productions enregistrées avant ouverture des exemples et explications, extraction limitée aux titres/objectifs et ateliers sans clés ni `correctOptionId`. Deux activités par parcours : brief/documents, contrat de données/exceptions, spécification/lancement. Les messages de cours ont ensuite été lus pour distinguer un défaut du parcours d'un défaut d'atelier lu seul.

Observation concrète : la première production du contrat de données conserve `soumise` dans l'état de destination ; le message de cours précise au contraire `à traiter`. La transformation est donc enseignée mais insuffisamment rappelée dans l'atelier isolé. Demande auteur : rappeler explicitement ce mapping dans scénario et critères. Autres précisions demandées : délai des reprises à fixer avec référent ; répétition de A signifie renvoi de la même demande métier, pas interdiction de toute future inscription par la même personne. Aucun échec d'un salarié réel ni mesure de réussite n'est inféré.

Recommandation pour la phase UI : un laboratoire déterministe de circulation d'une fiche (répétition, incomplet, notification en échec) rendrait visible ce que le texte prépare. Il doit rester présenté comme simulation locale sans connecteur ni preuve de fonctionnement en production, et recevoir une revue Q&A propre après implémentation.

## Clôture avant passage à UI/UX

Relecture finale des trois précisions demandées après persona frais :

- `ent-automation-data-contract` : scénario et checklist donnent maintenant `soumise → à traiter` uniquement à la création, avec statut ultérieur du coordinateur préservé lors d'un renvoi.
- `ent-automation-exceptions` : explication attribue explicitement la définition du délai au référent selon l'outil et l'incident, sans durée universelle inventée. Ce rappel apparaît après comparaison ; une reprise dans l'amorce reste une amélioration facultative.
- `ent-projects-release` : la tâche définit répétition de A comme renvoi de la même demande métier, et la distingue d'une nouvelle demande légitime de la même personne.

Verdict de passage : les réserves pédagogiques prioritaires et les ambiguïtés concrètes identifiées ont été corrigées et relues. Aucun blocage de contenu identifié sur ce périmètre. Les 18 nouvelles leçons ont une revue par ID et une simulation de production ; six ont aussi une production par lecteur frais avant exemples. Les limites de difficulté, d'étalonnage des durées et de maîtrise en outil réel restent ouvertes à qualification humaine. Les constats UI ne sont pas fermés par cette revue documentaire ; ils doivent être traités et vérifiés dans la phase suivante. Toute nouvelle activité ajoutée ensuite nécessite sa propre relecture.

## Q&A de la nouvelle activité interactive — laboratoire de reprise

Revue indépendante après implémentation UI, le 17 octobre 2026. Sources lues intégralement : `src/enterprise/automationSimulation.ts`, `AutomationFlowPractice.tsx`, `automationSimulation.test.ts`, intégration dans `EnterpriseLessonView.tsx` et les cinq messages de `ent-automation-exceptions`. Aucun contenu applicatif modifié par l'inspecteur ; cette vérification utilise la logique sous Node et la lecture du composant, sans prétendre constituer un contrôle visuel navigateur.

### Cas et cohérence pédagogique

| Cas | Séquence essayée | Résultat observé / adéquation au cours |
| --- | --- | --- |
| Demande renvoyée | Recréer → retrouver/garder | La création est refusée avec explication ; une fiche reste présente ; la même demande INT-88 conserve son état confirmé selon le feedback. Le contexte précise qu'il s'agit de la même demande métier. |
| Adresse absente | Recréer → demander/attendre | Aucune fiche de destination ; INT-89 entre dans la file distincte avec motif et planificateur. La suite après complément conserve la même référence selon le feedback. |
| Notification | Alerte précoce → reprise 1 → recréer → reprise 2 → reprise supplémentaire → alerte | L'alerte précoce rappelle la procédure fictive ; aucune création supplémentaire ; les deux nouvelles tentatives échouent explicitement ; troisième reprise refusée ; alerte terminale au planificateur. La création initialement réussie n'est jamais rejouée. |

Le cas notification annonce dès son contexte : échec initial déjà survenu, fiche retrouvée et vérifiée par le planificateur, deux reprises qui échoueront dans cette simulation. Le compteur démarre donc à zéro **nouvelles** tentatives, puis passe à 1/2 et 2/2 : il ne confond pas trois essais au total avec trois reprises. Aucun délai réel n'est simulé ; le référent doit convenir de l'espacement. Le composant rappelle que la protection contre traitements simultanés doit encore être configurée dans les outils réels.

### Exécution indépendante de la logique

- `node --test src/enterprise/automationSimulation.test.ts` : trois tests réussis.
- Parcours exhaustif de séquences jusqu'à six actions depuis chacun des trois cas, avec les cinq actions exposées par la fonction : **58 593 états examinés**. Il s'agit d'états de séquences, avec répétitions, et non de 58 593 cas métier distincts.
- Invariants vérifiés à chaque état : une fiche pour répétition/notification, zéro pour incomplet ; compteur entier de 0 à 2 ; attente uniquement sur incomplet ; zéro reprise sur les deux autres cas ; entrée non mutée par la fonction ; tout état terminé reste stable pour toutes les actions ; la terminaison notification suppose deux reprises consommées.
- Les trois chemins attendus terminent correctement, même après une action inadéquate ; aucune troisième reprise n'incrémente le compteur et aucun clic de création n'augmente le nombre de fiches.

### Intégration, persistance et honnêteté

La pratique est rendue au seul message d'atelier préfixé `Pratique ·` dans la leçon exceptions, avant la production écrite existante. La navigation vers les questions conserve le composant dans la conversation ; changer d'incident le réinitialise, et les cas explorés restent seulement en état React pendant la visite. Aucun stockage, requête réseau, Firebase, exécution de code ou appel à la progression n'existe dans le simulateur. La validation de la mission reste un mécanisme distinct du laboratoire.

Le texte annonce laboratoire fictif, boutons simulés, absence de message envoyé et absence de preuve de fonctionnement d'une automatisation réelle. Le compteur dit « incidents explorés », pas « compétences validées ». Le feedback utilise `role=status` ; les scénarios utilisent `aria-pressed`, et les actions d'un cas terminé sont désactivées. Les trois cas peuvent être recommencés. Le contrôle visuel et clavier relève de la recette UI distincte, pas de cette exécution Node.

Réserve de portée : un mauvais choix « Recréer » est refusé avec son explication, au lieu de produire visuellement un doublon. C'est un exercice guidé de décision avec garde-fous, pas une reproduction fidèle du comportement d'un connecteur mal configuré. Cette simplification est acceptable au regard du texte d'introduction. L'alerte après deux reprises correspond au contrat fictif ; elle ne doit pas être présentée comme interdiction universelle d'alerter plus tôt en situation réelle.

**Clôture de cette activité : aucun défaut bloquant identifié.** Les trois cas, leurs suites, le bornage des reprises et la séparation progression/simulation sont cohérents avec la leçon et les ateliers corrigés. L'activité améliore la visibilité de la circulation d'une demande, sans qualifier la maîtrise d'un outil externe ni remplacer une séance avec des salariés.
