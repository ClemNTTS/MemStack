# Relecture du glossaire Entreprise pour débutants

Date : 17 octobre 2026. Relecture par agent, sans séance avec des salariés réels. Périmètre : `src/data/enterpriseGlossary.json`, son utilisation dans `lessonGlossary.ts` et `GlossaryTerm.tsx`, puis cohérence des deux fondations réécrites avec leurs ateliers et cartes.

## Diagnostic

Les 180 définitions locales initiales ont été examinées. Les entrées historiques donnent généralement déjà un exemple ; plusieurs notions des parcours appliqués étaient beaucoup plus abstraites. « Mapping : correspondance entre champ source et destination » remplace un mot inconnu par deux expressions inconnues. « Pilote : essai limité avant extension » ne dit ni ce qu'on essaie ni dans quelle activité. Un simple glossaire ne remplace pas une explication dans la leçon, mais son ouverture doit permettre de comprendre le mot sans chercher trois autres définitions.

Le composant compose un glossaire général et les entrées de la leçon. Sur un terme identique, la définition locale prend le dessus. Les termes ne sont pas expliqués à l'intérieur d'une bulle ; une définition ne peut donc pas compter sur une autre bulle pour devenir compréhensible. La détection préfère le terme le plus long, traite les apostrophes droites/courbes et ne souligne pas chaque répétition d'un même ID dans un paragraphe.

## Corrections effectuées

- 53 définitions existantes réécrites : contexte d'usage, phrase simple et exemple concret. IDs, titres et termes de ces entrées conservés. Les notions déjà compréhensibles et exemplifiées n'ont pas été réécrites pour le seul changement de style.
- Les définitions des 18 nouvelles missions explicitent les objets du travail : un mail, une liste, un formulaire, une réunion ou un petit site. Les mots anglais restent expliqués quand le cours les emploie ; ils ne deviennent pas de nouveaux prérequis.
- « Mapping » devient une correspondance concrète entre réponse de formulaire et colonne d'une liste ; le changement de valeur soumise → à traiter est expliqué séparément du changement de nom de colonne.
- « Connecteur » devient une fonction pour faire communiquer deux logiciels, illustrée par formulaire → liste ; aucune garantie d'accès ou de disponibilité universelle.
- « Journal », « trace des actions », « idempotence » et « exception » s'appuient sur une demande identifiable et la différence entre fiche créée et notification non terminée. Ils ne présentent pas une intention comme une action réussie.
- « Infrastructure », « intégration », « maintenance », « modèle », « règle déterministe » et « déploiement » sont expliqués en termes d'équipements, réglages, suivi ou mise à disposition pour le travail réel, plutôt que par une définition réservée aux développeurs.
- Aucun nouveau terme API n'a été introduit pour expliquer un connecteur : le programme n'exige pas cette connaissance à ce stade.

### Pilote : contexte avant vocabulaire de projet

Définition retenue :

> Dans un projet numérique, un petit essai avant de décider de l’élargir. Cela peut concerner un assistant de travail, une automatisation ou un nouvel outil. Par exemple, cinq collègues essaient la préparation de comptes rendus pendant une semaine avant de la proposer à toute l’équipe. On choisit les tâches, la durée et les résultats attendus, puis on décide de continuer, d’ajuster ou d’arrêter.

Les cinq personnes et la semaine illustrent un cas, sans constituer un seuil universel ou une durée obligatoire. Le pilote ne se limite pas à installer un serveur. Douze entrées locales supplémentaires reprennent cette définition dans les leçons où le mot apparaît effectivement, afin que le fallback général ne réintroduise pas l'ancienne explication abstraite. La définition locale déjà présente dans `ent-automation-pilot` est conservée sous son ID historique et mise à jour. Le glossaire général n'est pas modifié et les ajouts ne s'appliquent pas à l'espace Développement.

### Deux fondations : notions réellement enseignées

Les deux leçons de départ ont changé de cas : elles concernent maintenant une invitation à une réunion, sans remboursement ni système de paiement. Leurs anciens glossaires techniques devenaient donc hors sujet et inatteignables. Avec accord du responsable d'intégration, ces deux tableaux sont remplacés par huit entrées aux IDs explicites :

