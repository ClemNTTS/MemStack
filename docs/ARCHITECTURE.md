# Architecture

Ce document décrit le code présent dans le dépôt. Les paramètres Firebase, variables GitHub, secrets et modes Stripe doivent être vérifiés dans l’environnement visé : leurs valeurs par défaut ne prouvent pas l’état de la production. Les recettes datées figurent dans [RELEASE_READINESS.md](RELEASE_READINESS.md), [SUBSCRIPTIONS.md](SUBSCRIPTIONS.md) et les dossiers de qualification spécialisés.

## Structure et services

MemStack utilise React, TypeScript et Vite. Le contenu pédagogique reste statique et versionné dans Git ; le frontend est publié sur GitHub Pages. Firebase Authentication identifie les membres, Firestore conserve leurs données et Firebase Functions v2 exécute les opérations privilégiées en région `europe-west9`, sous Node 24. App Check protège les callables. Stripe assure les abonnements personnels et Entreprise. Le service historique Mistral d’analyse libre est distinct des questionnaires actuels à correction déterministe.

```text
Navigateur : React + TypeScript + contenu public versionné
  ├─ Firebase Auth : Google ou email/mot de passe vérifié
  ├─ Firestore : lectures personnelles et écritures autorisées par les règles
  └─ Firebase Functions + App Check
       ├─ progression, allocations, imports et classement
       ├─ correction déterministe des défis et situations Entreprise
       ├─ comptes, administration et appartenances aux organisations
       ├─ Stripe : Checkout, portail, webhook et quantités de membres
       └─ ancienne analyse Mistral : option indépendante

GitHub Actions : tests, build et publication du frontend sur Pages
GitHub Actions / Node : worker opt-in de signalements et PR à revue humaine
```

`src/firebase/` contient les adapters navigateur ; les composants ne manipulent pas directement les schémas de persistance. `functions/src/index.mjs` expose les callables, le webhook Stripe et le worker Firestore de synchronisation des places. Le build Functions copie le catalogue de confiance depuis le dépôt avec `functions/scripts/prepare-catalog.mjs`. Les clés de correction des QCM et situations Entreprise ne sont pas importées par le frontend. Elles restent des fichiers versionnés du dépôt : cette séparation protège le verdict serveur, sans constituer un dispositif de certification ou d’examen inviolable.

## Accès, routes et navigation

`App` sélectionne les pages publiques ou charge à la demande `LearningWorkspace` et `EnterpriseWorkspace`. Les visiteurs sans session voient la présentation sur `/` et `/discover`, l’offre sur `/business` et la connexion sur `/login`. Les pages `/legal`, `/privacy`, `/terms` et `/enterprise-data` sont publiques, avec ou sans session. La présentation ne permet pas d’apprendre sans compte.

Les routes pédagogiques exigent un compte Google ou email/mot de passe vérifié, Internet et une synchronisation réussie. `AccessGate` bloque l’atelier sans ces conditions. `ProgressProvider` coordonne l’identité, le cache par compte, l’import et la synchronisation ; `src/firebase/emailAuth.ts` gère inscription, vérification, réinitialisation et ajout d’un mot de passe à un compte Google. Firebase Auth stocke les mots de passe et envoie les courriers ; aucun serveur d’authentification supplémentaire n’est ajouté. Voir [AUTHENTICATION.md](AUTHENTICATION.md).

`LearningWorkspace` pilote les routes, l’historique navigateur, le titre et le focus. `/` ouvre le hub personnel ; `/courses`, `/courses/:id`, `/today`, `/reviews`, `/library`, `/lessons/:id`, `/challenges`, `/challenges/:id`, `/profile`, `/premium`, `/reports` et `/admin` couvrent les écrans métier. `/admin/ai` est un alias historique. L’administration conserve ses contrôles Google et rôle `memstackAdmin` actuels ; les droits d’un membre ordinaire ne donnent aucun accès privilégié.

En local, les liens utilisent les chemins ordinaires ; sur Pages, `src/navigation/` génère des fragments (`/#/today`) pour autoriser rechargement et ouverture directe sans réécriture serveur. `/login?next=premium` accepte uniquement le retour Premium prévu. Les réponses asynchrones devenues obsolètes après changement de compte ou d’organisation sont ignorées.

