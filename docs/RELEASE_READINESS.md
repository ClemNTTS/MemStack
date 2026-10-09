# Fiabilité de la bêta et préparation d’une ouverture

## Qualification IA

`npm run ai:qualification` affiche onze réponses synthétiques référencées à deux dossiers versionnés : réponses correctes, partielles, fausses, alternatives, paraphrases et injections. Aucun appel réseau, aucune réponse réelle et aucune validation de tentative ne sont réalisés. Le passage des tests vérifie le corpus et son évaluateur, pas la fiabilité du modèle.

Après autorisation d’un budget d’évaluation, évaluer ces réponses avec le modèle et le prompt réellement déployés. Conserver en privé modèle, prompt, versions des dossiers, date, sortie observée et commentaire de revue. Les attentes sont des références éditoriales à examiner, pas une vérité statistique. La revue humaine concerne la qualification du service ; elle ne valide jamais les examens des membres.

Un fichier de résultats contient un tableau de `{ "id": "expiry-correct", "verdict": "validated", "missedCheckpointIndices": [] }`. `npm run ai:qualification -- chemin/resultats.json` compare les verdicts et points manqués, signale les cas absents, faux positifs, faux négatifs et divergences. Tout résultat absent ou divergent donne un code d’échec. Ne jamais présenter des résultats fabriqués comme des observations Mistral. Relire également les messages pour détecter conseils dangereux, attribution de la correction à l’élève et omissions inventées : la comparaison structurée ne les détecte pas.

Ce petit corpus est une première barrière de régression, pas une mesure de généralisation. Étendre aux autres thématiques et réponses ambiguës avant ouverture. Aucun appel facturé n’est intégré à la CI.

## Vérification et publication

Le workflow `Verify MemStack` exécute sur les PR et main : installation des trois lockfiles, build Functions, tests hors réseau du fournisseur, build frontend, règles Firestore, concurrence des quotas et suppression sur émulateur avec projet `demo-`. Il utilise une CLI versionnée et aucun secret de production. Configurer ce job comme vérification obligatoire dans les protections de branche ; le fichier seul ne modifie pas les paramètres GitHub.

Avant publication : noter SHA connu bon, versions frontend/règles/Functions, modèle/prompt et paramètres non secrets ; vérifier compatibilité avec les données historiques. Les règles et le serveur précèdent un frontend qui dépend de leur nouveau contrat. Faire la recette avec le compte dédié : accès refusé et autorisé, quotas, sauvegarde/réchargement, changement de compte, Google, réseau interrompu, parcours leçon/cartes, signalement, clavier et mobile. Conserver les limites et résultats dans `PRODUCTION_RECIPE.md`.

## Incident et retour arrière

1. En cas de verdicts suspects ou dépenses anormales, arrêter les nouveaux appels via le paramètre serveur `CHALLENGE_AI_ENABLED=false` et redéployer les fonctions autorisées. Ne pas désactiver Auth ou App Check. Le commutateur frontend seul ne bloque pas les appels directs.
2. Revenir au SHA connu bon du frontend via le workflow Pages. Pour les Functions/règles, reconstruire et déployer la version connue bonne compatible avec les écritures déjà créées ; faire une revue des règles avant ce retour. Un retour du code ne supprime ni tentatives ni analyses existantes.
3. Vérifier accès autorisé/refusé, lecture des historiques et arrêt effectif des nouveaux appels. Ne jamais réanalyser automatiquement un appel incertain ni réinitialiser les quotas. Documenter heure, versions, impact et résultat.

Cette procédure est documentée, pas encore une preuve de répétition complète du retour arrière. Surveiller séparément coûts Firestore, Functions et fournisseur, erreurs/durée des exports et analyses, refus de quota. Les alertes de facture ne constituent pas un plafond absolu.

Les nouvelles protections limitent par compte les créations à 20 tentatives et 10 signalements par fenêtre d’une heure, via budgets Firestore atomiques contrôlés par les règles. Un export réserve côté serveur un délai de 15 minutes avant le suivant, y compris si l’opération échoue. Ces protections réduisent les rafales ; elles ne plafonnent pas toute la consommation Firestore, notamment les lectures et les écritures de progression. Leur efficacité en production dépend du déploiement des règles et Functions correspondantes.

## Recettes sensibles et données

La suppression production complète reste à tester sur une identité Google jetable distincte des administrateurs réutilisables : export préalable si nécessaire, reconnexion récente, confirmation exacte, suppression, refus des écritures tardives et préservation d’un autre compte. Ne pas annoncer cette recette réussie tant qu’elle n’est pas réalisée. La publication d’une correction éditoriale réelle reste à vérifier avec une proposition revue et fusionnée, sans fabriquer de défaut.

État actuel : réponses et analyses sont conservées dans Firestore jusqu’à suppression du compte, sans expiration automatique. Les brouillons restent dans le navigateur, par compte et version ; ils ne sont pas chiffrés pour un appareil partagé. Le fournisseur reçoit le dossier et la réponse, sans identité ni historique, mais sa durée de conservation contractuelle reste à vérifier. La suppression conserve un marqueur minimal lié à l’UID pour interdire les écritures tardives, des compteurs globaux et des journaux dont les identifiants de compte sont retirés. Ce n’est pas une garantie d’anonymisation intégrale.

Avant ouverture publique, le responsable doit arrêter puis publier des durées et finalités de conservation pour ces traces et le traitement fournisseur, ainsi qu’un contact pour l’export exceptionnel. Ne pas inventer un délai contractuel ni ajouter une purge qui supprimerait le garde contre les écritures tardives.

## Validation produit

Observer une cohorte invitée ciblée sur le cycle complet, puis son retour différé : temps jusqu’au premier défi, compréhension du feedback, reprises utiles, difficultés de connexion et motifs d’abandon. Les tests techniques et la progression artificielle du compte de recette ne prouvent ni apprentissage ni fidélisation. Les durées de rétention, la politique de prix et les résultats utilisateur restent des décisions à prendre sur preuves.
