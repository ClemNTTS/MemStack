# Signalements et corrections assistées

## Circuit

Le bouton **Signaler un problème** accompagne les leçons et les cartes. Le formulaire envoie uniquement le commentaire, le type de problème et une copie versionnée du contenu. Éviter toute donnée personnelle dans le commentaire : il est transmis à Mistral et peut figurer dans une PR du dépôt public.

Firestore conserve les signalements sous `users/{uid}/contentReports/{id}`. Le propriétaire peut les créer et les lire, mais ne peut modifier leur statut ni les supprimer. La progression ne change pas.

Une Action planifiée toutes les six heures traite au plus un signalement par exécution. GitHub peut retarder les tâches planifiées ; **Envoyer** confirme la réception, pas une correction immédiate. Le workflow reste désactivé tant que `CONTENT_REPORTS_ENABLED` n’est pas `true`.

Le rédacteur Mistral propose des changements textuels bornés ; un second appel inspecte la proposition et ses sources. L’inspecteur peut refuser. Les modèles n’ont accès ni au shell, ni aux secrets, ni à la progression. Les IDs, transitions, images et règles d’apprentissage ne peuvent être modifiés. Les sources consultées sont celles du registre `SOURCES.md`, jamais une URL fournie par le signalement.

Une proposition acceptée enrichit `src/data/catalog/corrections.json`, accompagnée d’un compte rendu d’inspection. Ce registre est appliqué lors de l’assemblage du catalogue et permet de corriger les anciennes leçons sans changer leurs IDs. Les tests et le build précèdent la PR brouillon. **Une personne relit et fusionne** ; l’Action ne publie pas elle-même sur `main`.

## Configuration GitHub

**Activation vérifiée le 6 octobre 2026** sur `ClemNTTS/MemStack` : règles et index publiés, compte `memstack-content-reports` limité au rôle `roles/datastore.user`, secrets Mistral/Firestore installés et variable d’activation réglée sur `true`. Le [test du workflow](https://github.com/ClemNTTS/MemStack/actions/runs/37486546629) a réussi et confirmé l’accès serveur à la file vide. Aucun contenu n’a été modifié ; la première correction réelle jusqu’à sa PR reste à vérifier. Un premier refus d’accès après création du compte a disparu à la relance, après propagation des droits.

1. Publier les règles et l’index de groupe sur `contentReports.status` : `npx.cmd --yes --cache .npm-cache firebase-tools deploy --only firestore --project memstack-9f581`. Attendre la fin de construction de l’index avant d’activer le worker.
2. Dans **Settings → Secrets and variables → Actions**, créer le secret `MISTRAL_API_KEY`. Le `.env` local n’est pas envoyé à GitHub. Ne jamais préfixer cette clé par `VITE_`.
3. Créer un compte de service dédié au worker dans Google Cloud, avec le rôle Firestore **Cloud Datastore User** sur `memstack-9f581`. Ajouter son JSON au secret `FIREBASE_SERVICE_ACCOUNT`. Les accès serveur suivent IAM et contournent les règles client : ce compte a accès aux données Firestore du projet. Ne pas employer un compte Owner/Editor ; envisager une identité fédérée sans clé persistante si cette automatisation grandit.
4. Autoriser **Allow GitHub Actions to create and approve pull requests** dans **Settings → Actions → General**. Le worker crée uniquement des PR ; il ne les approuve pas.
5. Ajouter la variable `CONTENT_REPORTS_ENABLED=true`. `MISTRAL_MODEL` est facultative, par défaut `mistral-small-latest` ; choisir un modèle disponible sur le compte.
6. Lancer **Inspect content reports → Run workflow** pour vérifier la première exécution. Lire le résultat et la PR avant fusion.

Le budget est limité par le nombre de signalements traités, de passes et de tokens ; définir aussi un plafond côté Mistral. Aucun tarif fixe n’est garanti. Les erreurs et cas ambigus nécessitent une revue plutôt qu’une boucle infinie.

## Développement

Node 24+, `npm test` et `npm run build`. `npm run reports:check` vérifie l’import et le catalogue sans réseau. Les tests du worker utilisent des réponses simulées, sans appeler Mistral ou Firestore.

`npm run reports:process` charge le `.env` local uniquement dans Node. Il nécessite également l’accès serveur Firestore, `GITHUB_TOKEN`, `GITHUB_REPOSITORY` et `GITHUB_SHA` correspondant à un checkout propre du commit de `main` ; ce n’est pas une commande de simulation. GitHub Actions fournit ces trois variables GitHub automatiquement. Ne pas la lancer sur des signalements réels pour un simple test du formulaire.

Une exécution interrompue ne relance pas automatiquement la facturation : après expiration du bail de quinze minutes, le signalement passe en revue manuelle. Une PR déjà créée est retrouvée par sa branche déterministe, y compris si elle a été fermée ou fusionnée. Les statuts terminaux sont `needs_review`, `no_change`, `pr_open`, `pr_closed` et `pr_merged`. Ils restent consultables dans Firestore ; leur suivi dans l’interface n’est pas encore implémenté. Une branche créée sans PR demande une reprise manuelle.

Une correction factuelle doit citer des sources réellement consultées. Si le contenu a changé depuis le signalement, demander une revue ; ne pas appliquer une ancienne proposition à une autre version.

Références techniques : [Mistral Chat API](https://docs.mistral.ai/api), [Firestore REST et IAM](https://firebase.google.com/docs/firestore/use-rest-api), [index de groupe Firestore](https://firebase.google.com/docs/firestore/query-data/index-overview).
