# Inspection des défis — 8 octobre 2026

## Portée et méthode

36 dossiers actifs, trois par thématique, 180 cas d’évaluation. Les 33 ajouts ont été relus par leur rédacteur pour vérifier la cohérence pièces/question/correction, les hypothèses explicites, les alternatives et les erreurs à éviter. Les sources primaires de chaque ajout ont été ouvertes pendant la rédaction le 8 octobre 2026. Les trois dossiers Docker et leurs versions historiques restent inchangés ; leur inspection antérieure est documentée dans CHALLENGES.md.

Les contrôles structurels ne prouvent pas la qualité pédagogique. Aucun scénario n’a été exécuté dans un environnement réel et aucun nouvel appel fournisseur Mistral n’a été réalisé. Les cas d’évaluation sont des attentes de lecture, pas des résultats observés. La relecture indépendante est consignée séparément ci-dessous.

## Couverture et objectifs

| Thème | Identifiant | Objectif de diagnostic |
| --- | --- | --- |
| Fondamentaux | fund-shared-cart-diagnostic | Le panier modifié sans validation |
| Fondamentaux | fund-stock-invariant-diagnostic | Un retrait fait passer le stock sous zéro |
| Fondamentaux | systems-env-process-diagnostic | Le service garde son ancienne configuration |
| Web | http-stale-cache-diagnostic | Une réponse 304 masque le nouveau contenu |
| Web | web-fetch-error-diagnostic | Une suppression échouée affiche un succès |
| Web | web-keyboard-action-diagnostic | Le bouton invisible au clavier |
| JavaScript et TypeScript | js-zero-default-diagnostic | La limite zéro devient vingt |
| JavaScript et TypeScript | js-serial-requests-diagnostic | Trois lectures indépendantes prennent neuf secondes |
| JavaScript et TypeScript | ts-unchecked-api-diagnostic | Le type compilé ne valide pas la réponse |
| React | react-mutated-list-diagnostic | Un ajout ne déclenche pas le rendu |
| React | react-stale-search-diagnostic | L’ancienne recherche remplace la nouvelle |
| React | react-index-keys-diagnostic | La saisie reste sur la mauvaise ligne |
| Backend et API | backend-invalid-body-diagnostic | Une quantité texte atteint la logique métier |
| Backend et API | backend-payment-retry-diagnostic | Le paiement est créé deux fois |
| Backend et API | backend-env-secret-diagnostic | Le serveur écoute avant de vérifier sa configuration |
| Données | data-left-join-diagnostic | Les clients sans commande disparaissent |
| Données | data-transfer-atomicity-diagnostic | Le débit réussit, le crédit échoue |
| Données | data-firestore-retry-diagnostic | Une transaction envoie deux notifications |
| DevOps | docker-images-diagnostic | La nouvelle image, le même bug |
| DevOps | docker-volumes-diagnostic | Où sont passées les notes de Mémo ? |
| DevOps | docker-ports-diagnostic | Deux adresses, une seule API |
| Sécurité | security-object-owner-diagnostic | Être connecté donne accès au document d’autrui |
| Sécurité | security-sql-concatenation-diagnostic | La recherche mélange données et instruction SQL |
| Sécurité | security-html-comment-diagnostic | Un commentaire devient du HTML actif |
| Tests | tests-empty-pass-diagnostic | Le test passe sans vérifier le résultat |
| Tests | tests-expiry-boundary-diagnostic | Le jeton est valide exactement à son expiration |
| Tests | tests-mock-contract-diagnostic | Le faux service masque une réponse réelle différente |
| Architecture | architecture-rule-ui-diagnostic | La règle métier diverge entre deux écrans |
| Architecture | architecture-invalid-state-diagnostic | L’écran annonce succès et chargement ensemble |
| Architecture | architecture-lost-write-diagnostic | Deux modifications écrasent le même document |
| Performance | performance-lcp-lazy-diagnostic | L’image principale commence à charger trop tard |
| Performance | performance-eager-module-diagnostic | L’export alourdit chaque visite |
| Performance | performance-nplusone-diagnostic | Une page déclenche une requête par auteur |
| Pratiques de développement | engineering-staged-old-version-diagnostic | Le commit conserve l’ancienne correction |
| Pratiques de développement | engineering-semantic-conflict-diagnostic | Le conflit résolu supprime une règle utile |
| Pratiques de développement | engineering-stack-origin-diagnostic | Le dernier cadre de pile est accusé à tort |

