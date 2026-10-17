# Intégration du film Entreprise — 17 octobre 2026

Le propriétaire a demandé une musique plus dynamique, quelques apparitions de Mémo, l'intégration dans la landing, puis une voix explicative. La version finale conserve le montage de 48 secondes et ses sept scènes.

- Trois illustrations de Mémo déjà présentes dans le produit, aux plans d'introduction, de pratique et de signature.
- Nouvelle composition originale à 120 BPM, avec basse et percussions légères.
- Sept phrases françaises synthétisées localement ; la dernière se termine à 44,551 secondes. La musique baisse pendant la voix. Aucun nouveau service n'est appelé par le site.
- Sous-titres calés sur les durées de parole et non sur les titres des scènes ; les intervalles sans sous-titres correspondent aux pauses.
- Lecteur natif au début de la landing, en remplacement du visuel photographique, avec `controls`, `playsInline`, `preload="none"` et sans lecture automatique. Le poster réserve le ratio 16:9 ; une présentation textuelle et les crédits restent accessibles.

## Vérifications

La recette du navigateur intégré a observé le poster et Mémo, puis une lecture manuelle avec durée 48 secondes, absence d'erreur et progression du temps ; pause vérifiée à 9,14 secondes. Le résumé textuel s'ouvre au clavier. À une fenêtre de 390 × 844, la largeur du document et celle du viewport utile sont égales à 375 pixels ; le lecteur mesure 339 pixels, sans débordement horizontal. Le viewport a ensuite été réinitialisé.

`npm run build` et `npm test` réussis, 259 tests applicatifs. Le build conserve l'avertissement préexistant sur les gros bundles. Les deux médias ont passé le décodage complet et les vérifications de durée, sous-titres, niveau audio et fin stable : voir [Q&A V4](ENTERPRISE_FILM_QA.md). Le naturel de la voix et sa prosodie ne constituent pas une validation par écoute humaine ; la narration est identifiée comme synthétique dans les [crédits](../../public/enterprise/video/CREDITS.txt).

Le push sur `main` publie le composant et les médias par [GitHub Pages](https://github.com/ClemNTTS/MemStack/actions/workflows/pages.yml). Aucun changement Functions, Firestore ou Stripe n'est requis.
