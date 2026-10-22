# Espace Entreprise : accès et isolation

L’offre continue utilise Firebase Auth, App Check, Firestore et les Functions en `europe-west9`. Depuis l’ajout du 19 octobre 2026, les retours des ateliers utilisent aussi Mistral via un callable dédié, avec activation indépendante, modèle versionné et plafonds de coût. Les défis finaux restent corrigés en code. L’abonnement commercial à 10 € TTC par membre actif et par mois, distinct des pilotes, est décrit dans [ENTERPRISE_BILLING.md](ENTERPRISE_BILLING.md).

## Retours des ateliers

`assessEnterprisePracticeAnswer` vérifie le compte courant, App Check, l’appartenance active, les droits d’organisation et les prérequis. Il reçoit uniquement l’organisation, la mission, l’empreinte du cas affiché et la réponse. Les cas de confiance sont préparés avec les Functions ; les grilles essentielles/facultatives ne sont pas importées par le frontend. La réponse envoyée à Mistral ne contient pas d’identité ou d’historique ajoutés par MemStack.

Les plafonds initiaux sont de 30 nouvelles vérifications par membre et organisation par jour à Paris, 500 au niveau global et 6 millions de tokens réservés globalement. Chaque appel réserve 32 000 tokens de façon conservatrice : ce dernier plafond borne donc à 187 nouveaux appels par jour, avant les autres limites. Les réponses identiques réutilisent leur reçu, lié au cas, à la grille, au modèle et au prompt serveur ; aucune dépense n’est réservée pour ce cache. Une erreur ne déclenche aucun retry fournisseur automatique. Un nouvel essai explicite après indisponibilité attend une minute et réserve à nouveau le budget.

Les reçus sont sous `organizations/{organizationId}/learners/{uid}/practiceFeedback`, sans réponse brute ; seul le retour et ses métadonnées sont conservés. Les managers n’y ont pas accès. Les règles client restent fermées ; le callable fait les contrôles et retourne le feedback. L’export personnel inclut ces reçus ; la suppression récursive du learner les enlève et le marqueur de suppression bloque les écritures tardives. Le feedback n’accorde aucune progression ni place au classement. Voir [ARCHITECTURE.md](ARCHITECTURE.md) et les qualifications datées dans `docs/content/ENTERPRISE_PRACTICE_AI_*_20261019.md`.

## Activation commerciale

Au 17 octobre 2026, la souscription standard est implémentée via `createEnterpriseOrganization`, puis Checkout et confirmation serveur du paiement. Le backend et le worker ont été qualifiés sur l’infrastructure réelle en mode Stripe TEST le 15 octobre ; cette preuve ne vaut pas ouverture LIVE. Voir [ENTERPRISE_DEPLOYMENT_20261015.md](ENTERPRISE_DEPLOYMENT_20261015.md) et [STATUS.md](STATUS.md). L’accès des membres exige un compte Google ou email/mot de passe vérifié et App Check.

Les **pilotes administrés** restent distincts de cette souscription standard. Les opérations administratives décrites ci-dessous concernent ces pilotes et la gestion de confiance ; elles ne remplacent pas le parcours d’achat. Seul un administrateur MemStack Google possédant encore le rôle serveur peut créer ou désactiver un pilote. Sa création reçoit un nom et l’email du responsable. Elle crée un espace activé, limité à 200 membres actifs, et retourne un code d’invitation destiné à cette adresse. Elle ne transforme pas le créateur en membre de l’organisation. Aucun Premium grand public ne donne un accès Entreprise.

Le code doit être transmis par le responsable humain. L’application n’envoie aucun email. Il contient 192 bits aléatoires, seul son SHA-256 est conservé, sa durée de validité est de sept jours, son usage est unique et l’adresse vérifiée du compte doit correspondre. Le responsable invité peut ensuite créer des invitations apprenant et retirer les apprenants. Il ne peut ni créer une organisation, ni augmenter ses places, ni retirer un autre responsable. Une modification des responsables requiert une intervention administrative de confiance.

La création utilise un `requestId` stable : une répétition après perte d’accusé de réception conserve la même organisation et fait tourner le code d’invitation précédent. Aucun code n’est stocké en clair pour permettre cette reprise. Après retrait d’un membre, les invitations émises avant le retrait ne permettent plus de rejoindre cet espace. Une nouvelle invitation conserve les acquis et les compteurs antérieurs du membre.

