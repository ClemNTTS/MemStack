# Espace Entreprise : accès et isolation

L’offre continue utilise Firebase Auth, App Check, Firestore et les Functions existants en `europe-west9`. Aucun fournisseur IA n’est requis. Les frais techniques restent ceux des lectures/écritures et appels Firebase existants. Les plafonds globaux existants sont conservés. L’abonnement commercial à 10 € TTC par membre actif et par mois, distinct des pilotes, est décrit dans [ENTERPRISE_BILLING.md](ENTERPRISE_BILLING.md).

## Activation commerciale

Les **pilotes administrés** restent distincts de l’achat B2B automatique, désactivé tant que sa qualification Stripe n’est pas terminée. Seul un administrateur MemStack Google possédant encore le rôle serveur peut créer ou désactiver un pilote. Sa création reçoit un nom et l’email du responsable. Elle crée un espace activé, limité à 200 membres actifs, et retourne un code d’invitation destiné à cette adresse. Elle ne transforme pas le créateur en membre de l’organisation. Aucun Premium grand public ne donne un accès Entreprise.

Le code doit être transmis par le responsable humain. L’application n’envoie aucun email. Il contient 192 bits aléatoires, seul son SHA-256 est conservé, sa durée de validité est de sept jours, son usage est unique et l’adresse vérifiée du compte doit correspondre. Le responsable invité peut ensuite créer des invitations apprenant et retirer les apprenants. Il ne peut ni créer une organisation, ni augmenter ses places, ni retirer un autre responsable. Une modification des responsables requiert une intervention administrative de confiance.

La création utilise un `requestId` stable : une répétition après perte d’accusé de réception conserve la même organisation et fait tourner le code d’invitation précédent. Aucun code n’est stocké en clair pour permettre cette reprise. Après retrait d’un membre, les invitations émises avant le retrait ne permettent plus de rejoindre cet espace. Une nouvelle invitation conserve les acquis et les compteurs antérieurs du membre.

Les fonctions publiques sont `getEnterpriseWorkspace`, `manageEnterpriseOrganization`, `joinEnterpriseOrganization` et `commitEnterpriseLearningAction`. Le contrat TypeScript figure dans `src/types/enterprise.ts`, son adaptateur dans `src/firebase/enterprise.ts`.

Si la suppression d’un compte retire le dernier responsable actif, l’organisation est désactivée dans la même transaction que son retrait. Pour récupérer cet espace, un administrateur MemStack actuel appelle `manageEnterpriseOrganization` avec `{ action: 'inviteManager', organizationId, email }`, transmet le nouveau code au responsable désigné, puis réactive explicitement l’espace avec `{ action: 'enable', organizationId, enabled: true }`. Le responsable rejoint avec son adresse vérifiée. Les progrès des autres apprenants sont conservés pendant cette suspension. Un apprenant ou responsable ordinaire ne peut pas appeler `inviteManager`.

L’invitation administrative de responsable peut aussi promouvoir un apprenant déjà membre actif : elle conserve son pseudo, sa date d’adhésion, son classement et tous ses acquis. Cette promotion ne consomme pas de place supplémentaire, même lorsque l’organisation est complète. Une invitation ordinaire d’apprenant ne change aucun rôle et ne peut pas rétrograder un responsable.

## Données et droits

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
