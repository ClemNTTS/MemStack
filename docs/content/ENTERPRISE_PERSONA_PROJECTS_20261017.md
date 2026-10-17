# Simulation de parcours — responsable de projet PME

Date : 17 octobre 2026. Agent testeur, aucune session humaine ni navigation authentifiée. Support : contenu source des six leçons et ateliers du parcours `ent-track-projects`.

## Méthode et limites

Profil joué : responsable d'une petite structure, à l'aise avec un traitement de texte, souhaitant créer son premier site avec l'IA sans expérience de développement. Les productions ci-dessous sont rédigées depuis le scénario et l'amorce de l'atelier, puis confrontées aux critères. L'agent a déjà lu les exemples lors de la revue QA : cette simulation ne peut donc pas établir une découverte aveugle, une durée réelle ou un taux de réussite humain. Elle cherche les instructions manquantes et les ambiguïtés de transfert.

## Productions et confrontation

### `ent-projects-outcome` — Cyprès

Production : « Public : clients préparant une visite. Problème observé : 18 appels sur 30 concernent les horaires. V1 : page horaires, adresse et préparation ; devis après diagnostic ; pas de compte ni paiement. Inès tient le contenu. Test : demander à trois personnes quand venir un samedi, sans indiquer où regarder. Comparer ensuite les appels sur des périodes comparables et noter les demandes non résolues. Demande à l'assistant : compare page d'information et application avec comptes selon besoin couvert, informations à réunir, entretien et questions ouvertes. Ne promets pas une baisse d'appels. »

Confrontation : toutes les composantes sont déterminables. 18 + 8 + 4 = 30 ; 18/30 = 60 %, mais ce pourcentage n'autorise pas à annoncer 60 % de temps gagné. Le nom du rôle et le besoin sont simples. Aucune difficulté bloquante.

### `ent-projects-specification` — Rivage

Production : « Un visiteur veut comparer deux ateliers pour choisir un créneau. Afficher exactement deux fiches : Initiation tableur, 12 novembre, 14 h, 2 h, salle Bleue ; Présenter un projet, 14 novembre, 9 h, 3 h, salle Verte. Critères : toutes les données visibles, date complète après confirmation de l'année, lecture sur téléphone. Ni inscription ni paiement. Première livraison : maquette avec année à confirmer ; demander l'année avant publication. »

Confrontation : les heures et durées sont disponibles, aucune année à inventer. Trois critères peuvent être formulés sans connaissance technique. La consigne ne demande pas réellement de fabriquer les écrans : le livrable est une demande de réalisation. La landing doit conserver cette distinction.

### `ent-projects-prototype` — Hublot

Production : « L'outil connu couvre textes, photos et calendrier ; Nora sait l'entretenir. Un site sur mesure nécessite une personne pour reprendre hébergement et corrections ; prix à demander. L'application ajoute comptes et réservations non demandés. Je commence par une maquette dans l'outil connu avec deux navigations. Tâches : trouvez le prochain événement ; trouvez son lieu. Noter hésitations, erreurs et réussite, sans donner le chemin. »

Confrontation : les trois solutions sont comparables. En revanche, les textes et dates détaillés ne sont pas fournis : on peut préparer le protocole mais pas exécuter réellement un test de navigation. Aucun outil à acheter n'est nécessaire pour terminer l'atelier.

### `ent-projects-iteration` — Fougère

Production : « Conserver la version existante. Première demande : ajouter seulement les zones aux trois fiches : jardin Nord/Sud, haie Nord, compost Sud. Conserver titres et tarifs : 35 €/h, sur devis, 12 €/sac. Mettre les boutons dans une deuxième livraison. Recette : comparer trois fiches et tarifs, lire sur téléphone, faire relire par la personne technique. Si un tarif disparaît, corriger ou revenir à l'état précédent avant une nouvelle demande. »

Confrontation : livrable faisable depuis les données. La personne novice peut préparer la demande et les contrôles ; les moyens techniques pour conserver/restaurer la version restent à choisir avec le référent. Cette limite doit rester explicite.

### `ent-projects-release` — Terre Claire

Production : « Ne pas ouvrir le prototype qui n'enregistre rien. La personne technique connecte le registre et confirme les accès. Jo retrouve A puis B ; répéter A ne doit pas créer une troisième inscription. Tester téléphone, clavier et champ requis vide. Le responsable autorise l'ouverture après preuves. Si succès affiché sans entrée, retirer le formulaire, afficher le contact de Jo, rapprocher les demandes connues et tester la correction avant reprise. »

Confrontation : plan pertinent, mais A/B ne sont initialement que des étiquettes sans champs fournis. Ce n'est pas bloquant pour écrire le plan ; la formulation doit éviter de faire croire que des fiches complètes sont présentes. Même résultat répété et mécanisme de reconnaissance doivent être convenus avec le responsable technique, pas déduits du seul prénom.

### `ent-projects-maintenance` — Lanterne

Production : « Lila met à jour les textes mensuellement ; corriger d'abord l'horaire et planifier son rappel. Rémi reçoit les incidents. Lui demander emplacement, titulaire du compte, accès nominatifs, contenu sauvegardé et méthode de restauration ; laisser à confirmer tant que non connu, aucun mot de passe dans le guide. Dans les deux heures, traiter le défaut existant ; recueillir ensuite le problème derrière les deux demandes d'espace client avant estimation. »

Confrontation : responsabilités et arbitrage déterminables. Les deux heures ne prouvent pas qu'une restauration complète serait faisable. Besoin d'un modèle de dossier final réunissant les six étapes sur un même projet : les cas variés enseignent les méthodes mais obligent actuellement le novice à reconstruire seul cette continuité.

## Retours actionnables

1. Ajouter une synthèse finale réutilisable : besoin et public ; critères ; approche ; première demande ; recette ; entretien et questions ouvertes. Garder les six cas comme exemples variés.
2. Clarifier A/B comme identités de test à préparer et préciser que l'atelier produit un plan, pas un site connecté.
3. Les choix des QCM courants sont souvent évidents même avant la leçon. Renforcer la situation finale avec des compromis plausibles plutôt que des fonctions totalement hors besoin.
4. UI : montrer le livrable attendu avant la saisie, les critères avant comparaison et un moyen de conserver la proposition. La comparaison avec l'exemple ne doit jamais apparaître comme une validation automatique du travail.

Verdict simulé : parcours accessible pour préparer et piloter un petit projet ; ne constitue pas une formation pratique complète à un constructeur de site ou à un agent de développement. Aucune mesure de satisfaction ou d'efficacité auprès de salariés réels n'est revendiquée.
