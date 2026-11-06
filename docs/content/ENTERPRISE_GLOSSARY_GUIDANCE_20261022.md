# Revue du glossaire Entreprise — guidage

Date : 22 octobre 2026. Inspection des 190 entrées locales présentes avant ce lot, identifiées par mission et ID. Ce registre concerne les infobulles ; aucun mot ni passage des missions n’est supprimé.

## Règle éditoriale

Conserver les notions IA, les distinctions de sécurité et les concepts métier nécessaires à une décision. Retirer des infobulles le vocabulaire quotidien, les éléments d’interface et les détails propres au scénario. Contextualiser une notion lorsqu’un libellé trop général masque sa relation avec un assistant ou une automatisation. Les mots courants restent expliqués par le cas lorsque nécessaire.

Une notion n’est soulignée qu’une fois dans un même composant LessonText, y compris entre paragraphes et segments séparés par du code inline. Le code reste intact et ne reçoit pas d’infobulle. Chaque rendu reçoit son propre Set, explicitement transmis aux segments ; aucun état de dédoublonnage ne persiste entre composants ou utilisateurs.

## Registre exhaustif

| Mission | ID original | Notion | Décision | Motif |
| --- | --- | --- | --- | --- |
| ent-plausible-not-proven | systeme-generatif | Système génératif | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-plausible-not-proven | entrainement | Entraînement | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-plausible-not-proven | affirmation | Affirmation | Retirer | Vocabulaire courant : la vérification est enseignée dans le cas et par les notions de preuve. |
| ent-plausible-not-proven | reference | Référence | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-plausible-not-proven | preuve-independante | Preuve indépendante | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-plausible-not-proven | document-reference | Document de référence | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-plausible-not-proven | ent-project-pilot | Pilote | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-answer-or-action | ent-start-draft | Brouillon | Retirer | Mot quotidien ; la distinction préparation/envoi reste explicitement enseignée dans la mission. |
| ent-answer-or-action | ent-start-recipients | Destinataires | Retirer | Mot quotidien ; le contrôle des destinataires reste dans le scénario. |
| ent-answer-or-action | ent-start-sent-mail | Messages envoyés | Retirer | Élément usuel de messagerie ; la preuve de l’action reste expliquée dans le cas. |
| ent-answer-or-action | ent-start-mailbox | Messagerie | Retirer | Application quotidienne, sans notion IA spécifique à définir. |
| ent-answer-or-action | ent-start-prompt | Prompt | Contextualiser | Définition recentrée sur le geste et les limites de l’IA ou de l’automatisation. |
| ent-minimum-data | data-minimization | Minimisation des données | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-minimum-data | fictional-case | Cas fictif | Retirer | Consigne pédagogique directement exprimée dans les activités ; pas un concept à mémoriser. |
| ent-minimum-data | dataset | Jeu de données | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-minimum-data | data-export | Export de données | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-minimum-data | internal-rules | Règles internes | Retirer | Expression courante ; les règles applicables restent exposées dans les pièces. |
| ent-minimum-data | authorized-tool | Outil autorisé | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-minimum-data | relative-purchase-date | Date relative d'achat | Retirer | Formulation de détail propre au cas, pas une notion IA à mémoriser. |
| ent-approved-tool | data-retention | Conservation des données | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-approved-tool | service-subcontractors | Sous-traitants | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-approved-tool | european-hosting | Hébergement européen | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-approved-tool | named-access | Accès nominatifs | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-approved-tool | model-training-reuse | Réutilisation des données | Contextualiser | Définition recentrée sur le geste et les limites de l’IA ou de l’automatisation. |
| ent-approved-tool | approved-scope | Périmètre autorisé | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-approved-tool | sensitive-data | Données sensibles | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-approved-tool | service-configuration | Configuration du service | Contextualiser | Définition recentrée sur le geste et les limites de l’IA ou de l’automatisation. |
| ent-approved-tool | ent-project-pilot | Pilote | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-hostile-document | prompt-injection | Injection de prompt | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-hostile-document | untrusted-content | Contenu non fiable | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-hostile-document | authorized-instruction | Instruction autorisée | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-hostile-document | data-export | Export de données | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-hostile-document | sending-tool | Outil d'envoi | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-hostile-document | ent-project-pilot | Pilote | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-useful-request | ent-start-request | Prompt | Contextualiser | Définition recentrée sur le geste et les limites de l’IA ou de l’automatisation. |
| ent-useful-request | ent-start-mail-subject | Objet du mail | Retirer | Élément usuel d’un mail, déjà compréhensible dans la consigne. |
| ent-useful-request | ent-start-missing-place | Lien à communiquer | Retirer | Détail de scénario, pas une notion transférable. |
| ent-useful-request | ent-start-short-format | Forme et longueur du message | Retirer | Mots courants et longueur de sortie indiquée directement dans le prompt. |
| ent-context-rag | context-capacity | Capacité de contexte | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-context-rag | applicable-version | Version applicable | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-context-rag | fictional-case | Cas fictif | Retirer | Consigne pédagogique directement exprimée dans les activités ; pas un concept à mémoriser. |
| ent-context-rag | glossary | Glossaire | Retirer | Élément d’interface, sans valeur de concept IA à mémoriser. |
| ent-context-rag | ai-model | Modèle IA | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-iterate-examples | ent-iterate-examples-test-case | Cas de test | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-iterate-examples | ent-iterate-examples-style-example | Exemple de style | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-iterate-examples | ent-iterate-examples-single-change | Modification unique | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-iterate-examples | ent-iterate-examples-measurable-progress | Progrès mesurable | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-verify-claims | verifiable-claims | Affirmations distinctes | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-verify-claims | appropriate-evidence | Preuve adaptée | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-verify-claims | internal-rule | Règle interne | Retirer | Expression courante ; le contrôle de la règle est directement exercé. |
| ent-verify-claims | order-system | Système de commandes | Retirer | Outil métier courant du scénario ; la preuve adaptée reste une notion conservée. |
| ent-verify-claims | payment-system | Système de paiement | Retirer | Outil métier courant du scénario ; la preuve d’une opération reste explicitement exercée. |
| ent-verify-claims | not-established | Non établi | Retirer | Expression courante déjà expliquée par les choix et corrections. |
| ent-verify-claims | decisive-condition | Condition décisive | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-numbers-sources | net-gain | Gain net | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-numbers-sources | gross-gain | Gain brut | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-numbers-sources | measurement-units | Unités de mesure | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-numbers-sources | evidence-scope | Périmètre d'une étude | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-numbers-sources | study-population-sample | Population étudiée et échantillon | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-numbers-sources | calculation-assumptions | Hypothèses d'un calcul | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-numbers-sources | study-method | Méthode d'une étude | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-numbers-sources | institutional-source | Source institutionnelle | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-numbers-sources | ent-project-pilot | Pilote | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-human-escalation | human-escalation-scope | Périmètre autorisé | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-human-escalation | human-escalation-rule | Règle d’escalade | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-human-escalation | human-escalation-human-validation | Validation humaine | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-human-escalation | human-escalation-approver | Approbateur | Retirer | Rôle formulable dans le scénario ; conserver les notions d’escalade et de validation humaine. |
| ent-human-escalation | human-escalation-paused-action | Action suspendue | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-human-escalation | human-escalation-holding-message | Message d’attente | Retirer | Forme de message ordinaire ; conserver la limite d’engagement dans la mission. |
| ent-human-escalation | ent-project-pilot | Pilote | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-right-tool | deterministic-rule | Règle de calcul déterministe | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-right-tool | generation | Génération par IA | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-right-tool | exact-search | Recherche par mot exact | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-right-tool | operating-cost | Coût d’exploitation | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-right-tool | representative-trials | Essais représentatifs | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-right-tool | reference-option | Option de référence | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-right-tool | prototype | Prototype | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-right-tool | ent-project-pilot | Pilote | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-environment-cost | request | Requête | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-environment-cost | model | Modèle IA | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-environment-cost | infrastructure | Infrastructure et centres de données | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-environment-cost | measurement-uncertainty | Incertitudes de mesure | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-environment-cost | measurement-scope | Périmètre d’évaluation | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-environment-cost | total-cost | Coût complet | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-environment-cost | integration | Intégration | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-environment-cost | maintenance | Maintenance | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-environment-cost | ent-project-pilot | Pilote | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-problem-before-solution | chatbot | Chatbot | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-problem-before-solution | fiche-cadrage | Fiche de cadrage | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-problem-before-solution | hors-perimetre | Hors périmètre | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-problem-before-solution | situation-depart | Situation de départ | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-problem-before-solution | echantillon | Échantillon | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-problem-before-solution | temps-net-gagne | Temps net gagné | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-problem-before-solution | fuite-donnees | Fuite de données | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-problem-before-solution | engagement-non-autorise | Engagement non autorisé | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-problem-before-solution | ent-project-pilot | Pilote | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-agents-permissions | delegation | Délégation à un agent | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-agents-permissions | agent-tools | Outil d’un agent | Contextualiser | Définition recentrée sur le geste et les limites de l’IA ou de l’automatisation. |
| ent-agents-permissions | agent-loop | Boucle d’un agent | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-agents-permissions | human-approval | Supervision et approbation humaine | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-agents-permissions | stop-conditions | Conditions d’arrêt | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-agents-permissions | action-trace | Trace des actions | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-agents-permissions | isolated-environment | Environnement isolé | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-agents-permissions | malicious-document-instruction | Instruction malveillante dans un document | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-agents-permissions | ent-project-pilot | Pilote | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-accountable-project | support-process | Processus support | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-accountable-project | project-scope | Périmètre du projet | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-accountable-project | success-criteria | Critères de réussite | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-accountable-project | stop-thresholds | Seuils d'arrêt | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-accountable-project | decision-review-date | Date de revue | Retirer | Repère de calendrier, pas un concept nécessitant une infobulle. |
| ent-accountable-project | expected-evidence | Preuve attendue | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-accountable-project | fallback-procedure | Retour à la procédure précédente | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-accountable-project | ent-project-pilot | Pilote | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-test-representative | representative-test-set | Ensemble de tests représentatif | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-test-representative | expected-result | Résultat attendu d'un test | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-test-representative | out-of-scope | Hors périmètre | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-test-representative | escalation | Escalade vers une personne | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-test-representative | hostile-instruction | Instruction hostile ou détournement | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-test-representative | comparison-test-set | Lot de comparaison stable | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-test-representative | held-out-evaluation | Évaluation finale sur des cas réservés | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-test-representative | regression-testing | Vérification des régressions | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-test-representative | ent-project-pilot | Pilote | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-measure-incident | net-gain | Gain net | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-measure-incident | reference-workflow | Fonctionnement de référence | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-measure-incident | escalation | Escalade | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-measure-incident | incident | Incident | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-measure-incident | disclosure | Divulgation | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-measure-incident | stop-threshold | Seuil d’arrêt | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-measure-incident | incident-log | Suivi des incidents | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-measure-incident | indicator | Indicateur | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-measure-incident | ent-project-pilot | Pilote | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-decision-dossier | decision-scope | Périmètre du projet | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-decision-dossier | decision-net-gain | Gain net de temps | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-decision-dossier | decision-escalation | Escalade vers une personne | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-decision-dossier | decision-test-batch | Lot de test | Contextualiser | Définition recentrée sur le geste et les limites de l’IA ou de l’automatisation. |
| ent-decision-dossier | decision-critical-threshold | Seuil de décision | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-decision-dossier | decision-note | Note de décision | Retirer | Livrable compréhensible par sa consigne et son exemple. |
| ent-decision-dossier | decision-assumption | Hypothèse à vérifier | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-decision-dossier | decision-deployment | Déploiement | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-continue-learning | automation | Automatisation | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-continue-learning | review-cards | Cartes de révision | Retirer | Le mode d’emploi des cartes appartient au guidage intégré, pas au glossaire des notions. |
| ent-continue-learning | sensitive-information | Données sensibles dans un échange professionnel | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-continue-learning | ai-model | Modèle IA | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-continue-learning | authorized-scope | Périmètre d'un usage | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-continue-learning | learning-ranking | Classement d'apprentissage | Retirer | Élément d’interface ; son sens doit être expliqué sur la page du classement. |
| ent-meeting-notes | meeting-minutes | Compte rendu de réunion | Retirer | Livrable quotidien ; les distinctions décision/proposition restent dans la mission. |
| ent-meeting-notes | approved-decision | Décision approuvée | Retirer | Expression courante ; la vérification d’un accord est enseignée dans le cas. |
| ent-meeting-notes | security-approval | Accord sécurité | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-meeting-notes | decision-scope | Périmètre d'une décision | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-meeting-notes | meeting-transcription | Transcription | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-meeting-notes | action-authorization | Autorisation d'une action | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-new-model-review | reference-test-set | Lot de référence | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-new-model-review | service-switchover | Bascule de version | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-new-model-review | authorized-scope | Périmètre autorisé | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-new-model-review | human-escalation | Escalade vers une personne | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-new-model-review | contractual-terms | Conditions contractuelles | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-new-model-review | previous-configuration | Configuration précédente | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-new-model-review | continuous-evaluation | Évaluation continue | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-assistants-brief | brief-metier | Brief | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-assistants-brief | livrable | Livrable | Contextualiser | Définition recentrée sur le geste et les limites de l’IA ou de l’automatisation. |
| ent-assistants-documents | dossier-source | Dossier source | Retirer | Le mot dossier est trop général ; la traçabilité des sources reste conservée. |
| ent-assistants-documents | tracabilite-metier | Traçabilité | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-assistants-meeting | releve-decisions | Relevé de décisions | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-assistants-meeting | question-ouverte | Question ouverte | Retirer | Expression courante contextualisée par les pièces et la consigne. |
| ent-assistants-options | contrainte-eliminatoire | Contrainte éliminatoire | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-assistants-options | compromis | Compromis | Retirer | Mot courant dont le scénario montre déjà la signification. |
| ent-assistants-iterate | iteration-metier | Itération | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-assistants-iterate | cas-comparaison | Cas de comparaison | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-assistants-team-playbook | fiche-methode | Fiche de méthode | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-assistants-team-playbook | temps-complet | Temps complet | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-automation-map | ent-automation-map-term-1 | Processus | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-automation-map | ent-automation-map-term-2 | Déclencheur | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-automation-select | ent-automation-select-term-1 | Flux | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-automation-select | ent-automation-select-term-2 | Connecteur | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-automation-data-contract | ent-automation-data-contract-term-1 | Contrat de données | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-automation-data-contract | ent-automation-data-contract-term-2 | Mapping | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-automation-data-contract | ent-automation-data-contract-term-3 | Source de référence | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-automation-exceptions | ent-automation-exceptions-term-1 | Exception | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-automation-exceptions | ent-automation-exceptions-term-2 | Idempotence | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-automation-exceptions | ent-automation-exceptions-term-3 | Journal | Contextualiser | Définition recentrée sur le geste et les limites de l’IA ou de l’automatisation. |
| ent-automation-pilot | ent-automation-pilot-term-1 | Pilote | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-automation-pilot | ent-automation-pilot-term-2 | Gain net | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-automation-handover | ent-automation-handover-term-1 | Version de référence | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-automation-handover | ent-automation-handover-term-2 | Solution de repli | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-projects-outcome | perimetre | Périmètre | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-projects-specification | specification | Spécification | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-projects-prototype | prototype | Prototype | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-projects-iteration | iteration | Itération | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-projects-release | recette | Recette | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |
| ent-projects-maintenance | maintenance | Maintenance | Conserver | Notion IA, de sécurité, de preuve ou de méthode métier utile à la décision de cette mission. |

## Bilan et validation

- 154 entrées conservées, 8 contextualisées, 28 retirées des infobulles : 190 décisions.
- Identifiants des notions conservées, identifiants de missions et texte pédagogique inchangés.
- Les notions communes de lessonGlossary restent disponibles ; aucune mission n’est obligée d’ajouter du jargon pour remplir sa liste locale.
- Tests : texte intégral préservé, limites des mots, accents/apostrophes, portée locale, notions utiles, mots courants non soulignés, dédoublonnage entre fragments, absence de contamination entre appels.
- Les tests et la compilation vérifient les contrats techniques ; la pertinence pour de vrais collaborateurs nécessite encore des séances de compréhension.
