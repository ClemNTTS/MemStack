# Architecture

## Accueil et relecture

`App` conserve le garde Google/réseau et charge `LearningWorkspace` à la demande après synchronisation. Ce module pilote les routes avec History API, le retour navigateur, le titre et le focus du contenu. Le menu permanent ouvre `/` (accueil), `/courses`, `/reviews`, `/library` ; `/profile` réunit progression et badges. Les liens restent ouvrables dans un nouvel onglet. Aucun routeur supplémentaire.

`Dashboard` conseille la prochaine leçon et donne accès indépendamment aux cartes. `/courses` filtre les 30 parcours ; `/courses/:id` montre objectifs, prérequis et chemin ordonné. `LearningPreferenceProvider` charge `users/{uid}/settings/learning` avant d’ouvrir l’atelier. Le document porte `version: 1`, `activeCourseId` et `dailyLessonGoal` (entier de 1 à 10), validés par `preferenceModel` et les règles du propriétaire.

`bootstrapCloudPreferences` reprend les clés historiques `memstack.learning-preference.v1.{uid}` et `memstack.learning-goal.v1.{uid}` uniquement si le document cloud est absent, dans une transaction. Une préférence cloud existante prime ; un document invalide provoque une erreur sans remplacement. Chaque modification relit la paire courante et applique seulement le champ changé, préservant une modification concurrente de l’autre champ. Les transactions validées en dernier font référence pour un même champ. Les contrôles attendent l’accusé serveur avant d’annoncer un succès ; une erreur conserve le choix précédent. Le cache local reste facultatif et ne permet pas d’usage hors ligne.

Les préférences sont rechargées à la connexion, au rechargement et à la reconnexion ; aucun abonnement temps réel. Les réponses obsolètes après démontage ou changement de compte sont ignorées. Dépasser l’objectif n’impose aucun blocage ni changement des échéances.

`LearningWorkspace` inclut la query dans l’état de route et la clé de page : `?start=lesson` et `?start=cards` sont des intentions explicites, compatibles avec le retour navigateur. `/today` sans query ouvre le choix. Après un lot, la prochaine leçon est proposée mais n’est jamais lancée automatiquement.

La découverte inscrit aussi `lesson=<id>` dans l’URL avec `replaceState`. Une mise à jour interne de session conserve le composant ; une navigation explicite le réinitialise. Au rechargement, cet ID restaure uniquement une leçon non terminée du parcours actif. `sessionStorage` garde le fil et les choix sous `memstack.lesson-draft.v1.{uid}.{lessonId}` pour cet onglet ; le brouillon est validé contre les transitions du contenu et supprimé à la complétion. Il ne représente pas un apprentissage validé, n’est pas synchronisé et ne permet aucun accès hors ligne ou sans compte.

`/library` recherche les leçons terminées, de tous les parcours. `/lessons/:id` ouvre `LessonReplay`, réutilise `LessonView` et donne accès à l’essentiel en dialogue natif ; aucune progression ni échéance ne change. Les leçons inconnues affichent une page introuvable ; les leçons non terminées restent réservées à la découverte quotidienne. Les schémas peuvent être agrandis, avec fermeture par Échap et défilement horizontal sur mobile.

## Cible envisagée

Le SDK `firebase` est installé. `src/firebase/client.ts` initialise Auth et Firestore pour `memstack-9f581`. La configuration Web est publique. Analytics n’est pas initialisé.

`ProgressProvider` expose connexion Google par popup, déconnexion, progression et état de synchronisation à tous les écrans. Le compte Google et le réseau sont obligatoires sur toutes les routes. `AccessGate` remplace les écrans métier sans compte, hors ligne ou pendant le chargement. Le cache `memstack.account.v1.{uid}` sert uniquement à reprendre les sauvegardes interrompues : une lecture serveur et une synchronisation réussies précèdent l’accès. Une coupure réseau ou un échec de synchronisation bloque la session ; au retour du réseau, la progression est rechargée automatiquement. Le signal navigateur détecte la coupure ; les erreurs Firestore couvrent aussi les connexions sans accès au service.

