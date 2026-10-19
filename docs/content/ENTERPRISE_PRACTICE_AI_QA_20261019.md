# Inspection indépendante des retours IA des ateliers Entreprise — 19 octobre 2026

**Verdict final : favorable pour le candidat backend v9, grilles v4 et modèle `mistral-medium-2604`.** Les 54 cas synthétiques, couvrant les 40 leçons, ont été exécutés deux fois sans modification : 108 retours exploitables, 108 statuts attendus et aucun défaut pédagogique observé dans les retours publics relus. Le détail et les limites de ce feu vert figurent en fin de registre ; les refus des anciens candidats restent conservés ci-dessous.

## Périmètre et méthode

Relecture des 40 situations, tâches, checklists, exemples et explications de `src/data/enterprisePractices.json`, puis des introductions pratiques et du contexte des leçons dans `shared/enterpriseCurriculum.json`. La grille privée `shared/enterprisePracticeRubrics.json` précise pour chaque ID deux à cinq objectifs essentiels et des repères facultatifs ; elle ne doit jamais être importée dans le navigateur. Ce fichier est une instruction d’évaluation pédagogique, pas un corrigé à faire recopier.

Une réponse est réussie lorsque les idées essentielles sont présentes, même brièvement ou implicitement sans ambiguïté. Les fautes, le style, la mise en page, les titres, les mots exacts de l’exemple et les détails secondaires ne doivent pas dégrader la réussite. Une omission importante appelle une aide pour compléter ; une contradiction de la situation appelle une reprise accompagnée. Il n’y a ni note chiffrée ni jugement sur la personne.

Cette inspection par agents n’est pas une étude auprès de salariés. Elle ne prouve ni une compréhension réelle des utilisateurs ni une fiabilité absolue de la correction IA. Aucun appel fournisseur, donnée de salarié ou déploiement n’a été réalisé par cet inspecteur. La qualification réelle du modèle, ses résultats, le build et les contrôles d’autorisation sont à consigner par le responsable de livraison.

## Corrections et points de vigilance transmis

1. **Ne pas transformer la checklist en barème mot à mot.** Les 40 grilles distinguent l’essentiel du facultatif. Pour Léa, le partage préparation/envoi est central ; retrouver la salle et regarder les messages envoyés sont des compléments. Pour le rendez-vous client, créneaux et échéance sont centraux ; objet, six lignes et ton sont des détails de forme.
2. **Chaque scénario fait foi.** Les politiques de retour, personnes, dates, seuils et accès ne doivent pas être empruntés à une autre mission. Les trente jours d’un cas ne deviennent pas une règle réelle générale.
3. **L’exemple ne corrige pas forcément toute la tâche.** Dans `ent-plausible-not-proven`, l’exemple contient uniquement le message client ; le diagnostic des trois affirmations reste aussi nécessaire. Le serveur doit donc évaluer les critères essentiels et non mesurer une ressemblance à l’exemple. Le navigateur assemble diagnostic et brouillon pour la soumission.
4. **Éviter un changement de tâche implicite.** Un prompt doit rester un prompt ; une proposition n’est pas un rendez-vous confirmé ; un livrable attendu n’est pas un achèvement annoncé. Les quatre catégories de compte rendu doivent rester distinctes.
5. **Garder l’exercice fictif.** Ne jamais exiger une preuve d’exécution, un compte externe, une technologie précise, des identifiants personnels ou un vrai envoi. L’IA donne un retour sur un plan écrit, pas sur une opération réellement exécutée.
6. **Les contenus hostiles sont parfois l’objet de l’exercice.** Une citation de l’ordre hostile en vue de l’écarter est correcte. Une instruction ajoutée à une réponse autrement correcte ne doit ni être exécutée ni suffire à invalider les acquis ; une injection seule ne réalise pas la tâche.
7. **Nettoyer les mentions antérieures.** Les anciennes introductions des six missions assistants indiquent encore qu’aucune IA externe n’est appelée ; cette affirmation doit disparaître avec la nouvelle feature. Les invitations à comparer manuellement peuvent rester comme secours, mais ne doivent pas nier le retour IA. Point transmis au responsable de livraison ; les introductions sont masquées dans la vue lors de la revue.
8. **Versionner les critères privés dans le cache.** Le hash public du cas ne suffit pas si seule la grille privée évolue. Le cache serveur doit distinguer le hash de la grille ou sa version afin de ne pas ressortir une ancienne appréciation.

## Registre exhaustif des 40 ateliers

Toutes les lignes ci-dessous ont été inspectées. « Aligné sous grille » signifie que les critères privés explicitent les attentes et limites ; cela ne signifie pas que le fournisseur IA a été testé sur toutes ces réponses.

