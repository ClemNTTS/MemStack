# Inspection pédagogique du catalogue

## Méthode et périmètre

Inspection du 5 octobre 2026 : programme, puis lecture de chaque dialogue, choix, retour et carte. Les schémas sont contrôlés avec leur légende et alternative textuelle. Les tests de types et de graphes ne prouvent pas la justesse pédagogique. Une validation porte sur le contenu relu, pas sur la maîtrise d'un apprenant ; les durées demandent encore un essai avec des utilisateurs.

Verdict final : les **150 leçons et 450 cartes** ont été relues intégralement ; les corrections demandées ont été reprises puis contrôlées. Aucune réserve de contenu bloquante ne reste ouverte. Les 150 IDs du programme correspondent exactement aux 150 lignes du registre, sans doublon. Les 30 schémas sont validés sémantiquement ; leur rendu mobile et les essais d'apprentissage restent des contrôles distincts.

## Programme

Les 150 objectifs des 30 parcours sont distincts et assez resserrés pour une session courte. Les tableaux thématiques ne constituent pas un ordre global : suivre les prérequis et l'ordre de production de `CURRICULUM.md`. HTTP enseigne le protocole, REST ses conséquences sur un contrat métier ; préserver cette frontière pour éviter les doublons. Les transactions SQL, transactions Firestore et écritures distribuées ont également des contextes différents.

Correction demandée puis vérifiée : `javascript-async` ajouté aux prérequis de `browser-runtime` (promesses, fetch, annulation et microtâches).

## Sources de contrôle

