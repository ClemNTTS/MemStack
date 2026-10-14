# Revue étudiant faible des 36 défis v3

Inspection du 13 octobre 2026. Les 36 dossiers et 108 questions ont été lus indépendamment. L’étudiant simulé reconnaît le diagnostic mais choisit une intervention et une vérification erronées. Aucun texte personnel, appel IA ni code étudiant exécuté.

Chaque cas attend `retry` : 1/3 (33,33 %), sous le seuil strict de plus de 70 %. Les fixtures vérifient des refus spécifiques ; elles ne mesurent pas l’apprentissage humain.

## docker-images-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Redémarrer l’ancien après avoir donné à v2 le tag v1. » — Refus justifié : Il faut créer le nouveau conteneur depuis l’image corrigée ; un tag ou un redémarrage ne modifie pas l’ancien.
- verification : « Conserver son nom pour retrouver ses données au prochain lancement. » — Refus justifié : La couche inscriptible disparaît avec le conteneur. Vérifier aussi l’image et le comportement du remplaçant.

## docker-volumes-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Créer un nouveau volume nommé à chaque remplacement sur /app/data. » — Refus justifié : Il faut réutiliser la même ressource persistante au chemin réellement utilisé par l’application.
- verification : « Récupération des anciennes notes dès que le nom du volume correspond au conteneur. » — Refus justifié : Aucune copie des anciennes notes n’existe. Un volume persiste mais reste exposé aux suppressions et écrasements.

## docker-ports-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Hôte : http://memstack-api:3000 ; worker : http://localhost:8080. » — Refus justifié : Le navigateur utilise le port publié de l’hôte ; le worker joint le nom réseau résolu et le port interne.
- verification : « La publication bloque également l’accès du worker à memstack-api:3000. » — Refus justifié : L’écoute dans le conteneur et la publication sur l’hôte ont des portées différentes. Le réseau partagé permet l’accès interne décrit.

## fund-shared-cart-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Muter draft[0].price puis recopier seulement le tableau. » — Refus justifié : Un nouvel objet pour l’article modifié rompt le partage du prix ; copier seulement le tableau ne suffit pas.
- verification : « cart[0].price = 10 et draft[0].price = 10. » — Refus justifié : Le brouillon reflète la modification sans affecter l’original. La validation explicite applique ensuite le changement voulu.

## fund-stock-invariant-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « 1, 1.5 et 3 ; pas 0, -2 ni 4. » — Refus justifié : La quantité doit être entière, strictement positive et ne pas dépasser le stock ; l’égalité est autorisée.
- verification : « Refus et stock ramené à -1. » — Refus justifié : Le refus précède la modification et conserve le stock. La concurrence en base est exclue du dossier.

## systems-env-process-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Définir PORT=4000 dans un terminal indépendant et garder le service actif. » — Refus justifié : Le lanceur doit transmettre la configuration au nouveau processus. Aucun rechargement n’est prévu ici.
- verification : « Afficher PORT=4000 dans un terminal indépendant puis considérer l’écoute corrigée. » — Refus justifié : Le résultat concerne le service et ses prochains lancements, pas uniquement la variable d’un terminal.

## http-stale-cache-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Supprimer v2 pour que navigateur et serveur utilisent l’ancien contenu. » — Refus justifié : Un ETag différent doit conduire à fournir le nouveau corps au lieu d’un faux 304.
- verification : « Ancien ETag : 304 ; nouvel ETag inchangé : 200 avec v1. » — Refus justifié : La première réponse actualise le cache ; la revalidation suivante peut économiser le corps inchangé.

## web-fetch-error-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Remplacer DELETE par GET et garder le message Supprimé. » — Refus justifié : Le statut doit être évalué avant confirmation. Le contrat API et les erreurs réseau restent à traiter.
- verification : « Afficher Supprimé et retirer seulement l’élément local. » — Refus justifié : Le serveur a refusé la suppression. Tester également le succès 2xx et une panne réseau.

## web-keyboard-action-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Un lien href=/ avec le même libellé et un focus visible, qui navigue sans appeler la sauvegarde. » — Refus justifié : Le bouton natif fournit sémantique et interactions clavier. Le type button évite une soumission involontaire.
- verification : « Deux clics souris ; deux sauvegardes ; aucune lecture du nom annoncé. » — Refus justifié : Il faut vérifier focus, activation et nom, au-delà d’un test visuel ou souris.

