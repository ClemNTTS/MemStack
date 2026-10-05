# Production des leçons

## Les quatre rôles

1. **Programme** : lire le produit et l’architecture, définir thèmes, parcours ordonnés, objectifs et prérequis dans `docs/CURRICULUM.md`. Le plan machine lisible accompagne ce catalogue.
2. **Rédaction** : écrire chaque leçon et ses 3 à 5 cartes dans `src/data/catalog/`. Utiliser des sources techniques primaires et les relier aux leçons dans `SOURCES.md`.
3. **Illustrations et interactions** : créer des schémas utiles, leurs alternatives textuelles et des questions de diagnostic. Documenter leur origine et leur placement dans `VISUALS.md` ; coordonner l’insertion avec la rédaction.
4. **Inspection pédagogique** : relire les contenus, vérifier les sources, les prérequis, les contre-exemples et l’alignement entre objectif, question et cartes. Consigner les corrections et le verdict dans `REVIEW.md`.

## Boucle de correction

L’inspecteur formule des demandes précises avec l’identifiant de la leçon, le problème et le résultat attendu. Il les transmet au rédacteur ou à l’illustrateur, puis relit la version corrigée. Une erreur factuelle, un exemple trompeur, une carte ambiguë ou une question sans explication empêche la validation. Un contrôle technique réussi ne vaut pas validation pédagogique.

## Livraison

Le catalogue est une bibliothèque de contenus typés, accessible via la sélection de parcours. La découverte quotidienne et les révisions globales utilisent ce catalogue. Conserver les IDs historiques et les quotas entre parcours. Une leçon rédigée ou terminée n’est pas une preuve de maîtrise.

`npm run build` vérifie les types. `npm test` contrôle notamment la couverture du catalogue, les références entre parcours et leçons, les cartes, les chemins de discussion et les fichiers d’illustration. Les durées restent des estimations à ajuster après des sessions réelles.