Les callables de l’espace pédagogique et de sa gestion sont `getEnterpriseWorkspace`, `manageEnterpriseOrganization`, `joinEnterpriseOrganization` et `commitEnterpriseLearningAction`. Le contrat TypeScript figure dans `src/types/enterprise.ts`, son adaptateur dans `src/firebase/enterprise.ts`. La souscription ajoute `createEnterpriseOrganization`, `getEnterpriseBilling`, `createEnterpriseCheckout`, `createEnterprisePortal` et `retryEnterpriseBillingSync` ; le webhook Stripe et le worker `syncEnterpriseMemberQuantity` assurent les mises à jour de facturation décrites dans [ENTERPRISE_BILLING.md](ENTERPRISE_BILLING.md).

Si la suppression d’un compte retire le dernier responsable actif, l’organisation est désactivée dans la même transaction que son retrait. Pour récupérer cet espace, un administrateur MemStack actuel appelle `manageEnterpriseOrganization` avec `{ action: 'inviteManager', organizationId, email }`, transmet le nouveau code au responsable désigné, puis réactive explicitement l’espace avec `{ action: 'enable', organizationId, enabled: true }`. Le responsable rejoint avec son adresse vérifiée. Les progrès des autres apprenants sont conservés pendant cette suspension. Un apprenant ou responsable ordinaire ne peut pas appeler `inviteManager`.

L’invitation administrative de responsable peut aussi promouvoir un apprenant déjà membre actif : elle conserve son pseudo, sa date d’adhésion, son classement et tous ses acquis. Cette promotion ne consomme pas de place supplémentaire, même lorsque l’organisation est complète. Une invitation ordinaire d’apprenant ne change aucun rôle et ne peut pas rétrograder un responsable.

## Données et droits

### Parcours habituel — ajout local du 22 octobre 2026

`setEnterpriseLearningPreferences` reçoit exactement `{ organizationId, activeTrackId }` et retourne `{ organizationId, settings: { activeTrackId, updatedAt } }` après écriture. Le serveur déduit le compte de Firebase Auth, valide le parcours contre le catalogue préparé et relit l’adhésion, les droits d’organisation et le marqueur de suppression dans la transaction. Le callable conserve App Check et la région des opérations Entreprise existantes.

Le document `organizations/{organizationId}/learners/{uid}/settings/learning` contient ce choix et sa date serveur. L’écriture fusionne uniquement ces champs pour permettre des réglages futurs dans le même document. `getEnterpriseWorkspace` retourne `settings: null` en l’absence de préférence valide, de parcours encore présent dans le catalogue ou d’accès pédagogique actif. Une préférence devenue invalide n’est pas supprimée implicitement. Les lectures n’enregistrent jamais un choix ; visiter un lien explicite ne modifie le parcours habituel que par une action de choix côté interface.

Les préférences sont privées par compte et organisation ; elles ne créent ni complétion, ni XP, ni révision, ni activité au classement. Elles ne sauvegardent pas les productions ou l’étape d’une mission. La collection `settings` figure dans l’export du compte et la suppression récursive du learner la retire. Les règles client demeurent fermées. Les tests d’intégration couvrent deux organisations, deux membres, catalogue retiré, rejeu, retrait d’accès, désactivation, suppression de compte, export et refus des accès clients directs. Ce contrat local nécessite un déploiement autorisé avant utilisation en production.

Qualification locale du 22 octobre : `npm run functions:build` réussi, `npm run functions:test` 90/90 et suite `enterprise.integration.test.mjs` 9/9 sur l’émulateur Firestore avec Firebase CLI 15.32.1, Java 21 et projet `demo-memstack-challenge-ai`. Les refus attendus d’accès client produisent des messages `PERMISSION_DENIED` pendant les tests. Ces résultats ne qualifient ni l’interface ni le déploiement réel ; aucun déploiement n’a été effectué.

- Les comptes conservent le même UID Firebase dans les deux environnements.
- `users/{uid}/enterpriseMemberships/{organizationId}` est un index serveur, lisible par son propriétaire. Il ne donne jamais un droit à lui seul.
- `organizations/{organizationId}/members/{uid}` contient le rôle, l’accès actif, un pseudo neutre propre à cette organisation et des compteurs d’avancement.
- `organizations/{organizationId}/learners/{uid}/{lessons,cards,reviews,attempts,receipts,limits}` contient les données d’apprentissage propres à cet espace.
- `organizations/{organizationId}/ranking/{uid}` contient le streak propre à cet espace.
- `_enterpriseInvitations/{hash}` contient les invitations inaccessibles aux clients.

