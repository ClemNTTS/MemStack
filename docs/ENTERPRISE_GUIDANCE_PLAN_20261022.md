# Plan d’amélioration du guidage Entreprise

Date : 22 octobre 2026. Base : `main`, commit `0dd478f` ; `git pull --ff-only origin main` confirme que la branche est à jour.

## Périmètre et niveau de preuve

Plan issu du retour d’un testeur développeur, de la lecture du code et d’une confrontation entre trois agents : product manager SaaS pédagogique, business manager IT, spécialiste marketing et vente SaaS. Les agents ont échangé directement leurs objections avant convergence. Il ne s’agit pas d’un nouvel audit visuel ni d’une recette en production. Un seul témoignage ne permet pas d’estimer la fréquence des difficultés chez tous les collaborateurs.

Objectif : à chaque arrivée, rendre évidents le travail en cours, la prochaine action, son utilité et le résultat attendu. Préserver les cas immersifs et le choix de l’apprenant.

## Diagnostic confirmé dans le dépôt

| Retour | Observation dans le code | Conséquence pour le plan |
| --- | --- | --- |
| Retour au choix de parcours | `EnterpriseWorkspace.tsx:43` résout le parcours depuis l’URL avec un défaut ; `:170` transmet au chemin uniquement un `track` explicite valide. Aucune préférence de parcours Entreprise dans le contrat du workspace. | Persister le choix par compte et organisation ; traiter aussi l’incohérence entre parcours implicite et sélection affichée. |
| Définitions banales | `enterpriseGlossary.json` définit notamment brouillon, destinataires, messages envoyés et messagerie. `lessonGlossary.ts` combine glossaire commun et glossaire de mission. | Trier par utilité pour comprendre l’IA et la décision métier, en conservant les notions importantes non exclusivement IA. |
| Accueil chargé | `EnterpriseLearningPath.tsx` juxtapose introduction, niveau, parcours, prochaine action, classement, chemin, ressources et badges. `EnterpriseWorkspace.tsx:154` ajoute équipe et abonnement pour les responsables. | Hiérarchiser l’accueil et distinguer apprendre / gérer ; vérifier le résultat dans le navigateur avant de conclure sur les dimensions. |
| Cartes confuses | Le dernier commit a déjà retravaillé leur autonomie. `CardSession.tsx` explique le rappel et la révélation, mais repose aussi sur Mémo, des symboles et des gestes. | Relecture pédagogique carte par carte et initiation visible ; ne pas présumer que toutes les cartes sont défectueuses. |
| Activités difficiles à comprendre | `ReturnPolicyPractice.tsx` demande trois diagnostics puis un texte, renvoie au document « plus haut » et présente comparaison et retour IA. `GuidedEnterprisePractice.tsx:41-45` masque `practice.task` dans le cas à deux champs `ent-answer-or-action`. | Réordonner la première activité du socle et corriger séparément la consigne masquée de l’autre atelier. |
| Reprise imprécise | Les brouillons vivent dans un état React du workspace ; l’index de mission est initialisé à zéro dans `EnterpriseLessonView.tsx:25`. | Ne pas promettre une reprise à la phrase près avec la seule sauvegarde du parcours. |

Les comptes rendus du 17 octobre sont historiques. Le code actuel propose déjà un envoi explicite de la réponse et du cas à Mistral dans `EnterprisePracticeFeedback.tsx`. La refonte doit décrire ce fonctionnement réel.

## Arbitrages issus des trois agents

