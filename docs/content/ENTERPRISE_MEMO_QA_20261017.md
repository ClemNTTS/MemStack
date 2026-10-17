# Inspection indépendante — conversation avec Mémo

Date : 17 octobre 2026. Périmètre : les 40 propositions de leçons Enterprise des lots foundations, projects et practice, leurs activités, questions, feedbacks et 120 cartes. Baseline : fichiers de travail memo-curriculum-before.json et memo-practices-before.json. Workflow lu : docs/content/WORKFLOW.md.

## Critères et résultat

Lecture éditoriale de chaque introduction, message, consigne, scénario, exemple et explication ; vérification de la cohérence avec les choix proposés, leurs corrections et les cartes. Mémo accompagne le lecteur ; l’assistant IA utilisé par les personnages reste un outil distinct. Les cas familiers introduisent les termes avant les exercices, avec paragraphes courts et analogies utiles. Aucun blocage factuel ou pédagogique identifié dans ce périmètre après les précisions ci-dessous.

Le contrôle structurel comparé à la baseline conserve les 40 identifiants de leçons, tous les IDs/types/ordres des étapes, les IDs des 120 cartes, tous les IDs des options et réponses correctes, les sources, documents, durées, chapitres et autres métadonnées. Les propositions modifient le texte ; elles ne créent pas d’autorisation technique ou de nouvelle intégration.

## Corrections demandées et fournies

- ent-agents-permissions : la carte sur la limite de recherche pouvait présenter un document non retrouvé comme un document absent. La correction garde cette incertitude et le bilan à Sami.
- Six missions assistants : raccourcissement du rappel commun de fin d’activité, en gardant la rédaction dans MemStack, la comparaison, les pièces fictives, l’absence d’appel externe et le transfert facultatif.
- Six missions automatisation : retrait de répétitions dans la consigne commune ; tous les livrables, résultats à observer, référent, outil autorisé, données fictives et caractère facultatif de l’essai extérieur sont conservés. Aucune automatisation réelle ni achat requis ici.
- Le dernier atelier projets conserve volontairement ses deux livrables : reprise Lanterne et synthèse Cyprès. Le raccourcir au détriment de cette synthèse diminuerait la valeur pédagogique du parcours.

Les objets complets corrigés figurent dans .npm-cache/memo-qa-fixes.json ; ils doivent être intégrés après les propositions des auteurs.

## Interactions existantes

ReturnPolicyPractice et la leçon ent-plausible-not-proven concordent : délai de 30 jours, frais uniquement si produit endommagé, note RET-2026-14 absente des pièces. Les trois diagnostics attendus et le brouillon corrigé sont cohérents.

AutomationFlowPractice et ent-automation-exceptions concordent : même INT-88 déjà créée, notification seule à reprendre, au plus deux nouvelles tentatives espacées après l’échec initial puis alerte ; INT-89 sans adresse reste à compléter sans création. Le laboratoire est explicitement fictif et ne démontre pas la protection réelle contre les traitements simultanés. La leçon réserve cette confirmation au référent.

## Registre exhaustif

| Leçon | Verdict |
| --- | --- |
| `ent-plausible-not-proven` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-answer-or-action` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-minimum-data` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-approved-tool` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-hostile-document` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-useful-request` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-context-rag` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-iterate-examples` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-verify-claims` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-numbers-sources` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-human-escalation` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-right-tool` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-environment-cost` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-problem-before-solution` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-agents-permissions` | Validée ; carte précisée : recherche sans résultat ≠ document absent. |
| `ent-accountable-project` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-test-representative` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-measure-incident` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-decision-dossier` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-continue-learning` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-meeting-notes` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-new-model-review` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-projects-outcome` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-projects-specification` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-projects-prototype` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-projects-iteration` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-projects-release` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-projects-maintenance` | Validée ; contexte, progression, activité, questions et cartes cohérents. |
| `ent-assistants-brief` | Validée ; consigne finale allégée sans retirer livrables ni limites du transfert facultatif. |
| `ent-assistants-documents` | Validée ; consigne finale allégée sans retirer livrables ni limites du transfert facultatif. |
| `ent-assistants-meeting` | Validée ; consigne finale allégée sans retirer livrables ni limites du transfert facultatif. |
| `ent-assistants-options` | Validée ; consigne finale allégée sans retirer livrables ni limites du transfert facultatif. |
| `ent-assistants-iterate` | Validée ; consigne finale allégée sans retirer livrables ni limites du transfert facultatif. |
| `ent-assistants-team-playbook` | Validée ; consigne finale allégée sans retirer livrables ni limites du transfert facultatif. |
| `ent-automation-map` | Validée ; consigne finale allégée sans retirer livrables ni limites du transfert facultatif. |
| `ent-automation-select` | Validée ; consigne finale allégée sans retirer livrables ni limites du transfert facultatif. |
| `ent-automation-data-contract` | Validée ; consigne finale allégée sans retirer livrables ni limites du transfert facultatif. |
| `ent-automation-exceptions` | Validée ; consigne finale allégée sans retirer livrables ni limites du transfert facultatif. |
| `ent-automation-pilot` | Validée ; consigne finale allégée sans retirer livrables ni limites du transfert facultatif. |
| `ent-automation-handover` | Validée ; consigne finale allégée sans retirer livrables ni limites du transfert facultatif. |

## Limites

Cette inspection est celle d’un agent indépendant, pas une étude auprès de salariés ni une mesure de compréhension réelle. Elle ne remplace pas l’observation de lecteurs débutants. Le ton conversationnel, la longueur et la cohérence sont relus sur les sources ; la validation du rendu dans l’interface, les tests et le build relèvent de l’intégration. Les sources primaires existantes sont conservées ; aucune nouvelle affirmation externe ni nouvelle source n’est ajoutée par ces corrections.
