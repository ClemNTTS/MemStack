# Livraison du guidage Entreprise

Date : 22 octobre 2026. Contrat de référence : [plan de guidage](ENTERPRISE_GUIDANCE_PLAN_20261022.md), établi sur `main` au commit `0dd478f`.

## Périmètre et responsabilités

La réalisation autorisée couvre les lots A à E. Les commits sont séparés par lot ; le push n'intervient qu'à la fin. Ce document définit la recette et son niveau de preuve. Il ne constitue ni un résultat de tests ni une autorisation de déploiement Firebase.

- Développement : implémentation, tests adaptés et documentation des contrats.
- PO/manager : cohérence des parcours, critères de fin, priorités et langage pédagogique.
- QA : scénarios adverses, isolation, erreurs, contrôles de non-régression et preuves reproductibles.
- Testeurs agents : simulations de profils et inspection des écrans réellement accessibles ; leurs observations sont identifiées comme simulations.
- Panel humain : validation de compréhension et d'autonomie auprès de personnes réelles. Aucun panel n'est actuellement disponible dans cette réalisation ; ses résultats restent à recueillir.

Un test automatisé réussi ne prouve pas la compréhension humaine. Une inspection de code ne devient pas une observation navigateur. Une simulation agent ne devient pas un témoignage utilisateur.

## Matrice de livraison

| Lot | Résultat attendu | Critères de sortie | Preuves attendues |
| --- | --- | --- | --- |
| A — qualification | Transformer les retours en critères contrôlables, établir les scénarios et inventorier les limites d'observation. | Les sept retours sont couverts ; les causes confirmées sont séparées des hypothèses ; le manque de panel humain est explicite. | Ce registre et liens vers le plan ; état initial issu du code, puis captures si un environnement authentifié utilisable est disponible. |
| B — premiers usages | Restaurer le parcours choisi par compte/organisation, rendre la prochaine action visible, guider les premières cartes et activités. | Choix cloud confirmé seulement après accusé ; aucun parcours arbitraire ; première carte utilisable avec boutons texte ; consigne complète pour les deux premiers ateliers ; action principale avant exploration du programme. | Tests frontend/Functions applicables, règles et transactions sur émulateur pour la persistance et l'accès ; recette navigateur et revue PO. |
| C — hiérarchie et vocabulaire | Alléger navigation, distinguer apprendre/gérer, trier glossaire et clarifier retour IA/transitions. | Accès parcours/cartes/situations lisibles ; gestion responsable distincte ; mots ordinaires retirés du soulignement ; notions utiles conservées ; retour IA facultatif et nommé honnêtement. | Inventaire du glossaire, revue des transitions, contrôle des rôles, mobile et clavier. |
| D — qualité pédagogique | Inspecter toutes les cartes et consignes, corriger les défauts établis. | Chaque ID possède un verdict ; aucun problème pédagogique majeur laissé sans traitement ; formulation et objectif restent alignés ; historique protégé. | Registre pédagogique par ID, tests de catalogue, inspection indépendante et échantillon relu hors contexte de leçon. |
| E — reprise intra-mission | Restaurer l'état minimal d'une mission interrompue dans le bon périmètre. | Contrat défini avant code ; version et conflits traités ; aucun brouillon assimilé à une complétion ; cycle de vie couvert ; aucune nouvelle collecte IA. | Contrat final de données, tests d'isolation et concurrence, recette interruption/reprise, export et suppression. |

## Critères produit transversaux