| Leçon | Entrées locales utiles |
| --- | --- |
| `ent-answer-or-action` | `ent-start-draft` : brouillon ; `ent-start-recipients` : destinataires ; `ent-start-sent-mail` : messages envoyés ; `ent-start-mailbox` : messagerie. |
| `ent-useful-request` | `ent-start-request` : demande ; `ent-start-mail-subject` : objet ; `ent-start-missing-place` : lieu à confirmer ; `ent-start-short-format` : forme/longueur. |

Les anciens IDs techniques de ces seuls tableaux ne sont pas recyclés avec un sens sans rapport. Les deux IDs de leçon, leurs étapes, questions et cartes sont gérés par le rédacteur du contenu ; aucune donnée de progression n'est changée par cette intervention sur le glossaire. Le mot demande est d'abord expliqué avec une phrase ordinaire ; prompt est présenté comme un autre nom, pas comme une compétence préalable.

## Relecture indépendante des deux fondations

| Élément | Contrôle et conclusion |
| --- | --- |
| Première fondation | La situation de réunion fictive explique le gain recherché, montre demande → brouillon et distingue retrouver un lieu, écrire et envoyer. Elle ne commence plus par une permission, un identifiant d'opération ou un paiement. |
| Atelier de départ | Les pièces donnent jeudi 10 h, salle Bleue et les capacités de l'assistant. Production possible : « L'assistant prépare l'invitation et retrouve la salle dans la note. Léa relit le texte et les destinataires puis envoie dans sa messagerie. » Consulter ensuite les messages envoyés donne la vérification demandée. Aucun mail réel envoyé. |
| Questions et trois cartes | Les choix corrects restent 3 puis 2. Les cartes interrogent brouillon/envoi/messages envoyés et relecture ; les réponses restent compréhensibles sans savoir configurer une connexion. Les distracteurs simples conviennent ici à une première découverte. |
| Seconde fondation | Le contraste entre demande vague et invitation avec destinataire, horaire et réponse attendue enseigne concrètement l'intérêt de préciser. Les vérifications jour/heure/salle sont données dans le vocabulaire quotidien. |
| Atelier de demande | Le lieu est volontairement absent ; une demande autonome peut donner équipe, jeudi 10 h, réponse avant mardi, objet et cinq lignes, puis lieu à confirmer. Elle ne demande pas de rédiger le mail lui-même. L'exemple respecte ces données. |
| Questions et trois cartes | Choix corrects 1 puis 3 ; cartes sur informations pratiques, forme courte et lieu manquant. Le lieu n'est jamais déduit d'une réunion précédente. La salle Bleue du contre-exemple complet et le lieu absent de l'atelier sont deux variantes explicitement distinguées. |

Aucun blocage pédagogique identifié à cette lecture. Les durées de six et sept minutes restent estimées ; cette revue ne les mesure pas. Le lecteur peut produire les deux livrables sans outil externe, vocabulaire informatique ou achat.

## Vérification et limites

`node --test src/components/lessonGlossary.test.ts` : quatre tests réussis après les corrections. Ils contrôlent notamment que chaque définition locale est réellement atteignable dans le texte ou l'atelier de sa leçon, que son texte dépasse cinquante caractères, que les IDs sont uniques par leçon et que les termes locaux ne fuient pas dans une autre leçon.

Le test d'apostrophes utilisait l'ancienne notion identifiant de l'opération de la première fondation. Il porte maintenant sur la définition existante date relative d'achat dans `ent-minimum-data`, avec les variantes droite/courbe et une assertion explicite de l'ID `relative-purchase-date`. La propriété testée reste la même ; aucun terme artificiel n'est gardé dans une leçon pour satisfaire l'ancien exemple de test.

`npm run build` réussi après les corrections du glossaire et des fondations ; l'avertissement connu sur la taille du bundle demeure. La suite complète est coordonnée par le responsable d'intégration. Cette revue n'est pas un test visuel des bulles, une mesure de lisibilité auprès du public ou une preuve d'acquisition des notions. Une notion doit rester introduite dans la leçon avant qu'une carte demande de la restituer ; la simplification du glossaire seule ne suffirait pas à réparer un ordre pédagogique inversé.

## Seconde lecture de la fondation avec illustration

