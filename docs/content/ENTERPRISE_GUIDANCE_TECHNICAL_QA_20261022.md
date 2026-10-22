# Guidage Entreprise — qualification technique du contenu

Date : 22 octobre 2026. Comparaison du lot D au commit `1a8b673`. Revue technique indépendante de la rédaction ; elle ne remplace ni l’inspection pédagogique ni des observations auprès de collaborateurs.

## Périmètre vérifié

Le catalogue conserve 40 missions, 120 cartes, 11 mises en situation et sa version publique 2. Une comparaison JSON profonde, en retirant uniquement les réponses des cartes, confirme l’identité de tous les autres champs : identifiants, ordre, titres, objectifs, étapes, questions, propositions, bonnes options, prérequis, parcours, documents et sources.

Les cinq seules réponses de cartes modifiées sont :

- `ent-hostile-document-card-1` : une injection peut être visible ou cachée.
- `ent-iterate-examples-card-1` : une itération vise une amélioration à vérifier, sans succès garanti.
- `ent-assistants-documents-card-3` : appui vérifiable et contrôle de la fiabilité/version d’une pièce.
- `ent-automation-pilot-card-3` : calcul explicite du temps manuel moins le temps total avec automatisation.
- `ent-projects-prototype-card-1` : une version d’essai peut prendre la forme d’une maquette.

Les questions et identifiants sont conservés. Les formulations restent reliées aux compétences déjà enseignées ; cette conclusion éditoriale dépend aussi du verdict pédagogique. Les fichiers de planification des révisions, l’historique et les écritures de progression ne sont pas modifiés par ce lot.

## Consignes et correction

Quatre activités modifient leur tâche : `ent-iterate-examples`, `ent-numbers-sources`, `ent-assistants-meeting` et `ent-assistants-iterate`. Seul le scénario de `ent-numbers-sources` est également clarifié : les deux minutes sont un gain avant vérification, dont on retire le temps de relecture. Les nombres, exemples, amorces, critères et explications sont identiques ; aucune nouvelle réponse attendue n’est ajoutée. Les trois autres scénarios sont conservés.

Les clés de mises en situation et les grilles privées des activités restent strictement identiques à la référence. Le maintien de la version du catalogue et des évaluations finales est cohérent avec cette absence de modification de leurs questions et corrections. Le hash `practiceVersion`, calculé sur chaque activité complète, change automatiquement pour les quatre activités ; un ancien onglet doit recharger pour demander un retour IA avec les pièces courantes. Les reçus historiques ne sont pas réinterprétés.

Le build Functions a été relancé après le dernier ajustement de contenu. Les copies préparées du catalogue, des activités et des clés de correction correspondent exactement aux fichiers sources.

## Vérifications exécutées

- `npm run functions:build` : réussi, préparation du catalogue et syntaxe serveur.
- `npm run functions:test` : 90 tests réussis.
- `npm test` sur les données finales : 282 tests réussis, dont couverture du catalogue, des grilles, des versions, des files et du calendrier de révision.
- Comparaison JSON profonde décrite ci-dessus : réussie.
- `git diff --check` : réussi.

Les tests existants couvrent déjà les risques structurels concernés ; aucun test répétant mot pour mot les nouvelles formulations n’est ajouté. Le lot ne change ni autorisation, ni transaction, ni règle Firestore : l’émulateur n’a pas été relancé pour ces seules corrections textuelles. La qualification d’isolation du lot B reste distincte. Le build frontend et la recette navigateur sont consignés par le responsable de l’intégration.

Aucun appel fournisseur, compte réel, modification de facturation ou déploiement n’a été effectué pour cette qualification.
