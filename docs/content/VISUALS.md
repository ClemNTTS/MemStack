# Illustrations et interactions

## Origine, droits et insertion

Les 30 SVG de `public/lessons/catalog/` sont des schémas originaux créés pour MemStack. Aucun dessin, logo, capture, texte long ou photographie externe n’a été repris. Les sources ci-dessous vérifient les concepts, sans fournir les illustrations. Il n’existe pas de licence globale du dépôt : ces fichiers restent soumis aux droits et à la future licence du projet ; aucune licence tierce n’est revendiquée.

Le manifest `src/data/catalog/visuals.ts` associe une leçon par parcours à un fichier, une alternative expliquant les relations, une légende et un placement après `example`. Les autres leçons utilisent exemples écrits et questions ; toutes les leçons ne nécessitent pas une image. Chaque figure représente un objectif précis : elle n’est pas une décoration ni une preuve de maîtrise.

Les SVG ont un `viewBox`, un titre, une description et des formes statiques. Les textes utilisent une police système et les relations disposent de flèches ou de limites explicites, sans dépendre uniquement de la couleur. La présentation reprend ivoire, encre et lilas. Les tailles principales sont de 24 unités ; les annotations de 22. Vérifier le rendu final sur petit écran et conserver l’alternative complète, car une image réduite ne garantit pas la lisibilité de toutes ses annotations.

Pour le clone de la leçon Docker existante, rediriger `example.nextStepId` vers la figure puis la figure vers `conclusion` ; l’insertion dans un tableau seule ne suffit pas lorsque des transitions sont explicites. Les données publiées d’origine restent distinctes du catalogue.

## Registre complet des 30 parcours

Sources ouvertes le **5 octobre 2026**. Les valeurs de performance, budget SRE et copies de données sont des exemples pédagogiques, pas des mesures du projet. Les frontières sont simplifiées ; le dialogue doit rappeler les conditions propres au service ou au langage.

