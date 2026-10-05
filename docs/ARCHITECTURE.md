# Architecture

## Accueil et relecture

`Dashboard` affiche à `/` la progression locale, la session proposée par les mêmes règles que `/today`, et les badges dérivés des complétions et de l’historique. Les ancres du menu donnent accès à la session, au parcours et aux badges. Aucun nouveau stockage.

`/lessons/:id` ouvre `LessonReplay` pour une leçon déjà terminée. Il réutilise `LessonView` avec une action de fin dédiée et ne sauvegarde aucune progression. Les leçons inconnues affichent une page introuvable ; les leçons non terminées renvoient vers l’atelier. Les erreurs de lecture du stockage sont affichées explicitement.

## Cible envisagée

Le SDK `firebase` est installé. `src/firebase/client.ts` initialise Auth et Firestore pour `memstack-9f581`. La configuration Web est publique. Analytics n’est pas initialisé.

`ProgressProvider` expose connexion Google par popup, déconnexion, progression et état de synchronisation à tous les écrans. Il bloque le parcours pendant le chargement et remonte les erreurs. Sans compte, la clé locale existante est conservée. Avec compte, le cache est isolé sous `memstack.account.v1.{uid}` ; une lecture serveur fusionne ce cache avec Firestore à la connexion et au rechargement. Sans réseau, un cache de ce compte permet de continuer, avec une synchronisation en attente et une action Réessayer. Sans cache, une erreur bloque le chargement plutôt que d'afficher une progression vide.

Firestore conserve `users/{uid}/lessons/{lessonId}`, `cards/{cardId}` et `reviews/{eventId}`. Chaque réponse est d’abord sauvegardée localement, puis envoyée en arrière-plan. Les transactions conservent la date de complétion la plus ancienne et l’état de carte le plus récent. Les événements sont identifiés de façon stable pour éviter les doublons lors des reprises ; aucune limite d’historique ne supprime les anciennes révisions. Pour ce MVP personnel, tout l’historique est lu à la connexion ; paginer cette lecture si l’usage grandit. Les autres appareils voient les changements à la reconnexion ou au rechargement, sans abonnement temps réel.

L’import est une action explicite dans la barre de compte : il fusionne la progression sans compte de ce navigateur avec le compte courant, conserve la copie originale et peut être répété. La déconnexion revient à la progression sans compte ; elle n’efface pas le cache du compte. Les réponses concurrentes sur la même carte sont départagées par leur date client ; le MVP n’impose pas de verrou de session entre appareils.

`firestore.rules` limite chaque collection à son propriétaire, valide les champs et les intervalles, interdit les suppressions et rend les événements immuables. Tous les autres chemins sont refusés. Publier les règles depuis la console ou `firebase deploy --only firestore:rules --project memstack-9f581`. Vérifier propriétaire, autre compte, accès anonyme et schéma invalide avant mise en ligne.

Configuration console vérifiée le 5 octobre 2026 : Google Auth activé sous le nom public MemStack ; `localhost` est autorisé. Le projet reste sur Spark. Firestore Standard `(default)` est créé à Paris (`europe-west9`), en mode production (accès client refusés par défaut), sans sauvegardes planifiées payantes. Les règles par utilisateur et la synchronisation sont implémentées. Leur publication a été tentée dans la console ; la confirmation de la version publiée et le test Google de bout en bout restent nécessaires, la console ayant ensuite signalé des autorisations insuffisantes.

La dépendance transitive Node `@grpc/grpc-js` est fixée à 1.13.6 via `overrides` pour corriger les alertes de Firebase 12.19.0. L’audit npm après installation ne signale plus de vulnérabilité. Ce projet utilise le SDK navigateur ; vérifier cet override si un usage Node est ajouté.

```text
React + TypeScript + Vite
  ├─ contenu pédagogique versionné avec le projet
  └─ Firebase Auth → Firestore (progression personnelle)

GitHub Actions → vérification, build et déploiement sur GitHub Pages
```

