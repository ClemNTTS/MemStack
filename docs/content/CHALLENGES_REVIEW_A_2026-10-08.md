# Inspection indépendante — défis du lot A

Inspection du 8 octobre 2026. Lecture intégrale des dix-huit dossiers et des quatre-vingt-dix réponses d’évaluation associés aux thèmes `fundamentals`, `web`, `languages`, `react`, `backend` et `data`. Pièces, question, correction, repères, contre-exemples, alternatives et sources contrôlés. Aucun appel fournisseur ; l’inspection des cas ne vaut pas observation d’un retour Mistral.

## Contrôle croisé des corrections de leçons du lot B

Lecture indépendante du diff des huit fichiers et du rapport `REVIEW_B_2026-10-08.md`. Les douze leçons corrigées sont cohérentes avec leur objectif et leurs cartes : `tests-unit-integration`, `tests-regression`, `security-csrf`, `perf-web-vitals`, `git-working-tree`, `debug-reproduce`, `arch-domain-ui`, `cloud-cost`, `terraform-state`, `k8s-service`, `obs-cardinality`, `sre-restore` (douze IDs, plusieurs champs dans certains). Aucun changement de concept ni rupture d’ID/transition constaté dans le diff ; aucun défaut bloquant relevé.

La préférence zéro choisie pour la régression ne duplique pas la décision enseignée par les tests de frontière : elle exerce le cycle échec/réussite. Les limites de facturation et de restauration sont maintenant conditionnelles. Le Service Kubernetes est borné au cas ClusterIP avec sélecteur ; le masquage Terraform ne promet pas de retirer le secret de l’état. Les précisions sur LCP, GET et cardinalité évitent des affirmations trop générales.

