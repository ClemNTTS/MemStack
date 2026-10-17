# MemStack Entreprise — direction artistique du film

Date : 17 octobre 2026. Référence : [landing publiée, capture de qualification](../screenshots/enterprise-v2/04-offer-after-desktop.png), `src/components/enterpriseOffer.css`, `src/components/landing.css`, `src/index.css`.

## Intention

Un film de 48 secondes, 16:9, 1920 × 1080, 30 images/seconde. Une démonstration graphique des usages qui deviennent une compétence partagée. Le mouvement montre la transformation : les cartes se structurent, les étapes se relient, un ensemble se construit. Les écrans ne doivent pas simplement se succéder comme des diapositives.

Sans voix off ; tout le propos reste compréhensible sans son. Les sons éventuels sont une ponctuation originale discrète, jamais nécessaires à la compréhension. Le film ne promet ni connexion à un assistant réel, ni exécution automatique, ni création effective d'un site dans la formation. Les compositions sont des illustrations de compétences, pas des captures de fonctions inexistantes.

## Système visuel

| Rôle | Valeur | Usage |
| --- | --- | --- |
| Ivoire | `#F5F2EB` | Fond exact de la landing ; 70 % du film |
| Aubergine | `#30263D` | Texte principal exact Entreprise, fond de la conclusion |
| Violet | `#75539D` | Accent exact Entreprise, progression et traits actifs |
| Lilas clair | `#EADCF5` | Formes et cartes secondaires, jamais petit texte |
| Blanc chaud | `#FFFDF9` | Cartes, texte sur fond aubergine |
| Sauge | `#B6C6B7` | Accent secondaire limité aux validations illustrées |

Le violet n'est pas le texte par défaut. Le titre aubergine domine l'ivoire. Les traits significatifs sont aubergine ou violet, largeur 5 à 8 px à 1080p. Les grands aplats lilas structurent sans noyer le contenu. Éviter les gris pâles de la landing pour la vidéo : ils deviennent illisibles en lecture réduite.

La police de l'application est Segoe UI. Fichiers locaux vérifiés : `C:/Windows/Fonts/segoeui.ttf` (normal), `C:/Windows/Fonts/segoeuib.ttf` (gras), `C:/Windows/Fonts/segoeuil.ttf` (léger), `C:/Windows/Fonts/segoeuisl.ttf` (semi-léger). Utiliser normal et gras uniquement. Aucun fichier de police n'est actuellement embarqué dans `public/`. Ne pas copier les polices système dans les livrables distribués ; le rendu raster vidéo conserve leur aspect sans distribuer leurs fichiers. Repli local disponible : Arial et Arial Bold.

Titres : 88 à 112 px, gras, interligne 1,06, approche légèrement serrée. Signature finale : 104 px, trois lignes maximum. Libellés : 40 à 48 px, normal ou gras. Aucun texte visible inférieur à 36 px à 1080p. Douze mots maximum simultanément, hors marque ; une seule proposition à lire par mouvement. Marges de sécurité : 144 px horizontales, 100 px verticales. Prévoir que la vidéo sera souvent affichée en largeur 640 px : les libellés essentiels sont donc proches de 48 px.

Cartes aux coins de 28 px et ombres très légères ; contour 3 px au besoin. Un motif de trois cartes représente toujours les trois familles de compétences. Étoile à quatre branches discrète, cercle et rectangle arrondi forment le vocabulaire. Pas de robots, circuits, cerveau numérique, stock vidéo ou flux de code décoratif. Pas de fausse interface produit.

## Partition de réalisation

Le [conducteur éditorial](ENTERPRISE_FILM_SCRIPT.md) fixe les textes et les sept scènes. Les indications ci-dessous précisent leur réalisation. Aucun autre libellé n'est ajouté dans les formes : tous les diagrammes restent graphiques et les textes narratifs sont ceux du conducteur.