Les thèmes, parcours, bulles et cartes sont du contenu statique : les modifier passe par le dépôt. Firestore conserve les données propres à l'utilisateur, notamment les leçons terminées et l'état de révision de ses cartes. Le contenu livré avec le frontend est public ; une interface d'administration ou du contenu privé demanderait un autre choix.

**État actuel :** `/today` propose la prochaine leçon du parcours Docker (trois leçons ordonnées), au maximum une leçon terminée par jour local, puis ses cartes inédites et jusqu’à cinq révisions dues. La progression est sauvegardée dans localStorage à chaque leçon terminée et à chaque réponse. Google Auth et la synchronisation Firestore sont implémentés ; le déploiement du frontend reste à réaliser.

## Modèle des leçons

`Lesson` contient des métadonnées (identifiant stable, titre, catégorie, durée estimée) et une collection d'**étapes identifiées et typées**. Une étape peut être un message, une image avec texte alternatif ou une question avec choix et retours. Chaque type porte uniquement les données dont il a besoin ; de nouveaux types d'étapes doivent pouvoir être ajoutés sans modifier le contenu existant.

Par défaut, les étapes suivent un ordre simple. Une question peut indiquer une courte étape corrective selon la réponse, puis revenir au fil commun. Ne pas imposer un scénario à embranchements complet, ni un nombre fixe d'étapes de chaque type. Vérifier que les identifiants et les transitions référencent des étapes existantes.

Séparer les données de la leçon du composant qui les affiche et pilote l'étape courante. Les questions de compréhension restent dans la leçon ; les cartes de mémorisation sont des données distinctes, avec leur propre état de révision. Aucune réponse à une question de leçon ne modifie cet état.

`TodaySession` charge la progression, pilote le passage de la leçon aux cartes et sauvegarde les réponses. Une file fixe pour la visite évite que les cartes changent pendant la session ; un rechargement reconstruit les cartes restantes. `CardSession` recueille les réponses de rappel et affiche le bilan. `FlashCard` gère le retournement et le geste horizontal : après révélation seulement, gauche → oubli, droite → rappel. Un déplacement horizontal d’au moins 60 px et dominant le déplacement vertical valide le geste ; une annulation ou un geste court ne classe rien. Les boutons Mémo et les touches fléchées sur la carte révélée offrent des alternatives. Le retournement anime les deux faces en CSS 3D, sans animation en mode réduction des mouvements. Les cartes sont reliées à la leçon par `cardIds` ; une référence manquante signale une erreur de contenu.

## Révision et mascotte

`CardResult` est un événement daté (`recalled` ou `forgotten`). `CardProgress` conserve `intervalDays`, `lastReviewedAt` et `dueAt`. La fonction pure `src/review/schedule.ts` calcule les échéances sans dépendre de React ou du stockage ; ses tests utilisent le runner natif Node.js (`npm test`, Node 24+). Les intervalles sont des durées de 24 heures, stockées en UTC et affichées à la date locale. La règle est volontairement simple, sans prétendre reproduire Anki ou FSRS.

`Memo` affiche les images transparentes de `public/memo/`, générées à partir de la mascotte retenue. Les boutons portent le sens accessible ; les images sont décoratives. La présentation de la leçon utilise `ChatBubble` et `WorkshopBackground` : bulles translucides, avatars et plaques graphiques animées en CSS. Le décor répond aux transitions de la leçon et se réorganise pour les cartes ; aucun mouvement de fond ne tourne en boucle. `prefers-reduced-motion` supprime les animations et transitions. `LearningProgress` regroupe les leçons terminées, les états des cartes et l’historique des réponses (`new` ou `review`). `src/progress/storage.ts` valide le format versionné `memstack.progress.v1`. Une donnée invalide bloque la lecture et propose une réinitialisation explicite ; une écriture échouée conserve la carte courante et affiche une erreur. Aucune autre clé du navigateur n’est modifiée.

