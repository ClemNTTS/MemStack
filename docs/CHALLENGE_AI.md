# Analyse IA des défis — bêta privée

Le dossier et la réponse sont enregistrés avant l'analyse. La correction statique reste accessible sans résultat IA. Les versions historiques 1 sont conservées ; seules les tentatives version 2 sont analysables. Deux champs de 2 000 caractères maximum forment une réponse totale de 4 000 caractères maximum, séparateur compris.

## Pourquoi un service

GitHub Pages ne peut pas protéger une clé Mistral ni contrôler le coût. `functions/` ajoute un unique callable Firebase `analyzeChallengeAttempt`, à Paris (`europe-west9`), sur Node 24. Auth Firebase et App Check sont vérifiés ; les règles refusent les écritures client des analyses et des compteurs. Il n'y a ni exécution de code, ni paiement, ni clé personnelle.

Le service charge les dossiers de confiance depuis `shared/challengeDossiers.json`, copiés dans le paquet Functions au build. Le client ne transmet que `{attemptId}`. L'identité vient du jeton Firebase, puis le serveur lit la tentative dans le compte correspondant. Le fournisseur reçoit le dossier et les deux champs, sans UID, email ni historique personnel. Les prompts demandent un retour français, sans score, en distinguant juste/incomplet/erroné et en acceptant les alternatives valables. L'application construit le lien vers la correction ; elle n'active pas les liens du modèle.

## Installation et vérification

Depuis le dépôt : `npm --prefix functions ci`, `npm --prefix functions run build`, `npm --prefix functions test`. Le lockfile des fonctions est indépendant du frontend. Les tests métier ne font aucun appel réseau. Les tests de règles sont sous `tests/challenge-ai/` ; consulter leur configuration et lancer l'émulateur avant déploiement.

## Activation humaine

Le projet utilise Blaze. Le propriétaire a autorisé le service et son déploiement. Le secret Mistral est installé dans Secret Manager ; les paramètres privés invitent le compte propriétaire, exigent App Check et limitent les appels à 5 par compte et 25 globalement par jour UTC. Aucun service n'est déployé par les scripts de build ou de test.

Le plafond Mistral enregistré est de 10 €/mois pour tout le compte, y compris le worker de signalements. L'alerte projet de 5 €/mois et le cap Functions de 5 €/mois ont été configurés dans Firebase. Les alertes seules ne bloquent rien. Le spend cap en Preview suspend Cloud Run Functions à 100 %, mais le délai de quelques minutes peut entraîner un dépassement facturé et il ne couvre pas Firestore ou Artifact Registry. Voir la [documentation des spend caps Firebase](https://firebase.google.com/docs/projects/billing/spend-caps). Les images de build de europe-west9 sont nettoyées après sept jours. Ces protections ne constituent pas un plafond absolu de toute la facture.

1. Choisir et évaluer un identifiant de modèle Mistral versionné, vérifier disponibilité, coût et traitement des données selon le contrat du fournisseur. Le modèle est vide par défaut et les alias `latest` sont refusés.
2. Définir le secret via `firebase functions:secrets:set MISTRAL_API_KEY --project memstack-9f581`. Ne jamais le mettre dans une variable `VITE_`, un fichier commité, une réponse de terminal ou un journal.
3. Configurer les paramètres Functions dans le fichier local `functions/.env.memstack-9f581` (non commité) :

```dotenv
CHALLENGE_AI_ENABLED=false
CHALLENGE_AI_REQUIRE_APP_CHECK=true
CHALLENGE_AI_INVITED_UIDS=uid-du-compte-invite
CHALLENGE_AI_MODEL=identifiant-versionne-valide
CHALLENGE_AI_USER_DAILY_LIMIT=5
CHALLENGE_AI_GLOBAL_DAILY_LIMIT=25
CHALLENGE_AI_GLOBAL_RESERVED_TOKENS=400000
```

4. Configurer Firebase App Check pour l'application Web et la clé publique frontend. Le mode émulateur peut désactiver l'exigence explicitement ; garder `true` en production. Une App Check absente provoque un refus avant le traitement.
5. Après tests, déployer exclusivement `firebase deploy --only functions:challenge-ai,firestore:rules --project memstack-9f581`. Activer `CHALLENGE_AI_ENABLED=true` seulement après revue des paramètres, fournisseurs, invitations et budgets ; redéployer les fonctions pour appliquer la configuration.

Les paramètres sont serveur. Aucun navigateur ne peut s'inviter, augmenter un quota, changer de modèle ou activer l'IA. L'état désactivé est le défaut ; la correction reste utilisable. Les signalements restent gratuits et indépendants.

## Déduplication et plafonds

Une transaction Firestore réserve une analyse par identifiant de tentative et incrémente les compteurs du jour UTC (`users/{uid}/challengeAiUsage/{jour}` et `_challengeAiUsage/{jour}`). Les appels simultanés lisent le même résultat `processing` ; un résultat terminé est réutilisé. Aucun appel fournisseur n'a lieu avant une réservation confirmée.

Une réservation représente une limite de consommation de bêta, pas un crédit payé : elle reste consommée même après un échec, pour contenir les boucles et les factures incertaines. Les futures offres commerciales devront séparer quota de protection et crédits facturés ; aucun crédit commercial n'existe actuellement. Le quota de tokens est conservateur, pas une facture exacte. Les paramètres doivent conserver des limites modestes.

L'appel Mistral expire après 45 secondes ; la fonction après 90 secondes ; le lease après 120 secondes. Aucun retry fournisseur automatique. Un timeout, une erreur fournisseur, un retour invalide ou tronqué mène à `needs_review`, car un appel peut déjà avoir été facturé. Un lease expiré mène au même état sans relance. Il faut une vérification humaine avant toute éventuelle reprise. Une panne d'enregistrement après réception conserve le lease et aboutit aussi à une vérification ; on n'annonce jamais un succès avant la persistance du résultat.

Le retour enregistré porte les versions du défi, de la grille, du prompt et du modèle. Les données de tentative restent immuables ; aucune analyse ne modifie les échéances des cartes ni les leçons. Aucun contenu personnel ou payload fournisseur n'est journalisé par ce code. Le feedback est une aide pédagogique probabiliste : vérifier les cas corrects, partiels, faux, alternatifs et hostiles avant invitation de nouveaux comptes.

## Données et maintenance

Firestore conserve réponse et analyse dans le compte, sans politique d'expiration ajoutée. Définir et communiquer rétention, suppression/export et traitement fournisseur avant ouverture publique. Les durées et engagements du fournisseur doivent être vérifiés dans les conditions du compte utilisé ; cette implémentation ne prétend pas garantir une absence de conservation côté fournisseur.

Pour arrêter les nouveaux appels, désactiver le paramètre puis redéployer. Les résultats existants restent disponibles via lecture Firestore. Les quotas et `maxInstances` réduisent l'exposition financière sans remplacer la surveillance de la facture Firebase et Mistral.