Firestore conserve `users/{uid}/lessons/{lessonId}`, `cards/{cardId}` et `reviews/{eventId}`. Chaque réponse est d’abord sauvegardée localement, puis envoyée en arrière-plan. Les transactions conservent la date de complétion la plus ancienne et l’état de carte le plus récent. Les événements sont identifiés de façon stable pour éviter les doublons lors des reprises ; aucune limite d’historique ne supprime les anciennes révisions. Pour ce MVP personnel, tout l’historique est lu à la connexion ; paginer cette lecture si l’usage grandit. Les autres appareils voient les changements à la reconnexion ou au rechargement, sans abonnement temps réel.

L’import est une action explicite dans la barre de compte : il fusionne l’ancienne progression sans compte de ce navigateur avec le compte courant, conserve la copie originale et peut être répété. La déconnexion revient à l’écran de connexion ; elle n’efface pas le cache du compte. Aucune nouvelle progression anonyme n’est enregistrée. Les réponses concurrentes sur la même carte sont départagées par leur date client ; le MVP n’impose pas de verrou de session entre appareils.

`firestore.rules` limite chaque collection à son propriétaire, valide les champs et les intervalles, interdit les suppressions et rend les événements immuables. Tous les autres chemins sont refusés. Publier les règles depuis la console ou `firebase deploy --only firestore:rules --project memstack-9f581`. Vérifier propriétaire, autre compte, accès anonyme et schéma invalide avant mise en ligne.

Configuration console vérifiée le 5 octobre 2026 : Google Auth activé sous le nom public MemStack ; `localhost` est autorisé. À cette vérification le projet était sur Spark. Le passage à Blaze et le déploiement des fonctions ont été autorisés le 7 octobre 2026 après tests ; leur réalisation reste à confirmer. Firestore Standard `(default)` est créé à Paris (`europe-west9`), en mode production, sans sauvegardes planifiées payantes. Les règles par utilisateur, préférences et signalements ont été publiées par CLI le 6 octobre 2026 ; l’index de groupe des signalements est prêt. La synchronisation des préférences a été vérifiée dans l’app et l’accès serveur du worker dans GitHub Actions. Le premier signalement réel jusqu’à sa PR reste à valider.

La dépendance transitive Node `@grpc/grpc-js` est fixée à 1.13.6 via `overrides` pour corriger les alertes de Firebase 12.19.0. L’audit npm après installation ne signale plus de vulnérabilité. Ce projet utilise le SDK navigateur ; vérifier cet override si un usage Node est ajouté.

```text
React + TypeScript + Vite
  ├─ contenu pédagogique versionné avec le projet
  └─ Firebase Auth → Firestore (progression personnelle)

GitHub Actions → vérification, build et déploiement sur GitHub Pages
```

Les thèmes, parcours, bulles et cartes sont du contenu statique : les modifier passe par le dépôt. Firestore conserve les données propres à l'utilisateur, notamment les leçons terminées et l'état de révision de ses cartes. Le contenu livré avec le frontend est public ; une interface d'administration ou du contenu privé demanderait un autre choix.

**État actuel :** découverte libre dans l’ordre du parcours. `catalogPlan` propose la prochaine leçon et les cartes inédites globales, sans verrou. Les révisions globales sont des lots renouvelables de cinq cartes dues ; `/reviews` les ouvre seules. La progression est sauvegardée par compte puis synchronisée avec Firestore. Le frontend est publié sur GitHub Pages.

## Modèle des leçons

`LessonText` rend les textes avec un format limité : blocs de code clôturés et langue explicite, ou code en ligne entre accents graves. `formatText` sépare ces fragments ; React les affiche comme texte, sans HTML brut ni exécution. Les blocs utilisent une police monospace et un défilement horizontal accessible au clavier. Les données et IDs des étapes restent inchangés ; aucune dépendance Markdown supplémentaire.

`Lesson` contient des métadonnées (identifiant stable, titre, catégorie, durée estimée) et une collection d'**étapes identifiées et typées**. Une étape peut être un message, une image avec texte alternatif ou une question avec choix et retours. Chaque type porte uniquement les données dont il a besoin ; de nouveaux types d'étapes doivent pouvoir être ajoutés sans modifier le contenu existant.