1. Une première visite sans préférence propose un choix. Une visite suivante retrouve la préférence du bon compte et de la bonne organisation après lecture serveur.
2. Un lien explicite valide peut ouvrir un autre parcours sans modifier silencieusement le parcours habituel. Un paramètre invalide ne remplace pas une préférence valide.
3. Une organisation ne récupère pas implicitement le parcours, le brouillon, les cartes ou les résultats de l'organisation quittée. Les réponses réseau tardives sont ignorées après changement de contexte.
4. L'accueil présente l'organisation, le parcours, l'avancement et une action principale. Les autres actions restent disponibles sans être obligatoires.
5. Avant le lot E, « Continuer mon parcours » n'annonce pas une reprise à l'étape exacte. Après E, « Reprendre ma mission » n'est proposé que pour une reprise effectivement disponible.
6. Priorité initiale : cartes inédites, cartes dues, prochaine mission. Une reprise intra-mission fiable pourra passer en premier. Les révisions restent par lots explicites de cinq cartes dues au maximum, sans avancer les échéances futures.
7. Première carte : lire, répondre de tête sans saisir, révéler, comparer, choisir « Pas encore » ou « Oui ». Les gestes sont facultatifs ; les valeurs métier et le calendrier ne changent pas.
8. Activité : rôle, production attendue, étapes et critères sont visibles avant saisie. Les documents nécessaires restent consultables au contact de la tâche ; la narration demeure.
9. Correction déterministe, exemple et retour IA sont distingués. Le retour IA conserve l'information d'envoi à Mistral et n'est pas requis pour terminer. Une indisponibilité laisse un recours utile.
10. Ni XP, ni série, ni complétion, ni appréciation IA ne sont présentés comme preuve de maîtrise, conformité ou certification.

## Scénarios de recette

Les lignes suivantes sont des tests à exécuter, pas des observations déjà obtenues. Pour chaque exécution, consigner résultat, environnement, version, exécutant, preuve et limite.

| ID | Profil et action | Résultat attendu | Mode de validation |
| --- | --- | --- | --- |
| N01 | Novice, première entrée Entreprise sans préférence. | Comprend qu'il doit choisir un parcours ; aucun premier parcours imposé ; progression existante conservée. | Simulation agent puis panel humain. |
| N02 | Novice choisit un parcours, attend confirmation, recharge puis revient par l'entrée générique. | Même parcours et prochaine action ; pas de sélecteur initial affiché pendant la lecture cloud. | Intégration et navigateur ; retour J+1 réel à qualifier séparément. |
| N03 | Apprenant ouvre la ressource historique de politique de retour (`ent-plausible-not-proven`). | Peut retrouver la pièce, qualifier trois affirmations puis rédiger ; comprend où comparer et ce qui permet de continuer. | Simulation avec capture ; compréhension réelle au panel. |
| N04 | Novice ouvre sa première fondation, l'atelier à deux champs (`ent-answer-or-action`). | Tâche complète et format d'une phrase par champ compréhensibles ; aucune réponse préremplie présentée comme son travail. | Inspection et navigateur. |
| N05 | Novice utilise une première carte sans connaître Anki. | Révélation explicite ; choix compréhensibles ; explique la différence entre rappel avant révélation et lecture de la correction. | Navigateur pour mécanique ; panel pour compréhension. |
| N06 | Apprenant révèle une carte, choisit une réponse pendant une panne. | Carte conservée, erreur utile, reprise sans double pratique et sans faux succès. | Test de comportement et navigateur si panne contrôlable. |
| N07 | Apprenant demande un retour IA indisponible ou hors quota. | Réponse conservée ; exemple/repères disponibles ; progression non conditionnée à un retour positif. | Test contrôlé, sans provoquer de consommation fournisseur réelle inutile. |
| N08 | Apprenant consulte un mot courant puis une notion IA. | Pas d'infobulle parasite sur « messagerie » ; définition utile et accessible sur une notion retenue. | Tests moteur + clavier/tactile. |
| N09 | Apprenant termine un lot ou un parcours. | Peut s'arrêter ; prochaines révisions expliquées ; aucune autre mission ou carte future ne démarre seule. | Tests et navigateur. |
| R01 | Responsable ouvre son espace. | Prochaine action d'apprentissage visible ; équipe et abonnement regroupés dans une gestion identifiable. | Navigateur bureau/mobile, rôle contrôlé. |
| R02 | Responsable consulte l'équipe. | Synthèses autorisées uniquement ; aucune nouvelle exposition des brouillons, productions, diagnostics ou retours individuels. | Contrat serveur, tests d'accès et inspection. |
| R03 | Apprenant modifie URL/payload pour ouvrir la gestion. | Aucun privilège nouveau ; refus serveur conservé. | Émulateur et tests Functions applicables. |
| O01 | Même compte dans A et B choisit deux parcours différents. | Chaque organisation restaure son propre choix ; la bascule ne transporte pas automatiquement le parcours de A. | Intégration + navigateur. |
| O02 | Requête de A lente, bascule vers B puis arrivée de la réponse A. | Aucun état ni message de sauvegarde de A affiché dans B. | Test de concurrence contrôlé. |
| O03 | Même appareil, déconnexion puis compte différent. | Aucun choix, brouillon ou résultat du premier compte visible au second. | Intégration et navigateur. |
| O04 | Révocation d'adhésion pendant une session. | Prochaine lecture/écriture refusée ; aucun état local ne maintient un apprentissage autorisé ou un accès à l'organisation. | Émulateur et comportement client. |
| E01 | Apprenant interrompt une mission après sauvegarde confirmée puis recharge. | Étape et état minimal restaurés ; mission toujours inachevée ; parcours et organisation corrects. | Contrat E + intégration + navigateur. |
| E02 | Deux onglets modifient une reprise ou le contenu change de version. | Pas d'écrasement silencieux ; conflit/version incompatible traité selon le contrat E ; reprise compréhensible. | Tests de concurrence/version. |
| E03 | Export puis suppression d'un compte avec préférences et reprises. | Données nouvelles incluses dans l'export puis retirées ; une réponse tardive ne recrée pas le contenu supprimé. | Tests de cycle de vie sur émulateur. |
| X01 | Retour dans l'espace Développement après les changements partagés de cartes. | Historique, évaluations, échéances et navigation Développement restent cohérents ; aucune progression Entreprise copiée. | Non-régression des composants partagés et navigateur. |