- **PM pédagogique :** partir de l’action réelle et du raisonnement attendu ; une carte doit entraîner un rappel utile, une activité doit annoncer son livrable et ses critères.
- **Business IT :** restaurer le contexte sans mélange de comptes ou d’organisations ; distinguer préférence, progression validée et brouillon ; limiter le premier lot à des changements maîtrisables.
- **Marketing SaaS :** rendre la valeur visible dès la première session ; préférer une production et une explication concrètes aux slogans, aux XP ou à un tutoriel long.
- **Tutoriel :** une carte de démonstration supplémentaire a été écartée au profit de la première vraie carte accompagnée. L’aide reste réouvrable.
- **Accueil :** une action principale recommandée, avec une alternative accessible ; aucune obligation de terminer les cartes avant de reprendre les missions.
- **Glossaire :** retirer les mots courants soulignés automatiquement, sans supprimer des notions transversales utiles comme les droits, les données personnelles ou la vérification.
- **Reprise :** sauvegarder d’abord le parcours ; traiter la reprise exacte au sein d’une mission dans un lot distinct. Employer « Continuer mon parcours » tant que cette reprise exacte n’existe pas.
- **Retour IA :** conserver la capacité existante et son recours explicite, mais clarifier sa nature et laisser l’exemple accessible en cas d’indisponibilité.

## 1. Retrouver son parcours — P0

**Expérience cible.** Une première visite demande un choix. Les visites suivantes ouvrent le parcours déjà choisi avec sa progression et sa prochaine action. « Changer de parcours » reste secondaire, replié. Aucun choix automatique du premier parcours si aucune préférence n’existe.

**Contrat proposé.** Préférence cloud `activeTrackId` sous le périmètre apprenant de l’organisation, par exemple un document `settings/learning`. Chemin final à valider avec les règles existantes. Utiliser les adaptateurs et services Firebase existants ; aucun nouveau service.

Passer par les Functions existantes : les règles actuelles ferment les accès clients directs au sous-arbre des organisations. Valider côté serveur le parcours et l’adhésion active. Inclure la nouvelle préférence dans l’export et la suppression du compte.

Ordre de résolution : parcours valide d’un lien explicite > préférence cloud valide > choix initial. Un lien explicite permet de visiter un autre parcours ; il ne modifie le parcours habituel que par une action de choix explicite. Les liens internes portent le contexte résolu. Un identifiant invalide est ignoré pour restaurer une préférence valide ; si la préférence est aussi absente ou retirée, proposer un choix compréhensible sans effacer les acquis. À la bascule d’organisation, relire sa préférence propre et ne pas transporter automatiquement le parcours de l’organisation quittée.

Attendre la lecture cloud avant d’afficher un choix initial pour éviter un clignotement trompeur. Une écriture ne doit être annoncée comme sauvegardée qu’après accusé serveur ; en cas d’échec, permettre de réessayer sans annoncer une persistance acquise.

**Recette.** Retour le lendemain par `/enterprise` ; rechargement ; second appareil ; lien profond ; absence de préférence ; identifiant invalide ; deux organisations avec deux parcours différents ; deux comptes ; changement pendant une requête ; échec et rejeu de sauvegarde. Aucun cache de préférence n’ouvre l’apprentissage hors ligne.

## 2. Un accueil qui indique quoi faire — P0/P1

Remplacer l’introduction commerciale répétée par un accueil opérationnel : nom de l’organisation, parcours choisi, progression et carte de prochaine action. Rendre le titre et le bouton principal visibles sur les formats de référence mobile 390 × 844 et bureau 1366 × 768, hors clavier et agrandissement ; à fort zoom, préserver surtout l’ordre et la lisibilité.

Proposition de contenu : « Ton parcours : Assistants métier », « 2 missions sur 8 terminées », puis une action décrite par son résultat : « Préparer un prompt à partir d’un document ». Les durées sont indicatives et doivent être mesurées, pas promises arbitrairement.

Ordre initial de recommandation à tester : cartes encore inédites de missions terminées, puis lot de cartes dues, puis prochaine mission. Après implémentation d’une reprise intra-mission fiable, une mission effectivement sauvegardée pourra être proposée en premier. Expliquer la raison : « Ces cartes reprennent les idées de ta dernière mission. » Ne jamais avancer de cartes futures ; les lots de révision restent limités à cinq cartes dues.

Navigation apprenant : **Mon parcours**, **Mes cartes**, **Mises en situation**. Classement et badges passent au second plan ; ressources complémentaires dans une bibliothèque repliée ou un accès secondaire. Pour les responsables, regrouper **Équipe** et **Abonnement** dans un espace de gestion identifiable, en conservant leurs contrôles d’accès. Garder l’organisation active visible.

