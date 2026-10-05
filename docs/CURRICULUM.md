# Programme pédagogique MemStack

## Périmètre et statut

Ce catalogue fini contient **12 thèmes, 30 parcours et 150 leçons**. Il couvre un socle de développeur web et des approfondissements utiles ; il ne prétend pas couvrir toute l'informatique. Chaque leçon vise une décision ou une explication précise en **3 à 5 minutes**, puis 3 à 5 cartes autonomes. Les listes donnent l'ordre pédagogique et des identifiants stables utilisables dans les données.

Le manifeste `docs/content/curriculum.json` reprend les identifiants, titres, objectifs, prérequis et priorités pour coordonner rédaction, enrichissement et inspection. Les auteurs doivent conserver ces IDs et respecter l'ordre des tableaux `lessons`.

**Bibliothèque rédigée et relue :** les 150 leçons, 450 cartes et 30 schémas sont assemblés dans `src/data/catalog/index.ts`. Le manifeste porte le statut `reviewed` après inspection des dialogues, cartes et illustrations ; les corrections et verdicts sont dans `docs/content/REVIEW.md`. Les durées et la difficulté restent à éprouver en usage réel.

**Disponible dans l’application :** les 30 parcours via `/courses`, avec sélection du parcours actif et découverte quotidienne sur `/today`. Les révisions regroupent les cartes apprises dans tous les parcours. Les trois leçons Docker historiques et leurs neuf cartes conservent leurs IDs et leur progression.

Priorités : **S = socle**, **A = approfondissement**, **P = spécialisation**. Les prérequis décrivent les connaissances attendues, pas un système de verrouillage à implémenter. Les cinq leçons d'un parcours se suivent dans l'ordre indiqué ; un développeur expérimenté peut consulter un approfondissement sans terminer tout le socle.

## Contrat de rédaction et de validation

- Partir d'une situation concrète, faire prévoir un résultat, expliquer avec un exemple, corriger une confusion et conclure sur l'objectif. Mémo peut plaisanter, mais ne remplace pas l'explication.
- Une question de compréhension guide la leçon sans points ni notation de maîtrise. Ses choix doivent être plausibles et ses retours expliquer pourquoi. Les cartes demandent un rappel avant révélation et restent distinctes du dialogue.
- Chaque carte doit être comprise seule : contexte, question précise, réponse courte, idée essentielle identifiable. Éviter les réponses qui exigent cinq commandes, les anecdotes et les pièges de vocabulaire.
- Une image doit expliquer une relation, un trajet ou un changement d'état ; légende et texte alternatif sont obligatoires. Ne pas ajouter une photo décorative à chaque leçon.
- Le modèle actuel accepte `message`, `question` et `image`, des IDs d'étapes et des transitions explicites. Rester compatible avec lui ; ne pas inventer de terminal interactif, de notation automatique ou de nouveau service.
- Vérifier les affirmations avec les sources officielles du parcours. Mentionner versions et conditions quand elles changent la conclusion ; montrer des exemples limités et sûrs. Ne pas confondre défaut d'une bibliothèque et propriété universelle.
- L'inspection vérifie exactitude, objectif réellement enseigné, prérequis, branches accessibles, cartes et charge de lecture. Une leçon à corriger repart à la rédaction avant approbation ; « terminée » ne signifie pas « maîtrisée ».

## 1. Fondamentaux (`fundamentals`)

### Données et raisonnement (`data-reasoning`) — S

Prérequis : savoir lire quelques lignes de code.

- `fund-values-references` — **Valeurs et références** : prévoir si une modification affecte une copie ou l'objet partagé.
- `fund-mutation` — **Mutation et immutabilité** : remplacer une modification cachée par une transformation explicite.
- `fund-collections` — **Choisir une collection** : choisir tableau, ensemble ou dictionnaire selon accès et unicité.
- `fund-complexity` — **Coût d'une boucle** : comparer un parcours linéaire et deux boucles imbriquées lorsque l'entrée grandit.
- `fund-invariants` — **Garder un invariant** : formuler une règle qui doit rester vraie avant et après une opération.

### Processus, fichiers et outils (`systems-basics`) — S

Prérequis : `data-reasoning`.