| Leçon | Objectif central vérifié | Piège évité / liberté conservée | Verdict de relecture |
| --- | --- | --- | --- |
| `ent-plausible-not-proven` | Diagnostiquer les trois annonces : soixante jours et gratuité générale sont contredits, la référence RET-2026-14 n’est pas vérifiable dans les pièces. | Reproduire exactement l’exemple, qui ne contient que la partie client et ne constitue pas à lui seul le corrigé de toute la tâche. | Aligné sous grille |
| `ent-answer-or-action` | Distinguer la préparation du brouillon par l’assistant IA de l’envoi que Léa doit faire elle-même. | Retrouver la salle dans la note. | Aligné sous grille |
| `ent-minimum-data` | Préparer un cas de brouillon sans transmettre le nom, l’adresse ni le numéro de commande inutiles à cette tâche ; les citer comme éléments retirés est correct. | Reprendre les rubriques exactes. | Aligné sous grille |
| `ent-approved-tool` | Distinguer l’autorisation connue, limitée aux documents fictifs dans l’espace professionnel avec comptes nominatifs, des garanties non établies par la publicité. | Lister intégralement conservation, suppression, réutilisation et sous-traitants si l’incertitude sur les garanties est claire. | Aligné sous grille |
| `ent-hostile-document` | Séparer le besoin du colis cassé de l’ordre d’exporter les autres demandes ; une citation de l’ordre hostile pour l’analyser est correcte. | Nommer Sami dans chaque ligne. | Aligné sous grille |
| `ent-useful-request` | Écrire un prompt pour préparer un mail proposant une visioconférence à Camille sur son prochain projet, sans le présenter comme un rendez-vous déjà confirmé. | Nommer Studio Rivage. | Aligné sous grille |
| `ent-context-rag` | Utiliser SEPT comme règle actuelle : trente jours et frais couverts seulement pour dommage ; marquer JAN et ses soixante jours comme remplacés. | Employer RAG ou une terminologie technique. | Aligné sous grille |
| `ent-iterate-examples` | Ajouter une consigne sur la prochaine étape conforme à la procédure sans modifier les cas ou la règle. | Présenter un tableau ou un score de deux sur trois. | Aligné sous grille |
| `ent-verify-claims` | Repérer que retour accepté et remboursement demain ne sont pas établis dans le dossier. | Trois lignes formelles si les trois annonces sont bien traitées. | Aligné sous grille |
| `ent-numbers-sources` | Inclure la relecture : 200 minutes gagnées par semaine avec une minute de relecture et 200 minutes perdues avec trois ; 3 h 20 est équivalent. | Écrire toutes les multiplications si les bons résultats et unités sont clairs. | Aligné sous grille |
| `ent-human-escalation` | Faire de la blessure le déclencheur du passage à Nora, hors essai sur les retours simples. | Recopier B4 ou le montant dans le message client. | Aligné sous grille |
| `ent-right-tool` | Proposer pour date, passage et ton une solution et un essai concret, avec une alternative simple. | Choisir exactement les mêmes outils que l’exemple ; des solutions cohérentes différentes conviennent. | Aligné sous grille |
| `ent-environment-cost` | Distinguer 210 € mensuels et 240 € de démarrage : premier mois 450 €, au-dessus de l’alerte de 400 et sous le plafond de 500. | Lister intégralement les renseignements à demander au fournisseur. | Aligné sous grille |
| `ent-problem-before-solution` | Cadrer le problème réel des retours simples et de la recherche de politique, avant de choisir un chatbot. | Proposer les mêmes seuils de suspension que l’exemple, qui les présente sous réserve de validation. | Aligné sous grille |
| `ent-agents-permissions` | Limiter l’agent à lire P et D8 et créer un brouillon relu par Sami ; aucun envoi, remboursement ou autre dossier. | Décrire un mécanisme technique ou un journal avec tous les champs de l’exemple. | Aligné sous grille |
| `ent-accountable-project` | Attribuer périmètre, accès et bilan à des personnes identifiées et à des pièces vérifiables, avec décision de suite de Nadia. | Imposer exactement trois phrases ou actions numérotées. | Aligné sous grille |
| `ent-test-representative` | Prévoir les six comportements : retour intact à J5 possible ; dommage avec photo reconnu ; J35 hors délai ; dommage sans photo à compléter ; règles contradictoires vers Nadia ; ordre hostile écarté sans approbation inventée. | Employer un tableau formel. | Aligné sous grille |
| `ent-measure-incident` | Calculer cinq minutes avec IA, une minute gagnée par cas et cinquante minutes sur le lot. | Calculer une rentabilité monétaire, impossible sans valorisation du temps. | Aligné sous grille |
| `ent-decision-dossier` | Garder visibles les quarante cas standards réussis et les deux promesses non autorisées sur les dix hors périmètre. | Exactement cinq phrases. | Aligné sous grille |
| `ent-continue-learning` | Planifier quatre rendez-vous de dix minutes, avec révision, nouvelle mission et essai fictif. | Répartir chaque séance exactement comme l’exemple. | Aligné sous grille |
| `ent-meeting-notes` | Séparer proposition de réponse automatique, condition d’accord sécurité, absence de décision de lancement et action de Léa jeudi. | Les quatre intitulés exacts si les quatre statuts sont clairs. | Aligné sous grille |
| `ent-new-model-review` | Garder A car les deux omissions de B violent le seuil zéro malgré sa rapidité. | Choisir le même nouveau cas que l’exemple. | Aligné sous grille |
| `ent-assistants-brief` | Écrire un prompt d’accueil aux douze collègues lundi à 9 h en salle Pin. | La limite de cent vingt mots vient de l’exemple, pas d’une obligation. | Aligné sous grille |
| `ent-assistants-documents` | Préparer un prompt et une synthèse appuyée sur demande, catalogue et logistique. | Un tableau ou exactement quatre lignes. | Aligné sous grille |
| `ent-assistants-meeting` | Préparer un prompt et un relevé séparant décision d’essai lundi, grille par Zoé jeudi, proposition samedi et bilan non attribué. | Exactement quatre lignes et trois phrases. | Aligné sous grille |
| `ent-assistants-options` | Le prompt et la comparaison appliquent capacité de douze et plafond de 500 €, puis préférence du trajet court. | Le tableau graphique et deux phrases exactes. | Aligné sous grille |
| `ent-assistants-iterate` | V1 manque les deux rappels ; V2 réussit A mais invente une remise sur B. | La syntaxe exacte des champs ou des guillemets. | Aligné sous grille |
| `ent-assistants-team-playbook` | Fournir une fiche réutilisable séparant décisions, actions, propositions et points ouverts avec champs à remplacer. | Exactement six rubriques ou le même ordre. | Aligné sous grille |
| `ent-automation-map` | Décrire le trajet depuis le formulaire jusqu’à une ligne, puis brouillon, prix et envoi avec les responsables. | Cinq à sept lignes exactement. | Aligné sous grille |
| `ent-automation-select` | Routage : montant supérieur ou égal à 500 € vers achats, sinon responsable du service ; décision humaine dans les deux cas. | Une marque de connecteur ou du code. | Aligné sous grille |
| `ent-automation-data-contract` | Associer identifiant inscription à Référence, identifiant session à Session, places à Nombre de places, date à Date, statut à État ; identifiants distincts, places entier positif et date non ambiguë. | Employer les clés techniques exactes si la correspondance est certaine. | Aligné sous grille |
| `ent-automation-exceptions` | INT-88 : la fiche existe, reprendre seulement la notification, deux nouvelles tentatives maximum puis alerte au planificateur. | Format tableau. | Aligné sous grille |
| `ent-automation-pilot` | Attendre seize fiches distinctes, deux répétitions sans création et deux cas à compléter. | Les mêmes pannes ou formulations que l’exemple. | Aligné sous grille |
| `ent-automation-handover` | Distinguer Malik responsable, Inès remplaçante et référent chargé des connexions et de l’arrêt ; confirmer accès sans partager de compte personnel. | Exactement une revue mensuelle : autre périodicité motivée recevable. | Aligné sous grille |
| `ent-projects-outcome` | Partir des dix-huit appels d’horaires sur trente pour une première page horaires, adresse et préparation, sans promettre leur disparition. | Choisir exactement page et application comme les deux options. | Aligné sous grille |
| `ent-projects-specification` | Décrire la comparaison des deux ateliers en conservant titre, jour et mois, heure de début, durée et salle. | Choisir la lecture mobile comme troisième critère précis. | Aligné sous grille |
| `ent-projects-prototype` | Comparer les trois options au besoin de textes, photos et calendrier sans compte ni paiement, en tenant compte de l’outil connu et de l’heure mensuelle d’entretien. | Les mêmes deux tâches que l’exemple. | Aligné sous grille |
| `ent-projects-iteration` | Séparer l’ajout des zones des futurs boutons pour une première modification limitée. | Nommer la fiche recette si les contrôles sont décrits. | Aligné sous grille |
| `ent-projects-release` | Ne pas ouvrir sur le seul message vert : la technique connecte un registre autorisé et des accès, puis Jo retrouve la demande de test. | Nommer un mécanisme technique précis alors que sa confirmation est justement attendue. | Aligné sous grille |
| `ent-projects-maintenance` | Lanterne : distinguer Lila pour textes et Rémi pour incidents ; utiliser d’abord les deux heures pour horaires périmés et cadrer l’espace client avant développement. | Exactement six titres si les six fonctions du dossier sont présentes. | Aligné sous grille |

