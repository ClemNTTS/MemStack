# Qualification locale Entreprise

Lancer `npx vite --config tests/enterprise-ui/vite.config.ts`, puis ouvrir `http://127.0.0.1:3002/enterprise`.

Vérifier les types du harnais avec `npx tsc -p tests/enterprise-ui/tsconfig.json`.

Ce serveur distinct monte le vrai workspace avec un contexte et un adaptateur fictifs. Il ne charge pas le point d’entrée de production et ne contacte ni Firebase ni Mistral. Les préférences et progressions fictives survivent au rechargement dans un stockage local propre aux organisations `qa-a` et `qa-b`. Ce comportement simule une réponse serveur ; il ne prouve pas la synchronisation entre appareils. Les tests Functions et émulateur qualifient séparément la persistance cloud et les accès.

Ne pas importer ces fichiers dans `src/`, ni utiliser ce serveur comme build de production. La configuration Vite normale et son build restent inchangés. Les actifs de production sont servis par le dossier `public` du dépôt dans la configuration de test.
