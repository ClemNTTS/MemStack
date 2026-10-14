# Défis de diagnostic

## Format actuel v4 : correction vérifiable par le code

Les **36 défis** utilisent chacun cinq questions à choix unique, soit **180 questions**. Elles portent sur le diagnostic, l’intervention et sa vérification ou sa limite, avec des distracteurs propres aux pièces du dossier. Les IDs de défis, les sources et les snapshots v1/v2 sont conservés ; les nouveaux exercices portent `challengeVersion: 4` et `rubricVersion: 3`.

Les questions et options publiques sont dans `shared/challengeQuestions.json`. Les identifiants acceptés et les explications sont dans `shared/challengeAnswerKeys.json`, chargé uniquement par Functions ; ce fichier n’est jamais importé par le frontend. Un choix unique peut accepter plusieurs options individuellement défendables si la grille le prévoit. Rien n’est exécuté : les commandes et extraits sont lus comme des données.

Le callable `submitDeterministicChallenge` exige Google et App Check, charge la grille de confiance, vérifie les prérequis puis corrige les sélections. Le verdict, les booléens et les explications sont écrits atomiquement avec la tentative ; le client attend une relecture serveur avant de révéler le résultat. Strictement plus de 70 % est requis : avec cinq questions, il faut quatre réponses correctes. Aucun bouton d’auto-validation, aucune analyse IA ni invitation IA ne décide de ce résultat. Le budget de 20 tentatives par heure, la déduplication et le marqueur de suppression restent appliqués.

Les tentatives v3 et leurs résultats sont entièrement immuables et réservés à l’écriture serveur. Le propriétaire peut relire ses tentatives sans droit IA ; un autre compte ne peut ni lire ni écrire ces résultats. Une nouvelle réponse crée une nouvelle tentative. Les anciennes réponses, corrections et analyses restent historiques et ne valident pas le nouveau format. Les cartes, échéances et leçons terminées restent indépendantes.

La révision v4 du 14 octobre ajoute deux objectifs distincts par scénario et reformule les 540 choix en langage naturel. Les snapshots v3 restent dans les fichiers `.v3.json` ; leurs anciennes tentatives sont relues avec leurs trois questions originales. Le serveur accepte v3 et v4 pour préserver les anciens onglets. Voir [registre éditorial v4](CHALLENGES_V4_EDITORIAL_REVIEW.md), [étudiant fort v4](CHALLENGES_V4_STRONG_REVIEW.md), [étudiant faible v4](CHALLENGES_V4_WEAK_REVIEW.md) et [migration v4](CHALLENGES_V4_IMPLEMENTATION_REVIEW.md).

La qualification précédente v3 est conservée ci-dessous. Les quatre rôles ont relu tous les dossiers. Les fixtures fortes et faibles couvrent les 36 défis ; la revue indépendante teste aussi les 972 combinaisons possibles. Voir [rédaction et sources](CHALLENGES_DETERMINISTIC_REVIEW.md), [étudiant fort](CHALLENGES_STRONG_STUDENT_REVIEW.md), [étudiant faible](CHALLENGES_WEAK_STUDENT_REVIEW.md) et [vérification](CHALLENGES_IMPLEMENTATION_REVIEW.md). Les corrections statiques historiques restent inspectables dans le bundle : ce dispositif valide des réponses, sans prétendre empêcher la recherche des solutions ni certifier une maîtrise.

La publication exige de déployer le nouveau callable et les règles avant le frontend. Le build et les tests locaux ne déploient rien. Les sections ci-dessous décrivent l’historique v1/v2 ; leur ancienne autoévaluation et leur verdict IA ne sont plus le format actif.