- `systems-process` — **Processus et ressources** : distinguer programme sur disque et processus avec mémoire et descripteurs.
- `systems-paths` — **Chemins et répertoire courant** : expliquer pourquoi un chemin relatif fonctionne dans un terminal et échoue dans un autre.
- `systems-permissions` — **Permissions des fichiers** : diagnostiquer un refus d'accès sans donner toutes les permissions.
- `systems-environment` — **Variables d'environnement** : distinguer configuration d'un processus et valeur enregistrée dans le code.
- `systems-exit-codes` — **Sortie standard et code de retour** : décider si une commande a réussi sans se fier à un message affiché.

## 2. Web (`web`)

### HTTP et navigation (`http-basics`) — S

Prérequis : `systems-basics`.

- `http-request-response` — **Requête et réponse** : identifier méthode, URL, en-têtes et corps dans un échange HTTP.
- `http-methods-status` — **Méthodes et statuts** : choisir une méthode et interpréter succès, erreur client et erreur serveur.
- `http-dns-tls` — **Du nom au serveur** : ordonner résolution DNS, connexion TLS et échange HTTP sans confondre leurs rôles.
- `http-cookies` — **Cookies et session** : expliquer comment un cookie accompagne une requête selon son domaine et ses attributs.
- `http-cache` — **Cache HTTP** : distinguer réutilisation d'une réponse fraîche et revalidation conditionnelle.

### HTML, CSS et accessibilité (`accessible-ui`) — S

Prérequis : `http-basics`.

- `ui-semantic-html` — **Une action, un vrai bouton** : choisir l'élément HTML qui porte le comportement attendu.
- `ui-box-model` — **La taille réelle d'une boîte** : calculer l'effet du padding et de la bordure selon `box-sizing`.
- `ui-flex-grid` — **Flex ou Grid** : choisir une disposition selon l'axe et les relations entre éléments.
- `ui-responsive` — **Une interface qui rétrécit** : concevoir une mise en page utilisable sans largeur fixe excessive.
- `ui-keyboard-focus` — **Clavier et focus visible** : vérifier ordre de navigation, libellés et accès aux actions sans souris.

### Navigateur et asynchronisme (`browser-runtime`) — A

Prérequis : `javascript-core`, `javascript-async`, `http-basics`.

- `browser-dom-events` — **Événements et propagation** : prévoir quel gestionnaire reçoit un clic avec la propagation dans le DOM.
- `browser-event-loop` — **Tâches et microtâches** : prévoir un ordre simple entre code synchrone, promesse et timer.
- `browser-fetch-errors` — **Les erreurs de fetch** : distinguer rejet réseau et réponse HTTP en erreur.
- `browser-abort` — **Annuler une requête** : utiliser un signal d'annulation sans présenter l'annulation comme un échec serveur.
- `browser-storage` — **Stockage dans le navigateur** : choisir cookie, stockage local ou IndexedDB selon durée, capacité et accès.

## 3. JavaScript et TypeScript (`languages`)

### JavaScript essentiel (`javascript-core`) — S

Prérequis : `data-reasoning`.

- `js-scope` — **Portée et fermeture** : expliquer quelle variable une fonction capture et quand sa valeur est lue.
- `js-equality` — **Comparer sans surprise** : distinguer égalité stricte, conversion implicite et identité d'objet.
- `js-nullish` — **Valeur absente ou valeur fausse** : choisir `??` ou `||` sans perdre zéro ou chaîne vide.
- `js-array-transforms` — **Transformer une liste** : choisir `map`, `filter` ou `find` selon le résultat attendu.
- `js-errors` — **Lever et transmettre une erreur** : conserver une erreur utile sans la transformer silencieusement en succès.

### Promesses et modules (`javascript-async`) — S

Prérequis : `javascript-core`.

- `js-promise` — **Une promesse représente un résultat** : suivre résolution et rejet sans confondre promesse et valeur finale.
- `js-await` — **Attendre au bon endroit** : expliquer ce que suspend `await` et ce qui continue autour.
- `js-concurrency` — **Séquentiel ou concurrent** : lancer ensemble des opérations indépendantes et attendre leurs résultats.
- `js-async-errors` — **Intercepter un rejet** : placer le traitement d'erreur autour de l'opération réellement attendue.
- `js-modules` — **Contrats entre modules** : distinguer export nommé et export par défaut et limiter les dépendances circulaires.

