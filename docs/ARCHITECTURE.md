# Architecture

## Cible envisagée

```text
React + TypeScript + Vite
  ├─ contenu pédagogique versionné avec le projet
  └─ Firebase Auth → Firestore (progression personnelle)

GitHub Actions → vérification, build et déploiement sur GitHub Pages
```

Les thèmes, parcours, bulles et cartes sont du contenu statique : les modifier passe par le dépôt. Firestore conserve les données propres à l'utilisateur, notamment les leçons terminées et l'état de révision de ses cartes. Le contenu livré avec le frontend est public ; une interface d'administration ou du contenu privé demanderait un autre choix.

**État actuel :** `/today` propose la leçon statique une seule fois, ses cartes encore inédites, puis jusqu’à cinq révisions dues par jour. La progression est sauvegardée dans localStorage à chaque leçon terminée et à chaque réponse. Firebase, la synchronisation et le déploiement restent à implémenter.

## Modèle des leçons

`Lesson` contient des métadonnées (identifiant stable, titre, catégorie, durée estimée) et une collection d'**étapes identifiées et typées**. Une étape peut être un message, une image avec texte alternatif ou une question avec choix et retours. Chaque type porte uniquement les données dont il a besoin ; de nouveaux types d'étapes doivent pouvoir être ajoutés sans modifier le contenu existant.

Par défaut, les étapes suivent un ordre simple. Une question peut indiquer une courte étape corrective selon la réponse, puis revenir au fil commun. Ne pas imposer un scénario à embranchements complet, ni un nombre fixe d'étapes de chaque type. Vérifier que les identifiants et les transitions référencent des étapes existantes.

Séparer les données de la leçon du composant qui les affiche et pilote l'étape courante. Les questions de compréhension restent dans la leçon ; les cartes de mémorisation sont des données distinctes, avec leur propre état de révision. Aucune réponse à une question de leçon ne modifie cet état.

`TodaySession` charge la progression, pilote le passage de la leçon aux cartes et sauvegarde les réponses. Une file fixe pour la visite évite que les cartes changent pendant la session ; un rechargement reconstruit les cartes restantes. `CardSession` recueille les réponses de rappel et affiche le bilan. `FlashCard` gère le retournement et le geste horizontal : après révélation seulement, gauche → oubli, droite → rappel. Un déplacement horizontal d’au moins 60 px et dominant le déplacement vertical valide le geste ; une annulation ou un geste court ne classe rien. Les boutons Mémo et les touches fléchées sur la carte révélée offrent des alternatives. Le retournement change de face sans animation. Les cartes sont reliées à la leçon par `cardIds` ; une référence manquante signale une erreur de contenu.

## Révision et mascotte

`CardResult` est un événement daté (`recalled` ou `forgotten`). `CardProgress` conserve `intervalDays`, `lastReviewedAt` et `dueAt`. La fonction pure `src/review/schedule.ts` calcule les échéances sans dépendre de React ou du stockage ; ses tests utilisent le runner natif Node.js (`npm test`, Node 24+). Les intervalles sont des durées de 24 heures, stockées en UTC et affichées à la date locale. La règle est volontairement simple, sans prétendre reproduire Anki ou FSRS.

`Memo` affiche les images transparentes de `public/memo/`, générées à partir de la mascotte retenue. Les boutons portent le sens accessible ; les images sont décoratives. Aucun effet ni animation. `LearningProgress` regroupe les leçons terminées, les états des cartes et l’historique des réponses (`new` ou `review`). `src/progress/storage.ts` valide le format versionné `memstack.progress.v1`. Une donnée invalide bloque la lecture et propose une réinitialisation explicite ; une écriture échouée conserve la carte courante et affiche une erreur. Aucune autre clé du navigateur n’est modifiée.

`src/review/dailyQueue.ts` place les nouvelles cartes avant les cartes dues, triées par échéance croissante. Le plafond de cinq révisions prend en compte l’historique du jour local, y compris après rechargement ; les nouvelles cartes ne consomment pas ce quota. Les échéances restent des instants UTC : une carte n’est due qu’après l’heure prévue, et non dès minuit.

La sauvegarde est propre à ce navigateur et à cette origine. Effacer ses données efface la progression. La session ne coordonne pas les écritures simultanées dans plusieurs onglets. Le contenu actuel comporte une seule leçon ; une fois terminée, `/today` propose ses cartes restantes ou les révisions, puis un état « Tu es à jour ».

## Frontière entre client et serveur

Le frontend calcule les cartes dues et leur prochaine échéance. Un module métier dédié porte ces règles ; les composants d'interface n'accèdent pas directement à la structure des documents Firestore. Cette séparation permet de faire évoluer le stockage ou de déplacer une opération côté serveur sans réécrire le parcours.

Firebase Auth identifie l'utilisateur. Les règles de sécurité Firestore doivent limiter la lecture et l'écriture de sa progression à ce seul utilisateur et valider les données acceptées. Le calcul côté client n'est pas conçu pour rendre des scores infalsifiables : c'est acceptable pour une application personnelle.

## Pourquoi pas d'API REST maintenant ?

Le SDK Firestore fournit déjà au client l'accès aux données, sous contrôle des règles de sécurité. Une API Node.js sur Cloud Run ajouterait un service à déployer et à maintenir sans besoin métier actuel. Node.js reste un outil de développement et de build ; il n'est pas un serveur de production dans ce MVP.

Un service côté serveur deviendra utile pour une veille collectée automatiquement, des appels nécessitant des clés secrètes, l'exécution isolée de challenges ou des récompenses dont le résultat doit être garanti. Firebase Auth pourra alors fournir un jeton que ce service vérifiera.

## Déploiement

GitHub Pages héberge le frontend statique ; GitHub Actions le construit et le publie. Lors de l'implémentation, configurer le chemin de base Vite et la navigation pour l'URL du dépôt. Les règles Firestore font partie des éléments à vérifier avant la mise en ligne.
