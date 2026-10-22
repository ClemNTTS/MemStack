# Relecture indépendante des cartes et consignes Entreprise

Date : 22 octobre 2026. Revue PO/testeur agent du lot D, après le commit C `1a8b673`, avant commit D. Cette inspection porte sur le code et le contenu statique ; aucun panel humain, appel Mistral réel ou comportement de production n'a été observé par ce relecteur.

## Méthode et périmètre réellement lus

Lecture des 120 couples question/réponse de `shared/enterpriseCurriculum.json` et des 40 scénarios, tâches et amorces de `src/data/enterprisePractices.json`, en plusieurs extractions pour éviter les sorties tronquées. Priorité aux fondations actuelles `ent-answer-or-action` et `ent-useful-request`, puis aux six missions assistants (`brief`, `documents`, `meeting`, `options`, `iterate`, `team-playbook`), puis aux missions automatisation, projets et ressources historiques.

La carte est lue isolément de sa leçon : sait-on ce qui est demandé, quelle idée essentielle rappeler et comment distinguer rappel suffisant et insuffisant ? Les points contrôlés sont l'autonomie, une question principale, le vocabulaire, l'utilité pour une décision professionnelle, la concision, l'absence de détail fictif à mémoriser et les affirmations trop absolues. Les consignes sont comparées au cas, au format annoncé, à l'amorce et, pour les cas signalés, aux exemples/critères existants. L'inspection ne se limite pas à rechercher des mots ou à compter des lignes.

Les questions de définition utiles ne sont pas toutes transformées en scénarios. Les questions Oui/Non sont acceptables lorsqu'elles rappellent une distinction importante et que la réponse attendue comprend sa justification. Aucun ajout d'objectif ni remplacement de compétence n'a été demandé ; les IDs et historiques restent à vérifier techniquement par la QA dédiée.

## Demandes transmises à l'auteur et résolution

| Élément | Défaut concret identifié | Décision et relecture finale |
| --- | --- | --- |
| `ent-hostile-document-card-1` | « Consignes cachées » excluait une instruction hostile parfaitement visible, comme celle de son propre cas. | Corrigé en consignes introduites dans un contenu, visibles ou cachées. La leçon et le glossaire restent cohérents ; même compétence. |
| `ent-assistants-documents-card-3` | Définir le fait comme simplement confirmé par un document pouvait laisser croire que toute pièce garantit la réalité. | Corrigé : information appuyée par une pièce vérifiable, hypothèse signalée ; fiabilité et version à contrôler. Relecture acceptée. |
| `ent-automation-pilot-card-3` | « Retirer du temps économisé… » laissait la référence et le signe du calcul implicites. | Corrigé avec formule temps à la main moins temps total automatisé, même lot, contrôle/corrections/suivi et interprétation d'un résultat négatif. Dernier ajustement demandé directement à l'auteur puis vérifié. |
| Activité `ent-numbers-sources` | « Gain de 2 minutes auquel s'ajoute une minute » pouvait se lire comme une addition au gain plutôt qu'un coût de relecture. | Scénario clarifié : deux minutes économisées avant vérification, puis relecture nécessaire. Tâche séparée en calculs puis portée de l'étude, unités et volume explicites. Chiffres et raisonnement attendus conservés. |
| Activité `ent-assistants-meeting` | Trois productions successives dans une seule phrase rendaient le travail à produire difficile à balayer du regard. | Trois éléments numérotés : prompt, relevé de quatre lignes, message de trois phrases maximum. Les catégories ne révèlent pas les réponses du cas. |
| Activité `ent-assistants-iterate` | Comparaison, modification, sorties attendues et modèle à garder étaient mêlés ; risque de confondre modèle et réponse particulière. | Trois étapes explicites ; champs remplaçables distingués des résultats d'essai. La modification unique reste demandée. |

Deux corrections complémentaires proposées par l'auteur ont également été relues : `ent-iterate-examples-card-1` n'affirme plus qu'une itération améliore forcément le résultat ; `ent-projects-prototype-card-1` présente un prototype comme version d'essai limitée, dont une maquette est un exemple. Acceptées, sans nouvelle compétence.

