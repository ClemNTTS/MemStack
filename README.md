# MemStack

MemStack aide à consolider des connaissances par des leçons courtes et la répétition espacée. Deux espaces partagent le même compte : **Développement**, pour les connaissances techniques, et **Entreprise**, pour apprendre à travailler avec l’IA en équipe. Leurs contenus, progressions, droits et classements sont séparés.

État documentaire : **17 octobre 2026**. Le code et les recettes citées ci-dessous décrivent ce qui est implémenté ou vérifié ; ils ne prouvent pas une ouverture commerciale LIVE.

## Le parcours

L’espace Développement organise **12 thèmes → 30 parcours → 150 leçons**, avec 450 cartes. Une leçon alterne bulles, exemples et questions, puis introduit ses cartes. Les révisions utilisent des lots de cinq cartes arrivées à échéance, sans avancer de carte future. Après révélation, Mémo permet de répondre **Non** ou **Oui** à la question « Avais-tu retrouvé la réponse ? ». La bibliothèque permet de relire les leçons terminées.

Le compte gratuit permet une nouvelle leçon et cinq révisions dues par jour civil à Paris, tous parcours et appareils confondus. Les cartes nouvelles restent disponibles. Premium supprime ces plafonds et donne accès aux défis. L’objectif quotidien reste un conseil personnel, distinct de ces quotas contrôlés côté serveur.

Les 36 défis actifs proposent chacun cinq questions à choix unique, corrigées côté serveur après enregistrement. Il faut 4/5 pour réussir. Ils exigent Premium, les leçons liées au dossier et au moins deux leçons de sa thématique. Aucune exécution de code ni disponibilité Mistral n’est nécessaire. Les versions et tentatives historiques sont conservées.

Niveaux, badges et séries accompagnent la progression. Le classement mondial compare les séries sous pseudo, sur la base d’activités acceptées par le serveur. L’espace Entreprise possède son propre parcours IA : huit chapitres, vingt missions initiales, deux missions complémentaires, 66 cartes et huit mises en situation, avec suivi et classement limités à l’organisation.

## Accès et état commercial

L’accueil public, `/discover`, la présentation `/business` et les pages d’information sont accessibles sans compte. Les espaces d’apprentissage exigent Internet et un compte Google ou email/mot de passe avec adresse vérifiée. Le profil permet la gestion du mot de passe, des préférences, du pseudo, l’import explicite, l’export et la suppression du compte.

Les offres personnelles affichent 1,50 € TTC/mois ou 9,90 € TTC/an ; l’offre Entreprise affiche 10 € TTC par membre actif et par mois. Les intégrations Stripe et les contrôles serveur sont implémentés. Des recettes TEST sur les services déployés sont consignées dans les documents spécialisés. **Le LIVE reste fermé** ; le frontend personnel documenté conserve `VITE_SUBSCRIPTIONS_ENABLED=false`. Les informations contractuelles et les procédures du lancement restent à finaliser.

## Documents

- [État et preuves](docs/STATUS.md) : déploiements, recettes et limites datés.
- [Produit](docs/PRODUCT.md) : fonctionnement actuel et règles à préserver.
- [Feuille de route](docs/ROADMAP.md) : chantiers restants et limites des preuves.
- [Architecture](docs/ARCHITECTURE.md) : frontend et services Firebase/Stripe.
- [Catalogue pédagogique](docs/CURRICULUM.md) et [workflow de contenu](docs/content/WORKFLOW.md).
- [Défis](docs/content/CHALLENGES.md) et [service IA historique](docs/CHALLENGE_AI.md).
- [Abonnements personnels](docs/SUBSCRIPTIONS.md) et [classement mondial](docs/WORLD_RANKING.md).
- [Produit Entreprise](docs/ENTERPRISE_PRODUCT.md), [backend](docs/ENTERPRISE_BACKEND.md) et [facturation](docs/ENTERPRISE_BILLING.md).
- [Signalements assistés](docs/content/REPORTS.md) et [préparation du lancement](docs/LEGAL_LAUNCH.md).
- [Vision initiale](docs/VISION.md) : propositions historiques, à lire avec les décisions actuelles du produit.

## Développement et vérifications

Utiliser Node 24+. Après `npm ci`, lancer `npm run dev` et ouvrir `http://localhost:3000/`. `/` présente le tableau de bord connecté, `/today` les sessions, `/courses` les parcours, `/reviews` uniquement les cartes dues et `/library` les relectures. `/enterprise` ouvre les organisations du compte.

Avant de lancer la suite complète, installer les trois ensembles de dépendances depuis la racine : `npm ci`, `npm ci --prefix functions` et `npm ci --prefix tests/challenge-ai`. La suite racine importe aussi les modules serveur.

- `npm run build` : vérification TypeScript et bundle de production.
- `npm test` : tests locaux, y compris logique pédagogique, contenu et serveur.
- `npm --prefix functions ci`, puis `npm run functions:build` et `npm run functions:test` : vérification du serveur.
- [Tests émulateurs](tests/challenge-ai/README.md) : autorisations, transactions et authentification.
- `npm run reports:check` : contrôle du worker sans appel réseau ; `reports:process` traite de vrais signalements et nécessite les secrets configurés.

Firestore synchronise progression et préférences. Les réglages cloud priment ; les anciens réglages locaux migrent seulement en l’absence de document cloud. Une sauvegarde n’est confirmée qu’après accusé serveur. Le cache aide à reprendre une sauvegarde interrompue et ne donne pas accès à un apprentissage hors ligne.

## Déploiement

Le workflow [Pages](.github/workflows/pages.yml) teste, vérifie les autorisations sur émulateurs, construit avec une base `/`, puis publie `dist/` sur [memstack.fr](https://memstack.fr). Dans Settings → Pages, sélectionner **GitHub Actions**. La production utilise des routes à fragment (`#/today`) ; le développement local utilise `/today`. Le domaine de connexion doit être autorisé dans Firebase Auth.

Les fonctions et règles Firebase ont leur propre procédure de publication : le déploiement Pages ne les publie pas. Respecter l’ordre et les drapeaux décrits dans [SUBSCRIPTIONS.md](docs/SUBSCRIPTIONS.md) et la [recette Entreprise](docs/ENTERPRISE_DEPLOYMENT_20261015.md). Ne jamais publier de secrets ni de fichiers `.env`, ni activer facturation ou déploiement serveur sans autorisation explicite du propriétaire.
