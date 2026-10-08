# Vision produit proposée : MemStack abouti

Document de cadrage du **7 octobre 2026**, à discuter avant de transformer les propositions en spécifications. [PRODUCT.md](PRODUCT.md) décrit le produit actuel et le MVP ; [ARCHITECTURE.md](ARCHITECTURE.md) décrit ses contraintes techniques. Ce document propose une cible finie au-delà du MVP, sans annoncer ces fonctionnalités comme disponibles.

## Intention et public

MemStack devient un atelier personnel pour comprendre, retenir et mobiliser des connaissances de développement. Il s’adresse à une personne qui apprend le développement web, reprend des notions oubliées ou souhaite consolider son raisonnement professionnel.

La promesse : retrouver régulièrement une notion utile, puis s’en servir pour expliquer un comportement, enquêter sur un problème ou justifier une décision. Terminer un parcours, réussir une carte ou déclarer un défi compris ne constitue pas une certification de compétence.

Le catalogue actuel — 12 thèmes, 30 parcours et 150 leçons — forme le périmètre pédagogique de référence. La version aboutie n’a pas besoin de couvrir toute l’informatique ni de publier continuellement de nouveaux cours. Elle doit rendre ce socle cohérent, utilisable et maintenable.

## Ce qui existe et ce qui est proposé

| Capacité | État au moment du cadrage | Cible proposée |
| --- | --- | --- |
| Leçons et catalogue | Catalogue rédigé, relu et accessible ; rythme et difficulté à éprouver en usage | Améliorer les contenus à partir des difficultés observées, sans augmenter leur nombre par défaut |
| Cartes et révisions | Rappel Oui/Non, échéances espacées, lots renouvelables de cinq cartes dues | Conserver cette boucle simple et rendre les points à retravailler faciles à retrouver |
| Atelier personnel | Parcours actif, découverte, bibliothèque, relecture et objectif facultatif | Donner accès clairement à comprendre, retenir et appliquer, sans imposer une session complète |
| Compte et synchronisation | Google et réseau obligatoires, progression et préférences Firestore | Préserver ces règles et rendre les erreurs et reprises compréhensibles |
| Défis | Trois diagnostics Docker, réponse écrite, correction, historique et autoévaluation | Dossiers professionnels avec fichiers à lire, formulaire et retour personnalisé du LLM |
| Progression visible | Compteurs, badges et suggestions de relecture | Ajouter seulement des repères qui aident à choisir la prochaine activité |
| Qualité du contenu | Sources, inspection et signalements assistés avec revue humaine | Fermer le circuit de signalement et maintenir les cas et leurs corrections dans le temps |
| Veille, notifications, gamification avancée | Hors MVP | Options à décider séparément ; aucune n’est nécessaire pour atteindre la cible |

Les descriptions de l’existant s’appuient sur la documentation du dépôt, sans constituer une vérification du service en production.

## Une boucle à trois activités

1. **Comprendre** : une leçon explique une idée, la situe et corrige une confusion fréquente.
2. **Retenir** : une carte invite à retrouver l’idée avant de révéler la réponse ; la répétition espacée décide de sa prochaine échéance.
3. **Appliquer** : un défi demande de mobiliser plusieurs éléments dans une situation, puis de comparer son raisonnement à une correction.

La personne choisit l’activité adaptée à son besoin. Elle peut réviser sans découvrir, tenter un défi sans finir un parcours ou relire une leçon sans changer sa progression. L’accueil conseille une prochaine action et laisse les autres visibles. Aucune leçon ne démarre automatiquement et aucun quota ne bloque l’apprentissage.

Les trois activités gardent des états séparés. Une tentative de défi ne termine pas une leçon, ne crée pas de carte et ne déplace pas les échéances. Après une difficulté, le défi propose des liens vers les notions concernées ; la personne décide de les relire. Une suggestion de nouvelle tentative pourra être ajoutée plus tard, sans devenir une obligation quotidienne.

## Format retenu pour la cible : dossier, formulaire et retour du LLM

**La direction retenue est un scénario accompagné de fichiers à lire, un formulaire de raisonnement et un seul message de retour personnalisé du LLM.** Ce format sert au diagnostic, à une revue de code ou à une décision simple. Les trois dossiers Docker, les deux champs et le service de retour sont implémentés en option. Le service Firebase/Mistral est déployé pour une bêta limitée au propriétaire, après tests locaux et essais fournisseur.

Le formulaire recommandé garde deux champs obligatoires :

