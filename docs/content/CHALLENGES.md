# Challenges de diagnostic Docker

Trois situations originales prolongent les leçons historiques. L’utilisateur écrit son raisonnement avant de consulter une correction structurée, ses repères et ses contre-exemples. Les commandes sont des exemples à lire : aucune exécution ni notation automatique. L’autoévaluation facultative (« À retravailler » / « Compris ») décrit le ressenti, pas une maîtrise certifiée.

## Programme et sources

Références officielles consultées le **6 octobre 2026**.

| Challenge, version 1 | Objectif et sources |
| --- | --- |
| `docker-images-diagnostic` | Distinguer reconstruire une image, redémarrer et recréer un conteneur. [Images](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/), [restart](https://docs.docker.com/reference/cli/docker/container/restart/), [persistance](https://docs.docker.com/engine/storage/volumes/). |
| `docker-volumes-diagnostic` | Diagnostiquer la perte de la couche inscriptible, monter et réutiliser un volume au bon chemin ; distinguer persistance, récupération et sauvegarde. [Volumes](https://docs.docker.com/engine/storage/volumes/), [stockage](https://docs.docker.com/engine/storage/). |
| `docker-ports-diagnostic` | Distinguer accès depuis l’hôte et depuis un conteneur du réseau partagé ; expliquer les ports et localhost. [Publication](https://docs.docker.com/engine/network/port-publishing/), [bridge créé par l’utilisateur](https://docs.docker.com/engine/network/drivers/bridge/). |

## Inspection initiale

Scénarios, corrections, trois repères et deux contre-exemples sont rédigés dans `src/data/challenges.ts`. Relecture indépendante effectuée le 6 octobre 2026 : conditions de montage explicites, protection des données avant suppression, distinction persistance/sauvegarde et accès réseau vérifiés avec les sources ci-dessus. Les commandes réseau ont été corrigées pour démarrer en arrière-plan ; l’URL hôte utilise explicitement IPv4. Le dernier scénario suppose une API liée à `0.0.0.0`, un réseau bridge commun et sa résolution des noms. Les tests contrôlent les références du programme et la confirmation des sauvegardes ; ils ne prouvent pas l’exactitude pédagogique.

## Historique personnel

`users/{uid}/challengeAttempts/{id}` contient `version: 1`, `challengeId`, `challengeVersion`, `answer` (1–4 000 caractères), `submittedAt` (horodatage serveur), `outcome` (`''`, `retry`, `understood`). La réponse et sa version restent immuables ; seule la première autoévaluation est ajoutée. Une nouvelle tentative crée un nouvel identifiant. Réessayer une sauvegarde conserve son identifiant et vérifie la réponse enregistrée après un accusé perdu. La correction apparaît après confirmation serveur. Les tentatives n’ajoutent aucune carte, ne modifient pas les leçons terminées et n’influencent pas la répétition espacée.
