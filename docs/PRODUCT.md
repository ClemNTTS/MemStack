# Produit

Ce document décrit le MVP et les fonctionnalités actuelles. La [vision finale proposée](VISION.md) décrit la cible à discuter, notamment les défis sans exécution de code ; elle ne vaut pas engagement d’implémentation.

## Intention

MemStack aide une personne à apprendre régulièrement des notions de développement et à les retenir. La valeur centrale est une session courte que l'on peut refaire chaque jour, sans dépendre d'une nouvelle leçon publiée quotidiennement.

## MVP

- Organiser le contenu en **thèmes → parcours → leçons**. Exemple : `DevOps → Docker → Images et conteneurs` ; Docker, CI/CD, Cloud, Terraform, Kubernetes, Observability et SRE sont des parcours possibles du thème DevOps.
- Suivre une leçon interactive en étapes courtes et voir sa progression dans le parcours.
- Découvrir les cartes liées à une leçon, puis réviser jusqu’à cinq cartes dues. Proposer « Réviser encore » pour lancer un autre lot sans refaire une leçon. Aucun plafond quotidien ; ne pas compléter artificiellement un lot ni avancer les échéances.
- Après révélation, répondre à « Avais-tu retrouvé la réponse avant de la révéler ? » avec deux choix : **Non** (`forgotten`) ou **Oui** (`recalled`). Une réponse partielle sans l’idée essentielle compte comme non ; une réponse correcte après réflexion compte comme oui.
- La question reste au-dessus d’une carte retournable au clic ou au clavier. Après révélation, glisser à gauche signifie non, à droite oui ; les boutons Mémo restent disponibles de chaque côté. Chaque nouvelle carte commence face cachée.
- Mémo, mascotte lilas, accompagne les leçons. Ses expressions à plat et contente illustrent les deux choix ; les symboles × / ✓ et des labels accessibles explicitent leur sens, sans consignes visibles sous la carte. L’expression hésitante reste disponible pour une future illustration pédagogique.
- Espacer progressivement les révisions selon le résultat et le temps écoulé, sans seuil de trois réussites. Règle initiale à ajuster après usage : première révision ou oubli → un jour ; réussite ultérieure → maximum de l’intervalle précédent et du double des jours écoulés, plafonné à 365 jours. Répéter immédiatement une carte n’augmente pas son intervalle.
- Retrouver ses leçons terminées et l'état de ses cartes sur plusieurs appareils.

## Hors MVP

Challenges avec exécution de code, veille automatisée, éditeur de leçons, notifications, points, classements, parcours à déblocage complexe et statistiques détaillées.

## Première extension : défis de diagnostic

Trente-six défis couvrent les douze thématiques du programme, avec au moins trois scénarios par thème. Les trois défis Docker historiques sont conservés. Le catalogue se filtre par thématique et par recherche. Les défis sont réservés aux membres ayant accès à l’option IA ; aucun paiement n’est intégré pour le moment. Chaque défi se débloque lorsque toutes les leçons de sa thématique, dans tous ses parcours, sont terminées. Terminer uniquement son parcours ou les leçons liées ne suffit pas. Depuis `/challenges`, observer un scénario et sa configuration, lire les fichiers du dossier et remplir « Ce que je constate » et « Ce que je ferais », puis comparer avec une correction expliquée, des points essentiels et des contre-exemples.

Une tentative non vide est enregistrée sur le compte avant d’afficher la correction. L’historique conserve la réponse, la date serveur et la version du défi ; il est distinct des cartes et des complétions de leçons. Seule l’analyse IA produit le verdict « Validé » ou « À retravailler », sans note ni certification. Les anciennes autoévaluations sont conservées sans servir de verdict. Une nouvelle tentative conserve les précédentes. La relecture d’une correction n’écrit rien et le rechargement retrouve l’historique ; un brouillon non envoyé n’est pas sauvegardé.

Aucun code n’est exécuté. Le retour personnalisé Mistral accompagne le verdict : un message explique les points justes, incomplets ou erronés et accepte les alternatives défendables. Si l’analyse IA est désactivée dans cette version, les nouvelles tentatives sont suspendues et l’historique reste consultable. Une erreur d’analyse ne valide jamais la réponse ; la correction de référence reste accessible après sauvegarde. Le serveur Firebase exige un droit IA administrateur et une invitation de bêta pour les nouvelles analyses, avec quotas ; il est déployé sur Blaze pour une bêta limitée au propriétaire, avec Mistral Large 2512 et App Check Enterprise. Les nouveaux droits et verdicts de ce correctif restent à déployer. Les signalements restent gratuits ; paiements et clés personnelles sont différés. Voir [CHALLENGE_AI.md](CHALLENGE_AI.md). La veille reste une option à évaluer séparément.