- **Ce que je constate** : les faits, les indices relevés dans les fichiers et ce qu’ils me font penser. La consigne invite à distinguer observation et hypothèse.
- **Ce que je ferais** : les actions proposées, leur raison et la manière de vérifier leur résultat.

Un troisième champ facultatif, **Ce qui me manque pour conclure**, permet de signaler une incertitude ou une information à demander. Il peut être ajouté après usage ; la première version peut rester à deux champs. Pour une décision d’architecture, adapter les labels au contexte sans multiplier les formats.

Le dossier présente les fichiers avec leur nom, leur rôle et un contenu lisible : par exemple `compose.yaml`, une configuration d’API et un extrait de logs. Ce sont des pièces pédagogiques versionnées fournies par l’application, sans téléversement de dépôt personnel ni exécution. Elles restent consultables pendant la rédaction.

Après enregistrement de la tentative, l’application demande son analyse. Le LLM reçoit le scénario, tous les fichiers utiles, la consigne, la correction de référence, les points indispensables et les champs remplis. Il rend un seul message développé : bilan de la réponse, points justes, erreurs ou omissions expliquées, et démarche à retenir. Il ne lance pas une conversation de questions successives. Un lien **Consulter la correction de référence**, construit par l’application, accompagne ce message.

Une première extension du catalogue doit éprouver ce format sur quelques cas contrastés : diagnostic Docker déjà disponible, revue de changement et incident HTTP ou backend. La taille de ce lot se décide selon la capacité réelle de rédaction et d’inspection. Étendre ensuite les thèmes où le format apporte une valeur claire ; ne pas imposer un défi par leçon pour remplir le catalogue.

## Formats de défis possibles

Ces exemples sont des briefs pédagogiques proposés, pas des contenus techniques inspectés ni prêts à publier.

| Format | Situation professionnelle proposée | Travail demandé | Valeur et limites |
| --- | --- | --- | --- |
| Diagnostic | Après un changement de configuration, une application fonctionne depuis l’hôte mais échoue depuis un autre conteneur | Séparer faits et hypothèses, expliquer l’adresse utilisée et proposer une vérification | Entraîne la lecture d’indices ; le scénario doit préciser réseau, ports et processus concernés |
| Revue de code ou de configuration | Une PR expose les détails d’un document après avoir seulement vérifié que l’utilisateur est connecté | Repérer la permission manquante, expliquer l’impact et proposer un cas de test | Entraîne une revue justifiée ; une solution différente peut être valable si elle respecte le contrat |
| Choix d’architecture | Une petite équipe veut découper son application en services alors que les besoins d’exploitation et les frontières métier restent incertains | Recommander une option, citer les contraintes et dire ce qui ferait changer la décision | Entraîne les compromis ; plusieurs réponses peuvent être défendables, sans réponse universelle |
| Investigation d’incident | Après une livraison, les erreurs augmentent ; des extraits de métriques et de logs donnent des indices incomplets | Choisir une première action, préciser son objectif et prévoir une observation utile | Entraîne priorisation et incertitude ; la correction distingue atténuation, vérification et recherche de cause |
| Prédiction de comportement | Un court extrait modifie un objet partagé entre deux fonctions | Prévoir l’effet, puis expliquer quelle référence est modifiée | Sert de pont entre carte et cas ; rester bref et éviter un puzzle syntaxique |
| Ordre ou association | Associer des symptômes à des observations discriminantes, ou ordonner des étapes lorsque leur dépendance est explicite | Construire une association ou une séquence et justifier le point essentiel | À ajouter seulement si la relation constitue l’objectif ; ne pas imposer un ordre unique à une enquête où plusieurs démarches conviennent |

Les réponses structurées et leur analyse constituent le format commun. Des sélections ou associations peuvent être rendues interactives ensuite, si elles diminuent l’effort de saisie sans appauvrir le raisonnement. Elles doivent toujours être utilisables au clavier et sans glisser-déposer obligatoire.

## Anatomie d’un cas utile

Un défi contient :

- Un objectif observable : expliquer une cause, repérer un risque, choisir une vérification ou défendre une décision.
- Un contexte borné : rôle, comportement attendu, contraintes, versions si pertinentes et faits réellement disponibles.
- Des pièces à lire : extrait de code, configuration, log, requête ou schéma ; uniquement les éléments utiles.
- Une consigne explicite : ce qu’il faut produire, ce qui peut rester incertain et les hypothèses autorisées.
- Des leçons liées et des prérequis informatifs, sans verrou d’accès.
- Une correction, des repères de comparaison, des erreurs fréquentes et des sources primaires inspectées.

