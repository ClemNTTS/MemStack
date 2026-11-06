# Première leçon Entreprise : pilote conversationnel — 6 novembre 2026

## Périmètre

Uniquement `ent-answer-or-action`, « Préparer un mail avec un assistant IA ». Les autres leçons conservent leur contenu et leur présentation. Les huit étapes, leurs identifiants, les trois cartes, les sources, les prérequis et les bonnes options des deux questions finales restent stables.

## Intention et inspection pédagogique

Les quatre messages initiaux deviennent des échanges courts : situation, choix de l'apprenant, réaction de Mémo. Deux réponses sont proposées par échange. Le premier choix décrit une habitude personnelle, sans jugement. Les autres font anticiper le résultat, l'information manquante et le partage du travail avant l'envoi. Les réactions rejoignent le même fil ; ces choix ne sont pas des évaluations et n'attribuent aucun score.

Mémo reste le guide ; l'assistant IA est explicitement un logiciel. Le prompt est expliqué à sa première utilisation. Les distinctions brouillon/envoi, lecture/modification et outils/droits sont conservées. Le cas est fictif, sans action réelle dans une messagerie. L'exercice à deux champs et les deux questions finales sont conservés ; le texte des options est raccourci sans changer leurs identifiants ni leur correction.

Source primaire conservée et consultée : [Building effective agents, Anthropic](https://www.anthropic.com/research/building-effective-agents). Pas de nouvel appel IA dans les échanges : les réactions sont écrites et versionnées.

## Présentation

Bulles compactes et arrondies, réponse de l'apprenant alignée à droite, surfaces translucides avec fond de lecture majoritairement opaque et effet de flou quand disponible. Les échanges antérieurs sont consultables dans un historique repliable. Les contrôles d'enregistrement restent explicites et accessibles dans « Enregistrer pour reprendre plus tard ».

## Reprise et compatibilité

Les choix utilisent les champs existants `answers` et `checkedIds`. Les validateurs client et serveur acceptent les options déclarées des messages interactifs, tout en refusant les réponses futures, inconnues ou les échanges précédents non résolus. Toute réponse déclarée est recevable pour ces échanges ; les questions finales gardent l'obligation de retrouver la bonne réponse.

L'empreinte du contenu change uniquement pour cette leçon. Une ancienne reprise de cette leçon est invalidée par le mécanisme existant ; les leçons terminées et les cartes déjà planifiées restent acquises. Le serveur doit recevoir le nouveau catalogue avant le frontend pour préserver la cohérence des empreintes.

## Vérifications

- Comparaison au catalogue précédent : seule `ent-answer-or-action` modifiée ; cartes, sources et identifiants d'étapes préservés.
- Build frontend et Functions exécutés.
- Suite native : 298 tests réussis, incluant les deux branches conversationnelles, les reprises et le refus de sauter un échange.
- Test de transaction ajouté sur émulateur : sauvegarde/relecture réelle d'un choix, refus de sauter le suivant et conservation de la dernière reprise valide. Exécution dans les contrôles CI avant publication.

Inspection effectuée par l'agent auteur. La validation humaine du rythme, de la compréhension et du rendu reste à faire sur cette leçon pilote avant toute extension au catalogue.
