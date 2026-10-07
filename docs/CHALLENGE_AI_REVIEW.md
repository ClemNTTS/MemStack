# Vérification indépendante des défis IA

Inspection du 7 octobre 2026. Cette revue porte sur l’implémentation locale ; elle ne confirme pas une activation en production ni la qualité d’un retour réel de Mistral.

## Résultats

| Vérification | Résultat |
| --- | --- |
| `npm run build` | Réussi : TypeScript et bundle Vite. Avertissement de taille du bundle existant. |
| `npm test` | 100 tests réussis lors de la vérification finale, dont 10 tests serveur, 4 tests indépendants de contrat/fournisseur et le contrôle du jeu d’évaluation. |
| Contrat client/serveur et fournisseur simulé | 4 tests indépendants réussis, intégrés à la commande racine. |
| Règles et transactions sur émulateur Firestore | 6 tests indépendants réussis. Java 21 et Firebase CLI utilisés localement. |

Les tests indépendants sont dans `tests/challenge-ai/`. Leur README décrit comment les relancer. Les tests du fournisseur utilisent un faux `fetch` ; aucun secret ni appel Mistral n’est nécessaire.

Les six tests émulateur ont été relancés avec succès après ajout du nettoyage des projets de test isolés. La commande racine ne remplace pas cette vérification des règles et des transactions Firestore.

## Garanties vérifiées

- Les anciennes tentatives version 1 restent lisibles et évaluables une seule fois ; leurs réponses et dates restent immuables.
- Les tentatives structurées version 2 exigent deux champs non vides, 2 000 caractères maximum par champ et 4 000 au total, séparateur inclus. L’agrégat doit correspondre exactement aux champs.
- Un utilisateur ne peut pas lire ou écrire les tentatives d’un autre compte, supprimer une tentative, réécrire une réponse, falsifier un retour IA ni accéder aux compteurs serveur.
- Deux demandes concurrentes sur la même tentative produisent une seule réservation. Une réservation expirée passe en vérification requise sans autoriser un deuxième appel fournisseur.
- Deux comptes tentant de réserver la dernière place globale ne peuvent pas dépasser le quota. Les compteurs et le résultat en cours sont écrits dans la même transaction.
- Le fournisseur reçoit le dossier, les fichiers, la correction et les champs de réponse. La réponse de l’élève est encodée comme donnée, séparée des instructions système.
- Les erreurs HTTP, les réponses JSON malformées et les réponses tronquées sont rejetées sans nouvel appel automatique. Un retour valable conserve seulement le message pédagogique.
- Les états serveur `processing`, `completed` et `needs_review` sont compatibles avec le décodage du navigateur.

## Défauts trouvés et corrigés pendant la revue

Les limites de réponse divergeaient entre navigateur et serveur ; elles sont maintenant alignées. La version du prompt était une chaîne côté serveur mais attendue comme entier côté navigateur ; le contrat est désormais une chaîne. Les messages des états non terminés ont été harmonisés, avec une explication affichée dans l’interface. Ces corrections évitent le rejet de tous les retours par le client.

## Inspection du code et limites

Le serveur dérive le propriétaire du jeton Firebase, charge lui-même la tentative et le dossier versionné, et garde la clé Mistral dans Secret Manager. Les lectures et retours asynchrones client revérifient le compte ; les composants sont isolés par compte et tentative. Ces points ont été inspectés dans le code, sans simulation automatisée d’un changement de compte dans le navigateur.

Les quotas actuels limitent les demandes et réservent un budget de jetons conservateur, y compris en cas d’échec incertain. Ils protègent les dépenses de la bêta ; ce ne sont pas des crédits commerciaux débités à l’utilisateur. Aucun paiement n’est implémenté.

Restent à valider avant activation : configuration Blaze, Secret Manager, modèle versionné, comptes invités, App Check, déploiement de la fonction et des règles, puis une tentative réelle. Le test émulateur couvre les transactions de production mais pas le transport callable déployé. L’efficacité pédagogique et l’acceptation des réponses alternatives demandent une évaluation humaine sur les exemples préparés.

L’arrêt après erreur incertaine est volontaire : `needs_review` ne se relance pas automatiquement. Aucune procédure de reprise administrative n’est implémentée. Les plafonds quotidiens sont des réservations de demandes et de jetons, pas une garantie de plafond de facture Firebase globale ; il faut distinguer ces contrôles applicatifs de toute protection financière configurée dans la plateforme.

Vérification manuelle navigateur sur émulateurs Auth/Firestore : dossier version 2 et deux champs visibles ; une réponse fictive enregistrée est confirmée avant affichage de la correction, avec lien de référence et historique. IA désactivée pendant ce test ; aucun appel fournisseur.
