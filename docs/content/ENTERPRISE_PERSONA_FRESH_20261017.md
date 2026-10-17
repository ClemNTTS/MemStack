# Relecture fraîche des parcours Enterprise — 17 octobre 2026

## Périmètre et méthode

Simulation écrite à partir des sources, sans navigateur, sans personne humaine observée et sans outil externe exécuté. Aucune réussite opérationnelle, durée d'apprentissage ou statistique utilisateur n'est revendiquée. Trois rôles : salariée administrative novice des assistants ; référent métier non développeur pour l'automatisation ; manager de PME chargé d'un petit site. Six ateliers approfondis, deux par parcours.

Avant les propositions ci-dessous, seules les instructions AGENTS.md, les titres/objectifs/descriptions du curriculum et les champs scenario/task/starter/checklist des six pratiques ont été lus. Aucun correctOptionId, aucune clé d'évaluation, aucun exemple ou explanation de pratique n'a été lu. Les checklists étaient visibles : il s'agit d'une production guidée, pas d'une évaluation à l'aveugle. Les réponses initiales ont été enregistrées dans ce fichier par un appel d'outil distinct avant la lecture des exemples. Les variantes, erreurs et questions signalées ci-dessous sont simulées ; elles ne constituent pas des observations de personnes.

## Productions initiales, avant exemples

### 1. Assistants — ent-assistants-brief

Rôle : employée administrative qui prépare un message d'accueil.

**Brief prêt à copier :** « Rédige un courriel d'accueil aux douze collègues de Boréal. Ils doivent venir lundi à 9 h en salle Pin. Indique qu'un ordinateur sera fourni et demande d'apporter un carnet. Invite chaque destinataire à répondre au courriel si cet horaire pose problème. Utilise un ton accueillant, professionnel et simple, un objet explicite et un texte court. Ne complète pas la date ni d'autres informations absentes. »

**Deux critères observables :** 1. Le courriel contient lundi, 9 h, salle Pin, ordinateur fourni et carnet à apporter sans les intervertir. 2. Il demande explicitement une réponse si l'horaire pose problème et n'ajoute aucune information factuelle absente du brief.

Livrable utile : je peux copier cette demande dans l'assistant autorisé et vérifier le résultat sans avoir besoin d'un compte connecté ici. Question pratique restante : « lundi » est suffisant dans ce cas fictif, mais une vraie invitation demanderait une date.

### 2. Assistants — ent-assistants-documents

Rôle : même employée, préparation d'une réponse commerciale.

**Demande :** « À partir des trois pièces fictives DEMANDE, CATALOGUE ACTUEL et LOGISTIQUE, prépare une proposition pour 40 carnets vendredi. Produis quatre lignes : quantité, produits, total livré, délai ; cite la pièce utilisée pour chaque ligne. Compare le budget produits aux seuls produits. Affiche les calculs. Ne promets pas de livraison tant que l'heure de validation n'est pas connue. Termine par une question permettant de vérifier la condition mardi midi. »

| Point | Proposition / calcul | Pièce utilisée |
| --- | --- | --- |
| Quantité | 40 carnets ; minimum 30 respecté | DEMANDE + CATALOGUE ACTUEL |
| Produits | 40 × 6 € = 240 € ; inférieur au budget produits de 280 €, écart 40 € | DEMANDE + CATALOGUE ACTUEL |
| Total livré | 240 € + 25 € = 265 € ; ce total inclut la livraison | CATALOGUE ACTUEL + LOGISTIQUE |
| Délai | Vendredi possible sous réserve d'une validation avant mardi midi ; validation inconnue | LOGISTIQUE |

**Question :** « La commande a-t-elle été, ou peut-elle être, validée avant mardi à midi ? »

Livrable utile : proposition vérifiable avec montant produit et livraison séparés. Je n'en déduis ni une commande passée ni une livraison garantie. Le cas contient des extraits, pas des documents à télécharger : aucune compétence de manipulation de pièces jointes n'est démontrée.

### 3. Automatisation — ent-automation-data-contract

Rôle : référent métier à l'aise avec un tableau, sans programmation.