### TypeScript fiable (`typescript-core`) — S

Prérequis : `javascript-core`, notions de JSON.

- `ts-unions` — **Décrire plusieurs états** : modéliser des états exclusifs par une union discriminée.
- `ts-narrowing` — **Réduire un type** : utiliser une vérification réelle pour accéder à une propriété sûre.
- `ts-unknown` — **Une entrée inconnue** : préférer `unknown` à `any` et valider les données externes.
- `ts-generics` — **Relier entrée et sortie** : utiliser un paramètre générique qui conserve une relation utile de types.
- `ts-runtime` — **Les types disparaissent** : expliquer pourquoi une assertion ne valide pas un JSON à l'exécution.

## 4. React (`react`)

### Composants et état (`react-state`) — S

Prérequis : `typescript-core`, `accessible-ui`.

- `react-render` — **Rendre à partir des données** : décrire un composant comme calcul d'interface sans mutation pendant le rendu.
- `react-props-state` — **Props ou état local** : placer une donnée à l'endroit qui maîtrise son changement.
- `react-state-update` — **La mise à jour attend son rendu** : utiliser la forme fonctionnelle lorsque le prochain état dépend du précédent.
- `react-derived-state` — **Calculer plutôt que recopier** : supprimer un état dérivé qui peut diverger de sa source.
- `react-list-keys` — **L'identité d'une ligne** : choisir une clé stable et expliquer une confusion liée à l'index.

### Effets et architecture d'interface (`react-effects`) — A

Prérequis : `react-state`, `javascript-async`.

- `react-effects-sync` — **Un effet synchronise l'extérieur** : distinguer réaction à un événement et synchronisation par effet.
- `react-effect-cleanup` — **Nettoyer une souscription** : associer abonnement et nettoyage pour éviter les doublons.
- `react-dependencies` — **Dépendances et valeurs capturées** : expliquer une valeur périmée sans supprimer arbitrairement une dépendance.
- `react-context` — **Partager une donnée avec Context** : utiliser un contexte pour un besoin partagé sans y mettre toute l'application.
- `react-loading-states` — **Chargement, erreur et résultat** : modéliser une requête sans afficher un ancien résultat comme nouveau.

## 5. Backend et API (`backend`)

### Node.js côté serveur (`node-server`) — S

Prérequis : `javascript-async`, `systems-basics`, `http-basics`.

- `node-runtime` — **Le serveur et sa boucle d'événements** : identifier une opération CPU qui bloque les autres requêtes.
- `node-validation` — **Valider à l'entrée** : rejeter un corps de requête invalide avant la logique métier.
- `node-config` — **Configuration et secrets** : charger une configuration serveur sans exposer un secret au bundle frontend.
- `node-errors` — **Erreur interne, réponse externe** : fournir une erreur API utile sans divulguer pile et informations sensibles.
- `node-shutdown` — **Arrêter proprement** : expliquer comment terminer les requêtes et fermer les ressources lors d'un arrêt.

### Concevoir une API REST (`rest-design`) — S

Prérequis : `http-basics`, `node-server`.

- `rest-resources` — **Nommer une ressource** : construire une URL qui représente un objet plutôt qu'une série d'actions.
- `rest-idempotency` — **Réessayer sans doubler** : distinguer opération idempotente et requête susceptible de créer deux résultats.
- `rest-pagination` — **Parcourir une collection** : expliquer offset et curseur dans une liste qui change.
- `rest-error-contract` — **Un contrat d'erreur stable** : fournir code et détail exploitables sans dépendre du texte d'affichage.
- `rest-evolution` — **Faire évoluer un contrat** : distinguer ajout compatible et changement qui casse un consommateur.

### Travail différé et résilience (`backend-resilience`) — A

Prérequis : `rest-design`, `sql-basics`.

