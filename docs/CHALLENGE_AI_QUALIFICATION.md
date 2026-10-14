# Qualification réelle v6 — 10 octobre 2026

Le code final a été appelé directement via `callMistral`, avec le modèle versionné `mistral-large-2512`. Les essais transmettent seulement les dossiers de référence et des réponses synthétiques. Aucun verdict ou tentative utilisateur n'est créé ou modifié.

## Campagne initiale

Empreinte du correcteur : `f00ee110823d47801451ca99492bc76679f56b9c38fe402e26b3b0896772abf6`.

Corpus : `criteria-stability-2026-10-10-v1`, SHA-256 `7cfa5c679b90c7f2fae436362b57685d8a56541dae2fb9e4856078618179b23b`.

Cinq analyses, chacune réservant normalement une unité de quota et 32 000 tokens pour deux appels indépendants. Les erreurs conservent leur réservation.

| Cas | Répétitions | Décision observée | Résultat |
|---|---:|---|---|
| Réutilisation implicite et distinction anciennes/futures données | 3 | Validated à chaque essai | 3/3 attendus ; critères et preuves identiques |
| Réutilisation réellement absente | 1 | Needs review, désaccord des évaluateurs | Échec de qualification, aucun verdict pédagogique |
| Affirmations contradictoires sur la récupération | 1 | Retry, point 2 | Refus attendu |

La revue indépendante confirme les critères, citations et retours des quatre résultats complets. Les états du résultat en désaccord ne sont pas conservés dans ce premier reçu d'erreur ; sa cause précise n'est pas établie.

## Conclusion

Le faux refus signalé est corrigé sur la formulation synthétique équivalente lors de trois répétitions réelles. Le lot total obtient néanmoins **4/5 résultats attendus** : aucune qualification de stabilité ne peut être annoncée. Le désaccord est conservé comme échec, et non reclassé comme succès.

La clarification de la grille et un diagnostic des désaccords sont nécessaires avant la campagne suivante. Une nouvelle empreinte correspond à une nouvelle configuration ; les résultats précédents restent dans ce rapport. Le corpus complet de 31 cas, répété trois fois, n'a pas été exécuté. Aucun déploiement n'a été effectué.

## Seconde campagne

Correcteur : `062e12924a97f8e77924591ff4a488c53159aa80666c6caf9db64911479f6c12`. Le quota individuel a été réinitialisé avec audit, selon l'autorisation permanente ajoutée à `AGENTS.md`. Les limites globales restent appliquées.

Les trois répétitions positives valident correctement. Le contrôle d'omission produit `retry`, mais avec les indices `[1, 2]` au lieu de `[1]`. Les deux évaluations attribuent à tort une contradiction au point 2 en citant la précaution correcte « un volume peut être supprimé ; il faut aussi sauvegarder ». Leur accord ne suffit donc pas à établir la justesse sémantique.

Le plafond global empêche la cinquième analyse avant tout appel pour ce cas. Bilan : trois essais exactement corrects sur quatre exécutés, campagne incomplète et non qualifiée. La correction de ce nouveau défaut reste nécessaire ; aucun verdict historique n'a été modifié ni aucun résultat négatif supprimé.

## Clarification locale du 13 octobre 2026

La vue d’évaluation distingue désormais explicitement la persistance lors du remplacement du conteneur et les risques de suppression ou de perte du volume lui-même. Recommander une sauvegarde est une précaution correcte ; ce n’est pas une contradiction. Une réutilisation manquante ne doit pas contaminer le critère de distinction entre anciennes et futures données.

Le corpus `criteria-stability-2026-10-13-v2` ajoute une réponse complète assortie de cette précaution. Les résultats des campagnes précédentes restent attachés au corpus v1 et à leurs empreintes.

Un lot réel de trois réponses synthétiques a été exécuté le 13 octobre avec `callMistral` et `mistral-large-2512`, empreinte du correcteur `8edf32c6e46e58b56c6fb736b0bc7e3d2865349672bd96b1ba6748041a3e3c54`. Les quotas normaux ont été réservés avant chaque analyse, sans réinitialisation. L’omission de réutilisation reçoit `retry [1]`, la contradiction sur la récupération reçoit `retry [2]`, la réponse complète avec précaution de sauvegarde reçoit `validated []`. Les trois résultats correspondent exactement aux attentes. Ce lot ne mesure pas la stabilité par répétition et ne qualifie pas le corpus complet.

La lecture serveur des tentatives réelles a été effectuée sans modifier leur historique. L’envoi de deux réponses au fournisseur, sans nom, email ni identifiant de compte, a ensuite été explicitement autorisé par le propriétaire.

## Essais sur réponses réelles et références d’extraits

Avec la configuration `8edf32c6e46e58b56c6fb736b0bc7e3d2865349672bd96b1ba6748041a3e3c54`, le premier lot réel produit un retour invalide et un refus au checkpoint d’action. Deux essais diagnostiques supplémentaires produisent des citations invalides ; ils ne remplacent pas les échecs précédents. Les diagnostics anonymisés montrent des citations reformulées et une confusion autour du nom du volume.

