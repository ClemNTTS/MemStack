# MemStack

MemStack est une webapp personnelle pour consolider des connaissances de développement par de courtes leçons quotidiennes et la répétition espacée.

## Le parcours

On progresse dans un **thème → parcours → leçons** (par exemple `DevOps → Docker → Images et conteneurs`). Une leçon se lit sous forme de bulles de messages. La session se termine par 3 à 5 nouvelles cartes de mémorisation, puis jusqu'à 5 cartes de révision arrivées à échéance. Après révélation, deux expressions de Mémo permettent d’indiquer si la réponse avait été retrouvée : non ou oui.

Le premier objectif est un parcours complet et utilisable chaque jour. Les challenges, la veille automatisée et la gamification avancée viendront seulement si l'usage le justifie.

## Documents

- [Produit](docs/PRODUCT.md) : périmètre, règles de révision et ordre de réalisation.
- [Architecture](docs/ARCHITECTURE.md) : choix techniques et raisons de ces choix.

## Développement

Après installation des dépendances avec `npm ci`, lancer `npm run dev` et ouvrir `http://localhost:3000/today` pour suivre le parcours Docker de trois leçons (une nouvelle leçon par jour) et réviser ses cartes. `npm run build` vérifie la compilation ; `npm test` vérifie les règles de révision avec Node 24+. La progression est sauvegardée dans ce navigateur (localStorage). Une leçon terminée ne recommence pas ; les cartes non traitées reprennent après rechargement, suivies de cinq révisions dues au maximum par jour. La connexion Google permet de synchroniser via Firestore. Après connexion, ouvrir « Importer ma progression locale » pour fusionner les apprentissages sans compte dans ce navigateur. Le mode local reste disponible sans connexion.