## js-zero-default-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « preference || 20 » — Refus justifié : ?? préserve zéro et utilise le défaut uniquement pour les valeurs nullish.
- verification : « 20, 7, 20, 20. » — Refus justifié : Zéro et les préférences positives sont explicites ; seules les valeurs absentes prennent 20.

## js-serial-requests-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Garder les await successifs et afficher chaque résultat immédiatement. » — Refus justifié : Promise.all attend les succès du groupe ; Promise.race ne garantit pas les trois résultats.
- verification : « Succès partiel avec alerts vide malgré le contrat fourni. » — Refus justifié : Le contrat interdit le succès partiel. Promise.all ne garantit pas l’annulation des autres opérations.

## ts-unchecked-api-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Ajouter une assertion as Profile et déclarer au compilateur que la réponse externe est fiable. » — Refus justifié : La validation d’exécution établit le contrat avant utilisation et prévoit une erreur contrôlée.
- verification : « Succès puisque le fichier TypeScript compile. » — Refus justifié : Ces entrées ne satisfont pas le contrat. Tester aussi une réponse valide ; la compilation ne valide pas le réseau.

## react-mutated-list-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « items.push("nouveau"); setItems(items) » — Refus justifié : La mise à jour fonctionnelle crée un nouveau tableau sans modifier le précédent.
- verification : « Un rendu forcé masque les ajouts perdus sans changer la mise à jour. » — Refus justifié : Le test porte sur le contenu final et l’absence de mutation ; forcer le rendu ne répare pas le modèle d’état.

## react-stale-search-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Attendre un délai fixe avant chaque setResults. » — Refus justifié : Un identifiant ou un indicateur invalidé au nettoyage protège l’application du résultat obsolète.
- verification : « Les deux recherches mélangées sans avertissement. » — Refus justifié : Les résultats doivent correspondre à la recherche courante. Vérifier aussi le changement de requête et le démontage.

## react-index-keys-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « key={Math.random()} » — Refus justifié : Les ids a, b et c sont stables et uniques. Une clé aléatoire recrée les instances et perd leur état.
- verification : « Sur l’article d’id a parce qu’il était premier. » — Refus justifié : Le brouillon appartient à Beta/b. Faire varier la liste permet de vérifier cette identité.

## backend-invalid-body-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « 0, 1 et 5 ; pas "1", 6, 1.5 ni un champ absent. » — Refus justifié : Le contrat exige le type numérique entier de 1 à 5. Une conversion implicite élargirait ce contrat.
- verification : « Statut 201 et reserve appelé avec la chaîne. » — Refus justifié : La validation précède l’effet métier. Permissions et disponibilité restent des contrôles distincts.

## backend-payment-retry-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Réutiliser la clé au navigateur et désactiver le bouton, sans déduplication dans insertPayment. » — Refus justifié : La garantie vient de la déduplication atomique côté serveur, pas de la clé seule.
- verification : « Modifier silencieusement le paiement initial à 20. » — Refus justifié : La clé identifie la même intention et son contenu. Tester aussi retries identiques, concurrence et résultat unique.

## backend-env-secret-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Annoncer prêt puis utiliser une URL par défaut inconnue si elle manque. » — Refus justifié : Le diagnostic peut nommer la variable, mais ne doit pas révéler son contenu.
- verification : « Oui ; écouter sur 3000 garantit l’accès à la base. » — Refus justifié : Une configuration valide ne garantit pas le réseau ni la disponibilité. Tester les démarrages absent et valide sans divulgation.

## data-left-join-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Remplacer LEFT JOIN par INNER JOIN en gardant le WHERE. » — Refus justifié : Le filtre de correspondance dans ON préserve les clients sans commande confirmée ; COUNT(o.id) ne compte pas les lignes NULL.
- verification : « Client absent, client absent et 2. » — Refus justifié : Le comptage de l’id non nul donne les zéros attendus sans compter la ligne sans correspondance comme commande.

