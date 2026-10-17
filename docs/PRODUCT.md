# Produit

État du **17 octobre 2026**, rapproché du code. Ce document décrit le fonctionnement actuel ; les preuves de déploiement et les limites commerciales sont distinguées dans la [feuille de route](ROADMAP.md). La [vision initiale](VISION.md) conserve sa valeur historique, mais ses propositions ne remplacent pas les règles ci-dessous.

## Intention et espaces

MemStack aide à apprendre régulièrement et à retenir, grâce à des sessions courtes et aux révisions espacées. Un compte peut accéder à l’espace Développement et à une ou plusieurs organisations Entreprise. Le choix d’un espace ne transfère aucune progression.

L’accueil public, `/discover`, la présentation `/business` et les pages `/legal`, `/privacy`, `/terms`, `/enterprise-data` sont accessibles sans connexion. Toutes les routes d’apprentissage exigent Internet et un compte Google ou email/mot de passe avec adresse vérifiée. La création demande un pseudo ; la connexion propose la réinitialisation du mot de passe. Un compte Google peut ajouter un mot de passe depuis son profil sans changer de progression.

## Apprendre dans l’espace Développement

Le catalogue contient **12 thèmes, 30 parcours, 150 leçons et 450 cartes**. Les cinq leçons Docker conservent leurs identifiants historiques. Les prérequis entre parcours et le chemin guidé recommandent un ordre sans verrouiller la sélection. Les défis possèdent des prérequis distincts, décrits plus bas.

Le tableau de bord privilégie les cartes inédites de leçons terminées, puis les révisions dues ; la prochaine leçon non terminée du parcours actif reste accessible dans la limite de l’allocation. `/today` propose découvrir, consolider ou réviser ; les actions explicites `?start=lesson` et `?start=cards` ouvrent le choix demandé. `/courses` donne accès aux parcours, `/reviews` uniquement aux cartes dues, `/library` aux leçons terminées. Aucun enchaînement ne démarre automatiquement une autre leçon.

Une leçon alterne bulles courtes, exemples, images utiles et questions de compréhension. Un choix révèle une explication adaptée et peut mener à une précision corrective avant de rejoindre le fil principal. Les questions de leçon n’attribuent pas de points et ne changent pas les échéances des cartes. Il n’y a pas de nombre imposé de bulles ou de questions.

Après confirmation de la complétion d’une leçon, ses cartes encore inédites démarrent. La consolidation peut reprendre les cartes inédites de tous les parcours. À la fin d’un lot, continuer vers d’autres nouvelles cartes ou des révisions demande un choix explicite. Une relecture ne change ni complétion ni échéances.

### Cartes et révisions

- La question reste au-dessus d’une carte retournable au clic ou au clavier ; chaque carte commence face cachée.
- Après révélation, répondre à « Avais-tu retrouvé la réponse avant de la révéler ? » avec **Non** (`forgotten`) ou **Oui** (`recalled`). Une réponse partielle sans l’idée essentielle compte comme non ; une réponse correcte après réflexion compte comme oui. Le glissement gauche/droite et les boutons Mémo proposent les mêmes choix, avec labels accessibles.
- Les révisions prennent jusqu’à cinq cartes dues. Ne pas compléter artificiellement un lot, avancer une échéance future, introduire une carte inédite dans `/reviews` ou démarrer une leçon depuis cette route. « Réviser encore » reste soumis au quota disponible.
- Première révision ou oubli : un jour. Réussite ultérieure : maximum de l’intervalle précédent et du double des jours écoulés, plafonné à 365 jours. Répéter immédiatement une carte n’augmente pas son intervalle.
- Après au moins deux oublis d’une carte en révision sur des jours distincts depuis sa dernière réussite, Mémo peut suggérer une relecture facultative. Les oublis d’introduction ne comptent pas ; une réussite supprime la suggestion. Il s’agit d’une heuristique, pas d’un diagnostic de maîtrise.

### Gratuit et Premium