| Source → destination | Sens / format proposé | Obligatoire / règle |
| --- | --- | --- |
| inscription_id → Référence | Référence unique d'une inscription ; texte, ici INS-204 | Oui ; sert à rechercher une ligne déjà créée |
| session_id → Session | Référence d'une session ; texte, ici AT-17 | Oui ; utiliser cet identifiant, pas le nom qui peut être identique |
| places → Nombre de places | Nombre demandé ; entier strictement positif, ici 2 | Oui ; vide ou invalide : demander de compléter |
| date_session → Date | Date de la session au format AAAA-MM-JJ, ici 2026-11-05 | Oui ; format non ambigu |
| statut → État | À la création, reprendre soumise | Oui à la création ; ensuite la liste fait foi |

**Reprise :** avant toute création, rechercher inscription_id. Si INS-204 existe déjà, ne pas créer de nouvelle ligne et ne pas remettre son État à soumise. Pour une valeur places vide, conserver le suivi de la demande dans la file distincte « à compléter », sans créer une réservation invalide. Je ne sais pas encore quelles autres valeurs d'État seront autorisées ; l'équipe doit les préciser. Aucun nom de personne, adresse, téléphone ou autre donnée individuelle n'est nécessaire ici. Je ferais confirmer par la personne technique que la recherche suivie de création ne peut pas produire deux lignes lorsque deux traitements démarrent ensemble ; je ne sais pas le configurer seul.

Livrable utile : tableau à discuter avec la personne qui configure le flux. Ce n'est pas un flux testé ni connecté. Mot dont je demanderais la définition : « contrat » désigne ici un accord sur les colonnes et leur utilisation, pas un document juridique.

### 4. Automatisation — ent-automation-exceptions

Rôle : même référent, organisation d'une reprise après panne.

| Référence | Effet présent | État proposé | Suite | Responsable proposé |
| --- | --- | --- | --- | --- |
| INT-88 | Fiche créée à 09:00 ; notification échouée à 09:01 | Fiche créée, notification à reprendre | Reprendre seulement la notification, deux nouvelles tentatives espacées au maximum ; si échec persistant, alerter le planificateur | Exécutant du flux pour les tentatives, planificateur pour l'escalade ; noms à attribuer |
| INT-89 | Aucune fiche ; adresse absente | À compléter | Demander l'adresse, garder la demande en attente ; après complément, reprendre le traitement sans inventer d'adresse | Planificateur proposé, à confirmer |

**Trace minimale :** référence, action déjà effectuée, date et heure de chaque tentative, résultat, nombre de nouvelles tentatives consommées, prochaine action et responsable. Pour INT-88, conserver distinctement création réussie à 09:00 et échec de notification à 09:01. Les délais entre tentatives restent à définir.

**Protection à confirmer :** faire vérifier qu'une même référence ne peut pas être traitée en même temps par deux exécutions et ne peut pas générer une deuxième fiche ; je sais exprimer le résultat attendu, pas mettre en place cette protection. Aucun outil réel n'est configuré dans cette mission.

Livrable utile : instruction de reprise compréhensible. Point qui m'empêche de configurer réellement : qui déclenche, qui attend combien de temps, et comment consulter la trace ? Ce sont des décisions encore ouvertes, pas des faits à inventer.

### 5. Projet — ent-projects-specification

Rôle : manager de PME qui demande une page à une personne technique ou à un assistant.

**Demande de réalisation :** « Pour les visiteurs du centre Rivage, préparer une première page qui permet de comparer deux ateliers et de choisir un créneau. Présenter Initiation tableur : 12 novembre, 14 h, salle Bleue, durée 2 h ; Présenter un projet : 14 novembre, 9 h, salle Verte, durée 3 h. L'année reste à confirmer : ne pas l'inventer et ne pas présenter ces dates comme définitives. »

**Trois critères :** 1. Chaque atelier conserve son nom, son jour et mois, son heure de début, sa salle et sa durée, sans mélanger les deux fiches. 2. Les deux propositions sont visibles dans une présentation comparable où les heures de début sont faciles à repérer. 3. La page indique que l'année et les dates définitives restent à confirmer et ne propose ni inscription ni paiement.