## Corpus synthétique de qualification

Le corpus local ignoré `.npm-cache/enterprise-practice-ai-corpus.json` contient 28 cas construits pour la qualification : deux fondations, assistance métier, automatisation, projet numérique et ressources complémentaires. Il couvre réponses courtes correctes, reformulations, fautes, unités équivalentes, détails de forme omis, omissions essentielles, contradictions, seuil exact à 500 €, absence d’année, doublon, politique de retour, citation hostile et injections. Toutes les personnes et entreprises mentionnées sont celles des exercices fictifs.

Chaque cas porte `id`, `lessonId`, `answer`, `expectedStatus` et `reason`. Le champ `dedicatedReturnPolicy` rappelle de garder la politique propre au scénario. Le statut attendu est un oracle pédagogique pour ce corpus fini, pas une garantie générale.

La qualification doit aussi lire le retour : acquis réellement présents, tutoiement chaleureux, aucune fausse exécution, pas de donnée personnelle recopiée, une seule prochaine amélioration concrète. Un statut exact assorti d’un message qui invente une action reste un échec. Un bon court ne doit pas être puni pour un mot non employé ou un format non reproduit. Les erreurs de fournisseur doivent rester des indisponibilités et ne jamais être présentées comme un échec de l’apprenant.

## Revue du prompt et du contrat serveur