- `backend-timeouts` — **Ne pas attendre indéfiniment** : placer un délai et distinguer expiration locale et résultat distant inconnu.
- `backend-retries` — **Réessayer avec mesure** : choisir les échecs réessayables et une attente progressive bornée.
- `backend-queue` — **Une tâche dans une file** : expliquer producteur, consommateur et accusé de réception.
- `backend-duplicate-jobs` — **Une tâche peut revenir** : concevoir un traitement tolérant une livraison répétée.
- `backend-outbox` — **Écrire puis annoncer** : expliquer pourquoi une écriture DB et un envoi de message peuvent diverger.

## 6. Données (`data`)

### SQL et cohérence (`sql-basics`) — S

Prérequis : `data-reasoning`.

- `sql-keys` — **Clés et contraintes** : exprimer identité, unicité et référence dans le schéma.
- `sql-joins` — **Relier deux tables** : prévoir l'effet d'un `INNER JOIN` et d'un `LEFT JOIN` sur les lignes absentes.
- `sql-null` — **NULL n'est pas une valeur ordinaire** : utiliser `IS NULL` et prévoir un filtre avec valeur inconnue.
- `sql-transactions` — **Tout ou rien** : regrouper deux modifications liées dans une transaction.
- `sql-indexes` — **Un index a un coût** : identifier une recherche aidée par un index et le coût des écritures associées.

### Documents et Firestore (`document-data`) — A

Prérequis : `sql-basics`, `identity-access`.

- `documents-model` — **Regrouper ou référencer** : choisir la frontière d'un document selon les lectures et modifications.
- `documents-denormalization` — **Dupliquer une donnée volontairement** : identifier la lecture gagnée et le risque de copies divergentes.
- `firestore-paths` — **Collections et documents** : expliquer un chemin Firestore sans le confondre avec une arborescence de fichiers.
- `firestore-transactions` — **Concurrence et nouvelle tentative** : éviter un effet externe dans une fonction transactionnelle réexécutée.
- `firestore-rules` — **Règles par propriétaire** : distinguer authentification, autorisation et validation d'un document utilisateur.

## 7. DevOps (`devops`)

### Les bases de Docker (`docker-basics`) — S

Prérequis : `systems-basics`, connaissances HTTP élémentaires pour les ports.

- `docker-images-containers` — **Images et conteneurs** : expliquer pourquoi redémarrer une instance ne remplace pas son image. **Déjà disponible.**
- `docker-volumes-persistence` — **Volumes et persistance** : préserver des données lors du remplacement d'un conteneur. **Déjà disponible.**
- `docker-ports-networks` — **Ports et réseaux** : choisir adresse et port selon un accès hôte ou entre conteneurs. **Déjà disponible.**
- `docker-build-cache` — **Dockerfile et cache de build** : ordonner copie des dépendances et du code pour réutiliser une couche utile.
- `docker-compose` — **Décrire plusieurs services** : lire une configuration Compose et distinguer service, réseau et volume.

### Intégration et livraison (`cicd-basics`) — S

Prérequis : `git-collaboration`, `test-strategy`.

- `cicd-pipeline` — **La chaîne de vérification** : ordonner installation, tests et build avec des conditions d'échec explicites.
- `cicd-lockfile` — **Installer ce qui a été vérifié** : expliquer pourquoi la CI utilise un fichier de verrouillage.
- `cicd-artifact` — **Construire une fois, déployer le résultat** : distinguer artefact de build et reconstruction dans chaque environnement.
- `cicd-secrets` — **Permissions du workflow** : limiter jetons et secrets selon l'événement qui déclenche le workflow.
- `cicd-rollback` — **Revenir à une version connue** : définir un retour arrière qui tient compte des migrations et de la configuration.

### Cloud essentiel (`cloud-basics`) — A

Prérequis : `http-basics`, `docker-basics`, `identity-access`.

- `cloud-responsibility` — **Qui gère quoi ?** : distinguer responsabilités de l'utilisateur et du fournisseur selon le service.
- `cloud-compute` — **Choisir le mode d'exécution** : comparer VM, conteneur géré et fonction pour un besoin donné.
- `cloud-regions` — **Région et disponibilité** : distinguer proximité géographique et isolation des défaillances.
- `cloud-iam` — **Une identité pour un service** : préférer une identité avec permissions limitées à une clé partagée.
- `cloud-cost` — **Comprendre une facture variable** : identifier calcul, stockage et transfert dans un scénario de consommation.