Le responsable d'intégration a ensuite séparé la première leçon en quatre messages : intérêt du mail, brouillon, lecture d'une note sans droit automatique de modification, puis envoi par Léa. L'illustration `prepare-find-send.svg` suit ces messages et résume préparer/retrouver/envoyer. Le texte alternatif et la légende conservent le rôle de Léa pour l'envoi. Relecture du contenu et du SVG source cohérente ; aucune nouvelle notion technique requise. Les trois cartes finales portent désormais sur messages envoyés, différence lecture/modification et relecture avant envoi. Cela conserve la différence entre les capacités, sans faire apprendre un remboursement ou un identifiant d'opération.

## Revue indépendante des propositions de cartes simplifiées

Le fichier de propositions transmis contenait finalement 66 cartes (63 annoncées au premier envoi, puis trois compléments). Les 66 questions et réponses ont été lues, leurs IDs contrôlés et leur sens comparé aux cartes du catalogue avant fusion. Les formulations situent généralement le cas avant le terme ; aucune ne prétend que finir une leçon configure un logiciel réel.

Retouches demandées au responsable avant fusion :

| Carte | Réserve précise / correction demandée |
| --- | --- |
| `ent-projects-specification-card-1`, `-card-2` | Les exemples de formulaire d'inscription s'éloignent du cas Rivage, où inscription et paiement sont précisément exclus. Préférer les deux fiches d'atelier et leurs champs visibles, puis une première page limitée. Cela conserve le principe de critère observable sans introduire trop tôt la gestion des inscriptions. |
| `ent-automation-map-card-3` | « Créer une fiche est plus facile » n'est pas une règle universelle. Ancrer le choix dans le cas où le prix reste à Karim, et où la ressaisie est la tâche répétitive observée. |
| `ent-assistants-documents-card-2` | Un montant peut venir d'un calcul explicité à partir des pièces, pas seulement d'un prix recopié. Conserver calcul et conditions à confirmer pour ne pas faire passer une proposition conditionnelle pour un engagement ferme. |
| `ent-environment-cost-card-3` | Ajouter les éventuels frais liés à l'utilisation au-delà de l'abonnement ; simplifier le budget ne doit pas faire oublier une dépense variable. |
| `ent-agents-permissions-card-2` | Garder une note du blocage, en plus de l'arrêt et de l'information de la personne prévue : vocabulaire simple, mais trace utile préservée. |
| `ent-assistants-team-playbook-card-1` | Ajouter qui tient la méthode à jour, pour conserver la transmission dans le temps, au-delà du premier essai. |

Les autres propositions ne montrent pas de contradiction de fond lors de cette relecture. Exemples : seuil nouveau explicitement annoncé dans `automation-select` (plus de 1 000 €, différent du seuil inclusif de l'exercice) ; gain 10 − 4 = 6 dans `automation-pilot` ; répétition de demande distinguée d'un même nom de client ; test clavier conservé comme contrôle initial sans certification d'accessibilité. La clôture de ces retouches sera consignée après relecture des versions intégrées.

### Clôture de la revue des propositions

Les sept propositions concernées ont été corrigées par leur auteur puis relues indépendamment avant fusion :

- Les deux cartes de spécification utilisent les fiches d'atelier, les informations visibles, l'année à confirmer et les exclusions inscription/paiement.
- La carte d'automatisation cite bien Atelier Rivage, Lina, la ressaisie retenue et les décisions de prix/envoi gardées par Karim : les faits correspondent au deuxième message de la leçon, sans règle universelle de facilité.
- La proposition commerciale donne 40 × 6 = 240, puis 240 + 25 = 265 ; vendredi dépend toujours de la validation avant mardi midi. Ce sont les chiffres et la condition du troisième message.
- Frais d'utilisation, trace du blocage et personne/date de revue de la méthode sont présents dans les trois autres cartes.

Verdict sur le lot de 66 propositions : aucune réserve bloquante restante ; fusion autorisée par la revue pédagogique. Le contrôle de copie finale dans le catalogue et la suite technique relèvent de l'intégration. Cette relecture ne transforme pas la simulation d'agents en test auprès de salariés et ne calibre pas la difficulté des cartes avec ce public.
