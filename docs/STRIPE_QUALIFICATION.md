# Qualification Stripe du 14 octobre 2026

Tests effectués avec Stripe Managed Payments, API `2026-02-25.preview`, dans le bac à sable du propriétaire. Checkout et le portail ont été utilisés dans le navigateur avec des identités fictives et les cartes de test Stripe. La CLI officielle Stripe 1.53.1 a transmis les notifications signées au véritable handler HTTP `stripeSubscriptionWebhook`, exécuté localement. Ses écritures utilisaient exclusivement Firestore sur émulateur, projet `demo-memstack-stripe`.

| Scénario | Résultat observé |
| --- | --- |
| Carte mensuelle refusée | Checkout reste ouvert et impayé ; aucun droit Premium enregistré. |
| Paiement mensuel accepté | Facture payée de 150 centimes EUR ; notification signée acceptée ; Premium mensuel enregistré. |
| Offre annuelle en France | Total 990 centimes EUR, TVA de 165 centimes incluse dans le total. |
| 3D Secure refusé | Message d’échec visible ; Checkout impayé ; aucun Premium annuel. |
| 3D Secure accepté | Facture annuelle payée ; Premium jusqu’à la fin de la période annuelle. |
| Portail client | Factures, résiliation et changement de carte accessibles. Le changement de carte de l’abonnement a été confirmé via le portail, pas par une mise à jour API interdite par Managed Payments. |
| Renouvellement annuel | Horloge Stripe avancée ; facture suivante finalisée et payée ; droit prolongé d’un an. |
| Renouvellement impayé | Carte de test défaillante sélectionnée dans le portail ; abonnement `past_due`, facture ouverte, événement `invoice.payment_failed` ; droit serveur `free`. |
| Résiliation à échéance | Abonnement mensuel encore actif, `cancel_at_period_end: true` ; Premium conservé jusqu’à la date payée. |
| Résiliation immédiate | Abonnement mensuel annulé ; notification reçue ; droit serveur `free`. |
| Notification répétée | Deux relectures du même vrai événement payé renvoient `duplicate: true` ; droit inchangé. |
| Ancien événement payé après impayé | Le reçu de cet événement a été retiré uniquement dans l’émulateur pour exercer le contrôle d’ordre ; résultat `outdated: true`, aucun rétablissement de Premium. |
| Signature invalide | Rejet HTTP 400 par le handler local. |
| Deuxième abonnement actif | Le service refuse un second Checkout avec `already-exists`. |
| Réabonnement après résiliation | Le service crée un nouveau Checkout ; deux appels répétés donnent la même session ; session non payée expirée après vérification. |

Deux corrections ont résulté de ces essais : la résiliation du portail peut être fournie par `cancel_at` sans activer `cancel_at_period_end` ; le service reconnaît désormais ce format et conserve la bonne indication de renouvellement annulé. Un membre en impayé conserve aussi l’accès à la gestion Stripe dans son profil et sur la page Premium. Les boutons des formules ouvrent son abonnement existant au lieu de lancer un deuxième paiement. Ce comportement a été vérifié dans une prévisualisation des composants réels avec données fictives. Les 202 tests unitaires et les builds frontend/Functions passent après ces corrections.

Les captures et les outils temporaires de qualification sont dans `.npm-cache/stripe-proof/` et `.npm-cache/stripe-*.mjs`, ignorés par Git. Les clés ont été chargées depuis Secret Manager en mémoire et jamais imprimées. Aucun débit réel, aucune modification de progression ou de droit d’un compte réel, aucun déploiement Functions et aucune modification des plafonds n’ont été nécessaires.

Le nettoyage a utilisé `closeAccountBilling` sur les deux comptes fictifs de l’émulateur avec le vrai SDK Stripe de test. Tous leurs abonnements ont été confirmés annulés, toutes leurs sessions Checkout ouvertes ont été fermées et leurs associations client ont été retirées uniquement de Firestore local. Les historiques Stripe fictifs restent disponibles pour l’inspection.

Cette recette valide les paiements hébergés et la réception locale des notifications réelles. Elle ne valide pas encore les callables déployés avec Google et App Check, ni la livraison à la destination webhook Cloud Functions. Les flags commerciaux restent désactivés. La prochaine recette consiste à publier les services en mode test, vérifier ce dernier parcours authentifié, puis remplacer les tarifs et secrets par leurs équivalents réels lors de l’ouverture décidée par le propriétaire.

Références : [cartes de test Stripe](https://docs.stripe.com/testing), [notifications locales avec la CLI](https://docs.stripe.com/cli/listen), [gestion des abonnements Managed Payments](https://docs.stripe.com/payments/managed-payments/how-it-works#manage-orders).

## Recette Firebase en ligne — 15 octobre 2026

Les services de paiement ont été déployés en `europe-west9` avec App Check imposé et Stripe en mode test. Une page de qualification locale utilisant les vrais adaptateurs Firebase a appelé `getSubscriptionStatus`, puis `createPremiumCheckout`, avec l’identité Google du compte de test dédié. Ces appels ont abouti sans contournement de l’authentification ni d’App Check.

Le Checkout hébergé créé par Firebase a accepté une carte fictive : 150 centimes EUR TTC, dont 25 centimes de TVA en France. La notification signée a été livrée directement à `stripeSubscriptionWebhook` en ligne. Firestore a enregistré l’abonnement Stripe actif et un droit `premium` mensuel avec une échéance future. La vérification a porté sur ce droit Stripe séparé, et pas uniquement sur le Premium permanent déjà attribué au testeur.

L’abonnement fictif a ensuite été annulé, les sessions ouvertes fermées et les documents de facturation restaurés à leur état précédent. Le droit Premium permanent et toute la progression pédagogique sont restés intacts ; le nettoyage a été journalisé. Aucune carte réelle ni aucun débit réel n’ont été utilisés. Les paiements publics restent fermés tant que les secrets et tarifs réels ne sont pas activés : le test en ligne est validé, l’ouverture commerciale reste une étape distincte.