### Infrastructure avec Terraform (`terraform-basics`) — P

Prérequis : `cloud-basics`, `git-collaboration`.

- `terraform-state` — **Code et état de l'infrastructure** : expliquer le rôle de l'état dans le lien entre configuration et ressources.
- `terraform-plan` — **Lire avant d'appliquer** : repérer création, modification et remplacement dans un plan.
- `terraform-variables` — **Paramétrer un environnement** : distinguer variable d'entrée et valeur calculée de sortie.
- `terraform-locking` — **Partager l'état sans collision** : expliquer stockage distant et verrouillage des opérations concurrentes.
- `terraform-drift` — **Une modification hors Terraform** : identifier une dérive et décider comment réconcilier code et réalité.

### Kubernetes essentiel (`kubernetes-basics`) — P

Prérequis : `docker-basics`, `cloud-basics`.

- `k8s-pod` — **Le Pod comme unité** : distinguer Pod et conteneur et expliquer le partage du réseau.
- `k8s-deployment` — **Déclarer le nombre souhaité** : expliquer comment un Deployment maintient des réplicas.
- `k8s-service` — **Une adresse stable** : expliquer comment un Service cible des Pods par sélection.
- `k8s-probes` — **Prêt ou vivant ?** : choisir readiness ou liveness sans redémarrer un service simplement occupé.
- `k8s-resources` — **Demandes et limites** : distinguer réservation pour le placement et contraintes d'exécution.

### Observabilité (`observability-basics`) — A

Prérequis : `node-server`, `rest-design`.

- `obs-signals` — **Logs, métriques et traces** : choisir le signal adapté à une question d'exploitation.
- `obs-structured-logs` — **Retrouver une requête** : relier des événements avec un identifiant de corrélation sans journaliser un secret.
- `obs-latency` — **La moyenne cache une queue lente** : interpréter un percentile de latence avec sa population et sa fenêtre.
- `obs-cardinality` — **Une métrique qui explose** : repérer un label à forte cardinalité et choisir une alternative.
- `obs-alerts` — **Une alerte actionnable** : définir symptôme, seuil, durée et action attendue.

### Fiabilité et incidents (`sre-basics`) — P

Prérequis : `observability-basics`, `backend-resilience`.

- `sre-sli-slo` — **Mesure et objectif de service** : distinguer SLI, SLO et engagement contractuel.
- `sre-error-budget` — **Le budget d'erreur** : relier un objectif de fiabilité et une décision de livraison.
- `sre-incident` — **Trier pendant un incident** : privilégier atténuation et communication avant recherche exhaustive de la cause.
- `sre-postmortem` — **Apprendre d'une panne** : décrire faits, facteurs et actions vérifiables sans chercher un coupable.
- `sre-restore` — **Une sauvegarde restaurable** : distinguer existence d'une copie et preuve de restauration avec délai acceptable.

## 8. Sécurité (`security`)

### Identité et contrôle d'accès (`identity-access`) — S

Prérequis : `http-basics`.

- `security-authn-authz` — **Identité et permission** : expliquer pourquoi être connecté ne donne pas accès aux données d'autrui.
- `security-object-access` — **Vérifier chaque objet** : contrôler le propriétaire côté autorité de données plutôt que cacher un bouton.
- `security-session-tokens` — **Session et jeton** : distinguer validation d'un jeton, expiration et révocation.
- `security-oauth-oidc` — **Autoriser ou identifier** : distinguer rôle d'OAuth et rôle d'OpenID Connect dans une connexion.
- `security-least-privilege` — **La permission minimale** : limiter portée et durée d'une identité humaine ou technique.

### Sécurité des entrées et du navigateur (`web-security`) — S

Prérequis : `identity-access`, `accessible-ui`, `sql-basics`.

- `security-injection` — **Données ou instruction SQL** : choisir une requête paramétrée plutôt qu'une concaténation.
- `security-xss` — **Du texte devient du script** : identifier un contexte de sortie dangereux et traiter du HTML non fiable.
- `security-csrf` — **Une requête avec les cookies d'autrui** : expliquer une attaque CSRF et une protection adaptée.
- `security-cors` — **Ce que CORS contrôle** : distinguer lecture autorisée par le navigateur et permission d'accès côté serveur.
- `security-dependencies` — **Une dépendance vulnérable** : évaluer usage réel, version corrigée et impact sans ignorer une alerte.

