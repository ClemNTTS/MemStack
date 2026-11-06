# Première leçon Entreprise : pilote conversationnel — 6 novembre 2026

## Périmètre

Uniquement `ent-answer-or-action`, « Préparer un mail avec un assistant IA ». Les autres leçons conservent leurs textes et leur présentation des messages ; la nouvelle évaluation commune est étendue à toutes les leçons Entreprise sur demande explicite. La leçon conserve sept étapes, les trois cartes, les sources, les prérequis et les bonnes options des deux questions finales. Seule l’étape de schéma `ent-answer-or-action-visual-1` est retirée à la demande du propriétaire ; les autres identifiants restent stables.

## Intention et inspection pédagogique

Les quatre messages initiaux deviennent des échanges courts : situation, choix de l'apprenant, réaction de Mémo. Deux réponses sont proposées par échange. Le premier choix décrit une habitude personnelle, sans jugement. Les autres font anticiper le résultat, l'information manquante et le partage du travail avant l'envoi. Les réactions rejoignent le même fil ; ces choix ne sont pas des évaluations et n'attribuent aucun score.

Mémo reste le guide ; l'assistant IA est explicitement un logiciel. Le prompt est expliqué à sa première utilisation. Les distinctions brouillon/envoi, lecture/modification et outils/droits sont conservées. Le cas est fictif, sans action réelle dans une messagerie. L'exercice à deux champs et les deux questions finales sont conservés ; le texte des options est raccourci sans changer leurs identifiants ni leur correction. Léa est présentée comme ta collègue ; le vocabulaire utilise document, boîte mail et des questions directement adressées à l’apprenant.

Source primaire conservée et consultée : [Building effective agents, Anthropic](https://www.anthropic.com/research/building-effective-agents). Pas de nouvel appel IA dans les échanges : les réactions sont écrites et versionnées.

## Présentation

Bulles compactes et arrondies, réponse de l'apprenant alignée à droite, surfaces translucides avec fond de lecture majoritairement opaque et effet de flou quand disponible. Les échanges antérieurs sont consultables dans un historique repliable. Les contrôles d'enregistrement restent explicites et accessibles dans « Enregistrer pour reprendre plus tard ».

## Reprise et compatibilité

Les choix utilisent les champs existants `answers` et `checkedIds`. Les validateurs client et serveur acceptent les options déclarées des messages interactifs, tout en refusant les réponses futures, inconnues ou les échanges précédents non résolus. Toute réponse déclarée est recevable pour ces échanges ; les questions finales conservent la première réponse et permettent d’avancer même après une erreur, conformément à l’évaluation serveur.

L'empreinte du contenu change uniquement pour cette leçon. Une ancienne reprise de cette leçon est invalidée par le mécanisme existant ; les leçons terminées et les cartes déjà planifiées restent acquises. Le serveur doit recevoir le nouveau catalogue avant le frontend pour préserver la cohérence des empreintes.

## Vérifications

- Comparaison au catalogue précédent : seule `ent-answer-or-action` modifiée ; cartes, sources et identifiants d'étapes préservés.
- Build frontend et Functions exécutés.
- Suite native : 298 tests réussis, incluant les deux branches conversationnelles, les reprises et le refus de sauter un échange.
- Test de transaction ajouté sur émulateur : sauvegarde/relecture réelle d'un choix, refus de sauter le suivant et conservation de la dernière reprise valide. Exécution dans les contrôles CI avant publication.

Inspection effectuée par l'agent auteur. La validation humaine du rythme, de la compréhension et du rendu reste à faire sur cette leçon pilote avant toute extension au catalogue.

## Itération demandée après recette

Un bouton ouvre une conversation fictive entre Léa et son assistant IA. Elle montre le prompt, le brouillon réellement proposé, puis le document et le brouillon complété. La fenêtre s’ouvre automatiquement après les choix pédagogiques clés, garde le focus et revient à la leçon par Échap ou son bouton de fermeture. Il ne s’agit pas d’un appel IA réel et aucun mail n’est envoyé. Le document n’est visible dans cette simulation qu’à partir de l’étape correspondante.

L’exercice du pilote n’affiche plus son point 3 : exemple commenté et appel IA, avec l’avertissement associé, sont retirés ensemble. Les autres leçons conservent leur fonctionnement et leur information avant envoi à un fournisseur IA.

Les deux questions finales enregistrent chacune une première réponse immuable. Après une erreur, la bonne réponse et son explication restent visibles pendant le passage à la question suivante. Une note totale clôt la leçon. Une nouvelle complétion exige le sans-faute ; sinon, le serveur autorise une nouvelle tentative le lendemain, heure de Paris. Voir [le contrat backend](../ENTERPRISE_BACKEND.md). À la demande explicite du propriétaire, cette règle d’évaluation s’applique à toutes les leçons Entreprise. Le visuel conversationnel et la simulation évolutive restent limités à la première leçon.

La reprise sauvegardée après l’ouverture de la nouvelle journée est restaurée même si la première réponse de la nouvelle évaluation n’a pas encore été donnée. Un conflit entre deux onglets récupère la première réponse confirmée sur le serveur et reprend la bonne question ; il ne permet pas de changer cette réponse.

Qualification de cette itération : build frontend et Functions réussis ; 312 tests natifs et 103 tests Functions réussis ; 62 tests de règles/transactions Firestore réussis sur émulateur. La conversation fictive possède ses tests de dévoilement progressif. Les tests de reprise couvrent le redémarrage sauvegardé le lendemain et les anciennes coches locales non confirmées par le nouveau système serveur.