## Références consultées pour les nouveaux dossiers

- [MDN — Object.assign et copie superficielle](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [MDN — Number.isInteger](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger)
- [Node.js — Processus et environnement](https://nodejs.org/api/process.html)
- [MDN — HTTP 304](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/304)
- [MDN — Utiliser Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN — Bouton HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button)
- [MDN — Opérateur de coalescence nulle](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
- [MDN — Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [TypeScript — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [React — Mettre à jour un tableau en état](https://react.dev/learn/updating-arrays-in-state)
- [React — Synchroniser avec un effet](https://react.dev/learn/synchronizing-with-effects)
- [React — Afficher des listes](https://react.dev/learn/rendering-lists)
- [MDN — Méthode POST](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST)
- [PostgreSQL — Isolation des transactions](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL — Jointures](https://www.postgresql.org/docs/current/tutorial-join.html)
- [Firebase — Transactions Firestore](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [OWASP — Autorisation](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP — Prévention des injections SQL](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [OWASP — Prévention XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Node.js — Tests et horloges simulées](https://nodejs.org/api/test.html)
- [Martin Fowler — Presentation Domain Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)
- [Patterns of Distributed Systems — Versioned Value](https://martinfowler.com/articles/patterns-of-distributed-systems/versioned-value.html)
- [web.dev — Optimiser le LCP](https://web.dev/articles/optimize-lcp)
- [web.dev — Chargement différé par import dynamique](https://web.dev/articles/code-splitting-with-dynamic-imports-in-nextjs)
- [PostgreSQL — EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [Git — git add](https://git-scm.com/docs/git-add)
- [Git — git merge](https://git-scm.com/docs/git-merge)
- [Node.js — Erreurs](https://nodejs.org/api/errors.html)

## Points de vigilance conservés

- Les exemples simplifient volontairement les systèmes ; la correction rappelle quand concurrence, livraison externe ou politique métier changent le choix.
- La copie de tableau ne copie pas les objets contenus ; copier chaque article simple est une alternative, pas une exigence générale de copie profonde.
- Promise.all ne garantit ni durée exacte ni annulation des opérations restantes.
- La validation TypeScript statique ne remplace pas la validation des entrées à l’exécution.
- Une transaction ne rend pas atomique un appel externe ; Firestore peut rejouer son callback.
- Les clés stables préservent l’identité des lignes ; les clés aléatoires recréent leur état.
- Une optimisation se vérifie par des mesures ; elle ne garantit pas un gain dans tous les environnements.

## Ajustements après première lecture indépendante

Les inspecteurs ont demandé une source adaptée au contrôle d’entiers, une gestion explicite des rejets des lectures concurrentes et des références directes pour la validation des entrées et les transactions SQL. Ces corrections sont intégrées. Les 33 nouvelles questions centrales sont individualisées, les descriptions des pièces précisent leur rôle et cinq dossiers ont reçu une seconde pièce de contrat ou d’observation.

Les réponses correctes et alternatives du jeu d’évaluation ont été réécrites dans une formulation d’élève, avec une intervention effectivement choisie. Le cas d’URL versionnée vérifie cette nouvelle URL plutôt qu’un ETag de l’ancienne ; le conflit de document propose If-Match avec un contrôle atomique ; l’expiration partielle ne contient plus les vérifications qu’elle est censée omettre. Les sources complémentaires suivantes ont également été consultées le 8 octobre 2026 :

- [OWASP — Validation des entrées](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [PostgreSQL — Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)

## Relecture indépendante

Terminée après corrections : [lot A](CHALLENGES_REVIEW_A_2026-10-08.md) et [lot B](CHALLENGES_REVIEW_B_2026-10-08.md), chacun 18 dossiers et 90 cas lus. Les réserves sont levées ; le verdict porte sur les textes, pas sur des retours Mistral réellement observés.

## Contrôles d’intégration

104 tests racine réussis, 12 tests Functions réussis (également inclus à la racine), builds frontend et Functions réussis. Les 180 réponses préparées passent la validation serveur et le budget de prompt réservé. Sept tests sur l’émulateur Firestore réussissent : sauvegarde de tous les nouveaux IDs, refus des IDs inconnus et des versions historiques inventées, propriété, immuabilité et quotas. Le hash des six snapshots Docker est inchangé. Recherche, filtre React (3 sur 36), état sans résultat, réinitialisation et ouverture d’un nouveau dossier contrôlés dans le navigateur local. Aucun appel Mistral supplémentaire pendant cette livraison.
