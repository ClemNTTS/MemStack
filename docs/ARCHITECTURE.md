# Architecture

## Cible envisagée

```text
React + TypeScript + Vite
  ├─ contenu pédagogique versionné avec le projet
  └─ Firebase Auth → Firestore (progression personnelle)

GitHub Actions → vérification, build et déploiement sur GitHub Pages
```

Les thèmes, parcours, bulles et cartes sont du contenu statique : les modifier passe par le dépôt. Firestore conserve les données propres à l'utilisateur, notamment les leçons terminées et l'état de révision de ses cartes. Le contenu livré avec le frontend est public ; une interface d'administration ou du contenu privé demanderait un autre choix.

**État actuel :** `/today` affiche une discussion interactive définie dans `src/data/todayLesson.ts`. Les choix donnent un retour et peuvent mener à une étape corrective avant de rejoindre le fil principal. Firebase, les règles de révision et le déploiement restent à implémenter.

## Modèle des leçons

`Lesson` contient des métadonnées (identifiant stable, titre, catégorie, durée estimée) et une collection d'**étapes identifiées et typées**. Une étape peut être un message, une image avec texte alternatif ou une question avec choix et retours. Chaque type porte uniquement les données dont il a besoin ; de nouveaux types d'étapes doivent pouvoir être ajoutés sans modifier le contenu existant.

Par défaut, les étapes suivent un ordre simple. Une question peut indiquer une courte étape corrective selon la réponse, puis revenir au fil commun. Ne pas imposer un scénario à embranchements complet, ni un nombre fixe d'étapes de chaque type. Vérifier que les identifiants et les transitions référencent des étapes existantes.

Séparer les données de la leçon du composant qui les affiche et pilote l'étape courante. Les questions de compréhension restent dans la leçon ; les cartes de mémorisation sont des données distinctes, avec leur propre état de révision. Aucune réponse à une question de leçon ne modifie cet état.

## Frontière entre client et serveur

Le frontend calcule les cartes dues et leur prochaine échéance. Un module métier dédié porte ces règles ; les composants d'interface n'accèdent pas directement à la structure des documents Firestore. Cette séparation permet de faire évoluer le stockage ou de déplacer une opération côté serveur sans réécrire le parcours.

Firebase Auth identifie l'utilisateur. Les règles de sécurité Firestore doivent limiter la lecture et l'écriture de sa progression à ce seul utilisateur et valider les données acceptées. Le calcul côté client n'est pas conçu pour rendre des scores infalsifiables : c'est acceptable pour une application personnelle.

## Pourquoi pas d'API REST maintenant ?

Le SDK Firestore fournit déjà au client l'accès aux données, sous contrôle des règles de sécurité. Une API Node.js sur Cloud Run ajouterait un service à déployer et à maintenir sans besoin métier actuel. Node.js reste un outil de développement et de build ; il n'est pas un serveur de production dans ce MVP.

Un service côté serveur deviendra utile pour une veille collectée automatiquement, des appels nécessitant des clés secrètes, l'exécution isolée de challenges ou des récompenses dont le résultat doit être garanti. Firebase Auth pourra alors fournir un jeton que ce service vérifiera.

## Déploiement

GitHub Pages héberge le frontend statique ; GitHub Actions le construit et le publie. Lors de l'implémentation, configurer le chemin de base Vite et la navigation pour l'URL du dépôt. Les règles Firestore font partie des éléments à vérifier avant la mise en ligne.