L’installation utilise le manifeste Web, les icônes et les indications `InstallApp`. Aucun service worker ou cache d’apprentissage hors ligne n’est ajouté ; l’application installée conserve les contrôles de compte et réseau. Voir [PWA.md](PWA.md).

## Progression personnelle et préférences

Firestore conserve notamment `users/{uid}/lessons/{lessonId}`, `cards/{cardId}` et `reviews/{eventId}`. Les événements de révision sont immuables. Le cache versionné `memstack.account.v1.{uid}` permet la reprise de sauvegardes interrompues ; il n’autorise pas une session hors ligne. La progression est lue sur le serveur à la connexion, au rechargement et à la reconnexion, sans abonnement temps réel. L’historique personnel complet est chargé : sa pagination reste à envisager si le volume augmente.

Les nouvelles complétions et réponses aux cartes passent toujours par `commitLearningAction`, via `ProgressProvider.completeLesson` et `reviewCard`. Les transactions serveur contrôlent allocations, droits et échéances. Deux chemins de lecture, synchronisation historique et import coexistent pendant la transition décrite dans [SUBSCRIPTIONS.md](SUBSCRIPTIONS.md) :

- Avec `VITE_SERVER_LEARNING_ENABLED=true`, la lecture privilégie la progression cloud et les imports passent par `importLearningProgress`. Les transactions serveur vérifient catalogue, droits, échéances et allocations. Des reçus `users/{uid}/learningReceipts/{requestId}` rendent les reprises idempotentes ; le client peut relire un reçu après perte d’accusé. La progression locale en attente est conservée pour un import explicite plutôt que fusionnée silencieusement.
- Dans le chemin historique, le client fusionne son cache et Firestore, puis synchronise les écritures. Les transactions conservent la plus ancienne complétion et le plus récent état de carte ; les événements ont des IDs stables. Ce chemin n’est plus autorisé lorsque `_configuration/learningAccess.enabled=true` ferme les écritures directes dans les règles.

Ces commutateurs doivent être coordonnés : activer les règles serveur avec un ancien frontend empêche ses sauvegardes. Un flag de navigateur ne constitue jamais une autorisation serveur. L’import explicite conserve les dates historiques et la copie locale originale. Effacer le cache ne supprime pas les données synchronisées, mais peut perdre des sauvegardes en attente. La déconnexion ne supprime pas le cache ; aucune nouvelle progression anonyme n’est créée.

`LearningPreferenceProvider` charge `users/{uid}/settings/learning` avant l’atelier : `version: 1`, `activeCourseId` et `dailyLessonGoal` de 1 à 10. La transaction de bootstrap migre les anciennes clés locales uniquement si le document distant est absent. Une préférence cloud existante prime ; un document invalide provoque une erreur sans remplacement. Une modification ne remplace que son champ, préserve l’autre et attend l’accusé serveur avant de confirmer. Les objectifs sont indicatifs et ne changent ni droits ni échéances.

## Leçons, parcours et cartes

Le catalogue comporte 30 parcours et 150 leçons. `docs/CURRICULUM.md`, `docs/content/curriculum.json` et `src/data/catalog/` définissent le plan et les dialogues ; `public/lessons/catalog/` contient les illustrations. Sources, transitions et inspection sont documentées dans `docs/content/`. Lire [WORKFLOW.md](content/WORKFLOW.md) avant modification. Les IDs historiques des trois premières leçons Docker et de leurs neuf cartes restent stables ; `src/data/dockerCourse.ts` conserve les données originales de compatibilité.

Une leçon contient des étapes identifiées et typées : messages, images et questions, avec transitions correctives éventuelles. Les questions de compréhension ne modifient pas l’état des cartes. `LessonText` et `formatText` rendent du texte et des fragments de code, sans HTML brut, interprétation ou exécution du code apprenant.

`catalogPlan` conseille la prochaine leçon du parcours actif, les cartes inédites globales et d’éventuelles relectures. `src/journey/model.ts` construit le chemin interactif des 30 parcours, ses caps et badges depuis les leçons terminées. Ces recommandations respectent les droits existants. `/today?start=lesson` et `?start=cards` expriment des actions explicites ; aucun bilan ne démarre automatiquement une autre leçon.

