# Qualification de la correction IA

## Configuration courante v7

Utiliser `callMistral` sans réimplémenter son prompt. Le premier appel retourne des booléens ordonnés ; le verdict est calculé au seuil strictement supérieur à 70 %. Le second appel fournit uniquement les explications et ne réévalue rien. Vérifier séparément les booléens, le verdict calculé, les indices et la fidélité des explications aux résultats. Une explication indisponible n’est pas un échec du verdict, mais doit être enregistrée comme une dégradation du feedback. Les observations v6 restent attachées à leur configuration et ne sont jamais présentées comme des résultats v7. Les cas actuels ont trois critères, donc un seul critère faux suffit encore à produire `retry`.

Le corpus `qualification.mjs` contient des réponses synthétiques et des décisions éditoriales définies avant les appels au fournisseur. Il ne contient aucune réponse personnelle. La version et le SHA-256 exportés figent les cas, les formulations et les attentes. Les attentes ne sont jamais envoyées au modèle.

Les critères portent sur les exigences essentielles du scénario et de la question. Le nom du conteneur et la sauvegarde ne sont pas des phrases obligatoires dans le défi des volumes ; une affirmation fausse sur ces sujets reste une contradiction technique. Une preuve pertinente peut être répartie entre les champs. Une citation niée ou présentée comme ce qu'il ne faut pas faire ne prouve pas un acquis. Les valeurs 999/1000/1001 ne sont pas obligatoires si les trois frontières sont vérifiées correctement avec d'autres valeurs ou avec des mots.

## Exécution réelle

Utiliser exactement `callMistral` et le modèle versionné de production, sans reproduire leur prompt dans un script alternatif. Chaque cas est envoyé séparément, avec son dossier de confiance et ses deux champs ; aucun lot partagé qui pourrait influencer les réponses suivantes. Ne transmettre ni nom de cas, ni catégorie, ni attente éditoriale.

Chaque analyse réserve avant le fournisseur une unité dans les compteurs compte/global et le budget conservateur prévu par le service. Une analyse à deux évaluations indépendantes réalise deux appels fournisseur, mais consomme une réservation de service. Un échec garde sa réservation ; aucun retry automatique. Respecter les droits IA, les invitations, le marqueur de cycle de vie, les plafonds globaux et le compte dédié. Ne créer aucune tentative ni analyse utilisateur pour ces qualifications. Garder les secrets en mémoire, sans journaliser leur valeur ni les enveloppes fournisseur.

Conserver pour chaque exécution un identifiant unique, un horodatage, modèle, version du prompt, version/hash du corpus, résultat, état technique et durée. Écrire le reçu de réservation avant le fournisseur ; conserver les erreurs et les divergences. Un résultat `needs_review` est sûr en cas d'incertitude, mais ne compte pas comme une réussite sémantique d'un cas dont un verdict est attendu.

## Critère de qualification

`evaluateStability` demande au moins trois exécutions complètes, avec chaque cas présent, même modèle/prompt et même corpus figé. Tous les verdicts et indices doivent correspondre aux attentes et rester identiques entre répétitions. Le taux de faux refus et de fausses validations doit être nul sur ces observations. Une nouvelle formulation ou un nouveau prompt constitue une nouvelle configuration ; les échecs précédents restent dans leur historique.

Une revue indépendante doit aussi vérifier que les états des critères et les citations expriment correctement la réponse. Les tests locaux n'établissent que la validité des contrats et du calcul des métriques ; leurs résultats attendus ne sont pas des observations Mistral.

Si seuls cinq quotas sont disponibles, faire trois répétitions de `volumes-implicit-reuse`, puis `volumes-missing-reuse` et `volumes-conflicting-fields`. Cela fournit trois observations du cas critique et deux contrôles négatifs. Ce lot partiel ne qualifie pas la stabilité du corpus complet. L'épuisement du budget arrête le test ; aucun relèvement ni reset automatique.

Même une qualification parfaite ne garantit pas 100 % des réponses futures. Elle établit une réussite observée sur un corpus et une configuration précis. Le déploiement reste soumis aux tests Functions, frontend et autorisations, à la revue du rapport réel et à la surveillance des divergences.
