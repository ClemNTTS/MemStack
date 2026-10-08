# Inspection indépendante des défis — lot B

Inspection du 8 octobre 2026, par un agent distinct de l’auteur des nouveaux dossiers. Périmètre prévu : DevOps, sécurité, tests, architecture, performance et pratiques de développement. Aucun appel Mistral ni autre fournisseur n’est effectué dans cette inspection ; le jugement porte sur les dossiers statiques, pas sur la qualité du retour généré.

## Contrôle indépendant préalable des corrections du lot A

Les six corrections ont été lues dans le diff et confrontées au contexte du dialogue et au rapport A. Verdict : pertinentes et cohérentes. Ordre d’insertion de Set/Map distinct des positions indexées ; await reprend par continuation asynchrone même pour une promesse accomplie ; largeur de boîte 200 + marges horizontales 20 = 220 ; clé étrangère nullable distincte d’un identifiant absent ; restart conserve le conteneur ; un nouveau montage ne migre pas la couche inscriptible de l’ancienne instance. Aucun changement d’ID ni de transition observé. Le rapport A doit préciser que son constat « registre vide » concerne la lecture initiale si les corrections sont ensuite converties dans le registre.

## Méthode

Lire situation, fichiers, prompt, correction, repères, contre-exemples, alternatives et références. Vérifier qu’un apprenant peut retrouver les causes dans les pièces sans deviner une hypothèse cachée, que les actions résolvent ces causes, que la vérification établit un résultat observable et que les alternatives valables ne sont pas traitées comme erreurs. Les scénarios d’un thème doivent exercer des décisions différentes.

## Registre

| Dossier v2 | Verdict et contrôle |
| --- | --- |
| `docker-images-diagnostic` | Conforme : v1 inspectée, correctif confirmé dans v2, absence de montage code explicite ; recréation et protection des données ; Compose accepté. |
| `docker-volumes-diagnostic` | Conforme : suppression sans montage et absence de copie documentées ; volume au bon chemin et réutilisation ; persistance future sans récupération magique ; bind mount accepté. |
| `docker-ports-diagnostic` | Conforme : Linux/bridge/DNS/0.0.0.0 explicites ; 8080 hôte/3000 API ; loopback et localhost par environnement ; correction de configuration worker suffisante. |
| `security-object-owner-diagnostic` | Fond conforme : pièce Alice/Bob prouve accès par objet absent ; refus à l’autorité et tests à deux comptes ; filtrage propriétaire alternative correcte. |
| `security-sql-concatenation-diagnostic` | Fond conforme : apostrophe et concaténation visibles ; paramètres pilote et ORM paramétré acceptés ; noms SQL distincts des valeurs. |
| `security-html-comment-diagnostic` | Fond conforme : innerHTML et gestionnaire onerror visibles ; produit texte brut, textContent/rendu texte framework adaptés ; pas de simple blacklist script. |
| `tests-empty-pass-diagnostic` | Fond conforme : fonction retourne prix inchangé et test sans assertion ; résultat 90, cycle échec/réussite et table de cas pertinents. |
| `tests-expiry-boundary-diagnostic` | Conforme après correction : contrat invalide à l’égalité, `<` et temps injecté ; cas partiel ne propose plus de vérification et ne reçoit plus ce crédit. |
| `tests-mock-contract-diagnostic` | Conforme après correction : tableau faux distinct de réel `{items}` ; alternative précise lecture de items et fixture locale valide/invalide/erreur. |
| `architecture-rule-ui-diagnostic` | Conforme : 100 inclus et deux calculs divergents, fonction partagée ou autorité serveur, tests des consommateurs ; source Fowler remplacée par une page accessible et vérifiée. |
| `architecture-invalid-state-diagnostic` | Fond conforme : spread conserve loading, une soumission explicitement unique ; état/reducer ou transitions booléennes garantissant invariant admis. |
| `architecture-lost-write-diagnostic` | Conforme après correction : copies v7 et écrasement visible, version comparée atomiquement et conflit ; alternative ETag/If-Match exige explicitement atomicité et conflit signalé. |
| `performance-lcp-lazy-diagnostic` | Conforme après correction : découverte 120 ms mais requête 1200 ms, lazy sur élément LCP visible ; alternative chargement immédiat et priorité ciblée avec mesures et contrôle des autres ressources. Preload reste conditionné à une découverte tardive, absente ici. |
| `performance-eager-module-diagnostic` | Fond conforme : gros import réservé au bouton et 600/820 Ko attribués ; chargement différé, échec UI et premier/deuxième export ; coût reporté explicitement. |
| `performance-nplusone-diagnostic` | Fond conforme : 51 voyages pour 50 lignes ; batch/jointure bornés, conservation pagination et auteurs absents ; simple concurrence ne supprime pas N+1. |
| `engineering-staged-old-version-diagnostic` | Fond conforme : index v1/travail v2 explicites, préparation ciblée et vérification commit ; pas de réécriture forcée d’un commit partagé. |
| `engineering-semantic-conflict-diagnostic` | Conforme après correction : deux obligations compatibles et une perdue ; alternative réorganise explicitement les deux validations puis vérifie chacune et leur combinaison. |
| `engineering-stack-origin-diagnostic` | Conforme après correction : name absent, point d’échec distinct de propagation ; alternative diagnostic suivi d’un rejet/repli selon contrat et de tests de profils complets/absents. |