**Recette.** Un nouveau testeur désigne la prochaine action et explique sa fonction en moins de dix secondes. Il retrouve le changement de parcours et les révisions sans assistance. Contrôler clavier, focus, navigation mobile et absence de débordement horizontal. Le défilement reste acceptable pour explorer le programme, pas nécessaire pour découvrir l’action principale.

## 3. Un glossaire centré sur les notions utiles — P1

Classer chaque entrée : notion IA essentielle ; notion métier ou de sécurité nécessaire ; vocabulaire courant. Supprimer du soulignement automatique « messagerie », « destinataires », « brouillon », « messages envoyés » et les entrées analogues sauf justification pédagogique documentée. Si un public a besoin d’aide numérique générale, prévoir une aide facultative séparée plutôt que multiplier les interruptions pour tous.

Garder notamment assistant IA, prompt, contexte fourni, hallucination, outils connectés et permissions ; introduire RAG, tokens ou agents seulement là où ils servent l’objectif de la mission. Une définition : phrase simple, exemple du travail, limite utile. Définir l’IA dans le cours avant de compter sur une infobulle.

Limiter les répétitions à l’échelle de l’étape : le dédoublonnage actuel par fragment ne suffit pas forcément pour toute la page. Tester ouverture au clic, clavier et toucher, fermeture et restitution du focus. Ne pas cacher une consigne ou un prérequis indispensable derrière une définition.

**Livrable.** Inventaire des entrées avec décision conserver / contextualiser / retirer et motif ; relecture du glossaire commun et des surcharges Entreprise pour éviter les réapparitions.

## 4. Des cartes compréhensibles et utiles — P0 ciblé, P1 complet

Inspecter d’abord les cartes des deux fondations, puis les six missions d’un parcours pilote, puis les trois parcours et ressources historiques. Le catalogue actuel annonce 120 cartes : inventorier toutes les cartes plutôt qu’extrapoler à partir de quelques cas.

Pour chaque carte, vérifier : objectif identifiable ; notion enseignée dans la mission ; contexte suffisant hors de la leçon ; une seule question principale ; réponse essentielle courte ; absence de prénom ou de détail fictif à mémoriser inutilement ; possibilité de distinguer un rappel correct d’un rappel insuffisant ; utilité pour une décision au travail.

Exemple de forme à rechercher : « Un assistant sans accès à ta messagerie affirme avoir envoyé un mail. Que dois-tu vérifier ? » → « Vérifie l’envoi dans la messagerie ; sa déclaration seule ne prouve pas qu’une action a eu lieu. » Illustration de rédaction proposée, pas diagnostic d’une carte actuellement présente.

Équilibrer définitions fondamentales, choix d’action et distinction de deux concepts. Toutes les cartes ne doivent pas devenir de longs scénarios. Une carte est remise en rédaction si le testeur ne peut pas reformuler la question ou expliquer pourquoi sa réponse convient.

Conserver les identifiants lors des corrections de formulation. Si l’objectif testé change réellement, décider explicitement de la version et de l’effet sur l’historique : ne pas remplacer silencieusement une compétence sous un ancien identifiant. Conserver les sources et consigner la revue pédagogique.

**Livrable.** Registre par ID : problème, compétence visée, proposition, justification, source, verdict du relecteur. Définition de terminé : toutes les cartes inspectées, aucune ambiguïté majeure ouverte, échantillon testé hors contexte de la leçon.

## 5. Comprendre la première carte — P0

Accompagner la première vraie carte avec trois étapes visibles :

1. « Lis la question et essaie de répondre de tête. Tu n’as rien à écrire. »
2. Bouton explicite « Voir la réponse ».
3. « Avais-tu retrouvé l’idée essentielle avant de la voir ? » avec boutons **Pas encore** et **Oui**.

Ajouter une phrase : « Ce choix sert à programmer ta prochaine révision. Si tu avais oublié l’idée essentielle, choisis “Pas encore”. » Les gestes et Mémo restent facultatifs. Conserver les valeurs métier `forgotten` / `recalled` et les échéances existantes.