## 9. Tests (`testing`)

### Stratégie et tests utiles (`test-strategy`) — S

Prérequis : `javascript-core`, fonctions simples.

- `tests-unit-integration` — **Choisir la frontière du test** : distinguer fonction isolée, intégration réelle et parcours utilisateur.
- `tests-boundaries` — **Tester les limites** : choisir des cas à la frontière et des entrées invalides plutôt que répéter le cas nominal.
- `tests-determinism` — **Le temps sans attendre** : injecter horloge et hasard pour rendre un test reproductible.
- `tests-doubles` — **Un double qui peut mentir** : utiliser un faux ciblé sans considérer son succès comme preuve du service réel.
- `tests-regression` — **Transformer un bug en preuve** : écrire un test qui échoue sur la version fautive et protège un comportement utile.

## 10. Architecture (`architecture`)

### Responsabilités et contrats (`architecture-boundaries`) — S

Prérequis : `typescript-core`, `rest-design`.

- `arch-domain-ui` — **Règle métier ou affichage** : isoler une règle testable de l'interface qui la présente.
- `arch-dependencies` — **Une dépendance orientée** : choisir une frontière qui évite qu'un détail de stockage dicte la règle métier.
- `arch-contracts` — **Le contrat d'un module** : exposer une capacité précise plutôt que son état interne complet.
- `arch-state-machine` — **Des états autorisés** : représenter états et transitions pour empêcher une combinaison incohérente.
- `arch-adr` — **Garder la raison d'un choix** : consigner contexte, décision et conséquences dans une note concise.

### Architecture distribuée (`distributed-basics`) — A

Prérequis : `architecture-boundaries`, `backend-resilience`, `sql-basics`.

- `dist-monolith` — **Le coût d'une séparation** : choisir un monolithe modulaire lorsque les frontières et besoins ne justifient pas des services.
- `dist-consistency` — **Une donnée temporairement différente** : expliquer une cohérence éventuelle dans un scénario concret de réplication.
- `dist-concurrent-writes` — **Deux écritures concurrentes** : comparer écrasement, version attendue et fusion selon le sens métier.
- `dist-cache-invalidation` — **Une copie devenue ancienne** : définir quand expirer ou invalider une donnée mise en cache.
- `dist-time-order` — **L'heure ne prouve pas l'ordre** : identifier une ambiguïté causée par horloges client et délais réseau.

## 11. Performance (`performance`)

### Mesurer et accélérer (`performance-basics`) — A

Prérequis : `browser-runtime`, `react-state`, `sql-basics`.

- `perf-measure` — **Trouver le vrai goulot** : mesurer un parcours avant de choisir une optimisation.
- `perf-web-vitals` — **Chargement et réactivité perçus** : distinguer LCP, INP et CLS avec un exemple utilisateur.
- `perf-bundle` — **Charger ce qui est nécessaire** : identifier un gros module et un découpage de chargement pertinent.
- `perf-images` — **Une image adaptée à l'écran** : choisir dimensions, format et chargement sans retarder inutilement l'élément principal.
- `perf-n-plus-one` — **Une requête par ligne** : repérer le motif N+1 et regrouper une lecture sans charger toute la base.

## 12. Pratiques de développement (`engineering`)

### Git et collaboration (`git-collaboration`) — S

Prérequis : `systems-basics`.

- `git-working-tree` — **Travail, index et commit** : distinguer modification locale, contenu préparé et historique enregistré.
- `git-small-commits` — **Un changement relisible** : former un commit cohérent avec un sujet qui explique l'action.
- `git-merge-rebase` — **Relier deux historiques** : expliquer différence entre fusion et réécriture sans réécrire une branche partagée.
- `git-conflicts` — **Résoudre le sens d'un conflit** : vérifier le comportement combiné au-delà de la suppression des marqueurs.
- `git-review` — **Relire pour décider** : vérifier intention, comportement et preuves dans une pull request.

### Diagnostic et maintenance (`maintenance-basics`) — S