Un défi n’invente pas une certitude absente des indices. Lorsque plusieurs causes sont possibles, la bonne démarche peut être de proposer une observation qui les distingue. Les estimations de durée sont des indications à ajuster après usage, pas une limite chronométrée.

## Correction et autoévaluation

La correction explique une démarche défendable : faits utiles, interprétation, action proposée, preuve attendue et limites. Elle distingue les points indispensables des approfondissements. Pour un choix d’architecture, elle expose les compromis et les conditions qui rendraient une autre solution préférable.

La grille de comparaison reste qualitative :

| Repère | Question à se poser |
| --- | --- |
| Lecture des faits | Ai-je utilisé les indices fournis et distingué mes hypothèses ? |
| Explication | Ai-je relié le comportement au mécanisme concerné ? |
| Action | Ma proposition répond-elle au problème sans ignorer les contraintes ? |
| Vérification | Ai-je indiqué comment vérifier l’hypothèse ou le résultat ? |

Chaque cas sélectionne les repères pertinents et les formule concrètement. Le LLM évalue la réponse par rapport à ces repères : il peut annoncer qu’elle est correcte, partiellement correcte ou qu’elle comporte une erreur, en justifiant ce bilan. Il distingue un point faux d’un point non expliqué et accepte une autre solution lorsqu’elle respecte les contraintes. Il n’invente pas de faits absents du dossier et exprime une incertitude si le cas ne permet pas de trancher. Aucun total de points ni comparaison de mots clés n’est nécessaire.

Le message s’adresse directement à la personne et s’appuie sur sa réponse, sans réciter seulement la correction. Exemple : « Tu as bien repéré que l’API est joignable depuis l’hôte. En revanche, le port publié ne permet pas de conclure que l’autre conteneur doit utiliser cette même adresse. Ta proposition doit préciser l’adresse utilisée depuis ce conteneur et comment tu vérifierais sa connexion. » Cet exemple décrit le ton attendu ; chaque cas devra fournir les faits qui justifient son analyse.

La correction éditoriale reste accessible pour comparer et contester le retour. Le message est annoncé comme une analyse générée par IA, qui peut se tromper, sans transformer l’interface en avertissement permanent. La personne peut conserver l’autoévaluation « À retravailler » ou « Compris » ; aucun bilan du modèle ne modifie les cartes ou ne certifie une compétence.

Une erreur du fournisseur ne doit pas faire perdre la tentative : afficher l’échec, permettre une reprise contrôlée et laisser consulter la correction de référence après sauvegarde serveur. Conserver le retour reçu avec la version du défi et de la grille utilisées pour le retrouver dans l’historique. Une nouvelle analyse éventuelle ne remplace pas silencieusement ce retour. Le traitement utilise le dossier correspondant à la version de la tentative, jamais une correction plus récente sans l’annoncer.

Avant livraison, vérifier le comportement sur des réponses correctes, incomplètes, erronées, alternatives valables et hors sujet. Vérifier également qu’une instruction écrite dans la réponse de l’élève ne détourne pas l’analyse. La qualité attendue porte sur la justesse des remarques, leur justification et leur utilité, plutôt que sur une note globale.

La correction apparaît après confirmation serveur de la tentative. La réponse, sa date serveur et sa version restent immuables ; la première autoévaluation enregistrée le reste également. Réessayer crée une nouvelle tentative. Consulter l’historique n’écrit rien et n’altère pas les cartes. La correction affichée correspond à la version de la tentative : les dossiers historiques v1 et les nouveaux dossiers v2 sont conservés. Continuer cette conservation lors des révisions substantielles des cas.

Les corrections étant livrées avec le frontend, elles restent consultables dans ses sources. Ce fonctionnement convient à un atelier personnel : l’enregistrement avant révélation sert la réflexion, sans objectif anti-triche.

## Périmètre de la version aboutie

La cible recommandée comprend les capacités suivantes :

1. **Un socle pédagogique maintenu** : catalogue actuel, sources inspectées, cartes autonomes et exemples clairs ; correction des ambiguïtés remontées en usage.
2. **Une routine libre et fiable** : découverte, consolidation, révision et relecture indépendantes, reprise compréhensible après erreur de synchronisation.
3. **Une bibliothèque de cas** : diagnostics, revues et décisions accessibles depuis les parcours et un espace Défis ; contexte, objectifs et liens vers les notions visibles.
4. **Un carnet personnel d’application** : formulaires, retours du LLM et autoévaluations retrouvables, filtre « À retravailler », nouvelle tentative explicite et accès à la correction de référence.
5. **Des repères utiles** : cartes dues, leçons à relire et défis à reprendre ; historique lisible avec période et définition explicites pour toute statistique ajoutée.
6. **Une boucle de qualité complète** : signalement, réception et suivi compréhensibles ; proposition assistée, inspection puis validation humaine avant publication.
7. **Une expérience utilisable sur les appareils visés** : mobile et bureau, clavier, labels accessibles, mouvements réduits, code lisible et erreurs de sauvegarde explicites.