## Contrat préalable du lot E

Le chemin Firestore, le schéma exact et les durées de conservation restent à fixer avec le développeur backend avant implémentation. Le périmètre convenu est une sauvegarde cloud minimale, organisationnelle et versionnée, sans nouvelle collecte IA ni ajout d'un service externe.

Le contrat doit préciser : identité du propriétaire et de l'organisation ; mission/version ; position restaurable ; état strictement nécessaire de la tâche ; révision de concurrence ; date serveur ; limites de taille/fréquence ; traitement des anciennes versions ; effacement à la fin ou à la demande ; conservation ; export et suppression du compte. Ne stocker une production libre que si elle est nécessaire à la reprise et couverte explicitement par ce contrat. Aucun accès manager implicite. Passer par les contrôles serveur existants, sans ouvrir les règles client des organisations.

Une interruption sans accusé serveur ne doit pas être annoncée comme sauvegardée. Sauvegarder une reprise ne crée aucune XP, aucun résultat d'exercice, aucune échéance de carte et aucune complétion. La suppression ou révocation et les réponses tardives doivent rester sûres.

## Validation pédagogique et panel humain

Le registre du lot D doit couvrir l'intégralité du catalogue réellement compté à l'exécution. Les 120 cartes annoncées dans le plan sont une référence à rapprocher de l'inventaire, pas un résultat de comptage acquis. Par carte : ID, objectif, autonomie, clarté, idée essentielle attendue, utilité professionnelle, source, décision et justification. Une correction de formulation garde l'ID ; une nouvelle compétence exige une décision explicite sur version et historique.

Le panel à organiser comprend des collaborateurs débutants, des utilisateurs autonomes et des responsables, dont des non-développeurs. Protocole : ne pas expliquer l'interface avant les tâches ; observer première action, demandes d'aide, erreurs et abandon ; demander de reformuler la tâche et l'autoévaluation ; tester un retour réel ultérieur puis un rappel différé ou une situation nouvelle.