L’aide se réduit après usage et reste accessible par « Comment fonctionnent les cartes ? ». Si un état d’initiation est persisté, le séparer des résultats pédagogiques et le rattacher à une version du mode d’emploi ; ne pas recopier de progression entre espaces. Ne créer ni rappel ni XP supplémentaire pour la démonstration.

**Recette.** Un utilisateur n’ayant jamais utilisé Anki révèle puis évalue une carte sans aide orale ; il explique ce que signifie chaque bouton. Une erreur réseau garde la carte en place sans faux succès. Tester au clavier et sur mobile. Vérifier aussi l’espace Développement, car `CardSession` est partagé.

## 6. Des consignes explicites dans une situation immersive — P0/P1

Conserver le contexte narratif, puis annoncer un contrat d’activité très court : **Ton rôle**, **Ce que tu dois produire**, **Comment t’y prendre**, **Ce qu’on cherche à vérifier**. La narration motive ; les consignes indiquent l’action.

Pour la première activité du socle :

1. Lire la politique de retour, consultable au contact de l’exercice.
2. Pour chacune des trois affirmations, choisir confirmé / contredit / non vérifiable.
3. Rédiger deux phrases au client qui respectent le délai et la condition de prise en charge.
4. Comparer les diagnostics, puis consulter un exemple ou demander un retour IA sur la rédaction.

Montrer les critères de raisonnement avant l’effort, sans dévoiler les diagnostics corrects. Éviter d’obliger à remonter la conversation pour retrouver la seule pièce utile. Séparer clairement la correction déterministe des diagnostics, l’exemple commenté et le retour généré par IA.

Pour `ent-answer-or-action`, afficher `practice.task` avant les deux champs ; indiquer « Une phrase par champ ». Utiliser une amorce courte plutôt qu’une réponse préremplie. Revoir les autres variantes d’atelier et le laboratoire d’automatisation pour qu’aucune ne masque sa consigne.

Remplacer, pour le bouton qui appelle Mistral, « Vérifier ma réponse » par **Obtenir un retour IA**. Conserver l’information d’envoi avant le clic, les seules données fictives et l’exemple accessible si le fournisseur ou son quota est indisponible. Un retour IA ne doit pas être présenté comme une correction certaine ni devenir une condition de complétion.

**Recette.** Sans commencer, le testeur peut dire ce qu’il doit produire, où il le saisit et comment il pourra comparer. Après retour, il explique une correction avec ses mots. Tester indisponibilité IA, variante à deux champs et accès au document sur mobile. Qualifier le retour IA sur des formulations correctes variées, des réponses partielles, erronées ou hors sujet : le retour doit proposer une amélioration utile sans contredire les pièces.

## 7. Un guidage cohérent du début à la fin — P1/P2

Début de parcours : annoncer en deux phrases les missions, les cartes et la mise en situation finale. Début de mission : objectif concret et livrable. Fin de mission : acquis travaillé, sauvegarde confirmée, proposition de cartes avec retour possible au parcours. Fin de lot : expliquer quand revenir et permettre de s’arrêter. Fin de parcours : proposer situation finale, entretien des acquis et application facultative dans un outil autorisé.

Mémo explique une action ou une raison, sans ajouter une bulle décorative à chaque écran. Préférer les intitulés métier explicites aux seules métaphores de connexion ou de chemin. Un centre d’aide reste un recours ; les actions essentielles doivent se comprendre sur place.

La reprise au sein d’une mission est un lot distinct : sauvegarder position et état nécessaires dans le bon périmètre, gérer version du contenu et conflits, définir la conservation des brouillons et les erreurs. Ne pas confondre ce travail avec la mémorisation du parcours. Aucun enregistrement supplémentaire des productions écrites sans contrat clair de confidentialité, export et suppression.

## Livraison proposée

Estimations indicatives pour un développeur, avec relecture pédagogique et testeurs disponibles ; elles ne valent pas engagement de calendrier.