Le gratuit permet **une nouvelle leçon et cinq révisions dues par jour civil à Paris**, tous parcours et appareils confondus. Les cartes nouvelles restent disponibles. Premium retire ces plafonds et ouvre les défis ; les cartes futures ne sont jamais avancées. L’objectif personnel de leçons est un repère facultatif, distinct des limites du gratuit.

Les droits, quotas et dates sont vérifiés par les transactions serveur ; les répétitions sont idempotentes. Le navigateur attend l’accusé serveur avant de confirmer une nouvelle complétion ou pratique. L’import explicite conserve les dates historiques mais consomme l’allocation du jour de l’import ; une reprise partielle est possible. Voir [SUBSCRIPTIONS.md](SUBSCRIPTIONS.md).

Les tarifs personnels affichés sont **1,50 € TTC/mois** ou **9,90 € TTC/an** via Stripe Managed Payments. Le droit dépend d’un paiement et d’une période vérifiés côté serveur, jamais du retour navigateur. Un accès permanent administratif est distinct d’un paiement. Les tests et déploiements consignés ne constituent pas une ouverture LIVE : le frontend personnel documenté garde les paiements fermés. La fin d’un abonnement ne supprime pas les données pédagogiques ; la route des défis reste toutefois derrière le contrôle Premium, y compris son historique dans l’interface actuelle.

## Défis de diagnostic actifs

Les **36 dossiers actifs en version 4**, dont les trois Docker historiques, couvrent les douze thèmes et proposent chacun **cinq questions à choix unique** spécifiques au scénario. L’apprenant lit les fichiers et choisit ses réponses ; aucun code n’est exécuté.

L’accès exige Premium. Pour soumettre un défi, il faut avoir terminé ses leçons explicitement liées ainsi qu’au moins deux leçons de sa thématique (ou toutes si celle-ci en compte moins de deux). Terminer toute la thématique n’est plus requis. Ces prérequis sont contrôlés côté serveur et ne bloquent pas les leçons suivantes. Le contrôle Premium serveur est actif lorsque `_configuration/learningAccess.enabled=true` ; le contrôle Premium de l’interface reste présent dans tous les cas. Cette activation est documentée comme réalisée dans [SUBSCRIPTIONS.md](SUBSCRIPTIONS.md).

Le serveur corrige et enregistre la tentative avant d’afficher résultat et explications. Réussir exige **strictement plus de 70 %**, soit **4/5** aujourd’hui. L’IA n’est pas nécessaire au résultat, à l’accès ou à la progression ; les invitations de l’ancien service Mistral ne sont pas requises. Ce résultat d’exercice ne constitue pas une certification.

Les réponses, dates serveur, versions et résultats sont immuables. Réessayer crée une nouvelle tentative et ne change ni cartes ni complétions de leçons. Le brouillon local est séparé par compte, défi et version, puis effacé après accusé serveur. Les anciennes tentatives textuelles, autoévaluations, analyses et versions QCM restent historiques ; leur affichage ne les convertit pas en résultat de la version active.

Le catalogue se filtre par thème, recherche et état. Le bilan distingue validés, à retravailler, jamais tentés et résultats indisponibles. Une réussite de la version courante reste acquise après un essai ultérieur ; un résultat d’une ancienne version ne valide pas la nouvelle. Les notions à reprendre renvoient aux leçons du catalogue et les relectures conservent un lien de retour au défi. La proposition de prochain défi demande une action explicite.

Le service d’analyse Mistral historique demeure dans le dépôt avec ses contrôles et ses limites de qualification ; [CHALLENGE_AI.md](CHALLENGE_AI.md) en décrit le périmètre. Il ne faut pas confondre sa version de protocole avec la version 4 des dossiers QCM actuels.

## Compte, récompenses et classement

Firestore synchronise progression, parcours actif et objectif personnel. Les préférences cloud sont chargées à la connexion, au rechargement et à la reconnexion ; les anciens réglages locaux migrent seulement en l’absence de document cloud. Une modification n’est confirmée qu’après sauvegarde serveur. Une panne bloque l’apprentissage jusqu’à reprise ; le cache ne crée pas un mode hors ligne. L’import d’une ancienne progression reste explicite.

