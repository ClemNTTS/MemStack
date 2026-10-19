# Ateliers Entreprise : revue du backend IA — 19 octobre 2026

## Périmètre

Revue du nouveau service `assessEnterprisePractice`, de son adaptateur Mistral et de ses transactions. Il est indépendant de la correction déterministe des défis et du service historique expérimental `analyzeChallengeAttempt`. Aucun changement de progression, de classement, de facturation ou de seuil d’évaluation finale n’est introduit par ce module.

Le navigateur transmet seulement l’organisation, la leçon, le texte proposé et la version de l’atelier. Le cas et la tâche viennent du catalogue serveur. Une grille privée contient les critères essentiels et facultatifs ; seuls les essentiels doivent déterminer le retour `good`, `almost` ou `retry`. Les formulations équivalentes et les réponses courtes sont admises. Les critères ne sont pas des mots à réciter. Une faute de langue ou un conseil facultatif ne justifie pas un refus.

La candidate `enterprise-practice-v2` précise que les instructions parasites sont ignorées sans pénaliser la partie correcte de l’exercice, qu’une implication claire n’appelle pas une répétition formelle et que chaque partie essentielle demandée doit être appréciée séparément. Un brouillon final correct ne prouve pas à lui seul un diagnostic demandé mais absent. Un format facultatif ne doit jamais réduire le statut. Les acquis annoncés doivent être confrontés aux faits du cas, notamment aux bornes incluses ou exclues, unités, dates et montants ; une contradiction ne peut pas être félicitée ou traitée comme une simple imprécision. Le ton emploie « assistant IA », évite les formulations culpabilisantes et distingue constat pédagogique et jugement sur la personne. Ces consignes sont génériques ; aucune reconnaissance de réponse particulière ni valeur d’exercice n’est ajoutée. La qualification fournisseur distingue cette candidate de la première version archivée. Ces candidates ont ensuite été remplacées par la candidate v3 ; leurs observations restent conservées séparément.

## Candidate finale v9 : aucun commentaire libre exposé

La candidate `enterprise-practice-v9` retourne toujours `strengths: []`. Les commentaires du fournisseur, quel que soit l’état du critère, sont uniquement validés pendant le traitement interne : ils ne sont jamais repris dans le résultat public ou la persistance de cette candidate. Le feedback utilisateur contient seulement le statut calculé, un message encourageant déterministe et, si nécessaire, l’aide éditoriale de confiance du critère sélectionné.

La vérification des chemins de production confirme que le callable passe exclusivement par `callPracticeMistral` et `practiceFeedbackFromCriteria`. La transaction conserve uniquement ce feedback assemblé et les métadonnées du reçu ; les tableaux, preuves et commentaires internes ne sont pas écrits. Le frontend peut afficher une liste de forces pour compatibilité du contrat, mais v9 lui transmet une liste vide. Le hash de déduplication comprend la version de prompt v9 : les anciens reçus d’une autre candidate ne sont pas rejoués comme réponses v9. L’export des comptes reprend les reçus enregistrés, sans chemin indépendant vers les commentaires internes.

Cette décision suit un retour Q&A sur une félicitation v8 factuellement fausse malgré un statut correct. Elle réduit l’exposition de texte probabiliste sans rendre déterministes les états évalués par le fournisseur. La qualification réelle v9 est encore en cours au moment de cette relecture ; les observations des versions précédentes ne lui sont pas attribuées.

## Revue de la candidate précédente v8 : aides de confiance

La candidate `enterprise-practice-v8` exige une propriété privée `hints` : exactement une aide non vide par critère essentiel, de 280 caractères maximum. Les entrées absentes, supplémentaires, vides ou trop longues rendent la grille indisponible avant réservation. Le hash de grille inclut ces aides et leur version ; une ancienne correction n’est donc pas réutilisée après leur évolution.

La prochaine action affichée vient uniquement de l’aide statique correspondant au critère retenu côté serveur, avec priorité à la première contradiction, puis au premier élément manquant. Les commentaires libres des états `missing` et `contradicted` ne sont pas affichés. Le message global reste déterministe, et les deux forces éventuelles viennent des commentaires des seuls critères `met`. Les aides privées ne sont pas envoyées au fournisseur ; le frontend reçoit uniquement le feedback public. Leur pertinence dépend de la revue éditoriale de la grille, et la justesse des états ainsi que des forces reste à qualifier réellement.

