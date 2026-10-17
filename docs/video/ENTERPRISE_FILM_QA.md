# Qualification indépendante du film Entreprise

Date : 17 octobre 2026. Périmètre : fichiers vidéo effectivement encodés, images finales, source de réalisation et cohérence avec l’offre. Ce contrôle est réalisé par un agent Q&A distinct de la réalisation ; il ne constitue pas une étude auprès de salariés ou de prospects humains.

## Nouvelle recette V3 — Mémo, musique et lecteur intégré

Cette recette porte sur les nouveaux exports réalisés le 17 octobre après la demande de présence de Mémo, d’une musique plus dynamique et d’intégration dans la landing. Les preuves V2 plus bas sont conservées comme historique ; leurs tailles, niveaux et empreintes ne décrivent pas les fichiers V3 actuels.

**Verdict V3 : aucun défaut bloquant relevé sur les fichiers finaux et le code du lecteur.** Mémo est présent dans les plans d’introduction, de pratique et de signature, avec des poses issues des assets du produit. Inspection réelle de la planche V3 et du poster final : pas de collision avec les titres, de texte coupé ou de modification de la promesse. Le slogan reste identique.

| Export V3 | Contrôle réel |
| --- | --- |
| MP4 | H.264, 1920 × 1080, `yuv420p`, 30 images/s, 1 440 images et 48,000 s ; AAC stéréo 48 kHz, 48,000 s ; 2 628 880 octets |
| WebM | VP9, 1920 × 1080, `yuv420p`, 30 images/s, vidéo de 48,000 s et conteneur de 48,008 s ; Opus stéréo 48 kHz ; 2 936 975 octets |
| Son MP4 | Moyenne −20,2 dBFS, pic −5,5 dBFS ; aucun écrêtage mesuré |
| Son WebM | Moyenne −20,1 dBFS, pic −4,8 dBFS ; aucun écrêtage mesuré |
| Poster | WebP réellement inspecté, 1920 × 1080, Mémo dans la composition finale |

Les deux nouveaux exports ont été intégralement décodés sans erreur par FFmpeg. Le nouveau mix utilise un arrangement synthétisé à 120 BPM et une cible de normalisation −18 LUFS. Les mesures de niveau ci-dessus portent sur les pistes effectivement encodées, et non sur l’ancien WAV. La moyenne dBFS n’est pas une mesure LUFS ; ces valeurs ne sont pas interchangeables. L’écoute sur plusieurs équipements reste une appréciation humaine distincte.

Le filtre `freezedetect` confirme à nouveau la stabilité de chaque export de 43 à 48 secondes. Les images sources à 43, 44 et 47,9 secondes ont une empreinte identique : `a27006d04710f9cd30783bcc1fea2671d653ff18732114db54fef99fd03715ea`. Le WebVTT a été recontrôlé : sept plages contiguës, de 00:00 à 00:48, sans dépassement ni chevauchement ; narration inchangée et cohérente avec le montage.

Le code `EnterpriseOfferFilm.tsx` est intégré à `EnterpriseOfferPage.tsx`. Inspection statique : commandes vidéo natives, `playsInline`, `preload="none"`, absence d’autoplay, titre accessible, description reliée au `figcaption`, piste française, transcription repliable et téléchargement. Le CSS conserve un ratio 16:9, une largeur fluide et des styles de focus. La recette navigateur responsive et de publication est menée séparément par l’agent principal ; cette inspection statique ne la remplace pas.

## Nouvelle recette V4 — voix française explicative

Cette recette remplace le mix uniquement instrumental de V3 par un mix avec narration. Les valeurs V2/V3 ci-dessus et ci-dessous sont des preuves historiques, pas les caractéristiques des exports V4 actuels.

**Verdict technique V4 : aucun défaut bloquant relevé.** La narration française de sept phrases correspond aux axes de l’offre et conserve le slogan. Elle décrit des méthodes et des exercices fictifs ; elle ne promet pas un assistant connecté, une publication dans MemStack, un résultat certifié ou un gain chiffré. Le texte source est conservé dans [ENTERPRISE_FILM_NARRATION.json](ENTERPRISE_FILM_NARRATION.json).