Le profil expose niveau, XP, série, badges, préférences, pseudo, installation et données du compte. Une leçon terminée rapporte **20 XP** ; une carte pratiquée rapporte **5 XP**, une fois par carte et par jour quel que soit le résultat. Le seuil cumulé du niveau suivant est `100 × niveauActuel²` XP. Les dates futures ne rapportent rien. Les badges reconnaissent découverte, parcours, régularité et paliers de pratique en conservant les historiques. Ces indicateurs ne prouvent pas la maîtrise.

Une leçon ou une carte marque une journée active à Paris. La série peut être poursuivie le lendemain et retombe à zéro après une journée entière manquée, sans perdre record ni badges. Le classement mondial `/ranking` est implémenté et documenté comme déployé : tous les comptes participent sous pseudo, les égalités partagent leur place. Les activités acceptées par le serveur alimentent sa série ; imports ultérieurs et répétitions ne la prolongent pas artificiellement. Seuls pseudo, série, place et indication personnelle sont exposés, sans nom, email ou réponses. Voir [WORLD_RANKING.md](WORLD_RANKING.md).

L’export et la suppression du compte, les signalements personnels et l’administration sont implémentés avec contrôles serveur. Les signalements restent immuables et les propositions assistées passent par une revue humaine avant fusion. Voir [REPORTS.md](content/REPORTS.md) et [la recette de production](PRODUCTION_RECIPE.md).

## Espace Entreprise

L’offre « Travailler avec l’IA : des usages utiles aux projets maîtrisés » s’adresse aux collaborateurs et managers, sans prérequis de développement. Le catalogue comporte **huit chapitres, vingt missions initiales ordonnées, deux missions complémentaires, 66 cartes et huit situations corrigées côté serveur**. La fin du parcours propose de continuer les révisions et les missions publiées, sans promettre de cadence éditoriale ni de certification.

Chaque organisation possède adhésions, catalogue, progression par membre, cartes, tentatives, niveau, badges, série et classement. Une personne dans deux organisations garde deux progressions distinctes. L’accès nécessite une adhésion active et un droit d’organisation vérifiés par le serveur. Les actions Entreprise ne consomment pas les quotas personnels et ne modifient pas le classement mondial. Les responsables disposent du suivi d’équipe et de l’administration des membres, pas d’un accès implicite aux réponses pédagogiques détaillées.

Le tarif affiché est **10 € TTC par membre actif et par mois**, responsables compris. Une invitation non acceptée ne compte pas ; la quantité Stripe suit les adhésions serveur. Le Premium personnel ne donne aucun droit Entreprise. Le backend, les paiements TEST et les recettes publiées ne valent pas ouverture LIVE. Voir [le contrat produit](ENTERPRISE_PRODUCT.md), [le backend](ENTERPRISE_BACKEND.md), [la facturation](ENTERPRISE_BILLING.md) et [la recette déployée](ENTERPRISE_DEPLOYMENT_20261015.md).

## Direction visuelle et limites

L’atelier de Mémo utilise un fond ivoire, des traits encre et des plaques lilas. Le décor se compose à l’ouverture et réagit aux étapes ; bulles et avatars rythment la leçon. Le son de message reste facultatif et désactivé par défaut. Le rythme est piloté par « Continuer » ; la réduction des animations est respectée. Mémo illustre les réponses et récompenses sans remplacer leurs libellés accessibles.

L’exécution de code apprenant, l’apprentissage hors ligne, le tuteur conversationnel, l’éditeur de leçons et la veille automatisée ne font pas partie du fonctionnement actuel. La préparation du lancement, les recettes restantes et les options éditoriales figurent dans [ROADMAP.md](ROADMAP.md).

Sources historiques Docker : [persistance](https://docs.docker.com/get-started/docker-concepts/running-containers/persisting-container-data/), [volumes](https://docs.docker.com/engine/storage/volumes/), [ports](https://docs.docker.com/engine/network/port-publishing/) et [réseaux bridge](https://docs.docker.com/engine/network/drivers/bridge/).
