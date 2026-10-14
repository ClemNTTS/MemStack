# Abonnements Stripe Managed Payments

## État de l’intégration

Le propriétaire a confirmé Managed Payments le 14 octobre 2026. Les tarifs existants sont `price_1UQTETLmonrrwnNTK3CpcVhP` et `price_1UQTD2LmonrrwnNTjeY9Ojdk`. Le serveur retrouve automatiquement le tarif à 150 centimes/mois et celui à 990 centimes/an, en EUR. Il exige des prix récurrents avec taxes incluses (`tax_behavior: inclusive`) pour respecter les prix TTC affichés. Le document Stripe fourni impose `2026-02-25.preview` ; cette version est explicite dans `functions/config/subscription.json`.

L’intégration est désactivée par défaut. Les produits réels existants sont conservés ; leurs équivalents de test et la destination webhook de test ont été configurés. Aucun paiement réel n’a été effectué. `VITE_SUBSCRIPTIONS_ENABLED=false` maintient les paiements fermés. Les services de paiement de test et les quotas serveur ont été déployés le 15 octobre 2026 ; le frontend publié utilise `VITE_SERVER_LEARNING_ENABLED=true` et `_configuration/learningAccess.enabled=true`. Le classement mondial reste à réaliser.

## Droits et quotas serveur

`commitLearningAction` et `importLearningProgress` exigent Google ou un email vérifié, ainsi qu’App Check, et vérifient le droit permanent ou la période Stripe payée à chaque transaction. Le compte gratuit dispose d’une nouvelle leçon et de cinq révisions dues par jour civil à Paris, tous parcours confondus. Les cartes nouvelles restent disponibles après une leçon. Premium enlève ces limites, sans avancer une échéance future. Le catalogue de confiance, les dates et le calendrier de révision viennent du serveur. Les reçus rendent les répétitions idempotentes ; les transactions empêchent de dépasser le quota depuis plusieurs onglets. Le premier compteur inclut les activités déjà enregistrées le jour de l’activation.

Les imports explicites conservent leurs dates historiques et consomment l’allocation du jour où ils sont importés. Un import partiel laisse les données restantes dans le cache du compte pour une reprise ultérieure. Le navigateur attend l’accusé serveur avant de présenter une nouvelle complétion ou révision.

Publication : déployer d’abord les deux callables, les services Stripe, la suppression de compte et `submitDeterministicChallenge`, puis les règles Firestore. Publier ensuite le frontend avec `VITE_SERVER_LEARNING_ENABLED=true` (variable GitHub `SERVER_LEARNING_ENABLED`). Enfin, créer administrativement `_configuration/learningAccess` avec `enabled: true` : les règles interdisent alors les écritures directes de leçons/cartes/révisions et les défis exigent Premium côté serveur. Ne pas activer ce document avant la disponibilité du nouveau frontend. Le flag client seul n’accorde aucun droit. Les anciens onglets doivent recharger l’application.

En mode Stripe test, seuls les comptes disposant d’un accès permanent peuvent ouvrir Checkout ou le portail. La suppression de compte expire les Checkout ouverts et annule les abonnements avant d’effacer les données et l’identité ; une panne Stripe suspend la suppression pour permettre sa reprise sans laisser une facturation orpheline.

Le frontend appelle `getSubscriptionStatus`, `createPremiumCheckout` et `createPremiumPortal` dans `europe-west9`. Google et App Check sont exigés. Aucun identifiant client, rôle, montant ou URL de retour n’est accepté depuis le navigateur. Les pages de retour sont fixes sur memstack.fr. La session hébergée active `managed_payments.enabled: true`, avec quantité 1 et mode subscription. Une réservation et une clé d’idempotence limitent les sessions concurrentes d’un même compte ; un abonnement existant oblige à utiliser sa gestion.

`stripeSubscriptionWebhook` exige une signature Stripe valide sur le corps HTTP original. Il recharge l’abonnement depuis Stripe, déduplique les événements, vérifie le client lié au compte, le mode test/réel, le tarif et une facture payée. Les abonnements en attente, en essai, en impayé ou annulés immédiatement ne donnent aucun premium. Une résiliation à échéance conserve l’accès jusqu’à la fin de la période payée. La date d’expiration est contrôlée lors de chaque lecture du droit. Les données privées de facturation ne sont jamais lisibles ni modifiables par le client.

