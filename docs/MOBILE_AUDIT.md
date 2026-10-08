# Vérification mobile — 8 octobre 2026

Objectif : utiliser principalement MemStack sur téléphone et pouvoir l’ajouter à l’écran d’accueil. Audit visuel du site publié avant modifications, puis du frontend local modifié. Trois agents spécialisés ont séparé installation, navigation et parcours ; une revue croisée a contrôlé les changements.

## Parcours inspectés

1. **Navigation et catalogue des défis — corrigé.** À 390 px, la navigation initiale imposait un défilement horizontal et occupait deux lignes. La navigation basse donne accès aux cinq destinations, avec icônes Lucide, libellés et état actif. À 320 px, aucun débordement global ; les cibles mesurées font 58 px de haut. Recherche et filtre React fonctionnent (trois résultats).
2. **Cartes de révision — corrigé.** La carte initiale occupait environ 200 px entre deux commandes symboliques. Elle utilise désormais la largeur disponible, avec deux boutons explicites dessous. Retournement testé ; aucune réponse de révision n’a été enregistrée pendant l’audit.
3. **Leçon — amélioré.** L’en-tête mobile réserve plus de place à la lecture et propose une sortie. Lecture et bouton Continuer vérifiés en portrait. À 844 × 390, la leçon défile comme un document ; le nouveau message reste accessible. Le code conserve son défilement horizontal propre.
4. **Défi et signalement — amélioré.** Champs mesurés à 16 px, actions larges, code accessible au clavier. Saisie temporaire puis effacée, sans soumettre de tentative. Dialogue de signalement ouvert et fermé, focus rendu au déclencheur ; aucune transmission Mistral.
5. **Installation — préparée.** Manifeste autonome, icônes Android/Apple et instructions dans le profil. Contrat des assets vérifié automatiquement. Aucun service worker ajouté ; connexion Google et Internet obligatoires.

## Captures

Captures numérotées enregistrées dans `C:/Users/cleme/.codex/visualizations/2026/10/07/01a11567-4036-71c3-bd01-85e80dd96ad6/` :

- `01-mobile-before-challenge.jpg`, `02-mobile-before-cards.jpg`, `03-mobile-before-lesson.jpg` : état initial publié.
- `04-mobile-after-cards.jpg`, `05-mobile-report.jpg`, `06-mobile-challenges.jpg`, `07-mobile-landscape.jpg`, `08-mobile-after-lesson.jpg`, `09-mobile-install.jpg` : état local après modifications.

Les captures ont été ouvertes et inspectées. Elles documentent les constats ci-dessus, sans constituer une certification d’accessibilité.

## Limites et contrôles sur téléphone

Le navigateur redimensionné valide la mise en page et les interactions, mais ne simule pas le clavier natif, les encoches, VoiceOver/TalkBack ou l’installation réelle. Installer depuis Safari iOS et Chrome Android, ouvrir via l’icône, vérifier Google Auth, une leçon et un défi, puis la coupure et la reprise réseau. Voir [PWA.md](PWA.md). Le contrôle d’accès existant n’a pas été modifié. Aucun résultat pédagogique ni préférence du compte n’a été changé par ces vérifications.

Validation : build production réussi et 108 tests passés, dont quatre contrôles du manifeste, de sa portée et du décodage réel des icônes. Revue croisée des agents : aucun blocage identifié.

Performance : les quatre images de Mémo utilisées par l’interface passent de 3 124 463 à 105 990 octets au total (WebP, réduction de 96,6 %). Les PNG sources sont conservés ; scripts/optimizememo.mjs permet la régénération.
