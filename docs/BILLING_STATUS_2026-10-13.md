# Vérification de facturation du 13 octobre 2026

Vérification du projet `memstack-9f581` via l’authentification CLI existante et les API officielles Google Cloud. Aucun secret ni identifiant de compte de facturation n’est inclus ici.

L’API `billingbudgets.googleapis.com` était désactivée sur le projet consommateur, ce qui empêchait la lecture des budgets. Elle a été activée pour vérifier le plafond demandé par le propriétaire. Aucun nouveau budget, modification de seuil, hausse de dépenses ou déploiement n’a été effectué.

Les budgets existants, relus et rattachés au numéro réel de ce projet, sont :

- Alerte globale du projet : 5 EUR par mois, notifications à 50 %, 90 % et 100 %.
- Spend cap Cloud Run functions (`services/29E7-DA93-CA13`) : 5 EUR par mois, état réel `CONFIGURED`, notifications à 50 %, 80 % et 100 %.

Le cap existant est actif et couvre les fonctions Firebase. Il n’est pas un plafond dur : un délai d’application peut entraîner un dépassement ; Firestore et Artifact Registry ne sont pas couverts. Références officielles : https://firebase.google.com/docs/functions/quotas et https://firebase.google.com/docs/projects/billing/spend-caps.

Compteurs Cloud Monitoring disponibles du 1er octobre 2026 à 00:00 UTC au 13 octobre vers 16:12 Europe/Paris, agrégés par somme, sans pagination restante :

| Consommation | Total observé |
|---|---:|
| Lectures de documents Firestore | 4 209 |
| Écritures de documents Firestore | 1 379 |
| Requêtes Cloud Run | 92 |
| Temps d’instances Cloud Run comptabilisé pour la facturation | Environ 144,67 secondes |

Ces compteurs ne constituent pas un montant facturé en euros et peuvent avoir un délai de remontée. Ils n’incluent pas une synthèse des autres services ni la consommation Mistral. Aucun dataset BigQuery n’est présent dans ce projet lors de la lecture ; aucun export de facturation n’a été créé. Le montant réel doit être vérifié dans le rapport Cloud Billing ou dans un export de facturation déjà disponible ailleurs.

Les quotas gratuits sont partagés avec les autres utilisations éligibles : https://cloud.google.com/run/pricing et https://firebase.google.com/docs/firestore/quotas. Aucun montant de facture nul ni budget restant exact n’est déduit de ces seuls compteurs.

## Modification du 14 octobre 2026

À la demande du propriétaire, l’alerte globale du seul projet MemStack a été abaissée de 5 à 4 EUR par mois. Relecture API confirmée : notifications à 50 %, 90 % et 100 % (2 EUR, 3,60 EUR et 4 EUR). Le spend cap Functions reste à 5 EUR et les autres paramètres sont inchangés. Aucun arrêt automatique n’a été ajouté.
