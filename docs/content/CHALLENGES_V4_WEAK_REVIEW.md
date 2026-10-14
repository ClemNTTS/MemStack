# Relecture étudiant faible v4 — 14 octobre 2026

Relecture indépendante des 36 dossiers, 180 questions et 540 propositions. Les scénarios et pièces ont été comparés aux clés privées : aucune réponse correcte manifestement fausse ni alternative injustement rejetée identifiée. Les distracteurs décrivent des confusions distinctes (preuve insuffisante, mauvais ordre, fausse garantie ou mauvaise portée), formulées en phrases complètes. Le vocabulaire technique essentiel reste relié au dossier.

## Couverture exhaustive

| Défi | Couverture | Verdict |
| --- | --- | --- |
| `docker-images-diagnostic` | 5 questions / 15 choix | Vérifié |
| `docker-volumes-diagnostic` | 5 questions / 15 choix | Vérifié |
| `docker-ports-diagnostic` | 5 questions / 15 choix | Vérifié |
| `fund-shared-cart-diagnostic` | 5 questions / 15 choix | Vérifié |
| `fund-stock-invariant-diagnostic` | 5 questions / 15 choix | Vérifié |
| `systems-env-process-diagnostic` | 5 questions / 15 choix | Vérifié |
| `http-stale-cache-diagnostic` | 5 questions / 15 choix | Vérifié |
| `web-fetch-error-diagnostic` | 5 questions / 15 choix | Vérifié |
| `web-keyboard-action-diagnostic` | 5 questions / 15 choix | Vérifié |
| `js-zero-default-diagnostic` | 5 questions / 15 choix | Vérifié |
| `js-serial-requests-diagnostic` | 5 questions / 15 choix | Vérifié |
| `ts-unchecked-api-diagnostic` | 5 questions / 15 choix | Vérifié |
| `react-mutated-list-diagnostic` | 5 questions / 15 choix | Vérifié |
| `react-stale-search-diagnostic` | 5 questions / 15 choix | Vérifié |
| `react-index-keys-diagnostic` | 5 questions / 15 choix | Vérifié |
| `backend-invalid-body-diagnostic` | 5 questions / 15 choix | Vérifié |
| `backend-payment-retry-diagnostic` | 5 questions / 15 choix | Vérifié |
| `backend-env-secret-diagnostic` | 5 questions / 15 choix | Vérifié |
| `data-left-join-diagnostic` | 5 questions / 15 choix | Vérifié |
| `data-transfer-atomicity-diagnostic` | 5 questions / 15 choix | Vérifié |
| `data-firestore-retry-diagnostic` | 5 questions / 15 choix | Vérifié |
| `security-object-owner-diagnostic` | 5 questions / 15 choix | Vérifié |
| `security-sql-concatenation-diagnostic` | 5 questions / 15 choix | Vérifié |
| `security-html-comment-diagnostic` | 5 questions / 15 choix | Vérifié |
| `tests-empty-pass-diagnostic` | 5 questions / 15 choix | Vérifié |
| `tests-expiry-boundary-diagnostic` | 5 questions / 15 choix | Vérifié |
| `tests-mock-contract-diagnostic` | 5 questions / 15 choix | Vérifié |
| `architecture-rule-ui-diagnostic` | 5 questions / 15 choix | Vérifié |
| `architecture-invalid-state-diagnostic` | 5 questions / 15 choix | Vérifié |
| `architecture-lost-write-diagnostic` | 5 questions / 15 choix | Vérifié |
| `performance-lcp-lazy-diagnostic` | 5 questions / 15 choix | Vérifié |
| `performance-eager-module-diagnostic` | 5 questions / 15 choix | Vérifié |
| `performance-nplusone-diagnostic` | 5 questions / 15 choix | Vérifié |
| `engineering-staged-old-version-diagnostic` | 5 questions / 15 choix | Vérifié |
| `engineering-semantic-conflict-diagnostic` | 5 questions / 15 choix | Vérifié |
| `engineering-stack-origin-diagnostic` | 5 questions / 15 choix | Vérifié |

## Points de lisibilité transmis

Les options des groupes React, backend, données et sécurité utilisent parfois des identifiants sans balisage de code : setItems(previous => ...), item.id, reserve, quantity: number, DATABASE_URL, innerHTML et textContent. Les afficher comme du code aiderait à distinguer le langage technique de la phrase française. Ce point concerne la présentation, pas les clés. Aucun blocage technique relevé.

## Qualification faible