Par défaut, les étapes suivent un ordre simple. Une question peut indiquer une courte étape corrective selon la réponse, puis revenir au fil commun. Ne pas imposer un scénario à embranchements complet, ni un nombre fixe d'étapes de chaque type. Vérifier que les identifiants et les transitions référencent des étapes existantes.

Séparer les données de la leçon du composant qui les affiche et pilote l'étape courante. Les questions de compréhension restent dans la leçon ; les cartes de mémorisation sont des données distinctes, avec leur propre état de révision. Aucune réponse à une question de leçon ne modifie cet état.

`TodaySession` charge la progression, pilote le passage de la leçon aux cartes et sauvegarde les réponses. Une file fixe pour la visite évite que les cartes changent pendant la session ; un rechargement reconstruit les cartes restantes. `CardSession` recueille les réponses de rappel et affiche le bilan. `FlashCard` gère le retournement et le geste horizontal : après révélation seulement, gauche → oubli, droite → rappel. Un déplacement horizontal d’au moins 60 px et dominant le déplacement vertical valide le geste ; une annulation ou un geste court ne classe rien. Les boutons Mémo et les touches fléchées sur la carte révélée offrent des alternatives. Le retournement anime les deux faces en CSS 3D, sans animation en mode réduction des mouvements. Les cartes sont reliées à la leçon par `cardIds` ; une référence manquante signale une erreur de contenu.

## Révision et mascotte

`CardResult` est un événement daté (`recalled` ou `forgotten`). `CardProgress` conserve `intervalDays`, `lastReviewedAt` et `dueAt`. La fonction pure `src/review/schedule.ts` calcule les échéances sans dépendre de React ou du stockage ; ses tests utilisent le runner natif Node.js (`npm test`, Node 24+). Les intervalles sont des durées de 24 heures, stockées en UTC et affichées à la date locale. La règle est volontairement simple, sans prétendre reproduire Anki ou FSRS.

`Memo` affiche les images transparentes de `public/memo/`, générées à partir de la mascotte retenue. Les boutons portent le sens accessible ; les images sont décoratives. La présentation de la leçon utilise `ChatBubble` et `WorkshopBackground` : bulles translucides, avatars et plaques graphiques animées en CSS. Le décor répond aux transitions de la leçon et se réorganise pour les cartes ; aucun mouvement de fond ne tourne en boucle. `prefers-reduced-motion` supprime les animations et transitions. `LearningProgress` regroupe les leçons terminées, les états des cartes et l’historique des réponses (`new` ou `review`). `src/progress/storage.ts` valide le format versionné `memstack.progress.v1`. Une donnée invalide bloque la lecture ou l’import sans la remplacer ; une écriture échouée conserve la carte courante et affiche une erreur. Aucune autre clé du navigateur n’est modifiée.

`createCompletedLessonQueue` ouvre directement les cartes inédites de la leçon qui vient d’être sauvegardée, sans autres cartes en attente ni révisions. Une leçon sans nouvelle carte retourne au choix. Les autres lots restent des actions explicites après le bilan.

`dailyQueue` déduplique les cartes inédites et les place avant un lot de cinq cartes dues triées par échéance. Chaque lot est figé pendant son traitement ; le suivant est reconstruit depuis la progression courante. Aucun quota journalier ni exclusion artificielle fondée sur l’historique du jour. `scheduleReview` repousse l’échéance après une réponse, empêchant le retour immédiat de la carte dans le lot suivant. Les échéances restent des instants UTC, sans anticipation.

`getRelearningSuggestions` propose jusqu’à trois leçons terminées : une carte doit avoir au moins deux oublis en révision sur des jours locaux distincts depuis sa dernière réussite en révision. Ignorer les réponses d’introduction, dates futures et cartes absentes. Si `lastReviewedAt` est plus récent que l’historique visible, attendre sa cohérence plutôt que proposer une ancienne fragilité pendant une synchronisation partielle. Cette heuristique ne modifie ni les intervalles ni la progression.

