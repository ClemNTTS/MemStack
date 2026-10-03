# Produit

## Intention

MemStack aide une personne à apprendre régulièrement des notions de développement et à les retenir. La valeur centrale est une session courte que l'on peut refaire chaque jour, sans dépendre d'une nouvelle leçon publiée quotidiennement.

## MVP

- Organiser le contenu en **thèmes → parcours → leçons**. Exemple : `DevOps → Docker → Images et conteneurs` ; Docker, CI/CD, Cloud, Terraform, Kubernetes, Observability et SRE sont des parcours possibles du thème DevOps.
- Suivre une leçon interactive en étapes courtes et voir sa progression dans le parcours.
- Découvrir 3 à 5 cartes liées à la leçon, puis réviser jusqu'à 5 cartes dues. S'il y en a moins de 5, ne pas compléter artificiellement la session.
- Après révélation, répondre à « Avais-tu retrouvé la réponse avant de la révéler ? » avec deux choix : **Non** (`forgotten`) ou **Oui** (`recalled`). Une réponse partielle sans l’idée essentielle compte comme non ; une réponse correcte après réflexion compte comme oui.
- La question reste au-dessus d’une carte retournable au clic ou au clavier. Après révélation, glisser à gauche signifie non, à droite oui ; les boutons Mémo restent disponibles de chaque côté. Chaque nouvelle carte commence face cachée.
- Mémo, mascotte lilas, accompagne les leçons. Ses expressions à plat et contente illustrent les deux choix ; une légende visible et des labels accessibles explicitent leur sens. L’expression hésitante reste disponible pour une future illustration pédagogique.
- Espacer progressivement les révisions selon le résultat et le temps écoulé, sans seuil de trois réussites. Règle initiale à ajuster après usage : première révision ou oubli → un jour ; réussite ultérieure → maximum de l’intervalle précédent et du double des jours écoulés, plafonné à 365 jours. Répéter immédiatement une carte n’augmente pas son intervalle.
- Retrouver ses leçons terminées et l'état de ses cartes sur plusieurs appareils.

## Hors MVP

Challenges avec exécution de code, veille automatisée, éditeur de leçons, notifications, points, classements, badges, parcours à déblocage complexe et statistiques détaillées.

## Rythme d'une leçon

Une leçon alterne des bulles courtes, des exemples concrets, parfois une image utile, et des questions qui invitent à prévoir la suite. Un choix révèle un retour adapté, puis une explication. Une réponse peut mener brièvement à une précision corrective avant de rejoindre le fil principal. L'humour aide à retenir une idée, sans remplacer sa justesse.

Les **questions dans la leçon** guident la compréhension : elles ne donnent pas de points et ne modifient pas la maîtrise d'une carte. Les **cartes après la leçon** servent à mémoriser et à planifier les révisions. Une leçon n'est pas obligée de suivre un nombre fixe de bulles, d'images ou de questions.

## Entités

**Thème** regroupe des **parcours** ; un parcours contient des **leçons** ; une leçon contient des **étapes interactives** et possède des **cartes** associées. La **progression utilisateur** indique les leçons terminées. L'**état de révision** d'une carte conserve son intervalle, sa dernière date de révision et sa prochaine échéance. L’**historique de révision** conserve la carte, la date et le résultat de chaque réponse.

## Ordre de réalisation

1. Définir un premier parcours et ses contenus, avec des cartes suffisamment claires pour être révisées seules.
2. Rendre une leçon complète en bulles et ses nouvelles cartes.
3. Ajouter la sélection des cartes dues et la règle de révision.
4. Sauvegarder la progression avec authentification et vérifier les règles d'accès.
5. Déployer, utiliser pendant quelques semaines, puis décider de la prochaine fonctionnalité à partir de cet usage.