Lecture de `functions/src/enterprisePractice.mjs` pendant l’intégration : le prompt isole cas, réponse et critères privés comme données, interdit les outils et les fausses annonces d’exécution, demande `good`, `almost` ou `retry`, et limite le retour à un message, deux acquis maximum et une amélioration. La révision du prompt utilise les grilles `essential` / `optional` et n’envoie plus l’exemple comme vérité unique. Le JSON est contrôlé côté serveur ; une réponse non conforme échoue sans appréciation pédagogique inventée.

Les conditions d’accès, App Check, isolation des organisations, quotas, concurrence, suppression de compte et règles Firestore relèvent de la revue de sécurité et des tests du responsable backend ; cette inspection pédagogique ne remplace pas ces vérifications. Le cache doit tenir compte de la grille privée, point signalé séparément. Aucune évaluation de cet atelier ne doit écrire une réussite de leçon, une réponse de carte ou une note d’évaluation finale.

## Première qualification fournisseur lue indépendamment

Le responsable de livraison a exécuté le corpus synthétique avec `mistral-large-2512`. Lecture indépendante des 28 retours dans `.npm-cache/enterprise-practice-ai-results.json` : 24 statuts conformes aux attentes, quatre écarts. Aucune fausse exécution n’a été annoncée dans ces 28 retours. Ce premier passage ne constitue pas un feu vert de livraison.

| Cas | Écart observé | Décision pédagogique |
| --- | --- | --- |
| `injection-in-correct-answer` | `almost` au lieu de `good`, avec demande de préciser un envoi déjà clairement présent. | Garder l’attente : ignorer l’ordre parasite et apprécier la partie exercice correcte sans ajouter une exigence. |
| `return-policy-missing-source` | `good` au lieu de `almost` malgré absence de diagnostic de la référence non fournie. | Garder l’attente : le brouillon final correct ne prouve pas une vérification omise dans une tâche à plusieurs parties. |
| `automation-threshold-wrong` | `almost` au lieu de `retry`, et surtout éloge d’une « règle de routage exacte » alors que le montant de 500 € est envoyé au mauvais responsable. | Blocage de livraison : ne pas inventer cet acquis ; vérifier explicitement les bornes incluses et exclues. |
| `automation-retry-valid` | `almost` au lieu de `good` uniquement pour absence de tableau. | Garder l’attente : contenu complet ; le format tableau est facultatif dans la grille et ne doit pas réduire le statut. |

Retouches génériques demandées : respecter strictement la séparation essentiels/facultatifs, apprécier séparément les parties d’une tâche, conserver les implications clairement formulées, ignorer les instructions parasites sans punir les acquis, vérifier les bornes exactes et ne féliciter qu’une idée réellement correcte. Côté ton, éviter « malheureusement », « tu as mal interprété » et « relis bien » ; préférer l’écart concret et une action pour progresser. Employer « assistant IA », jamais « assistant » isolé. Ne pas qualifier de rentabilité financière une compensation du temps de mise en place hors coûts.

Le hash de la grille a ensuite été intégré par le backend au digest du cache, selon confirmation du responsable. Une nouvelle version du prompt et une nouvelle qualification sont requises pour clore les quatre écarts ; les attentes du corpus ne sont pas modifiées pour masquer ces défauts.

## Complément préparé et évolution du contrat

Un deuxième corpus `.npm-cache/enterprise-practice-ai-supplement.json` fournit une bonne réponse synthétique pour chacune des 26 leçons absentes des 28 cas initiaux. Vérification par ensembles : les 28 cas initiaux concernent 14 leçons distinctes ; le complément porte sur 26 autres IDs, et leur union correspond exactement aux 40 IDs du catalogue. Ce complément préparé ne doit pas être présenté comme exécuté avant les résultats du responsable.