Effacer le cache conserve la progression et les préférences synchronisées, mais perd les sauvegardes de progression en attente. La session ne coordonne pas les écritures simultanées dans plusieurs onglets. `Course.lessonIds` définit l’ordre ; `coursePlan` conseille la première leçon non terminée. `learnedToday` reste une métrique informative. Les anciennes complétions sont conservées sans migration et les révisions continuent après la fin d’un parcours.

## Frontière entre client et serveur

### Défis de diagnostic

`src/data/challenges.ts` adapte les 36 dossiers versionnés répartis sur 12 thématiques de `shared/challengeDossiers.json`, avec fichiers, correction, points essentiels, alternatives, contre-exemples et sources primaires. `ChallengesPage` propose une recherche par titre/parcours et un filtre par thématique. Le thème est dérivé du parcours existant, sans nouvelle donnée personnelle. `ChallengesPage` et `ChallengeView` utilisent `/challenges` et `/challenges/:id`, les liens à fragments Pages et `LessonText` pour afficher le code comme texte. Les accès Google/réseau existants restent obligatoires. L’accès aux défis nécessite l’option IA. `src/challenges/themeAccess.ts` calcule ensuite le déblocage à partir de toutes les leçons des parcours partageant le même thème et de `completedLessons` : le catalogue, la route directe et la soumission via `ChallengeProvider` appliquent cette garde.

`src/challenges/ChallengeProvider.tsx` et `src/firebase/challenges.ts` gèrent les tentatives et leurs analyses séparées ; les tentatives sont sous `users/{uid}/challengeAttempts/{id}` : `version`, `challengeVersion`, `challengeId`, `answer`, `observations` et `actions` pour v2, `submittedAt` (timestamp serveur), `outcome` (`''`, `retry`, `understood`). Une lecture serveur précède l’usage. L’interface attend l’accusé serveur avant de montrer la correction ; les réponses obsolètes après changement de compte sont ignorées. Le provider est monté sur les pages de défis : une erreur de cette collection ne bloque pas le reste de l’atelier.

Les règles limitent lecture/création au propriétaire disposant du droit IA et valident les IDs publiés, les versions, le texte (1 à 4 000 caractères) et la date serveur. Les tentatives sont immuables côté client, y compris les anciennes autoévaluations. Les boutons et l’adapter d’autoévaluation sont retirés ; les ressentis historiques ne deviennent pas des résultats d’examen. Les reprises utilisent des IDs stables et des lectures/transactions serveur pour éviter les doublons après un accusé perdu. Aucun cache hors ligne, aucun import d’ancienne progression et aucune modification du plan de révision Anki. Les dossiers v1/v2 sont conservés et la correction correspondant à la tentative est affichée ; la réponse historique n’est jamais remplacée.

La correction est livrée avec le frontend, donc visible dans les sources du bundle ; le passage par une tentative sert au rythme pédagogique et ne constitue pas une protection anti-triche. Le verrou de complétion thématique est appliqué dans le frontend et son provider, pas dans les règles Firestore. Les complétions sont elles-mêmes déclarées par le client ; ce verrou décrit le parcours pédagogique et ne certifie pas la maîtrise des leçons. Aucun service d’exécution de code n’est ajouté. L’analyse personnalisée Mistral est un service opt-in séparé, décrit ci-dessous. Le contenu et son inspection sont consignés dans [CHALLENGES.md](content/CHALLENGES.md).

Le droit IA est lu côté serveur dans `users/{uid}/settings/challengeAccess` : seul `aiEnabled: true` autorise l’accès. Les clients ne peuvent jamais écrire ce document. `ChallengeAccessGate` ferme les routes avant montage des défis ; le provider vérifie aussi le droit avant sa lecture. Les règles imposent le droit aux tentatives et analyses ; le callable le relit dans sa transaction, même pour un retour existant. Les invitations de bêta restent une contrainte supplémentaire pour les nouveaux appels. L’absence ou la révocation du document bloque l’accès sans effacer les données. Les membres déjà invités doivent recevoir le document via un administrateur avant déploiement ; aucun compte n’est migré par le build.

### Bilan des examens

