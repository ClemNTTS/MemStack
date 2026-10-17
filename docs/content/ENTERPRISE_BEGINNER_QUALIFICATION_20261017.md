# Corrections après les retours du propriétaire — 17 octobre 2026

Le propriétaire a signalé une première mission trop technique et sans contexte, des exemples mal présentés, un glossaire vague et des cartes inadaptées à un public non technique. Il a aussi demandé de conserver l'animation de la landing sans coupure de couleur à ses bords.

## Changements et relecture

- Deux fondations réécrites autour d'une invitation à une réunion. La première s'intitule désormais « Préparer un mail avec un assistant IA ». Elle annonce le but, montre le dialogue et sépare préparer, retrouver et envoyer. Quatre courts messages et un schéma précèdent l'atelier. Durées indicatives de six et sept minutes ; elles ne sont pas calibrées auprès de salariés.
- Six cartes de fondation rendues concrètes ; 114 autres relues, dont 66 reformulées après relecture indépendante et sept corrections croisées. Les 120 identifiants de cartes restent identiques pour conserver la progression. [Revue des cartes](ENTERPRISE_BEGINNER_CARDS_20261017.md).
- 53 définitions clarifiées et glossaires des deux fondations recentrés sur les mots du cas. « Pilote » est contextualisé dans un projet numérique avec un exemple de petite équipe et de durée. Les définitions Développement restent isolées. [Revue du glossaire](ENTERPRISE_BEGINNER_GLOSSARY_20261017.md).
- Les 37 autres exemples d'ateliers ont été aérés sans changer leurs mots, chiffres ou faits. Les deux fondations utilisent aussi plusieurs paragraphes. `LessonText` sépare désormais les paragraphes, tout en préservant les sauts de ligne et les blocs de code. Un test de régression couvre ce comportement.
- Une règle générale appliquait aux cases à cocher la largeur des champs de formulaire, comprimant le texte à droite. Elle exclut maintenant les cases ; la liste conserve des cases fixes et un texte souple. Sur mobile, les marges imbriquées et l'emplacement de l'avatar sont réduits pour élargir l'atelier.
- Le fond coloré rectangulaire du champ animé est retiré ; les traits et particules restent animés avec une atténuation progressive aux bords. Le texte Entreprise de la landing présente les trois usages pratiques.

## Vérifications

`npm test` : 260 tests réussis. `npm run build` : réussi, avec l'avertissement préexistant sur les gros bundles. Les IDs des 40 leçons et des 120 cartes, les prérequis, les bonnes options des questions et les 11 situations finales ont été comparés au commit précédent : conservés. Les clés privées, Functions et règles ne changent pas ; aucune nouvelle API n'est ajoutée.

Recette du navigateur intégré avec une organisation fictive : progression jusqu'au schéma et à l'atelier, saisie de deux phrases puis comparaison. L'exemple contient trois vrais paragraphes ; les cases et leur texte restent côte à côte. À une fenêtre de 390 × 844 pixels, document et viewport utile mesurent 375 pixels et le panneau de comparaison 285 pixels : aucun débordement horizontal. Le viewport a été réinitialisé. Cette recette ne modifie pas un compte réel et ne remplace pas un essai auprès de salariés.

- [Exemple sur ordinateur](../screenshots/enterprise-beginner/02-example-desktop.png)
- [Exemple sur mobile](../screenshots/enterprise-beginner/03-example-mobile.png)

La publication du frontend passe par le workflow Pages après push sur `main`. Aucune nouvelle publication Functions n'est nécessaire : les contrats d'enregistrement, les prérequis et les évaluations finales sont inchangés. Le catalogue serveur préparé lors du prochain build inclura aussi ces textes statiques clarifiés.