La configuration suivante, `15205bd5b16dd66e920f6ff39cd5715a6c67b13395c30f293d45578eb72c8b09`, fournit des extraits numérotés au modèle ; le serveur reconstitue les citations depuis les références contrôlées. Elle précise la différence entre nom du volume et nom du conteneur. Les deux réponses réelles obtiennent chacune `validated []` lors d’un essai. Le lot de contrôles donne :

| Cas synthétique | Attendu | Observé |
|---|---|---|
| Réutilisation omise | `retry [1]` | `validated []` : fausse validation |
| Récupération contradictoire | `retry [2]` | `retry [2]` |
| Réponse complète et précaution de sauvegarde | `validated []` | `validated []` |

Cette configuration obtient donc **4/5 résultats attendus**, sans répétitions complètes. Elle n’est pas qualifiée : la fausse validation bloque le push demandé sous condition de confiance. Aucun déploiement, aucune réécriture de tentative ou d’analyse historique n’a eu lieu. Les réponses réelles et leurs citations ne sont pas incluses dans ce rapport ni dans le dépôt.

Deux réinitialisations du seul quota individuel du compte dédié ont été enregistrées dans `_maintenanceAudit` le 13 octobre, avec les anciennes valeurs 5 puis 4, la date et le motif de qualification. Les limites globales et les autres comptes restent inchangés. Les douze réservations de ces lots représentent 384 000 tokens conservateurs ; une réservation supplémentaire porterait le total à 416 000 et dépasserait la limite configurée de 400 000. La qualification s’arrête donc sans augmenter les limites.

## Nouvelle méthode v7 — contrats locaux uniquement

À la demande du propriétaire, v7 évalue les critères en booléens, calcule le seuil strictement supérieur à 70 % côté serveur, puis demande une explication séparée. Les tests couvrent 7/10 refusé, 8/10 validé, 2/3 refusé, 3/3 validé et 3/4 validé avec un point manqué. Ils vérifient aussi les tableaux incomplets, les faux booléens, une tentative de changement de verdict par l’explication et le maintien de la décision quand cette explication échoue. Le client conserve les indices manqués sur un succès v7 et continue à lire les versions historiques.

Les 168 tests applicatifs et contrats, dont 30 tests Functions, ainsi que les builds frontend et Functions passent. Les premiers appels v7 ont ensuite été réalisés après une réinitialisation globale exceptionnelle explicitement autorisée ; leurs résultats sont détaillés ci-dessous. Les résultats réels v6 ci-dessus ne sont pas des résultats v7.

## Campagne fournisseur v7 après autorisation exceptionnelle

Le 13 octobre, le propriétaire a explicitement autorisé une remise à zéro exceptionnelle du quota global pour continuer les essais. Une transaction Admin a enregistré dans `_maintenanceAudit` les anciennes valeurs (12 requêtes, 384 000 tokens réservés), les nouvelles valeurs (0 et 0), la date et le motif. Les paramètres de quota et les plafonds de dépenses Mistral sont inchangés ; cette exception ne crée pas une autorisation permanente. Le seul quota individuel du compte dédié a été réinitialisé avec audits, anciennes valeurs 3, 4 puis 5.

Configuration `f31341af5520dbf51ffc8b3d24a80f9373fed5efa1c81b7c6d7a8fbe0de6d026`, modèle `mistral-large-2512`, corpus v2 :

| Cas | Observations | Correspondance exacte |
|---|---|---|
| Première réponse réelle | `validated []` trois fois | 3/3 |
| Seconde réponse réelle | Deux `validated []`, puis `retry [1]` | 2/3 : faux refus et instabilité |
| Réutilisation omise | `retry [1]` | Attendu |
| Récupération contradictoire | `retry [1]` au lieu de `[2]` | Verdict attendu, mauvais critère |
| Réponse complète et précaution de sauvegarde | `validated []` | Attendu |

Bilan : **7/9 résultats exactement attendus**. Toutes les explications ont été reçues avec le contrat attendu ; leur qualité sémantique n’a pas été indépendamment qualifiée. L’explication ne change aucun verdict. Le corpus complet n’a pas été exécuté.

Une grille des volumes plus courte et distinguant les critères a ensuite été évaluée, configuration `9587cc097c4b188a2198cb601bfab33c9172169d6a8f3f35b58fa09e7c10a612` :

| Cas | Attendu | Observé |
|---|---|---|
| Seconde réponse réelle | `validated []` | `retry [2]` : faux refus |
| Récupération contradictoire | `retry [2]` | `retry [2]` |
| Réutilisation omise | `retry [1]` | `validated []` : fausse validation |

Bilan : **1/3 résultats attendus**, configuration non qualifiée. Aucun push ou déploiement n’est effectué comme correction fiable. Les tentatives, analyses et réponses historiques restent intactes ; aucun texte personnel n’est ajouté au dépôt. Les douze nouvelles réservations atteignent 384 000 tokens conservateurs après l’exception ; une nouvelle analyse dépasserait à nouveau la limite quotidienne configurée. Aucun second reset global n’est effectué.