**Exclusions :** compte membre, formulaire d'inscription, collecte d'informations personnelles, paiement. **Question bloquante :** quelle année doit-on afficher pour les deux ateliers ? **Première livraison :** aperçu de la page à relire avant toute mise en ligne ; les dates provisoires restent signalées.

Livrable utile : demande suffisamment précise pour examiner un aperçu. Je peux écrire la demande malgré l'année manquante ; cette absence bloque la confirmation des dates et la publication, pas nécessairement une maquette.

### 6. Projet — ent-projects-release

Rôle : même manager, préparation de l'ouverture d'une page d'inscription.

**Décision actuelle :** ne pas ouvrir la page aux participants : le prototype confirme sans enregistrer.

**Avant ouverture / preuves demandées :** le responsable technique connecte un enregistrement autorisé et vérifie les accès. L'équipe définit deux identités fictives A et B et les champs nécessaires. Faire A : confirmer que Jo retrouve exactement sa demande et les champs convenus dans l'outil d'accueil ; faire B : Jo retrouve une seconde demande distincte ; répéter A : Jo retrouve toujours deux inscriptions distinctes, sans inscription supplémentaire. Conserver une trace de chaque essai et du nombre de fiches. Le responsable technique confirme comment la répétition est reconnue et comment les traitements simultanés sont protégés. Un message vert seul ne prouve rien.

**Essais complémentaires proposés :** sur mobile, réaliser la demande complète et vérifier sa fiche ; au clavier seul, atteindre tous les champs, lire les messages et envoyer ; simuler une panne d'enregistrement, vérifier qu'aucun succès mensonger ne s'affiche et que la procédure de contact est accessible. Le responsable technique doit préciser comment simuler la panne sur une copie de test.

**Responsabilités proposées :** responsable technique pour branchement, accès et correction ; Jo pour la recherche des demandes à l'accueil ; manager pour décision d'ouverture et de reprise. Noms et suppléants à confirmer.

**Repli :** dès qu'un succès s'affiche sans fiche retrouvée, suspendre les nouvelles inscriptions sur la page et afficher un contact d'accueil effectivement disponible, encore à définir. Faire rapprocher par Jo les traces disponibles et les demandes enregistrées, traiter les demandes manquantes par la procédure convenue, sans rejouer à l'aveugle toutes les inscriptions. Refaire les essais A/B/répétition et la panne après correction ; la reprise nécessite les preuves et l'accord des responsables.

Livrable utile : plan de lancement à compléter avec l'équipe. Je n'ai créé aucune fiche, testé aucun site, configuré aucun accès ni prouvé de protection contre les doublons.

## Comparaison avec les exemples et recommandations

Lecture effectuée dans des appels ultérieurs : champs example/explanation des six ateliers, puis uniquement texte des étapes message et énoncés prompt des six leçons et des deux fondations. Aucun choix corrigé ni clé d'évaluation consulté. Les propositions initiales ci-dessus restent inchangées pour conserver la comparaison.

### Résultat principal

Les six ateliers permettent de produire un document métier concret avec les informations fournies. Aucun blocage confirmé empêchant leur réalisation écrite après lecture des messages pédagogiques. La promesse de préparation sans programmation est tenue sur cet échantillon : on écrit une demande, un tableau de correspondance, une procédure ou un plan de lancement. La configuration et la validation technique restent explicitement à la charge des personnes compétentes. Ce résultat n'établit ni la qualité de l'interface ni un apprentissage mesuré.

Les fondations sont cohérentes avec les pratiques : distinguer proposition et action confirmée, puis préciser résultat, informations, contraintes et critères. Elles ne prétendent pas qu'un prompt constitue une protection technique. Elles ne remplacent cependant pas toutes les explications du parcours automatisation : identifier le rôle d'un identifiant stable, la source qui fait foi et les traitements simultanés exige les messages de ce parcours.

### Comparaison détaillée

