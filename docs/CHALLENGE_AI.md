# Analyse IA des défis — bêta privée

Le dossier et la réponse sont enregistrés avant l'analyse. La correction statique reste accessible sans résultat IA. Les versions historiques 1 sont conservées ; seules les tentatives version 2 sont analysables. Deux champs de 2 000 caractères maximum forment une réponse totale de 4 000 caractères maximum, séparateur compris.

## Pourquoi un service

GitHub Pages ne peut pas protéger une clé Mistral ni contrôler le coût. `functions/` ajoute un unique callable Firebase `analyzeChallengeAttempt`, à Paris (`europe-west9`), sur Node 24. Auth Firebase et App Check sont vérifiés ; les règles refusent les écritures client des analyses et des compteurs. Il n'y a ni exécution de code, ni paiement, ni clé personnelle.

Le service charge les dossiers de confiance depuis `shared/challengeDossiers.json`, copiés dans le paquet Functions au build. Le client ne transmet que `{attemptId}`. L'identité vient du jeton Firebase, puis le serveur lit la tentative dans le compte correspondant. Le fournisseur reçoit le dossier et les deux champs, sans UID, email ni historique personnel. Les prompts demandent un retour français, sans score, en distinguant juste/incomplet/erroné et en acceptant les alternatives valables. L'application construit le lien vers la correction ; elle n'active pas les liens du modèle.

## Accès à l’option IA

Les routes de défis exigent le droit serveur `users/{uid}/settings/challengeAccess` avec `aiEnabled: true`. Le client lit ce document depuis le serveur ; son absence, `false` ou un type invalide refuse l’accès. Seul un administrateur peut le créer, le modifier ou le supprimer ; les règles refusent toute écriture client. Aucun paiement ni abonnement facturé n’est ajouté.

Les règles imposent ce droit aux lectures et créations de tentatives ainsi qu’aux lectures d’analyses. Le callable le relit dans sa transaction avant tout retour, y compris un résultat existant. `CHALLENGE_AI_INVITED_UIDS` reste une restriction supplémentaire de bêta pour les nouvelles analyses ; activation et quotas restent indépendants. Révoquer le droit bloque les opérations serveur suivantes sans supprimer l’historique. Les signalements restent indépendants.

Avant de déployer ces règles et fonctions, créer ce document pour chaque membre autorisé, notamment les comptes déjà invités ; une invitation seule ne suffit plus. Utiliser la console Firestore ou un outil Admin de confiance, jamais le frontend. Le 9 octobre 2026, le droit du seul compte déjà invité a été créé et relu sur le serveur avant publication des règles ; aucun autre compte n’a été ajouté.

Les défis se débloquent progressivement : terminer toutes les leçons `lessonIds` du dossier et au moins deux leçons de sa thématique (une seule si elle n’en contient qu’une). Il n’est plus nécessaire de terminer toute la thématique. Avec le catalogue actuel et son ordre conseillé, le premier défi arrive après deux à cinq leçons selon les notions requises, notamment deux sur les trente-cinq leçons DevOps. Les pages et le provider appliquent cette règle ; le callable relit les leçons enregistrées côté serveur avant toute nouvelle réservation IA, sans consommer de quota en cas de prérequis manquants. Les analyses historiques restent réutilisables si l’accès IA est encore autorisé. Le curriculum de confiance est copié dans le paquet Functions au build, avec les dossiers. La progression reste déclarée par l’apprenant : cette condition pédagogique ne constitue pas une protection anti-triche ni une certification.

L’interface ne propose plus d’autoévaluation manuelle. Les tentatives sont entièrement immuables côté client, y compris `outcome`. Les anciens ressentis sont conservés sans servir de résultats d’examen. Le prompt `challenge-feedback-v3` demande une sortie stricte `{message, verdict}` : `validated` si le diagnostic, l’action et sa vérification satisfont les exigences essentielles du dossier ; `retry` sinon, en acceptant les alternatives défendables. Le serveur rejette les verdicts absents ou invalides et persiste le résultat avant de le retourner. Seule cette analyse serveur peut valider l’examen, sans score ni certification de maîtrise. Les analyses historiques sans verdict restent lisibles comme anciens retours et ne valident aucun examen.

Le callable avec le prompt v3 et les règles d’accès IA ont été déployés le 9 octobre 2026, après 121 tests applicatifs, 14 tests Functions et 9 tests de règles et transactions sur émulateur réussis. Le build et les tests ne déploient rien. Aucun ancien résultat n’est transformé ou réanalysé automatiquement.

## Installation et vérification

Depuis le dépôt : `npm --prefix functions ci`, `npm --prefix functions run build`, `npm --prefix functions test`. Le lockfile des fonctions est indépendant du frontend. Les tests métier ne font aucun appel réseau. Les tests de règles sont sous `tests/challenge-ai/` ; consulter leur configuration et lancer l'émulateur avant déploiement.

## Activation humaine

