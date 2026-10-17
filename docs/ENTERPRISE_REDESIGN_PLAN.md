# Refonte Entreprise — contrat éditorial et technique

Date : 17 octobre 2026. Travail assisté par agents, sans validation utilisateur réelle à ce stade.

Promesse : **Faites de l’IA une compétence collective. Apprenez à mieux utiliser les assistants, à automatiser vos tâches et à faire avancer vos projets numériques.**

## Contrat de catalogue v2

- Conserver intégralement les 22 leçons, 66 cartes et 8 situations historiques : mêmes IDs et même sens. Elles restent consultables comme ressources complémentaires.
- `version: 2` pour le catalogue et les clés privées ; les tentatives existantes gardent leurs snapshots.
- Ajouter `foundationLessonIds` : `ent-answer-or-action`, `ent-useful-request`.
- Ajouter `tracks`: objets `id`, `title`, `description`, `outcome`, `audience`, `lessonIds`, `challengeIds`.
- Parcours `ent-track-assistants`, `ent-track-automation`, `ent-track-projects`. Six nouvelles leçons par parcours, un chapitre `ent-chapter-applied-{assistants|automation|projects}` chacun.
- Chaque nouvelle leçon a `prerequisiteLessonIds`: les deux fondations pour la première leçon du parcours, puis l’ID précédent. Les fondations sont ordonnées entre elles. Les autres anciennes leçons conservent leur comportement historique et restent des ressources complémentaires.
- Les trois nouvelles situations ont `prerequisiteLessonIds` couvrant les six nouvelles leçons du parcours. Les anciens IDs restent valides.
- Schémas des leçons, questions et ateliers identiques aux existants. Les clés des situations restent uniquement dans `shared/enterpriseAssessmentKeys.json`.

## Exigence pédagogique

Chaque leçon comprend une explication utile, un cas fictif autonome et chiffré si utile, un exemple et contre-exemple, un atelier avec livrable et critères, deux questions à trois choix avec feedback causal et au moins trois cartes de rappel. Les sources sont primaires et consultées. Les fonctionnalités d’outils dépendent des contrats ; aucune garantie universelle ou promesse d’autonomie sur un projet complexe.

Les ateliers se font dans MemStack avec pièces fictives et comparaison guidée. Ils n’exécutent aucun code, n’appellent aucune IA et ne constituent pas une preuve de maîtrise en situation réelle. Le transfert vers un outil d’entreprise autorisé est proposé explicitement sans nécessiter achat, données réelles ou service externe pour finir le parcours.

## Production et inspection

Lots temporaires distincts dans `.tmp/enterprise-redesign/`, fusion unique par le manager pédagogique. Revue croisée des rédacteurs, inspection exhaustive par IDs puis revue Q&A indépendante et retours de personas simulés. Les résultats simulés sont distingués des sessions humaines, qui restent nécessaires pour calibrer durées et difficulté. Aucun déploiement ni dépense.
