# Challenges de diagnostic Docker

Trois situations originales prolongent les leçons historiques. L’utilisateur écrit son raisonnement avant de consulter une correction structurée, ses repères et ses contre-exemples. Les commandes restent des exemples à lire. La version 2 ajoute des fichiers et deux champs : « Ce que je constate » et « Ce que je ferais » (action, justification, vérification). Après confirmation serveur, une analyse Mistral facultative explique les points justes, omissions et erreurs sans modifier la progression. La correction reste accessible même si cette analyse échoue. L’autoévaluation facultative (« À retravailler » / « Compris ») décrit le ressenti, pas une maîtrise certifiée.

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

`shared/challengeEvaluationCases.json` propose quinze réponses courtes : pour chaque dossier v2, une réponse correcte, partielle, fausse, une alternative valable et une tentative d’instruction injectée dans la réponse. `expectedFindings` distingue les points justes, erreurs, omissions et critiques injustifiées à éviter. Ces attentes servent à une lecture qualitative des retours Mistral ; aucun score n’est calculé. Le cas d’injection doit conserver un retour pédagogique sans obéir à la réponse de l’élève. Les tests vérifient les versions, la couverture et les limites du formulaire, mais ne démontrent ni la qualité du modèle ni une inspection humaine. Aucun appel fournisseur n’est effectué par ces tests.