## data-transfer-atomicity-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Deux UPDATE en autocommit séparés par une pause. » — Refus justifié : La transaction doit couvrir les deux effets. Elle ne rendrait pas atomique un appel externe, exclu ici.
- verification : « Le total conservé malgré un débit sans crédit correspondant. » — Refus justifié : L’échec annule toute l’unité. Tester aussi le succès et la conservation du total.

## data-firestore-retry-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Désactiver le contrôle de conflit pour garantir un unique callback. » — Refus justifié : Un événement validé avec les données peut être traité hors callback ; retries et déduplication restent à définir.
- verification : « Le commit est annulé automatiquement si l’envoi externe échoue ensuite. » — Refus justifié : Le déplacement évite les répétitions du callback mais ne garantit pas la livraison durable ou unique.

## security-object-owner-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Côté serveur, accepter toute session sans examiner la note. » — Refus justifié : Le contrôle serveur doit utiliser une identité de confiance et l’objet demandé, pas une permission déclarée par le client.
- verification : « Tous comptes autorisés si leur navigateur masque le bouton de lecture. » — Refus justifié : Le test porte sur l’accès serveur et l’absence de fuite. Masquer un contrôle n’empêche pas une requête directe.

## security-sql-concatenation-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Interdire les apostrophes puis garder la concaténation. » — Refus justifié : La paramétrisation garde les valeurs hors de la structure SQL ; une validation de format peut compléter sans la remplacer.
- verification : « Elle est sûre dès que le seul test avec Alice réussit. » — Refus justifié : Tester nom ordinaire, apostrophe et forme SQL confirme que toutes les entrées restent des valeurs.

## security-html-comment-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « commentElement.innerHTML = storedComment.trim() » — Refus justifié : textContent crée du texte sans interpréter les balises. trim ne neutralise pas l’interprétation HTML.
- verification : « Commentaire supprimé entièrement même si le contrat demande son affichage. » — Refus justifié : Le contrat demande du texte brut, pas de supprimer tout commentaire contenant des balises. Les protections dépendent du contexte de sortie.

## tests-empty-pass-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « assert.equal(typeof discount(100, 10), 'number') » — Refus justifié : Le contrat exige 90. Vérifier le type ou la valeur fautive ne détecte pas ce défaut.
- verification : « Succès uniquement après suppression de l’assertion. » — Refus justifié : Le contrôle avant/après montre que le test distingue le défaut. Compléter avec une remise nulle et un autre cas utile.

## tests-expiry-boundary-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « now <= expiresAt » — Refus justifié : Le jeton n’est valide que strictement avant l’expiration.
- verification : « false, true, true. » — Refus justifié : Injecter ces instants teste la frontière sans attente réelle ; le seul cas à 500 ne couvre pas l’égalité.

## tests-mock-contract-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Faire renvoyer un tableau vide au faux et conserver result.map. » — Refus justifié : Il faut suivre la structure documentée ; une assertion ne transforme pas l’objet reçu.
- verification : « Tableau nu : seul test vert ; objet réel jamais vérifié. » — Refus justifié : Le test de frontière représente le fournisseur et prévoit les erreurs. Une intégration contrôlée peut compléter les limites des doubles.

## architecture-rule-ui-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Remise dans la page seulement ; export indépendant du contrat. » — Refus justifié : Le calcul commun porte la règle, sans obliger à fusionner les interfaces.
- verification : « 99, 100 et 90.9 dans les deux consommateurs. » — Refus justifié : La remise s’applique dès 100 inclus, pas avant. Ces cas couvrent le seuil et la cohérence entre consommateurs.

## architecture-invalid-state-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Garder les booléens indépendants et rendre success prioritaire visuellement sans clôturer loading. » — Refus justifié : Un état unique évite chargement et succès simultanés. saved vient après confirmation et failed après échec.
- verification : « saved remplace saving puisque la requête a été envoyée. » — Refus justifié : L’échec clôture le chargement et reste distinct du succès ; vérifier les deux issues.

## architecture-lost-write-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Renvoyer automatiquement le document complet de Bob en cas de différence de version sans résolution. » — Refus justifié : La comparaison doit être atomique au point d’écriture ; une lecture préalable seule laisse une course.
- verification : « Toutes deux acceptées ; dernière décide silencieusement du contenu. » — Refus justifié : Le conflit permet une résolution explicite avec la version récente. Le dernier arrivé gagne ne satisfait pas le contrat.

