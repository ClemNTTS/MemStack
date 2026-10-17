# Revue UI et UX Entreprise — 17 octobre 2026

Revue menée par agents sur le frontend local avec navigateur intégré, après les revues pédagogiques et les quatre personas documentés dans [la revue Q&A](content/ENTERPRISE_QA_20261017.md). Aucun compte réel, paiement ou environnement Firebase de production n'est utilisé. L'adaptateur de qualification fournit une organisation fictive et une progression locale simulée ; ces observations ne qualifient pas les paramètres déployés.

## État initial capturé

1. **Accueil de l'espace** : identité ivoire/lilas et Mémo cohérents, navigation organisationnelle explicite. Mais aucun choix de spécialisation ; le chemin affiche des chapitres sans mission et un compteur de huit missions non expliqué. Le classement précède le parcours. [Capture](screenshots/enterprise-v2/01-workspace-before.png).
2. **Offre publique** : boutons et tarif visibles, composition claire. Promesse centrée sur les précautions et programme historique de huit étapes ; ne représente pas les trois nouveaux parcours. [Capture](screenshots/enterprise-v2/02-offer-before.png).
3. **Lecture d'une mission** : colonne lisible, progression et définitions accessibles par des boutons, action de continuation visible. L'atelier doit encore expliciter sa nature de comparaison guidée, montrer les critères avant rédaction et permettre d'emporter le travail. [Capture](screenshots/enterprise-v2/03-lesson-before.png).

## Principes d'intégration

- Conserver les composants, illustrations et styles de MemStack ; aucun nouveau service.
- Choisir explicitement entre assistants, automatisation et projets. Deux fondations communes puis six missions spécialisées ; les ressources historiques restent séparées.
- Décrire le livrable et le résultat attendu, puis donner les critères avant de rédiger.
- Distinguer correction déterministe de questions, comparaison guidée d'un texte et transfert facultatif vers un outil autorisé.
- Garder les progressions personnelle et organisationnelle distinctes, ainsi que les parcours et liens d'organisation.
- Ne pas envoyer les productions écrites au manager ou à un fournisseur IA. Copie et téléchargement restent des actions explicites.

## Vérification finale

4. **Offre après intégration — desktop** : slogan validé, trois axes productifs, huit missions pour un premier parcours, prix inchangé. Le texte sépare les livrables préparés des outils réels et le catalogue total du parcours individuel. Identité et illustration existantes conservées. [Capture](screenshots/enterprise-v2/04-offer-after-desktop.png).
5. **Offre après intégration — mobile** : contrôle à 390 × 844 pixels ; largeur utile et largeur de document égales à 375 pixels (barre de défilement exclue), aucun débordement horizontal. Le slogan, la promesse, le CTA et le prix restent lisibles. Activation clavier du bouton programme : focus déplacé sur la section programme. [Capture](screenshots/enterprise-v2/05-offer-after-mobile.png).
6. **Calculateur mobile** : saisie de 25 membres, résultat 250 € TTC/mois ; contour de focus visible, CTA utilisable. Aucun paiement engagé. [Capture](screenshots/enterprise-v2/06-offer-calculator-mobile.png).

7. **Entrée de l'espace** : trois choix explicites avec public, résultat attendu et progression socle + six missions. Aucun parcours de spécialisation n'est lancé automatiquement. Les ressources ne forment plus des chapitres vides. [Accueil desktop](screenshots/enterprise-v2/07-workspace-after-desktop.png), [cartes de choix](screenshots/enterprise-v2/08-tracks-after-desktop.png).
8. **Retour au parcours sur mobile** : l'audit a révélé que trois longues cartes repoussaient chaque prochaine mission. Correction appliquée : après choix, résumé compact et accordéon natif « Changer de parcours », fermé ; la prochaine action arrive immédiatement après. Changement Automatisation → Projets au clavier vérifié ; URL et navigation conservent organisation et parcours. [Mobile corrigé](screenshots/enterprise-v2/13-compact-path-mobile.png), [desktop final](screenshots/enterprise-v2/14-projects-after-desktop.png). Aucun débordement horizontal sur l'espace mobile contrôlé (375/375 pixels utiles).
9. **Laboratoire local** : décision de recréation refusée avec explication, fiche unique conservée ; deux reprises de notification puis alerte testées au clavier. Les nouveaux compteurs et états sont annoncés, le cas sélectionné est identifiable. Le feedback initialement vert et trop étroit a été corrigé en lilas neutre, sans marge de conversation héritée. [Capture mobile corrigée](screenshots/enterprise-v2/10-laboratory-mobile.png). La [revue Q&A indépendante](content/ENTERPRISE_QA_20261017.md) complète cette inspection visuelle.
10. **Atelier écrit** : pièces fictives, critères avant rédaction, mention « auto-comparaison guidée » avant interaction. Saisie d'une proposition, ouverture de l'exemple et déplacement du focus vérifiés. Copie relue : texte exact ; téléchargement `.txt` observé dans le navigateur. Après retour au chemin puis réouverture de la même mission, le texte est conservé en mémoire. [Capture mobile](screenshots/enterprise-v2/11-practice-mobile.png). Les espacements des ateliers ont été réduits sur mobile pour élargir le texte utile.
11. **Situations** : dossier du parcours choisi en premier, liens des autres parcours cohérents et huit situations historiques dans un accordéon distinct. L'étiquette Aster autrefois constante devient « Dossier fictif · mise en situation » ; le verrou décrit les missions préalables. [Capture mobile](screenshots/enterprise-v2/12-situations-mobile.png).

## Conclusion et limites

Les défauts significatifs observés ont été corrigés puis inspectés. La landing, le choix de parcours, le retour à la prochaine activité, l'atelier et le laboratoire sont utilisables aux dimensions bureau et mobile contrôlées. Les liens de parcours préservent `org` et `track`. Les brouillons sont identifiés par compte, organisation et mission ; leur purge utilise l'organisation résolue stable, sans effacement lors de l'ajout du paramètre URL `org` pour la même organisation (revue de code).

La mémoire du brouillon ne survit pas à la fermeture ou à la sortie de l'espace : copie/téléchargement et avertissement restent nécessaires. Pas de nouvelle persistance ni d'envoi des productions. Le laboratoire est un exercice déterministe fictif ; aucun outil réel n'est connecté. Le navigateur a testé une organisation fictive, sans session Firebase/Stripe réelle, lecteur d'écran réel ni téléphone physique. Ces vérifications ne constituent pas une conformité d'accessibilité complète ni une validation des paiements, paramètres cloud ou performances de production. L'aperçu a été repris sur le port 3002 après un cache Vite obsolète ; cette correction de l'environnement de qualification n'affecte pas l'application.

Les compteurs commerciaux utilisent `src/data/enterprisePresentation.json`, sans importer le catalogue complet dans la landing ; un contrat de test les compare au catalogue. Voir le [récapitulatif de qualification](ENTERPRISE_REDESIGN_QUALIFICATION.md) pour les résultats finaux des tests et builds.