Les règles refusent toute lecture/écriture directe des organisations aux clients, y compris un client portant une claim de responsable. Les callables vérifient l’authentification, le compte Auth actuel, son adresse vérifiée, sa désactivation et le marqueur de suppression. Chaque transaction relit l’organisation et l’adhésion : un retrait ou une désactivation bloque aussi les répétitions d’actions déjà enregistrées.

Les cartes, leçons, défis et streaks développeur ne sont ni importés ni consultés par ces callables. Deux organisations du même utilisateur sont également indépendantes. Les identifiants de contenu sont ceux du catalogue Entreprise exclusivement.

## Progression continue

Le serveur impose l’ordre des missions, les prérequis du chapitre avant une mise en situation, et les échéances des cartes. Il produit les dates et les intervalles. Les cartes futures ne peuvent pas être avancées. Il n’y a pas de quota quotidien de leçons/révisions pour les membres autorisés ; une limite de sécurité de 120 mutations par heure et par apprenant reste en place. Les invitations sont limitées à 30 par heure et par organisation. Un compte peut rejoindre 20 organisations actives.

Une action possède un `requestId` stable, réutilisé après une panne réseau. Un même identifiant et une même action retournent le résultat initial ; modifier l’action avec cet identifiant est refusé. Les tentatives sont immuables. Les défis sont corrigés en code avec `enterpriseAssessmentKeys.json`, copié seulement dans le catalogue Functions. La réussite requiert strictement plus de 70 % de bonnes réponses. La correction est révélée seulement après l’écriture serveur. Aucun code d’apprenant n’est exécuté.

Chaque tentative conserve les versions du catalogue et de la grille, le titre du défi, le texte des questions, les réponses choisies/correctes et leurs explications. Une évolution du contenu ne réinterprète pas un ancien résultat. Ces explications restent dans le fichier de clés privé avant la tentative. Relire une mission déjà terminée ne crée pas artificiellement un jour de streak.

Le client envoie la version publique du catalogue pour toute nouvelle tentative. Un ancien onglet doit actualiser avant d’être corrigé selon un questionnaire plus récent. Catalogue et grille privée partagent une version de publication commune, vérifiée pendant le build et à l’exécution : modifier les réponses ou explications impose aussi d’incrémenter la version publique. Un résultat déjà enregistré reste récupérable avec son identifiant de requête et ses versions initiales.

Le classement utilise les jours Europe/Paris et compte au maximum un jour de streak par date. L’API retourne des pseudos et des rangs, sans email ni UID dans le classement. Le responsable voit les pseudos, les rôles, les compteurs de missions/cartes/tentatives et la dernière activité ; il ne reçoit aucune réponse individuelle d’un collègue.

Chaque membre peut choisir son pseudo propre à l’organisation via `{ action: 'myAlias', organizationId, alias }` : 2 à 24 caractères (lettres, chiffres, espaces, tirets ou points), au maximum trois modifications par jour Europe/Paris et par espace. Cette modification ne touche ni le pseudo développeur, ni les autres organisations, ni le streak.

Les lectures sont bornées : 20 organisations, 200 membres et lignes de classement, 200 leçons, 2 000 cartes, 500 événements récents et 100 tentatives récentes pour l’utilisateur. Les compteurs du responsable restent cumulés même lorsque l’historique récent est tronqué.

## Cycle de vie et qualification

L’export du compte ajoute les progrès Entreprise, adhésions et classements propres au compte. La suppression enlève les adhésions, classements et tous les descendants du progrès, anonymise les identifiants du créateur d’organisation/invitations et supprime les invitations adressées à l’email courant du compte. Les données des autres apprenants restent intactes.

`npm run functions:build` prépare le catalogue et vérifie la syntaxe serveur. `npm run functions:test` vérifie notamment les payloads et le compte courant. La suite `tests/challenge-ai/enterprise.integration.test.mjs`, intégrée à `test:rules`, couvre l’activation administrative, les invitations, l’isolation développeur/organisations, l’idempotence, les échéances, la correction déterministe, le retrait d’accès, la désactivation, l’export/suppression et les refus de règles Firestore. Elle s’exécute exclusivement sur un projet d’émulateur `demo-`.

Un déploiement des Functions et règles sera nécessaire pour ouvrir les véritables espaces. Ne pas annoncer une organisation comme payée avant la réception de son webhook Stripe confirmé. Les pilotes administrés et les abonnements commerciaux suivent des droits distincts.