Le filtre des défis, la comparaison visuelle, de nouveaux repères statistiques et le suivi des signalements sont des propositions, pas des fonctions annoncées comme existantes. Ajouter le signalement des défis demandera de définir leurs cibles versionnées et leur inspection : le worker actuel de corrections de catalogue ne doit pas être supposé compatible automatiquement.

## Ce qui reste optionnel

### Veille

Une veille n’entre dans la cible que si elle aide à réviser une connaissance devenue obsolète. Commencer, si nécessaire, par des notes de maintenance éditoriales : notion concernée, changement, source et date. Un flux d’actualités général détournerait de la boucle d’apprentissage et augmenterait la charge de maintenance.

Une collecte automatisée de sources et ses coûts constituent un projet séparé. Elle n’est pas nécessaire pour que MemStack soit abouti et ne doit pas publier de nouveaux contenus sans inspection.

### Notifications

Les envisager seulement si l’usage révèle un besoin de rappel. Elles seraient facultatives, réglables et sans culpabilisation, avec un contrôle de fréquence et de désactivation. Des notifications fiables lorsque l’application est fermée nécessitent une étude technique distincte ; aucun service n’est prévu par ce document.

### Statistiques et motivation

Préférer les informations permettant une action : nombre de cartes dues, rappels et oublis sur une période définie, cas autoévalués à retravailler. Présenter la taille de l’échantillon et distinguer introduction des cartes et révision. Un taux de rappel récent reste un résultat observé, sensible au choix des cartes, pas un score global de maîtrise.

Conserver Mémo et les badges de jalons. Ne pas ajouter par défaut points, classement, série quotidienne punitive ou récompense pour multiplier les clics. Une statistique ou une récompense doit aider l’utilisateur à revenir ou à décider ; sinon elle reste hors périmètre.

## Exclusions assumées

- Aucune exécution de code, sandbox ou terminal connecté nécessaire à la cible.
- Aucune conversation avec un tuteur nécessaire au déroulé : un envoi donne un message d’analyse, sans note certifiante.
- Aucun examen certifiant, classement compétitif ou résultat infalsifiable.
- Aucun réseau social, espace d’équipe, paiement ou outil de formation d’entreprise.
- Aucun éditeur de contenus dans l’application : Git et la revue éditoriale restent le circuit de production.
- Aucun accès invité ou apprentissage hors ligne ; Google et Internet restent obligatoires sur toutes les routes.
- Aucune course à l’élargissement du catalogue sans objectif distinct et capacité d’inspection.

## Séquence de réalisation recommandée

| Étape | Travail | Condition pour poursuivre |
| --- | --- | --- |
| Éprouver l’existant | Utiliser les leçons, cartes et trois cas Docker ; noter consignes floues, saisie pénible et corrections insuffisantes | La boucle complète fonctionne sur les appareils utilisés et les problèmes bloquants sont corrigés |
| Stabiliser le format de cas | Présenter les fichiers et le formulaire ; éprouver une revue et un diagnostic d’un autre thème | L’utilisateur sait quoi produire et les grilles reconnaissent les alternatives valables |
| Ajouter le retour personnalisé | Mettre en place l’appel serveur et vérifier les analyses sur un jeu de réponses relues | Un retour unique explique les points justes et les erreurs ; les échecs préservent la tentative et l’accès à la correction |
| Organiser l’application | Catalogue de défis, liens de parcours, historique et accès aux cas à retravailler | Retrouver un cas ou une tentative ne demande plus de parcourir manuellement toute la liste |
| Étendre les situations utiles | Couvrir les grandes compétences du socle par des cas distincts, inspectés et versionnés | Chaque ajout entraîne une décision nouvelle ; la maintenance reste compatible avec un projet personnel |
| Consolider la version aboutie | Vérifier synchronisation, accessibilité, qualité, signalements et repères personnels | Les critères de fin ci-dessous sont remplis et les limites restantes sont documentées |