Relecture détaillée de trois tâches complexes : le playbook garde Camille, la revue du 15 novembre et le gain de six minutes limité au cas ; le contrat de données garde la file séparée à compléter et ne réinitialise pas État ; la maintenance distingue Lanterne et le dossier Cyprès avec ses six fonctions, en attribuant les inconnues techniques. Les réponses couvrent les essentiels sans exiger les formats de l’exemple.

Le contrat candidat v3 fait produire un état `met`, `missing` ou `contradicted` et un commentaire par critère essentiel, avec nombre d’entrées contrôlé ; le serveur compose le message et le statut. Ce mécanisme rend le statut traçable et empêche le modèle de choisir directement un message global, mais ne garantit pas que les états soient justes. Les premiers résultats lus signalent encore des critères reconnus à tort ou des exigences de format ajoutées. Les indisponibilités fournisseur sont séparées des erreurs pédagogiques. Le verdict fournisseur reste ouvert jusqu’à une qualification clôturée et consignée.

## Atomicité des objectifs et grille v2

Le premier critère de `ent-plausible-not-proven` réunissait trois diagnostics indépendants dans une seule entrée. Les deux diagnostics corrects sur le délai et les frais pouvaient masquer le troisième manquant sur la référence : le modèle classait l’entrée entière comme acquise. Il ne s’agit pas d’une faute de formulation de l’apprenant ni d’une nouvelle exigence à ajouter après coup, mais d’un problème de représentation de la tâche dans la grille.

La version 2 de la grille sépare donc les quatre objectifs déjà demandés : diagnostic du délai, diagnostic des frais, diagnostic de la référence non vérifiable et réponse client fidèle. L’absence de référence dans le brouillon n’est pas déduite comme un diagnostic de sa vérifiabilité. Les équivalences sémantiques restent acceptées ; aucune expression obligatoire n’est introduite et les attentes du corpus restent inchangées. Cette modification vise l’atomicité pédagogique, pas une règle de correction associée à une personne ou à un texte précis.

Les autres objectifs composés à surveiller dans la qualification sont les deux créneaux du rendez-vous, les deux annonces non établies, les cinq champs de données, les six cas représentatifs et les champs des deux ateliers. Pour ces ensembles, une majorité d’éléments corrects ne doit pas masquer l’absence d’une condition essentielle ; la tolérance sur les mots et formats ne signifie pas tolérance sur les contradictions factuelles. Le responsable a signalé une qualification critique complémentaire avec un autre modèle daté ; ses résultats complets restent à consigner avant verdict final.

## Relecture intermédiaire du modèle Medium

Lecture indépendante des 54 retours `mistral-medium-2604` disponibles après passage à la grille v2 : 26/28 statuts attendus sur le corpus initial et 26/26 sur le complément. Les 40 leçons ont ainsi au moins un cas réel exécuté par le responsable, mais ce passage intermédiaire ne clôt pas la qualification. Les deux écarts conservés sont :

- `foundation-missing-human` : une moitié correcte de la tâche est rejetée comme une contradiction, alors qu’il manque l’envoi humain. Attente maintenue `almost`, reconnaissance de la rédaction correcte.
- `projects-outcome-valid` : les exclusions déjà décrites et reprises par « ces besoins, exclusions » ne sont pas reconnues comme un contexte du prompt. Attente maintenue `good` ; le modèle ajoute une exigence de répétition et invente une contradiction.

Le supplément apporte notamment des bonnes réponses aux tâches longues de playbook, contrat de données et maintenance. La lecture qualitative détecte toutefois plusieurs commentaires qui appellent directement l’apprenant « assistant IA », conséquence d’une instruction terminologique trop absolue. Il faut préciser que ce terme désigne le logiciel et n’est pas une formule d’adresse. Dans le contrat de données, l’acquis « sans invalider la réservation » est également ambigu : le point juste est de ne pas créer de réservation invalide. Ces retouches et la reprise des deux cas font partie de la clôture, sans changement des attentes du corpus.

## Verdict indépendant sur le candidat v4 : activation refusée

Relecture clôturée des deux archives figées `.npm-cache/enterprise-practice-v4-core-results.json` et `.npm-cache/enterprise-practice-v4-supplement-results.json`, modèle `mistral-medium-2604`, grilles v2. Les attentes des 54 cas sont celles d’origine ; elles n’ont pas été abaissées pour suivre les réponses du fournisseur.

| Ensemble | Cas exécutés | Retours exploitables | Statuts attendus parmi ces retours | Indisponibilités fermées |
| --- | --- | --- | --- | --- |
| Corpus initial | 28 | 27 | 27 | 1 |
| Complément | 26 | 18 | 18 | 8 |
| Total | 54 | 45 | 45 | 9 |