## Cas qualitatifs et demandes de correction

Les **90 cas des 18 dossiers** ont été lus avec leurs attentes, puis les modifications ont été relues. Les cinq familles sont présentes par dossier : correcte, partielle, fausse, alternative et instruction injectée. Les trois dossiers Docker conservent leurs réponses originales variées ; les 30 réponses correctes et alternatives des 15 nouveaux dossiers de ce lot ont été paraphrasées et décrivent désormais des actions concrètes. Les questions des 15 dossiers sont personnalisées sur leurs pièces et décisions distinctes.

Demandes de première passe, toutes résolues et relues dans la version finale :

- Personnaliser les 15 prompts nouveaux du périmètre : l’unique question générique répétée est incompatible avec la recherche de diversité demandée. Un même formulaire est utile ; la décision du scénario mérite sa question propre.
- `tests-expiry-boundary-partial` : ne pas reprocher l’absence de 999/1000/1001 lorsque « juste avant, exactement, juste après avec temps injecté » décrit déjà les mêmes tests. Rendre le cas vraiment partiel ou retirer cette omission.
- `performance-lcp-lazy-alternative` : proposer une intervention réelle, telle que `loading="eager"` et priorité ciblée, plutôt qu’une remarque conditionnelle sur preload alors que la découverte est précoce.
- `architecture-lost-write-alternative` : conditionner toute fusion à un conflit signalé, ou choisir explicitement ETag/If-Match ; ne pas contredire le contrat fourni.
- Rendre les alternatives de test de contrat, diagnostic par breakpoint et clarification de fusion plus concrètes avant de les créditer comme correction exhaustive. Préférer des paraphrases d’élève aux sentences conditionnelles copiées du corrigé.

Les instructions injectées sont identiques dans les 15 nouveaux dossiers mais volontairement ciblées sur une même frontière de confiance ; cette répétition du jeu technique n’est pas une question affichée à l’apprenant. Elles ne reçoivent pas de crédit pour une action ou vérification absente. Aucun appel fournisseur n’a été réalisé : ces attentes n’attestent pas du comportement réel de Mistral.

## Sources consultées

Consultation du 8 octobre 2026 : [autorisation OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [injection SQL OWASP](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html), [XSS OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [tests Node](https://nodejs.org/api/test.html), [versioned value](https://martinfowler.com/articles/patterns-of-distributed-systems/versioned-value.html), [optimisation LCP](https://web.dev/articles/optimize-lcp), [import dynamique](https://web.dev/articles/code-splitting-with-dynamic-imports-in-nextjs), [jointures PostgreSQL](https://www.postgresql.org/docs/current/tutorial-join.html), [EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html), [git add](https://git-scm.com/docs/git-add), [git merge](https://git-scm.com/docs/git-merge), [erreurs Node](https://nodejs.org/api/errors.html). L’article de découpage vise Next.js mais son mécanisme import dynamique n’impose pas ce framework à l’extrait donné. Les sources Docker ont aussi servi au contrôle du catalogue décrit dans le rapport B.

La page Fowler `PresentationDomainDataSeparation` initialement citée a retourné une erreur de chargement. Elle a été remplacée par [Presentation Domain Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html), ouverte et vérifiée lors de la relecture finale. Les calculs, exemples de tests et contrats spécifiques des dossiers restent des situations pédagogiques originales.

Verdict final : **18 dossiers et 90 cas inspectés et validés sur le contenu statique**, sans réserve matérielle ouverte. Les trois scénarios de chaque thème sollicitent des capacités distinctes. Les 15 questions nouvelles sont contextualisées et les réponses correctes et alternatives reformulées. La dernière relecture confirme les attentes du cas partiel de frontière temporelle et l’alignement de la grille LCP avec son alternative mesurée. Aucun appel fournisseur ni test automatisé supplémentaire n’a été exécuté par cet agent ; les vérifications globales sont coordonnées par le responsable. La qualité pédagogique réelle des retours Mistral reste à évaluer avec des réponses d’apprenants.
