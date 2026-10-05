# Sources du catalogue

Références primaires consultées par l’équipe le **5 octobre 2026**. Les dialogues, situations et cartes sont des rédactions originales ; les liens soutiennent les mécanismes techniques, pas une certification de réussite pédagogique. Les méthodes de diagnostic, de revue et de choix d’architecture sont contextualisées à MemStack. Le registre [REVIEW.md](REVIEW.md) conserve l’inspection et les corrections.

## Conditions communes

- Exemples JavaScript/TypeScript modernes ; snippets pédagogiques, pas applications complètes. Les types n’assurent pas la validation des données réseau.
- Permissions de fichiers : modèle Unix ; ne pas transposer les modes numériques aux ACL Windows.
- SQL : PostgreSQL pour les détails de NULL, contraintes et syntaxe ; garanties de concurrence précisées séparément de l’atomicité.
- React : composants fonctionnels et Hooks ; rendu, effets et événements distincts. Les délais estimés incluent réflexion et rappel, pas seulement lecture.
- Firestore : SDK client Web et règles de données ; les SDK serveur privilégiés ont une autorité différente.
- Cloud, Terraform et Kubernetes : exemples conditionnels ; vérifier produit, version et configuration avant de les appliquer. Aucun prix ni SLA universel n’est promis.
- SVG : créations originales locales, aucune photo tierce copiée. Origine, légendes et emplacement dans [VISUALS.md](VISUALS.md).

## Fondamentaux

| Leçon | Référence et portée |
| --- | --- |
| `fund-values-references` | [Objets JavaScript][objects], [spread][spread] et [const][const] : références et copie superficielle. |
| `fund-mutation` | [sort][sort] et [spread][spread] : mutation et copie ; choix de contrat expliqué dans un scénario original. |
| `fund-collections` | [Collections indexées et associatives][js-guide] : Array, Set, Map ; unicité des primitives et identité des objets. |
| `fund-complexity` | Raisonnement original sur n et n×n : calculs exacts du scénario, croissance asymptotique, pas garantie de temps CPU. |
| `fund-invariants` | [Contraintes SQL][constraints] et [transactions][transactions] : protection structurelle ; scénario original stock avec concurrence explicitement conditionnée. |
| `systems-process` | [Processus Node][process] : PID, ressources et mémoire d’une exécution ; distinction programme/processus. |
| `systems-paths` | [Chemins Node][path] et [process.cwd][process] : base des chemins relatifs. |
| `systems-permissions` | [Structure des modes GNU][modes] : droits lecture, écriture et recherche dans un répertoire. |
| `systems-environment` | [process.env][process] : valeurs d’environnement du processus ; [configuration Vite][vite-env] pour exposition frontend. |
| `systems-exit-codes` | [Sorties et codes de processus Node][process] : succès, échec et messages ; règles des pipelines dépendantes du shell. |

## Web

| Leçon | Référence et portée |
| --- | --- |
| `http-request-response` | [Vue d’ensemble HTTP][http] : requête, réponse, en-têtes et représentation. |
| `http-methods-status` | [Sémantique HTTP RFC 9110][http-rfc] : méthodes, familles de statuts et 204. |
| `http-dns-tls` | [HTTP][http] : parcours réseau simplifié ; détails de HTTP/3 et réutilisation explicitement hors du schéma simplifié. |
| `http-cookies` | [Cookies HTTP][cookies] : Set-Cookie, HttpOnly, Secure, SameSite. |
| `http-cache` | [Cache HTTP][http-cache] : fraîcheur, ETag, revalidation, private, no-cache et no-store. |
| `ui-semantic-html` | [Élément button][button], [WAI][wai] : action, soumission, nom accessible. |
| `ui-box-model` | [Modèle de boîte CSS][box] : content-box, border-box et marge. |
| `ui-flex-grid` | [Disposition CSS MDN][css-layout] : axes Flex et pistes Grid ; ordre DOM distinct. |
| `ui-responsive` | [Disposition CSS MDN][css-layout], [WAI][wai] : scénario original d’adaptation au contenu. |
| `ui-keyboard-focus` | [WAI][wai] : navigation, noms accessibles et focus ; exemple de bouton Mémo original. |
| `browser-dom-events` | [Propagation des événements][events] : target, currentTarget, capture et bouillonnement. |
| `browser-event-loop` | [Microtâches MDN][microtasks] : ordre du script synchrone, then et timer dans le navigateur. |
| `browser-fetch-errors` | [Utiliser fetch][fetch] : rejets réseau, réponse HTTP, ok et parsing du corps. |
| `browser-abort` | [Utiliser fetch][fetch] : AbortController ; aucune garantie d’annulation d’un effet distant. |
| `browser-storage` | [Web Storage][storage], [Cookies][cookies] : portée et API ; [IndexedDB][indexeddb] pour stockage structuré. |