| Atelier | Comparaison de la proposition initiale avec l'exemple et les messages | Conséquence / recommandation |
| --- | --- | --- |
| Brief | Informations et deux critères cohérents. Mon « texte court » est moins mesurable que 120 mots ; l'explication autorise explicitement une autre limite si le texte reste bref et complet. Mon second critère impose aussi la réponse en cas de difficulté, conforme au scénario. | Pas de correction indispensable. Ajouter éventuellement « par exemple 120 mots » au starter aiderait une personne qui ne sait pas définir « court », sans rendre ce nombre obligatoire. |
| Documents | Montants 240 €/265 €, budget produits et condition mardi midi cohérents. Ma demande cite les trois pièces et mon tableau relie les lignes à leurs sources. L'exemple ne promet pas de vente conclue ni de commande envoyée. | Le message-4 répond à la question de manipulation : extraits autorisés possibles, aucun connecteur nécessaire. Conserver cette précision. Ne pas présenter cet atelier comme un test de lecture de PDF ou de connecteur. |
| Contrat de données | Erreur réelle dans ma proposition initiale : j'ai conservé État=soumise à la création. Le message-3 enseigne soumise → État=à traiter et l'exemple reprend cette transformation. Mon traitement des absences, identifiants et répétitions est cohérent ; je n'ai pas nommé le coordinateur dans la file distincte, alors que le message et l'exemple le font. | Complément après comparaison : statut soumise donne État=à traiter à la création ; une demande incomplète garde référence, motif et responsable dans la file séparée. Ajouter ces points au scénario et à la checklist rendrait la fiche autonome. L'erreur produite avant lecture des messages ne démontre pas un défaut du parcours complet. |
| Exceptions | Reprise de notification seule, deux nouvelles tentatives puis alerte et demande d'adresse concordent. J'ai proposé un exécutant du flux non nommé ; le message-2 donne plus concrètement le planificateur comme vérificateur puis repreneur. Mon plan omet la vérification préalable explicitement écrite dans l'exemple. | Complément : avant de retenter, le planificateur retrouve et vérifie INT-88 ; en résultat incertain, vérifier la destination. Les délais restent à définir. La protection simultanée est expliquée dans message-3, donc ce n'est pas une compétence technique supposée acquise sans support. |
| Spécification | Données, heures de début, année inconnue et exclusions cohérentes. L'exemple ajoute lecture mobile, enseignée en message-4 ; ma proposition initiale n'en a pas fait un critère. Le scénario et la checklist n'en font pas une obligation. | Critère supplémentaire possible : les deux fiches restent lisibles sur téléphone. Distinguer la première structure provisoire des dates définitives : les messages le font correctement. Ne pas considérer ma variante de trois critères comme erronée pour la seule absence de mobile. |
| Lancement | Décision de non-ouverture, vérification par Jo, A/B/répétition et repli concordent. Mon plan teste une panne d'enregistrement mais n'explicite pas le champ manquant ; l'exemple et message-3 le proposent. J'ai laissé le contact à définir, tandis que le contexte indique qu'il sera suivi par Jo. | Ajouter essai champ obligatoire vide et coordonnées de contact effectivement suivies par Jo. Mon plan ne prouve aucun de ces tests. Le message rappelle correctement que mobile/clavier/champ manquant ne constituent pas un audit complet d'accessibilité. |

### Recommandations aux auteurs avant l'interface

1. **Rendre visible la transformation d'État dans la fiche atelier.** Fichier `src/data/enterprisePractices.json`, entrée `ent-automation-data-contract`, scenario/checklist : préciser « statut soumise devient État à traiter à la création » et « file séparée : référence, motif, responsable ». La différence entre renommer une colonne et transformer sa valeur est le seul écart factuel concret de ma production initiale. Le texte de leçon contient déjà l'information ; il ne faut pas la compter comme absente du parcours. Priorité : améliorer la reprise autonome de la fiche, pas bloquer une livraison.

2. **Définir précisément ce qui est répété au lancement.** Même fichier, `ent-projects-release`, scenario/task : proposer « renvoyer exactement la même demande A pour le même objet » et demander au responsable technique comment cette demande est reconnue. Aujourd'hui le cas donne l'attendu de deux inscriptions distinctes, mais l'expression « identités » pourrait suggérer que toute seconde demande de la même personne est un doublon. C'est une ambiguïté de transfert métier, pas une impossibilité de faire le cas fictif.