Sources primaires consultées directement : [cache HTTP RFC 9111](https://www.rfc-editor.org/info/rfc9111/), [effets React](https://react.dev/learn/you-might-not-need-an-effect), [transactions Firestore](https://firebase.google.com/docs/firestore/manage-data/transactions), [probes Kubernetes](https://kubernetes.io/docs/concepts/workloads/pods/probes/), [verrouillage Terraform](https://developer.hashicorp.com/terraform/language/state/locking), [comparaisons SQL et NULL](https://www.postgresql.org/docs/current/functions-comparison.html), [prévention CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html). Le chargement direct de RFC 9110 a échoué ; une référence non chargée n'est pas comptée comme vérifiée.

## Registre par leçon

« Relu » signifie dialogue et cartes contrôlés ; les visuels font l'objet d'un contrôle séparé ci-dessous. Les réserves bloquantes sont explicitement indiquées.

| Leçon | Verdict et contrôle spécifique |
| --- | --- |
| `fund-values-references` | Relu après correction : création de `b` avant `const`, copie superficielle et identité correctement séparées. |
| `fund-mutation` | Relu : tri sur copie, limites de l'immuabilité, mutation locale autorisée. |
| `fund-collections` | Relu : tableau/Set/Map, identité des objets dans Set précisée. |
| `fund-complexity` | Relu : croissance quadratique, distinction boucles imbriquées/successives et longueur fixe. |
| `fund-invariants` | Relu après correction : transaction seule insuffisante ; verrouillage ou écriture conditionnelle adaptés nécessaires. |
| `systems-process` | Relu : programme/processus, espaces mémoire et conflit de socket distingués. |
| `systems-paths` | Relu : cwd/module, URL ES et résolution de chemin illustrés. |
| `systems-permissions` | Relu : mode Unix 640, traversée des parents, ACL et Windows explicités. |
| `systems-environment` | Relu : chaînes/undefined, validation, héritage au lancement et secret frontend. |
| `systems-exit-codes` | Relu : code de retour plutôt que texte ou stderr ; limites des pipelines précisées. |
| `docker-images-containers` | Relu après correction : code intégré à l'image sans montage source explicité, build/recréation enseignés sur le fil commun. |
| `docker-volumes-persistence` | Dialogue/cartes existants relus : arrêt/suppression, montage au bon chemin et persistance ≠ sauvegarde. |
| `docker-ports-networks` | Dialogue/cartes existants relus : hôte/interne, interface joignable, EXPOSE, réseau bridge personnalisé. |

Contrôles complémentaires : [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set), [process Node](https://nodejs.org/api/process.html), [modules ES Node](https://nodejs.org/api/esm.html#importmetaurl), [isolation PostgreSQL](https://www.postgresql.org/docs/current/transaction-iso.html), [volumes Docker](https://docs.docker.com/engine/storage/volumes/), [publication de ports](https://docs.docker.com/engine/network/port-publishing/), [bridge personnalisé](https://docs.docker.com/engine/network/drivers/bridge/).

### Tests et performance — contrôle intégral

| Leçon | Verdict et contrôle spécifique |
| --- | --- |
| `tests-unit-integration` | Relu : frontière du risque et aller-retour stockage réellement visé, limites des E2E. |
| `tests-boundaries` | Relu : égalité distingue `<` et `≤`, partitions vides et invalides utiles. |
| `tests-determinism` | Relu : horloge/hasard injectés, restauration et fuseau local précisés. |
| `tests-doubles` | Relu : doubles utiles pour scénarios, sans preuve des règles du service réel. |
| `tests-regression` | Relu : test doit distinguer version fautive/corrigée, limites si non reproductible. |
| `perf-measure` | Relu après correction : scénario et schéma alignés sur 80/400/60 ms et priorité téléchargement du bundle. |
| `perf-web-vitals` | Relu : LCP/INP/CLS distingués, mesures terrain/laboratoire et diagnostic contextualisés. |
| `perf-bundle` | Relu : chargement conditionnel, erreurs d'import et coût des cascades précisés. |
| `perf-images` | Relu : densité/taille, ratio réservé, lazy hors écran plutôt que contenu principal. |
| `perf-n-plus-one` | Relu : lecture groupée bornée, multiplication des lignes et exécution réelle d'ANALYZE. |

## Visuels : contrôle sémantique

- `docker-volumes-persistence` : emplacement `volume` désignait un choix, pas une étape ; corrigé en `example`.
- `dist-cache-invalidation` : contrôle de validité/expiration ajouté au schéma et à l'alternative textuelle ; revérifié.
- `js-promise` : flèche `resolve` remplacée par `valeur finale`, car une résolution peut adopter une promesse encore pending ; revérifié selon [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
- `fund-values-references` : valeurs du dessin alignées sur l'exemple (1 → 2).

Les textes, titres, descriptions, alternatives et légendes des 30 SVG finaux ont été lus, ainsi que les 30 propositions de questions dans `VISUALS.md`. Les relations sont pédagogiquement cohérentes après corrections. Le rendu à petite taille est une vérification visuelle distincte ; la lecture XML ne le certifie pas.

### Web — contrôle intégral

| Leçon | Verdict et contrôle spécifique |
| --- | --- |
| `http-request-response` | Relu : Accept/Content-Type, méthode/représentation et issue correctement séparés. |
| `http-methods-status` | Relu : méthodes sûres, 204 vide, familles de statuts et logs GET précisés. |
| `http-dns-tls` | Relu : rôles et ordre simplifié, caches/réutilisation/HTTP3 explicités. |
| `http-cookies` | Relu : HttpOnly/Secure/SameSite distincts, session encore validée côté serveur. |
| `http-cache` | Relu : fraîcheur, ETag/304, no-cache/no-store et private correctement distingués. |
| `ui-semantic-html` | Relu : action/navigation, button explicite dans formulaire et limite d'ARIA. |
| `ui-box-model` | Relu : 224 px calculés correctement, marges hors border-box et débordements contextualisés. |
| `ui-flex-grid` | Relu : axes/pistes, lignes flex indépendantes et ordre clavier préservé. |
| `ui-responsive` | Relu : breakpoint dicté par contenu, zoom/titres longs et maintien des actions. |
| `ui-keyboard-focus` | Relu : focus visible, nom accessible, dialogue et pièges tabindex. |
| `browser-dom-events` | Relu : cible/currentTarget, stopPropagation/preventDefault et événements non bouillonnants. |
| `browser-event-loop` | Relu : A,D,C,B, portée navigateur et famine par microtâches explicitées. |
| `browser-fetch-errors` | Relu : statut reçu/rejet réseau, parsing/validation métier distincts. |
| `browser-abort` | Relu : annulation client ne garantit pas rollback serveur, réponse périmée contrôlée. |
| `browser-storage` | Relu : localStorage/IndexedDB/cookies, quotas/effacement et absence de synchronisation implicite. |

Sources complémentaires : [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), [annulation](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort), [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie).

### Corrections transversales

`perf-measure` : exemple et question désormais alignés avec la figure (80 + 400 + 60 = 540 ms, priorité téléchargement du bundle). Version corrigée relue ; réserve levée.

Position des choix : correction revérifiée dans l'assembleur ; la parité d'une somme dérivée de l'ID varie de façon déterministe la position correcte. Le lecteur ne peut plus réussir tout le catalogue en choisissant systématiquement la première option.

### JavaScript et TypeScript — contrôle intégral

| Leçon | Verdict et contrôle spécifique |
| --- | --- |
| `js-scope` | Relu : liaisons lexicales relues, paramètres distincts et références objet non figées. |
| `js-equality` | Relu : conversion/identité mémoire/identité métier, NaN et règles propres à Set. |
| `js-nullish` | Relu : absence null/undefined distincte des valeurs falsy, aucun substitut à validation. |
| `js-array-transforms` | Relu : résultats map/filter/find et mutation possible par callback. |
| `js-errors` | Relu : propagation/récupération réelle, cause et danger du return dans finally. |
| `js-promise` | Relu : états, valeur finale, rejet await et absence d'annulation universelle. |
| `js-await` | Relu : continuation suspendue, retour Promise et CPU synchrone restent distincts. |
| `js-concurrency` | Relu : all/allSettled, indépendance, limites de concurrence et aucune annulation implicite. |
| `js-async-errors` | Relu : rejet attendu dans try, stratégie supérieure et tâche de fond suivie. |
| `js-modules` | Relu : named/default, liaisons ES et risque conditionnel des cycles. |
| `ts-unions` | Relu : états exclusifs avec données propres, validation runtime toujours requise. |
| `ts-narrowing` | Relu : vérification réelle, assertion sans conversion, garde honnête et falsy. |
| `ts-unknown` | Relu : typeof null et contrôle de propriété, contraintes métier après structure. |
| `ts-generics` | Relu : relation entrée/sortie, tableau vide et contrainte structurelle. |
| `ts-runtime` | Relu : annotations/assertions retirées, validation à frontière, schéma/type à maintenir. |

Sources complémentaires : [narrowing TypeScript](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), [génériques](https://www.typescriptlang.org/docs/handbook/2/generics.html), [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Toutes les branches rejoignent un fil commun qui enseigne les notions demandées par les cartes.

### React — contrôle intégral

| Leçon | Verdict et contrôle spécifique |
| --- | --- |
| `react-render` | Relu après correction : distracteur plausible sur rendu unique ; distinction rendu/commit et pureté justes. |
| `react-props-state` | Relu : propriétaire commun proche, état local conserve sa portée. |
| `react-state-update` | Relu : snapshot, composition d'updaters purs et développement contextualisés. |
| `react-derived-state` | Relu : calcul depuis causes, brouillon volontairement divergent reconnu. |
| `react-list-keys` | Relu : identité parmi frères, index/aléatoire et key non transmise comme prop. |
| `react-effects-sync` | Relu : événement/synchronisation/calcul séparés et cycle StrictMode contextualisé. |
| `react-effect-cleanup` | Relu après correction : `[roomId, onMessage]`, origine des valeurs explicitée ; nettoyage type/capture correct. |
| `react-dependencies` | Relu : liaison capturée, synchronisation et construction d'objet dans effet. |
| `react-context` | Relu : partage sans persistance implicite, portée et responsabilité limitées. |
| `react-loading-states` | Relu : identité/génération, ordre des réponses et ancien contenu explicitement annoncé. |

Sources : [état snapshot](https://react.dev/learn/state-as-a-snapshot), [file de mises à jour](https://react.dev/learn/queueing-a-series-of-state-updates), [effets nécessaires](https://react.dev/learn/you-might-not-need-an-effect). Demandes de correction transmises au rédacteur avant validation de ces deux entrées.

### Pratiques de développement — contrôle intégral

| Leçon | Verdict et contrôle spécifique |
| --- | --- |
| `git-working-tree` | Relu : index après add, changements ultérieurs, staged diff et options explicitement exclus. |
| `git-small-commits` | Relu : intention cohérente plutôt que ligne unique, preuves et conventions d'équipe. |
| `git-merge-rebase` | Relu : nouveaux commits de rebase, collaboration et exception fast-forward. |
| `git-conflicts` | Relu : intentions combinées, marqueurs insuffisants et règle ambiguë à clarifier. |
| `git-review` | Relu après correction : distracteur plausible quantité de tests sans scénario ; preuve proportionnée au risque. |
| `debug-reproduce` | Relu : état/instant/fuseau, réduction préservant cause et intermittence honnête. |
| `debug-hypothesis` | Relu : observation discriminante, frontières et absence de conclusion universelle. |
| `debug-stack-trace` | Relu : point d'échec/chemin/cause distincts, source maps et limites async. |
| `maintenance-refactor` | Relu : contrat observable et limites des tests verts, changement métier séparé. |
| `maintenance-upgrade` | Relu : types/comportement, transitives, lockfile et installation propre. |

Sources complémentaires : [index et commits Git](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository), [rebase](https://git-scm.com/book/en/v2/Git-Branching-Rebasing), [EXPLAIN PostgreSQL](https://www.postgresql.org/docs/current/using-explain.html), [HTTP 9110](https://httpwg.org/specs/rfc9110.html), [dialogue et focus WAI](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). RFC 9110 finalement chargé via HTTP Working Group après l'échec du premier hébergeur.

### Backend et API — contrôle intégral

| Leçon | Verdict et contrôle spécifique |
| --- | --- |
| `node-runtime` | Relu : attente async et CPU séparés, pool/workers et capacité non infinie. |
| `node-validation` | Relu : structure/limites/champs, identité sans confiance sur corps et taille bornée. |
| `node-config` | Relu : exposition Vite, clé privée serveur et configuration publique Firebase distinctes. |
| `node-errors` | Relu : contrat public/logs privés, corrélation et erreurs de validation utiles. |
| `node-shutdown` | Relu : admission/drainage/délai/fermeture, interruption possible et reprise nécessaires. |
| `rest-resources` | Relu après correction : confusion plausible collection/élément, cible précise expliquée. |
| `rest-idempotency` | Relu : effet et réponse séparés, clé server-side atomique, portée et compatibilité. |
| `rest-pagination` | Relu : offset/cursor et tri complet, absence de snapshot implicite. |
| `rest-error-contract` | Relu : code stable/texte, inconnu traité, détails privés exclus. |
| `rest-evolution` | Relu : champs et enum, tolérance des consommateurs et sens du contrat. |
| `backend-timeouts` | Relu : observation locale ≠ absence d'effet distant, budgets et reprise. |
| `backend-retries` | Relu : transitoire/autorisation, idempotence, jitter/bornes et couches cumulées. |
| `backend-queue` | Relu : publication durable avant acceptation, ack après effet durable, broker contextualisé. |
| `backend-duplicate-jobs` | Relu : au moins une fois, mémoire insuffisante, effet/preuve atomiques et concurrence. |
| `backend-outbox` | Relu : dual write, transaction métier+événement, relais et doublons toujours possibles. |

Sources complémentaires : [boucle Node et pool](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop), [outbox transactionnelle](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html). Les réessais ne sont jamais présentés comme une garantie universelle de succès.

Corrections React `react-render` et `react-effect-cleanup` revérifiées : distracteur rendu unique plausible, dépendances `[roomId, onMessage]` avec origine explicite des valeurs ; réserves levées. Correction `git-review` revérifiée : demande de volume de tests sans risque identifié ; réserve levée.

### Sécurité — contrôle intégral

| Leçon | Verdict et contrôle spécifique |
| --- | --- |
| `security-authn-authz` | Relu : identité/action/ressource, autorité des données et refus par défaut. |
| `security-object-access` | Relu : UUID ne remplace pas permission, ownerId client non fiable, opération groupée. |
| `security-session-tokens` | Relu : décodage/vérification/révocation, issuer/audience/expiration et copie volée. |
| `security-oauth-oidc` | Relu : délégation/identité, ID Token/access token et destinataires distincts. |
| `security-least-privilege` | Relu : rôle/ressource/durée, identité distincte et réexamen des droits. |
| `security-injection` | Relu : liaison par pilote, paramètres de valeurs ≠ identifiants SQL, allowlist de tri. |
| `security-xss` | Relu : contexte de sortie, textContent/innerHTML, sanitisation et CSP complémentaire. |
| `security-csrf` | Relu : cookies attachés/contextes, jeton/framework/SameSite/origine et limites de CORS. |
| `security-cors` | Relu : exposition au script, requête envoyée/preflight, client hors navigateur et credentials. |
| `security-dependencies` | Relu : version/usage/exposition, correction contrôlée, mitigation suivie et scanner limité. |

Sources de contrôle : [OWASP autorisation](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html), [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS). Les chapitres consultés par l'auteur sont aussi recensés dans SOURCES.md.

### Données — contrôle intégral

| Leçon | Verdict et contrôle spécifique |
| --- | --- |
| `sql-keys` | Relu : primary/unique/foreign, NULL distinct PostgreSQL et concurrence de disponibilité. |
| `sql-joins` | Relu après correction : chaîne SQL en apostrophes ; LEFT/INNER, cardinalité et ON/WHERE justes. |
| `sql-null` | Relu : inconnue/true, IS NULL, OR cas absent et COALESCE sens métier. |
| `sql-transactions` | Relu : atomicité ≠ isolation, effets externes non annulés et transactions courtes. |
| `sql-indexes` | Relu : selectivité/coût entretien, plan choisi et ANALYZE exécution réelle. |
| `documents-model` | Relu : frontière selon lecture/modification/croissance/permissions, historique borné. |
| `documents-denormalization` | Relu : copie/source, actualisation et instantané historique volontairement figé. |
| `firestore-paths` | Relu : alternance, parent absent possible et suppression non récursive. |
| `firestore-transactions` | Relu : tentatives réexécutées sans effet externe, SDK Web lectures avant écritures et offline refusé. |
| `firestore-rules` | Relu : propriétaire/types, règles non filtres et SDK serveur/IAM distincts. |

Sources : [contraintes PostgreSQL](https://www.postgresql.org/docs/current/ddl-constraints.html), [jointures](https://www.postgresql.org/docs/current/tutorial-join.html), [transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html), [modèle Firestore](https://firebase.google.com/docs/firestore/data-model), [conditions de règles](https://firebase.google.com/docs/firestore/security/rules-conditions). Correction SQL transmise au rédacteur.

### Architecture — contrôle intégral

| Leçon | Verdict et contrôle spécifique |
| --- | --- |
| `arch-domain-ui` | Relu après précision : vingt-quatre heures, fonction pure réutilisable et sécurité frontend limitée. |
| `arch-dependencies` | Relu : traduction SDK/domaine, abstraction proportionnée, garanties de stockage explicites. |
| `arch-contracts` | Relu : opérations/erreurs/effets, état mutable et readonly non gel runtime. |
| `arch-state-machine` | Relu : états exclusifs/transitions, génération des réponses et ancien contenu explicite. |
| `arch-adr` | Relu après correction : règles appliquées par Firestore aux requêtes des clients, conséquences et réexamen explicites. |
| `dist-monolith` | Relu : modularité avant déploiements distincts, isolation et coûts conditionnels. |
| `dist-consistency` | Relu : lecture ancienne, convergence sous conditions et aucun délai universel. |
| `dist-concurrent-writes` | Relu : version conditionnelle atomique, reprise et fusion selon sens métier. |
| `dist-cache-invalidation` | Relu : TTL/invalidation, remplissage concurrent et absence de garantie magique. |
| `dist-time-order` | Relu : horloges/délais/causalité, version d'autorité et durée monotone distinctes. |

Le schéma cache corrigé est aligné avec le contrôle de validité de ce dialogue. Contrôles complémentaires : [cache-aside et ordre d'invalidation](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside), [horloge monotone locale](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now), [cohérence des lectures](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html). Les corrections SQL, ADR et vingt-quatre heures ont été revérifiées dans les fichiers.

### Docker, CI/CD et cloud — contrôle intégral

| Leçon | Verdict et contrôle spécifique |
| --- | --- |
| `docker-build-cache` | Relu : dépendances avant sources, invalidation des couches et reproductibilité distinctes. |
| `docker-compose` | Relu : services/réseau/volume, démarrage ≠ disponibilité et attente configurée. |
| `cicd-pipeline` | Relu : dépendances entre validation et publication, failure bloquante et preuves proportionnées. |
| `cicd-lockfile` | Relu : plages/résolution, npm ci vérifie l'accord et autres sources de variation explicites. |
| `cicd-artifact` | Relu : artefact testé livré, identité et configuration d'environnement distinctes. |
| `cicd-secrets` | Relu : code non fiable et autorité du workflow, droits limités et journaux protégés. |
| `cicd-rollback` | Relu : retour du code ≠ retour des données, migration compatible et chemin de reprise. |
| `cloud-responsibility` | Relu : gestion fournisseur et sécurité des données/configuration client séparées. |
| `cloud-compute` | Relu : exécution gérée, état local éphémère, concurrence et limites selon produit. |
| `cloud-regions` | Relu : proximité et résilience, réplication/configuration explicites sans garantie automatique. |
| `cloud-iam` | Relu : identités distinctes, permissions adaptées et clé partagée difficile à révoquer. |
| `cloud-cost` | Relu : dimensions de facture, budgets ≠ plafond automatique et bornes à configurer. |

Sources de contrôle : [cache Docker](https://docs.docker.com/build/cache/invalidation/), [ordre Compose](https://docs.docker.com/compose/how-tos/startup-order/), [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/), [sécurité Actions](https://docs.github.com/en/actions/reference/security/secure-use), [budgets Google Cloud](https://docs.cloud.google.com/billing/docs/how-to/budgets).

### Terraform et Kubernetes — contrôle intégral

| Leçon | Verdict et contrôle spécifique |
| --- | --- |
| `terraform-state` | Relu : adresses/objets gérés, sensitive ne retire pas les valeurs de l'état. |
| `terraform-plan` | Relu : proposition/remplacement et échec possible, plan enregistré sensible. |
| `terraform-variables` | Relu : entrée/local/sortie, valeur inconnue et fichier distinct sans protection implicite. |
| `terraform-locking` | Relu : backend et verrouillage distincts, propriétaire vérifié avant force-unlock. |
| `terraform-drift` | Relu après correction : plan refresh-only propose la mise à jour, application l'enregistre ; aucun changement automatique de configuration. Dérive/intention/import justes. |
| `k8s-pod` | Relu : réseau/ports partagés, volumes configurés et placement de services liés. |
| `k8s-deployment` | Relu : déclaration/réconciliation/disponibilité, ReplicaSet et rollout sans garantie métier. |
| `k8s-service` | Relu : cible stable, sélecteur et port/targetPort, ClusterIP interne par défaut. |
| `k8s-probes` | Relu : readiness/liveness/startup distinctes, action proportionnée et panne en cascade. |
| `k8s-resources` | Relu : requests déclarées/placement, CPU throttlé et mémoire pouvant finir OOM. |

Sources de contrôle : [état Terraform](https://developer.hashicorp.com/terraform/language/state), [plan](https://developer.hashicorp.com/terraform/cli/commands/plan), [verrouillage](https://developer.hashicorp.com/terraform/language/state/locking), [Pods](https://kubernetes.io/docs/concepts/workloads/pods/), [ressources Kubernetes](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/), [probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/).

### Observabilité et SRE — contrôle intégral

| Leçon | Verdict et contrôle spécifique |
| --- | --- |
| `obs-signals` | Relu : population/événement/trajet, spans et absence de preuve négative par échantillonnage. |
| `obs-structured-logs` | Relu : champs/corrélation, secret exclu, rétention et données personnelles limitées. |
| `obs-latency` | Relu : p95 défini par population/fenêtre, moyenne de percentiles invalide et estimation. |
| `obs-cardinality` | Relu : combinaisons multiplicatives, route normalisée et détail dans logs/traces. |
| `obs-alerts` | Relu : symptôme/action/seuil/durée, volume significatif et CPU sans preuve d'impact. |
| `sre-sli-slo` | Relu : mesure/cible/contrat, population et fenêtre explicites. |
| `sre-error-budget` | Relu après correction : distracteur plausible budget restant/mitigation inutile, calcul 1 000 correct et budget requêtes ≠ temps. |
| `sre-incident` | Relu : mitigation réversible proportionnée, coordination, faits et incertitude communiqués. |
| `sre-postmortem` | Relu : facteurs/sans blâme, responsabilité des actions et critère vérifiable. |
| `sre-restore` | Relu : RPO/RTO, restauration testée, réplication pouvant propager une suppression. |

Sources de contrôle : [signaux OpenTelemetry](https://opentelemetry.io/docs/concepts/signals/), [labels Prometheus](https://prometheus.io/docs/practices/naming/), [percentiles et histogrammes](https://prometheus.io/docs/practices/histograms/), [objectifs SRE](https://sre.google/sre-book/service-level-objectives/), [budget et risque](https://sre.google/sre-book/embracing-risk/).

### Assemblage et limites de publication

`index.ts` a été relu : les 30 figures locales sont insérées sur le fil commun après l'exemple, avant la question. Les trois leçons Docker et leurs cartes sont reprises avec leurs IDs existants ; une copie du graphe reçoit la figure. Les deux réponses conduisent à l'explication puis à la synthèse, qui enseignent les notions des cartes, quelle que soit la réponse.

Les 150 leçons constituent des introductions ciblées, pas une certification de maîtrise ni un inventaire de toutes les spécialités du développement. Le format cohérent aide à démarrer ; la diversité des interactions, la difficulté et les estimations de trois minutes restent à éprouver auprès d'apprenants. Les cours ne doivent pas être activés ensemble dans l'interface sans navigation et gestion des prérequis explicites.