## performance-lcp-lazy-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Précharger une image hors écran et conserver hero.webp en chargement lazy. » — Refus justifié : L’image LCP visible ne doit pas être différée comme les images hors écran. La priorité est à cibler et mesurer.
- verification : « Poids de hero.webp uniquement, sans nouvelle mesure du LCP. » — Refus justifié : Mesurer dans les mêmes conditions vérifie le bénéfice et les régressions ; prioriser tout ferait perdre le ciblage.

## performance-eager-module-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Bouton supprimé mais heavy-pdf conservé au démarrage. » — Refus justifié : L’import dynamique charge au moment pertinent ; le bouton doit gérer l’attente et l’échec.
- verification : « Temps initial seulement, sans vérifier exports ni erreurs. » — Refus justifié : Le coût est reporté, pas supprimé quand on exporte. Mesurer ouverture et première action couvre le compromis.

## performance-nplusone-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Toutes les publications et tous les auteurs sans limite à chaque ouverture. » — Refus justifié : Le regroupement ou une jointure paginée réduit les lectures ; la concurrence seule ne supprime pas les requêtes N+1.
- verification : « Plan d’une requête seulement, en acceptant de changer pagination et résultats. » — Refus justifié : La réduction doit conserver le contrat et se mesurer ; une jointure n’est pas toujours la plus rapide.

## engineering-staged-old-version-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Préparer aveuglément tous les fichiers même sans rapport avec la correction. » — Refus justifié : L’ajout actualise l’index ; une préparation ciblée évite les modifications sans rapport.
- verification : « Le message du commit seul, considéré comme preuve de contenu. » — Refus justifié : git diff --cached montre l’index. Examiner le commit puis les changements restants confirme le contenu enregistré.

## engineering-semantic-conflict-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Refuser seulement price <= 0 car cette branche est retenue. » — Refus justifié : Une résolution doit préserver le sens des deux changements, pas seulement retirer les marqueurs.
- verification : « Prix positif avec remise 10 % seulement. » — Refus justifié : Chaque défaut doit être rejeté séparément et ensemble ; le cas valide doit rester accepté.

## engineering-stack-origin-diagnostic

Diagnostic reconnu ; correction et vérification inadéquates. Résultat attendu : refus, 1/3.

- action : « Modifier seulement le routeur car il est dernier dans la pile. » — Refus justifié : La reproduction isole le défaut ; le contrat détermine validation ou repli explicite. Un nom de repli exige l’accord du produit.
- verification : « Succès forcé pour les deux sans examiner le contrat. » — Refus justifié : Couvrir le déclencheur sans casser le cas valide. La pile localise l’exception sans expliquer seule l’origine de la donnée invalide.

## Contrôles du correcteur et contournements

Le correcteur réel `functions/src/challengeChecks.mjs` a refusé les 36 cas faibles. Pour chaque défi, les quatre formes malveillantes suivantes ont également été rejetées, soit 144/144 : aucune sélection ; diagnostic vide ; sélection de plusieurs options ; question inconnue ajoutée.

La revue du serveur constate : champs exacts, UID issu de Google Auth, options connues, résultat server-only immuable, reprise d’une tentative avec comparaison des réponses. Les suites de tests du serveur et des règles couvrent aussi : verdict/UID forgés, versions anciennes, questions absentes, et remplacement d’une réponse sous le même identifiant. Ancienne analyse IA ou autoévaluation understood ne doit pas valider un défi v3. IA désactivée, panne et quota ne doivent pas empêcher la validation en code.

## Ajustements pédagogiques et limites

Le distracteur de préchargement LCP signalé a été remplacé : précharger une autre image hors écran ne corrige pas le délai du hero conservé lazy. Le cycle des options correctes a été supprimé et les réponses réparties entre a/b/c ; les actions à indices de longueur les plus marqués ont été rééquilibrées. Les nouveaux distracteurs ont été relus.

Les clés et explications doivent rester côté serveur ; une correction est révélée après accusé d’enregistrement. Les corrections accessibles après tentative peuvent préparer un nouvel essai. Le score atteste la réussite aux questions ; il ne garantit pas une maîtrise autonome. Aucune auto-validation n’est proposée.
