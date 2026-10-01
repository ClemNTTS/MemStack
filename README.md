# MemStack

MemStack est une webapp personnelle pour consolider des connaissances de développement par de courtes leçons quotidiennes et la répétition espacée.

## Le parcours

On progresse dans un **thème → parcours → leçons** (par exemple `DevOps → Docker → Images et conteneurs`). Une leçon se lit sous forme de bulles de messages. La session se termine par 3 à 5 nouvelles cartes de mémorisation, puis jusqu'à 5 cartes de révision arrivées à échéance. Chaque carte est classée « Connais pas », « À revoir » ou « Je sais ».

Le premier objectif est un parcours complet et utilisable chaque jour. Les challenges, la veille automatisée et la gamification avancée viendront seulement si l'usage le justifie.

## Documents

- [Produit](docs/PRODUCT.md) : périmètre, règles de révision et ordre de réalisation.
- [Architecture](docs/ARCHITECTURE.md) : choix techniques et raisons de ces choix.

## Développement

Après installation des dépendances avec `npm ci`, lancer `npm run dev` et ouvrir `/today` pour suivre la première leçon interactive. `npm run build` vérifie la compilation. Aucune base de données ni intégration Firebase n'est encore présente.