`ChallengesPage` assemble un bilan global et par thématique à partir des tentatives et analyses lues sur le serveur par `ChallengeProvider`. Le helper pur `getChallengeExamSummary` détermine un état par défi : validé, à retravailler, jamais tenté, en attente, indisponible ou historique sans verdict actuel. Une validation acquise exige une analyse terminée avec verdict et versions du défi et de sa grille actuels ; les anciennes autoévaluations ne sont jamais des verdicts. Les chargements et erreurs de lecture masquent les compteurs et recommandations plutôt que de les présenter comme des résultats vides. Le bouton d’actualisation relit les analyses sans appel au fournisseur. La suggestion utilise uniquement les thématiques débloquées, privilégie à retravailler puis jamais tenté, respecte le thème sélectionné et ouvre le détail sur action explicite. Aucun état de carte, progression ou résultat stocké n’est modifié par le bilan.

Le flag frontend `challengeAiEnabled` masque les suggestions de nouvelles tentatives lorsque l’analyse est désactivée et désactive le bouton de nouvelle tentative dans le détail ; la consultation du bilan et de l’historique reste disponible.

### Analyse des réponses aux défis — implémentation opt-in

Les 36 dossiers sont définis dans `shared/challengeDossiers.json` : fichiers, correction, checkpoints, alternatives et versions historiques. Les tentatives v2 ajoutent `observations` et `actions`, au maximum 2 000 caractères chacun et 4 000 au total avec le séparateur. Les anciennes tentatives v1 restent lisibles. Les analyses ne modifient aucune carte ni complétion.

`functions/` ajoute le callable `analyzeChallengeAttempt` en région `europe-west9`, Node 24. GitHub Pages ne peut pas protéger une clé fournisseur ni contrôler les coûts ; le worker de signalements planifié n'est pas adapté à un retour interactif. Ce service reçoit uniquement `{attemptId}`, vérifie Firebase Auth/App Check et charge la tentative du compte ainsi que le dossier de confiance de sa version. Il appelle Mistral côté serveur, puis persiste un message unique, un verdict structuré `validated` ou `retry` et ses versions dans `users/{uid}/challengeAnalyses/{attemptId}`. Le prompt v4 et son JSON Schema strict ajoutent les indices de points manqués à ces deux champs ; le serveur vérifie le résultat et attend sa transaction avant de le retourner. Le client affiche « Examen validé » seulement pour un résultat terminé avec `verdict: validated`. Les anciennes analyses sans verdict restent des retours historiques sans validation. Les règles autorisent seulement la lecture du propriétaire ayant accès à l’option IA ; analyses et compteurs ne sont jamais écrits par le client.

L'activation serveur est désactivée par défaut, la liste d'invités et le modèle sont vides. Des transactions réservent les quotas par utilisateur et globaux du jour UTC, puis dédupliquent les appels par tentative. Résultats existants réutilisés, expiration de lease et erreurs fournisseur incertaines en `needs_review`, sans relance automatique. La correction statique reste accessible. Le frontend affiche les données comme texte et construit lui-même son lien vers la correction. Une réponse reçue après changement de compte est ignorée.

Le formulaire et le dossier sont transmis au fournisseur, sans UID, email ni progression ; le consentement précède l'envoi. Aucun payload fournisseur, secret ou réponse personnelle n'est journalisé. Les retours sont pédagogiques et probabilistes, sans score certifiant. Les protections de prompt ne dispensent pas d'évaluer les réponses correctes, partielles, fausses, alternatives et hostiles.

**État du déploiement :** fonction déployée sur Blaze, en bêta invitée limitée. Secret Manager, App Check Enterprise, invitation et quotas sont configurés. Le modèle versionné retenu est `mistral-large-2512`, avec prompt v4 et JSON Schema strict. Le plafond Mistral enregistré est de 10 €/mois pour tout le compte, dont le worker de signalements ; une alerte projet et un cap Functions sont configurés à 5 €/mois chacun, sans garantir une limite globale de facture Google Cloud. Aucune facturation utilisateur ni clé personnelle n'est implémentée. Voir [CHALLENGE_AI.md](CHALLENGE_AI.md) et le rapport de vérification pour les limites de l'évaluation.

