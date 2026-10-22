# Inspection des cartes et consignes Entreprise

Date : 22 octobre 2026. Lot D du plan de guidage. Référence avant modification : commit 1a8b673. Lecture des 120 questions/réponses et des 40 consignes avec cas, amorces et critères existants.

## Méthode et périmètre

Lecture suivant WORKFLOW.md et ENTERPRISE_WORDING.md. Pour chaque carte : question compréhensible hors de la mission, réponse portant une idée essentielle, valeur pour un geste professionnel, fidélité à la compétence et absence de détail de scénario à réciter. Une formulation déjà correcte est conservée. Pour chaque activité : production attendue, format et pièces nécessaires identifiables, absence d’action réelle implicite et cohérence avec les critères/exemples.

Les 40 sections ci-dessous donnent l’objectif et les sources existantes de la mission ; ces références s’appliquent aux trois cartes et à sa consigne. Le motif propre à chaque ligne décrit la distinction relue. Les sources du catalogue sont conservées ; toutes les pages ne font pas l’objet d’une nouvelle vérification externe dans ce lot.

## Vérifications primaires ciblées du 22 octobre 2026

- [Anthropic — Mitigate jailbreaks and prompt injections](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks) : instructions adverses dans documents, pages, emails ou résultats d’outils. La correction ne conditionne plus l’attaque au caractère caché de l’instruction.
- [Anthropic — Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests) : mesurer le résultat avec des critères et des comparaisons. La nouvelle formulation d’itération demande de vérifier l’amélioration plutôt que de la présumer.
- [GOV.UK — How the alpha phase works](https://www.gov.uk/service-manual/agile-delivery/how-the-alpha-phase-works) : prototypes limités aux idées et hypothèses à tester, sans réalisation entière ni qualité de production exigée. La maquette reste un exemple possible.
- La formule de gain net est rapprochée du cas Solis existant : 60 minutes de travail manuel − (18 de surveillance + 12 de corrections) = 30 minutes ; 180/30 = six lots sous les hypothèses indiquées. La tâche chiffres Aster conserve 200×(2−1)=200 minutes puis 200×(2−3)=−200 minutes par semaine.

## Registre des 120 cartes et 40 consignes

### ent-plausible-not-proven

Objectif : Repérer ce qu'il faut vérifier dans une réponse générée.

Sources de la mission : [1](https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers), [2](https://www.nist.gov/itl/ai-risk-management-framework).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-plausible-not-proven-card-1 | Conservée | Une réponse convaincante peut être erronée ; la question entraîne le contrôle d’un fait plutôt que la confiance dans le ton. |
| ent-plausible-not-proven-card-2 | Conservée | Une référence doit être retrouvable et soutenir l’affirmation ; la réponse distingue la preuve d’un titre seulement crédible. |
| ent-plausible-not-proven-card-3 | Conservée | La version à jour évite de reprendre une règle remplacée ; la carte reste utilisable sans mémoriser les dates du cas Aster. |

Consigne ent-plausible-not-proven — **Conservée** : Comparer trois affirmations puis rédiger un court message ; les deux règles et la référence non fournie sont présentes dans le cas, les diagnostics disposent d’une correction dédiée.

### ent-answer-or-action

Objectif : Préparer un message et savoir ce qu’il reste à faire avant son envoi.

Sources de la mission : [1](https://www.anthropic.com/engineering/building-effective-agents).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-answer-or-action-card-1 | Conservée | L’assistant IA est un logiciel aux tâches et droits variables ; cette définition donne le repère de départ sans exiger de marque ou de jargon. |
| ent-answer-or-action-card-2 | Conservée | Rédiger ne suffit pas à envoyer ; la réponse conserve les deux conditions, connexion de l’outil et droits nécessaires. |
| ent-answer-or-action-card-3 | Conservée | La relecture couvre informations, destinataires et engagement ; la carte justifie une action professionnelle concrète avant envoi. |

Consigne ent-answer-or-action — **Conservée** : Deux phrases réparties dans deux champs, assistant puis Léa ; la consigne visible et les amorces du lot B lèvent la confusion texte préparé/action réelle.

### ent-minimum-data

Objectif : Choisir les informations strictement utiles à un prompt.

Sources de la mission : [1](https://www.cnil.fr/fr/les-questions-reponses-de-la-cnil-sur-lutilisation-dun-systeme-dia-generative).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-minimum-data-card-1 | Conservée | Utilité et autorisation des informations sont toutes deux nécessaires ; la carte ne réduit pas la minimisation à un simple volume de texte. |
| ent-minimum-data-card-2 | Conservée | Retirer un nom ne garantit pas l’anonymat ; les recoupements possibles restent le critère essentiel, sans promesse juridique. |
| ent-minimum-data-card-3 | Conservée | Un exemple fictif est inventé et ne reprend pas de données réelles ; la carte rend possible un entraînement sans dossier client. |

Consigne ent-minimum-data — **Conservée** : Produire le cas à transmettre, justifier les détails gardés et nommer les retraits ; l’amorce sépare ces trois sorties sans confondre supprimer et anonymiser.

### ent-approved-tool

Objectif : Identifier les questions à poser avant d'utiliser un service avec des données professionnelles.

Sources de la mission : [1](https://www.cnil.fr/fr/les-questions-reponses-de-la-cnil-sur-lutilisation-dun-systeme-dia-generative), [2](https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-approved-tool-card-1 | Conservée | Payer ne vaut pas autorisation interne ; usages, données et réglages restent les trois vérifications utiles à l’apprenant. |
| ent-approved-tool-card-2 | Conservée | La conservation est une durée de stockage ; la réponse relie cette notion au geste concret de transmettre un document professionnel. |
| ent-approved-tool-card-3 | Conservée | Une autorisation a un périmètre ; la carte refuse l’extension implicite à tous les documents et usages. |

Consigne ent-approved-tool — **Conservée** : Connu/à vérifier/hors périmètre puis une question au responsable ; la publicité et les preuves absentes sont distinguées dans le cas, la décision reste humaine.

### ent-hostile-document

Objectif : Séparer les instructions de travail du contenu d'un document à analyser.

Sources de la mission : [1](https://www.nist.gov/itl/ai-risk-management-framework), [2](https://www.anthropic.com/engineering/building-effective-agents).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-hostile-document-card-1 | Corrigée | Une instruction de détournement peut être visible ou cachée ; correction de « cachées » qui excluait l’attaque explicitement lisible dans le propre scénario. |
| ent-hostile-document-card-2 | Conservée | Le contenu lu n’accorde pas de permission ; la réponse maintient la séparation document/instruction autorisée. |
| ent-hostile-document-card-3 | Conservée | Restreindre les outils limite les effets d’une erreur ou d’un détournement ; la carte porte sur un contrôle technique, pas seulement un avertissement écrit. |

Consigne ent-hostile-document — **Conservée** : Note au collègue distinguant besoin client, instruction suspecte et accès limités ; l’activité demande une analyse, sans exécution ni export réel.

### ent-useful-request

Objectif : Donner les informations utiles pour obtenir un mail facile à reprendre.

Sources de la mission : [1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-useful-request-card-1 | Conservée | Le prompt est le message qui explique le résultat voulu ; la définition respecte la convention de vocabulaire et ne remplace pas les demandes clients par ce mot. |
| ent-useful-request-card-2 | Conservée | Résultat, informations, public et limites rendent la demande exploitable ; la question appelle une idée transférable plutôt qu’un créneau à réciter. |
| ent-useful-request-card-3 | Conservée | Une information manquante doit être signalée ou demandée ; la carte prépare le comportement concret de ne pas inventer un lieu. |

Consigne ent-useful-request — **Conservée** : Écrire le prompt et non le mail final ; le destinataire, les deux créneaux, le délai de réponse, le lien absent et la longueur sont tous fournis dans le cas.

### ent-context-rag

Objectif : Comprendre le contexte, sa limite et la recherche documentaire augmentée.

Sources de la mission : [1](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-context-rag-card-1 | Conservée | Le contexte comprend consignes, échanges, documents et outils ; la réponse évite de le confondre avec les seules connaissances apprises par le modèle. |
| ent-context-rag-card-2 | Conservée | Le RAG recherche des passages pour aider la réponse ; le développement français de la méthode suffit, sans fonctionnement technique exigé. |
| ent-context-rag-card-3 | Conservée | Une citation demande encore contrôle du passage, des conditions et de la date ; l’affichage d’une source n’est pas présenté comme garantie. |

Consigne ent-context-rag — **Conservée** : Assembler les pièces, leur rôle et deux contrôles ; JAN/SEPT et leur statut sont décrits sur place, sans devoir ouvrir un document externe.

### ent-iterate-examples

Objectif : Utiliser un exemple et une grille pour comparer des versions de prompt.

Sources de la mission : [1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), [2](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-iterate-examples-card-1 | Corrigée | Une itération est un essai après changement ciblé, dont l’amélioration doit être vérifiée ; correction du succès garanti par « améliore ». |
| ent-iterate-examples-card-2 | Conservée | Un exemple de style règle la forme, pas les faits du nouveau dossier ; cette limite empêche de recopier les conditions d’un exemple. |
| ent-iterate-examples-card-3 | Conservée | Comparer sur mêmes données et mêmes critères permet d’attribuer le changement ; la réponse conserve les deux invariants sans résultat arbitraire. |

Consigne ent-iterate-examples — **Clarifiée** : Consigne découpée en modification unique puis comparaison C1/C2/C3 ; « prompt qui a produit A » remplace le prompt A non fourni et précise qu’il ne faut pas le reconstituer.

### ent-verify-claims

Objectif : Contrôler les affirmations qui engagent l'entreprise.

Sources de la mission : [1](https://www.nist.gov/itl/ai-risk-management-framework).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-verify-claims-card-1 | Conservée | Chaque affirmation importante demande sa propre preuve ; la réponse ne laisse pas une source valider tout le message. |
| ent-verify-claims-card-2 | Conservée | Une autorisation ne prouve pas la réalisation de l’action ; il faut consulter son résultat, distinction centrale pour paiement et envoi. |
| ent-verify-claims-card-3 | Conservée | Retirer une condition change la portée d’une règle ; la carte permet de contrôler un résumé sans rappeler la politique exacte du scénario. |

Consigne ent-verify-claims — **Conservée** : Trois lignes de vérification puis une réponse fidèle aux pièces ; le modèle de départ nomme affirmation, pièce et confirmation avant le message client.

### ent-numbers-sources

Objectif : Vérifier un calcul simple et la portée d'une source.

Sources de la mission : [1](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-numbers-sources-card-1 | Conservée | Le gain net inclut préparation, relecture et correction ; la carte fait rappeler le coût de travail ajouté, pas seulement la vitesse de génération. |
| ent-numbers-sources-card-2 | Conservée | Un résultat sur une tâche ne se généralise pas automatiquement ; l’essai dans les conditions de la nouvelle tâche reste nécessaire. |
| ent-numbers-sources-card-3 | Conservée | Produire vite ne prouve pas gagner du temps au total ; la question teste cette confusion sans demander de calcul caché. |

Consigne ent-numbers-sources — **Clarifiée** : Deux calculs hebdomadaires puis portée de la fiche ; tâche et scénario clarifiés pour retirer 1 puis 3 minutes au gain brut de 2, avec 200 demandes et unités, sans modifier les résultats attendus.

### ent-human-escalation

Objectif : Définir les situations où un humain compétent doit décider.

Sources de la mission : [1](https://www.nist.gov/itl/ai-risk-management-framework).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-human-escalation-card-1 | Conservée | Passer la main revient à confier le cas hors capacité ou autorisation à une personne désignée ; la réponse n’exige pas le mot technique escalade. |
| ent-human-escalation-card-2 | Conservée | Une validation utile exige informations, temps et pouvoir de refus ; la carte évite l’approbation humaine purement formelle. |
| ent-human-escalation-card-3 | Conservée | Une demande client n’est pas une décision accordée ; cette distinction évite de transformer un souhait en promesse d’indemnisation. |

Consigne ent-human-escalation — **Conservée** : Écrire la règle de relais puis un brouillon d’attente ; déclencheur, personne, action suspendue et informations à transmettre sont séparés dans l’amorce.

### ent-right-tool

Objectif : Comparer une règle simple, une recherche et une génération.

Sources de la mission : [1](https://www.anthropic.com/engineering/building-effective-agents), [2](https://www.nist.gov/itl/ai-risk-management-framework).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-right-tool-card-1 | Conservée | Une règle fixe ou un calcul peuvent suffire ; la carte remet le besoin avant le choix d’une IA. |
| ent-right-tool-card-2 | Conservée | Comparer d’abord à une solution plus simple évite un ajout d’outil sans bénéfice ; les exemples document/formulaire/règle sont compréhensibles seuls. |
| ent-right-tool-card-3 | Conservée | Un calcul de date exige convention explicite et cas attendus ; la réponse ne suppose aucune règle calendaire universelle. |

Consigne ent-right-tool — **Conservée** : Trois besoins, chacun avec solution, essai attendu et alternative ; les pièces donnent la convention de dates et la condition à préserver.

### ent-environment-cost

Objectif : Raisonner sur le volume d'usage et les postes de coût sans fausse précision.

Sources de la mission : [1](https://www.ademe.fr/presse/communique-national/ia-generative-comment-quantifier-les-impacts/).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-environment-cost-card-1 | Conservée | Le nombre de prompts seul ne permet pas un impact chiffré ; la carte évite une conversion universelle en énergie ou carbone. |
| ent-environment-cost-card-2 | Conservée | Déclencher selon un besoin réel limite les générations inutiles ; le rappel porte sur une décision de conception applicable au travail. |
| ent-environment-cost-card-3 | Conservée | Le coût complet inclut aussi le temps humain ; la réponse élargit l’abonnement sans prétendre calculer un montant absent. |

Consigne ent-environment-cost — **Conservée** : Séparer premier mois et récurrence, choisir le déclenchement et expliciter données absentes ; les montants, alerte et plafond sont dans le scénario et l’amorce sépare démarrage/mensuel.

### ent-problem-before-solution

Objectif : Formuler un besoin et un indicateur avant de choisir la solution.

Sources de la mission : [1](https://www.nist.gov/itl/ai-risk-management-framework).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-problem-before-solution-card-1 | Conservée | Cadrer signifie décrire problème, personnes et résultat avant l’outil ; la réponse transforme une intention vague en besoin observable. |
| ent-problem-before-solution-card-2 | Conservée | Le hors-périmètre dit ce qui ne sera pas pris en charge ; la carte explique l’intérêt opérationnel de limiter la première version. |
| ent-problem-before-solution-card-3 | Conservée | Comparer du travail similaire en temps complet et qualité évite une mesure de vitesse isolée ; aucun chiffre de retour sur investissement n’est promis. |

Consigne ent-problem-before-solution — **Conservée** : Fiche de décision avant choix de l’outil ; l’amorce reprend personnes, observations, tâche, exclusions et décision, sans exiger un chatbot.

### ent-agents-permissions

Objectif : Définir une délégation limitée et contrôlable à un agent.

Sources de la mission : [1](https://www.anthropic.com/engineering/building-effective-agents).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-agents-permissions-card-1 | Conservée | L’agent utilise un modèle et des outils pour enchaîner des étapes ; les droits restent une limite, sans promesse d’autonomie totale. |
| ent-agents-permissions-card-2 | Conservée | Une interdiction dans un prompt ne retire pas une permission technique ; la réponse nomme le contrôle effectif sur droit ou outil. |
| ent-agents-permissions-card-3 | Conservée | Une condition d’arrêt borne les tentatives et prévoit le relais ; l’exemple de nombre limité aide sans mémoriser les quatre appels du cas. |

Consigne ent-agents-permissions — **Conservée** : Fiche de délégation et réactions à deux essais ; documents, outils, interdictions, quatre appels et trace sont disponibles, sans exécuter l’agent.

### ent-accountable-project

Objectif : Répartir les responsabilités et documenter une décision réversible.

Sources de la mission : [1](https://www.nist.gov/itl/ai-risk-management-framework).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-accountable-project-card-1 | Conservée | Le responsable suit les résultats et peut arrêter l’essai ; le rôle n’est pas réduit à lancer le projet. |
| ent-accountable-project-card-2 | Conservée | Une solution de repli permet de continuer si l’outil s’arrête ; l’exemple manuel traduit la notion en action accessible. |
| ent-accountable-project-card-3 | Conservée | Les futurs utilisateurs révèlent contraintes et erreurs du travail réel ; la carte justifie leur participation avant généralisation. |

Consigne ent-accountable-project — **Conservée** : Pour trois domaines, associer décideur/preuve/revue puis trois actions de repli ; les personnes et la date sont fournies, sans inventer les accès réels.

### ent-test-representative

Objectif : Construire un échantillon de tests qui révèle les limites.

Sources de la mission : [1](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-test-representative-card-1 | Conservée | Un test représentatif couvre travail courant, difficultés et exceptions ; la réponse ne confond pas quantité d’essais et couverture utile. |
| ent-test-representative-card-2 | Conservée | Le résultat attendu est fixé avant le test et peut être un relais ; cette ouverture évite d’attendre systématiquement une réponse automatique. |
| ent-test-representative-card-3 | Conservée | Une régression casse un cas auparavant réussi ; rejouer les anciens essais donne une conduite concrète après correction. |

Consigne ent-test-representative — **Conservée** : Un comportement attendu pour chacun des six cas, puis rôle du cas réservé ; les règles et le statut J12 permettent de répondre sans deviner un modèle.

### ent-measure-incident

Objectif : Interpréter un bilan de pilote sans confondre adoption, qualité et valeur.

Sources de la mission : [1](https://www.nist.gov/itl/ai-risk-management-framework).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-measure-incident-card-1 | Conservée | La fréquence d’utilisation ne prouve pas l’utilité ; travail obtenu, qualité et gain réel restent distingués de l’adoption. |
| ent-measure-incident-card-2 | Conservée | Un incident grave peut invalider une bonne moyenne ; la réponse conserve une règle d’arrêt sans nier les autres bons résultats. |
| ent-measure-incident-card-3 | Conservée | Un relevé d’incident documente faits, effets, mesures et responsable ; cette liste courte permet une reprise concrète du travail. |

Consigne ent-measure-incident — **Conservée** : Calcul de temps complet puis fiche d’incident ; les chiffres sont fournis et le brouillon non envoyé reste distinct d’une conséquence éventuelle.

### ent-decision-dossier

Objectif : Rendre une décision de pilote proportionnée aux résultats et aux limites.

Sources de la mission : [1](https://www.nist.gov/itl/ai-risk-management-framework).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-decision-dossier-card-1 | Conservée | La condition d’arrêt reste valable malgré un gain de temps ; la question entraîne l’application d’un seuil préalable. |
| ent-decision-dossier-card-2 | Conservée | Poursuivre, modifier/retester ou arrêter sont trois suites possibles ; la carte n’impose pas une généralisation après l’essai. |
| ent-decision-dossier-card-3 | Conservée | Une décision de déploiement relie preuves, limites, usages et responsable ; la réponse fournit la structure d’un avis motivé. |

Consigne ent-decision-dossier — **Conservée** : Cinq phrases pour Nadia sur usage client, suite limitée et vérifications ; le seuil zéro, les deux échecs et l’absence de résultats corrigés sont explicites.

### ent-continue-learning

Objectif : Organiser des révisions et des revues d'usage dans la durée.

Sources de la mission : [1](https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-continue-learning-card-1 | Conservée | La répétition espacée sépare les rappels dans le temps et demande de chercher avant correction ; elle n’est pas présentée comme simple relecture. |
| ent-continue-learning-card-2 | Conservée | Changer les outils impose de revoir droits et essais ; la carte justifie une revue avant utilisation de nouvelles actions. |
| ent-continue-learning-card-3 | Conservée | Le classement d’apprentissage n’est pas la performance professionnelle ; la réponse limite clairement l’interprétation du compteur. |

Consigne ent-continue-learning — **Conservée** : Quatre rendez-vous de dix minutes, revue d’une nouvelle permission puis portée du classement ; semaines et rôles fournis, pas de cadence commerciale inventée.

### ent-meeting-notes

Objectif : Distinguer un résumé de réunion d'une décision approuvée.

Sources de la mission : [1](https://www.cnil.fr/fr/les-questions-reponses-de-la-cnil-sur-lutilisation-dun-systeme-dia-generative), [2](https://www.nist.gov/itl/ai-risk-management-framework).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-meeting-notes-card-1 | Conservée | Proposition et décision approuvée restent distinctes ; la carte combat une erreur courante de résumé sans dépendre d’une réunion précise. |
| ent-meeting-notes-card-2 | Conservée | Une décision non confirmée reste à confirmer ; la réponse privilégie la précision demandée à l’accord inventé. |
| ent-meeting-notes-card-3 | Conservée | Mentionner une action dans un compte rendu n’autorise pas à l’exécuter ; le contrôle prévu reste nécessaire. |

Consigne ent-meeting-notes — **Conservée** : Quatre rubriques puis question utile ; notes écrites, résumé fautif et procédure sont fournis, l’absence de décision peut être indiquée telle quelle.

### ent-new-model-review

Objectif : Préparer une mise à jour de service sans supposer des résultats identiques.

Sources de la mission : [1](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-new-model-review-card-1 | Conservée | Changer de modèle peut changer réponses, délais et coûts ; la carte motive le rejeu d’essais plutôt qu’une confiance dans la nouveauté. |
| ent-new-model-review-card-2 | Conservée | Un retour en arrière doit être réellement possible ; la réponse ne suppose pas qu’une ancienne version reste toujours accessible. |
| ent-new-model-review-card-3 | Conservée | Les nouveaux besoins et incidents enrichissent les tests ; seules les données nécessaires et autorisées sont retenues. |

Consigne ent-new-model-review — **Conservée** : Comparer A/B et préparer avant/après avec repli ; mêmes cas, critères, vitesse et décideur sont indiqués, sans assimiler rapidité à conformité.

### ent-assistants-brief

Objectif : Préparer un prompt qui aboutit à un livrable adapté à son destinataire.

Sources de la mission : [1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), [2](https://developers.openai.com/api/docs/guides/prompt-engineering).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-assistants-brief-card-1 | Conservée | Le brief décrit besoin, public, informations et résultat pour préparer le prompt ; les deux termes ne sont pas traités comme synonymes systématiques. |
| ent-assistants-brief-card-2 | Conservée | Un rôle « expert » ne remplace pas faits et limites ; la carte corrige un raccourci de formulation du prompt. |
| ent-assistants-brief-card-3 | Conservée | Un critère observable permet de juger la sortie ; la réponse donne un repère contrôlable plutôt qu’une impression de qualité. |

Consigne ent-assistants-brief — **Conservée** : Prompt prêt à copier puis deux critères ; l’activité ne demande pas le mail final, et arrivée/lieu/matériel sont disponibles dans le cas.

### ent-assistants-documents

Objectif : Assembler des pièces complémentaires et produire une réponse commerciale traçable.

Sources de la mission : [1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), [2](https://developers.openai.com/api/docs/guides/prompt-engineering).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-assistants-documents-card-1 | Conservée | Une source permet de retracer et vérifier une information ; l’objectif n’est pas seulement d’ajouter une citation décorative. |
| ent-assistants-documents-card-2 | Conservée | Des documents divergents exigent signalement et contrôle des versions ; la réponse évite de choisir une valeur au hasard. |
| ent-assistants-documents-card-3 | Corrigée | Un fait de synthèse doit être étayé et la pièce contrôlée ; correction de la formulation qui transformait les documents disponibles en garantie absolue de vérité. |

Consigne ent-assistants-documents — **Conservée** : Prompt puis quatre lignes sourcées et question de délai ; trois pièces fournissent quantité/prix/logistique, budget produits et total livré restent distincts.

### ent-assistants-meeting

Objectif : Produire un relevé utile qui distingue décisions, propositions et actions.

Sources de la mission : [1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), [2](https://developers.openai.com/api/docs/guides/prompt-engineering).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-assistants-meeting-card-1 | Conservée | Décisions, propositions, actions et questions ouvertes demandent des catégories distinctes ; la réponse reste courte et transférable. |
| ent-assistants-meeting-card-2 | Conservée | Une action exploitable précise quoi/qui/quand ; les informations inconnues restent à confirmer et ne sont pas complétées fictivement. |
| ent-assistants-meeting-card-3 | Conservée | Rendre les manques visibles évite les engagements inventés ; la carte donne le sens opérationnel d’une mention à confirmer. |

Consigne ent-assistants-meeting — **Clarifiée** : Trois livrables numérotés : prompt, relevé de quatre lignes, message de trois phrases maximum ; mêmes catégories et mêmes réponses attendues, séquence rendue explicite.

### ent-assistants-options

Objectif : Construire une comparaison explicite et une recommandation conditionnelle.

Sources de la mission : [1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), [2](https://developers.openai.com/api/docs/guides/prompt-engineering).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-assistants-options-card-1 | Conservée | Une contrainte élimine l’option non conforme ; une préférence départage celles qui conviennent, distinction utile pour recommandation. |
| ent-assistants-options-card-2 | Conservée | Les critères communs rendent avantages et compromis comparables ; la réponse ne réduit pas le choix à un seul prix. |
| ent-assistants-options-card-3 | Conservée | Une recommandation sous condition nomme ce qui reste à confirmer ; l’incertitude n’est pas masquée derrière un choix assuré. |

Consigne ent-assistants-options — **Conservée** : Prompt, tableau des trois salles puis recommandation en deux phrases ; capacité, prix et trajet sont fournis, disponibilité et équipement restent des inconnues.

### ent-assistants-iterate

Objectif : Donner un retour ciblé et comparer des versions sur des cas communs.

Sources de la mission : [1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), [2](https://developers.openai.com/api/docs/guides/prompt-engineering).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-assistants-iterate-card-1 | Conservée | Un retour utile nomme défaut, changement voulu et éléments à conserver ; la réponse aide à demander une correction sans tout réécrire. |
| ent-assistants-iterate-card-2 | Conservée | Changer un point avec mêmes cas facilite l’attribution du résultat ; la carte conserve la stabilité de comparaison. |
| ent-assistants-iterate-card-3 | Conservée | Un exemple réutilisable montre forme/ton/détail sans imposer son contenu ; la réponse évite de recopier une remise inexistante. |

Consigne ent-assistants-iterate — **Clarifiée** : Trois sorties numérotées : comparaison, modification unique avec attendus, modèle révisé ; champs du modèle et réponses de l’essai restent explicitement séparés.

### ent-assistants-team-playbook

Objectif : Documenter un usage réutilisable, l’essayer à deux et organiser son évolution.

Sources de la mission : [1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), [2](https://developers.openai.com/api/docs/guides/prompt-engineering).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-assistants-team-playbook-card-1 | Conservée | La fiche partagée décrit tâche, entrées, étapes et contrôles ; un collègue peut reprendre la méthode sans son auteur. |
| ent-assistants-team-playbook-card-2 | Conservée | Un essai sur nouveau cas sans indications révèle les incompréhensions ; la carte teste la transmission, pas la mémorisation d’une fiche. |
| ent-assistants-team-playbook-card-3 | Conservée | Une personne désignée assure les mises à jour ; la réponse relie entretien des règles/documents/outils à une méthode encore utilisable. |

Consigne ent-assistants-team-playbook — **Conservée** : Fiche en six rubriques, essai collègue et gain avec limites ; amorce six rubriques, cas complet et temps avant/après évitent un livrable extérieur implicite.

### ent-automation-map

Objectif : Transformer une tâche répétitive en un processus lisible, avec entrée, étapes, décision et résultat.

Sources de la mission : [1](https://learn.microsoft.com/en-us/power-automate/triggers-introduction).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-automation-map-card-1 | Conservée | Le processus relie entrée, étapes, décisions et résultat ; la définition ne confond pas schéma de travail et logiciel choisi. |
| ent-automation-map-card-2 | Conservée | Un déclencheur lance le processus, une action réalise une étape ; formulaire et création de fiche donnent un exemple immédiatement compréhensible. |
| ent-automation-map-card-3 | Conservée | Automatiser la saisie ne transfère pas l’autorité de décision ; prix et acceptation restent soumis aux droits prévus. |

Consigne ent-automation-map — **Conservée** : Cinq à sept lignes entrée/sortie/responsable et branche incomplète ; la consigne accepte un trajet écrit, sans logiciel de dessin ni flux réel.

### ent-automation-select

Objectif : Comparer règle simple, aide IA et décision humaine pour sélectionner un premier flux.

Sources de la mission : [1](https://learn.microsoft.com/en-us/power-automate/triggers-introduction), [2](https://learn.microsoft.com/en-us/power-automate/create-team-flows).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-automation-select-card-1 | Conservée | Une règle claire sur des données fiables peut suffire ; la carte distingue le seuil déterministe de l’aide rédactionnelle IA. |
| ent-automation-select-card-2 | Conservée | Un connecteur transmet ou agit entre outils selon ses possibilités et droits ; la réponse n’en promet pas la disponibilité automatique. |
| ent-automation-select-card-3 | Conservée | Un flux a événement initial, étapes et résultat ; les décisions humaines éventuelles restent dans la définition. |

Consigne ent-automation-select — **Conservée** : Décrire petit flux, règle, rôle éventuel IA et confirmations ; le seuil inclusif, table des responsables et liaison non confirmée sont disponibles.

### ent-automation-data-contract

Objectif : Écrire un contrat de données simple entre formulaire et liste.

Sources de la mission : [1](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.removeduplicates).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-automation-data-contract-card-1 | Conservée | Le contrat précise champs, formats, destinations et valeurs absentes ; la réponse n’exige pas de connaissance d’un schéma technique. |
| ent-automation-data-contract-card-2 | Conservée | Un identifiant distingue une demande des autres malgré un même client ; cette propriété prépare la prévention des doublons. |
| ent-automation-data-contract-card-3 | Conservée | La source de référence indique où la valeur à jour fait foi ; la carte explique pourquoi une copie ancienne ne doit pas écraser le statut. |

Consigne ent-automation-data-contract — **Conservée** : Cinq correspondances plus données absentes/rejeu/source d’état ; noms des champs et variantes sont fournis, pas d’implémentation technique à inventer.

### ent-automation-exceptions

Objectif : Définir états et reprises pour qu’une panne partielle ne répète pas le travail.

Sources de la mission : [1](https://learn.microsoft.com/en-us/power-automate/guidance/coding-guidelines/error-handling), [2](https://docs.n8n.io/build/flow-logic/handle-errors-gracefully.md), [3](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.removeduplicates).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-automation-exceptions-card-1 | Conservée | La reprise tient compte des effets déjà produits ; la réponse évite de recréer une fiche après l’échec d’une autre étape. |
| ent-automation-exceptions-card-2 | Conservée | L’idempotence maintient un seul résultat malgré le retraitement ; l’exemple fiche/deux envois traduit le terme sans code. |
| ent-automation-exceptions-card-3 | Conservée | Une donnée absente appelle une précision, une panne transitoire des essais bornés ; la réponse évite la même reprise pour toutes les erreurs. |

Consigne ent-automation-exceptions — **Conservée** : Tableau des deux demandes avec suite/responsable/trace et protection à confirmer ; nombre de tentatives et état initial fournis, aucun outil réel à configurer.

### ent-automation-pilot

Objectif : Construire un essai représentatif et mesurer le gain net avec les reprises.

Sources de la mission : [1](https://learn.microsoft.com/en-us/power-automate/guidance/coding-guidelines/error-handling), [2](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.removeduplicates).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-automation-pilot-card-1 | Conservée | Le pilote limite équipe et tâches pour mesurer puis décider ; la carte ne confond pas essai et déploiement complet. |
| ent-automation-pilot-card-2 | Conservée | Un message terminé ne prouve pas le bon effet ; la vérification porte sur la fiche correcte, unique et renseignée. |
| ent-automation-pilot-card-3 | Corrigée | Gain net signé = temps manuel moins temps total automatisé pour même lot ; correction de la soustraction circulaire au « temps économisé », contrôle/corrections/suivi explicités. |

Consigne ent-automation-pilot — **Conservée** : Plan d’essai, deux cas supplémentaires, gain et lots de compensation ; toutes durées sont fournies et les coûts absents doivent limiter la conclusion.

### ent-automation-handover

Objectif : Préparer une fiche et une reprise par un collègue sans dépendre du créateur.

Sources de la mission : [1](https://learn.microsoft.com/en-us/power-automate/create-team-flows), [2](https://docs.n8n.io/build/flow-logic/handle-errors-gracefully.md).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-automation-handover-card-1 | Conservée | La fiche permet compréhension, arrêt, reprise et contact ; cette portée évite de réduire la transmission à partager le flux. |
| ent-automation-handover-card-2 | Conservée | Un remplaçant teste la procédure sans l’auteur ; la réponse rend vérifiable une transmission annoncée. |
| ent-automation-handover-card-3 | Conservée | Renommer une colonne peut casser une liaison ; l’exemple concret justifie le retest après changement de structure. |

Consigne ent-automation-handover — **Conservée** : Fiche et exercice de reprise avec rôles/accès/copies/arrêt/revue ; l’état INT-88 est rappelé et les connexions à confirmer ne deviennent pas des accès acquis.

### ent-projects-outcome

Objectif : Produire une fiche de cadrage reliant un besoin, un public et une première version.

Sources de la mission : [1](https://www.gov.uk/service-manual/agile-delivery/how-the-discovery-phase-works).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-projects-outcome-card-1 | Conservée | Le cadrage relie public, problème, résultat et limites ; la réponse reste centrée sur le besoin avant le site IA. |
| ent-projects-outcome-card-2 | Conservée | Une première version répond déjà à un besoin limité ; la carte évite de confondre utilité et exhaustivité fonctionnelle. |
| ent-projects-outcome-card-3 | Conservée | Un bénéfice prévu reste une hypothèse avant mesure ; aucun appel évité ni gain économique n’est garanti. |

Consigne ent-projects-outcome — **Conservée** : Fiche de première version et prompt pour deux options ; appels observés et priorité sont fournis, aucun résultat d’essai n’est inventé.

### ent-projects-specification

Objectif : Rédiger un brief de réalisation avec critères observables et questions ouvertes.

Sources de la mission : [1](https://www.gov.uk/service-manual/agile-delivery/writing-user-stories).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-projects-specification-card-1 | Conservée | Le critère d’acceptation est observable et relié au besoin ; l’exemple informations affichées peut se vérifier sur une page. |
| ent-projects-specification-card-2 | Conservée | Découper permet réaliser, vérifier puis ajuster ; la réponse donne la raison pratique plutôt qu’un nom de méthode projet. |
| ent-projects-specification-card-3 | Conservée | Une information manquante doit avoir une personne et un effet sur le blocage ; la carte distingue question ouverte et date devinée. |

Consigne ent-projects-specification — **Conservée** : Besoin, trois critères, exclusions et question avant dates ; l’année manquante est explicite, les deux ateliers et leurs heures sont disponibles.

### ent-projects-prototype

Objectif : Comparer des solutions et organiser un essai avant développement.

Sources de la mission : [1](https://www.gov.uk/service-manual/agile-delivery/how-the-alpha-phase-works).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-projects-prototype-card-1 | Corrigée | Un prototype est une version d’essai, dont la maquette est un exemple ; correction du raccourci qui imposait systématiquement une première maquette. |
| ent-projects-prototype-card-2 | Conservée | Coût dans la durée et capacité d’entretien complètent les fonctions ; la réponse soutient un choix compatible avec l’équipe. |
| ent-projects-prototype-card-3 | Conservée | Une démonstration ne prouve pas l’ouverture au public ; parcours réels, erreurs et organisation demandent encore une vérification. |

Consigne ent-projects-prototype — **Conservée** : Comparer trois approches puis écrire deux tâches d’observation ; besoin sans comptes/paiement et entretien disponible sont fournis, prix non inventés.

### ent-projects-iteration

Objectif : Formuler une modification limitée et organiser sa vérification.

Sources de la mission : [1](https://docs.github.com/en/copilot/responsible-use/inline-suggestions), [2](https://docs.github.com/en/pull-requests/reference/pull-request-reviews).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-projects-iteration-card-1 | Conservée | La demande de modification précise changer/conserver/attendre puis contrôler ; la carte favorise une évolution bornée du site. |
| ent-projects-iteration-card-2 | Conservée | Une version de référence sert comparaison et retour connu ; la réponse ne promet pas une restauration sans organisation. |
| ent-projects-iteration-card-3 | Conservée | Le code généré reste soumis à revue et contrôles ; la carte maintient une responsabilité humaine avant acceptation. |

Consigne ent-projects-iteration — **Conservée** : Premier prompt puis fiche de recette ; zones et boutons peuvent être séparés, tarifs et zones à préserver sont donnés dans le cas.

### ent-projects-release

Objectif : Préparer un lancement avec tests, responsabilités et repli.

Sources de la mission : [1](https://www.w3.org/WAI/test-evaluate/easy-checks/), [2](https://www.gov.uk/service-manual/agile-delivery/how-the-live-phase-works).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-projects-release-card-1 | Conservée | La recette compare parcours/résultats aux demandes avant ouverture ; la réponse donne un sens professionnel au mot sans recette automatique. |
| ent-projects-release-card-2 | Conservée | Le repli prévoit continuité ou version connue et responsable ; l’organisation fait partie du lancement. |
| ent-projects-release-card-3 | Conservée | Un test clavier ne prouve pas une accessibilité complète ; la réponse ne transforme pas un contrôle utile en certification. |

Consigne ent-projects-release — **Conservée** : Plan de lancement et secours, avec A/B puis répétition de A ; les identités fictives et total de deux inscriptions sont clarifiés, mécanisme réel laissé au responsable technique.

### ent-projects-maintenance

Objectif : Écrire une fiche de reprise et choisir une amélioration utile.

Sources de la mission : [1](https://www.gov.uk/service-manual/agile-delivery/how-the-live-phase-works), [2](https://docs.github.com/en/repositories/archiving-a-github-repository/backing-up-a-repository).

| ID | Verdict | Critère essentiel et motif de l’inspection |
| --- | --- | --- |
| ent-projects-maintenance-card-1 | Conservée | La maintenance corrige, actualise et maintient l’usage après lancement ; la réponse dépasse la seule première mise en ligne. |
| ent-projects-maintenance-card-2 | Conservée | Fichiers et données peuvent être stockés séparément ; la carte prévient la fausse garantie d’une sauvegarde de code. |
| ent-projects-maintenance-card-3 | Conservée | L’amélioration part d’un problème observé et de son utilité relative à l’effort ; la carte aide une priorité plutôt qu’une accumulation de fonctions. |

Consigne ent-projects-maintenance — **Conservée** : D’abord reprise Lanterne et arbitrage deux heures, puis dossier Cyprès en six rubriques ; le rappel fournit tout Cyprès et les inconnues doivent être attribuées, sans document extérieur.

## Bilan et inspection indépendante

- 120 cartes inspectées : cinq réponses corrigées, 115 cartes conservées. Aucun changement des questions de cartes, de leurs IDs ou des compétences.
- 40 consignes inspectées : quatre tâches clarifiées, 36 conservées. Le scénario de calcul Aster est également clarifié pour lever le sens ambigu de « auquel s’ajoute » ; mêmes chiffres, mêmes signes attendus.
- Scénarios autres qu’Aster, amorces, checklists, exemples et explications inchangés. Questions déterministes, bonnes options, clés privées, version du catalogue, prérequis et sources inchangés.
- Inspection indépendante par le rôle PM pédagogique : mêmes défauts injection, preuve et calcul identifiés ; découpage des livrables accepté. Sa dernière demande, formule de gain net avec signe explicite, a été intégrée. Le double cas Lanterne/Cyprès reste conservé après échange : ordre et rappel complets déjà présents.
- Les empreintes de quatre activités changent avec leurs textes publics : reconditionner le catalogue Functions et exécuter les contrats client/serveur avant publication.
- Relecture indépendante : [QA pédagogique](ENTERPRISE_CARDS_QA_20261022.md), verdict accepté sur les cinq cartes et quatre activités ; [QA technique](ENTERPRISE_GUIDANCE_TECHNICAL_QA_20261022.md), comparaison structurelle, copies Functions et suites de tests.
- Cette inspection ne constitue pas un test de compréhension avec des salariés ni une certification de maîtrise.
