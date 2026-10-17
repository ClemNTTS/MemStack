# Publication Entreprise v2 — 17 octobre 2026

Publication autorisée explicitement par le propriétaire après la qualification locale, y compris les changements Functions.

## Serveur publié avant le frontend

`commitEnterpriseLearningAction`, codebase `challenge-ai`, projet `memstack-9f581`, région `europe-west9` : mise à jour Firebase réussie. Relecture de l'API Google Cloud : état `ACTIVE`, date de mise à jour `2026-10-17T10:46:16.828393979Z` (12 h 46 à Paris).

Le paquet serveur contient le catalogue Entreprise v2 et les corrections privées correspondantes. Les prérequis des trois parcours sont appliqués par les transactions existantes. Aucune règle Firestore, autre Function ou configuration Stripe n'a été publiée dans cette opération.

Les quatorze paramètres requis ont été récupérés depuis la Function précédemment déployée puis comparés après publication : identiques. Les modes Stripe LIVE personnel et Entreprise restent `false`. Le fichier local de paramètres est ignoré par Git ; aucun secret n'est publié.

## Frontend et preuves

Le push de cette refonte sur `main` déclenche le workflow [Deploy MemStack to Pages](https://github.com/ClemNTTS/MemStack/actions/workflows/pages.yml), après la publication serveur ci-dessus. Ce workflow teste, vérifie les transactions et l'authentification sur émulateurs, construit puis publie sur [memstack.fr](https://memstack.fr). Son résultat et la vérification du site constituent les preuves de publication frontend ; la seule réussite du déploiement Firebase ne suffit pas.

Avant publication : 259 tests racine, 76 tests Functions, 42 tests Firestore et builds réussis. Voir [la qualification](ENTERPRISE_REDESIGN_QUALIFICATION.md), [la QA pédagogique](content/ENTERPRISE_QA_20261017.md) et [la recette UI/UX locale](ENTERPRISE_UI_UX_20261017.md). Les tests avec organisation fictive ne sont pas une recette avec de vrais salariés, ni un paiement LIVE.
