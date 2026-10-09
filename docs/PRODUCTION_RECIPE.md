# Recette de production — 9 octobre 2026

Les sept fonctionnalités sont déployées sur memstack.fr avec les cinq callables Firebase et les règles Firestore. Le rôle administrateur des deux comptes autorisés a été attribué et relu sur Firebase, en conservant leurs autres claims. Aucune identité personnelle n’est publiée dans ce compte rendu.

## Résultats

| Fonctionnalité | Vérification | Résultat |
| --- | --- | --- |
| Suivi des signalements | Lecture serveur et actualisation du compte connecté ; deux signalements de recette retrouvés | Réussite |
| Signalements défi et analyse | Création depuis les deux formulaires ; défi v2, grille v1, analyse `challenge-feedback-v4` et modèle conservés ; statut de revue humaine | Réussite, verdict inchangé |
| Export du compte | Téléchargement JSON réel ; version 1 et 48 documents serveur, données locales incluses | Réussite |
| Suppression | Bouton désactivé sans confirmation exacte en production ; effacement récursif, anonymisation et préservation des autres comptes vérifiés sur émulateur | Garde production vérifié ; aucun compte réel effacé |
| Brouillons | Sauvegarde, restauration après rechargement, suppression après accusé de tentative puis nouveau rechargement | Réussite |
| Accès IA et quota | Droits et quota lus sur serveur, réinitialisation affichée ; nouvelle tentative autorisée dans la limite disponible | Réussite |
| Administration | Écriture des droits existants du compte test, accusé serveur et journalisation ; adresse inexistante refusée | Réussite |
| Filtres | Historique sans verdict et défis à retravailler/validés sur deux comptes ; deux défis validés après nouvelle tentative | Réussite |

La tentative correcte de recette sur `tests-expiry-boundary-diagnostic` a reçu un verdict IA `validated`. La comparaison montre l’ancienne tentative à retravailler et la nouvelle validée, sans inventer de points détaillés pour l’ancien retour v3. Les deux signalements sont explicitement étiquetés comme tests sans défaut à corriger ; ils restent dans le compte dédié et ne déclenchent pas le worker de corrections de leçons.

Les cinq endpoints déployés refusent les requêtes anonymes sans attestation avec HTTP 401. Google Auth et App Check restent obligatoires. La connexion propose désormais un choix explicite de compte Google.

## Validation et limites

155 tests applicatifs passent, dont les tests des modules serveur ; 13 tests supplémentaires sur émulateur couvrent les règles, les réservations concurrentes et le cycle de suppression. Les builds frontend et Functions réussissent. GitHub Pages et le déploiement Firebase ont terminé avec succès.

La première CI a révélé une dépendance serveur manquante : les workflows installent maintenant le lockfile `functions` avant les tests. Un échec initial de synchronisation navigateur n’a pas été reproduit après rechargement ; aucun contournement de droits n’a été ajouté.

La suppression complète n’a pas été exercée sur une identité Google de production : les deux comptes administrateurs réutilisables sont conservés. Une publication éditoriale réelle n’a pas été fabriquée pour la recette ; la preuve de déploiement d’une correction reste couverte par les tests du worker et nécessite une vraie proposition revue et fusionnée. La politique de conservation et l’évaluation fournisseur étendue restent à terminer avant ouverture publique.
