# Revue indépendante des défis déterministes

Inspection du 13 octobre 2026. Revue par un agent distinct de la rédaction et de l’intégration. Lecture des 36 dossiers actifs v2, des 108 questions v3/rubric2, des options, des clés privées et du parcours de soumission. Cette revue a lu les clés ; elle ne prétend pas être une simulation aveugle de l’étudiant fort.

## Résultat

Aucun blocage détecté dans la revue statique et les contrôles ciblés. Les 36 défis ont une réponse cohérente et unique pour chacune des trois questions. Les autres options contredisent les hypothèses explicites du dossier ou ne réalisent pas le contrat demandé. Les formulations permettent les solutions alternatives dans leur famille : copie d’objet, contrôle runtime, identifiant/effet courant, auteur regroupé ou jointure, préparation ciblée éventuellement partielle. Aucun script d’élève n’est exécuté.

Le seuil est strictement supérieur à 70 %. Avec trois questions, 2/3 vaut 66,7 % : seul 3/3 réussit. L’énumération complète de 27 combinaisons par défi a vérifié 972 résultats : exactement 36 réussites, les 936 autres combinaisons sont refusées. Les fixtures fortes et faibles ci-dessous ont été rejouées avec le correcteur serveur ; elles ne remplacent pas une observation d’élèves réels.

| Défi | Revue contenu | Fixture forte | Fixture faible |
| --- | --- | --- | --- |
| docker-images-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| docker-volumes-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| docker-ports-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| fund-shared-cart-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| fund-stock-invariant-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| systems-env-process-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| http-stale-cache-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| web-fetch-error-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| web-keyboard-action-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| js-zero-default-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| js-serial-requests-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| ts-unchecked-api-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| react-mutated-list-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| react-stale-search-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| react-index-keys-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| backend-invalid-body-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| backend-payment-retry-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| backend-env-secret-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| data-left-join-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| data-transfer-atomicity-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| data-firestore-retry-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| security-object-owner-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| security-sql-concatenation-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| security-html-comment-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| tests-empty-pass-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| tests-expiry-boundary-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| tests-mock-contract-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| architecture-rule-ui-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| architecture-invalid-state-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| architecture-lost-write-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| performance-lcp-lazy-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| performance-eager-module-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| performance-nplusone-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| engineering-staged-old-version-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| engineering-semantic-conflict-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |
| engineering-stack-origin-diagnostic | 3 questions relues, clé cohérente avec dossier | 3/3 validated | 1/3 retry |

## Serveur, accès et immuabilité

Le callable exige une identité Google et App Check. Il déduit uid du token, refuse les clés supplémentaires, les versions différentes, les questions absentes ou inconnues et les sélections multiples. Le client ne transmet aucun verdict. Les clés et explications se trouvent dans le catalogue privé Functions ; aucune référence à challengeAnswerKeys ou correctOptionIds trouvée dans src/ ou public/. Les questions publiques ne contiennent que id, prompt, checkpointIndex et options.

Le serveur vérifie les prérequis dans les documents de progression de la thématique, puis réserve le budget de 20 tentatives par heure et crée résultat et tentative dans la même transaction. Le contrôle de suppression de compte précède la lecture et la création. Une répétition identique retrouve la tentative sans nouveau débit ; un changement de réponses avec le même identifiant est refusé. Les règles autorisent les lectures au propriétaire et ne permettent aucune création cliente v3 ni mise à jour/suppression des tentatives. Aucun compteur ni appel Mistral ne participe à cette correction.

Le client attend un getDocFromServer après le callable, même si son accusé est perdu, contrôle identité et contenu, puis décode les champs exacts du résultat, le seuil, les comptes et les repères manqués. Le verdict affiché provient uniquement du document serveur confirmé. Le résumé distingue la nouvelle rubrique et les historiques v1/v2 : compris historique et anciens verdicts IA ne valident pas v3. La lecture facultative des anciennes analyses peut échouer sans bloquer les nouveaux défis.

## Vérifications effectuées et limites

Les quatre tests functions/src/challengeChecks.test.mjs ont passé : alternatives autorisées, rejets de payloads forgés, répétitions concurrentes/immutabilité, prérequis/suppression/budget. L’inspection des 108 questions publiques a contrôlé leurs quatre champs exacts. Les builds complets, le navigateur et l’émulateur sont pilotés par l’agent intégrateur ; leurs résultats doivent être rapportés séparément.

Les corrections de dossier historiques restent présentes dans le bundle statique, comme avant cette migration. Les clés privées et le verdict serveur empêchent de fabriquer sa propre validation, mais ce dispositif pédagogique ne constitue pas un examen anti-triche : un élève peut lire les corrections ou mémoriser les choix après un essai. Les prérequis reposent sur le système existant de progression déclarée des leçons.

Point de maintenance signalé à l’intégrateur : actualiser docs/content/CHALLENGES.md qui décrit encore les champs libres, le rôle IA et une autoévaluation modifiable. Ajouter la syntaxe du nouveau module au build Functions serait utile, bien que les tests l’importent déjà. Aucun changement serveur déployé ni secret utilisé dans cette revue.

## Vérification finale

177 tests applicatifs et 20 tests de règles/transactions sur émulateur passent, ainsi que les builds frontend et Functions. Le décodeur client a été testé sur les résultats serveur des 36 fixtures fortes, avec des mutations de verdict, score, version, réponses et feedback refusées. Le premier dossier Docker a reçu un complément aveugle dans une session agent séparée ; ses trois choix sont corrects. La page réelle exige Google ; la sélection radio et l’activation de soumission ont été vérifiées sur le composant réel dans une prévisualisation locale isolée. Le flux authentifié complet n’a pas été exécuté dans le navigateur ; les transactions serveur sont testées sur émulateur. Aucun déploiement de production effectué.