| Export V4 | Vérification réelle |
| --- | --- |
| MP4 | H.264, `yuv420p`, 1920 × 1080, 30 images/s, 1 440 images, vidéo et audio de 48,000 s ; AAC stéréo 48 kHz ; 2 600 315 octets |
| WebM | VP9, `yuv420p`, 1920 × 1080, 30 images/s, vidéo de 48,000 s, conteneur de 48,008 s ; Opus stéréo 48 kHz ; 2 783 829 octets |
| Signal MP4 | Moyenne −20,3 dBFS, pic −4,9 dBFS ; aucun écrêtage mesuré |
| Signal WebM | Moyenne −20,3 dBFS, pic −4,6 dBFS ; aucun écrêtage mesuré |

Les deux exports narrés ont été décodés intégralement, sans erreur FFmpeg. La composition reste stable de 43 à 48 secondes, recontrôlée séparément dans les deux formats avec `freezedetect`. Les images de V3 restent le montage de référence ; cette stabilité visuelle ne signifie pas un arrêt du son à 43 secondes.

Le WebVTT V4 a été comparé automatiquement au texte de narration et aux horaires réellement générés : sept textes exactement identiques après reconstitution des retours à la ligne, horaires arrondis à moins d’une milliseconde et chaque phrase comprise dans sa scène. Les plages sont ordonnées et sans chevauchement. Elles commencent à 0,200 ; 5,200 ; 11,200 ; 17,200 ; 23,200 ; 31,200 et 39,200 secondes. La dernière finit à 44,551 secondes. Les intervalles entre les plages correspondent aux pauses de narration ; les plages n’ont plus vocation à couvrir continuellement 00:00–00:48.

Inspection du mix : génération locale Kokoro avec voix française, normalisation séparée de la voix et de la musique, compression de la musique commandée par la voix, puis limiteur. Le lecteur annonce désormais « voix française et sous-titres » et la piste porte le libellé « Français · voix off ». Le lancement reste volontaire, sans autoplay, avec `preload="none"`.

**Limite de qualification : il s’agit d’une recette technique.** Aucune écoute humaine ni évaluation auditive de la prononciation, de la prosodie, de l’intelligibilité ou de l’équilibre subjectif musique/voix n’a été réalisée par cet agent. La correspondance texte/timing, les niveaux et les traitements audio ne prouvent pas ces qualités artistiques.

## Historique de recette V2 conservé

## Verdict

Les livrables finaux sont qualifiés pour une prévisualisation et une intégration dans un lecteur vidéo. Aucun défaut bloquant relevé après les corrections de la deuxième itération. La publication et la lecture sur les différents navigateurs restent des opérations distinctes ; ce rapport ne prouve pas une publication en production.

## Cohérence commerciale et pédagogique

Le [scénario](ENTERPRISE_FILM_SCRIPT.md) a été comparé à [l’offre actuelle](../ENTERPRISE_PRODUCT.md) et à `src/components/EnterpriseOfferPage.tsx`. Les trois axes assistants, automatisation et projets, les cas pédagogiques, les livrables, les exemples expliqués, les révisions et la progression collective correspondent au produit.

Le film conserve exactement « Faites de l’IA une compétence collective. ». Il n’annonce ni certification, ni performance chiffrée, ni correction automatique de production, ni assistant connecté, ni site effectivement publié dans MemStack. Les graphismes sont des illustrations de méthodes. Aucune donnée personnelle ou réponse individuelle n’est exposée dans le suivi d’équipe.

La première itération comportait une coche ambiguë sur le résultat de l’assistant, des petits textes accessoires et une invitation dessinée comme un bouton. Les images finales montrent la suppression de cette coche, la réduction des textes accessoires et une invitation typographique. L’adresse finale est `memstack.fr`. Les raccords conservent une carte géométrique interpolée entre les compositions.

## Contrôles visuels réels