## JavaScript et TypeScript

| Leçon | Référence et portée |
| --- | --- |
| `js-scope` | [Fermetures][closures] : liaisons lexicales et lecture de la variable, pas copie figée automatique. |
| `js-equality` | [Égalité stricte][equality] : types, identité et particularité NaN. |
| `js-nullish` | [Opérateur ??][nullish] : null/undefined versus valeurs falsy. |
| `js-array-transforms` | [map][map], [collections][js-guide] : transformer, filtrer et chercher ; mutation possible dans un callback. |
| `js-errors` | [Gestion des erreurs][js-errors] : throw, catch et finally. |
| `js-promise` | [Promise][promise] : états, valeur future et absence d’annulation universelle. |
| `js-await` | [await][await] : continuation suspendue, pas thread CPU distinct. |
| `js-concurrency` | [Promise][promise] : all, allSettled et opérations indépendantes. |
| `js-async-errors` | [await][await] et [Promise][promise] : catch autour du résultat attendu. |
| `js-modules` | [Modules ES][modules] : exports nommés, défaut et cycles d’initialisation. |
| `ts-unions` | [Narrowing TypeScript][narrowing] : discriminants et variantes. |
| `ts-narrowing` | [Narrowing][narrowing] : preuves de contrôle et truthiness. |
| `ts-unknown` | [Types courants][ts-types], [narrowing][narrowing] : unknown, vérification de null et frontière externe. |
| `ts-generics` | [Génériques][generics] : relation entre entrée/sortie et contraintes. |
| `ts-runtime` | [Types courants][ts-types] : assertions retirées ; validateur pédagogique original. |

## React

| Leçon | Référence et portée |
| --- | --- |
| `react-render` | [Pureté des composants][react-pure] : calcul d’interface et effets hors rendu. |
| `react-props-state` | [Gestion de l’état][react-state] : propriétaire et partage entre composants. |
| `react-state-update` | [File des mises à jour][react-queue] : snapshot et updater pur. |
| `react-derived-state` | [Structure de l’état][react-structure] : éviter les données redondantes. |
| `react-list-keys` | [Identité de l’état][react-identity] : clés stables et remontages. |
| `react-effects-sync` | [Synchroniser avec des effets][react-effects] : effets, événements et calculs. |
| `react-effect-cleanup` | [Effets][react-effects] : nettoyage et réinstallation ; dépendances complètes précisées. |
| `react-dependencies` | [Dépendances des effets][react-dependencies] : captures et synchronisation réactive. |
| `react-context` | [Gestion de l’état][react-state] : partage ciblé ; exemple ProgressProvider original. |
| `react-loading-states` | [Effets][react-effects] : requêtes et nettoyage ; scénario original A/B et génération courante. |

## Backend et API

| Leçon | Référence et portée |
| --- | --- |
| `node-runtime` | [Boucle d’événements Node][node-loop] : travail synchrone, opérations asynchrones et autres threads. |
| `node-validation` | [Validation OWASP][input-validation] : frontière serveur et limites ; exemple de leçon original. |
| `node-config` | [process.env][process], [Vite][vite-env] : configuration serveur et bundle public. |
| `node-errors` | [Sécurité REST OWASP][rest-security] : erreur publique sans détails internes ; contrat original r42. |
| `node-shutdown` | [Signaux de processus Node][process] : arrêt borné ; procédure applicative pédagogique, dépendante du serveur HTTP. |
| `rest-resources` | [Sémantique HTTP][http-rfc] : méthodes et cibles ; conventions d’URL pédagogiques. |
| `rest-idempotency` | [RFC 9110][http-rfc] : effet idempotent distinct de réponse identique ; clé métier à protéger atomiquement. |
| `rest-pagination` | [Pagination PostgreSQL][pagination] : ordre et offset ; scénario de curseur composite original. |
| `rest-error-contract` | [Sécurité REST][rest-security] : erreurs publiques ; codes contractuels originaux. |
| `rest-evolution` | [Conception API Microsoft][api-design] : évolution compatible ; enum exhaustive comme condition du consommateur. |
| `backend-timeouts` | [Temps et annulation fetch][fetch], [fiabilité RabbitMQ][rabbit-reliability] : résultat distant parfois inconnu. |
| `backend-retries` | [Fiabilité RabbitMQ][rabbit-reliability] : reprise et idempotence ; politique bornée/backoff/jitter contextualisée. |
| `backend-queue` | [Accusés RabbitMQ][rabbit-acks] : transfert de responsabilité et résultat durable. |
| `backend-duplicate-jobs` | [Fiabilité RabbitMQ][rabbit-reliability] : répétition possible ; protection métier durable. |
| `backend-outbox` | [Outbox transactionnelle AWS][outbox] : écriture et intention atomiques, publication répétable. |