Prérequis : `javascript-core`, `git-collaboration`, `test-strategy`.

- `debug-reproduce` — **Un bug reproductible** : réduire environnement, données et étapes à un scénario précis.
- `debug-hypothesis` — **Une hypothèse à la fois** : choisir une observation qui distingue deux causes possibles.
- `debug-stack-trace` — **Lire une pile d'erreur** : retrouver origine et propagation sans confondre le dernier appel et la cause.
- `maintenance-refactor` — **Changer la structure avec un filet** : séparer correction métier et refactoring pour garder une preuve compréhensible.
- `maintenance-upgrade` — **Mettre à jour une dépendance** : lire changements incompatibles, migrer et vérifier le comportement utilisé.

## Ordre de production recommandé

1. Réviser les trois leçons Docker existantes sans changer leurs IDs ; vérifier leurs cartes et ajouter les deux leçons restantes du catalogue comme contenu distinct de l'actuel parcours publié.
2. Produire le socle : données, systèmes, JavaScript essentiel, HTTP, asynchronisme, TypeScript, interface accessible, Git, tests, React et identité.
3. Produire Node, REST, SQL, sécurité web, architecture et maintenance ; ils donnent les prérequis aux approfondissements.
4. Produire navigateur, effets React, documents/Firestore, CI/CD, résilience, observabilité et performance.
5. Produire cloud, architecture distribuée, puis Terraform, Kubernetes et SRE selon les prérequis indiqués.

Les lots servent à répartir rédaction et inspection. Ils ne limitent pas la demande de rédaction du catalogue entier : chaque entrée doit recevoir un dialogue, des cartes et une vérification. L'activation de plusieurs parcours dans l'application sera une tranche fonctionnelle séparée ; ne pas annoncer 150 leçons accessibles avant son implémentation.

## Références primaires pour les auteurs

Les liens sont des points d'entrée, pas une certification automatique de chaque leçon. Associer à chaque contenu le chapitre qui soutient ses affirmations, la date de consultation et les limites pertinentes. L'inspection doit ouvrir les sources réellement utilisées.

- Fondamentaux et navigateur : [MDN Web Docs](https://developer.mozilla.org/fr/docs/Web), [WHATWG HTML](https://html.spec.whatwg.org/), [HTTP Semantics RFC 9110](https://www.rfc-editor.org/rfc/rfc9110), [HTTP Caching RFC 9111](https://www.rfc-editor.org/rfc/rfc9111).
- JavaScript et TypeScript : [ECMAScript](https://tc39.es/ecma262/), [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html).
- Interface et React : [React Learn](https://react.dev/learn), [WAI Tutorials](https://www.w3.org/WAI/tutorials/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- Backend et données : [Node.js](https://nodejs.org/en/learn), [PostgreSQL](https://www.postgresql.org/docs/current/), [Firestore](https://firebase.google.com/docs/firestore).
- DevOps : [Docker](https://docs.docker.com/), [GitHub Actions](https://docs.github.com/en/actions), [Google Cloud](https://cloud.google.com/docs), [Terraform](https://developer.hashicorp.com/terraform/docs), [Kubernetes](https://kubernetes.io/docs/).
- Observabilité et fiabilité : [OpenTelemetry](https://opentelemetry.io/docs/), [Prometheus](https://prometheus.io/docs/), [Google SRE Books](https://sre.google/books/).
- Sécurité : [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/), [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html), [OAuth RFC 6749](https://www.rfc-editor.org/rfc/rfc6749).
- Tests et pratiques : [Node.js Test Runner](https://nodejs.org/api/test.html), [Git Book](https://git-scm.com/book/fr/v2), [web.dev](https://web.dev/learn).

## Règle d'évolution du catalogue

Garder les IDs d'une leçon et de ses cartes quand le concept reste le même pour préserver la progression. Un remplacement de concept demande un nouvel ID et une décision explicite sur l'ancien contenu. Ajouter une leçon seulement si elle apporte un objectif distinct ; une commande supplémentaire ou un nouveau mot ne suffit pas. Une limite trouvée pendant l'inspection peut conduire à scinder, resserrer ou retirer une entrée, avec mise à jour du décompte et du registre de validation.
