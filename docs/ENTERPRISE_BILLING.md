# Abonnement Entreprise : 10 € TTC par membre actif et par mois

## Contrat commercial

L’organisation paie un abonnement Stripe Managed Payments à **10 € TTC par membre actif et par mois**. « Actif » signifie une adhésion active à l’organisation, responsables inclus. Il ne s’agit pas d’un utilisateur ayant appris dans la journée. Une invitation en attente ne compte pas. Retirer un membre réduit la quantité facturée ; le réinviter et accepter son invitation l’augmente à nouveau. Il n’y a pas de choix arbitraire d’un nombre de places au paiement.

Les changements de quantité utilisent `create_prorations` : les ajustements sont portés sur la prochaine facture, sans nouvelle facture ni prélèvement immédiat à chaque adhésion. Si la dernière facture est impayée, un retrait utilise `none` pour éviter de créditer un temps non payé. Un crédit de prorata n’est pas un remboursement automatique. Voir la [documentation Stripe sur les proratas](https://docs.stripe.com/billing/subscriptions/prorations) et le [modèle de quantités par utilisateur](https://docs.stripe.com/billing/subscriptions/quantities).

L’achat Entreprise ne donne pas de Premium développeur. Les Premium personnels/permanents ne paient pas l’organisation et n’accordent aucun droit Entreprise. Les pilotes `managed-pilot` administratifs préexistants gardent leur accès explicite et ne sont pas convertis automatiquement en abonnement facturé.

## État de configuration

État du 15 octobre après autorisation du propriétaire : backend déployé avec `ENTERPRISE_SUBSCRIPTIONS_ENABLED=true` et `ENTERPRISE_SUBSCRIPTIONS_LIVE_MODE=false`, ressources Stripe TEST dédiées et paiement réservé aux comptes de qualification autorisés. Le tableau ci-dessous décrit les valeurs par défaut et la préparation initiale ; voir [la recette du déploiement](ENTERPRISE_DEPLOYMENT_20261015.md) pour les résultats effectifs. Le LIVE reste fermé.

L’implémentation est désactivée par défaut. Ces paramètres Functions sont distincts de ceux du Premium grand public :

| Paramètre | Défaut | Valeur nécessaire à la qualification |
| --- | --- | --- |
| `ENTERPRISE_SUBSCRIPTIONS_ENABLED` | `false` | Reste `false` tant que la qualification n’est pas terminée |
| `ENTERPRISE_SUBSCRIPTIONS_LIVE_MODE` | `false` | `false` pour les essais |
| `ENTERPRISE_SUBSCRIPTION_PRICE_ID` | vide | Tarif TEST dédié : 1 000 centimes EUR, récurrent mensuel, TTC/inclusive, `per_unit`, `licensed`, quantité non transformée |
| `ENTERPRISE_PORTAL_CONFIGURATION_ID` | vide | Configuration TEST dédiée, active, modifications de prix/quantité désactivées |

Le SDK, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, l’API Managed Payments et le webhook `stripeSubscriptionWebhook` existants sont réutilisés. Aucun secret n’est placé dans une variable `VITE_`. Le mode TEST des callables de création/paiement/portail est réservé aux comptes de qualification explicitement autorisés par le grant permanent existant ; ce contrôle n’accorde pas lui-même un accès Entreprise.

Le portail doit avoir `features.subscription_update.enabled=false` : la quantité provient exclusivement des adhésions serveur. Le backend relit cette configuration Stripe avant d’ouvrir un portail. Pour une résiliation en fin de période, régler également `features.subscription_cancel.mode=at_period_end`. Les URL de retour sont fixes sur memstack.fr et conservent l’identifiant d’organisation ; aucun retour Stripe n’active l’accès par lui-même.

## Flux serveur

1. `createEnterpriseOrganization({name,requestId})` crée une organisation à paiement en attente et son premier responsable actif. La demande est idempotente et limitée à trois créations par compte sur 24 heures. Cette étape n’accorde aucun accès aux cours/cartes/défis.
2. `createEnterpriseCheckout({organizationId,requestId})` vérifie le responsable courant, l’état du compte, l’organisation non suspendue et le tarif exact. Le serveur compte les adhésions actives. Aucun `seats`, prix, UID, rôle ou montant fourni par le client n’est accepté.
3. Un client Stripe est associé à l’organisation, distinct du client Stripe personnel. Les reprises réutilisent ce client enregistré et une page de paiement louée par tranche serveur, avec clés d’idempotence.
4. Le webhook signé relit l’abonnement Stripe courant, sa facture payée, son tarif, sa quantité, son organisation, son client et son mode TEST/LIVE. Il enregistre l’entitlement serveur. Un essai, une facture impayée, un échec, un événement étranger ou un retour navigateur ne donnent pas l’accès.
5. Les nouvelles adhésions acceptées, retraits et suppressions produisent dans leur transaction Firestore une tâche durable `_enterpriseSeatSync/{organizationId}`. Les invitations seules ne produisent rien. Le worker `syncEnterpriseMemberQuantity` réconcilie une quantité absolue, avec bail sérialisé et clé d’idempotence stable par opération.

L’état de facturation est sous `organizations/{id}/billing/stripe`. Les index `_stripeEnterpriseCustomers`, `_stripeEnterpriseEvents` et `_enterpriseSeatSync` sont uniquement serveur. Le webhook Entreprise fonctionne sans activer ni résoudre les tarifs grand public. Une notification Entreprise déjà reconnue ne dépend pas de la configuration B2C.

## Accès, reprises et arrêts

`getEnterpriseBilling({organizationId})` et le portail restent accessibles au responsable courant pour régulariser ou annuler. `getEnterpriseWorkspace` renvoie les métadonnées de l’organisation avec `learningEnabled=false` et aucun progrès/classement lorsque l’abonnement n’est pas actif. Les mutations d’apprentissage et les nouvelles invitations apprenant sont refusées. Les contenus privés d’un membre retiré ou d’une organisation administrativement suspendue restent refusés.

Une suspension administrative est conservée par le webhook, même si un paiement aboutit ensuite. Le checkout est refusé pour une organisation suspendue. Lorsqu’un compte supprime le dernier responsable, l’organisation est suspendue et une tâche de quantité zéro annule l’abonnement ; aucune place fictive minimale n’est maintenue. L’annulation est effectuée avec prorata seulement si la dernière facture est payée.

Une modification concurrente d’adhésion garde une révision plus récente en attente pendant la requête Stripe en cours. Une panne ou perte de réponse reprend la même opération, sans second prélèvement inventé. Le worker ne refait pas une mise à jour si la quantité Stripe correspond déjà. Les notifications et écritures de bail/erreur n’alimentent pas une boucle de synchronisation.

Les échecs provider sont espacés avec un délai de 30 secondes à une heure ; après huit échecs automatiques, une reprise manuelle est nécessaire via `retryEnterpriseBillingSync({organizationId})`. L’interface signale la synchronisation en attente. Les tentatives manuelles réutilisent l’opération idempotente ; elles ne créent pas une nouvelle facture. Les droits payés antérieurs ne sont pas prolongés artificiellement lors d’un paiement de modification en attente.

## Qualification avant ouverture

- Exécuter le build, les tests serveur et la suite Firestore complète sur un projet `demo-`.
- Vérifier sur Stripe TEST : création avec un responsable, paiement confirmé par webhook, seconde adhésion, retrait, reprise après panne et annulation en fin de période.
- Vérifier l’absence d’abonnement/facture utilisateur réel, l’absence de Premium développeur indu et la conservation des suspensions administratives.
- Vérifier le portail dédié : tarif/quantité non modifiables, factures et résiliation accessibles.
- Garder les fonctions de paiement Entreprise désactivées et ne pas basculer en LIVE avant la qualification complète. La création d’un produit/tarif TEST ne constitue pas une ouverture commerciale.

Le worker est une Function événementielle Firestore du même projet et de la même région `europe-west9`, avec `maxInstances:2`, sans nouveau prestataire. Les limites de dépenses et quotas Mistral existants ne sont pas modifiés.
