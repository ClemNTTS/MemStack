# Fiabilité et préparation d’une ouverture

État revu le **17 octobre 2026**, sur le code `758ee21`. Commencer par [STATUS.md](STATUS.md) pour le périmètre actuel et les preuves de validation. Les recettes datées décrivent la version et l’environnement qu’elles ont effectivement exercés.

## Ce qui est établi

Le frontend est publié sur GitHub Pages. Firebase assure notamment l’authentification, les écritures pédagogiques contrôlées, la correction déterministe des défis, les droits Premium, la facturation Stripe et les espaces Entreprise. Le backend ne se limite plus au service IA historique.

Les 36 défis actifs utilisent chacun cinq questions et une correction serveur déterministe : quatre bonnes réponses sont nécessaires. Le résultat est enregistré avant sa présentation. Les réponses, corrections et analyses des formats antérieurs restent historiques et ne valident pas le nouveau format. Voir [le contrat des défis](content/CHALLENGES.md).

Les builds frontend et Functions, les 252 tests racine (dont 75 tests serveur) et `npm run reports:check` ont réussi lors de la revue du 17 octobre. Les tests Firestore/Auth sur émulateur sont attestés par la CI du même commit ; ils n’ont pas été relancés localement faute de Java. Les tests techniques ne prouvent ni apprentissage ni qualité d’un modèle IA.

Les recettes Stripe TEST du [Premium personnel](STRIPE_QUALIFICATION.md) et de [l’Entreprise déployée](ENTERPRISE_DEPLOYMENT_20261015.md) décrivent paiements, webhooks et droits sur l’infrastructure réelle, ainsi que les limites des parcours navigateur. Ces comptes rendus n’ont pas été rejoués pendant cette revue documentaire. Le dernier frontend publié utilise `VITE_SUBSCRIPTIONS_ENABLED=false` ; aucune ouverture LIVE n’est acquise.

## Limites encore ouvertes

- L’ouverture commerciale LIVE reste à préparer et à vérifier avec ses ressources, secrets et parcours de paiement propres. Le retour Entreprise vers l’interface publiée n’est pas prouvé par la recette connectée locale du 15 octobre.
- Les informations de l’éditeur, les documents et les procédures de lancement restent incomplets ; `src/legal/legalConfig.ts` conserve `approved: false`. Voir [LEGAL_LAUNCH.md](LEGAL_LAUNCH.md) pour les décisions à fournir et les vérifications à terminer.
- La suppression complète doit encore être exercée sur un compte de production jetable distinct des administrateurs réutilisables : export éventuel, reconnexion récente, confirmation exacte, suppression, refus des écritures tardives et préservation d’un autre compte.
- La publication d’une correction éditoriale réelle attend une proposition utile, revue puis fusionnée ; aucun défaut ni signalement ne doit être fabriqué pour produire cette preuve.
- Les preuves de recette mobile sur appareils réels, d’installation, de connexion et d’accessibilité complète restent à consolider. La procédure de retour arrière ci-dessous n’atteste pas sa répétition complète.
- Les tests techniques et la progression de qualification ne démontrent ni apprentissage ni fidélisation. Une cohorte et son retour différé restent nécessaires pour mesurer compréhension, reprises utiles et difficultés de connexion.

Les [recettes du 9 octobre](PRODUCTION_RECIPE.md) conservent leurs résultats et leurs limites historiques ; leurs nombres de tests et leurs anciens parcours IA ne décrivent pas la version actuelle.

## Qualification du service IA historique

Le service Mistral et ses analyses versionnées sont conservés séparément. Les essais v6/v7 comportent des faux refus, des critères mal attribués ou des fausses validations : leur stabilité n’est pas qualifiée. Voir [CHALLENGE_AI.md](CHALLENGE_AI.md) et [les observations fournisseur](CHALLENGE_AI_QUALIFICATION.md). Le drapeau frontend IA n’est ni une preuve de qualité ni le mécanisme de correction des QCM actifs.

`npm run ai:qualification` affiche le corpus synthétique versionné `criteria-stability-2026-10-13-v2` de **32 cas sur quatre dossiers historiques v2**, défini dans `tests/challenge-ai/qualification.mjs`. Aucun appel fournisseur ni aucune tentative utilisateur n’est créé. Avec un fichier de résultats observés, la commande compare les verdicts et indices manqués et signale les absences ou divergences. Ne jamais présenter des attentes éditoriales ou des résultats fabriqués comme des observations Mistral.