Seuils proposés par le plan : tous les scénarios techniques de restauration/isolation doivent passer ; au moins quatre personnes sur cinq identifient seules la prochaine action, comprennent la carte et reformulent l'activité. Le seuil humain ne peut pas être validé par cinq simulations agents. Tant que le panel manque, écrire « validation humaine à réaliser » ; ne publier aucun taux de compréhension, gain de rétention ou temps utilisateur inventé.

## Vérifications et registre des preuves

- Build pour chaque lot de code ; suite native pour les contenus et comportements partagés.
- Build et tests Functions pour les changements serveur ; commandes CI d'émulateurs applicables aux accès, transactions et cycle de vie.
- Navigateur : bureau 1366 × 768, mobile 390 × 844, clavier, focus, zoom et absence de débordement ; une capture non authentifiée ne qualifie pas le parcours authentifié.
- Revue PO avant clôture de chaque lot ; corrections bloquantes traitées avant commit du lot.
- Contrôler IDs et historique, séparation des organisations et de Développement, dates/échéances et absence de nouveaux droits sur les réponses.
- Décrire les tests non exécutés et leur cause. Aucun déploiement ou état de production ne se déduit d'un build local.

| Lot | État initial du registre | Preuves / reste à faire |
| --- | --- | --- |
| A | Critères et scénarios définis dans ce document. | Panel humain indisponible ; aucune observation humaine nouvelle. |
| B | Implémenté et qualifié localement avant commit du lot. | Builds réussis ; 278 tests natifs, 90 tests backend et 9 tests d'intégration sur émulateurs rapportés réussis par les exécutants. Revue PO des correctifs et simulation navigateur décrites ci-dessous. Validation humaine à réaliser ; aucun déploiement. |
| C | Implémenté et inspecté localement avant commit du lot. | Navigation et transitions relues ; registre des 190 décisions de glossaire ; 282 tests natifs et build réussis rapportés. Simulation navigateur et limites détaillées ci-dessous. |
| D | Implémenté, inspecté indépendamment et testé localement. | 120 cartes et 40 consignes inspectées ; cinq réponses de cartes, quatre tâches et un scénario clarifiés. Tests natifs 282/282, Functions 90/90, builds réussis ; validation humaine à réaliser. |
| E | Implémenté et vérifié localement, avec limite de recette interactive. | Sauvegarde explicite privée, versions, concurrence, export et suppression ; 293 tests natifs, Functions 95/95, Firestore 55/55 et reprise enrichie 4/4. Rechargement et conflit entre onglets exercés ; recette finale du dialogue de sortie à reprendre. |

Le livrable final doit distinguer : implémenté et testé localement ; inspecté par agents ; validé par des humains ; non testé ; non déployé. Les preuves sont datées et rattachées au commit pertinent.

## Clôture du lot B — 22 octobre 2026

Référence : modifications du lot B relues après le commit du lot A `e68f5c6`, avant création du commit B. Les résultats d'exécution ci-dessous sont transmis par les agents exécutants ; le PO a inspecté le code et n'a pas lui-même exécuté ces suites ni manipulé ce navigateur.

La préférence de parcours est enregistrée par callable dans le périmètre du compte et de l'organisation, puis restaurée par le workspace. L'URL explicite reste prioritaire sans changer silencieusement la préférence. La bascule d'organisation ne transporte plus le parcours précédent. Les nouveaux réglages participent à l'export et à la suppression du compte. Les tests backend/émulateurs rapportés couvrent notamment deux organisations, les refus d'accès, les règles client fermées et le cycle de vie.

Deux anomalies de la revue indépendante ont été corrigées avant clôture : signature de l'adaptateur de sauvegarde harmonisée avec son appel ; navigation protégée contre une réponse de choix tardive lorsque l'utilisateur a déjà changé de page dans la même organisation. La mention contradictoire « sans appel à une IA » a également été retirée du chemin. La préférence confirmée ne devient pas une complétion pédagogique.