La découverte conserve `lesson=<id>` dans l’URL ; le rechargement restaure uniquement une leçon non terminée du parcours actif. Le brouillon de cet onglet est sous `memstack.lesson-draft.v1.{uid}.{lessonId}` dans `sessionStorage`, validé contre les transitions et supprimé à la complétion. Il n’est ni une progression validée ni un accès hors ligne. `/library` recherche les leçons terminées ; `LessonReplay` réutilise leur affichage sans changer progression ou échéances.

`createCompletedLessonQueue` ouvre les cartes inédites de la leçon qui vient d’être enregistrée. Les autres lots restent explicites. `dailyQueue` déduplique les cartes et fige le lot pendant la visite ; les révisions sélectionnent jusqu’à cinq cartes dues, triées par échéance, jamais des cartes futures. Premium peut renouveler les lots ; le gratuit reste soumis à son allocation quotidienne. Le calcul de file ne fait pas autorité sur les quotas serveur.

`scheduleReview` et son équivalent serveur conservent des échéances UTC et des intervalles de 24 heures, sans prétendre implémenter Anki ou FSRS. `getRelearningSuggestions` recommande jusqu’à trois leçons selon les oublis répétés sur des jours distincts depuis la dernière réussite ; il ne change ni progression ni intervalles. `FlashCard` ne classe une réponse par geste horizontal qu’après révélation ; boutons et touches fléchées restent disponibles.

Mémo, les bulles et décors sont des assets statiques et du CSS. `prefers-reduced-motion` supprime les animations. `useMessageSound` synthétise un son Web Audio désactivé par défaut, mémorisé localement, sans service externe. Les schémas peuvent être agrandis dans un dialogue accessible.

## Allocations et Premium personnel

`functions/src/learningAccess.mjs` applique une nouvelle leçon et cinq révisions de cartes dues par jour aux membres gratuits. Le jour d’allocation est calculé côté serveur dans `Europe/Paris`, avec les changements d’heure ; les dates de révision restent UTC. Les cartes vues pour la première fois après une leçon ne consomment pas l’allocation des révisions. Le compteur `users/{uid}/learningUsage/{day}` est initialisé en intégrant les activités du jour déjà présentes. Une complétion existante ou un reçu identique ne double pas une consommation.

Premium enlève ces plafonds d’apprentissage ; il n’avance aucune carte future. Les droits proviennent de `users/{uid}/settings/subscription` ou du droit permanent `settings/premiumAccess`, jamais d’une écriture client. Le frontend exige Premium pour ouvrir les défis. Le serveur exige également Premium pour les nouvelles tentatives lorsque `_configuration/learningAccess.enabled=true` ; ce commutateur doit être activé pour imposer cette restriction hors interface. Les fonctions de progression font respecter leurs allocations indépendamment du flag frontend.

Les callables `getSubscriptionStatus`, `createPremiumCheckout` et `createPremiumPortal` réutilisent le backend Firebase. Stripe Managed Payments est nécessaire pour encaisser et gérer les abonnements existants de 1,50 € par mois ou 9,90 € par an. Le webhook signé vérifie notamment client, tarifs autorisés, facture payée, mode et période avant de publier le droit ; les notifications sont dédupliquées. Une redirection réussie depuis Checkout ne confirme aucun droit.

`VITE_SUBSCRIPTIONS_ENABLED` contrôle les fonctions commerciales du frontend ; désactivé, il permet encore la lecture du droit permanent. Les paramètres serveur `SUBSCRIPTIONS_ENABLED` et `SUBSCRIPTIONS_LIVE_MODE` sont indépendants et désactivés par défaut. Les secrets Stripe et de signature restent dans Functions/Secret Manager. Les IDs autorisés et la version API sont dans `functions/config/subscription.json`. Les recettes TEST, leur portée et la procédure d’activation sont décrites dans [SUBSCRIPTIONS.md](SUBSCRIPTIONS.md) ; le dépôt ne prouve pas l’ouverture LIVE.

