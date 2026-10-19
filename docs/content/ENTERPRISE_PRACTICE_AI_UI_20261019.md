# Ateliers Entreprise : retour IA — interface

Qualification du 19 octobre 2026.

## Couverture et comportement

- Les 40 cas pratiques ont une action explicite « Vérifier ma réponse ». Les 39 ateliers guidés partagent le même composant de retour ; l’atelier de politique de retour lui transmet ses diagnostics et sa proposition de réponse au client.
- Aucun envoi pendant la saisie ou la navigation. Le bouton annonce l’envoi du cas fictif et de la réponse à Mistral ; seules les informations fictives de l’exercice sont demandées.
- L’interface transmet le contexte d’organisation choisi, l’identifiant de leçon, la réponse et le SHA-256 du JSON du cas pratique. Le serveur conserve la responsabilité des accès, limites, déduplications et versions.
- Le retour propose trois niveaux sans score : « Bien joué ! », « Tu y es presque ! », « On reprend ensemble ? ». Il présente un message, des points réussis et une prochaine piste éventuelle. Tous les textes du fournisseur sont rendus comme texte React, sans HTML interprété, liens actifs ni exécution.
- Le résultat est invalidé dès que la réponse ou le vérificateur de contexte change. La callback de vérification est stabilisée par compte et organisation ; elle vérifie le scope et la génération avant puis après l’appel, et le composant rejette aussi une réponse issue d’une ancienne callback. Une requête terminant après un changement de leçon, de compte ou d’organisation ne doit pas réafficher un ancien retour : jeton local de génération et démontage du composant délimité par compte/organisation/leçon. Le brouillon reste uniquement en mémoire de l’espace Entreprise existant.
- Les deux champs du premier exercice doivent contenir du texte avant tout envoi. Les libellés des champs seuls ne constituent pas une réponse. Leur longueur cumulée reste sous la limite serveur de 5 000 caractères.
- L’exemple statique est une option secondaire, jamais présenté comme un retour IA de secours. Une erreur réseau, de disponibilité ou d’accès affiche un échec explicite et garde la réponse. La limite atteinte invite à consulter l’exemple ou à réessayer plus tard.
- La vérification IA ne valide ni ne bloque la progression de la leçon, les cartes ou les évaluations finales. Les délais callable sont explicités à 70 secondes côté client.

## Allègement des écrans

L’introduction répétitive « Pratique · … » est masquée dans les 40 ateliers. Les repères et modèles à compléter ne sont plus exposés avant l’essai ; l’exercice commence par son contexte fictif et sa consigne. L’activité interactive de flux d’automatisation est conservée. Les repères détaillés restent accessibles avec l’exemple après action volontaire. Les boutons de copie/téléchargement ne sont pas réintroduits.

## Vérifications

- `node --test src/enterprise/practiceAnswer.test.ts` : 2 tests réussis, dont les champs vides ou partiels et la conservation des paragraphes d’un prompt libre.
- `npm run build` : réussi (avertissement de taille du bundle déjà présent).
- Vérification navigateur et suite complète : à consigner dans la qualification globale par l’équipe d’intégration ; cette fiche ne prétend pas qu’un appel fournisseur réel a été réalisé.

Aucun déploiement ni commit réalisé par l’agent interface.