Les premières cartes proposent un mode d'emploi visible et repliable, une consigne avant/après révélation et des boutons textuels Non/Oui. Le choix signifie un rappel avant révélation, même si la réponse devient reconnaissable après lecture. L'aide se replie après une carte réussie dans le lot ; aucun état d'initiation persistant intersessions n'est revendiqué. Les activités rendent leur consigne et leurs amorces explicites, et le retour IA est nommé facultatif avec exemple de secours.

### Preuves d'exécution rapportées

- Builds frontend et Functions réussis ; suite native : 278 tests réussis ; backend : 90 tests réussis ; intégration sur émulateurs : 9 tests réussis. Consulter les sorties conservées dans la conversation de réalisation pour les commandes et détails ; ces nombres ne constituent pas une preuve de déploiement.
- Comptage initial rapporté par l'exécutant : 40 missions, 120 cartes et 190 entrées de glossaire. Les lots C et D doivent rattacher leur inventaire et leurs verdicts à ces contenus.
- Navigateur avec environnement fictif et runtime simulé : choix du parcours, restauration et bascule entre deux organisations exercés. Cette simulation contrôle le comportement de l'interface ; elle ne prouve pas une synchronisation Firebase de production ni un retour humain réel le lendemain.
- Mobile 390 × 844 : action principale entièrement dans le viewport, bord inférieur mesuré à 794 px, sans débordement horizontal dans l'état observé. Les autres contenus restent explorables par défilement.
- Première fondation à deux champs : consigne visible, saisie et aide de comparaison ; indisponibilité IA simulée par `failed-precondition`, recours à l'exemple puis poursuite sans retour IA positif obligatoire. Mission enregistrée dans le runtime fictif.
- Cartes : révélation au clavier par Espace puis choix Non ; progression observée à la carte 2 sur 3. Cette preuve concerne les interactions, pas une mesure de compréhension d'un novice humain.

### Rectification du protocole initial

Le catalogue courant déclare les fondations dans cet ordre : `ent-answer-or-action`, puis `ent-useful-request` (`shared/enterpriseCurriculum.json`, `foundationLessonIds`). `ent-plausible-not-proven` et son composant `ReturnPolicyPractice` sont une ressource historique, pas la première activité du socle actuel. Les mentions contraires dans le diagnostic initial du plan sont à lire comme une hypothèse historique rectifiée ici ; leur valeur est la description des problèmes de cet atelier, et non sa position dans le parcours actuel. Les scénarios N03/N04 sont corrigés en conséquence. La preuve navigateur du lot B sur la première fondation concerne bien `ent-answer-or-action`.

### Limites et suite

Aucun panel humain nouveau n'a été observé ; validation humaine à réaliser. La qualification navigateur repose sur des données fictives et un runtime simulé, tandis que les contrôles backend sont locaux sur émulateurs. Aucun appel Mistral réel ni environnement de production n'est qualifié par cette simulation. Le lot C doit poursuivre la hiérarchie de navigation, le glossaire et les transitions ; D reste la revue exhaustive des cartes/consignes ; E reste la reprise à l'intérieur d'une mission, sans promesse anticipée de restauration exacte.

## Clôture du lot C — 22 octobre 2026

Référence : modifications relues après le commit B `b492774`, avant commit C. Le PO a inspecté indépendamment les diffs de navigation, transitions, moteur de glossaire, tests et un échantillon des décisions éditoriales. Aucun blocant nouveau relevé dans ce périmètre. Les manipulations navigateur et les suites ci-dessous sont rapportées par l'agent exécutant ; elles ne sont pas des observations humaines.

La navigation principale comporte Mon parcours, Mes cartes et Mises en situation. Les accès secondaires sont repliés ; équipe et abonnement restent réservés au rôle responsable dans l'interface et conservent les contrôles serveur existants. Le programme complet, les ressources, le classement et les badges passent après l'action principale. La fin de mission distingue enregistrement confirmé et relecture, rappelle l'objectif travaillé et permet de retrouver cartes ou parcours ; la fin de lot rappelle les échéances et la possibilité de s'arrêter. L'inspection a aussi vérifié le maintien d'un accès au classement et à l'édition du pseudo via sa page dédiée.