| Temps | Composition | Mouvement et raccord |
| --- | --- | --- |
| 0–5 s | Trois cartes légèrement décalées portent bulle, circuit, fenêtre. Titre ample à gauche, cartes à droite. Une étoile initiale donne naissance aux trois formes. | Entrées décalées de cinq images, rotation maximale ±6°. Les cartes se rapprochent puis se relient. Le texte est stable de 1 à 4,5 s. Le point de connexion agrandit la première carte pour le plan suivant. |
| 5–11 s | Assistants : trois blocs graphiques représentent le contexte, le but et le format. Une grande feuille ordonnée se compose à droite du titre. | Les blocs s'emboîtent dans une bulle, puis la bulle devient une feuille. Éviter toute réponse magique se rédigeant dans un faux chat. À la fin, les trois blocs deviennent les nœuds du prochain plan. |
| 11–17 s | Automatisation : trois étapes graphiques occupent la largeur sous le titre ; une courte bifurcation rejoint un repère humain. | La ligne se dessine, un point la parcourt avec une pause de douze images par étape. Le détour représente une exception et son relais. Les nœuds rejoignent ensuite une grille ; la ligne se replie en bord de fenêtre. |
| 17–23 s | Projets : un cadre de maquette se construit avec de grands blocs et une feuille de route en trois repères sans microtexte. | Construction additive : cadre, blocs, disposition. Une seconde version aligne et rapproche les éléments de la première. Le cadre se réduit pour devenir la carte de mission du plan suivant. Aucun faux navigateur ni déploiement. |
| 23–31 s | Pratique : triptyque dossier fictif, production personnelle, exemple expliqué. La production centrale domine légèrement ; l'exemple a une marge d'annotation violette pour rendre la différence visible sans libellés supplémentaires. | Apparition successive à 23,6 s, 24,5 s et 25,4 s ; un tracé d'annotation se dessine sur l'exemple à 26,4 s. Tenue commune de 27 à 30,4 s. Les cartes deviennent les départs de trois chemins. Le sens est exercice, travail, comparaison ; pas correction automatique. |
| 31–39 s | Collectif : trois chemins parallèles convergent vers une zone commune. Plusieurs points symbolisent les membres sans données nominatives. Un petit arc représente le rappel dans la durée. | Tracés progressifs de 31,5 à 33 s ; un repère revient à 34 s puis repart sur son chemin. Convergence douce de 36 à 38 s. La ligne commune devient le trait de signature ; un aplat aubergine remplit le fond. |
| 39–48 s | Signature sur aubergine : marque, slogan exact et invitation du conducteur. Soulignement lilas sur « collective ». Pas de faux bouton à l'intérieur de la vidéo. | Marque à 39,4 s, slogan révélé en deux groupes à 40 et 40,5 s ; invitation avant 42 s. Dernier mouvement terminé à 43 s. Image finale tenue cinq secondes, sans fondu noir. Cette image est le poster possible. |
## Chorégraphie et rythme

- Aucun déplacement purement décoratif pendant une phrase nouvelle. Le regard suit d'abord l'objet, puis lit le message immobile.
- Entrées d'objets : 18 à 24 images, courbe `cubic-bezier(0.22, 1, 0.36, 1)`. Sorties et raccords : 14 à 20 images, `cubic-bezier(0.4, 0, 0.2, 1)`.
- Petits raccords d'emboîtement : 10 à 14 images. Apparition d'une ligne : 24 à 36 images. Rotation limitée à 6° et supprimée à l'arrivée pour une image précise.
- Déplacements du point sur le réseau : vitesse presque linéaire avec accélération/freinage aux extrémités. Ne jamais faire rebondir les textes ; un overshoot maximum de 2 % est réservé aux formes.
- Les raccords conservent un objet repère : carte, bulle, trois blocs, trois nœuds, fenêtre, cartes, ligne finale. Maximum une transition globale du fond par scène.
- L'alternance donne du relief : mouvement d'environ 1 seconde, lecture de 2 à 3 secondes, transformation, lecture. Ne pas faire flotter toutes les couches en permanence.

## Contrôle visuel avant livraison

Extraire les images aux secondes 3, 8, 14, 20, 27, 35 et 45 ; vérifier débordement, contraste, lisibilité à 640 px et caractères accentués. Regarder aussi les raccords 4–6, 10–12, 16–18, 22–24, 30–32 et 38–40 s pour repérer les objets qui disparaissent sans transformation. Vérifier que le dernier écran reste stable pendant 5 secondes et que tout le film raconte la même chose sans son.

La livraison attendue est une vidéo effectivement encodée, un poster et des sources de réalisation reproductibles. Le storyboard seul ne constitue pas le livrable vidéo. Un plan de la vidéo doit être identifié comme illustration, et non comme capture de l'application, dans son contexte de diffusion si nécessaire.

## Revue des images rendues

Deux itérations ont été examinées visuellement le 17 octobre 2026. La première planche comportait des textes secondaires trop nombreux, un bouton simulé en conclusion et une coche près du livrable assistant. Les corrections demandées ont été appliquées : suppression des microtextes et redondances, invitation en texte avec flèche, URL courte, suppression de la coche, distinction graphique entre le cas, la production et l'exemple.

La seconde planche a été examinée pour les sept scènes ainsi qu'une planche de douze images autour des six raccords. Les ponts géométriques conservent désormais une carte et interpolent sa position et ses dimensions entre les scènes. Aucun débordement de texte ou conflit de contraste majeur n'a été observé. Le message principal est lisible sur une planche réduite à 640 px par scène ; les libellés internes restent secondaires dans un lecteur de 360 px. Ce contrôle porte sur les images calculées et les raccords échantillonnés ; le fichier encodé et sa lecture restent à contrôler séparément par la qualification technique.

Sources de revue locales : `.npm-cache/enterprise-film/contact-sheet-v1.png`, `contact-sheet-v2.png` et `transitions-v2.png`. Ces images intermédiaires ne sont pas les livrables diffusés.