L'auteur a aussi clarifié l'activité `ent-iterate-examples` : consigne à ajouter au prompt ayant produit A, sans devoir reconstituer un prompt absent, puis comparaison des réponses fournies. Le scénario et les résultats à analyser restent disponibles ; correction acceptée.

## Arbitrages après discussion

- Fondations : le premier atelier demande deux phrases dans deux champs ; le second demande le prompt, pas le mail final. Les amorces n'insèrent pas une réponse à la place de l'apprenant. Les six cartes conservent des notions introductives nécessaires, sans mémorisation de date, salle ou personnage.
- Parcours assistants : les tâches documents et options restent composées de productions liées à une même décision. Leurs formats et pièces sont explicites ; pas de nouvelle décomposition imposée après relecture. Le budget produits de Lumen est distingué du total livré.
- `ent-assistants-team-playbook` : les six rubriques de la fiche, l'essai et la mesure sont déjà annoncés et soutenus par l'amorce ; conservé après discussion, sans ajout de critères cachés.
- `ent-projects-maintenance` : deux cas dans une même activité peuvent charger l'apprenant. La tâche sépare toutefois la fiche Lanterne puis la synthèse Cyprès, rappelle les informations du cas antérieur et donne des rubriques explicites. Conservé après discussion ; la charge ressentie reste à observer avec de vrais utilisateurs.
- Les autres cartes et tâches n'ont pas présenté de défaut majeur exigeant une réécriture lors de cette lecture. Ce verdict ne signifie pas que chaque formulation a été comprise par un humain ni que chaque mission tient dans sa durée indicative.

## Calculs et cohérence des cas relus

Les calculs suivants ont été refaits à partir des pièces fictives, sans convertir leurs résultats en promesse commerciale :

- Documents assistants : 40 carnets à 6 € donnent 240 € de produits ; livraison 25 €, soit 265 € livrés. Les 240 € respectent le budget produits de 280 € ; le délai dépend encore de la validation avant mardi midi.
- Options assistants : douze participants excluent la salle A de dix places ; B et C respectent le plafond de 500 €, C répond davantage à la préférence de trajet court, sous réserve des informations absentes.
- Nombres/sources : 200 × (2 − 1) = 200 minutes gagnées par semaine ; 200 × (2 − 3) = −200 minutes, donc une perte de 200 minutes. L'étude de traduction ne mesure pas la relecture ni le traitement des remboursements.
- Pilote automatisation : 60 − 18 − 12 = 30 minutes gagnées par lot ; 180 / 30 = six lots pour compenser le temps de mise en place, hors coûts non fournis.
- Budget environnement/coût : récurrent 40 + 20 + 120 + 30 = 210 € ; démarrage 150 + 90 = 240 € ; premier mois 450 €, au-dessus de l'alerte de 400 € et sous le plafond de 500 €. Aucune empreinte environnementale précise ne peut être déduite du cas.
- Incident : 50 × 6 = 300 minutes sans IA, contre 50 × (2 + 3) = 250 minutes ; gain de 50 minutes. Le gain n'annule pas la condition d'arrêt sur les promesses non autorisées.

Les clarifications demandées n'introduisent pas de nouvelle affirmation technique nécessitant une source externe : elles corrigent la portée ou la lecture des notions déjà enseignées et des pièces d'exercice. Les sources primaires du catalogue restent celles des missions ; cette revue n'est pas une nouvelle qualification de chaque source ou de chaque garantie fournisseur.

## Verdict et limites

**Accepté pour la revue pédagogique locale du lot D après les corrections ci-dessus.** Le diff final relu contient cinq réponses de cartes et quatre activités clarifiées ; 115 cartes et 36 activités sont conservées après inspection. Aucun blocant pédagogique majeur restant relevé dans le périmètre de cette lecture. Les tests structurels, clés de correction, IDs et versions sont une preuve technique distincte, à consigner par leur exécutant.

La preuve est une inspection indépendante par agent avec échanges directs de demandes/corrections et relecture du diff final. Elle ne démontre ni compréhension humaine, ni rétention, ni performance professionnelle. Le panel humain prévu dans le registre de livraison reste à organiser, avec rappel différé et situation nouvelle. La qualité des retours générés par Mistral en production n'est pas qualifiée par la lecture de ces textes.