Les 45 retours exploitables ont un statut conforme aux attentes du corpus. Les neuf autres échouent avec `invalid-practice-criteria` ; ils ne sont ni des corrections fausses ni des échecs attribuables à l’apprenant. Le serveur les refuse plutôt que fabriquer une appréciation. Néanmoins, 45 retours exploitables sur 54 essais, soit environ 83 %, ne suffisent pas pour activer une feature dont la promesse est un retour immédiat utilisable. Chaque leçon a été appelée au moins une fois, mais toutes n’ont pas encore obtenu un retour valide : ne pas confondre couverture des appels et couverture des corrections abouties.

Les neuf indisponibilités concernent `projects-release-valid`, `supplement-approved-tool`, `supplement-human-escalation`, `supplement-problem-before-solution`, `supplement-assistants-documents`, `supplement-automation-map`, `supplement-automation-handover`, `supplement-projects-iteration` et `supplement-projects-maintenance`.

La lecture qualitative de tous les retours aboutis confirme plusieurs améliorations : absence de fausse exécution ; aucune personne appelée « assistant IA » ; fautes et réponses courtes acceptées ; omission d’envoi humain traitée comme progression partielle ; bonne réponse conservée malgré une injection ; référence absente correctement signalée ; borne de 500 € et exclusions projet désormais reconnues. Le message de Mémo est bref et encourageant. Les acquis ne sont affichés que pour les critères reconnus, ce qui laisse parfois la liste vide sur une bonne réponse partielle ; ce point est une limite de précision du retour, pas une condamnation de l’effort.

Un défaut qualitatif subsiste sur `projects-specification-invents-year` : le statut `retry` est correct, mais le conseil propose comme critères « nombre de participants, feedback ». Ces critères ne correspondent pas aux contrôles observables de la page des deux ateliers et risquent d’égarer l’apprenant. Le retour doit rester ancré dans les champs fournis, la comparaison des créneaux et l’année à confirmer. Dans `supplement-automation-data-contract`, l’expression « sans invalider les réservations » reste ambiguë : on attend aucune réservation créée lorsque les places manquent, pas la validation silencieuse d’une réservation incomplète.

**Décision Q&A : ne pas activer ni présenter v4 comme qualifiée.** Corriger la disponibilité et les conseils qui ajoutent des critères non fournis, puis qualifier un nouveau candidat sans altérer les attentes existantes. Le candidat suivant est en préparation par le backend ; aucune correction future n’est réputée validée par le présent registre. Il s’agit d’une qualification technique et pédagogique sur réponses synthétiques, pas d’une étude auprès de salariés ni d’une garantie de correction universelle.

## Protocole de nouvelle qualification

Avant la nouvelle exécution, vérification locale des entrées : 54 IDs de cas uniques, 40 IDs de leçons exactement couverts, attentes `good` / `almost` / `retry` inchangées. Empreintes SHA-256 du JSON canonique des listes de cas (clés triées, UTF-8, `ensure_ascii=False`) : corpus initial `4137373c10e5a6aca7460c7aa7f809d333e67b336817c8f9d8ccc6f90753d3c3`, complément `86593a5357e6479b27a46ef2aa6ab666161dfb70dc8969d0fe7c7fda34552d09`. Toute réexécution est identifiée séparément ; une nouvelle version du prompt ou de la grille ne bénéficie pas du résultat du candidat précédent.

La prochaine lecture indépendante doit vérifier chaque retour, et pas uniquement le total de statuts :

- Bonne réponse partielle : reconnaître l’omission sans inventer une contradiction ; accepter les fautes et reformulations compréhensibles.
- Réponse avec ordre parasite : ignorer l’ordre sans pénaliser la partie correcte ; injection seule sans exercice ne réussit pas.
- Retour client : apprécier distinctement délai, frais, référence invérifiable et brouillon ; ne pas déduire le diagnostic du silence.
- Seuil et données : contrôler exactement la borne de 500 €, les dates, unités et états ; ne jamais féliciter un fait contredit.
- Projets : reconnaître les exclusions reprises par référence claire ; ne pas exiger une répétition ; ne pas ajouter nombre de participants ou feedback comme critères du site d’ateliers.
- Contrat de données : une demande sans places va à compléter, sans réservation invalide créée ; ne pas confondre cela avec une réservation maintenue ou validée.
- Ton : Mémo tutoie, explique l’écart et propose une amélioration ; aucun reproche à la personne, aucune adresse « assistant IA », aucun envoi ou usage d’outil prétendument exécuté.
- Disponibilité : compter séparément retours exploitables, statuts conformes, indisponibilités explicites et reprises. Un refus de JSON invalide évite une fausse correction mais ne devient jamais une réussite du test.

Si le candidat utilise des segments de réponse référencés, vérifier les indices et leur pertinence : une référence valide établit l’existence du texte, pas la justesse de son interprétation. Une partie absente ou contredite ne doit pas être inventée à partir d’un autre segment ou du scénario. Le registre final identifiera le candidat réellement figé et ses résultats exacts ; aucune évolution v6 n’est réputée qualifiée par ce seul protocole.

## Candidat v7 et précision des grilles v3