La relecture du service, du callable, de l’adaptateur frontend, de la persistance et des tests d’intégration ne trouve pas de nouveau défaut de code bloquant dans cette candidate. Elle confirme les contrôles d’accès avant cache et avant persistance, le rejet des références étrangères ou dupliquées, la priorité des aides, l’absence de texte ou preuve persistés et le contrat public inchangé. Les tests unitaires relancés sur v8 passent (**12/12**). Cette relecture n’effectue aucun appel fournisseur, aucune modification de code ni aucun déploiement ; elle n’établit donc pas une nouvelle qualification fournisseur.

## Candidate v7 : compatibilité du schéma fournisseur

La candidate v6 a reçu des HTTP 400 et ne peut pas être présentée comme qualifiée. Le coordinateur retire le mot-clé `uniqueItems` du schéma envoyé au fournisseur dans `enterprise-practice-v7`. Le contrôle des doublons reste obligatoire côté serveur, ainsi que les bornes, le nombre exact de critères et les références autorisées. Un test vérifie explicitement l’absence de `uniqueItems` dans le schéma, tandis que les tests de références refusent toujours les doublons.

Les rapports locaux distincts conservent **26/28** statuts attendus avec la grille 2, puis **28/28** avec la grille 3 clarifiée, pour v7 et le modèle daté configuré par le coordinateur. Ces chiffres sont ceux des fichiers de qualification existants, pas de nouveaux appels réalisés pendant cette relecture. Ils ne qualifient pas v8, une nouvelle grille, les 40 ateliers ou une stabilité universelle.

## Candidate précédente v6 : références de segments authentiques

La candidate `enterprise-practice-v6` remplace la génération libre de citations par des références. Le serveur découpe la seule réponse apprenante, limitée à 5 000 caractères, en au plus 64 segments numérotés `e1`, `e2`, etc. Chaque segment est un extrait contigu de 160 caractères UTF-16 maximum ; une limite de mot est privilégiée dans la seconde moitié du segment et une paire de substitution Unicode n’est jamais coupée. Les blancs aux extrémités sont retirés sans supprimer de contenu non blanc.

Le fournisseur reçoit `learnerAnswerSegments` et produit `{criteria:[{evidenceIds,state,comment}]}`. L’ordre du schéma demande les références avant le classement. Chaque entrée peut référencer au plus trois segments, sans doublon ; le schéma énumère les seuls identifiants existants. Le serveur applique indépendamment la même validation et reconstruit la preuve depuis ces extraits de la réponse. Aucun texte fourni par le modèle ne peut servir de citation. Un identifiant inconnu, étranger, injecté, dupliqué ou en trop rend le résultat indisponible ; `met` et `contradicted` exigent au moins une référence.

Les règles de statut et de commentaire de la candidate précédente sont conservées. La réponse partielle peut référencer des segments tout en restant `missing` ; si tous les objectifs sont manquants et qu’aucun segment pertinent n’est référencé, le retour est `retry`. Le contrat public est inchangé et aucun segment, identifiant de preuve ou état individuel n’est persisté. Les contrôles d’accès et plafonds sont inchangés ; le budget conservateur inclut le payload segmenté réellement envoyé.

Cette architecture préserve l’authenticité de la preuve sans dépendre de la capacité du fournisseur à recopier une citation à l’identique. Elle ne garantit pas qu’un segment référencé soit pertinent ni que l’état soit correct. La candidate est figée pour une nouvelle qualification réelle, sans activation ou déploiement effectué par cette revue.

## Candidate précédente v5 : conseils fondés sur le cas et le critère

La candidate `enterprise-practice-v5` ajoute une consigne générique pour le commentaire : le conseil doit venir uniquement des faits du cas et du critère évalué, sans détail, critère supplémentaire ou date de remplacement inventés. Une information absente doit être confirmée plutôt que remplacée par une valeur improvisée. Les règles de citation exacte, le schéma, l’authentification et les quotas restent inchangés. La qualité fournisseur demeure à qualifier.

