# MemStack

## Déploiement

GitHub Actions teste, construit puis publie `dist/` sur [MemStack](https://clemntts.github.io/MemStack/). Dans Settings → Pages, sélectionner **GitHub Actions**. Ajouter `clemntts.github.io` aux domaines autorisés de Firebase Auth pour la connexion Google.

Le build Pages utilise `/MemStack/` et des routes à fragment (`#/today`) pour permettre le rechargement. En local, les chemins restent `/today`, `/courses`, etc.

MemStack est une webapp personnelle pour consolider des connaissances de développement par de courtes leçons quotidiennes et la répétition espacée.

## Le parcours

On progresse dans un **thème → parcours → leçons** (par exemple `DevOps → Docker → Images et conteneurs`). Une leçon se lit sous forme de bulles de messages. La session se termine par 3 à 5 nouvelles cartes de mémorisation, puis jusqu'à 5 cartes de révision arrivées à échéance. Après révélation, deux expressions de Mémo permettent d’indiquer si la réponse avait été retrouvée : non ou oui.

Le socle d’apprentissage est complété par trois défis Docker sur `/challenges` : poser un diagnostic, enregistrer sa tentative, puis comparer à une correction expliquée. Les tentatives sont synchronisées séparément des cartes, sans exécution de code ni notation automatique. La veille automatisée et la gamification avancée restent envisagées.

## Documents

- [Produit](docs/PRODUCT.md) : périmètre, règles de révision et ordre de réalisation.
- [Architecture](docs/ARCHITECTURE.md) : choix techniques et raisons de ces choix.
- [Catalogue pédagogique](docs/CURRICULUM.md) : 12 thèmes, 30 parcours, 150 objectifs de leçons.
- [Production et inspection](docs/content/WORKFLOW.md) : rôles, corrections et validation des contenus.
- [Signalements assistés](docs/content/REPORTS.md) : formulaire, worker Mistral et configuration des secrets GitHub.

## Développement

Après `npm ci`, lancer `npm run dev` et ouvrir `http://localhost:3000/`. Choisir un parcours dans `/courses`, découvrir ou consolider sur `/today`, réviser uniquement des cartes sur `/reviews` et relire sur `/library`. Les 30 parcours réunissent 150 leçons et 450 cartes. Le rendez-vous quotidien est un repère : les leçons sont libres et les lots de cinq révisions peuvent être renouvelés. Le profil permet de régler l’objectif personnel sans blocage. `npm run build` compile ; `npm test` vérifie les règles avec Node 24+.

Google et Internet sont obligatoires. Firestore synchronise la progression, le parcours actif et l’objectif quotidien. Les préférences cloud sont chargées à la connexion, au rechargement ou à la reconnexion ; les anciens réglages locaux sont repris seulement si aucune préférence cloud n’existe. Un changement est confirmé après sauvegarde serveur. L’import de l’ancienne progression sans compte reste explicite dans le menu Compte. Publier les règles Firestore avant le frontend.