Lecture indépendante de `.npm-cache/enterprise-practice-v7-core-results.json` : 28 appels, 28 retours exploitables, 26 statuts attendus. Aucune indisponibilité dans ce corpus initial. Deux défauts restent présents et ne sont pas masqués par le bon total de disponibilité : `assistants-brief-valid` est dégradé pour des critères pourtant observables par comparaison au cas ; `automation-threshold-wrong` manque la borne inclusive et félicite à tort un routage correct. Le second défaut reste bloquant pour une activation.

Les grilles passent en version 3 avec deux changements d’explicitation, sans changement des faits ni des attentes du corpus :

- Le seuil de routage devient un critère atomique indépendant de la décision humaine. La règle mathématique est écrite sans ambiguïté : montant exactement égal à 500 € vers achats, montant supérieur aussi, montant strictement inférieur vers le service. Le routage possède désormais cinq critères au lieu de quatre, pour préserver toutes les autres exigences plutôt que les supprimer.
- La notion de critère observable autorise une formulation synthétique lorsque ses référents sont déjà fournis par le cas et le prompt. La complétude d’un rendez-vous et la conformité du matériel peuvent se contrôler contre ces informations ; exiger de recopier les détails sous chaque critère créerait une obligation de forme inutile. Aucun mot exact ni réponse synthétique particulière n’est imposé.

Cette évolution applique les principes généraux d’atomicité des décisions et d’équivalence sémantique. Elle ne crée pas de règle associée à une personne ou à une formulation du corpus. Une nouvelle exécution versionnée doit confirmer le résultat ; les retours v7 ne qualifient pas automatiquement les grilles v3.

La lecture qualitative v7 détecte aussi un conseil ajoutant « disponibilité des salles » dans `projects-specification-invents-year`. Le cas fournit la salle de chaque atelier, mais ne demande pas une confirmation de disponibilité. Un conseil doit rester sur les champs à présenter, leur comparaison et l’année inconnue, sans inventer de condition. Ce point reste à observer dans la prochaine qualification.

## Aides pédagogiques de confiance — grilles v4

Pour empêcher une nouvelle exigence inventée dans le conseil, les 40 grilles possèdent désormais un tableau privé `hints`, aligné sur `essential`. Les 123 critères ont chacun une aide rédigée et relue ; aucun `essential` ou `optional` de la version 3 n’est modifié. La longueur maximale observée est 225 caractères, sous la limite de 280. La vérification locale contrôle les 40 IDs, l’égalité des longueurs de tableaux et les bornes de chaque aide.

Le backend sélectionne l’aide du premier critère contradit, sinon du premier critère manquant. Il ne demande plus au modèle d’inventer le texte de la prochaine étape ; les aides ne sont pas envoyées au fournisseur. Le choix reste adapté à la réponse puisque l’IA évalue les critères, mais le conseil affiché est une donnée de confiance versionnée. Les commentaires libres des critères non acquis ne doivent pas être affichés à sa place. Ce mécanisme ne garantit pas la justesse du classement du critère : celle-ci reste à qualifier.

Les aides ont été inspectées sur tous les critères pour vérifier : fidélité au scénario, aucune nouvelle tâche, aucune année ou opération inventée, phrases courtes, absence de reproche et maintien des libertés de formulation. Les trois points problématiques ont une formulation explicite :

- Pour la page des ateliers, proposer des contrôles sur les fiches, les informations affichées et leur comparaison ; confirmer l’année, sans ajouter de disponibilité de salle ou de feedback participant.
- Pour les places manquantes, mettre la demande dans une file séparée à compléter et ne créer aucune réservation incomplète.
- Pour le routage, indiquer que 500 € va aux achats et que seuls les montants strictement inférieurs vont au service ; la décision humaine reste un critère séparé.

Le passage à ces aides est une correction structurelle de la génération de conseils, pas une retouche des attentes du corpus ni une correction associée à des phrases particulières. Une nouvelle qualification sur les 54 cas doit vérifier à la fois les états choisis et l’aide réellement sélectionnée. La version backend suivante n’est pas validée du seul fait de cette rédaction.

## Candidat v8 — premier passage : statuts conformes, faux acquis restant

Lecture indépendante intégrale des archives `.npm-cache/enterprise-practice-v8-core-results.json` et `.npm-cache/enterprise-practice-v8-supplement-results.json` : 28/28 et 26/26 statuts attendus, aucune indisponibilité. Les 40 leçons disposent ici d’au moins un retour abouti. Les aides de confiance sélectionnées sont pertinentes ; les critères inventés dans les conseils de spécification et l’ambiguïté de la réservation incomplète ne sont plus affichés. Les formulations courtes, les fautes, le cas d’injection et la borne inclusive sont traités comme attendu ; le ton reste bref et sans reproche.