Le [protocole de qualification](../tests/challenge-ai/QUALIFICATION.md) exige au moins trois exécutions complètes avec le même modèle, prompt et corpus figé, plus une revue indépendante des critères et explications. Une campagne partielle ne qualifie pas la stabilité ; même une réussite complète ne garantit pas les réponses futures. Toute nouvelle campagne conserve date, version/hash du corpus, modèle, prompt, résultats, erreurs et revue, dans le budget autorisé. Aucun appel facturé n’est intégré à la CI.

## Vérification et publication

`Verify MemStack` installe les trois lockfiles, construit Functions et le frontend, exécute la suite racine puis les tests Firestore sur un projet d’émulateur `demo-`, sans secret de production. Le workflow Pages exécute aussi le test d’intégration Auth avant publication. La présence des workflows ne prouve pas que les protections de branche imposent ces vérifications. Voir [les commandes de tests](../tests/challenge-ai/README.md) : l’alias racine `test:challenge-rules` ne lance pas à lui seul l’émulateur.

Avant une publication, conserver un SHA connu bon, les versions frontend/règles/Functions et les paramètres non secrets. Vérifier la compatibilité avec les données historiques. Les règles et services doivent précéder le frontend qui dépend de leur contrat. Vérifier accès autorisé/refusé, sauvegarde et rechargement, changement de compte, connexion, réseau interrompu, parcours leçon/cartes et signalement. Conserver le périmètre réellement exercé et ses limites dans une recette datée.

## Incident et retour arrière

1. Identifier le service touché. Pour arrêter les nouveaux appels IA, appliquer `CHALLENGE_AI_ENABLED=false` côté serveur par un déploiement autorisé ; le commutateur frontend seul ne bloque pas les appels directs. Conserver Auth et App Check. Les commutateurs commerciaux ont leur propre périmètre ; voir [SUBSCRIPTIONS.md](SUBSCRIPTIONS.md) et [ENTERPRISE_BILLING.md](ENTERPRISE_BILLING.md).
2. Revenir au SHA connu bon du frontend via le workflow Pages. Pour les Functions/règles, reconstruire et déployer une version compatible avec les écritures déjà créées, après revue des règles. Revenir au code précédent ne supprime ni tentatives, ni analyses, ni abonnements.
3. Vérifier accès autorisé/refusé, lecture des historiques et arrêt effectif des opérations concernées. Ne pas réanalyser automatiquement un appel incertain ni réinitialiser les quotas. Documenter heure, versions, impact et résultat.

Cette procédure est documentée, sans preuve de répétition complète du retour arrière. Surveiller séparément coûts Firestore, Functions et fournisseur, erreurs et durée des exports, analyses, paiements et synchronisations Entreprise. Les alertes de facture ne constituent pas un plafond absolu ; les observations budgétaires datées sont dans [BILLING_STATUS_2026-10-13.md](BILLING_STATUS_2026-10-13.md).

## Données et protections

Les créations de tentatives et signalements sont limitées par compte à 20 et 10 par fenêtre d’une heure via des budgets atomiques. Un export réserve un délai de 15 minutes avant le suivant, y compris après échec. Ces protections réduisent les rafales sans plafonner toutes les lectures et écritures Firestore. Le déploiement des règles et services correspondants reste nécessaire à leur application.

Réponses et analyses historiques restent dans Firestore jusqu’à suppression du compte, sans expiration automatique. Les brouillons historiques locaux sont associés au compte et à la version, sans chiffrement pour un appareil partagé. Lors d’un appel IA, le fournisseur reçoit le dossier et la réponse, sans identité ni historique ; sa conservation contractuelle reste à vérifier. La suppression conserve notamment un marqueur lié à l’UID contre les écritures tardives, des compteurs globaux et des traces opérationnelles : elle ne garantit pas une anonymisation intégrale. Définir les durées, finalités et procédures pour ces traces, les organisations, le classement et la facturation selon [LEGAL_LAUNCH.md](LEGAL_LAUNCH.md), sans inventer de délai ni supprimer le garde contre les écritures tardives.