Un diagnostic synthétique unique sur le cas de maintenance, avec `mistral-medium-2604`, obtient HTTP 200 et une fin normale, trois entrées sur trois et des clés, états et longueurs de commentaires valides. La citation de la première entrée `met` (161 caractères) n’est pas un extrait normalisé de la réponse ; les citations des deux autres entrées (122 et 498 caractères) correspondent. La validation refuse donc le résultat avec `invalid-practice-criteria`. Ce diagnostic n’affiche ni ne conserve le texte brut ou les traces de raisonnement. Il identifie une indisponibilité due à une preuve non authentique, sans assouplir la règle pour la contourner.

## Candidate précédente v4 : preuve citée avant l’état du critère

Le contrat interne devient `{criteria:[{evidence,state,comment}]}`. L’ordre du schéma demande d’abord une citation de la réponse apprenante liée au critère, puis l’état après comparaison aux faits du cas. `contradicted` est réservé à une affirmation explicitement opposée à un fait ou une limite essentielle ; une absence, une imprécision ou un besoin de clarification ne constituent pas une contradiction. La consigne distingue également la personne apprenante du logiciel désigné comme « assistant IA ».

Le serveur vérifie que chaque preuve non vide (500 caractères maximum) est un extrait de la réponse. Seules les variantes de blancs, d’apostrophes et de composition Unicode sont normalisées ; une reformulation libre ou une citation inventée est refusée. `met` et `contradicted` exigent une preuve non vide. `missing` peut contenir une preuve partielle, ou aucune preuve.

Le statut reste calculé par le serveur : tous les critères `met` donnent `good` ; une contradiction donne `retry` ; des critères manquants donnent `almost` lorsqu’au moins une preuve réelle montre un début d’exercice, et `retry` en l’absence de toute preuve. Les citations et états restent internes au traitement ; le feedback public et la persistance ne contiennent pas ce tableau.

La présence d’une citation exacte ne prouve pas sa pertinence ni la justesse du classement : la qualification fournisseur doit vérifier ces deux aspects. Les observations des candidates précédentes restent conservées sans être attribuées à v4.

## Candidate précédente v3 : états par critère, décision calculée par le serveur

Le fournisseur retourne seulement `{criteria:[{state,comment}]}`, exactement une entrée par critère essentiel et dans l’ordre de la grille. Le schéma et la validation serveur refusent un nombre d’entrées différent, une propriété supplémentaire, un état autre que `met`, `missing` ou `contradicted`, ou un commentaire vide ou dépassant 200 caractères. Les critères facultatifs ne sont plus envoyés au fournisseur. Le cas et la tâche servent de contexte, sans devenir une liste d’exigences supplémentaires.

Le serveur construit le feedback public : `good` si tous les essentiels sont `met`, `retry` dès qu’un essentiel est `contradicted` ou si tous sont `missing`, `almost` dans les autres cas incomplets. Le message global est une phrase encourageante déterministe. Les forces viennent uniquement des commentaires `met` (deux maximum) et la prochaine action vient du premier commentaire `contradicted`, sinon du premier `missing`. Le fournisseur ne peut plus inventer de statut ou de reproche global sur un format facultatif. Le frontend reçoit toujours le contrat public initial ; aucune grille ni tableau privé n’est exposé.

Ce calcul limite les incohérences d’assemblage, mais ne prouve pas la justesse sémantique d’un état ou d’un commentaire proposé par le fournisseur. La nouvelle candidate `enterprise-practice-v3` doit donc être qualifiée à son tour, sans réutiliser les résultats des candidates précédentes.

### Compatibilité de transport pour le nouveau modèle daté

Pour qualifier le modèle daté `mistral-medium-2604`, le transport réserve jusqu’à 4 096 tokens de sortie ; les autres modèles datés conservent 1 200. Le paramètre `reasoning_effort` est volontairement absent : lors du diagnostic fournisseur réel du coordinateur, sa valeur `high` provoque HTTP 400, tandis que la même requête sans ce paramètre réussit. Aucun raisonnement explicite n’est donc activé ni présenté comme déployé. Le budget conservateur reste fixé à 32 000 tokens par appel, avec 2 048 de marge pour schéma et cadrage. Le contrôle s’applique avant la réservation et directement dans l’adaptateur fournisseur.