## Données

| Leçon | Référence et portée |
| --- | --- |
| `sql-keys` | [Contraintes PostgreSQL][constraints] : PRIMARY KEY, UNIQUE, références et NULL. |
| `sql-joins` | [Jointures PostgreSQL][joins] : INNER/LEFT et filtre ultérieur. |
| `sql-null` | [Comparaisons PostgreSQL][sql-comparison] : IS NULL et logique inconnue. |
| `sql-transactions` | [Transactions][transactions] : atomicité ; [isolation][isolation] pour concurrence. |
| `sql-indexes` | [Index PostgreSQL][indexes], [EXPLAIN][explain] : gain/coût et exécution d’ANALYZE. |
| `documents-model` | [Modèle Firestore][firestore-model] : frontières documentaires ; exemple public/personnel original. |
| `documents-denormalization` | [Modèle Firestore][firestore-model] : structures et sous-collections ; compromis de duplication explicite. |
| `firestore-paths` | [Modèle Firestore][firestore-model] : alternance, parent absent et sous-collections. |
| `firestore-transactions` | [Transactions Firestore][firestore-transactions] : nouvelle tentative, lectures avant écritures et réseau. |
| `firestore-rules` | [Conditions des règles][firestore-rules] : identité, propriétaire et validation ; autorité serveur différente. |

## DevOps

| Leçon | Référence et portée |
| --- | --- |
| `docker-images-containers` | [Concepts Docker][docker-concepts] : image et instance ; code intégré sans montage pour build/recréation. |
| `docker-volumes-persistence` | [Volumes Docker][docker-volumes] : stockage indépendant du conteneur, pas sauvegarde automatique. |
| `docker-ports-networks` | [Publication de ports][docker-ports], [bridge][docker-bridge] : accès hôte et noms internes. |
| `docker-build-cache` | [Optimiser le cache][docker-cache] : ordre des copies et contexte. |
| `docker-compose` | [Ordre Compose][compose] : services, disponibilité et healthchecks. |
| `cicd-pipeline` | [GitHub Actions][actions] : étapes/jobs ; portes de MemStack originales. |
| `cicd-lockfile` | [npm ci][npm-ci] : installation verrouillée et manifestes cohérents. |
| `cicd-artifact` | [Artefacts GitHub][artifacts] : conservation ; [images Docker][docker-concepts] pour contenu/version. |
| `cicd-secrets` | [Durcissement Actions][actions-security] : jetons, code non fiable et secrets. |
| `cicd-rollback` | [Déploiements GitHub][deployments] : environnements ; scénario de compatibilité schéma/code original. |
| `cloud-responsibility` | [Responsabilités cloud][shared-responsibility] : capacités gérées et configuration utilisateur. |
| `cloud-compute` | [Cloud Run][cloud-run], [responsabilités cloud][shared-responsibility] : choix d’exécution conditionnel. |
| `cloud-regions` | [Régions Google Cloud][regions] : localité et domaines de panne. |
| `cloud-iam` | [Identités de service][service-accounts] : permissions et justificatifs. |
| `cloud-cost` | [Budgets Google Cloud][budgets] : alerte différente d’un plafond ; aucun prix affirmé. |
| `terraform-state` | [État Terraform][tf-state] : lien objets/configuration et confidentialité. |
| `terraform-plan` | [Commande plan][tf-plan] : actions proposées et plan enregistré. |
| `terraform-variables` | [Entrées/sorties Terraform][tf-values] : rôle des paramètres et résultats. |
| `terraform-locking` | [Verrouillage Terraform][tf-lock] : coordination dépendante du backend. |
| `terraform-drift` | [plan -refresh-only][tf-plan] : proposition d’état ; application pour l’enregistrement, aucune réécriture du code. |
| `k8s-pod` | [Pods Kubernetes][pods] : réseau partagé et volumes configurés. |
| `k8s-deployment` | [Deployment][deployment] : état souhaité, réconciliation et disponibilité distincts. |
| `k8s-service` | [Service][service] : sélecteurs, port et targetPort. |
| `k8s-probes` | [Probes][probes] : readiness, liveness et startup. |
| `k8s-resources` | [Ressources des conteneurs][resources] : placement, CPU et mémoire. |
| `obs-signals` | [Signaux OpenTelemetry][signals] : métriques, logs et traces. |
| `obs-structured-logs` | [Signaux][signals] : corrélation ; filtrage de secrets appliqué au scénario original. |
| `obs-latency` | [Histogrammes Prometheus][histograms] : quantiles, estimation et agrégation. |
| `obs-cardinality` | [Labels Prometheus][metric-naming] : ensembles bornés et routes normalisées. |
| `obs-alerts` | [Alertes Prometheus][alerts] : symptôme/action ; seuil et fenêtre pédagogiques. |
| `sre-sli-slo` | [Objectifs SRE][slo] : SLI, SLO et SLA. |
| `sre-error-budget` | [Politique de budget d’erreur][error-budget] : arbitrage de travail et fiabilité. |
| `sre-incident` | [Gestion des incidents][incident] : atténuation, coordination et communication. |
| `sre-postmortem` | [Culture postmortem][postmortem] : facteurs et actions sans recherche de coupable. |
| `sre-restore` | [Reprise Google Cloud][recovery] : RPO, RTO et test de restauration. |