### Signalements assistés

`ContentReportButton` enregistre un signalement immuable sous `users/{uid}/contentReports/{id}` : cible, commentaire, snapshot JSON, empreinte SHA-256 et date serveur. Les règles réservent la création/lecture au propriétaire et les changements de statut au worker privilégié. L’index de groupe `contentReports.status` permet de rechercher les demandes en attente ; les longs textes ne sont pas indexés.

`.github/workflows/content-reports.yml` exécute un worker Node à intervalle de six heures, sur activation explicite. Les appels Mistral nécessitent une clé secrète : GitHub Actions fournit cette exécution serveur sans ajouter une API permanente ou Cloud Run. Le `.env` sert seulement à Node localement ; ni clé Mistral ni compte de service Firestore ne sont importés dans Vite.

Le worker consulte les sources primaires du registre, compare la version du contenu, puis sépare rédaction et inspection en appels distincts. Ses sorties sont des modifications textuelles contrôlées, jamais des commandes ou du code source exécutable. Les corrections versionnées dans `src/data/catalog/corrections.json` sont appliquées à l’assemblage, en conservant les IDs et le graphe. Tests et build précèdent une PR brouillon, sans fusion automatique. Le compte de service utilise IAM, distinct des règles client. Configuration, plafonds et reprises : [REPORTS.md](content/REPORTS.md).

Le frontend calcule les cartes dues et leur prochaine échéance. Un module métier dédié porte ces règles ; les composants d'interface n'accèdent pas directement à la structure des documents Firestore. Cette séparation permet de faire évoluer le stockage ou de déplacer une opération côté serveur sans réécrire le parcours.

Firebase Auth identifie l'utilisateur. Les règles de sécurité Firestore doivent limiter la lecture et l'écriture de sa progression à ce seul utilisateur et valider les données acceptées. Le calcul côté client n'est pas conçu pour rendre des scores infalsifiables : c'est acceptable pour une application personnelle.

## Pourquoi pas d'API REST maintenant ?

Le SDK Firestore fournit déjà au client l'accès aux données, sous contrôle des règles de sécurité. Les opérations de progression n’ont pas besoin d’une API REST supplémentaire. Le seul point d’entrée interactif ajouté est le callable Firebase pour l’analyse IA des défis ; les règles Firestore restent responsables des accès client.

La clé Mistral et les quotas justifient maintenant ce service limité. Une éventuelle veille demanderait un cadrage distinct ; aucune exécution de code n’est prévue.

## Déploiement

### Installation et interface mobile

Le manifeste Web, les icônes PNG et les métadonnées Apple permettent d’ajouter MemStack à l’écran d’accueil et de l’ouvrir en mode autonome. `InstallApp`, dans le profil, propose le dialogue d’installation lorsque le navigateur le fournit et des instructions pour iOS/Android. Le module chargé au démarrage conserve l’événement d’installation même avant le chargement de l’atelier. Aucun nouveau service ou backend n’est nécessaire.

Aucun service worker ni cache hors ligne n’est ajouté : le garde Google/réseau reste obligatoire, y compris dans l’application installée. Les mises à jour sont reçues à la prochaine ouverture/recharge réseau. La navigation mobile est placée en bas hors session ; une sortie explicite conserve l’espace de lecture pendant les leçons et révisions. Les marges tiennent compte des zones sûres des téléphones. Voir [PWA.md](PWA.md) pour l’installation et les limites de vérification.

`.github/workflows/pages.yml` installe avec `npm ci`, lance les tests, construit avec `--base=/` pour memstack.fr et publie uniquement `dist/`. Pages doit utiliser la source **GitHub Actions**, sans build Jekyll des sources.

En local, la navigation conserve les chemins `/today`, `/courses`, etc. En production, `src/navigation/` génère des liens `/#/today` : les fragments permettent le rechargement et l’ouverture directe sans réécriture serveur. Les illustrations et Mémo utilisent le même chemin de base. Aucun changement des IDs ou de la progression.

