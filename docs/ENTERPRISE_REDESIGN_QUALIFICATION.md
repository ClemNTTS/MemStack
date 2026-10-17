# Qualification de la refonte Entreprise v2

17 octobre 2026. Qualification locale avant publication, sans modification de facturation. Le déploiement autorisé ultérieurement est tracé dans [le compte rendu de publication](ENTERPRISE_DEPLOYMENT_20261017.md).

## Résultat

Trois parcours appliqués : assistants IA, automatisation et projets numériques. Chaque parcours comprend deux fondations communes et six nouvelles missions, puis une situation finale. Le catalogue contient 40 leçons, 120 cartes et 11 situations. Les 22 leçons et les 8 situations de la version précédente ont été comparées à `a812465` : objets JSON identiques. Parmi ces anciennes leçons, deux constituent le socle et vingt restent complémentaires.

Les ateliers proposent des productions écrites, des critères, une comparaison commentée, une copie et un téléchargement explicites. Un laboratoire local permet de travailler les doublons, les données incomplètes et les reprises de notification. Aucun nouvel appel IA ou connecteur métier n'est ajouté.

## Preuves et limites

- [Inspection pédagogique et Q&A](content/ENTERPRISE_QA_20261017.md) : revue exhaustive des ajouts, corrections et contrôle indépendant du simulateur.
- [Personas indépendants](content/ENTERPRISE_PERSONA_FRESH_20261017.md) : productions avant consultation des exemples. Les agents simulent des salariés ; cela ne remplace pas des sessions humaines ni une mesure des durées réelles.
- [Recette UI et UX](ENTERPRISE_UI_UX_20261017.md) : captures, navigation, clavier, mobile et ateliers avec une organisation fictive. Le navigateur utilise un adaptateur local de qualification ; les écritures de production et les paiements ne sont pas simulés comme des preuves de fonctionnement réel.
- `npm test` : 259 tests réussis, dont les contrats du catalogue, les prérequis, la progression indépendante et le simulateur.
- Émulateur Firestore : 42 tests réussis, dont la transaction des nouveaux prérequis. Cette vérification couvre les transactions et règles locales, pas les paramètres de l'environnement déployé.
- `npm --prefix functions run build` et tests Functions : réussis, 76 tests serveur.
- `npm run build` : réussi. L'avertissement existant sur les bundles supérieurs à 500 ko demeure.

Les corrections privées des situations restent dans le catalogue serveur. Les nouvelles productions ne sont pas transmises au manager ou à un fournisseur IA. Les tentatives historiques gardent leur version et leurs instantanés.

## Publication ultérieure

La refonte modifie le catalogue utilisé par les Functions et ses prérequis : publier la version serveur correspondante avant le frontend. Une publication des Functions nécessite l'autorisation explicite du propriétaire prévue par le dépôt. La présente qualification n'autorise ni ne réalise ce déploiement. Les paramètres Stripe et l'ouverture LIVE restent inchangés.