## Sécurité

| Leçon | Référence et portée |
| --- | --- |
| `security-authn-authz` | [Authentification][authentication], [autorisation][authorization] : identité et droit distincts. |
| `security-object-access` | [Prévention IDOR][idor] : vérification par objet. |
| `security-session-tokens` | [Sessions OWASP][sessions], [JWT RFC 7519][jwt] : expiration, validation et révocation. |
| `security-oauth-oidc` | [OpenID Connect Core][oidc] : identité au-dessus d’OAuth. |
| `security-least-privilege` | [Autorisation][authorization], [secrets][secrets] : portée et durée. |
| `security-injection` | [Injection SQL][sql-injection] : paramètres distincts de l’instruction. |
| `security-xss` | [Prévention XSS][xss] : contexte de sortie et HTML non fiable. |
| `security-csrf` | [Prévention CSRF][csrf] : cookies automatiques et protection adaptée. |
| `security-cors` | [CORS MDN][cors], [sécurité REST][rest-security] : lecture navigateur distincte d’autorisation serveur. |
| `security-dependencies` | [Dépendances vulnérables][vulnerable-dependencies] : exposition réelle, correction et suivi. |

## Tests

| Leçon | Référence et portée |
| --- | --- |
| `tests-unit-integration` | [Pratiques Playwright][playwright] : frontières et comportement observable. |
| `tests-boundaries` | Cas et calculs originaux : limites spécifiées et invalidité, sans prétention à une norme universelle de couverture. |
| `tests-determinism` | [Test runner Node][node-test] : contrôle du temps ; injection pédagogique d’horloge. |
| `tests-doubles` | [Pratiques Playwright][playwright] : double distinct de preuve du service réel. |
| `tests-regression` | [Pratiques Playwright][playwright] : comportement ; scénario original échec avant correction. |

## Architecture