Le [registre de glossaire](content/ENTERPRISE_GLOSSARY_GUIDANCE_20261022.md) couvre les 190 entrées locales originales : 154 conservées, 8 contextualisées, 28 retirées des infobulles, soit 162 entrées locales finales. Les mots usuels comme messagerie, destinataires, brouillon et messages envoyés ne sont plus soulignés. Les notions IA, permissions, minimisation, injection de prompt et concepts de décision utiles restent disponibles. La revue ciblée n'a pas relevé de consigne indispensable supprimée : ce lot retire les infobulles, pas le texte des cas.

Le dédoublonnage utilise un Set neuf par rendu de LessonText, partagé entre paragraphes et segments de prose ; il exclut le code. Il ne persiste pas entre composants ou utilisateurs. Cette portée réduit les répétitions dans un bloc, sans prétendre supprimer toute répétition dans une conversation composée de plusieurs blocs. Huit tests de glossaire couvrent notamment correspondances, variantes d'apostrophe, maintien du texte, retraits, concepts utiles, portée et inventaire ; ils sont ajoutés au périmètre de compilation des tests.

### Preuves d'exécution rapportées

- `npm test` : 282 tests réussis ; build frontend réussi. Compilation des sources de tests après ajout du glossaire au `tsconfig.test.json` également rapportée réussie avant le commit.
- Bureau 1366 × 768 : bord inférieur de l'action principale à 629,47 px. Mobile 390 × 844 : bord inférieur à 698,59 px, sans débordement horizontal dans l'état observé. Captures rapportées : `lot-c-desktop.png` et `lot-c-mobile.png`, dans le dossier de captures de la réalisation. Ces mesures ponctuelles ne qualifient pas tous les contenus, zooms ou tailles d'écran.
- Menu responsable : ouverture de Gestion et autres accès, visite de Mon équipe puis retour au parcours exercés dans le runtime fictif.
- Programme complet : ouverture du summary avec Entrée, puis accès à une relecture exercés. Les dates de cartes ne sont pas présentées comme modifiées par cette relecture.
- Glossaire : ouverture d'une définition de prompt avec Entrée, fermeture par Échap, focus conservé sur le déclencheur ; brouillon observé sans soulignement.

### Limites

La compréhension réelle, le temps nécessaire à un novice et la rétention restent à mesurer avec le panel humain. Le navigateur utilise un runtime simulé et des données fictives ; ni droits de production, ni appels Mistral réels, ni facturation ne sont qualifiés par ces manipulations. Le contrôle indépendant du glossaire est ciblé ; le registre exhaustif est le livrable éditorial de son auteur. Aucun déploiement effectué pour ce lot. Le lot D doit encore inspecter toutes les cartes et consignes ; E doit définir puis implémenter la reprise intra-mission.

## Lot D — qualification du 22 octobre 2026

Le [registre des cartes et activités](content/ENTERPRISE_CARDS_GUIDANCE_20261022.md) couvre les 120 cartes et les consignes des 40 missions. La [relecture pédagogique indépendante](content/ENTERPRISE_CARDS_QA_20261022.md) rapporte les demandes transmises à l’auteur puis les corrections acceptées. La [qualification technique](content/ENTERPRISE_GUIDANCE_TECHNICAL_QA_20261022.md) distingue les changements de formulation des invariants de progression.

Cinq réponses ont été clarifiées : injection de prompt visible ou cachée ; itération comme essai à comparer ; pièce étayant une information sans garantir toute sa fiabilité ; gain net avec signe explicite ; prototype comme version d’essai. Quatre tâches distinguent mieux les productions attendues ; le scénario du gain brut sépare le temps économisé du coût de relecture. Les objectifs restent identiques.