Trente-six situations originales couvrent les douze thématiques du programme ; les trois diagnostics Docker initiaux prolongent les leçons historiques. L’utilisateur écrit son raisonnement avant de consulter une correction structurée, ses repères et ses contre-exemples. Les commandes restent des exemples à lire. La version 2 ajoute des fichiers et deux champs : « Ce que je constate » et « Ce que je ferais » (action, justification, vérification). Après confirmation serveur, une analyse Mistral facultative explique les points justes, omissions et erreurs sans modifier la progression. La correction reste accessible même si cette analyse échoue. L’autoévaluation facultative (« À retravailler » / « Compris ») décrit le ressenti, pas une maîtrise certifiée.

## Programme et sources

Références officielles consultées le **6 octobre 2026**.

| Challenge, version 1 | Objectif et sources |
| --- | --- |
| `docker-images-diagnostic` | Distinguer reconstruire une image, redémarrer et recréer un conteneur. [Images](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/), [restart](https://docs.docker.com/reference/cli/docker/container/restart/), [persistance](https://docs.docker.com/engine/storage/volumes/). |
| `docker-volumes-diagnostic` | Diagnostiquer la perte de la couche inscriptible, monter et réutiliser un volume au bon chemin ; distinguer persistance, récupération et sauvegarde. [Volumes](https://docs.docker.com/engine/storage/volumes/), [stockage](https://docs.docker.com/engine/storage/). |
| `docker-ports-diagnostic` | Distinguer accès depuis l’hôte et depuis un conteneur du réseau partagé ; expliquer les ports et localhost. [Publication](https://docs.docker.com/engine/network/port-publishing/), [bridge créé par l’utilisateur](https://docs.docker.com/engine/network/drivers/bridge/). |

## Inspection initiale

Scénarios, corrections, trois repères et deux contre-exemples sont conservés dans `shared/challengeDossiers.json`, partagé avec le serveur et importé par `src/data/challenges.ts`. Relecture indépendante effectuée le 6 octobre 2026 : conditions de montage explicites, protection des données avant suppression, distinction persistance/sauvegarde et accès réseau vérifiés avec les sources ci-dessus. Les commandes réseau ont été corrigées pour démarrer en arrière-plan ; l’URL hôte utilise explicitement IPv4. Le dernier scénario suppose une API liée à `0.0.0.0`, un réseau bridge commun et sa résolution des noms. Les tests contrôlent les références du programme et la confirmation des sauvegardes ; ils ne prouvent pas l’exactitude pédagogique.

## Historique personnel

`users/{uid}/challengeAttempts/{id}` contient `version: 1`, `challengeId`, `challengeVersion`, `answer` (1–4 000 caractères), `submittedAt` (horodatage serveur), `outcome` (`''`, `retry`, `understood`). La réponse et sa version restent immuables ; seule la première autoévaluation est ajoutée. Une nouvelle tentative crée un nouvel identifiant. Réessayer une sauvegarde conserve son identifiant et vérifie la réponse enregistrée après un accusé perdu. La correction apparaît après confirmation serveur. Les tentatives n’ajoutent aucune carte, ne modifient pas les leçons terminées et n’influencent pas la répétition espacée.


## Dossiers version 2 et inspection

Les trois IDs historiques sont conservés. La version 2 ajoute des fichiers de déploiement, d’état ou de configuration à lire, une `rubricVersion: 1` et des alternatives acceptables. Les snapshots version 1 restent dans le dossier partagé afin de montrer la correction correspondant à chaque tentative historique. Inspection du 7 octobre 2026 : les pièces explicites reprennent les hypothèses de la version 1 et n’ajoutent aucun mécanisme d’exécution ; tests de cohérence catalogue, limites et conservation des corrections ajoutés. Une relecture humaine reste nécessaire avant diffusion.

## Tentatives et analyse version 2

Une nouvelle tentative contient `version: 2`, `challengeVersion: 2`, les champs immuables `observations` et `actions` (1–2 000 caractères chacun après trim), et `answer` égal à leur concaténation avec deux sauts de ligne (maximum 4 000 caractères). Le horodatage serveur et l’autoévaluation conservent leurs règles. Une sauvegarde avec accusé perdu réutilise son identifiant. Les tentatives version 1 restent relisibles, sans analyse automatique.

Le client lit `users/{uid}/challengeAnalyses/{attemptId}` depuis le serveur et appelle `analyzeChallengeAttempt` dans `europe-west9` avec seulement `{ attemptId }`. Le client ne peut écrire aucun retour. Le serveur charge le dossier et la réponse enregistrée. La réponse publique contient `status`, `message` (visible seulement pour `completed`), `challengeVersion`, `rubricVersion`, `model`, `promptVersion`. Les statuts `processing`, `failed` et `needs_review` ne révèlent pas de texte généré incomplet. Un rechargement retrouve le retour enregistré ; une nouvelle tentative conserve un nouvel historique. Un changement de compte invalide les réponses des appels en cours.

L’interface annonce la transmission à Mistral avant envoi. `VITE_CHALLENGE_AI_ENABLED=true` active l’appel réel ; sans cette option, elle affiche explicitement que l’IA est désactivée et propose la correction statique. Aucun faux retour n’est utilisé en production. `VITE_FIREBASE_EMULATORS=true` connecte les émulateurs seulement sur localhost, pour la vérification locale.

## Jeu d’évaluation pédagogique

`shared/challengeEvaluationCases.json` propose 180 réponses courtes : pour chacun des 36 dossiers v2, une réponse correcte, partielle, fausse, une alternative valable et une tentative d’instruction injectée dans la réponse. `expectedFindings` distingue les points justes, erreurs, omissions et critiques injustifiées à éviter. Ces attentes servent à une lecture qualitative des retours Mistral ; aucun score n’est calculé. Le cas d’injection doit conserver un retour pédagogique sans obéir à la réponse de l’élève. Les tests vérifient les versions, la couverture et les limites du formulaire, mais ne démontrent ni la qualité du modèle ni une inspection humaine. Aucun appel fournisseur n’est effectué par ces tests.

## Extension du 8 octobre 2026

Le catalogue compte 36 défis actifs, avec trois dossiers pour chacune des douze thématiques du programme. Une thématique peut regrouper plusieurs parcours : trois défis DevOps ne signifient pas trois défis pour chaque parcours DevOps. Les trois dossiers Docker couvrent déjà cette thématique ; les 33 nouveaux scénarios complètent les onze autres. Ils sont originaux, avec des pièces fictives conçues pour isoler un mécanisme de diagnostic, une intervention et sa vérification. Les exemples de code sont des extraits illustratifs, pas des projets à exécuter.

Les nouveaux IDs commencent directement en `version: 2`, avec `rubricVersion: 1`, et sont rattachés à des leçons existantes. Les six snapshots Docker v1/v2 restent identiques, notamment leurs corrections et hypothèses. Une réponse historique doit toujours retrouver le dossier correspondant à sa version.

La rédaction a consulté les documentations primaires référencées dans chaque nouveau dossier le 8 octobre 2026 : MDN, React, TypeScript, Node.js, PostgreSQL, Firebase, OWASP, Git, web.dev et les textes de Martin Fowler dont il est l’auteur. Le registre [CHALLENGES_REVIEW_2026-10-08.md](CHALLENGES_REVIEW_2026-10-08.md) liste tous les dossiers et leurs objectifs. Les pièces indiquent explicitement les exclusions qui changeraient le diagnostic : concurrence, appels externes, politique d’accès, état local, contrat d’expiration ou rendu HTML.

Les alternatives ne sont pas des obligations supplémentaires : la solution principale suffit lorsqu’elle respecte le contrat et prévoit une vérification. Les nouveaux cas d’évaluation font distinguer une omission réelle d’une demande injustifiée de commande exacte. Aucun nouvel appel Mistral n’a été effectué pour ces dossiers ; les 180 cas forment un jeu d’évaluation préparé, pas une preuve que le modèle les a réussis. Une revue indépendante des nouveaux contenus complète la rédaction et doit consigner son verdict dans le registre avant une diffusion élargie.
