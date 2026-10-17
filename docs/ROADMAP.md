# Feuille de route

État du **17 octobre 2026**. [PRODUCT.md](PRODUCT.md) décrit le fonctionnement actuel ; [VISION.md](VISION.md) conserve les propositions initiales. Les décisions et le code actuels remplacent les anciennes mentions d’accès exclusivement Google, de découverte illimitée, de verdict IA obligatoire ou de classement hors périmètre.

## Implémenté

- Espace Développement : 12 thèmes, 30 parcours, 150 leçons, 450 cartes, chemin guidé, bibliothèque, consolidation et révisions espacées.
- Comptes Google ou email vérifié, synchronisation des préférences et de la progression, import explicite, export et suppression avec protections serveur.
- Gratuit : une nouvelle leçon et cinq révisions dues par jour à Paris, contrôlées côté serveur ; Premium sans ces plafonds, avec accès aux défis.
- 36 défis actifs v4 de cinq questions, correction déterministe serveur et réussite à 4/5. Prérequis : leçons liées et au moins deux leçons de la thématique. Historique versionné et brouillons conservés ; aucun appel Mistral nécessaire.
- Niveaux, XP, badges, séries, pseudo et classement mondial alimenté par les activités serveur.
- Signalements versionnés, suivi des corrections, propositions assistées et administration avec journal ; revue humaine avant fusion des propositions.
- Espace Entreprise séparé par organisation : huit chapitres, vingt missions initiales, deux complémentaires, 66 cartes, huit situations, invitations, suivi d’équipe et classement interne.
- Stripe Managed Payments personnel et Entreprise, droits vérifiés serveur, webhooks signés et idempotents, portail et rapprochement des quantités Entreprise.
- Présentation publique et pages d’information ; apprentissage réservé aux comptes connectés et en ligne.

## Preuves disponibles et limites

Le [point d’entrée des preuves et de l’état de livraison](STATUS.md) relie les recettes spécialisées et leurs limites.

Les [recettes de production historiques](PRODUCTION_RECIPE.md), [abonnements personnels](SUBSCRIPTIONS.md), [qualification Stripe](STRIPE_QUALIFICATION.md), [classement](WORLD_RANKING.md) et [déploiement Entreprise du 15 octobre](ENTERPRISE_DEPLOYMENT_20261015.md) consignent les vérifications et déploiements réalisés. Les tests automatisés, émulateurs et recettes sur services déployés ont des périmètres différents : un test local ne prouve pas une publication, et un paiement TEST ne prouve pas un paiement LIVE.

Les contrôles pédagogiques serveur et le classement sont documentés comme déployés. Les parcours Stripe personnels et Entreprise ont des preuves TEST, dont certaines sur les services déployés. **Le LIVE reste fermé** ; le frontend personnel documenté conserve `VITE_SUBSCRIPTIONS_ENABLED=false`. Toute nouvelle publication ou ouverture commerciale nécessite sa propre vérification de configuration et l’autorisation du propriétaire.

L’ancien service Mistral et ses résultats de qualification restent documentés dans [CHALLENGE_AI.md](CHALLENGE_AI.md). Sa qualification ne bloque plus les défis QCM actifs ; les essais historiques ne justifient pas de le présenter comme un service pédagogiquement qualifié.

## À terminer avant ouverture commerciale

| Priorité | Chantier | Reste à faire | Critère de livraison |
| --- | --- | --- | --- |
| 1 | Informations et procédures du lancement | Compléter identité, contacts, conditions, conservation et traitement des données ; finaliser l’information des équipes | Informations approuvées et publiées, durées décidées et procédures opérationnelles vérifiées ; voir [LEGAL_LAUNCH.md](LEGAL_LAUNCH.md) |
| 1 | Activation commerciale personnelle et Entreprise | Revoir la configuration LIVE, tarifs TTC, droits, webhooks, portail, résiliation et quantités ; coordonner interface et disponibilité | Autorisation explicite, configuration vérifiée et recette LIVE encadrée ; aucun accès accordé par le seul retour navigateur |
| 1 | Recette utilisateur de bout en bout | Consolider mobile réel, connexion Google/email vérifié, installation, rechargement, changement de compte, pannes réseau et droits expirés | Matrice datée avec appareils et résultats, clavier et mouvements réduits compris ; voir aussi [recette UI Entreprise](ENTERPRISE_UI_QUALIFICATION_20261015.md) |
| 1 | Exploitation et reprise | Compléter suppression sur compte jetable en production, incidents, reprise de synchronisation/facturation et retour arrière | Procédures exécutables, responsables et preuves datées, sans facturation orpheline ni succès présenté avant accusé serveur |
| 2 | Performance du chargement | Mesurer sur mobile et identifier les ressources dominantes du bundle initial | Mesures avant/après et amélioration ciblée, sans sacrifier les contrôles d’accès |

## Améliorations après qualification

| Chantier | Objectif et preuve attendue |
| --- | --- |
| Maintenance du contenu | Éprouver durée, difficulté et ambiguïtés avec des utilisateurs ; corrections sourcées et inspectées, identifiants et versions préservés |
| Couverture des compétences | Relier les défis aux compétences et formats diagnostic/revue/décision ; le nombre de dossiers ne suffit pas à prouver leur couverture |
| Offre Entreprise continue | Publier de nouvelles missions quand elles sont prêtes, sans promettre une cadence non tenue ; préserver progression et échéances |
| Documentation | Maintenir produit, architecture, procédures et instructions du dépôt cohérents à chaque changement de comportement ou de déploiement |

## Options à décider séparément

Notifications facultatives, veille éditoriale, statistiques de rappel sur période définie et retour personnalisé IA peuvent être évalués à partir de besoins réels. Une éventuelle réactivation du service Mistral exige une qualification propre, ses contrôles serveur et une décision explicite ; elle ne doit pas redevenir implicitement un verrou des QCM.

L’exécution de code apprenant, le hors ligne, le tuteur conversationnel et l’éditeur de contenu ne font pas partie de cette feuille de route engagée. Le classement et les abonnements sont déjà implémentés ; leur préparation opérationnelle et commerciale reste distincte de nouvelles fonctionnalités à concevoir.