Firebase Auth doit autoriser `memstack.fr` et `www.memstack.fr` dans ses domaines autorisés pour la connexion Google en production. App Check utilise le fournisseur Enterprise enregistré dans Firebase et la variable GitHub publique `FIREBASE_APPCHECK_SITE_KEY`. Les règles Firestore restent à vérifier séparément ; ce workflow ne les déploie pas.

## Présentation et son

Les animations ne retardent ni le contenu ni les boutons. Les messages consécutifs regroupent leur avatar ; Mémo hésitant accompagne les questions. Le contenu pédagogique et les règles de révision restent indépendants de la présentation.

`useMessageSound` synthétise un bref son avec Web Audio après une interaction, sans fichier audio ni service externe. Le son est désactivé par défaut, réglable dans la leçon et mémorisé sous `memstack.message-sound`. Un navigateur sans audio ou stockage ne bloque pas le parcours. Les cartes conservent leurs gestes pendant le retournement. La discussion défile dans une zone limitée à la hauteur de l’écran ; le titre et les contrôles restent fixes. Chaque nouveau message défile dans cette zone, tandis que l’historique reste accessible en remontant.

Le serveur Vite utilise le port 3000 avec `strictPort` : si le port est occupé, il signale une erreur plutôt que de choisir un autre port.

## Parcours et contenu

`docs/CURRICULUM.md` et `docs/content/curriculum.json` définissent un catalogue de 150 leçons. `src/data/catalog/` contient les dialogues et cartes typés, indépendants du parcours actif, ainsi qu’un assembleur de transitions explicites. Les schémas SVG originaux de `public/lessons/catalog/` sont reliés aux leçons par `visuals.ts`. Sources, illustrations et verdicts pédagogiques sont documentés dans `docs/content/`. Les tests du catalogue contrôlent couverture, identifiants, cartes et chemins accessibles ; l’inspection du contenu reste une vérification distincte.

Les 30 parcours sont accessibles depuis le catalogue ; `/today` utilise le parcours actif. Les identifiants des trois leçons et des neuf cartes Docker déjà apprises sont conservés. Docker comprend désormais cinq leçons ; le badge historique « Cap sur Docker » conserve les trois premières comme condition, tandis que le badge générique exige un parcours entier.

`src/data/dockerCourse.ts` conserve les données originales pour compatibilité et tests ; l’interface utilise `src/data/catalog/index.ts`. Les contenus restent versionnés dans Git, sans copie dans Firestore. Le chargement différé sépare le catalogue du bundle de connexion. La complétion alimente le repère quotidien selon le calendrier local, sans consommer de quota ; les échéances des cartes restent des instants UTC.


Le développement local des examens peut utiliser un jeton App Check de débogage explicitement autorisé, conservé dans `.env.local` sous `MEMSTACK_APPCHECK_DEBUG_TOKEN`. Vite le transmet uniquement au navigateur local en mode development ; les builds et previews de production l’excluent. Google Auth, le droit IA serveur, les invitations et les quotas restent requis. Le compte Google dédié aux tests possède une progression artificielle séparée des utilisateurs réels ; voir `docs/CHALLENGE_AI.md`.

Les révisions après examen sont construites côté frontend à partir du verdict serveur `retry` et des liens leçon/défi du catalogue. `needsChallengeRevision` exige une tentative v2, un verdict terminé et les versions actuelles du dossier et de la grille. Les résultats historiques ou incomplets ne déclenchent pas ce panneau. Un paramètre `challenge` sur une route de relecture est accepté uniquement si le défi existe et référence cette leçon ; il n’accorde aucun accès et ne modifie aucune progression. Le retour passe par la route de défis et ses contrôles existants. Aucun nouveau service ni changement de règles n’est ajouté.

Les retours `challenge-feedback-v4` portent des indices de grille vérifiés serveur, jamais des liens générés. `checkpointLessonIds` lie éditorialement chaque point aux leçons du dossier ; la grille historique reste versionnée. Les helpers de comparaison et de synthèse exigent les versions compatibles, utilisent uniquement les analyses enregistrées et n’appellent aucun fournisseur. Les analyses v3 restent compatibles sans reconstruction de points manqués. Aucun changement d’authentification, quota ou règle Firestore n’est requis.