| Parcours | Leçon illustrée | Fichier et utilité | Source primaire |
| --- | --- | --- | --- |
| `data-reasoning` | `fund-values-references` | `shared-reference.svg` : a et b désignent le même objet. Modifier b.score modifie l’objet lu par a. | [Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Assignment) |
| `systems-basics` | `systems-process` | `process-resources.svg` : Le même programme peut démarrer deux processus ayant leur propre mémoire et leurs propres ressources. | [Documentation](https://man7.org/linux/man-pages/man2/fork.2.html) |
| `http-basics` | `http-request-response` | `http-exchange.svg` : Le client envoie GET /lessons au serveur. Le serveur répond 200 avec une représentation JSON. | [Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview) |
| `accessible-ui` | `ui-box-model` | `css-box.svg` : De l’extérieur à l’intérieur : marge, bordure, remplissage et contenu. | [Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_model/Introduction) |
| `browser-runtime` | `browser-dom-events` | `event-propagation.svg` : Dans la phase de bouillonnement, un clic sur le bouton traverse le bouton puis son parent. La capture suit l’autre sens. | [Documentation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling) |
| `javascript-core` | `js-scope` | `closure-scope.svg` : Une fonction interne conserve l’accès aux variables de sa portée externe même après le retour de cette dernière. | [Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) |
| `javascript-async` | `js-promise` | `promise-states.svg` : Une promesse en attente peut devenir accomplie ou rejetée. Ces deux états sont terminaux. | [Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) |
| `typescript-core` | `ts-narrowing` | `type-narrowing.svg` : Un test typeof distingue la branche string de la branche non string. La vérification permet des opérations adaptées. | [Documentation](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) |
| `react-state` | `react-render` | `react-cycle.svg` : Une mise à jour déclenche un rendu React puis un commit. Le navigateur peut ensuite peindre l’écran. | [Documentation](https://react.dev/learn/render-and-commit) |
| `react-effects` | `react-effect-cleanup` | `effect-cleanup.svg` : Un effet installe un abonnement. Son nettoyage retire cet abonnement avant une nouvelle installation ou au démontage. | [Documentation](https://react.dev/learn/synchronizing-with-effects) |
| `node-server` | `node-validation` | `api-validation.svg` : Le navigateur envoie des données. Le serveur vérifie autorisation et format avant de les enregistrer. | [Documentation](https://nodejs.org/learn/getting-started/security-best-practices) |
| `rest-design` | `rest-resources` | `rest-resources.svg` : Une URL désigne une ressource. GET en demande la représentation ; DELETE demande sa suppression selon le contrat. | [Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview) |
| `backend-resilience` | `backend-queue` | `queue-ack.svg` : Le producteur place une tâche dans une file. Le consommateur la traite puis confirme selon le protocole de la file. | [Documentation](https://www.rabbitmq.com/docs/confirms) |
| `sql-basics` | `sql-transactions` | `sql-transaction.svg` : BEGIN ouvre une transaction ; deux écritures sont validées ensemble par COMMIT ou annulées par ROLLBACK. | [Documentation](https://www.postgresql.org/docs/current/tutorial-transactions.html) |
| `document-data` | `firestore-paths` | `firestore-path.svg` : Le chemin users/uid/cards/cardId alterne collection, document, collection et document. Chaque document contient des champs. | [Documentation](https://firebase.google.com/docs/firestore/data-model) |
| `docker-basics` | `docker-volumes-persistence` | `docker-persistence.svg` : Un conteneur remplacé peut retrouver les données du même volume. La couche inscriptible du conteneur ne survit pas à sa suppression. | [Documentation](https://docs.docker.com/engine/storage/volumes/) |
| `cicd-basics` | `cicd-pipeline` | `ci-pipeline.svg` : Un événement push déclenche des tests. Le déploiement attend leur réussite et ses propres conditions. | [Documentation](https://docs.github.com/en/actions/get-started/understand-github-actions) |
| `cloud-basics` | `cloud-responsibility` | `cloud-responsibility.svg` : Dans cet exemple de conteneur géré, le fournisseur gère l’hôte. Le client garde le code, les permissions et les données. | [Documentation](https://docs.cloud.google.com/run/docs/securing/security) |
| `terraform-basics` | `terraform-state` | `terraform-state.svg` : La configuration décrit le souhait. L’état relie les adresses Terraform aux objets distants. Le fournisseur lit les ressources réelles. | [Documentation](https://developer.hashicorp.com/terraform/language/state) |
| `kubernetes-basics` | `k8s-deployment` | `kubernetes-reconcile.svg` : Un contrôleur observe deux pods pour un objectif de trois, puis crée un remplacement pour réduire cet écart. | [Documentation](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) |
| `observability-basics` | `obs-signals` | `observability-signals.svg` : Une métrique indique un changement, une trace situe le temps dans une requête et un journal décrit un événement. | [Documentation](https://opentelemetry.io/docs/concepts/signals/) |
| `sre-basics` | `sre-error-budget` | `sre-budget.svg` : Pour un SLO de 99 pour cent sur 10000 requêtes éligibles, le budget autorise 100 requêtes non conformes dans la fenêtre. | [Documentation](https://sre.google/workbook/implementing-slos/) |
| `identity-access` | `security-authn-authz` | `auth-permission.svg` : Une identité valide est vérifiée avant la permission sur un objet donné. Être Alice ne donne pas les données de Bob. | [Documentation](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) |
| `web-security` | `security-injection` | `sql-parameters.svg` : Le SQL et la valeur utilisateur sont transmis séparément. Le paramètre reste une donnée et ne devient pas la syntaxe SQL. | [Documentation](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) |
| `test-strategy` | `tests-unit-integration` | `test-boundaries.svg` : Le test unitaire vise une fonction ; l’intégration vise la coopération de modules ; le bout en bout vise le parcours utilisateur. | [Documentation](https://nodejs.org/api/test.html) |
| `architecture-boundaries` | `arch-state-machine` | `state-machine.svg` : Une demande fait passer idle à loading puis success ou error. Une erreur peut déclencher une nouvelle tentative. | [Documentation](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html) |
| `distributed-basics` | `dist-cache-invalidation` | `cache-lookup.svg` : Le cache doit contenir une entrée encore valide pour répondre. Une entrée absente ou expirée impose de recharger la source puis de remplir le cache. | [Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) |
| `performance-basics` | `perf-measure` | `performance-waterfall.svg` : Dans cet exemple séquentiel, le téléchargement du bundle dure davantage que le traitement serveur. Mesurer permet de cibler ce coût. | [Documentation](https://web.dev/articles/critical-rendering-path) |
| `git-collaboration` | `git-working-tree` | `git-staging.svg` : git add copie le contenu choisi dans l’index ; git commit enregistre le contenu de l’index dans un nouveau commit. | [Documentation](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository) |
| `maintenance-basics` | `debug-hypothesis` | `debug-hypothesis.svg` : Une observation est choisie pour distinguer deux hypothèses. Le résultat guide l’enquête plutôt que de multiplier les modifications. | [Documentation](https://developer.chrome.com/docs/devtools/network/) |

## Interactions de compréhension

Chaque proposition ci-dessous est un scénario d’anticipation ou de diagnostic à intégrer au dialogue, avec un distracteur plausible et un retour causal. Elles peuvent être adaptées à l’exemple rédigé ; le verdict de rappel Oui/Non reste réservé aux cartes. Aucun terminal exécuté, classement ou score n’est ajouté. La présence d’un choix ne suffit pas : un retour doit expliquer la distinction enseignée.

| Parcours | Question concrète à faire prévoir | Explication essentielle après choix |
| --- | --- | --- |
| `data-reasoning` | b.score = 2 après b = a : que lit a.score ? | 2 : les deux noms désignent le même objet. |
| `systems-basics` | Deux lancements du même programme partagent-ils automatiquement leur mémoire ? | Non : ce sont deux processus avec des ressources propres. |
| `http-basics` | Qui envoie GET /lessons et qui choisit le statut de réponse ? | Le client envoie la requête ; le serveur construit la réponse. |
| `accessible-ui` | Une boîte content-box de 100 px avec padding 10 px et bordure 1 px fait quelle largeur hors marge ? | 122 px : contenu + deux paddings + deux bordures. |
| `browser-runtime` | Un clic sur un bouton atteint-il un listener de sa section par bouillonnement ? | Oui si la propagation n’est pas interrompue ; la cible reste le bouton. |
| `javascript-core` | Une fermeture relit-elle la variable capturée ou une copie figée de sa valeur ? | Elle garde l’accès à la variable ; un changement ultérieur peut être visible. |
| `javascript-async` | Une promesse accomplie peut-elle ensuite redevenir en attente ? | Non, fulfilled et rejected sont terminaux. |
| `typescript-core` | Peut-on appeler toUpperCase sur unknown sans test réel ? | Non : vérifier typeof ou une autre condition adaptée avant cet appel. |
| `react-state` | Peut-on modifier une donnée externe pendant le rendu pour la préparer ? | Non : le rendu calcule l’UI et doit rester pur. |
| `react-effects` | Que faut-il retirer avant de réinstaller une souscription remplacée ? | La souscription précédente, via le nettoyage de l’effet. |
| `node-server` | Un client peut-il contourner la validation JavaScript affichée dans le formulaire ? | Oui : le serveur doit vérifier lui-même les données reçues. |
| `rest-design` | GET /lessons/42 représente-t-il normalement une demande de lecture ou de suppression ? | Une lecture ; la méthode et le contrat expriment l’intention. |
| `backend-resilience` | Un worker termine une tâche mais perd son accusé : peut-elle revenir ? | Selon le système, oui ; le traitement doit tolérer la livraison répétée. |
| `sql-basics` | Deux écritures liées : que faire si la seconde échoue dans la transaction ? | Annuler la transaction pour ne pas conserver une moitié de l’opération. |
| `document-data` | Dans users/uid/cards/cardId, cards est-il un document ou une collection ? | Une collection ; les segments alternent collection et document. |
| `docker-basics` | Supprimer le conteneur efface-t-il nécessairement un volume nommé réutilisé ? | Non : le volume est distinct ; le remonter permet de retrouver ses données. |
| `cicd-basics` | Des tests échouent : un job de déploiement dépendant doit-il continuer normalement ? | Non : la condition de succès doit bloquer ce déploiement. |
| `cloud-basics` | Un conteneur géré dispense-t-il de définir les droits sur les données ? | Non : la configuration et les droits restent à la charge du client. |
| `terraform-basics` | L’état Terraform est-il l’infrastructure elle-même ? | Non : il relie les adresses de configuration aux ressources distantes. |
| `kubernetes-basics` | Trois replicas souhaités mais deux observés : quelle action tente le contrôleur ? | Créer un remplacement pour tendre vers l’état souhaité. |
| `observability-basics` | Pour situer la lenteur d’une requête entre services, quel signal est le plus direct ? | Une trace ; les métriques et logs apportent un contexte complémentaire. |
| `sre-basics` | SLO de 99 % sur 10 000 requêtes : quel budget de non-conformité ? | 100 requêtes, dans la fenêtre et avec la population définies. |
| `identity-access` | Alice connectée demande la fiche privée de Bob : la connexion suffit-elle ? | Non : vérifier son autorisation sur cet objet précis. |
| `web-security` | Pourquoi une valeur séparée par paramètre ne devient-elle pas une instruction SQL ? | Le pilote la lie comme donnée plutôt que de concaténer la syntaxe SQL. |
| `test-strategy` | Un fake de stockage confirme-t-il que les règles Firestore réelles fonctionnent ? | Non : il faut aussi une vérification ciblant le service et ses règles. |
| `architecture-boundaries` | Un écran peut-il être simultanément idle et loading dans cette union d’états ? | Non : un état exclusif et des transitions explicites empêchent cette combinaison. |
| `distributed-basics` | Une réponse présente dans le cache est-elle forcément à jour ? | Non : définir expiration ou invalidation selon le contrat métier. |
| `performance-basics` | Dans cet exemple, faut-il optimiser d’abord le serveur 80 ms ou le bundle 400 ms ? | Explorer d’abord le bundle, le coût dominant mesuré sur ce trajet. |
| `git-collaboration` | Un fichier modifié après git add entre-t-il entièrement dans le prochain commit ? | Non : le commit conserve le contenu préparé, sauf nouvelle préparation. |
| `maintenance-basics` | Un statut 200 suffit-il à prouver que toute l’application fonctionne ? | Non : vérifier aussi contenu et traitement ; le statut n’est qu’une observation. |

## Contrôles et limites

Le manifest couvre les 30 parcours avec 30 illustrations locales. Les alternatives, légendes et choix sont inspectés avec les dialogues et cartes par le rôle pédagogique. Le contrôle XML vérifie la syntaxe des fichiers ; les tests de catalogue vérifient existence, insertion et chemins atteignables. Ces contrôles techniques ne prouvent ni efficacité d’apprentissage ni absence d’ambiguïté : consigner le verdict humain/agent dans `REVIEW.md` et ajuster après usage réel.
