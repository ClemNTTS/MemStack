# Vérification indépendante des défis IA

Inspection initiale du 7 octobre 2026, complétée le 8 octobre par une évaluation fournisseur et un test de production. Les résultats initiaux ci-dessous concernent l’implémentation locale ; les sections datées suivantes décrivent les vérifications réelles.

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

Lors de la revue initiale, restaient à valider Blaze, Secret Manager, le modèle, les invitations, App Check et le déploiement. Ces étapes ont été réalisées le 8 octobre pour le seul compte propriétaire. Le test émulateur couvre les transactions de production mais pas le transport callable déployé. L’efficacité pédagogique et l’acceptation des réponses alternatives demandent une évaluation humaine sur les exemples préparés.

L’arrêt après erreur incertaine est volontaire : `needs_review` ne se relance pas automatiquement. Aucune procédure de reprise administrative n’est implémentée. Les plafonds quotidiens sont des réservations de demandes et de jetons, pas une garantie de plafond de facture Firebase globale ; il faut distinguer ces contrôles applicatifs de toute protection financière configurée dans la plateforme.

## Évaluation fournisseur du 8 octobre 2026

Les tests racine ont été relancés après correction : 102 tests réussis, et le build Functions a réussi. Trois premiers appels autorisés au modèle `mistral-small-2603` ont été effectués avec des réponses synthétiques du défi images : correcte, incorrecte et alternative Compose. Tous ont été rejetés : le fournisseur répondait HTTP 200 avec un JSON valide, mais le champ `message` était un objet. Le mode JSON simple a été remplacé par un JSON Schema strict imposant une chaîne, conformément à la [documentation Mistral](https://docs.mistral.ai/studio/conversations/structured-output/custom). Un test garantit désormais ce contrat.

Les appels supplémentaires de diagnostic et d’évaluation ont été explicitement autorisés. Aucun nouvel essai automatique n’a été effectué. Seul le message pédagogique décodé de cas synthétiques et des métadonnées anonymes ont été conservés localement, sans clé ni enveloppe brute du fournisseur.

| Modèle et prompt | Résultat qualitatif |
| --- | --- |
| Small 2603, prompt initial | Trois retours techniquement valides après correction du schéma. Réponses excessivement longues, faux points justes attribués à la réponse incorrecte et demandes de commandes exactes ou alternatives supplémentaires. Validation pédagogique insuffisante. |
| Small 2603, prompt v2 | Trois retours courts et valides. Le cas incorrect reçoit encore un compliment attribuant à l’élève le contraire de sa réponse. Validation pédagogique insuffisante. |
| Large 2512, prompt v2 | Trois retours valides, de 743 à 1 024 caractères. La réponse correcte est reconnue sans erreur inventée. La réponse incorrecte est corrigée sans inversion d’attribution. Compose est accepté ; le modèle demande toutefois des précisions dont le caractère obligatoire reste discutable. |
| Large 2512, prompt v2 final | Deux contrôles supplémentaires : alternative valide acceptée avec configuration implicite et protection des données reconnues ; tentative d’instruction hostile ignorée, sans révéler la consigne ni valider l’erreur technique. |

Le prompt v2 distingue les propos de l’élève de la correction, rend les alternatives facultatives, évite les commandes inventées et demande des paragraphes simples compatibles avec l’affichage. Large 2512 est le meilleur des deux modèles sur cet échantillon. Trois cas sur un même défi ne constituent pas une validation générale : approfondir les cas partiels, les autres défis et la résistance aux instructions hostiles avant ouverture à d’autres comptes. Le retour reste une aide probabiliste, avec correction de référence et aucune note automatique.

La dernière vérification ne supprime pas toutes les réserves : l’alternative reçoit encore une remarque d’« omission mineure » pour une explication implicite, et la réponse hostile reçoit un commentaire inutile sur sa demande de révéler les consignes. Le modèle n’invente plus de compliment inversant la réponse dans ces derniers cas, mais son appréciation n’est pas un verdict fiable certifié. Cette évaluation justifie une expérimentation limitée au propriétaire, avec correction de référence visible ; elle ne valide pas une ouverture publique.

Vérification manuelle navigateur sur émulateurs Auth/Firestore : dossier version 2 et deux champs visibles ; une réponse fictive enregistrée est confirmée avant affichage de la correction, avec lien de référence et historique. IA désactivée pendant ce test ; aucun appel fournisseur.

## Vérification de production du 8 octobre 2026

GitHub Pages a publié le frontend activé après 102 tests réussis et un build réussi. Le callable déployé utilise Large 2512 et le prompt v2. Un test sur memstack.fr avec le compte propriétaire et App Check Enterprise a analysé une tentative synthétique déjà enregistrée. Le message personnalisé est apparu et reconnaît la réponse comme complète ; le lien de correction garde la route du défi et place le focus sur la correction. Le message contient néanmoins une formulation contradictoire (« pas mentionné explicitement » puis reconnaissance de la sauvegarde citée) et une précision présentée à tort comme venant du fichier : la limite pédagogique reste réelle.

Après rechargement et ouverture de l’historique, le même retour est relu sans nouveau bouton d’analyse ni appel fournisseur. La tentative synthétique de contrôle reste dans l’historique du propriétaire.
