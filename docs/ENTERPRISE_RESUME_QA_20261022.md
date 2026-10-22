# Qualification de la reprise Entreprise — 22 octobre 2026

Relecture indépendante du lot E, après les lots A à D, contre `ENTERPRISE_RESUME_CONTRACT_20261022.md`. Cette fiche distingue les vérifications exécutées par le relecteur, les résultats communiqués par les autres membres de l'équipe et les limites de qualification.

## Audit du code

Aucun défaut bloquant résiduel établi dans le diff relu. Points examinés :

- Authentification et UID serveur, adhésion et accès organisation, marqueur de suppression, chemins privés par apprenant ; aucun paramètre permettant de lire la reprise d'un collègue.
- Transactions avec lectures avant écritures ; révision attendue, retries identiques, refus du même identifiant avec un autre payload et refus d'écrasement concurrent.
- Effacement par marqueur de révision, purge du texte à la complétion et refus des sauvegardes tardives ; absence de modification des cartes, quotas personnels ou récompenses par une reprise.
- Empreinte commune de la mission et de sa pratique, validation des étapes et réponses, refus de sauter les questions, bornes de taille, expiration logique et purge opportuniste.
- Résumés du workspace sans productions ; export et suppression du propriétaire ; fermeture des accès Firestore clients et absence d'envoi au fournisseur IA par ces callables.
- Chargement avant affichage de la session, confirmation de sauvegarde après accusé, maintien du texte en cas d'échec ou conflit, rechargement explicite de la version serveur ; aucune sauvegarde à chaque frappe.

Un défaut réel a été trouvé : la navigation interne via `pushState` pouvait démonter une mission modifiée sans déclencher `beforeunload`, puis la rouvrir depuis son ancienne reprise cloud. Correction relue : événement annulable avant les navigations internes et le changement d'organisation, confirmation dans la vue de mission, interception capture des événements historique/hash et restauration de l'URL en cas de refus. Le garde de fermeture de page reste présent. Cette protection ne constitue pas une sauvegarde automatique.

## Vérifications exécutées directement par le relecteur

- `node --test functions/src/enterpriseDraft.test.mjs src/enterprise/lessonResume.test.ts` : 10 tests réussis sur 10.
- `git diff --check` : réussi après intégration du garde de navigation.

Ces tests portent sur les états, les validations, les versions et la purge pure. Ils ne remplacent pas les tests de transactions réelles sur émulateur.

## Résultats communiqués par l'équipe

L'agent backend a communiqué : build Functions réussi ; tests unitaires Functions 95/95 ; suite Firestore CI locale 55/55 avec Firebase CLI 15.32.1 et Java 21 ; nouvelle exécution de la suite de reprise enrichie 4/4. Cette dernière couvre concurrence, perte d'accusé, effacement puis écriture tardive, complétion concurrente, expiration, changement de pratique, deux UID dans deux organisations avec quatre productions distinctes, retrait d'accès, compte désactivé ou non vérifié, abonnement inactif, règles client propriétaire/responsable/anonyme, export et suppression isolée. Ces résultats sont rapportés par l'exécutant, et n'ont pas été réexécutés par le relecteur.

Le parent a communiqué une recette navigateur locale sur les composants réels avec services fictifs : sauvegarde à l'étape 2 puis restauration après rechargement ; sauvegarde à l'étape 6 avec production à deux champs puis restauration exacte ; conflit entre deux onglets, refus de l'ancienne session et rechargement explicite de la version confirmée. La recette finale du garde de navigation et de la complétion est consignée séparément par le parent au moment de la clôture.

## Limites

Pas de panel humain de 5 à 8 personnes observé et pas de mesure de compréhension, rétention ou bénéfice commercial. Un test automatisé ou une recette par les agents ne remplace pas cette observation.

Pas de qualification de Firebase en production, des paramètres déployés, d'App Check réel ou de Stripe réel. Aucun déploiement ni changement de facturation autorisé ou exécuté dans cette qualification. La recette navigateur utilise des services fictifs ; la qualification des contrôles serveur repose sur les émulateurs.

La reprise reste disponible trente jours ; sans nouvel accès, la suppression physique à date fixe n'est pas garantie. Le retour IA, les exemples ouverts et le laboratoire d'automatisation ne sont pas restaurés, conformément au contrat et au texte affiché.

## Complément de clôture rapporté par le parent

Le parent a également enregistré puis restauré une réponse courante erronée vérifiée à l’étape 7 : la correction restait visible et Continuer restait désactivé. Les tests globaux finaux passent : 293 tests, build frontend et vérification TypeScript du harnais séparé.

Un dialogue natif de l’essai initial a bloqué les interactions du navigateur. Le correctif utilise désormais un dialogue HTML accessible, relu et compilé, avec interception annulable des liens, organisations et historique. Les parcours interactifs finaux Rester/Quitter, retour navigateur et écran de complétion restent explicitement à rejouer après déblocage ; ils ne sont pas présentés comme passés. Les transactions de complétion et de purge sont, elles, testées sur émulateur.