- Inspection des sept scènes de la [planche finale](ENTERPRISE_FILM_STORYBOARD.webp), du poster WebP et d’une image à 45 secondes extraite du MP4 encodé.
- Inspection de douze images autour des six raccords, à 4,70/5,15 ; 10,70/11,15 ; 16,70/17,15 ; 22,70/23,15 ; 30,70/31,15 et 38,70/39,15 secondes.
- Inspection de versions réduites des sept scènes à 360 pixels de largeur, ainsi que de la planche à 640 pixels par scène. Titres et slogan restent lisibles ; les libellés secondaires des schémas sont plus petits à 360 pixels. Ils ne portent pas seuls une information essentielle : le texte narratif et les sous-titres doivent rester disponibles.
- Pas de texte coupé ou de collision visible ; accents et apostrophes français correctement rendus. Les trois cartes de pratique distinguent le cas, la production et l’exemple.
- La dernière composition ne devient pas noire. Les images sources rasterisées à 43, 44 et 47,9 secondes ont le même SHA-256 : `1321ba553635c0b3780d59009863021ff47f46f063b7edf367267331000b4445`.
- Le filtre FFmpeg `freezedetect`, appliqué séparément aux deux exports de 43 à 48 secondes, confirme cinq secondes de composition stable. De petites différences de pixels dues à la compression ne constituent pas du mouvement.

## Fichiers encodés inspectés

| Fichier | Résultat FFprobe / FFmpeg |
| --- | --- |
| MP4 | H.264 High, 1920 × 1080, progressif, `yuv420p`, 30 images/s, 1 440 images, vidéo et audio de 48,000 s ; 2 648 654 octets |
| Audio MP4 | AAC stéréo, 48 kHz, 128 kbit/s ; moyenne −23,3 dBFS et pic −11,8 dBFS |
| WebM | VP9, 1920 × 1080, `yuv420p`, 30 images/s ; vidéo de 48,000 s, conteneur de 48,008 s ; 2 851 553 octets |
| Audio WebM | Opus stéréo, 48 kHz ; moyenne −23,3 dBFS et pic −11,2 dBFS |
| Poster | WebP de la composition finale, 1920 × 1080, 49 618 octets |

Les deux fichiers ont été décodés intégralement avec `ffmpeg -v error -i … -f null NUL` : aucune erreur de décodage. Les huit millisecondes supplémentaires du conteneur WebM correspondent à l’encapsulation audio ; elles ne prolongent pas le montage visuel. Les mesures de niveau ne révèlent pas d’écrêtage. Le contrôle du signal ne remplace pas une appréciation humaine du mixage sur différents équipements.

## Textes synchronisés

Le fichier [WebVTT français](../../public/enterprise/video/memstack-entreprise.fr.vtt) contient sept plages contiguës couvrant 00:00 à 00:48, sans chevauchement, intervalle négatif ou dépassement. Les débuts et fins correspondent aux sept scènes du conducteur et les textes narratifs ont été comparés au scénario. La vidéo n’a pas de voix off ; les sous-titres reprennent le récit écrit plutôt qu’une parole inexistante.

Le film est compréhensible sans son. À l’intégration, conserver le lancement volontaire, les commandes natives et l’accès aux textes français. La validation visuelle ici est fondée sur les images et les fichiers : elle ne remplace pas une recette de lecteur, de clavier ou de technologie d’assistance, ni un test de compréhension auprès de clients.

## Reproductibilité du contrôle

Les commandes utilisent les fichiers de `public/enterprise/video/`. Les images de travail et les empreintes sont sous `.npm-cache/enterprise-film/` et restent hors des livrables versionnés.

```sh
ffprobe -v error -show_streams -show_format public/enterprise/video/memstack-entreprise.mp4
ffprobe -v error -show_streams -show_format public/enterprise/video/memstack-entreprise.webm
ffmpeg -v error -i public/enterprise/video/memstack-entreprise.mp4 -f null NUL
ffmpeg -v error -i public/enterprise/video/memstack-entreprise.webm -f null NUL
ffmpeg -hide_banner -ss 43 -i public/enterprise/video/memstack-entreprise.mp4 -vf "freezedetect=n=-50dB:d=1" -an -f null NUL
ffmpeg -hide_banner -i public/enterprise/video/memstack-entreprise.mp4 -af volumedetect -vn -f null NUL
```
