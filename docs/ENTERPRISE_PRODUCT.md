# MemStack Entreprise — contrat produit et qualification V1

Date : 15 octobre 2026. PO et QA indépendants de la réalisation. Ce document fixe les résultats attendus ; il ne constitue pas une preuve de déploiement.

## Deux environnements, un compte

Une personne conserve son identité Firebase et peut apprendre dans Développement et dans une ou plusieurs organisations. Le sélecteur d’environnement est explicite et l’organisation courante reste visible. Choisir un espace ne transfère aucune progression.

L’isolation porte sur le stockage et les autorisations, pas seulement sur les listes affichées. L’espace Développement existant garde ses identifiants, cartes, défis, progression, abonnement personnel et classement mondial. L’espace Entreprise possède son catalogue, ses révisions, ses tentatives, ses badges, son niveau et sa série. Un salarié de deux organisations dispose de deux progressions Entreprise distinctes.

### Contrat technique minimal

- Périmètre d’une opération : `(uid, environment, organizationId)`. Le serveur déduit `uid` de Firebase Auth ; il vérifie l’adhésion active et le droit de l’organisation avant chaque opération Entreprise.
- Le stockage Développement actuel `users/{uid}/…` reste inchangé. Les données Entreprise sont placées dans un sous-arbre d’organisation distinct, par exemple `organizations/{organizationId}/members/{uid}/…`. Le chemin final doit être documenté avec les règles déployées.
- Les contenus Entreprise possèdent des identifiants stables dédiés `ent-*` (ou un autre préfixe réservé, documenté par le catalogue). Leur banque de cartes et de questions ne doit pas importer le catalogue Développement.
- Les clés locales, reçus d’idempotence, brouillons et réponses asynchrones sont rattachés au compte et à l’organisation. Une réponse d’un ancien espace ne remplace jamais l’espace affiché.
- Les actions Entreprise ne mettent à jour ni `_worldRanking`, ni les quotas personnels, ni les cartes Développement. Les actions Développement ne mettent à jour aucun classement d’organisation.
- Les membres lisent leurs réponses et leur progression. Un manager dispose d’indicateurs d’équipe et des informations nécessaires à l’administration ; il n’obtient pas implicitement l’accès aux réponses détaillées des salariés.
- Les rôles, adhésions et droits commerciaux sont attribués par un serveur de confiance. Un champ envoyé par le navigateur n’accorde aucun droit. Connaître une adresse ou un identifiant d’organisation ne constitue pas une invitation.
- Les callables Firebase existantes sont étendues ou complétées ; aucun nouveau fournisseur, exécution de code apprenant ou correcteur IA n’est nécessaire. Les plafonds et alertes budgétaires existants restent inchangés.

## Offre continue

Promesse : « Des équipes qui savent utiliser l’IA, vérifier ses résultats et mener des projets utiles — avec des réflexes entretenus dans la durée. »

L’offre comprend le parcours guidé initial, les révisions espacées après les cours, l’accès aux nouvelles leçons publiées et le suivi d’équipe. La dernière leçon ne ferme pas l’espace et n’efface pas les échéances. L’écran final propose les cartes dues et explique comment les nouvelles missions apparaîtront. Aucune promesse de cadence éditoriale ou de certification réglementaire ne doit être inventée. Le tarif Entreprise autorisé est désormais de **10 € TTC par membre actif et par mois**, avec mise à jour automatique de la quantité Stripe. Le tarif personnel reste une offre distincte.

Les leçons non encore publiées ne sont pas mises en scène comme des contenus déjà disponibles. Une mise à jour conserve les identifiants existants et ne réinitialise pas l’historique. Les cartes futures ne sont jamais avancées pour remplir une file vide.

### Contrat commercial Stripe Entreprise

Décision du propriétaire intégrée au présent contrat : facturation mensuelle de 1 000 centimes d’euro TTC par adhésion active. « Actif » signifie que la personne appartient actuellement à l’organisation avec un accès membre actif ; ce n’est ni une connexion quotidienne, ni une activité dans les trente derniers jours, ni un nombre de cartes révisées. Le responsable est un membre facturé. Une invitation non acceptée ne compte pas. Une même personne active dans deux organisations est comptée une fois dans chacune.

La quantité est calculée côté serveur à partir des adhésions de confiance. Le navigateur ne choisit ni le nombre facturé, ni le prix, ni le client Stripe, ni le droit d’accès. Le tarif Stripe doit être explicitement Entreprise, EUR, récurrent mensuel, par unité et taxe incluse, sans transformation ou palier implicite. L’identifiant de tarif Premium personnel ne peut pas être réutilisé. Un accès Premium personnel, même permanent, n’accorde aucun abonnement Entreprise.