## Défis à correction déterministe

Les 36 défis actuels comptent cinq questions chacun. Les questions publiques sont dans `shared/challengeQuestions.json` ; les clés et explications sont dans `shared/challengeAnswerKeys.json`, copiées uniquement dans le paquet Functions. `src/data/challenges.ts`, `src/challenges/` et les adapters Firebase assemblent les dossiers et l’historique. Les questionnaires actuels sont en version 4, leur grille en version 3 et les tentatives en schéma 3.

`submitDeterministicChallenge` exige un membre admissible et App Check, vérifie les leçons prérequises et au moins deux leçons de la thématique, puis corrige avec la grille serveur. Le seuil est strictement supérieur à 70 % : quatre réponses correctes sur cinq suffisent. La tentative et son résultat sont créés atomiquement sous `users/{uid}/challengeAttempts/{attemptId}`. Une répétition identique réutilise la tentative ; un contenu différent sous le même ID est refusé. Le budget limite à 20 nouvelles tentatives par fenêtre d’une heure.

Le client attend l’enregistrement serveur avant d’afficher la correction. Réponses, verdict, dates serveur et autoévaluations historiques sont immuables ; recommencer crée une autre tentative. Les défis ne modifient ni leçons terminées ni état des cartes. Les historiques de dossiers et analyses restent lisibles à leur version et ne valident pas automatiquement le questionnaire actuel. Les questions et clés v3 archivées permettent la compatibilité des anciens onglets ; publier le backend compatible avant un frontend qui en dépend.

`getChallengeExamSummary` construit le bilan avec des résultats enregistrés et des versions compatibles ; une erreur de lecture ne devient pas un historique vide. Les suggestions de relecture utilisent les liens éditoriaux vers les leçons. Aucun appel Mistral ni droit IA historique ne doit bloquer un nouveau QCM ou son résultat. Le code apprenant n’est jamais exécuté. Voir [CHALLENGES.md](content/CHALLENGES.md).

### Service Mistral historique

`analyzeChallengeAttempt` reste implémenté pour les anciennes réponses libres, avec Google Auth, App Check, droit IA, invitations, quotas par jour UTC, réservation de tokens et déduplication par tentative. Les retours sont séparés dans `users/{uid}/challengeAnalyses/{attemptId}`, lisibles par leur propriétaire selon les règles et jamais modifiables par le client. Aucun UID, email, progression, secret ou payload fournisseur ne doit être journalisé ou transmis inutilement au fournisseur.

Les paramètres `CHALLENGE_AI_ENABLED` et le flag frontend `VITE_CHALLENGE_AI_ENABLED` sont indépendants, désactivés par défaut ; le modèle et la liste d’invités sont vides par défaut. La révision v7 du code sépare évaluation et explication, sans en faire un service qualifié : les essais et leurs limites restent documentés dans [CHALLENGE_AI.md](CHALLENGE_AI.md). Cette voie historique n’est pas le correcteur actuel et ne consomme aucun quota Mistral pour les nouvelles tentatives déterministes. Un build ne permet pas d’affirmer quel modèle ou service est déployé.

## Classement, administration et opérations de compte

Le hub affiche progression, niveaux, badges et série quotidienne. `getWorldRanking` et `setRankingAlias` exposent un classement borné avec pseudos ; les activités serveur mettent à jour les données de confiance sous `_worldRanking`. Aucune lecture directe du classement n’est accordée au navigateur. Les choix de confidentialité et dates figurent dans [WORLD_RANKING.md](WORLD_RANKING.md).

`getAdminStatus` vérifie App Check, le fournisseur Google, le claim administrateur et les droits Auth actuels, ainsi que l’état du compte. `/admin` renvoie vers les consoles Firebase et Stripe, qui gardent leurs propres permissions. L’ancien `updateChallengeMemberAccess` gère uniquement les droits historiques de l’IA avec audit serveur ; aucune interface ne peut créer son propre rôle.