| Leçon | Référence et portée |
| --- | --- |
| `arch-domain-ui` | [Principes Microsoft][architecture-principles] : séparation ; exemple MemStack original. |
| `arch-dependencies` | [Principes Microsoft][architecture-principles] : responsabilités et frontières adaptées au stockage. |
| `arch-contracts` | [Principes Microsoft][architecture-principles] : capacité exposée ; exemple de module original. |
| `arch-state-machine` | [Unions TypeScript][narrowing] : états exclusifs ; transitions pédagogiques originales. |
| `arch-adr` | Méthode originale contexte/décision/conséquences, appliquée au choix Firebase ; aucun standard imposé. |
| `dist-monolith` | [Principes Microsoft][architecture-principles] : compromis de distribution ; scénario original. |
| `dist-consistency` | [Cohérence DynamoDB][consistency] : exemple de visibilité différée, pas garantie universelle de chaque base. |
| `dist-concurrent-writes` | [Verrouillage optimiste DynamoDB][optimistic] : version attendue ; fusion selon sens métier. |
| `dist-cache-invalidation` | [Cache-aside Microsoft][cache-aside] : copie, expiration et invalidation. |
| `dist-time-order` | [Performance.now MDN][performance-now] : durée monotone distincte d’horloge murale distribuée. |

## Performance

| Leçon | Référence et portée |
| --- | --- |
| `perf-measure` | [EXPLAIN PostgreSQL][explain] : observation des accès ; diagnostic de parcours original. |
| `perf-web-vitals` | [Web Vitals][web-vitals] : LCP, INP, CLS sans seuil tarifaire ni promesse universelle. |
| `perf-bundle` | [import dynamique][dynamic-import] : chargement différé pertinent. |
| `perf-images` | [Lazy loading navigateur][lazy-images] : ne pas retarder l’image principale. |
| `perf-n-plus-one` | [EXPLAIN][explain] : coût des accès ; scénario original de regroupement borné. |

## Pratiques de développement

| Leçon | Référence et portée |
| --- | --- |
| `git-working-tree` | [Enregistrer les changements Git][git-changes] : travail, index et commit. |
| `git-small-commits` | [Git][git-changes] : scénario original de commit cohérent. |
| `git-merge-rebase` | [Rebase Git][git-rebase] : réécriture et historique partagé. |
| `git-conflicts` | [Git][git-rebase] : intégration ; vérification du sens au-delà des marqueurs. |
| `git-review` | [Revues GitHub][reviews] : intention, preuve et décision. |
| `debug-reproduce` | Scénario original de reproduction : environnement, entrées et étapes explicites. |
| `debug-hypothesis` | [Breakpoints Chrome][breakpoints] : observation discriminante ; hypothèses originales. |
| `debug-stack-trace` | [Breakpoints Chrome][breakpoints] : pile et origine, sans conclure uniquement depuis le dernier appel. |
| `maintenance-refactor` | Méthode originale de séparation changement de structure/comportement et test du contrat. |
| `maintenance-upgrade` | [npm ci][npm-ci] : installation reproductible ; examen de migration dépendant de la bibliothèque. |

## Liens primaires

