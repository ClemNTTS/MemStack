# Reprise explicite d’une mission Entreprise

Contrat du lot E, arrêté le 22 octobre 2026 avant intégration. Ce document décrit la réalisation locale ; aucune activation ou suppression physique automatique en production n’est déduite du code.

## Choix et données

L’apprenant choisit « Enregistrer ma reprise ». Le texte avant ce bouton précise que sa position, ses choix et sa production fictive sont envoyés dans le cloud de son organisation pour être repris sur un autre appareil. Aucun envoi automatique à chaque frappe. Utiliser uniquement les données fictives de l’exercice. La sauvegarde est facultative et ne produit ni complétion, ni XP, ni série, ni résultat d’évaluation.

Le document privé `organizations/{organizationId}/learners/{uid}/lessonDrafts/{lessonId}` conserve une révision, une empreinte de contenu, l’état, une date serveur et une échéance logique. L’état comprend exactement `{ stepId, answers, checkedIds, draft, practiceAnswers }`. Les choix des questions de leçon, leurs vérifications et le texte de l’activité sont repris. Pour `ent-plausible-not-proven`, les trois diagnostics `delay`, `fees`, `reference` sont également repris. Ni retour IA, ni exemple révélé, ni état du laboratoire d’automatisation ne sont sauvegardés ; le laboratoire repart de zéro.

L’état est borné à 5 000 caractères de texte libre et 24 000 octets JSON. Les questions, options, étapes et diagnostics sont validés contre la mission : aucune réponse future et aucune question antérieure sautée sans réponse correcte vérifiée. Les brouillons sont mutables, séparés des tentatives finales immuables. L’UID vient uniquement de Firebase Auth.

## API et versions

- `getEnterpriseLessonDraft({ organizationId, lessonId })` retourne `{ organizationId, lessonId, revision, contentVersion, state, updatedAt?, expiresAt?, notice? }`.
- `saveEnterpriseLessonDraft({ organizationId, lessonId, contentVersion, expectedRevision, mutationId, state })` retourne le même snapshot après accusé serveur. `state: null` efface la reprise.
- `getEnterpriseWorkspace` ne retourne que les résumés `{ lessonId, revision, stepId, updatedAt, expiresAt }`, jamais les productions. Le détail est lu à l’ouverture de la mission.

`contentVersion = SHA256(JSON.stringify({ lesson, practice: practices[lesson.id] ?? null }))`, dans cet ordre de propriétés, sans normalisation du JSON source. Un changement des seules consignes ou pièces de pratique invalide donc aussi la reprise. Les valeurs possibles de `notice` sont `expired`, `content-changed`, `completed`, `invalid-state`. Une absence de reprise donne `state: null`, révision zéro et aucune notice.

Une sauvegarde ne réussit que si `expectedRevision` correspond à la révision serveur. Un `mutationId` stable et une empreinte canonique de payload permettent de réessayer la dernière mutation après perte d’accusé sans écrire deux fois. Même identifiant et payload différent : refus `already-exists`. Révision concurrente différente : refus `failed-precondition`, puis choix explicite de recharger la version serveur ; aucune fusion ou écrasement automatique.

L’effacement conserve un marqueur sans texte avec une révision supérieure. Une sauvegarde lente basée sur une ancienne révision ne ressuscite pas l’état effacé. La complétion de mission efface le texte dans la transaction de progression ; les sauvegardes ultérieures d’une mission terminée sont refusées. Toutes les lectures de documents de la transaction précèdent ses écritures.

## Droits et conservation

Les callables utilisent Firebase Auth, App Check et les contrôles existants : compte actif vérifié, organisation accessible, adhésion active, droits d’apprentissage et absence de marqueur de suppression. Les prérequis sont vérifiés avant sauvegarde. Les responsables n’ont pas d’accès supplémentaire aux productions d’autres membres. Les règles clients du sous-arbre des organisations restent fermées. Aucune donnée n’est envoyée à un fournisseur IA par ces callables.

Une reprise est disponible pendant 30 jours après sa dernière sauvegarde explicite. À expiration, la lecture ou l’écriture suivante purge le texte et garde le marqueur de révision. Les versions incompatibles et reprises invalides sont également purgées à la lecture. Il n’existe pas de tâche TTL ou de nouveau service dans ce lot : sans retour dans l’application, la suppression physique des données expirées n’est pas garantie au trentième jour. L’interface doit annoncer une durée de disponibilité et ne pas promettre un effacement automatique à date fixe.

La collection `lessonDrafts` fait partie de l’export du propriétaire, et la suppression récursive du learner la retire. Une limite de sécurité séparée borne à 120 nouvelles mutations par heure et par membre/organisation ; les retries identiques ne consomment pas une seconde mutation. Aucun quota personnel ou calendrier des cartes n’est modifié.

## Recette requise

Tests de validation des états et des versions, concurrence CAS, perte d’accusé, effacement puis sauvegarde lente, complétion concurrente, expiration et purge, changement de mission ou de consigne, deux organisations/deux comptes, retrait d’accès, refus de lecture manager sur autrui, export/suppression et refus des accès Firestore directs. Recette navigateur : sauvegarde explicite, confirmation et échec, reprise après rechargement, diagnostic restauré, conflit entre deux onglets, avertissement du laboratoire et absence de collecte après simple saisie.

Qualification serveur exécutée le 22 octobre 2026 : `npm run functions:build` réussi, `npm run functions:test` 95/95 ; commande CI `emulators:exec --only firestore --project demo-memstack-challenge-ai "npm --prefix tests/challenge-ai run test:rules"` 55/55 avec Firebase CLI 15.32.1 et Java 21. La suite de reprise enrichie a ensuite été rejouée seule : `node --test tests/challenge-ai/enterpriseDraft.integration.test.mjs`, 4/4 sur émulateur. Elle couvre notamment la matrice de quatre productions distinctes (deux UID × deux organisations), compte désactivé/non vérifié, retrait d’accès et abonnement inactif, accès directs propriétaire/responsable/anonyme, export et suppression isolée. Les refus `PERMISSION_DENIED` sont attendus. Ces résultats locaux ne qualifient pas le déploiement, App Check réel ou la recette visuelle.