Le projet utilise Blaze. Le propriétaire a autorisé le service et son déploiement. Le secret Mistral est installé dans Secret Manager ; les paramètres privés invitent le compte propriétaire, exigent App Check et limitent les appels à 5 par compte et 25 globalement par jour UTC. Le callable est déployé avec `mistral-large-2512`, le prompt `challenge-feedback-v3` et une sortie JSON Schema stricte. Le frontend utilise App Check Enterprise. Aucun service n'est déployé par les scripts de build ou de test.

La session locale a été vérifiée après déploiement : le bilan charge les résultats du compte et les thématiques incomplètes restent verrouillées. `VITE_CHALLENGE_AI_ENABLED=true` est activé dans `.env.local` non commité. Cette vérification ne crée aucune tentative et ne déclenche aucun appel Mistral ; le verdict v3 reste à observer lors du premier examen réel débloqué. La publication du frontend sur GitHub Pages est distincte du déploiement Firebase.

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

## Compte de test réutilisable

Un compte Google dédié aux tests a été configuré le 9 octobre 2026. Son identifiant est conservé uniquement dans la configuration locale ignorée par Git ; il a le droit serveur IA et une invitation de bêta. Les cinq leçons de la thématique Tests ont été marquées artificiellement terminées pour rendre ses trois examens accessibles. Cette progression est une fixture de test, pas une mesure d’apprentissage. Les autres comptes et les quotas restent inchangés.

Pour les prochains tests, se connecter avec ce même compte Google. Ne pas supprimer les tentatives immuables ni réinitialiser les quotas ; créer une nouvelle tentative dans les limites existantes. Les données de test sont conservées dans son espace Firestore séparé. Aucun accès invité, hors ligne ou contournement de Google/App Check n’est ajouté.

Le premier test réel a enregistré une tentative sur le compte dédié. Le callable a refusé les appels : Google Auth valide, App Check absent. La clé publique Enterprise déjà configurée pour GitHub Pages a été ajoutée à `.env.local`, mais reCAPTCHA échoue sur localhost. Aucun verdict Mistral n’a été obtenu. Après autorisation explicite, un jeton App Check de développement dédié a été enregistré. La protection serveur reste activée.


Après cette configuration, deux examens réels ont été vérifiés dans le navigateur le 9 octobre 2026 : une réponse correcte au défi `tests-empty-pass-diagnostic` a reçu `validated`, et une réponse volontairement fausse au défi `tests-expiry-boundary-diagnostic` a reçu `retry`. Les verdicts sont persistés et le bilan actualisé affiche un défi validé, un à retravailler, puis recommande ce dernier. Le compteur serveur du compte de test confirme exactement deux réservations. Les 121 tests passent et le build réussit.

Pour réutiliser les tests locaux, `.env.local` conserve `MEMSTACK_APPCHECK_DEBUG_TOKEN` (sans préfixe `VITE_`). Le plugin Vite injecte ce jeton uniquement avec `npm run dev`, en mode development, et uniquement dans un navigateur sur localhost/127.0.0.1 ; le serveur écoute la boucle locale par défaut. Les builds et previews de production ne l’injectent pas. Une inspection du bundle produit confirme son absence. Ne jamais commiter, publier ou journaliser ce jeton. Son nom de ressource pour révocation est conservé dans `.npm-cache/appcheck-local-test.json`, ignoré par Git. Révoquer ce seul jeton depuis App Check lorsque les tests locaux ne sont plus nécessaires. Voir le fournisseur de débogage officiel : https://firebase.google.com/docs/app-check/web/debug-provider.

## Révisions précises et évolution des examens

Le prompt `challenge-feedback-v4` ajoute `missedCheckpointIndices` : une liste d’indices uniques de la grille de référence, vide pour `validated`, non vide pour `retry`. Le serveur vérifie strictement les champs, les bornes et la cohérence avec le verdict avant persistance. Le modèle ne génère ni URL ni identifiant de leçon. Le catalogue porte le mapping éditorial `checkpointLessonIds` ; les dossiers à une seule leçon utilisent cette association unique. Le client déduit les liens uniquement de ce catalogue. Les dossiers historiques Docker conservent leur contenu et leurs versions.

Les nouveaux retours v4 permettent une révision ciblée, une comparaison des points entre deux tentatives du même dossier et une synthèse des points à consolider par thématique. La comparaison distingue les points corrigés, encore manqués et nouveaux. Les résultats v3 gardent leur verdict et leur texte mais ne produisent pas de diagnostic précis inventé. Aucun ancien résultat n’est réanalysé automatiquement. La consultation et les comparaisons font uniquement des lectures ; les quotas existants restent inchangés.

Ces changements ont été vérifiés localement avec 134 tests applicatifs, 15 tests Functions et les builds frontend/Functions. Le service v4 est déployé le 9 octobre 2026 ; la publication frontend accompagne cette livraison. Les examens réels historiques enregistrés utilisent v3 et ne sont pas réanalysés automatiquement.