Le responsable voit avant Checkout le nombre de membres actuellement actifs, le prix unitaire TTC et le montant récurrent mensuel correspondant. La présentation explique que les adhésions et retraits modifieront automatiquement cette quantité et que des ajustements au prorata peuvent apparaître. Elle distingue clairement abonnement de l’organisation et compte personnel. Un retour sur la page de succès ne prouve jamais un paiement.

L’adhésion acceptée, le retrait d’un membre et la suppression d’un compte mettent à jour le nombre de membres dans la même transaction que le changement d’accès et produisent une tâche persistante de rapprochement Stripe. Les invitations seules n’en produisent pas. Deux adhésions concurrentes ne doivent ni perdre un incrément ni facturer deux fois la même personne ; une réadhésion conserve une seule adhésion active.

Le rapprochement transmet à Stripe une **quantité absolue** correspondant à la dernière révision connue de l’organisation. Il est rejouable et protégé par une clé d’idempotence stable par opération/révision. Un ancien travail ne doit jamais écraser une quantité plus récente. Si le nombre change pendant l’appel Stripe, la nouvelle révision reste à rapprocher. Une erreur ou un délai réseau ne doit pas marquer la tâche terminée et ne doit pas créer un deuxième abonnement. Les reprises automatiques sont bornées ; le responsable voit un état de rapprochement en attente ou en erreur lorsqu’il est nécessaire d’intervenir.