La résiliation peut être annoncée par `cancel_at_period_end` ou par une date `cancel_at` située dans la période en cours. Les deux formats sont pris en compte. Le statut public indique séparément la possibilité de gérer la facturation et la présence d’un abonnement encore ouvert : un impayé retire Premium mais ne masque pas le portail. Un abonnement ouvert dirige les boutons d’achat vers sa gestion ; après résiliation effective, une nouvelle souscription redevient possible.

## Configuration sans envoyer de secret dans le chat

### Accès permanents

Les comptes propriétaire et de test peuvent recevoir, sur demande explicite du propriétaire, un document serveur `users/{uid}/settings/premiumAccess` avec `version: 1` et `permanent: true`. Cet accès est indépendant de Stripe, sans expiration ni paiement. Il est prioritaire sur l’abonnement, réservé à l’écriture administrative et audité dans `_maintenanceAudit`. Le client peut seulement lire son propre droit ; aucun email ou UID ne sert de passe-droit dans le bundle. Les limites techniques globales, la déduplication et les protections de suppression restent appliquées. Les deux accès demandés le 14 octobre 2026 ont été confirmés dans Firestore et les règles ont été publiées après 23 tests sur émulateur.

Depuis un terminal local, stocker la clé API de test dans Secret Manager avec la commande suivante et saisir la valeur uniquement dans l’invite masquée :

```powershell
npx firebase-tools functions:secrets:set STRIPE_SECRET_KEY --project memstack-9f581
```

Créer une destination webhook dans le Dashboard Stripe de test, avec l’URL :

```text
https://europe-west9-memstack-9f581.cloudfunctions.net/stripeSubscriptionWebhook
```

Sélectionner : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.

Stocker le secret de signature de cette destination (préfixe `whsec_`) dans une seconde invite masquée :

```powershell
npx firebase-tools functions:secrets:set STRIPE_WEBHOOK_SECRET --project memstack-9f581
```

Créer les équivalents de test des deux prix dans Stripe, avec taxes incluses, puis configurer dans `functions/.env.memstack-9f581` (ignoré par Git) :

```dotenv
SUBSCRIPTIONS_ENABLED=true
SUBSCRIPTIONS_LIVE_MODE=false
SUBSCRIPTION_PRICE_IDS=price_MENSUEL_TEST,price_ANNUEL_TEST
```

Les clés test et réel, les destinations webhook et leurs secrets sont différents. Ne pas activer le mode réel avant qualification, contrôle des quotas premium/gratuit et adaptation de la suppression du compte à une résiliation Stripe. L’ouverture commerciale doit aussi afficher les conditions et le renouvellement choisis par le propriétaire. Les taxes incluses et le code fiscal éligible au produit doivent être vérifiés dans Stripe. Ne pas inscrire de clé dans un `VITE_`, une commande, un dépôt ou une capture d’écran.

## Qualification requise

Les paiements mensuel/annuel, le 3D Secure accepté/refusé, le renouvellement payé/impayé, le portail, les résiliations et les notifications répétées/anciennes ont été qualifiés le 14 octobre 2026 avec des ressources Stripe fictives et le véritable handler webhook sur Firestore local. Voir [les résultats et le périmètre exact](STRIPE_QUALIFICATION.md). La recette Google/App Check vers les services déployés et la livraison webhook Cloud ont été validées le 15 octobre 2026 avec un paiement mensuel fictif. Le service pédagogique a aussi confirmé une leçon existante sans changer sa date ni la progression. Les signatures invalides et les paiements non authentifiés ont été rejetés (HTTP 400 et 401).

Tests unitaires et règles/transactions sur émulateur, puis parcours Stripe en mode test : paiement réussi, carte refusée, authentification bancaire, webhook répété ou reçu en retard, renouvellement, résiliation à échéance, retour navigateur avant webhook, changement de compte, impayé et réabonnement après résiliation. Aucun retour de navigateur ne doit débloquer premium avant confirmation serveur. Les secrets, réponses élèves et coordonnées de paiement ne doivent pas apparaître dans les logs.

Références : [Managed Payments](https://docs.stripe.com/payments/managed-payments/set-up), [webhooks](https://docs.stripe.com/webhooks), [cycle des abonnements](https://docs.stripe.com/billing/subscriptions/webhooks).
