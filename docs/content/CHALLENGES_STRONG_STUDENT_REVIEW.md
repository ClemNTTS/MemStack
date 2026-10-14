# Revue étudiant fort — 36 défis version 3

Inspection du 13 octobre 2026. Réponses aux 108 questions choisies à partir des scénarios, pièces publiques, libellés et options. Aucun appel fournisseur ni donnée réelle utilisateur.

Limite de méthode : la première lecture de structure a exposé accidentellement les trois explications de `docker-images-diagnostic`. Les lectures suivantes ont projeté seulement prompt/options et les 35 autres défis ont été résolus sans correction. La fixture a été écrite avant confrontation des clés ; les IDs ont ensuite été remappés après permutation des options, en conservant les attentes conceptuelles. Le premier défi ne constitue donc pas une preuve aveugle indépendante.

Résultat après confrontation : 108/108 réponses conformes aux clés, aucune alternative proposée injustement refusée identifiée. Les questions couvrent diagnostic, intervention et vérification/précaution.

Défauts signalés et corrigés : cycle de positions abc/cab/bca prévisible sur tout le catalogue ; distracteur preload ambigu pour LCP. Les positions finales permettent des répétitions dans un même défi. Certains distracteurs restent faciles ; cette revue contrôle cohérence et absence de faux refus, pas une mesure de difficulté ni une certification de compétence.

| Défi | Attente indépendante et revue |
| --- | --- |
| `docker-images-diagnostic` | Image v1 ; recréation depuis v2 ; sécuriser données utiles. Limite de lecture indiquée ci-dessus. |
| `docker-volumes-diagnostic` | Couche inscriptible perdue ; même volume sur /app/data ; persistance différente de récupération et sauvegarde. |
| `docker-ports-diagnostic` | localhost du worker ; ports hôte/interne distingués ; portée loopback. |
| `fund-shared-cart-diagnostic` | Objets partagés ; remplacement de l’objet modifié ; original 10 et brouillon 20. D’autres copies seraient valables mais ne sont pas proposées. |
| `fund-stock-invariant-diagnostic` | Quantité entière positive et au plus stock ; refus sans mutation. |
| `systems-env-process-diagnostic` | Environnement reçu au démarrage ; configurer lanceur puis redémarrer ; vérifier second démarrage. |
| `http-stale-cache-diagnostic` | ETag lié au contenu ; ancien validateur reçoit 200/v2 puis nouveau validateur reçoit 304. |
| `web-fetch-error-diagnostic` | fetch ne rejette pas un 403 ; tester réponse ; refus sans suppression visuelle. |
| `web-keyboard-action-diagnostic` | Bouton natif, nom/focus ; Tab/Entrée/Espace. Alternatives excluent explicitement les comportements nécessaires. |
| `js-zero-default-diagnostic` | 0 falsy mais non nullish ; ?? ; résultats 0/7/20/20. |
| `js-serial-requests-diagnostic` | await successifs ; Promise.all ; rejet groupé sans annulation automatique prétendue. |
| `ts-unchecked-api-diagnostic` | Assertion sans validation runtime ; valider unknown ; erreur contrôlée avant méthode string. |
| `react-mutated-list-diagnostic` | Tableau muté et référence identique ; setter fonctionnel immuable ; tous ajouts conservés. |
| `react-stale-search-diagnostic` | Réponse ancienne appliquée ; garde requête/effet courant ; résultats react. |
| `react-index-keys-diagnostic` | Clé de position ; id stable ; brouillon attaché à b. |
| `backend-invalid-body-diagnostic` | Entrée non fiable ; entiers 1..5 ; aucune réservation invalide. Le contrat exclut la coercition implicite d’une chaîne. |
| `backend-payment-retry-diagnostic` | Accusé perdu ne signifie pas échec ; idempotence atomique ; contenu incompatible refusé. |
| `backend-env-secret-diagnostic` | Configuration obligatoire avant disponibilité ; aucun secret exposé ; joignabilité séparée. |
| `data-left-join-diagnostic` | WHERE élimine NULL ; filtre dans ON ; COUNT id donne zéro. |
| `data-transfer-atomicity-diagnostic` | Débit autocommit isolé ; transaction des deux écritures ; rollback restaure soldes. |
| `data-firestore-retry-diagnostic` | Callback rejoué ; événement transactionnel livré avec déduplication ; après commit ne garantit pas exactement une fois. |
| `security-object-owner-diagnostic` | Authentification différente d’autorisation ; contrôle serveur propriétaire ; cas interdits testés. |
| `security-sql-concatenation-diagnostic` | Concaténation modifie instruction ; paramètres liés ; entrée littérale. |
| `security-html-comment-diagnostic` | HTML interprété ; textContent ; aucun gestionnaire exécuté. |
| `tests-empty-pass-diagnostic` | Aucune assertion ; résultat 90 vérifié ; rouge avant correction puis vert. |
| `tests-expiry-boundary-diagnostic` | Frontière invalide ; validité strictement inférieure ; true/false/false. |
| `tests-mock-contract-diagnostic` | Faux tableau incompatible objet items ; aligner faux et lecture ; erreur structure invalide. |
| `architecture-rule-ui-diagnostic` | Page 90/export 100 ; fonction commune ; 99/90/90.9. |
| `architecture-invalid-state-diagnostic` | loading/success simultanés ; état exclusif ; rejet failed sans chargement. |
| `architecture-lost-write-diagnostic` | Version obsolète ; comparaison atomique serveur ; conflit sans écrasement. |
| `performance-lcp-lazy-diagnostic` | Découverte tôt/requête tard ; retirer lazy et mesurer priorité ; traces comparables. Distracteur preload corrigé. |
| `performance-eager-module-diagnostic` | Import statique impose 600 Ko ; import dynamique ; exports corrects et attente possible. |
| `performance-nplusone-diagnostic` | N+1 ; regroupement ou jointure sur page ; coût/résultats/auteurs absents. |
| `engineering-staged-old-version-diagnostic` | Index version préparée ; préparer ciblé ; diff --cached. |
| `engineering-semantic-conflict-diagnostic` | Remise maximale perdue ; garder les deux règles ; tests séparés et combinés. |
| `engineering-stack-origin-diagnostic` | formatName/name absent ; reproduire/consulter contrat ; comportement documenté et cas valide. |

## Complément aveugle pour Docker-images

Un agent supplémentaire sans historique a lu uniquement scénario, fichiers, questions et options (aucune clé, correction ou fixture). Ses réponses diagnosis=c, action=c, verification=b correspondent aux trois bonnes réponses. Ce contrôle complémentaire couvre le dossier partiellement exposé lors de la première lecture, sans effacer cette limite méthodologique.