3. **Transformer les blancs techniques en décisions explicitement confiées.** `ent-automation-exceptions`, starter : ajouter « délai entre les tentatives et personne chargée de les déclencher : à convenir ». Le scénario exige des tentatives espacées sans fixer l'espacement ; c'est acceptable dans une préparation, à condition qu'une personne novice n'interprète pas son tableau comme une configuration prête à activer. Le texte précise déjà « aucun outil réel configuré » et la protection à confirmer : les conserver.

4. **Garder l'exemple comme proposition, avec différences justifiées.** Le brief laisse une longueur différente, le contrat laisse un autre format de date explicite, les exceptions laissent une organisation différente des alertes. Ces explications sont utiles : mes productions ont une forme différente mais souvent la même valeur métier. Éviter de faire de la formulation exacte de l'exemple une condition implicite de réussite. La checklist sert à relire, elle ne constitue pas une certification externe du document.

### Vocabulaire et charge cognitive par rôle

**Salariée administrative novice.** « Livrable » est défini par un résultat concret et « brief » immédiatement décomposé en éléments pratiques. « Traçabilité » est expliqué comme le lien de la proposition au dossier. Les deux situations donnent une raison compréhensible à la méthode. Le tableau commercial est directement réutilisable. La seule difficulté simulée est de passer d'une préférence vague (« court ») à un critère observable ; l'exemple la résout.

**Référent métier non développeur.** « Contrat de données », « mapping », « source de référence », « exception » et « idempotence » sont tous expliqués dans les messages consultés. Ces mots ne sont donc pas des prérequis cachés. Leur accumulation reste exigeante : pour une reprise de mission, une petite aide rappelant « mêmes champs / bon état / même demande / pas deux effets » serait utile. Le référent peut décrire la protection nécessaire sans savoir la configurer. Il doit pouvoir laisser le mécanisme et les délais « à confirmer » plutôt qu'inventer un produit ou un réglage.

**Manager PME, projet de site.** Les résultats visibles, les exclusions et l'année absente sont faciles à discuter avec un prestataire. « Recette » est défini comme les contrôles qui permettent d'accepter avant ouverture. « Rapprocher les enregistrements » peut encore être abstrait : une consigne comme « comparer demandes reçues et fiches présentes, lister les manquantes et leur responsable » serait plus accessible. Le plan de lancement rend visible le besoin d'appui technique, sans promettre que le manager peut assurer seul sécurité, accès ou exploitation.

### Valeur et promesse honnête

Ces six livrables font avancer une conversation de travail : brief réutilisable ; proposition commerciale chiffrée ; correspondance entre colonnes et règles d'état ; instruction de reprise ; demande de page ; plan d'ouverture. La trace écrite est la preuve disponible dans cette simulation. Elle ne permet pas d'affirmer que la personne maîtrise un assistant connecté, un automatisme réel, l'accessibilité d'un site ou une mise en production.

Les messages disent explicitement qu'aucune IA ou automatisation externe n'est appelée, que les cas sont fictifs, que le transfert est facultatif et qu'aucun achat n'est nécessaire. Les parcours automatisation et projet renvoient aux responsables techniques pour les protections réelles. Conserver ces mentions à proximité de la pratique. La description générale « de l'idée au lancement » reste honnête lorsqu'elle est comprise comme une préparation de ces étapes ; cette simulation n'a réalisé aucun lancement.

### Limites et suite utile

Les douze autres nouvelles missions n'ont pas fait l'objet d'une production fraîche dans ce rapport. Les sources complètes du curriculum, cartes, évaluations et corrigés ne sont pas audités. Les messages ont été lus après les premières productions pour conserver un point de comparaison avant exemples ; ce protocole diffère de l'ordre normal d'apprentissage et peut augmenter les incompréhensions initiales. Aucun score ne doit être tiré des six propositions.

Pour une future séance avec de vraies personnes, observer si elles retrouvent la transformation soumise → à traiter après la leçon, distinguent la répétition d'une demande d'une deuxième demande légitime et savent nommer leur interlocuteur technique. Ces observations restent à faire ; elles ne sont pas acquises par cette relecture. Aucun code, contenu pédagogique, configuration ou donnée métier n'a été modifié ; seul ce rapport a été écrit.
