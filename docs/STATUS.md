# État du projet — 17 octobre 2026

## Évolution locale Entreprise après la revue initiale

L’offre Entreprise fait l’objet d’une refonte locale : deux fondations communes, trois parcours pratiques indépendants (assistants, automatisation, projets numériques), 18 nouvelles missions et trois nouvelles situations. Le catalogue v2 totalise 40 missions, 120 cartes et 11 situations en conservant le contenu historique. Voir [le contrat courant](ENTERPRISE_PRODUCT.md), [le plan](ENTERPRISE_REDESIGN_PLAN.md) et [la QA pédagogique](content/ENTERPRISE_QA_20261017.md). Cette évolution ne fait pas partie de la publication attestée ci-dessous ; son serveur et son frontend doivent être publiés ensemble dans l’ordre prévu. Les simulations de salariés par agents ne remplacent pas une qualification humaine.

## État publié examiné lors de la revue initiale

Cette synthèse correspond au code `758ee21` et à la revue du 17 octobre. Les recettes datées restent les preuves de leurs environnements respectifs ; elles n’ont pas été rejouées pendant cette revue documentaire. Une réussite technique TEST n’établit pas une ouverture commerciale LIVE.

## Produit actuel

MemStack propose un espace Développement et des espaces Entreprise séparés par organisation. Le catalogue Développement comprend 12 thèmes, 30 parcours, 150 leçons et 450 cartes. Les 36 défis actifs comportent cinq questions chacun ; la correction déterministe est enregistrée par le serveur avant affichage, avec quatre bonnes réponses nécessaires. Les analyses IA et réponses libres antérieures restent historiques. Voir [PRODUCT.md](PRODUCT.md), [ARCHITECTURE.md](ARCHITECTURE.md) et [le contrat des défis](content/CHALLENGES.md).

Google ou un compte email vérifié permettent la connexion ; l’apprentissage exige une connexion et Internet. La synchronisation, les préférences, les imports explicites, l’export et la suppression sont implémentés. Le gratuit prévoit une nouvelle leçon et cinq révisions dues par jour ; le Premium lève ces plafonds et donne accès aux défis. Les échéances futures ne sont pas avancées. Les espaces Entreprise ont leur progression propre, huit chapitres, vingt missions initiales, deux complémentaires, 66 cartes et huit situations.

## Preuves disponibles

| Domaine | État vérifié et limite |
| --- | --- |
| Vérification locale | 252 tests racine réussis, dont 75 tests serveur ; ces derniers ont aussi été relancés séparément. Builds frontend et Functions réussis ; `reports:check` réussi sans traiter de signalement réel. |
| Dépendances | Audit npm racine et Functions : aucune vulnérabilité signalée à la date de revue. |
| CI et publication | [Verify](https://github.com/ClemNTTS/MemStack/actions/runs/38901477188) et [Pages](https://github.com/ClemNTTS/MemStack/actions/runs/38901477118) réussis sur ce commit. Pages comprend 41 tests Firestore sur émulateur et un test d’intégration Auth. Java absent localement : ces tests d’émulateur n’ont pas été relancés dans la revue locale. |
| Paramètres frontend publié | `VITE_CHALLENGE_AI_ENABLED=true`, `VITE_SUBSCRIPTIONS_ENABLED=false`, `VITE_SERVER_LEARNING_ENABLED=true`. Ce sont les valeurs de la publication examinée, sans garantir tous les paramètres serveur. |
| Stripe personnel | Recette TEST réelle via callables Firebase, App Check et webhook en ligne documentée le 15 octobre ; aucun débit réel. Voir [STRIPE_QUALIFICATION.md](STRIPE_QUALIFICATION.md). |
| Stripe Entreprise | Paiement TEST, webhook, worker Eventarc, évolution des places et clôture vérifiés sur l’infrastructure réelle ; parcours connecté local également exercé. Retour vers le frontend publié et ouverture LIVE restent distincts. Voir [ENTERPRISE_DEPLOYMENT_20261015.md](ENTERPRISE_DEPLOYMENT_20261015.md). |
| IA historique | Essais v6/v7 non qualifiés. Les tests hors réseau et les drapeaux d’activation ne prouvent pas la qualité du modèle. Voir [CHALLENGE_AI_QUALIFICATION.md](CHALLENGE_AI_QUALIFICATION.md). |
| Lancement et données | Préparation non finalisée, `approved: false` ; décisions de conservation et procédures encore à compléter. Voir [LEGAL_LAUNCH.md](LEGAL_LAUNCH.md). |

Le backend comprend désormais plusieurs services Firebase, dont quotas, facturation, espaces Entreprise et corrections déterministes. La publication Pages ne déploie pas à elle seule les Functions et les règles Firestore.

## Suites de qualification

[RELEASE_READINESS.md](RELEASE_READINESS.md) centralise les limites connues : préparation LIVE, retour de paiement Entreprise sur l’interface publiée, suppression d’un compte jetable en production, correction éditoriale réelle, recettes sur appareils et retour arrière. Les [résultats du 9 octobre](PRODUCTION_RECIPE.md) décrivent la version historique de cette date, sans qualifier toutes les fonctions ajoutées ensuite.
