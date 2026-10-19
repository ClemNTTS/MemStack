# Correction du retour de Mémo dans le cas de Léa — 19 octobre 2026

## Problème signalé

La réponse illustrée par le signalement indiquait déjà que Léa relit le texte et les destinataires. Elle attribuait pourtant l’envoi à l’assistant IA et niait sa capacité à retrouver « salle Bleue » dans la note fournie. L’ancien conseil demandait de relire le brouillon : il visait une étape présente et ne traitait pas les erreurs réellement écrites.

Le candidat `enterprise-practice-v12`, avec grilles v7, distingue le partage des capacités de l’étape de relecture. La mention de la note reste facultative ; la nier explicitement contredit néanmoins le cas. Un critère de relecture déjà rempli ne devient pas manquant parce qu’un autre critère est faux. Le retour conserve un seul repère prioritaire, sans liste de reproches.

## Inspection indépendante ciblée

Lecture intégrale des six réponses et retours publics de `.npm-cache/enterprise-practice-v12-regression-results.json`. Les appels fournisseur sont exécutés par le responsable de livraison, avec des réponses fictives ; l’inspecteur n’effectue aucun appel fournisseur ni modification du code ou des grilles.

| Cas synthétique | Attendu | Observé | Vérification du conseil |
| --- | --- | --- | --- |
| `lea-screenshot-two-contradictions` | `retry` | `retry` | Explique la lecture possible de la note et l’envoi à effectuer par Léa. Ne demande pas d’ajouter une relecture déjà écrite. |
| `lea-send-only-error` | `retry` | `retry` | Corrige l’envoi attribué à l’assistant IA. Le rappel sur la note est juste, sans prétendre qu’il manque dans la réponse. |
| `lea-note-only-error` | `retry` | `retry` | Corrige le refus de lecture de la note. Le rappel de l’envoi humain reste juste et ne le présente pas comme une étape manquante. |
| `lea-complete-correct` | `good` | `good` | Validation sans ajout de tâche ni de conseil inutile. |
| `lea-note-omission-allowed` | `good` | `good` | L’omission de la lecture facultative de la note ne dégrade pas une bonne réponse. |
| `lea-review-missing` | `almost` | `almost` | Seule la relecture réellement absente est proposée à compléter. |

Résultat ciblé : **6 retours exploitables sur 6, 6 statuts attendus, aucune indisponibilité et aucun défaut public observé dans ces six retours.** Le texte est bref et sans jugement sur la personne. Il ne prétend ni lire une note réelle ni envoyer un mail. Les trois cas d’erreur de capacités partagent le même rappel de confiance : ce rappel ne prétend pas diagnostiquer individuellement chaque sous-phrase, mais reste exact et pertinent pour comprendre la limite concernée.

## Version inspectée

- Modèle : `mistral-medium-2604`.
- Prompt : `enterprise-practice-v12`, empreinte `106cb861c2d43f582ad1ebd8a2aff1be13ba4cdbda9d23a0c41637a3d2132fd2`.
- Grilles : version 7, empreinte `5e5f1ea633fd8404edff1c17086f5c247fa3eb5780ff1394f4096d761e371ecf`.
- Cas pratiques : empreinte `5e15968883ac8d4ea1fe88c3145aa723f89f4e54270aa6470f0dedcb4bc332ae`.

Ces identifiants proviennent du rapport figé ; ils ne prouvent pas à eux seuls la configuration d’un service déployé.

## Verdict et limites

Contrôles d'intégration du coordinateur : `npm test` 275/275, `npm run functions:test` 89/89, builds frontend et Functions réussis. Aucun changement d'autorisation, de quota ou de stockage. L'aperçu local utilise les composants réels et le retour public du cas synthétique exécuté ; il ne simule pas une vérification sur un compte de production. La [capture du correctif](../screenshots/enterprise-memo/lea-feedback-fix.png) confirme la séparation visuelle des deux faits, sans réclamer une relecture déjà présente.

**Verdict indépendant favorable pour le candidat v12 / grilles v7**, après inspection ciblée et lecture des régressions clôturées ci-dessous. Le feu vert pédagogique ne remplace pas les contrôles techniques ni la vérification de la configuration effectivement déployée.

Ce contrôle porte sur six réponses synthétiques, sans étude auprès de salariés ni garantie sur toutes les formulations possibles. La bonne appréciation de v9 sur son ancien corpus n’avait pas couvert la combinaison apparue dans le signalement ; ces six nouveaux cas rendent cette limite visible et enrichissent la qualification sans modifier les attentes historiques pour masquer une erreur.

## Régressions clôturées

Lecture indépendante intégrale des retours publics de `.npm-cache/enterprise-practice-v12-core-results.json` et `.npm-cache/enterprise-practice-v12-supplement-results.json` : les 54 cas historiques gardent leurs statuts attendus, sans indisponibilité. Aucun faux conseil de relecture n’est réintroduit dans le cas de Léa. Les autres aides restent pertinentes et de confiance ; aucune affirmation libre d’acquis, nouveau chiffre, instruction exécutée ou reproche à la personne n’est affiché.

| Série | Retours exploitables | Statuts attendus | Indisponibilités |
| --- | --- | --- | --- |
| Six nouveaux cas Léa | 6/6 | 6/6 | 0 |
| Corpus historique | 28/28 | 28/28 | 0 |
| Complément des leçons | 26/26 | 26/26 | 0 |
| Total | 60/60 | 60/60 | 0 |

La preuve durable est conservée dans [les 60 retours synthétiques](qualification/enterprise-practice-ai-lea-fix-20261019.json). Contrôle machine supplémentaire de cette copie : chaque statut correspond à l’attente, `strengths` est vide, et chaque aide est soit vide en réussite, soit exactement une aide de la grille de la leçon concernée. Les trois séries identifient le modèle, le prompt v12 et les grilles v7 ; elles ne sont pas agrégées à des versions antérieures pour améliorer artificiellement le score.

Le responsable de livraison rapporte également les builds réussis, 275 tests applicatifs et 89 tests Functions, et confirme que les contrôles d’accès et de quotas ne changent pas. L’inspection présente est pédagogique ; elle n’a ni exécuté ces suites à sa place ni vérifié un environnement de production. Aucun déploiement n’est affirmé par ce registre.

**Feu vert pédagogique pour poursuivre le déploiement du callable IA inspecté.** Limites : les 60 cas sont synthétiques et ne couvrent pas toutes les variantes de langage ; une seule exécution de chaque cas est comptée ici, pas une étude avec 60 salariés. La correction vise la pertinence du repère affiché, sans prétendre fournir une liste exhaustive des erreurs de chaque phrase. Une appréciation nouvelle peut encore être imparfaite ; elle doit rester une aide à l’apprentissage, sans note de compétence ni écriture automatique de progression.
