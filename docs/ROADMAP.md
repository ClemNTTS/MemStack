# Feuille de route vers la version finale

État du 9 octobre 2026. Cette liste rapproche VISION.md, PRODUCT.md et le code actuel. La vision initiale précède les verdicts IA obligatoires et le déblocage après une thématique complète : les décisions utilisateur récentes priment. Les sept points ci-dessous sont déployés ; voir [la recette de production](PRODUCTION_RECIPE.md) pour les vérifications et leurs limites.

## Sept fonctionnalités déployées

- Suivi des signalements et preuve de publication d’une correction.
- Signalements versionnés des défis et analyses, sans modification des verdicts.
- Export et suppression confirmée du compte, verrou contre les écritures concurrentes.
- Brouillons d’examen par compte, défi et version.
- État de l’accès IA et quota fourni par le serveur.
- Gestion administrative des droits et invitations, avec journal atomique.
- Filtres personnels des défis par état.

Les nouveaux callables et règles sont déployés. Les deux comptes administrateurs autorisés ont reçu leur rôle explicitement ; aucune promotion automatique n’est ajoutée. Les durées de conservation et la recette fournisseur restent des chantiers séparés.

## Déjà livré

- Catalogue de 12 thèmes, 30 parcours, 150 leçons ; cartes et révisions espacées, bibliothèque et relecture.
- Google et Internet obligatoires ; progression et préférences synchronisées ; installation mobile.
- 36 défis, droit IA administrateur, déblocage après les leçons de la thématique, verdicts IA uniquement.
- Historique immuable, bilan des examens, révisions ciblées, comparaison entre tentatives et synthèse par thème.
- Signalements de leçons/cartes et propositions assistées avec revue humaine.

## À terminer pour la cible aboutie

| Priorité | Fonctionnalité ou chantier | Ce qui manque | Critère de livraison |
| --- | --- | --- | --- |
| 1 | Conservation et information sur les données | Durées, traitement fournisseur et procédures de maintenance restent à définir et communiquer | Politique décidée et affichée ; procédure opérationnelle d’export/suppression/rétention |
| 1 | Évaluation réelle du service IA v4 | Tests automatisés disponibles, couverture fournisseur variée à compléter | Réponses correctes, partielles, fausses, alternatives, hors sujet et hostiles testées ; justesse des points manqués vérifiée |
| 1 | Recette des parcours critiques | Vérifications ponctuelles réalisées, matrice complète mobile/bureau et incidents à consolider | Connexion, réseau interrompu, rechargement, changement de compte, clavier et mouvements réduits vérifiés |
| 2 | Couverture professionnelle des cas | Le nombre de défis par thème ne démontre pas la couverture diagnostic/revue/décision | Manifeste des compétences et formats ; cas manquants rédigés, sourcés et inspectés |
| 2 | Maintenance du contenu en usage | Catalogue inspecté, durées/difficultés/ambiguïtés à éprouver auprès des utilisateurs | Corrections issues de retours réels ; versionnement et historique préservés |

## Améliorations incluses dans les sept points

- Brouillon d’examen par compte : retrouver une réponse non envoyée après navigation ou rechargement, avec séparation des comptes et suppression du brouillon après enregistrement confirmé.
- État de l’option IA et du quota : expliquer l’accès du membre et la limite atteinte sans annoncer un crédit commercial ; toute valeur vient du serveur.
- Gestion administrative des membres IA : attribuer/révoquer les droits et invitations sans manipulation manuelle de documents, avec contrôle administrateur et journal d’actions.
- Filtres personnels des défis par état : validés, à retravailler, jamais tentés et résultats indisponibles.

## Options à décider séparément

- Abonnement payant : paiement, activation/révocation serveur, gestion du compte et définition des crédits ne sont requis que si l’offre devient commerciale. L’accès IA actuel n’est pas une facturation.
- Notifications facultatives, veille éditoriale et statistiques de rappel sur période définie.
- Champ facultatif « Ce qui me manque pour conclure » si les cas de décision en montrent l’utilité.

L’exécution de code, le hors ligne, les classements, un tuteur conversationnel et un éditeur de contenu ne font pas partie de la cible actuelle.

Prochain chantier recommandé : compléter la recette réelle du service IA et la politique de conservation avant ouverture publique.
