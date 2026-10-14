# Relecture v4 — étudiant compétent débutant

Date : 14 octobre 2026.

## Périmètre et indépendance

Lecture des 36 défis v4 de `shared/challengeQuestions.json` : 180 questions et 540 options. Lecture des scénarios et des pièces publiques `files` dans `shared/challengeDossiers.json`. Les champs correction, checkpoints, counterexamples et acceptableAlternatives n’ont pas été affichés. Aucune clé de réponse, correction ni réponse forte/faible préexistante n’a été consultée. Seuls les noms de propriétés du fichier de fixture existant ont été inspectés pour conserver son schéma.

Les 180 choix ont été décidés à partir des informations présentées à l’étudiant et écrits dans `shared/challengeStrongStudentCases.json`, avec `challengeVersion: 4`. Aucun score ni comparaison avec une clé n’a été effectué. Contrôle structurel : 36 cas, cinq sélections par cas, chaque identifiant de question et d’option appartient au questionnaire public.

## Compréhension et ambiguïtés

Un meilleur choix est identifiable pour chacune des 180 questions. Aucun cas ne présente deux réponses également défendables dans les hypothèses du dossier. Les nombres, ports, frontières temporelles et valeurs attendues ont été vérifiés sur les pièces publiques. Aucune correction bloquante n’est demandée.

La progression diagnostic/action/vérification puis mécanisme/limite convient à un étudiant qui maîtrise les bases. Plusieurs distracteurs sont très absolus ou invraisemblables (« toujours », « automatiquement », « jamais »), ce qui facilite leur élimination sans maîtriser complètement le mécanisme. Cela affecte la difficulté pédagogique, sans rendre les choix ambigus.

## Formulations à améliorer

- `performance-eager-module-diagnostic`, `verification`, option a : le prompt demande une vérification « à l’ouverture puis lors des exports », mais a décrit surtout les exports. Choix a retenu ; ajouter « À l’ouverture, la bibliothèque n’est pas téléchargée » puis préciser premier et deuxième exports rendrait la réponse complète. « des deux exports » apparaît sans que deux essais aient été introduits dans la question.
- `backend-env-secret-diagnostic`, `mechanism`, options b/c : « vaut suivi de » et « est absente suivi de » ne sonnent pas comme des messages. Préférer « Afficher la valeur complète de DATABASE_URL, mot de passe compris » et « Signaler son absence puis afficher toutes les autres variables ».
- `backend-invalid-body-diagnostic`, `diagnosis` : écrire la valeur `"beaucoup"` entre guillemets ou en code pour distinguer nettement la donnée du discours.
- `react-stale-search-diagnostic`, `diagnosis` et `verification` : écrire `"r"` et `"react"` comme les valeurs du champ rend la lecture plus immédiate.
- `web-keyboard-action-diagnostic`, `verification`, option b : « une sauvegarde par activation » est juste mais elliptique ; « une seule sauvegarde à chaque activation » est plus naturel. Vérifier « son nom annoncé » suppose aussi un lecteur d’écran, au-delà du simple test clavier demandé ; annoncer cet outil serait utile, sans changer le choix b.
- `data-firestore-retry-diagnostic`, `boundary`, option a : enregistrer un événement permet de retrouver l’envoi après panne, mais l’absence de doublons requiert également un traitement adapté. « Un traitement peut retrouver l’envoi après panne et identifier les événements déjà livrés » rendrait le mécanisme plus explicite. Le verbe « peut » actuel évite toutefois une garantie absolue erronée.
- `docker-images-diagnostic`, `restart-purpose`, option a : « mêmes fichiers de départ » est compréhensible mais peu idiomatique ; « la même image et la configuration existante » distingue mieux le redémarrage du remplacement. La couche inscriptible du conteneur est également conservée.
- `architecture-invalid-state-diagnostic`, `action`, option b : « au repos », « en cours », « réussie » et « échouée » serait légèrement plus naturel que « repos » au milieu de phrases verbales.

Les autres options sont compréhensibles et leur langage ne nécessite pas de correction pour répondre. Le jargon important est généralement expliqué ou illustré ; LCP et ORM ont notamment une définition dans la question concernée.

## Livraison

Questionnaires laissés inchangés. Fixture forte v4 fournie. Rapport indépendant fourni. Les vérifications globales build/tests sont à coordonner avec les autres modifications v4 du parent ; ce rapport n’affirme pas qu’elles ont été exécutées par cet étudiant indépendant.