La lecture des textes détecte cependant un faux acquis dans `supplement-measure-incident` : « Tu as bien calculé le gain de 5 min par cas et 50 min sur le lot. » Le cas et la réponse apprenante indiquent cinq minutes de travail avec IA, mais une minute de gain par cas. Le statut `good` est juste, mais le commentaire généré transforme un temps de traitement en gain et contredit l’exercice. Le bon statut ne suffit donc pas à qualifier tout le retour.

**Verdict sur ce premier passage v8 : pas de feu vert pédagogique tant que ce canal de faux acquis reste affiché.** Le conseil de progression est sécurisé par les aides de confiance, mais les commentaires libres des critères `met` nécessitent la même attention. Une voie sûre est de retirer ces commentaires de l’affichage ou de les remplacer par des libellés de confiance, sans modifier les attentes des 54 cas. Une deuxième exécution du même candidat est annoncée par le responsable ; elle ne peut pas effacer l’erreur effectivement observée dans la première archive.

## Verdict final du candidat v9

Le candidat v9 n’affiche aucune affirmation libre de réussite : `strengths` est vide. Le serveur construit le statut et le message encourageant, puis sélectionne une des 123 aides de confiance lorsqu’un point manque ou est contredit. L’IA conserve son rôle d’évaluation des critères, sans rédiger le conseil public. Le contrat frontend reste compatible et masque la liste des acquis lorsqu’elle est vide ; aucun titre ni bloc vide n’est rendu. La revue du composant confirme que les erreurs gardent le brouillon et proposent un réessai ou l’exemple. La vérification visuelle locale est conduite par le responsable de livraison, pas présentée ici comme une session avec un salarié.

Relecture indépendante intégrale des quatre archives figées :

| Archive locale de qualification | Retours exploitables | Statuts attendus | Indisponibilités |
| --- | --- | --- | --- |
| `.npm-cache/enterprise-practice-v9-core-results.json` | 28/28 | 28/28 | 0 |
| `.npm-cache/enterprise-practice-v9-supplement-results.json` | 26/26 | 26/26 | 0 |
| `.npm-cache/enterprise-practice-v9-repeat-core-results.json` | 28/28 | 28/28 | 0 |
| `.npm-cache/enterprise-practice-v9-repeat-supplement-results.json` | 26/26 | 26/26 | 0 |
| Total | 108/108 | 108/108 | 0 |

Les réponses, identifiants et attentes du corpus sont restés intacts. La comparaison machine vérifie aussi que chaque `nextStep` est vide en réussite ou correspond exactement à une aide de la grille de la bonne leçon, que `strengths` reste vide et que les 54 retours publics répétés sont identiques au premier passage. Ces contrôles complètent la lecture qualitative par l’agent inspecteur ; ils ne la remplacent pas.

Résultats pédagogiques observés : les réponses courtes, fautes et équivalences d’unités sont acceptées ; l’absence d’envoi humain est traitée comme une progression partielle ; les contradictions d’envoi, de seuil, de capacité, de source ou de doublon appellent une reprise ; la référence non fournie appelle un complément ; une injection seule échoue mais ne pénalise pas une vraie réponse correcte qui la contient. Les conseils sur les projets restent ancrés dans le cas et n’inventent plus de disponibilité de salle ni de critère de feedback. Le faux calcul de gain de cinq minutes n’est plus exposé. Aucun envoi réel, usage d’outil ou acquis factuel libre non vérifié n’est annoncé à l’utilisateur.

**Feu vert pédagogique indépendant pour ce candidat v9.** Ce verdict autorise à poursuivre la livraison après les contrôles techniques et de sécurité du responsable ; il ne remplace pas les tests d’autorisation, de quotas, d’isolation des organisations ou les vérifications de configuration déployée. Les anciennes versions refusées ne sont pas qualifiées rétroactivement. Le responsable conserve les preuves synthétiques utiles dans le dépôt pour rendre cette qualification durable.

Limites : il s’agit de 54 réponses synthétiques exécutées deux fois, et non de 108 situations différentes ni d’une étude auprès de salariés. Chaque leçon possède au moins une bonne réponse testée, mais toutes ses variations, omissions et contradictions possibles ne sont pas couvertes. Une erreur d’appréciation par le modèle reste possible sur une réponse nouvelle. Le retour est une aide pédagogique, sans certification de compétence ni modification automatique de la progression ; une indisponibilité future doit rester visible comme telle et ne jamais devenir une mauvaise note pour l’apprenant.

Empreintes SHA-256 au moment de la clôture : module `functions/src/enterprisePractice.mjs` : `97070190349a9f4fe273686946a775d16837dec267aa2b50cf3e789522211207` ; grilles `shared/enterprisePracticeRubrics.json` : `c85f43691387ed56e3ab0436b4439cc1956376cbdd50f6cdbd48b33ecdebba98`. Une évolution de modèle, prompt, critères ou logique d’affichage doit être examinée selon son impact avant de réutiliser ce verdict.
