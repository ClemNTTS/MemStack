# Mémo — chemin de données

Assets générés avec le **built-in image_gen**, depuis `public/memo/learning.webp` comme référence d’identité et de style. L’original est conservé. Les nouveaux fichiers consommés par l’application sont :

- `public/memo/journey-guide.webp` : Mémo tient une carte aux trois étapes reliées et montre la suite.
- `public/memo/journey-celebrate.webp` : Mémo lève les bras et porte une médaille représentant des nœuds reliés.

Les deux images possèdent une véritable couche alpha, sont exportées en WebP 480 × 398, et conservent le personnage lavande, sa boucle, ses yeux bleu nuit et ses joues lilas. Aucun texte ni décor n’est inclus. Les animations et les connexions du chemin sont réalisées dans l’interface et respectent la préférence de réduction des mouvements.

Prompts utilisés :

1. « Create a new sibling pose of the exact Mémo reference character; same lavender rounded body, curled sprout, navy sparkling eyes, lilac cheeks and tiny hands/feet; clean soft flat 2D style. Replace the book with an unfolded cream-and-violet route map with three connected circular data nodes. Mémo holds the map and points toward the next step. One centered full-body character, real alpha transparency, readable at 120 px. No text, hat, extra character, background, shadow rectangle or watermark. »
2. « Create a new sibling pose of the exact Mémo reference character, retaining its identity, proportions and pastel flat 2D style. Mémo celebrates a completed chapter, both tiny hands raised, wearing a cream-and-violet medal with a simple three-node connected path symbol. One centered full-body character with real alpha transparency. No book, text, hat, surrounding confetti/stars, extra character, background, shadow rectangle or watermark. »

La génération a fourni les PNG sources ; Sharp a seulement adapté leurs dimensions et leur format pour le chargement web, en conservant l’alpha.