Les identifiants, questions, options, corrections déterministes, sources, prérequis, versions de catalogue et grilles sont inchangés après comparaison profonde des JSON. Les copies de contenu empaquetées avec les Functions ont été régénérées et comparées aux sources finales. `npm test` : 282 réussites ; `npm run functions:test` : 90 réussites ; builds frontend et Functions réussis. Aucune nouvelle logique d’accès ou de transaction dans ce lot : pas de répétition de l’émulateur uniquement pour des formulations.

Les verdicts pédagogiques sont ceux d’agents ; ils ne mesurent pas la compréhension ni la rétention de collaborateurs réels. Le push final se fera sur `codex/enterprise-guidance`, sans déclencher le déploiement Pages de `main` avant coordination avec les Functions.

## Lot E — qualification du 22 octobre 2026

Le [contrat de reprise](ENTERPRISE_RESUME_CONTRACT_20261022.md) et la [relecture indépendante](ENTERPRISE_RESUME_QA_20261022.md) décrivent la sauvegarde volontaire, les limites et les contrôles. Les nouvelles données restent dans le périmètre apprenant/organisation existant ; aucun service ni appel IA supplémentaire. Le workspace ne charge que des résumés ; le texte est lu à l’ouverture de sa mission. La prochaine action privilégie une reprise valable du parcours courant, puis les cartes et missions, sans démarrage automatique.

La version couvre la mission et sa pratique. Les écritures sont conditionnées par une révision et un identifiant de mutation, avec rejeu identique sans double écriture. Effacement et complétion retirent le texte et empêchent sa résurrection par une écriture ancienne. Les diagnostics de politique de retour sont restaurés, mais ni appréciations IA, ni exemples ouverts, ni laboratoire. L’aide des cartes se présente automatiquement seulement lorsqu’aucune carte de cet espace n’a encore été pratiquée ; elle reste réouvrable.

### Preuves

- `npm test` : 293 tests réussis sur le contenu et le code final, incluant les nouveaux contrats de reprise ; build frontend réussi. Avertissement préexistant de taille de bundle conservé.
- Functions : build réussi et 95 tests réussis. Suite Firestore CI isolée : 55/55, puis suite reprise enrichie : 4/4. Les derniers cas renforcent comptes désactivés/non vérifiés, droit d’organisation inactif, deux UID dans deux organisations, accès manager/anonyme, export et suppression. Aucune connexion à une base de production.
- `npx tsc -p tests/enterprise-ui/tsconfig.json` : harnais navigateur typé et vérifié séparément ; aucun alias de qualification dans la configuration Vite de production.
- Navigateur sur vrais composants avec adaptateur fictif : étape 2 enregistrée puis restaurée ; étape 6 et ses deux champs enregistrés puis restaurés avec texte exact ; ancienne session refusée après écriture d’un autre onglet, puis rechargement explicite de la bonne version. Une mauvaise réponse vérifiée a été restaurée à l’étape 7, et Continuer est resté désactivé.
- La QA a découvert la perte possible de modifications sur navigation SPA. Un événement annulable protège désormais liens internes, changement d’organisation et historique ; un dialogue HTML propose rester ou quitter sans enregistrer. Le navigateur de cette session a été bloqué par un ancien dialogue natif pendant la recette initiale. Le dialogue natif a été retiré du code et remplacé par le dialogue HTML ; l’audit du correctif et le build sont concluants, mais sa dernière recette interactive et le scénario final de complétion restent à reprendre dans un navigateur débloqué. La complétion concurrente et la purge sont couvertes par les tests serveur.

### Livraison et réserves

Les cinq lots correspondent à des commits distincts. Le push final cible uniquement la branche `codex/enterprise-guidance`. La CI de `main` publie le frontend : intégrer et publier seulement après préparation autorisée des Functions compatibles, avec les callables de préférences et de reprise ainsi que les dernières empreintes d’activités. Aucun déploiement Firebase ni changement de facturation exécuté.

Le panel humain reste à organiser : aucune mesure nouvelle de compréhension, de retour réel le lendemain ou de rétention n’est revendiquée. La disponibilité de reprise expire logiquement après trente jours ; sans nouvel accès, aucun effacement physique à date fixe n’est garanti.
