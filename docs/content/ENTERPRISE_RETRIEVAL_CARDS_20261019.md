# Cartes Entreprise : notions autonomes et clic plus réactif

## Demande et périmètre

Le 19 octobre 2026, le propriétaire signale une attente après le choix gauche/droite et des cartes difficiles à comprendre quelques jours après la leçon. Les cartes doivent entretenir les notions, sans demander de se souvenir d'une organisation fictive ou d'un exercice précis.

Les 120 cartes des 40 leçons sont reformulées en questions autonomes et réponses courtes. Le vocabulaire reste celui de Mémo : prompt, assistant IA, outil, brief. Les sources de chaque leçon et le contenu des leçons restent inchangés. Aucun fait produit, tarif ou exigence réglementaire nouveau n'est ajouté.

## Inspection pédagogique

Chaque paire question/réponse a été relue pour identifier le savoir à retrouver, rendre le domaine explicite et retirer les références aux personnages, lieux et chiffres des anciens exercices. La réponse doit donner une idée compréhensible par une personne non technique. Les exemples qui restent servent à expliquer la notion dans la carte elle-même.

| Partie inspectée | Cartes | Repères travaillés |
| --- | ---: | --- |
| Deux missions communes | 6 | Assistant IA, envoi d'un mail selon outils et droits, relecture, prompt, informations utiles, information manquante |
| Six missions assistants IA | 18 | Brief, critères de réussite, sources, faits et hypothèses, compte rendu, contraintes et préférences, corrections, méthode d'équipe |
| Six missions automatisation | 18 | Processus, déclencheur/action, règle fixe, connecteur, contrat de données, identifiant, idempotence, reprise, pilote, transmission |
| Six missions projet numérique | 18 | Cadrage, première version, critères d'acceptation, découpage, prototype, version de référence, recette, repli, maintenance et sauvegarde |
| Vingt ressources complémentaires | 60 | Fiabilité, contexte/RAG, données utiles, permissions, injection de prompt, itération, gain net, responsabilité, tests, incidents et répétition espacée |

Exemples de la nouvelle formulation :

- « Qu’est-ce qu’un prompt pour un assistant IA ? » : le message qui explique le résultat attendu, les informations et les consignes utiles.
- « Les assistants IA peuvent-ils envoyer un mail ? » : certains le peuvent si un outil de messagerie est connecté et les droits accordés. La capacité de rédaction ne donne pas à elle seule le droit d'envoyer.
- « Qu’est-ce que l’idempotence dans une automatisation ? » : traiter à nouveau la même demande sans créer plusieurs fois le résultat.
- « Qu’est-ce que la recette d’un site ou d’une application ? » : essayer les parcours et les comparer à ce qui était demandé avant l'ouverture.

Les questions restent distinctes (120 questions uniques). La plus longue compte 98 caractères, la réponse la plus longue 178. Ces bornes facilitent la lecture ; elles ne constituent pas à elles seules une preuve de qualité pédagogique. Aucune étude auprès de salariés ni mesure de mémorisation à quatre jours n'est revendiquée.

## Fluidité et sauvegarde

Auparavant, `CardSession` attendait la réponse serveur puis ajoutait une pause de 280 ms pour le départ de la carte. Cette pause est supprimée. Le choix apparaît immédiatement sur Mémo et dans un badge sur la carte ; la carte reste lisible pendant la sauvegarde. Après confirmation, la suivante arrive avec une animation de 180 ms au lieu de 340 ms. Aucun gain de latence réseau n'est revendiqué.

Une réponse non confirmée ne fait pas avancer le lot. En cas de refus ou d'erreur, la carte et sa réponse restent disponibles avec un message invitant à réessayer. La protection contre les soumissions simultanées et les doubles réponses reste en place. Le traitement commun améliore également l'interaction des cartes Développement ; seuls les textes Entreprise sont réécrits.

## Vérifications

- `npm test` : 275 tests réussis, dont gestes, planification, files de révision et contenu.
- `npm run build` : réussi ; avertissement de taille du bundle préexistant.
- Comparaison structurelle avec le commit précédent : seuls `question` et `answer` des cartes changent dans le catalogue. Les 120 IDs, les autres propriétés des leçons, les sources, les prérequis et les questionnaires restent identiques. Les historiques ne sont pas réinitialisés.
- Contrôle éditorial : pas de nom d'un personnage ou d'une entreprise fictive des exercices ; aucune question dupliquée. La relecture des paires vérifie le sens au-delà de ces contrôles mécaniques.
- Navigateur local, composants réels avec enregistrement fictif contrôlé : carte bloquée sur la même question tant que la confirmation n'arrive pas, choix immédiatement visible, refus conservant la carte et autorisant un nouvel essai, passage à la suivante après confirmation, réponse par flèche au clavier, résumé final correct des trois cartes travaillées.

La [capture d'une carte de notion](../screenshots/enterprise-memo/concept-review-card.png) provient de cet aperçu local. Les contrôles de confirmation de la fixture servent uniquement à simuler une sauvegarde lente ou refusée et ne font pas partie de l'application livrée.

Le calendrier de révision, les quotas et les autorisations ne changent pas. Le serveur utilise les identifiants des cartes, conservés ici ; cette livraison des textes et de l'interaction ne nécessite pas de déployer des Functions.