Les dossiers restent du contenu statique et les tentatives des données personnelles Firestore. L’analyse personnalisée exige une exécution serveur pour protéger la clé du fournisseur et contrôler les appels ; son besoin est décrit dans [ARCHITECTURE.md](ARCHITECTURE.md). Firebase Functions à Paris et Mistral sont retenus pour la bêta. L’implémentation est désactivée par défaut, avec invitations et quotas serveur. Le propriétaire a autorisé Blaze et le déploiement après tests ; le plafond Mistral enregistré est de 10 € par mois pour le compte, signalements compris. Le modèle versionné retenu est Mistral Large 2512, avec le prompt v2 ; l’activation reste limitée au propriétaire ; voir [CHALLENGE_AI.md](CHALLENGE_AI.md). Tout nouveau schéma de tentative ou élargissement des IDs autorisés nécessite des règles, tests et une compatibilité avec l’historique.

## Quand considérer la version finale atteinte ?

« Finale » désigne une version fonctionnellement aboutie dont la maintenance continue, sans backlog obligatoire de nouvelles fonctions. Elle peut être déclarée atteinte lorsque :

- Les activités comprendre, retenir et appliquer sont accessibles indépendamment et s’enchaînent volontairement.
- Le catalogue de référence et les cas publiés ont leurs sources, conditions et inspection ; les durées et consignes ont été ajustées après usage.
- Les principales compétences retenues pour les défis disposent de situations distinctes : diagnostic, revue et décision. La couverture visée est définie dans un manifeste de cas avant la rédaction, sans obligation de couvrir chaque leçon.
- Une personne peut répondre, retrouver sa tentative, comprendre la correction et choisir quoi retravailler ; les anciennes réponses restent intactes après une mise à jour du contenu.
- Les retours du LLM ont été vérifiés sur des réponses variées ; ils expliquent les erreurs, acceptent les alternatives justifiées et restent consultables avec leur version de référence.
- Les parcours critiques ont été vérifiés sur mobile et bureau, au clavier et avec mouvements réduits, ainsi qu’après coupure réseau, rechargement et changement de compte.
- Les sauvegardes et préférences sont confirmées selon les règles actuelles ; un échec est visible et la reprise ne duplique pas les tentatives.
- Le circuit de signalement a été éprouvé jusqu’à une décision humaine et son résultat est compréhensible dans l’application.
- Les tests et le build passent ; les limites connues, les règles de conservation et les opérations de maintenance sont documentées.

La réussite ne se mesure pas au nombre de fonctionnalités. Les observations utiles sont la régularité choisie, la possibilité de rappeler une notion à distance et la qualité d’un raisonnement sur un cas différent. Les recueillir sobrement par usage personnel et comparaison de tentatives, sans installer une plateforme d’analytics ni fixer un seuil arbitraire de « maîtrise ».

## Décisions ouvertes à prendre avant les prochaines étapes

| Question | Recommandation initiale |
| --- | --- |
| Quel public prioritaire ? | Développeur web en consolidation ; adapter vocabulaire et indices si le débutant absolu devient la cible |
| Quels thèmes pour le prochain lot ? | Garder Docker, puis choisir revue de code et diagnostic web/backend selon les besoins rencontrés |
| Quels champs de formulaire ? | Deux champs : « Ce que je constate » et « Ce que je ferais », avec justification et vérification dans la consigne ; incertitudes facultatives si utile |
| Quel modèle pour le retour ? | Firebase Functions/Mistral retenus ; Large 2512 retenu après essai sur les cas, dans le budget partagé de 10 €/mois |
| Quelle place dans la routine ? | Proposer « Appliquer » indépendamment ; aucun défi imposé après chaque leçon |
| Faut-il planifier le retour aux défis ? | Commencer par le filtre personnel « À retravailler » ; décider après usage si un rappel apporte quelque chose |
| Que montrer après une mise à jour ? | Afficher clairement les versions et conserver les dossiers/corrections historiques, comme pour v1/v2 |
| Quel périmètre de couverture des cas ? | Choisir les compétences professionnelles prioritaires dans un manifeste, puis rédiger selon la capacité d’inspection |
| Veille ou notifications ? | Les différer tant qu’un problème d’usage concret ne les justifie pas |
| Comment gérer suppression et export des données ? | Définir le besoin et la politique avant implémentation ; les règles actuelles d’immutabilité ne fournissent pas ces fonctions |

Cette cible recommande de rendre les défis plus utiles avant de les rendre plus sophistiqués. Le cœur du produit reste un atelier personnel entretenu : une explication juste, un rappel régulier et une occasion de réfléchir avec les notions apprises.
