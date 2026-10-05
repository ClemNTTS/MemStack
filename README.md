# MemStack

## Déploiement

GitHub Actions teste, construit puis publie `dist/` sur [MemStack](https://clemntts.github.io/MemStack/). Dans Settings → Pages, sélectionner **GitHub Actions**. Ajouter `clemntts.github.io` aux domaines autorisés de Firebase Auth pour la connexion Google.

Le build Pages utilise `/MemStack/` et des routes à fragment (`#/today`) pour permettre le rechargement. En local, les chemins restent `/today`, `/courses`, etc.

MemStack est une webapp personnelle pour consolider des connaissances de développement par de courtes leçons quotidiennes et la répétition espacée.

## Le parcours

On progresse dans un **thème → parcours → leçons** (par exemple `DevOps → Docker → Images et conteneurs`). Une leçon se lit sous forme de bulles de messages. La session se termine par 3 à 5 nouvelles cartes de mémorisation, puis jusqu'à 5 cartes de révision arrivées à échéance. Après révélation, deux expressions de Mémo permettent d’indiquer si la réponse avait été retrouvée : non ou oui.

Le premier objectif est un parcours complet et utilisable chaque jour. Les challenges, la veille automatisée et la gamification avancée viendront seulement si l'usage le justifie.

## Documents

- [Produit](docs/PRODUCT.md) : périmètre, règles de révision et ordre de réalisation.
- [Architecture](docs/ARCHITECTURE.md) : choix techniques et raisons de ces choix.
- [Catalogue pédagogique](docs/CURRICULUM.md) : 12 thèmes, 30 parcours, 150 objectifs de leçons.
- [Production et inspection](docs/content/WORKFLOW.md) : rôles, corrections et validation des contenus.

## Développement

Après `npm ci`, lancer `npm run dev` et ouvrir `http://localhost:3000/`. Choisir un parcours dans `/courses`, découvrir ou consolider sur `/today`, réviser uniquement des cartes sur `/reviews` et relire sur `/library`. Les 30 parcours réunissent 150 leçons et 450 cartes. Le rendez-vous quotidien est un repère : les leçons sont libres et les lots de cinq révisions peuvent être renouvelés. Le profil permet de régler l’objectif personnel sans blocage. `npm run build` compile ; `npm test` vérifie les règles avec Node 24+.

Google et Internet sont obligatoires. Firestore synchronise la progression ; un cache par compte conserve les sauvegardes interrompues. Le choix du parcours et l’objectif restent locaux à cet appareil. L’import de l’ancienne progression sans compte se trouve dans le menu Compte. Les règles Firestore doivent être publiées avant utilisation.