La compatibilité de lecture conserve le format décrit dans la [documentation officielle Mistral sur le raisonnement](https://docs.mistral.ai/studio/conversations/reasoning), consultée le 19 octobre 2026, décrit une réponse sous forme de chunks `thinking` puis `text`. L’adaptateur ne parse que les chunks `text` du résultat final ; les traces de raisonnement ne sont ni retournées, ni journalisées, ni persistées. Il refuse les réponses tronquées, sans texte final ou contenant des chunks inattendus. Le payload brut est borné à 80 000 caractères pour ce modèle et le JSON final à 20 000. Les autres modèles gardent le contrat chaîne existant et une borne brute de 20 000. Un diagnostic HTTP ne contient que le code numérique, jamais le corps ou les en-têtes.

La version du prompt reste v3 : ces adaptations de transport ne modifient ni les faits du cas, ni les critères, ni le message système. Le modèle choisi fait déjà partie du hash de déduplication. Aucune amélioration de qualité n’est présumée avant la nouvelle qualification réelle.

## Protections implémentées

- Identité tirée du jeton Firebase et relue auprès d’Auth ; compte actif, adresse vérifiée et absence de marqueur de suppression exigés. L’organisation doit être active, accessible et contenir une adhésion active. Ces contrôles s’appliquent aussi aux résultats en cache.
- Prérequis de la branche vérifiés depuis les complétions serveur ; date invalide ou future refusée. Aucun compte personnel ou autre organisation ne sert à débloquer l’atelier.
- Payload exact, réponse non vide de 5 000 caractères maximum, ID d’organisation strict et atelier réellement présent dans le catalogue. La version client de l’atelier doit correspondre au hash serveur. Les grilles absentes ou invalides échouent avant réservation.
- Modèle serveur obligatoirement daté (`…-2512`, par exemple). Ni alias `latest`, ni alias sans date, ni clé vide ne sont acceptés. Le navigateur ne choisit pas le fournisseur ou le modèle.
- Réservation atomique avant appel : 30 nouvelles vérifications par membre et organisation par jour de Paris, 500 globales et 6 000 000 tokens réservés globalement. Une requête réserve 32 000 tokens ; le contenu UTF-8 complet du prompt, les 1 200 ou 4 096 tokens de sortie selon le modèle et une marge de 2 048 pour le schéma et le cadrage des messages restent sous cette enveloppe conservatrice. Les valeurs de configuration et compteurs invalides échouent sans appel.
- Déduplication organisation/membre/leçon/atelier/grille/prompt/modèle/réponse normalisée. Une requête simultanée identique reçoit un état en cours ; un résultat terminé est réutilisé sans nouvelle consommation.
- Appel fournisseur unique, sans outil et sans exécution, température zéro, JSON Schema strict, sortie plafonnée et échéance de 35 secondes. Erreur HTTP, sortie tronquée, JSON invalide, format inattendu ou retour trop long rendent la correction indisponible. Aucun faux succès de repli ni relance fournisseur automatique.
- Lease de 90 secondes. Le dernier contrôle relit compte, cycle de suppression, organisation, membre et lease avant persistance. Un résultat expiré, remplacé ou révoqué n’est pas annoncé comme enregistré. L’échec consomme sa réservation et impose une minute après son traitement avant un nouvel essai explicite.
- Les réservations et feedbacks sont serveur seulement, sous la progression propre à l’organisation ; les limites globales sont privées. Le module ne stocke pas le texte envoyé, seulement son hash de déduplication et le feedback. Aucun payload fournisseur, réponse libre, secret ou identité n’est journalisé par ce module.

## Vérifications

Les tests unitaires couvrent le contrat client, les versions, les propriétés interdites, la grille privée, les modèles datés, la séparation des instructions, la requête fournisseur bornée et les sorties invalides. Les tests d’intégration sont exécutés contre Firestore Emulator : concurrence réelle, déduplication, quotas, date de Paris, droits et prérequis, révocation et suppression pendant l’appel, abonnement expiré, lease périmé, cooldown et refus des accès directs client.

Résultats du 19 octobre 2026 :

- `npm --prefix functions test` : **82/82** tests passent, dont six nouveaux tests unitaires du service, avant la candidate v3.
- Après intégration de la candidate v3 et des tests présents au même moment dans le dépôt, `npm --prefix functions test` : **84/84** passent.
- Après adaptation du transport du nouveau modèle et de la règle « tous les essentiels manquants », `npm --prefix functions test` : **86/86** passent, dont **9/9** tests de ce service. Les nouveaux tests couvrent les chunks, l’absence d’exposition des traces, les réponses tronquées, le code HTTP statique et le budget de sortie augmenté sans réservation supérieure.
- Candidate v4 : `node --test functions/src/enterprisePractice.test.mjs` : **10/10** passent ; `npm --prefix functions test` : **87/87** passent. Les assertions ajoutées vérifient l’ordre du schéma, l’extrait exact ou normalisé, les citations inventées, vides ou trop longues, les preuves partielles et l’absence d’exposition du tableau interne.
- Candidate v5 : `node --test functions/src/enterprisePractice.test.mjs` : **11/11** passent, avec une assertion du contrat de conseil fondé sur les faits et sans exigences inventées. Cette assertion vérifie la consigne transmise, pas son respect sémantique par un fournisseur réel.
- Candidate v6 : `node --test functions/src/enterprisePractice.test.mjs` : **12/12** passent ; `npm --prefix functions test` : **89/89** passent ; `npm --prefix functions run build` réussit. Les tests couvrent la segmentation déterministe jusqu’à 5 000 caractères, les chaînes sans blancs, les emoji, la conservation du contenu, la reconstruction source seule, la contradiction, la réponse partielle, l’injection et le rejet des identifiants inconnus, étrangers ou dupliqués. Le schéma, le transport, la borne de tokens et l’absence d’exposition des preuves sont vérifiés.
- Relecture v8 : **12/12** tests du service passent, notamment les aides obligatoires et bornées, l’alignement avec les critères et la sélection serveur de la prochaine action. Les résultats réels de la nouvelle candidate sont à consulter séparément dans le registre de qualification fournisseur ; aucun résultat partiel n’est transformé ici en qualification complète.
- Relecture v9 : **12/12** tests du service passent après suppression des forces libres. Le coordinateur rapporte également le succès de `npm test` et des **89 tests Functions** sur cette candidate. Aucun appel fournisseur, changement de code ou déploiement n’est effectué par cette relecture.
- `node --test functions/src/enterprisePractice.test.mjs` : **7/7** sur la candidate v3, dont le calcul déterministe des statuts et le rejet des tableaux incomplets, des états inconnus, des propriétés supplémentaires et des commentaires trop longs.
- `firebase-tools@15.32.1 emulators:exec --only firestore --project demo-memstack-challenge-ai "npm --prefix tests/challenge-ai run test:rules"` : **50/50** tests passent, dont huit nouveaux tests du service. Java 21 est utilisé uniquement pour l’émulateur local. Aucun projet réel n’est modifié. Les refus de règles affichés dans le journal sont ceux attendus par les assertions `assertFails`.

Le huitième test reprend un lease expiré, enregistre la nouvelle réponse, puis vérifie que l’ancienne réponse tardive ne peut pas l’écraser. La commande de règles inclut ce fichier dans les vérifications ordinaires et la CI.

## Limites à qualifier séparément

Les tests de structure et d’autorisation ne prouvent pas la qualité pédagogique réelle de Mistral. Une qualification fournisseur versionnée doit mesurer les réponses brèves correctes, les formulations équivalentes, les omissions importantes, les contradictions et les instructions hostiles, sur plusieurs ateliers et répétitions. Un retour IA reste une aide probabiliste sans certification ni impact sur les résultats des défis.

L’absence de stockage serveur du texte par ce module ne signifie pas absence de traitement externe : le texte est envoyé au fournisseur pour obtenir le retour. L’information utilisateur, les conditions fournisseur, les limites budgétaires du projet et les paramètres de déploiement relèvent de la qualification d’ensemble. Aucune mise en production ni appel fournisseur réel n’est réalisé par cette revue backend.
