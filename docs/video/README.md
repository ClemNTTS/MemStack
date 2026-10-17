# Film MemStack Entreprise

Film vectoriel et typographique de 48 secondes en français, format 16:9. La version courante comporte trois apparitions de Mémo, une musique originale plus dynamique à 120 BPM et une voix off française synthétisée localement. Les textes à l'écran conservent le récit en lecture muette ; les sous-titres suivent les phrases parlées. La musique baisse automatiquement pendant la voix. Aucun échantillon musical tiers n'est utilisé.

## Livrables

- [MP4 H.264 + AAC](../../public/enterprise/video/memstack-entreprise.mp4), 1920 × 1080, 30 images/s.
- [WebM VP9 + Opus](../../public/enterprise/video/memstack-entreprise.webm), même définition et durée.
- [Poster WebP](../../public/enterprise/video/memstack-entreprise-poster.webp).
- [Textes synchronisés français](../../public/enterprise/video/memstack-entreprise.fr.vtt).
- [Lecteur de prévisualisation avec transcription](../../public/enterprise/video/preview.html).
- [Planche des sept scènes](ENTERPRISE_FILM_STORYBOARD.webp).

Le film présente les assistants, l'automatisation, les projets, la pratique et la progression collective. Les formes illustrent les méthodes ; elles ne sont pas des captures de l'application ou une démonstration d'outils connectés. Le prix reste dans la landing pour éviter de dater le film.

Le scénario et la direction artistique ont été produits par deux agents spécialisés, puis réalisés par un agent d'animation. Deux itérations ont supprimé les microtextes, la coche de validation implicite et le faux bouton, et introduit des raccords géométriques entre les scènes. [Scénario](ENTERPRISE_FILM_SCRIPT.md), [direction artistique et revue](ENTERPRISE_FILM_ART.md), [contrôle Q&A](ENTERPRISE_FILM_QA.md).

## Sources et reproduction

Les fichiers dans `scripts/enterprise-film/` constituent le projet de réalisation éditable :

- `timeline.mjs` : chronologie, durée et interpolation.
- `draw.mjs` : composition SVG déterministe de chaque image, textes, objets et raccords.
- `render.mjs` : images-clés, planches et rendu image par image avec Sharp et FFmpeg.
- `soundtrack.py` : composition et synthèse sonore originales, sans service externe.
- `narration.py` : synthèse des sept phrases françaises et sous-titres calés sur leur durée réelle.
- `produce.mjs` : assemblage, encodage des deux formats, poster et planche finale.

Prérequis de réalisation : dépendances npm du dépôt installées, Node 24+, FFmpeg avec libx264/libvpx-vp9/libopus, Python avec NumPy. Pour la voix, installer `kokoro-onnx==0.4.7`, `misaki==0.7.4` et `soundfile==0.14.0` dans `.npm-cache/enterprise-film/voice-deps/` et placer les modèles officiels `kokoro-v1.0.onnx` et `voices-v1.0.bin` dans `.npm-cache/enterprise-film/voice-model/`. Les modèles sont téléchargeables depuis [la release officielle model-files-v1.1](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1). Ils ne sont pas redistribués dans le site. Le fichier de narration contient l'adaptation explicite du type `speed` float32 déclaré par cet export ONNX, en contournant le cast int32 du wrapper.

Le rendu a été réalisé sous Windows avec Segoe UI ; la police n'est pas redistribuée. Sur une autre machine, installer une police autorisée équivalente et recontrôler la composition si Segoe UI est absente. Aucun de ces outils n'est nécessaire pour lire la vidéo. Aucun modèle n'est téléchargé par le navigateur et aucun service vocal n'est appelé par le site.

La voix `ff_siwis` est le préréglage français du [modèle Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), pas un enregistrement humain réalisé pour MemStack. [Crédits publics et attribution SIWIS](../../public/enterprise/video/CREDITS.txt), d'après [la fiche des voix](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md). Le mix n'a pas fait l'objet d'une séance d'écoute avec un ingénieur du son.

```sh
node scripts/enterprise-film/produce.mjs
```

Le rendu intermédiaire et les WAV sont écrits dans `.npm-cache/enterprise-film/`, ignoré par Git. Pour réencoder un master déjà rendu sans recalculer les 1 440 images :

```sh
node scripts/enterprise-film/produce.mjs --skip-render
```

Ajouter `--skip-narration` pour réutiliser un `narration.wav` existant. Le script et les fenêtres de voix sont dans [le JSON de narration](ENTERPRISE_FILM_NARRATION.json) ; les durées réellement synthétisées restent dans le cache de réalisation. La prononciation synthétique développe « IA » en « intelligence artificielle » et adapte phonétiquement le nom MemStack.

Pour travailler une image avant rendu :

```sh
node scripts/enterprise-film/render.mjs --still 14 .npm-cache/enterprise-film/frame-14.png
node scripts/enterprise-film/render.mjs --contact-sheet .npm-cache/enterprise-film/contact-sheet.png
```

## Utilisation dans la landing

Le composant `src/components/EnterpriseOfferFilm.tsx` remplace le visuel photographique dans le hero Entreprise. Il utilise un lecteur natif avec `controls`, `playsInline`, le poster et `preload="none"`, une présentation textuelle et les sous-titres français. La lecture est déclenchée par la personne ; aucune lecture sonore automatique. L'invitation finale est un texte du film, pas un bouton interactif.

Le lecteur fourni permet aussi de contrôler le film indépendamment de l'application : servir `public/` localement puis ouvrir `/enterprise/video/preview.html`. Le workflow Pages publie les médias statiques avec le frontend ; aucune Function n'est modifiée par cette intégration.

Recette du lecteur local : poster affiché, durée native de 48 secondes reconnue, lecture du MP4 déclenchée avec la commande du navigateur et images en mouvement observées. Les liens de téléchargement et la transcription sont présents. Le contrôle des codecs, du son, des sous-titres et des images finales est détaillé dans le rapport Q&A. Le build de l'application réussit ; l'avertissement préexistant sur la taille des bundles reste présent.
