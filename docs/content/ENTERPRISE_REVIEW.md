# Inspection pédagogique Entreprise

Version initiale rédigée le 15 octobre 2026, à partir du besoin produit et du workflow de production. Inspecteur indépendant : agent PO/QA de l'équipe, verdict consigné après relecture.

## Contrat du contenu

- 8 chapitres, 20 missions guidées puis 2 missions de pratique continue, dans cet ordre.
- Chaque mission : objectif observable, estimation de 10 minutes à confirmer en test apprenant, trois étapes d'explication avec cas concret, un atelier d'application sur papier ou document local, deux diagnostics avec feedback propre à chaque choix, trois cartes de récupération libre.
- 8 défis, chacun avec dossier fictif autonome et 5 questions à choix unique ; clés dans `shared/enterpriseAssessmentKeys.json`, jamais importées par le frontend.
- 66 cartes `ent-*` distinctes des cartes développeur. Le programme enseigne des pratiques ; terminer une leçon ou mener une série de révisions ne certifie pas une compétence professionnelle ou juridique.
- Tous les exemples de clients, politiques, résultats, temps et coûts sont fictifs. Aucune réponse d'un utilisateur réel n'a été utilisée.

## Relecture de rédaction

Les diagnostics comportent des contre-exemples explicites : ton professionnel sans preuve, action annoncée sans outil, anonymisation supposée après suppression d'un nom, abonnement payant assimilé à une autorisation, instruction hostile dans un document, ancienne politique opposée à la version applicable, RAG pris pour une garantie, gain brut confondu avec gain net, moyenne masquant une erreur critique.

Les termes techniques sont expliqués au premier emploi : contexte, RAG, injection de prompt, outil, agent, périmètre, escalade et régression. Les formulations privilégient les décisions de travail ; aucun exercice n'exige d'écrire ou d'exécuter du code. Le prompting couvre résultat, contexte, contraintes, format, critères, exemples et itération ; les agents couvrent permissions, approbations avant effet, limites d'exécution et conditions d'arrêt.

Les calculs ont été refaits : 200 × (2 − 1) = 200 minutes nettes ; coût mensuel fictif récurrent 30 + 20 + 100 = 150 €, distinct des 300 € d'intégration initiale. Un gain de temps n'efface pas le seuil de zéro promesse non autorisée dans le dossier final.

## Vérifications automatisées

`src/data/enterprise.test.ts` vérifie la couverture des chapitres, les quantités, l'ordre des missions continues, l'unicité et le préfixe des identifiants, la présence des diagnostics et feedbacks, les sources, les dossiers de défis, l'existence exacte de chaque clé et l'absence de clés dans le contenu public. Les résultats parfait, partiel à 80 % et entièrement incorrect sont contrôlés contre les clés privées.

Ces contrôles structurels ne remplacent pas l'inspection du sens ni un test avec des apprenants. Avant d'annoncer une durée garantie ou une efficacité pédagogique mesurée, mener des sessions réelles et noter les difficultés rencontrées.

## Inspection indépendante

L'agent PO/QA a relu l'intégralité des messages et les huit dossiers de défis. Il a revalidé les calculs (200 minutes nettes, 150 € récurrents), la cohérence des clés avec les pièces et les nuances sur RAG, contexte, outils et permissions. Il a demandé deux corrections : expliquer les résultats de défis après sauvegarde, et revoir l'estimation de durée uniforme.

Corrections de rédaction apportées : 40 explications privées, chacune rattachée à une question de défi et à un élément du dossier, transmises par le serveur uniquement après confirmation de la tentative ; ajout d'un atelier concret à chacune des 22 missions et estimation ramenée à 10 minutes. L'exposition des explications après sauvegarde est également vérifiée par l'agent backend et la revue produit. Les positions des bonnes réponses sont variées pour ne pas encourager une stratégie consistant à toujours choisir la même place.

Verdict de relecture : contenu cohérent pour une première livraison guidée après intégration des explications et vérification technique. Les durées et l'efficacité restent à valider avec de vrais apprenants ; aucune certification ni résultat d'efficacité mesuré n'est revendiqué.
