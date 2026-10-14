# Revue indépendante de la migration des défis v4

Date : 2026-10-14. Portée : modifications courantes du questionnaire et du correcteur, hors AGENTS.md appartenant au propriétaire. Aucun code modifié par cette revue.

## Résultat

Aucun défaut bloquant identifié dans la migration examinée. Les réponses de référence restent dans les fichiers serveur ; les questionnaires publics ne contiennent aucun champ de correction. Cette revue ne prétend pas vérifier le parcours connecté en production ni remplacer la revue pédagogique indépendante.

## Contrôles effectués

- 36 défis, chacun exactement 5 questions et 3 choix par question : 180 questions et 540 propositions.
- Versions actives 4 et grille 3 ; schéma des tentatives structurées toujours version 3. Cette séparation est correctement conservée dans le serveur, l’adaptateur Firebase, le décodeur et l’historique.
- Les trois identifiants de questions historiques sont conservés dans les 36 questionnaires.
- Énumération des 8 748 combinaisons possibles (36 × 3^5) : la correction accepte exactement les réponses avec au moins 4 choix corrects sur 5 et refuse celles avec 3 ou moins. Les indices de notions ne changent pas la pondération.
- Les quatre archives v3 (questionnaires, clés, étudiant fort et étudiant faible) sont sémantiquement identiques aux JSON du commit livré deb2ac4.
- Les 36 questionnaires v3 sont encore reconnus par validateCheckedSubmission dans le catalogue combiné v4/v3. La clé est sélectionnée par identifiant ET version, et une tentative existante ne peut pas être réutilisée avec une autre version ou d’autres réponses.
- Le décodeur reconstruit la version exacte du questionnaire puis vérifie la longueur, le score, le seuil, la grille et les notions manquées ; une réussite v3 ne devient pas artificiellement une réussite v4.
- La vue de tentative affiche les questions, options et corrections de la version d’origine. Les brouillons sont séparés par compte et version.
- npm run build : succès. Recherche dans dist sans résultat pour correctOptionIds, challengeAnswerKeys, challengeStrongStudentCases et challengeWeakStudentCases.
- Tests ciblés au moment de la revue : 8 succès sur 9. L’unique échec venait des fixtures étudiant encore v3 et ne disposant que de 3 réponses ; leur révision est en cours par un autre agent. Les tests de seuil cinq questions et de transaction/idempotence passent.

## Compléments de validation avant publication

Rerun des tests complets après réception des fixtures v4, test de décodage des archives v3, test de transaction v4 dans l’émulateur et brève vérification du formulaire de cinq questions. Déployer le serveur compatible v3/v4 avant de publier le frontend v4 pour préserver les onglets ayant encore l’ancien bundle.

## Limites

L’absence de clés privées dans le bundle n’est pas une promesse anti-triche : les anciens dossiers comprennent déjà une correction pédagogique statique. Aucun appel Mistral ni écriture de réponse de vrai étudiant n’a été effectué pendant cette revue.