Le choix exact de prorata et de date de facturation doit être documenté par l’implémentation avant activation : une variation du nombre de places déclenche normalement un prorata chez Stripe, mais un crédit n’est pas un remboursement automatique et une proratisation n’implique pas nécessairement un prélèvement immédiat. Les factures impayées demandent un traitement explicite afin de ne pas créditer du temps jamais payé. Ces points suivent les [règles de prorata Stripe](https://docs.stripe.com/billing/subscriptions/prorations).

Seul un abonnement de l’organisation vérifié côté serveur, dans le bon mode test/live, avec le client, le tarif et les métadonnées attendus, accorde l’accès commercial. Paiement initial incomplet, essai, facture ouverte ou échouée et abonnement résilié ne doivent pas être interprétés comme un paiement acquis. Une résiliation en fin de période conserve l’accès jusqu’à l’échéance payée puis le retire ; les données pédagogiques restent conservées. L’état commercial ne dépend pas d’un champ client.

Les notifications Stripe exigent leur signature sur le corps brut et un traitement idempotent. Leur ordre n’est pas garanti : la mise à jour de l’accès se base sur l’objet Stripe actuel, pas sur une photographie d’événement ancienne susceptible de réactiver un abonnement résilié. Les reprises, doublons et notifications arrivant avant l’association locale client/abonnement font partie de la qualification. Voir [la documentation des webhooks Stripe](https://docs.stripe.com/webhooks).

Si aucun membre actif ne reste, l’organisation ne continue pas à payer une place fictive. L’implémentation doit traiter explicitement la quantité zéro avec une suspension ou une résiliation compatible Stripe et éviter de recréer automatiquement un abonnement lors d’une reprise technique. Le cas du dernier responsable supprimé reste récupérable par l’administration, sans réactiver une facturation à son insu.

Une suspension administrative est distincte d’un paiement incomplet : une notification de facture payée ne réactive jamais un espace suspendu par l’administration. Si le dernier responsable disparaît alors que des collaborateurs restent membres, l’organisation orpheline suspendue ne doit pas continuer à être facturée indéfiniment sans personne capable de gérer l’abonnement. Le traitement de sortie de facturation et la reprise administrative doivent être explicites. Le webhook Entreprise reste exploitable lorsque l’offre Premium personnelle est désactivée ou non configurée ; il ne dépend pas d’une validation des tarifs B2C.

La configuration locale et les tests n’autorisent aucune création de produit/prix live, aucune facture réelle, aucun changement de plafond ou aucune modification de l’abonnement personnel. L’activation de la configuration et les preuves de paiement test doivent être distinguées d’une publication effective.

## Parcours phare guidé

Titre : **Travailler avec l’IA : des usages utiles aux projets maîtrisés**. Public : collaborateurs et managers sans prérequis de développement. Vingt missions ordonnées, regroupées en huit étapes ; durée indicative de dix à quinze minutes par mission, sans obligation de finir en quatre semaines.

| Étape | Missions | Compétence observable | Situation de référence |
| --- | --- | --- | --- |
| Comprendre l’outil | 1–2 | Distinguer génération, recherche et exécution ; reconnaître les limites | Une synthèse convaincante invente une référence et prétend avoir envoyé un email |
| Protéger les informations | 3–5 | Classer les données, minimiser le contexte, appliquer les règles internes | Un collègue veut transmettre un export clients à un assistant public |
| Formuler une demande | 6–8 | Définir objectif, audience, contexte, contraintes, exemples et format ; itérer avec un critère de réussite | Préparer une réponse client à partir d’une fiche produit et de règles métier |
| Vérifier les résultats | 9–11 | Contrôler faits, calculs et sources ; distinguer document utile et instruction hostile | Une pièce jointe demande de contourner les consignes et la réponse oublie une exception |
| Choisir une solution proportionnée | 12–13 | Comparer besoin, coûts, volume et impacts écologiques ; éviter les chiffres universels sans source | Choisir entre règle simple, recherche documentaire et génération systématique |
| Cadrer un projet | 14–16 | Définir problème, données, responsables, mesure de réussite et alternative | Transformer « il nous faut un chatbot » en un pilote borné |
| Utiliser les agents avec contrôle | 17–18 | Distinguer assistant et agent outillé ; limiter outils et permissions ; prévoir approbations et arrêt | Un agent prépare un remboursement mais doit obtenir un accord avant l’action réelle |
| Décider et entretenir | 19–20 | Tester cas difficiles, fixer les conditions d’arrêt et organiser le suivi | Décider de poursuivre, modifier ou abandonner un pilote sur dossier chiffré |

### Exigences éditoriales

Chaque mission contient un objectif unique, une situation crédible, un exemple détaillé, au moins un contre-exemple, un exercice vérifiable, une correction expliquée et des cartes de rappel. Les premiers exemples expliquent les termes « prompt », « contexte », « agent » et « outil » avant leur réutilisation. Un bon prompt ne garantit jamais un résultat vrai.

Le contexte est présenté comme les informations utiles à fournir : audience, documents autorisés, données, contraintes et exemples. Les informations fournies par un document externe ne deviennent pas des autorisations. Les missions agents couvrent explicitement les actions externes, les permissions minimales, l’approbation humaine pour les actions sensibles, les limites de coût/temps et le journal de contrôle.

Les cas emploient uniquement des entreprises et documents fictifs identifiés comme tels. Les photographies ou illustrations ont une provenance et une alternative textuelle ; les images générées sont présentées comme des illustrations, jamais comme des preuves. Les captures d’un outil sont datées si son interface est susceptible de changer. L’image aide à comprendre une situation ; aucune information indispensable n’est réservée à l’image.

Les références sont primaires et reliées aux affirmations concernées. Les limites des mesures environnementales sont expliquées ; aucun équivalent « une requête = X » n’est affirmé sans périmètre et incertitude. Les contenus ne promettent pas la conformité juridique d’une entreprise après simple complétion.

L’inspection pédagogique est indépendante de la rédaction. Un test technique réussi ne valide pas un exemple ambigu ou une correction contradictoire. Les défis ont au moins cinq questions naturelles, corrigées en code côté serveur ; leurs clés ne sont pas dans le bundle public. Les réponses ne nécessitent pas un appel à une IA.

## Expérience apprenant et manager

Le salarié voit d’abord sa prochaine mission, ses révisions dues, son niveau et sa série Entreprise, puis le chemin guidé. Les missions déjà faites restent consultables. La reprise est sauvegardée après accusé serveur ; une panne ne présente pas une réussite fictive. Une erreur pédagogique explique quoi retravailler et propose une nouvelle tentative sans effacer l’historique.

Le classement de l’espace Entreprise affiche uniquement les membres de l’organisation, sous leur pseudo. Il remplace le classement mondial dans cet espace. Les égalités sont explicites ; les dates utilisent Europe/Paris comme le classement actuel. Une absence de données ou une erreur de lecture ne devient pas un classement inventé. Les scores et séries proviennent d’activités Entreprise acceptées par le serveur.

Le manager dispose du nom de l’organisation, de ses membres et rôles, d’un moyen contrôlé d’inviter/révoquer et d’indicateurs d’avancement. Les nouvelles autorisations restent soumises au contrôle serveur. Les invitations n’envoient aucun email sans instruction explicite du propriétaire ; un lien ou code peut être présenté au manager pour transmission. La suppression ou révocation retire l’accès et le classement sans effacer silencieusement l’historique personnel requis. La politique de conservation doit être décrite avant ouverture commerciale.

## Matrice QA bloquante

| Scénario | Résultat attendu |
| --- | --- |
| Ancien compte, Développement uniquement | IDs, historique, droits Premium et échéances inchangés |
| Même compte, Développement puis Entreprise puis retour | Aucune carte, leçon, tentative, série ou badge de l’autre espace |
| Même compte, organisations A puis B | Deux progressions et classements indépendants ; A ne peut pas lire B |
| Non-membre avec URL ou payload modifié | Refus côté serveur, sans fuite de nom, membres ou progression |
| Membre modifie son rôle ou son droit dans le navigateur | Aucun privilège accordé ; règles refusent l’écriture |
| Révocation pendant une session | Prochaine lecture/écriture refusée, état sensible retiré de l’écran |
| Changement d’espace pendant une requête lente | Ancienne réponse ignorée ; aucune confirmation dans le nouvel espace |
| Double clic ou réponse réseau perdue | Un seul reçu, une seule activité et un seul incrément de série |
| Fin des vingt missions | Révisions maintenues aux bonnes dates ; nouvelles missions visibles à publication |
| File vide | Message utile et prochaine échéance ; aucune carte future avancée |
| Élève fort | Parcours réalisable avec les informations des cas ; bonnes réponses acceptées sans IA |
| Élève faible | Mauvais choix expliqués, reprise claire, jargon défini, défi retentable |
| Historique ou version de questionnaire ancienne | Lisible mais ne valide pas automatiquement une nouvelle version |
| Classement d’organisation | Aucun membre externe, aucun UID/email exposé, activités Dev sans effet |
| Manager | Administration bornée à son organisation ; pas de réponses personnelles détaillées par défaut |
| Mobile et clavier | Chemin, missions, révisions et formulaires accessibles sans débordement ; mouvement réduit respecté |

Vérifications avant publication : build et tests frontend, tests Functions, règles et transactions sur émulateur pour les autorisations, contrôle d’absence de clés dans le bundle, scénarios navigateur multi-espace et inspection pédagogique consignée. Tant que ces preuves manquent, l’implémentation reste une préparation locale et ne doit pas être annoncée comme activée pour de vraies organisations.

### Qualification bloquante de la facturation Entreprise

| Scénario | Résultat attendu |
| --- | --- |
| Responsable seul | Quantité 1, 10 € TTC par mois |
| Responsable et quatre collaborateurs actifs | Quantité 5, 50 € TTC mensuels hors ajustements de période |
| Dix invitations en attente ou expirées | Aucune place supplémentaire facturée |
| Aucun membre ne se connecte pendant un mois | Quantité inchangée tant que les adhésions restent actives |
| Deux collaborateurs rejoignent en concurrence | Quantité finale initiale + 2 ; aucun incrément perdu |
| Double acceptation ou nouvel envoi de la même requête | Une seule adhésion et un seul effet de facturation |
| Retrait puis réadhésion | Retrait répercuté ; retour compté une seule fois, progression conservée |
| Suppression d’un membre | Retrait de l’adhésion, rapprochement de quantité, pas de place fantôme |
| Suppression du dernier responsable / dernier membre | Accès et facturation traités explicitement ; pas de place minimale facturée à tort |
| Dernier responsable supprimé avec collaborateurs restants | Suspension et sortie de facturation explicites ; récupération administrative documentée |
| Changement d’adhésion pendant Checkout | Rapprochement de la quantité courante après paiement ; pas de quantité obsolète persistante |
| Timeout après succès Stripe mais avant accusé local | Reprise idempotente, sans deuxième abonnement ni deuxième prorata |
| Ancienne tâche termine après une tâche récente | La quantité finale redevient la dernière quantité de confiance ; ancienne révision non annoncée synchronisée |
| Panne Stripe prolongée | Tâche persistante et reprises bornées ; état en attente/erreur visible |
| Prix client, quantité client, org ou client Stripe forgé | Refus serveur ; aucune modification d’une autre organisation |
| Facture initiale ouverte, échouée ou SCA inachevée | Aucun accès payant accordé par le retour Checkout |
| Impayé de renouvellement puis régularisation | Accès suit l’état vérifié ; réactivation seulement après régularisation admissible |
| Résiliation en fin de période | Accès jusqu’à l’échéance payée, puis retrait sans effacer les acquis |
| Notification signée rejouée ou ancienne après résiliation | Aucun double traitement ni rétablissement indu |
| Facture payée après suspension administrative | Suspension administrative conservée ; aucun rétablissement automatique |
| Webhook B2B alors que B2C est désactivé/non configuré | Événement B2B traité indépendamment ; pas d’échec dû aux tarifs personnels |
| Offre Premium personnelle payée ou permanente | Aucun droit Entreprise ; données B2C et Stripe client personnel inchangés |
| Test/live incohérents ou tarif non TTC / non mensuel | Refus fermé de la configuration et du droit |

Les doubles de Stripe utilisés dans les tests doivent pouvoir simuler réponse perdue après application, erreur avant application, changement de quantité concurrent et webhook désordonné. Les tests unitaires seuls ne prouvent pas qu’un produit, un tarif, un webhook et Checkout sont configurés correctement dans le compte Stripe.

#### Revue indépendante de la facturation implémentée

Onze tests indépendants dans `functions/src/enterpriseBilling.qa.test.mjs` passent sans réseau ni compte Stripe réel. Ils qualifient les paramètres de confiance et l’exclusion des tarifs B2C ; le comptage responsable + collaborateurs acceptés sans invitations ni membres retirés ; la réutilisation du client Stripe au-delà de vingt-quatre heures ; le refus de payer un espace suspendu ; les retours de Checkout/portail dans l’organisation concernée ; la configuration du portail interdisant les quantités manuelles ; la convergence d’une quantité modifiée pendant l’appel ; le rejeu après réponse Stripe perdue ; la conservation d’une suspension administrative ; l’absence de boucle sur quantité déjà correcte ; la reprise d’un écart fournisseur ; l’arrêt après huit échecs automatiques ; et l’absence de crédit de prorata sur une facture impayée lors d’un retrait ou d’une annulation à zéro membre.

Les trois tests de contrat du module de facturation passent également. La relecture du routeur de webhook confirme que les événements Entreprise reconnus ne passent plus par la résolution des tarifs Premium personnels. Le worker n’est pas relancé par les seuls changements de lease ou d’erreur ; ses erreurs déclenchent une reprise différée et bornée. Après huit échecs, l’outbox reste visible comme non rapprochée et nécessite une reprise autorisée.

Politique constatée dans le code : les variations de quantité produisent des proratas reportés, sans facture intermédiaire forcée ; lorsque la facture courante n’est pas payée, la mise à jour n’ajoute pas de crédit de temps impayé. La quantité zéro déclenche une annulation explicite. Ces comportements doivent être requalifiés avec le produit Stripe Managed Payments effectivement configuré avant activation réelle. Le portail doit conserver le choix commercial de résiliation en fin de période si c’est ce qui est présenté aux clients.

Les tests d’intégration sur émulateur, le navigateur, le build complet et la configuration Stripe test/live restent des preuves distinctes à consolider dans la livraison. Aucune facture, création de produit ou modification de paiement réel n’a été effectuée par l’agent PO/QA.

Relecture frontend de facturation : les réponses sont ignorées après démontage du composant, dont la clé inclut l’identité et l’organisation. Le lecteur de statut vérifie l’identifiant de l’organisation et le SDK vérifie encore l’UID après la réponse. Les destinations de paiement sont bornées aux hôtes Stripe attendus. L’espace non payé reçoit un écran de facturation ou d’attente plutôt que des missions, cartes ou défis Développement.

Un défaut de reprise après paiement a été relevé et corrigé : vérifier le statut Stripe pouvait afficher « actif » dans le composant de facturation tout en laissant le workspace parent en état non payé. Le bouton d’ouverture appelle désormais explicitement un rafraîchissement du workspace parent, même si l’URL de l’organisation est déjà courante ; l’accès pédagogique est donc relu avant affichage. Les vérifications navigateur de livraison doivent confirmer ce passage du statut en attente vers l’accès actif.

## Inspection indépendante du premier lot — 15 octobre 2026

Périmètre inspecté : `shared/enterpriseCurriculum.json`, `shared/enterpriseAssessmentKeys.json`, `functions/src/enterprise.mjs`, `src/enterprise/model.ts`, `src/enterprise/EnterpriseWorkspace.tsx` et les tests d’intégration associés. Il s’agit d’une revue du code et du contenu ; les tests navigateur et l’émulateur sont rapportés séparément par leur exécutant.

- Le cas Aster établit explicitement son caractère fictif et réutilise les mêmes personnages, politiques et contraintes. Les missions expliquent les termes avant leurs usages avancés ; elles distinguent génération et action, contextualisation et autorisation, prompting et vérification, assistant et agent outillé.
- Les calculs des dossiers ont été refaits : gain hebdomadaire net de 200 minutes et coût récurrent de 150 € hors intégration. Les impacts environnementaux sont présentés avec périmètre et incertitudes. Les promesses juridiques ou de compétence professionnelle par classement sont explicitement écartées.
- Lecture « élève fort » : les cinq bonnes réponses de chaque défi peuvent être déterminées à partir des pièces sans deviner un comportement de modèle. Lecture « élève faible » : les contre-exemples correspondent aux erreurs expliquées dans les missions. Une stratégie consistant à toujours choisir la deuxième proposition n’obtient que deux ou trois bonnes réponses par défi ; elle ne franchit jamais le seuil de quatre sur cinq.
- Quatre tests indépendants dans `src/enterprise/model.qa.test.ts` passent : exclusion des contenus Développement et des complétions futures ; échéances et dates de révision fiables ; vingt missions puis modules continus sans perte des cartes ; séparation des clés par identité et organisation.
- Points remontés pour correction avant publication : versions des tentatives et grilles, explications après correction des défis, avancement dans l’espace manager, absence d’import Développement dans le menu Entreprise, retrait des données affichées après révocation détectée, et suppression des relectures complètes du workspace à chaque carte pour maîtriser le coût. Les durées des missions demandent également une estimation adaptée au contenu réel.

Ce compte rendu décrit le premier lot inspecté, pas l’état final de ces corrections. Leur clôture doit être confirmée dans le rapport de qualification final.

### Relecture de clôture du code

La seconde inspection confirme les corrections suivantes dans le code intégré : les requêtes de défis portent la version du catalogue et le serveur refuse une version incompatible ; les tentatives conservent les versions de contenu et de grille ainsi que les textes et explications de leur correction. L’historique affiche ces snapshots et distingue les anciennes versions. Les clés et explications privées ne sont importées que par le backend.

L’interface ne recharge plus toute la progression après chaque carte. Le retour vers le chemin, le classement ou l’équipe déclenche une actualisation explicite ; les réponses de sauvegarde mettent à jour uniquement la progression du périmètre capturé. Un changement de compte ou d’organisation invalide les réponses tardives. Le refus d’accès détecté lors d’une sauvegarde pédagogique retire le workspace affiché. Les actions de gestion et d’alias sont aussi contrôlées côté serveur ; un refus de permission y déclenche désormais une relecture du workspace, qui retire les données si l’accès a été révoqué.

L’espace manager affiche maintenant les nombres de missions, cartes et situations travaillées ainsi que la dernière activité, sans exposer les réponses d’autrui. Le menu Entreprise masque l’import de progression et la formule Premium personnelle. L’export inclut les reçus et limites Entreprise ; la suppression couvre également les invitations utilisées même si l’adresse du compte a changé.

Les ateliers pratiques et les quarante explications de défis ont été réinspectés. Les durées sont désormais indicatives, à dix minutes par mission. Six tests QA indépendants passent après ajout de deux cas : les niveaux ne comptent ni contenus inconnus ni dates futures ni répétitions d’historique ; les badges demandent toutes les missions du chapitre et restent indépendants entre deux progressions d’organisation. La vérification TypeScript des tests passe également.

Cette clôture concerne la revue du code et les tests indépendants exécutés. Elle ne remplace pas les résultats de build, d’émulateur et de navigateur, ni une preuve de déploiement. Aucun compte réel n’a été modifié par cette inspection.

Point commercial final : la souscription standard s’ouvre par « Créer mon organisation », puis par le paiement Stripe à 10 € TTC par membre actif et par mois. Le brief facultatif sur `/business?pilot=1` sert à cadrer les objectifs et critères de réussite ; il reste local et ne déclenche ni souscription ni envoi. Le téléchargement a été vérifié sur des données fictives. Les pilotes administrés restent une capacité d’administration explicite, distincte de l’abonnement standard.

Le retour navigateur « abonnement en attente → statut actif → ouvrir mon organisation » a été vérifié localement : le callback relit le workspace même lorsque l’URL est identique, puis affiche le chemin du bon espace. Les organisations suspendues affichent un message adapté et ne proposent pas de nouveau paiement ; leur responsable peut encore consulter les factures et résilier.