[objects]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects
[spread]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
[const]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
[sort]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
[js-guide]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
[constraints]: https://www.postgresql.org/docs/current/ddl-constraints.html
[transactions]: https://www.postgresql.org/docs/current/tutorial-transactions.html
[process]: https://nodejs.org/api/process.html
[path]: https://nodejs.org/api/path.html
[modes]: https://www.gnu.org/s/coreutils/manual/html_node/Mode-Structure.html
[vite-env]: https://vite.dev/guide/env-and-mode
[http]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview
[http-rfc]: https://www.rfc-editor.org/rfc/rfc9110.html
[cookies]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies
[http-cache]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching
[button]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button
[wai]: https://www.w3.org/WAI/tutorials/
[box]: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_model/Introduction
[css-layout]: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout
[events]: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling
[microtasks]: https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
[storage]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
[indexeddb]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
[closures]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures
[equality]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality
[nullish]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
[map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
[js-errors]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[await]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
[modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[narrowing]: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
[ts-types]: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
[generics]: https://www.typescriptlang.org/docs/handbook/2/generics.html
[react-pure]: https://react.dev/learn/keeping-components-pure
[react-state]: https://react.dev/learn/managing-state
[react-queue]: https://react.dev/learn/queueing-a-series-of-state-updates
[react-structure]: https://react.dev/learn/choosing-the-state-structure
[react-identity]: https://react.dev/learn/preserving-and-resetting-state
[react-effects]: https://react.dev/learn/synchronizing-with-effects
[react-dependencies]: https://react.dev/learn/removing-effect-dependencies
[node-loop]: https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick
[input-validation]: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
[rest-security]: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
[pagination]: https://www.postgresql.org/docs/current/queries-limit.html
[api-design]: https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design
[rabbit-reliability]: https://www.rabbitmq.com/docs/reliability
[rabbit-acks]: https://www.rabbitmq.com/docs/confirms
[outbox]: https://docs.aws.amazon.com/en_en/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html
[joins]: https://www.postgresql.org/docs/current/tutorial-join.html
[sql-comparison]: https://www.postgresql.org/docs/current/functions-comparison.html
[isolation]: https://www.postgresql.org/docs/current/transaction-iso.html
[indexes]: https://www.postgresql.org/docs/current/indexes.html
[explain]: https://www.postgresql.org/docs/current/using-explain.html
[firestore-model]: https://firebase.google.com/docs/firestore/data-model
[firestore-transactions]: https://firebase.google.com/docs/firestore/manage-data/transactions
[firestore-rules]: https://firebase.google.com/docs/firestore/security/rules-conditions
[docker-concepts]: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/
[docker-volumes]: https://docs.docker.com/engine/storage/volumes/
[docker-ports]: https://docs.docker.com/engine/network/port-publishing/
[docker-bridge]: https://docs.docker.com/engine/network/drivers/bridge/
[docker-cache]: https://docs.docker.com/build/cache/optimize/
[compose]: https://docs.docker.com/compose/how-tos/startup-order/
[actions]: https://docs.github.com/en/actions/get-started/understand-github-actions
[npm-ci]: https://docs.npmjs.com/cli/v11/commands/npm-ci/
[artifacts]: https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts
[actions-security]: https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions
[deployments]: https://docs.github.com/en/actions/deployment/about-deployments/deploying-with-github-actions
[shared-responsibility]: https://docs.cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate
[cloud-run]: https://docs.cloud.google.com/run/docs/about-instance-autoscaling
[regions]: https://docs.cloud.google.com/docs/geography-and-regions
[service-accounts]: https://docs.cloud.google.com/iam/docs/service-account-overview
[budgets]: https://docs.cloud.google.com/billing/docs/how-to/budgets
[tf-state]: https://developer.hashicorp.com/terraform/language/state
[tf-plan]: https://developer.hashicorp.com/terraform/cli/commands/plan
[tf-values]: https://developer.hashicorp.com/terraform/language/values
[tf-lock]: https://developer.hashicorp.com/terraform/language/state/locking
[pods]: https://kubernetes.io/docs/concepts/workloads/pods/
[deployment]: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
[service]: https://kubernetes.io/docs/concepts/services-networking/service/
[probes]: https://kubernetes.io/docs/concepts/workloads/pods/probes/
[resources]: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
[signals]: https://opentelemetry.io/docs/concepts/signals/
[histograms]: https://prometheus.io/docs/practices/histograms/
[metric-naming]: https://prometheus.io/docs/practices/naming/
[alerts]: https://prometheus.io/docs/practices/alerting/
[slo]: https://sre.google/sre-book/service-level-objectives/
[error-budget]: https://sre.google/workbook/error-budget-policy/
[incident]: https://sre.google/sre-book/managing-incidents/
[postmortem]: https://sre.google/sre-book/postmortem-culture/
[recovery]: https://docs.cloud.google.com/architecture/dr-scenarios-planning-guide
[authentication]: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
[authorization]: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
[idor]: https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html
[sessions]: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
[jwt]: https://www.rfc-editor.org/rfc/rfc7519.html
[oidc]: https://openid.net/specs/openid-connect-core-1_0.html
[secrets]: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
[sql-injection]: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
[xss]: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
[csrf]: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
[cors]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
[vulnerable-dependencies]: https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html
[playwright]: https://playwright.dev/docs/best-practices
[node-test]: https://nodejs.org/api/test.html
[architecture-principles]: https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/
[consistency]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html
[optimistic]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBMapper.OptimisticLocking.html
[cache-aside]: https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside
[performance-now]: https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
[web-vitals]: https://web.dev/articles/vitals
[dynamic-import]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
[lazy-images]: https://web.dev/articles/browser-level-image-lazy-loading
[git-changes]: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository
[git-rebase]: https://git-scm.com/book/en/v2/Git-Branching-Rebasing
[reviews]: https://docs.github.com/en/pull-requests/reference/pull-request-reviews
[breakpoints]: https://developer.chrome.com/docs/devtools/javascript/breakpoints/