`exportAccountData` inclut métadonnées Auth, sous-collections personnelles, données Entreprise et traces d’accès concernant le membre, avec masquage des autres identités. L’export refuse explicitement les volumes supérieurs à 5 000 documents ou 8 Mo et réserve un délai de 15 minutes côté serveur. Le navigateur ajoute les caches et brouillons du compte sur cet appareil ; un résultat partiel n’est jamais annoncé comme complet.

`deleteAccountData` exige une reconnexion récente compatible avec le fournisseur et la confirmation exacte `SUPPRIMER`. Le marqueur `_accountLifecycle/{uid}` bloque les accès et opérations pendant la suppression. Le serveur ferme la facturation concernée, supprime les données personnelles et Entreprise, retire les classements et anonymise les traces prévues avant suppression de l’identité. Les reçus, reprises et limites sont décrits dans les documents de compte et de qualification. Les copies déjà publiées dans Git et les brouillons d’autres appareils ne peuvent pas être effacés à distance. Les durées de conservation restent un sujet de lancement explicite, pas une garantie déduite du code.

## Environnement Entreprise

La refonte du 17 octobre ajoute au catalogue v2 `foundationLessonIds`, trois `tracks` et des `prerequisiteLessonIds` explicites. Les fondations sont ordonnées entre elles ; chaque parcours spécialisé démarre après ces fondations puis suit ses propres six missions, sans dépendre des deux autres parcours. Les situations intégratives exigent les missions de leur parcours. `enterprisePlan` et `enterprisePrerequisites` appliquent les mêmes relations côté interface et serveur ; les anciennes missions hors socle gardent leur compatibilité d’ordre. Une complétion existante n’est pas effacée par cette évolution. Les tentatives restent des snapshots immuables ; un ancien onglet doit recharger si sa version de catalogue diffère. Voir [ENTERPRISE_REDESIGN_PLAN.md](ENTERPRISE_REDESIGN_PLAN.md).

`/business` présente l’offre ; `/enterprise` et ses sous-routes montent un espace authentifié distinct. Un membre de plusieurs organisations choisit son contexte ; requêtes et réponses restent liées à son UID et à l’organisation. Les parcours, badges, niveaux et séries Entreprise ne lisent pas la progression Développement. Le compte et sa sécurité sont communs.

`shared/enterpriseCurriculum.json` contient désormais 40 missions, 120 cartes et 11 situations de cinq questions. Deux fondations et 18 nouvelles missions composent les parcours spécialisés ; les 20 autres missions historiques restent complémentaires. `shared/enterpriseAssessmentKeys.json` contient les clés serveur, versionnées et exclues du frontend. Les notes d’exercice restent locales au navigateur ; aucun fournisseur d’IA ne reçoit les exercices. Les illustrations générées représentent des situations fictives, avec provenance documentée.

Les données pédagogiques sont isolées sous `organizations/{organizationId}/learners/{uid}/{lessons|cards|reviews|attempts|receipts|limits}`. Les appartenances, pseudos et résumés sont dans `organizations/{organizationId}/members/{uid}`, le classement dans `ranking/{uid}` et l’index personnel dans `users/{uid}/enterpriseMemberships/{organizationId}`. Les règles refusent les accès client directs au sous-arbre des organisations ; les callables vérifient compte actuel, appartenance, rôle, droits commerciaux et marqueur de suppression. Les responsables voient des compteurs d’activité et gèrent les invitations sans lire les réponses individuelles. Les invitations sont liées à une adresse vérifiée, expirent et n’ont qu’un usage. Voir [ENTERPRISE_BACKEND.md](ENTERPRISE_BACKEND.md).

Stripe Managed Payments est réutilisé pour un abonnement par organisation à 10 € TTC par membre actif et par mois, responsables compris. Un membre actif a une appartenance avec accès activé ; une invitation en attente n’est pas facturée. Le serveur contrôle les places. La file durable `_enterpriseSeatSync/{organizationId}` synchronise les quantités absolues après acceptation, retrait ou suppression de compte, avec idempotence et reprises bornées. Seul l’état Stripe vérifié accorde l’accès ; le Premium personnel reste indépendant.

