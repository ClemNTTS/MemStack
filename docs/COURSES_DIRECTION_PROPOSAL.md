# Proposition : un itinéraire conseillé, un catalogue libre

## Problème observé

La page `/courses` affiche trente parcours au même niveau, avec recherche et filtre par thème. Elle indique le parcours actif, mais ne dit pas lequel choisir ensuite ni pourquoi. Chaque détail contient déjà un chemin de cinq leçons ; il manque une direction au-dessus de ces chemins.

## Premier écran proposé

Afficher « Ta prochaine étape » : le parcours actif, son objectif concret, la prochaine leçon, sa durée et un seul bouton « Continuer mon chemin ». Quand toutes ses leçons sont terminées, remplacer ce bloc par le prochain parcours conseillé et expliquer le lien avec ce qui vient d’être appris. Toujours respecter les cartes à consolider, les échéances et l’allocation gratuite ; ne jamais démarrer une nouvelle leçon automatiquement.

## Une carte de progression par chapitres

Organiser les parcours en chapitres lisibles : comprendre les bases, construire une interface, relier les données, livrer et fiabiliser. Montrer une étape conseillée, les étapes terminées et les suivantes. L’ordre doit venir des prérequis réels du curriculum, pas simplement de son ordre d’affichage : « Navigateur et asynchronisme » dépend par exemple de JavaScript et des promesses, même s’il apparaît avant dans la liste actuelle.

Un premier itinéraire peut commencer par « Données et raisonnement » → « Processus, fichiers et outils » → « HTTP et navigation », puis bifurquer selon l’objectif choisi. Pour une interface : « HTML, CSS et accessibilité », « JavaScript essentiel », « Promesses et modules », « TypeScript fiable », puis « Composants et état ». Présenter deux ou trois objectifs compréhensibles (« créer une interface », « construire une API », « comprendre le déploiement »), avec des étapes communes et des prérequis explicitement reliés.

## Gamification qui représente un apprentissage réel

Chaque chapitre reçoit un objectif et un badge de fin. Distinguer « leçons terminées », « cartes à consolider » et « défi validé » : une lecture ne prouve pas à elle seule la maîtrise. Les examens gardent leur validation serveur et leur accès Premium. Un étudiant gratuit doit pouvoir terminer sa progression de leçons et de cartes sans qu’un défi Premium soit un verrou obligatoire. Ne pas ajouter d’XP au simple clic ou doubler les récompenses déjà existantes. Au passage d’une étape : courte animation de Mémo, progression du chapitre et prochaine action proposée, jamais lancée automatiquement.

## Liberté conservée

Replier le catalogue existant dans « Explorer tous les parcours ». L’étudiant peut changer de direction ; une recommandation explique les prérequis et ne devient pas une interdiction d’accès. Le parcours actif est sauvegardé par compte après accusé serveur. Le cap reste local à la page ; sa synchronisation future nécessiterait un schéma et une migration explicites.

## Ordre de réalisation

1. Ajouter la prochaine étape et un résumé du parcours actif, sans nouveau réglage obligatoire.
2. Structurer et vérifier les prérequis du curriculum dans un graphe de confiance.
3. Ajouter la carte de chapitres et les bifurcations d’objectif, puis les badges correspondants.

Implémenté le 15 octobre 2026 : trois caps, un chemin ordonné selon les prérequis des 30 parcours, cinq chapitres, des missions adaptées à la progression et aux quotas, cinq badges de chapitre et deux nouveaux Mémo. Le catalogue reste accessible. Les badges exigent toutes les leçons du chapitre, tous caps confondus ; aucun XP supplémentaire ni verrou pédagogique. Le cap reste local à la page ; le parcours actif conserve sa sauvegarde serveur avec accusé.