Le catalogue affiche un bilan global et par thématique : défis validés, à retravailler et jamais tentés. Chaque défi compte une seule fois ; une validation IA de la version actuelle reste acquise même après une tentative ultérieure. Les analyses en attente, indisponibles et les historiques sans verdict actuel restent distincts des réussites et échecs. Le bouton d’actualisation lit les résultats sur le serveur sans demander d’analyse IA. La prochaine tentative proposée privilégie un défi à retravailler, puis jamais tenté, dans une thématique débloquée. Le thème choisi délimite cette suggestion et aucun défi ne démarre automatiquement.

Lorsque l’analyse IA est désactivée dans cette version, le bilan reste consultable mais aucune nouvelle tentative n’est suggérée ; la page précise que les tentatives sont suspendues.

## Atelier personnel

L’accueil conseille la prochaine leçon non terminée du parcours actif et donne un accès indépendant aux cartes dues ou jamais introduites. La navigation sépare Aujourd’hui, Parcours, Révisions et Bibliothèque. Le catalogue propose 12 thèmes, 30 parcours et 150 leçons, avec recherche et prérequis informatifs. Le parcours actif et l’objectif personnel sont synchronisés par compte dans Firestore, puis retrouvés à la connexion, au rechargement ou à la reconnexion sur un autre appareil. Les anciens réglages locaux ne sont importés que si le compte n’a pas de préférence cloud. Une leçon terminée peut être relue sans changer progression ni échéances.

Le rendez-vous quotidien est un conseil, sans verrou. L’objectif réglable dans le profil compte les nouvelles leçons terminées aujourd’hui ; il peut être dépassé ou remplacé par une session de cartes. `/today` propose découvrir, consolider ou réviser. Aucun choix ne lance une autre leçon automatiquement.

Mémo peut suggérer une relecture après au moins deux oublis d’une même carte en révision, sur des jours distincts, depuis sa dernière réussite en révision. Les oublis lors de l’introduction ne comptent pas. La suggestion reste facultative et disparaît après une réussite. Ce seuil est une heuristique produit à ajuster, pas un diagnostic scientifique de maîtrise. Une carte jamais traitée appelle une consolidation, pas une répétition obligatoire de la leçon.

Le profil affiche les leçons terminées, cartes découvertes et cartes dues : ces compteurs ne prouvent pas la maîtrise. Quatre badges reconnaissent la première leçon, la première révision, les trois leçons Docker historiques et un parcours entier. Aucun point ni classement.

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

## Version actuelle

Tous les parcours sont disponibles, dont les cinq leçons Docker conservant les IDs historiques. Google et Internet sont obligatoires. Firestore synchronise les apprentissages à la connexion ou au rechargement ; le cache protège les sauvegardes interrompues. La consolidation reprend les cartes inédites de tous les parcours sans bloquer la découverte. Après une leçon sauvegardée, ses cartes encore inédites démarrent immédiatement. À la fin du lot, les autres nouvelles cartes et les révisions dues restent accessibles sur choix explicite. `/reviews` ne lance jamais une leçon ni de carte inédite. L’import sans compte est explicite ; une erreur de réseau bloque la session jusqu’à synchronisation réussie.

## Direction visuelle

L’atelier de Mémo : fond ivoire, traits encre, plaques lilas aux bords de l’écran et pile de connaissances. Le décor se compose à l’ouverture puis réagit aux étapes, sans animation permanente. Les bulles légèrement dépolies arrivent par un fondu court ; les avatars ponctuent les groupes de messages et les questions. Son de message facultatif, désactivé par défaut. Le rythme reste piloté par « Continuer » et la préférence de réduction des mouvements est respectée.

## Progression dans les parcours

`/today` conseille la première leçon non terminée du parcours actif, dans l’ordre. Plusieurs leçons peuvent être découvertes le même jour ; les cartes restent disponibles séparément. Le compteur du parcours se met à jour à la fin de la leçon. Les prérequis ne verrouillent pas la sélection.

Sources du contenu : [persistance](https://docs.docker.com/get-started/docker-concepts/running-containers/persisting-container-data/), [volumes](https://docs.docker.com/engine/storage/volumes/), [publication des ports](https://docs.docker.com/engine/network/port-publishing/) et [réseaux bridge](https://docs.docker.com/engine/network/drivers/bridge/).

Après un verdict IA « à retravailler » sur la version actuelle d’un défi, le détail propose les points de référence à reprendre, les leçons associées et une nouvelle tentative. Le retour IA reste le diagnostic personnalisé ; la liste des leçons provient du catalogue de confiance. Les relectures conservent un lien de retour au défi et proposent de refaire l’examen à leur fin. Aucun appel IA supplémentaire n’est nécessaire pour ces suggestions ; elles ne modifient pas les échéances des cartes ou le verdict enregistré.