`ENTERPRISE_SUBSCRIPTIONS_ENABLED` et `ENTERPRISE_SUBSCRIPTIONS_LIVE_MODE` sont désactivés par défaut ; les IDs de tarif et portail sont configurables côté serveur. Le worker Firestore v2 peut nécessiter Eventarc et Pub/Sub dans le projet existant : un build n’active aucune API. La procédure TEST/LIVE, les ajustements de factures et les limites de recette figurent dans [ENTERPRISE_BILLING.md](ENTERPRISE_BILLING.md) et [ENTERPRISE_QUALIFICATION.md](ENTERPRISE_QUALIFICATION.md).

## Signalements de contenu

`ContentReportButton` crée un signalement immuable sous `users/{uid}/contentReports/{id}` : cible, commentaire, snapshot, empreinte et date serveur. Le membre lit ses propres signalements par pages de vingt ; le worker privilégié gère leur statut. Les règles lient la création au budget de dix nouveaux signalements par fenêtre d’une heure ; les tentatives utilisent leur budget distinct de vingt. Ces limites ne plafonnent pas toutes les lectures de progression.

Le worker Node `scripts/content-reports/`, exécuté par le workflow opt-in `.github/workflows/content-reports.yml` ou localement, consulte les sources primaires puis sépare rédaction et inspection. Mistral propose uniquement des corrections textuelles contrôlées dans `src/data/catalog/corrections.json`, sans modifier IDs ou transitions. Tests et build précèdent une PR brouillon ; une personne révise et fusionne. Aucun payload fournisseur n’est journalisé. `reports:check` ne fait pas d’appel réseau ; `reports:process` traite de vrais signalements avec des secrets. Voir [REPORTS.md](content/REPORTS.md).

## Configuration, vérification et publication

`src/firebase/client.ts` initialise Auth et Firestore ; la configuration Web et la clé de site App Check sont publiques. Analytics n’est pas initialisé. Les clés Mistral, Stripe, signature webhook et comptes de service sont exclusivement serveur : jamais de secret `VITE_` ni de fichier `.env` commité. Le jeton local `MEMSTACK_APPCHECK_DEBUG_TOKEN` est réservé au développement explicitement autorisé et exclu des builds de production.

`firestore.rules` valide propriétaire, fournisseur admissible, schémas, immutabilité et droits commerciaux. Les chemins privés de configuration, facturation et classement restent réservés au backend. Les callables utilisant Admin SDK doivent imposer leurs propres contrôles : ils ne sont pas protégés par les règles client. Avant d’ajouter un service, expliquer son besoin et mettre à jour cette architecture. Firebase Functions requiert Blaze ; une modification de facturation ou un déploiement nécessite l’autorisation explicite du propriétaire.

`npm run build` vérifie TypeScript et produit le frontend ; `npm test` couvre logique et contrats locaux, y compris les tests unitaires Functions. `npm run functions:build` prépare le catalogue serveur et vérifie sa syntaxe ; `npm run functions:test` cible les tests serveur. Les changements d’autorisation, quotas ou cycle de compte exigent aussi les tests de règles et transactions sur émulateur. Attention : `npm run test:challenge-rules` lance les contrats, sans lancer ces intégrations. Les commandes émulateur exactes figurent dans les workflows.

`.github/workflows/verify.yml` installe Node 24 et Java 21, construit les Functions, lance tests et build frontend, puis les tests Firestore isolés. `.github/workflows/pages.yml` ajoute l’intégration Auth et publie uniquement `dist/` avec `--base=/`. Les flags `CHALLENGE_AI_ENABLED`, `SUBSCRIPTIONS_ENABLED` et `SERVER_LEARNING_ENABLED` y deviennent les variables `VITE_` correspondantes, avec repli `false`. App Check reçoit la clé publique `FIREBASE_APPCHECK_SITE_KEY` et le fournisseur `enterprise`.

Pages doit utiliser GitHub Actions. Firebase Auth doit autoriser les domaines de production concernés ; leur état réel se vérifie dans Firebase. La publication Pages ne déploie ni Functions ni règles Firestore ni paramètres Stripe. Publier et vérifier d’abord les dépendances serveur compatibles avant d’activer le frontend correspondant. Les recettes mobiles réelles, paiements LIVE, suppression en production et retour arrière ne sont pas démontrés par les seuls tests locaux.
