# Simulation de persona — parcours Automatisation

17 octobre 2026. Simulation par agent sur les sources uniquement, sans personne réelle, navigateur ni logiciel d'automatisation. Le même inspecteur a vu les exemples et les clés pendant sa revue Q&A : limite de non-cécité explicite. Les productions sont reconstruites depuis scénario, tâche et amorce pour tester clarté/faisabilité. Aucun taux de réussite humain, temps de session, maîtrise ou configuration réelle n'est inféré.

## Rôle

**Référent automatisation non développeur simulé** : coordinateur opérations, tient une liste partagée et un formulaire, comprend les filtres de tableur, a vu une démo Power Automate. Peut expliquer le travail, mais ne connaît ni API ni mécanismes de concurrence. Attend de faire avancer un petit projet avec son référent outils.

## Productions par ID

### `ent-automation-map`

> Nouveau formulaire reçu. Lina vérifie référence/service/date. Si service absent, Lina demande une précision et garde la demande à compléter. Si complet, les champs alimentent une ligne unique ; Lina prépare le brouillon. Karim décide du prix et envoie. Résultat : chaque référence complète apparaît une fois dans le suivi, sans ressaisie ; la présence d'une ligne ne signifie pas que le devis est envoyé.

Livrable réalisable en six lignes. Le mécanisme exact de ligne unique n'est pas enseigné ici, ce qui convient à la carte mais doit être confirmé pendant construction. Retour simulé : « Je peux expliquer le flux, je ne sais pas encore le configurer. » Ne pas présenter la carte comme flux opérationnel.

### `ent-automation-select`

> Nouvelle demande complète. Lire le montant ; à partir de 500 € inclus créer une tâche achats, sinon chercher le responsable du service dans la table. Service inconnu : achats pour clarification. Attendre la validation humaine. IA éventuellement pour résumer la justification, en laissant l'original. Confirmer le connecteur formulaire/liste/tâche, les droits et le contrat. Si absent, premier essai manuel documenté.

Seuil inclus compris. Pas besoin de programmation. Retour simulé : « Quels outils de mon entreprise savent créer ces tâches ? Je dois demander au référent mais je ne sais pas quoi lui montrer. » La fiche fournit déjà les opérations ; recommandation : encadré « à apporter au référent » exportable, sans suggérer un achat de service.

### `ent-automation-data-contract`

> inscription_id → Référence, texte stable obligatoire ; session_id → Session, ID connu obligatoire ; places → Nombre de places, entier positif obligatoire ; date_session → Date, année-mois-jour obligatoire ; statut soumise → État à traiter seulement lors de la création. Si places manque, file à compléter avec référence/motif/coordinateur, sans réservation. Si INS-204 existe, pas de seconde ligne et garder l'État modifié par le coordinateur. Prénom et coordonnées inutiles ici.

Le contrat peut être écrit sans API. **Friction probable** : session/inscription, source de référence, mapping et états arrivent dans une seule mission. Retour simulé : « Je dois relire pour comprendre que la source peut changer selon le champ. » Recommandation : une table visuelle source→destination et une mini-frise création/reprise ; conserver texte alternatif. Pas de contradiction de fond.

### `ent-automation-exceptions`

> INT-88 : fiche présente, notification en attente. Vérifier la fiche et l'état réel de notification ; retenter cette étape au plus deux nouvelles fois, espacées ; ensuite alerte au planificateur. INT-89 : aucune fiche, adresse à demander par le planificateur ; ne pas réessayer automatiquement. Trace : référence, étape, heure, état. Au référent : comment empêcher deux créations simultanées de la même référence et vérifier un résultat incertain ?

Sortie réaliste pour un référent métier ; ne configure pas l'idempotence mais exprime l'exigence. Retour simulé : « J'ai d'abord lu deux tentatives au total dans la liste ; le scénario disait deux nouvelles. » **Demande de correction exacte** : checklist « Deux nouvelles tentatives maximum puis alerte ». Éviter de transformer deux reprises fictives en standard universel.

### `ent-automation-pilot`

> Attendus : 16 fiches uniques, deux répétitions sans création, deux cas à compléter. Test panne destination : attente visible et alerte, aucun succès mensonger. Test reprise après création : garder une seule fiche, terminer notification. Temps humain 18+12=30, contre 60 ; gain net 30 min/lot. 180/30=6 lots si volume et gain stables. Pas de conclusion sur rentabilité complète sans licences et entretien. Étendre après seuils zéro doublon et aucune réservation inventée, reprise testée, repli disponible.

Calcul et décision réalisables. Retour simulé : « Je peux préparer le plan, mais comment déclencher une panne fictive sans casser le vrai flux ? » Recommandation : dans le transfert facultatif, préciser environnement d'essai et défaut simulé avec référent ; aucune panne à provoquer sur production. Le cours ne demande pas actuellement de toucher un outil réel.

### `ent-automation-handover`

> Fiche commune du suivi INT. Malik responsable métier, Inès remplaçante, référent pour connexions/arrêt. Confirmer accès et connexions après Nora, sans partage de mot de passe. Inès retrouve INT-88 et reprend seulement notification, puis note le résultat. Une version commune active ; modèles inactifs identifiés. Si doublon : Malik demande arrêt, référent coupe déclenchement et organise traitement manuel des entrées reçues. Revue mensuelle et à chaque changement de champ/règle/outil/responsable.

Livrable complet mais dense. Retour simulé : « Une fiche prête à remplir me ferait gagner du temps ; je crains de perdre cette saisie. » Recommandation UI : tableau ou export structuré, bouton copier, critères visibles, conservation de session si compatible confidentialité. L'accès manager doit rester au résumé d'activité.

## Situation finale et conclusion de simulation

La situation Mosaïque permet d'appliquer les principes mais reprend les mêmes types d'incident que les leçons : elle mesure une consolidation proche. Un dossier voisin dans une autre activité, incluant un seuil ou un champ nouveau et une correction d'un état, testerait mieux le transfert. Aucun nouveau problème de clé n'a été identifié.

Le rôle simulé peut préparer les six livrables. Son principal manque reste la construction visible d'un flux : un exemple local pas à pas ou un simulateur de circulation de fiches améliorerait la compréhension sans connecter d'outil externe. Les déclarations de parcours doivent conserver « préparer/documenter » ; la maîtrise pratique nécessite essai autorisé réel et tests humains futurs.