shared/challengeWeakStudentCases.json contient une tentative synthétique par défi, comprenant zéro ou une bonne réponse sur cinq. Les mauvaises réponses alternent entre les deux distracteurs ; une bonne réponse ponctuelle représente une notion déjà acquise. Il ne s’agit pas de réponses de vrais apprenants, ni d’une mesure de difficulté : ces fixtures vérifient uniquement que le correcteur ne valide pas une tentative faible connue. Toutes les questions disposent d’un choix existant et chaque tentative doit recevoir retry.

## Vérifications documentaires ciblées

- Firestore : relance possible de la fonction de transaction et absence d’effets externes dans cette fonction — https://firebase.google.com/docs/firestore/manage-data/transactions
- PostgreSQL : les changements de la transaction forment une opération indivisible — https://www.postgresql.org/docs/current/tutorial-transactions.html
- React : une clé stable conserve l’identité lors des changements de liste — https://react.dev/learn/rendering-lists

Ces sources primaires ont été consultées le 14 octobre 2026. Les nombres et contrats spécifiques aux exercices sont fournis par leurs dossiers, et ne prétendent pas décrire une configuration réelle.

## Emplacements précis du balisage recommandé

- react-mutated-list-diagnostic / mechanism / prompt : Pourquoi utiliser la forme setItems(previous => ...) pour des ajouts rapprochés ?
- react-mutated-list-diagnostic / mechanism / a : Chaque ajout peut modifier directement le tableau previous sans créer de copie.
- react-index-keys-diagnostic / action / c : L’identifiant stable et unique de chaque article, comme item.id.
- backend-invalid-body-diagnostic / diagnosis / prompt : Pourquoi la valeur beaucoup ne doit-elle pas atteindre reserve ?
- backend-invalid-body-diagnostic / boundary / prompt : Que garantit une déclaration TypeScript quantity: number face au JSON reçu ?
- backend-env-secret-diagnostic / action / prompt : Comment traiter l’absence de DATABASE_URL au démarrage ?
- backend-env-secret-diagnostic / mechanism / a : La variable DATABASE_URL obligatoire est absente.
- backend-env-secret-diagnostic / mechanism / b : La variable DATABASE_URL vaut suivi de toute l’adresse et du mot de passe.
- backend-env-secret-diagnostic / mechanism / c : La variable DATABASE_URL est absente suivi de toutes les autres variables disponibles.
- data-left-join-diagnostic / diagnosis / c : Le filtre WHERE rejette sa ligne, car elle n’a pas de commande confirmée associée.
- data-left-join-diagnostic / action / b : Garder le filtre WHERE sur le statut, puis compter toutes les lignes du résultat.
- data-left-join-diagnostic / mechanism / prompt : Pourquoi compter o.id plutôt que toutes les lignes avec COUNT(*) ?
- data-left-join-diagnostic / mechanism / a : COUNT(o.id) retire Bob du rapport avant de commencer le comptage.
- data-left-join-diagnostic / mechanism / b : COUNT(o.id) transforme automatiquement les commandes non confirmées en confirmées.
- data-left-join-diagnostic / mechanism / c : COUNT(o.id) ignore la valeur absente de commande sur la ligne conservée pour Bob.
- security-object-owner-diagnostic / boundary / a : L’identité indiquée dans un champ ownerId ajouté librement par le navigateur.
- security-html-comment-diagnostic / diagnosis / a : innerHTML interprète la saisie comme du HTML, y compris son gestionnaire d’événement.
- security-html-comment-diagnostic / diagnosis / b : innerHTML affiche la saisie comme du texte, mais le stockage exécute ensuite ce texte.
- security-html-comment-diagnostic / diagnosis / c : innerHTML est sans risque ici, car le commentaire a déjà été enregistré en base.
- security-html-comment-diagnostic / action / a : Utiliser innerHTML, qui interprète le commentaire comme du HTML.
- security-html-comment-diagnostic / action / b : Utiliser innerHTML après avoir retiré uniquement les balises script.
- security-html-comment-diagnostic / action / c : Utiliser textContent, qui affiche le commentaire comme du texte.
- security-html-comment-diagnostic / boundary / b : Une image contenant un événement est automatiquement supprimée par innerHTML.
- security-html-comment-diagnostic / boundary / c : Une image contenant un événement est toujours affichée comme du texte par innerHTML.

Aucune formulation exigeant une connaissance de senior identifiée. Les termes fonction de transaction, jointure, type TypeScript et état React sont soutenus par les pièces des dossiers correspondants. Les options DATABASE_URL b/c gagneraient aussi des guillemets : « Je journalise le nom DATABASE_URL puis toute sa valeur, y compris le mot de passe » et « Je signale DATABASE_URL absente puis affiche toutes les autres variables ».