`src/review/dailyQueue.ts` place les nouvelles cartes avant les cartes dues, triées par échéance croissante. Le plafond de cinq révisions prend en compte l’historique du jour local, y compris après rechargement ; les nouvelles cartes ne consomment pas ce quota. Les échéances restent des instants UTC : une carte n’est due qu’après l’heure prévue, et non dès minuit.

La sauvegarde est propre à ce navigateur et à cette origine. Effacer ses données efface la progression. La session ne coordonne pas les écritures simultanées dans plusieurs onglets. Le parcours Docker comporte trois leçons et neuf cartes. `Course.lessonIds` définit l’ordre ; `src/review/coursePlan.ts` choisit la première leçon non terminée et applique la limite quotidienne. Les anciennes dates de complétion sont conservées sans migration. Si des cartes inédites d’une leçon terminée restent en attente, elles passent avant une nouvelle leçon ; après ce rattrapage, rouvrir `/today` permet de découvrir la prochaine leçon si le quota le permet. Après les trois leçons, les révisions continuent.

## Frontière entre client et serveur

Le frontend calcule les cartes dues et leur prochaine échéance. Un module métier dédié porte ces règles ; les composants d'interface n'accèdent pas directement à la structure des documents Firestore. Cette séparation permet de faire évoluer le stockage ou de déplacer une opération côté serveur sans réécrire le parcours.

Firebase Auth identifie l'utilisateur. Les règles de sécurité Firestore doivent limiter la lecture et l'écriture de sa progression à ce seul utilisateur et valider les données acceptées. Le calcul côté client n'est pas conçu pour rendre des scores infalsifiables : c'est acceptable pour une application personnelle.

## Pourquoi pas d'API REST maintenant ?

Le SDK Firestore fournit déjà au client l'accès aux données, sous contrôle des règles de sécurité. Une API Node.js sur Cloud Run ajouterait un service à déployer et à maintenir sans besoin métier actuel. Node.js reste un outil de développement et de build ; il n'est pas un serveur de production dans ce MVP.

Un service côté serveur deviendra utile pour une veille collectée automatiquement, des appels nécessitant des clés secrètes, l'exécution isolée de challenges ou des récompenses dont le résultat doit être garanti. Firebase Auth pourra alors fournir un jeton que ce service vérifiera.

## Déploiement

GitHub Pages héberge le frontend statique ; GitHub Actions le construit et le publie. Lors de l'implémentation, configurer le chemin de base Vite et la navigation pour l'URL du dépôt. Les règles Firestore font partie des éléments à vérifier avant la mise en ligne.

## Présentation et son

Les animations ne retardent ni le contenu ni les boutons. Les messages consécutifs regroupent leur avatar ; Mémo hésitant accompagne les questions. Le contenu pédagogique et les règles de révision restent indépendants de la présentation.

`useMessageSound` synthétise un bref son avec Web Audio après une interaction, sans fichier audio ni service externe. Le son est désactivé par défaut, réglable dans la leçon et mémorisé sous `memstack.message-sound`. Un navigateur sans audio ou stockage ne bloque pas le parcours. Les cartes conservent leurs gestes pendant le retournement. La discussion défile dans une zone limitée à la hauteur de l’écran ; le titre et les contrôles restent fixes. Chaque nouveau message défile dans cette zone, tandis que l’historique reste accessible en remontant.

Le serveur Vite utilise le port 3000 avec `strictPort` : si le port est occupé, il signale une erreur plutôt que de choisir un autre port.

## Parcours et contenu

`src/data/dockerCourse.ts` assemble les leçons Images et conteneurs (identifiant existant conservé), Volumes et persistance, puis Ports et réseaux. Chaque leçon possède trois cartes autonomes. La progression indique le nombre de leçons terminées sur trois, dans la leçon et la session de cartes. Terminer une leçon consomme le quota du jour ; commencer une leçon sans la terminer ne le consomme pas. La limite des leçons suit le calendrier local ; les échéances des cartes restent des instants UTC.
