# Qualification des ateliers Entreprise — 19 octobre 2026

Le nouveau cas de la deuxième mission met le membre en situation chez Studio Rivage : proposer à Camille deux créneaux de rendez-vous client et une échéance de réponse, sans inventer le lien de visioconférence. Les 40 ateliers disposent d'un retour IA déclenché volontairement. Les introductions et repères redondants sont retirés ; l'exemple reste une option séparée.

## Équipe et contrôle pédagogique

Trois agents dédiés ont pris en charge le service serveur, l'interface et le Q&A pédagogique indépendant. Le coordinateur a exécuté les appels fournisseur sur des réponses fictives et vérifié l'intégration. Voir les registres [backend](ENTERPRISE_PRACTICE_AI_BACKEND_20261019.md), [interface](ENTERPRISE_PRACTICE_AI_UI_20261019.md) et [Q&A](ENTERPRISE_PRACTICE_AI_QA_20261019.md).

La grille privée v4 couvre les 40 missions et 123 critères essentiels, avec 123 aides de confiance. Les détails de forme restent facultatifs. Les exigences et attentes des réponses synthétiques n'ont pas été abaissées pour obtenir un passage. La borne inclusive de 500 € a été isolée comme objectif atomique ; les critères synthétiques d'un brief peuvent renvoyer clairement aux informations déjà présentes.

## Configuration qualifiée

- Fournisseur : Mistral, modèle daté `mistral-medium-2604`.
- Contrat et cache : `enterprise-practice-v9` ; grille privée version 4.
- Empreinte du module serveur : `97070190349a9f4fe273686946a775d16837dec267aa2b50cf3e789522211207`.
- Empreinte du fichier des grilles : `c85f43691387ed56e3ab0436b4439cc1956376cbdd50f6cdbd48b33ecdebba98`.
- Empreinte des ateliers publics : `5e15968883ac8d4ea1fe88c3145aa723f89f4e54270aa6470f0dedcb4bc332ae`.

Le modèle référence des segments de la réponse, puis classe les critères. Le serveur rejette les références invalides et compose un verdict encourageant. L'aide correspond au premier critère contradit, sinon au premier critère manquant. Aucun commentaire libre du modèle n'est exposé : `strengths` est vide, le message est déterministe et `nextStep` provient de la grille inspectée. Les segments et commentaires internes ne sont pas persistés.

La [documentation du raisonnement Mistral](https://docs.mistral.ai/studio/conversations/reasoning) est une référence de transport, pas une preuve d'activation : `reasoning_effort=high` a été refusé par l'API réelle et n'est pas envoyé. Le schéma fournisseur omet également `uniqueItems`, refusé lors des essais ; l'unicité des références reste contrôlée sur le serveur. Aucun raisonnement généré n'est journalisé ou transmis au client.

## Résultats et échecs conservés

La [qualification versionnée](qualification/enterprise-practice-ai-20261019.json) contient deux passages identiques de 54 réponses fictives : 28 cas portant sur 14 missions et 26 cas complémentaires couvrant les 26 autres. Les 108 appels aboutissent avec le statut attendu, aucune indisponibilité et des retours publics identiques entre les passages. Les cas couvrent bonnes réponses brèves, fautes, omissions, contradictions, seuils, dates, unités et tentatives d'injection. Il ne s'agit pas d'une étude auprès de salariés réels.

Les anciennes candidates restent décrites dans le registre Q&A : faux acquis sur une référence invérifiable, borne de montant mal reconnue, bonne réponse trop sévèrement refusée, citations recomposées rejetées et conseils inventés. La v8 avait 54 statuts corrects mais une félicitation confondait temps de traitement et gain ; elle n'a pas été retenue. La v9 supprime structurellement l'exposition de ces commentaires libres. Un bon score de statuts n'a donc pas servi à masquer un retour qualitativement faux.

## Vérification technique et interface

- `npm test` : 275 tests réussis.
- `npm run functions:test` : 89 tests réussis, dont 12 du nouveau service.
- `npm run functions:build` et `npm run build` : réussis. L'avertissement de taille du bundle est préexistant.
- Firestore Emulator, commande complète `test:rules` : 50 tests réussis, dont huit sur les transactions de ce service. Les refus d'accès imprimés dans le journal sont attendus.
- Navigateur local sur les composants réels : bouton désactivé à vide, attente, succès, invalidation après modification, erreur explicite conservant le brouillon et exemple toujours consultable. Le retour utilisé dans l'aperçu est celui d'un appel réel du corpus fictif ; cet aperçu ne prétend pas avoir testé un compte de production.
- Rendu vérifié au format bureau et à 390 × 844 pixels ; [capture du retour](../screenshots/enterprise-memo/practice-ai-feedback.png) et [capture mobile](../screenshots/enterprise-memo/practice-ai-mobile.png).

Les limites serveur sont de 30 nouveaux retours par membre/organisation/jour de Paris et de 6 millions de tokens réservés par jour globalement, avec 32 000 réservés par appel : au plus 187 nouvelles vérifications globales malgré le plafond complémentaire de 500 requêtes. Les échecs consomment leur réservation et aucun nouvel appel fournisseur n'est relancé automatiquement. Un résultat identique est réutilisé, avec droits relus. Les paramètres du service historique et de Stripe doivent rester inchangés.

Ces essais qualifient une configuration et un corpus limités ; ils ne garantissent pas toutes les formulations possibles. Le verdict reste probabiliste, sans effet sur progression, classement ou évaluations finales. L'exemple reste disponible en cas de désaccord ou d'indisponibilité.

## Déploiement

Déploiement Firebase terminé le 19 octobre 2026. La [vérification effective](qualification/enterprise-practice-deployment-20261019.json), réalisée à 14:31 UTC, confirme `assessEnterprisePracticeAnswer` et `exportAccountData` en état `ACTIVE` dans `europe-west9`, l'activation propre aux ateliers et le modèle qualifié. Les 14 paramètres préexistants sont identiques sur les deux fonctions. Le secret fournisseur existant est lié au callable ; un appel sans authentification est refusé avec HTTP 401. Aucun appel pédagogique sur un compte réel n'est revendiqué.

Le front est livré par le workflow GitHub Pages du commit de livraison. Le statut de ce run constitue la preuve de publication ; un simple succès du build local ne suffit pas. Les règles, abonnements, prix Stripe et autres Functions n'ont pas été déployés par cette livraison.