| Lot | Contenu | Charge indicative | Dépendance / sortie |
| --- | --- | --- | --- |
| A — qualification | Observer 5 à 8 personnes, dont des non-techniciens, sur entrée, première activité, première carte et retour ultérieur ; lister IDs et écrans problématiques. | 1–2 jours | Référence avant modification ; pas besoin d’attendre pour corriger la consigne masquée. |
| B — P0 | Préférence cloud par organisation, consignes des premières activités, initiation aux cartes, accès immédiat à la prochaine action. | 4–6 jours | Contrat serveur, règles et tests d’isolation ; première recette complète. |
| C — P1 UX | Navigation allégée, glossaire trié, transitions et langage du retour IA. | 3–5 jours | Vérification mobile, clavier et rôles apprenant/responsable. |
| D — P1 contenu | Audit complet des 120 cartes et des consignes ; réécriture par lots ; inspection et validation. | 5–10 jours | Charge à ajuster après inventaire ; priorité aux fondations et au parcours pilote. |
| E — P2 | Reprise intra-mission, consolidation après nouvelle observation et ajustements. | 3–6 jours | Contrat de brouillon, versionnement et confidentialité avant développement. |

Ordre recommandé : A et premières corrections de B, puis B, C et D par lots, nouvelle observation, enfin E si le besoin est confirmé. Ne pas attendre la réécriture intégrale du catalogue pour livrer les blocages d’entrée. Réserver une marge pour les résultats des tests.

## Validation de la valeur et critères de décision

Sur le petit panel, objectifs de recette proposés : 100 % des scénarios de restauration/isolation passent ; au moins 4 personnes sur 5 identifient seules l’action suivante, comprennent la première carte et reformulent la consigne d’activité. Mesurer le temps et l’assistance nécessaire. Ce sont des seuils de décision internes, pas une preuve statistique.

Tester explicitement un retour le lendemain. Contrôler aussi un rappel différé et une situation nouvelle : une hausse de complétion ne prouve pas une meilleure rétention. Inclure collaborateurs débutants, utilisateurs plus autonomes et responsables ; l’avis d’un développeur reste utile mais ne couvre pas tous ces publics.

Après livraison, suivre si les données disponibles le permettent : entrée → première action → mission confirmée → première carte évaluée → retour ultérieur, demandes d’aide et abandons par étape. Établir la référence avant de fixer un objectif chiffré de rétention. Ne collecter ni texte libre ni réponses dans la télémétrie d’usage. Une éventuelle nouvelle instrumentation doit être spécifiée séparément ; pas d’ajout automatique d’un service analytics.

Pour la vente B2B, démontrer un collaborateur autonome réalisant une production et justifiant ses choix. Le responsable conserve des synthèses d’activité, sans accès supplémentaire aux réponses. Ne pas transformer XP, badges, complétions ou retour IA en preuve de maîtrise, de conformité ou de certification ; aucun changement de prix n’est nécessaire à ce plan.

## Vérifications techniques requises lors de l’implémentation

- `npm run build` pour tout changement de code ; `npm test` pour contenus, préférences et comportements partagés.
- `npm run functions:build` et `npm run functions:test` si le backend change ; émulateurs de règles et transactions applicables pour nouvelles préférences et contrôles d’accès, selon les commandes CI.
- Recette navigateur bureau/mobile et clavier ; tests de comptes, organisations, liens profonds, déconnexion, requêtes tardives, erreurs réseau et accusés serveur.
- Préserver IDs, échéances et historique ; aucune modification des quotas personnels, des clés de réponses privées ou de la séparation Entreprise/Développement.
- Mettre à jour contrat produit, architecture si le contrat de persistance évolue, et registre pédagogique. Déploiement Firebase soumis à l’autorisation explicite du propriétaire.

## Références

Sources internes : code cité ci-dessus, `docs/ENTERPRISE_PRODUCT.md`, `docs/PRODUCT.md`, `docs/ENTERPRISE_UI_UX_20261017.md`, `docs/content/WORKFLOW.md`.

Les propositions de consignes séquencées et de hiérarchie lisible concordent avec les recommandations cognitives du W3C : [instructions étape par étape](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p07-step-instructions/) et [structure compréhensible](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o2p03-page-structure/). Ces références ne constituent pas une qualification d’accessibilité du produit.