Sources primaires effectivement ouvertes pour ce contrôle : [LCP](https://web.dev/articles/lcp), [Services Kubernetes](https://kubernetes.io/docs/concepts/services-networking/service/), [données sensibles Terraform](https://developer.hashicorp.com/terraform/language/manage-sensitive-data), [budgets Cloud Billing](https://docs.cloud.google.com/billing/docs/how-to/budgets), [labels Prometheus](https://prometheus.io/docs/practices/naming/), [index Git](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository), [HTTP, méthodes sûres](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.1). Les formulations contextuelles de tests/architecture et le scénario de minuit ont été jugés à partir du diff, sans prétendre valider tout le contenu original du lot B.

## Registre des nouveaux défis

| Dossier | Contrôle et décision |
| --- | --- |
| `fund-shared-cart-diagnostic` | Copie du tableau distincte de celle des articles ; prix original/brouillon et alternatives de copie cohérents. |
| `fund-stock-invariant-diagnostic` | Contrat positif/entier et invariant cohérents ; source Object.assign hors sujet signalée ; alternative d’évaluation doit contenir la validation, pas seulement sa forme de retour. |
| `systems-env-process-diagnostic` | Environnement au lancement et configuration du lanceur distingués ; les pièces bornent explicitement l’absence de rechargement. |
| `http-stale-cache-diagnostic` | ETag constant/304 et corps ancien expliqués ; cas alternatif URL versionnée doit vérifier cette URL plutôt qu’exiger la correction de l’ETag de l’ancien chemin. |
| `web-fetch-error-diagnostic` | Réponse 403 exploitable, promesse accomplie et succès affiché cohérents ; adaptateur d’erreur admis. |
| `web-keyboard-action-diagnostic` | Div sans clavier, bouton natif et focus ; vérification Tab/Entrée/Espace appropriée. |
| `js-zero-default-diagnostic` | Zéro explicitement valide et absence null/undefined ; conversion ou rejet arbitraire de zéro exclus. |
| `js-serial-requests-diagnostic` | Entrées indépendantes et affichage tout-ou-rien explicités ; alternative d’attente séquentielle après lancement doit traiter les rejets de toutes les promesses immédiatement. |
| `ts-unchecked-api-diagnostic` | Assertion sans validation et name numérique ; schéma runtime et garde complet admis. |
| `react-mutated-list-diagnostic` | Même référence mutée et aucune autre mise à jour ; nouvelle liste/updater/reducer cohérents. |
| `react-stale-search-diagnostic` | Chronologie A/B confirme course réseau ; nettoyage/génération avant installation du résultat nécessaires. |
| `react-index-keys-diagnostic` | État local réassocié par index ; IDs métier stables et test Beta après suppression Alpha cohérents. |
| `backend-invalid-body-diagnostic` | Quantité 1–5 entier et chaîne reçue ; validation avant effet correcte, source OWASP demandée pour soutenir directement la frontière HTTP. |
| `backend-payment-retry-diagnostic` | Accusé perdu et POST répété ; unicité atomique et contenu lié à clé, sans fournisseur bancaire implicite. |
| `backend-env-secret-diagnostic` | Disponibilité annoncée avant validation ; présence/forme/réseau séparés et secret absent des logs. |
| `data-left-join-diagnostic` | WHERE retire NULL ; ON et COUNT(o.id) préservent zéro, sous-requête agrégée possible. |
| `data-transfer-atomicity-diagnostic` | Autocommit et interruption entre écritures ; atomicité, comptes/solde, rollback et effets externes distincts. |
| `data-firestore-retry-diagnostic` | Callback relancé et notification hors commit ; après commit ou outbox sans promesse exactement une fois. |

Les trois scénarios par thème sollicitent des mécanismes distincts. Les réemplois copie/état React, TypeScript/validation HTTP et paiement/transaction restent contextualisés par des décisions différentes. Chaque pièce suffit à expliquer le symptôme décrit ; aucune exécution réelle n’est nécessaire.

## Réserves transmises à l’auteur

Première passe : la question générale est identique dans les nouveaux dossiers. Personnaliser sa question centrale évite une répétition sans supprimer le formulaire commun. Les cas corrects, partiels et alternatifs recopient initialement les repères : ils testent la couverture, mais ne mettent pas à l’épreuve l’équivalence sémantique. Demande de reformulation en langage d’élève et d’alternatives choisies explicitement, notamment stock et URL de cache. Les cas incorrects et d’injection servent aux refus d’attribution et d’instruction ; ils doivent rester distincts d’une preuve de robustesse du modèle.

Seconde passe : dix-huit questions centrales désormais spécifiques ; trente-six cas corrects/alternatifs reformulés en langage d’élève et relus avec leurs attentes. La source du stock devient Number.isInteger ; OWASP soutient directement la validation HTTP ; le tutoriel PostgreSQL complète l’atomicité. L’alternative de concurrence utilise allSettled avec contrôle de chaque résultat et rappelle les rejets à suivre immédiatement dans une attente séparée. L’alternative de cache vérifie sa nouvelle URL sans promettre une correction de l’ancien ETag. La réponse alternative du stock exprime toutes les bornes et le résultat de refus.

Les cas partiels, incorrects et d’injection restent volontairement plus standardisés ; leurs attentes ont toutes été lues. Cette suite comporte désormais de vraies paraphrases, mais reste un petit jeu synthétique, avec une unique forme d’instruction hostile par scénario. Elle ne couvre pas toutes les erreurs d’élèves ni toutes les attaques de prompt. Les réponses de référence décrivent des solutions recevables sans prétendre qu’une formulation ou une commande exacte est nécessaire.

Dernier ajustement de cohérence demandé puis revérifié : le cas `data-firestore-retry-diagnostic-correct` choisit un envoi après commit et reconnaît sa fenêtre de perte. Ses attentes reconnaissent désormais cette politique sans lui attribuer une déduplication non écrite ni rendre une outbox obligatoire.

**Verdict final : les dix-huit dossiers et leurs quatre-vingt-dix cas d’évaluation sont cohérents après correction et prêts pour intégration. Aucune réserve textuelle bloquante de ce lot ne reste ouverte.** La qualité des réponses réelles du modèle et l’utilisabilité du parcours restent des validations distinctes ; aucun appel Mistral ni simulation de validation humaine n’a été effectué dans ce contrôle.

## Sources contrôlées pour les dossiers

Consultation des références liées aux mécanismes, le 8 octobre 2026 : [copie superficielle](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign), [Number.isInteger](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger), [process.env](https://nodejs.org/api/process.html), [304](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/304), [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), [button](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button), [coalescence nulle](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing), [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all), [narrowing TypeScript](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), [tableaux React](https://react.dev/learn/updating-arrays-in-state), [effets React](https://react.dev/learn/synchronizing-with-effects), [clés React](https://react.dev/learn/rendering-lists), [POST](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST), [validation OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [jointures PostgreSQL](https://www.postgresql.org/docs/current/tutorial-join.html), [isolation PostgreSQL](https://www.postgresql.org/docs/current/transaction-iso.html), [transactions PostgreSQL](https://www.postgresql.org/docs/current/tutorial-transactions.html), [transactions Firestore](https://firebase.google.com/docs/firestore/manage-data/transactions). Les liens ajoutés sur demande de correction sont eux aussi ouverts ; le scénario pédagogique original n’est pas présenté comme une règle universelle fournie par la documentation.
