import type { LessonStep } from '../../types/lesson'

export type CatalogVisual = Omit<Extract<LessonStep, { type: 'image' }>, 'id' | 'type' | 'nextStepId'> & {
  placementStepId: string
}

// Original, local diagrams; insert after the concrete example.
export const catalogVisuals: Record<string, CatalogVisual> = {
  'fund-values-references': {
    src: '/lessons/catalog/shared-reference.svg',
    alt: 'a et b désignent le même objet. Modifier b.score modifie l’objet lu par a.',
    caption: 'Deux variables, un objet. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'systems-process': {
    src: '/lessons/catalog/process-resources.svg',
    alt: 'Le même programme peut démarrer deux processus ayant leur propre mémoire et leurs propres ressources.',
    caption: 'Un programme, deux processus. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'http-request-response': {
    src: '/lessons/catalog/http-exchange.svg',
    alt: 'Le client envoie GET /lessons au serveur. Le serveur répond 200 avec une représentation JSON.',
    caption: 'Un échange HTTP. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'ui-box-model': {
    src: '/lessons/catalog/css-box.svg',
    alt: 'De l’extérieur à l’intérieur : marge, bordure, remplissage et contenu.',
    caption: 'Les couches d’une boîte CSS. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'browser-dom-events': {
    src: '/lessons/catalog/event-propagation.svg',
    alt: 'Dans la phase de bouillonnement, un clic sur le bouton traverse le bouton puis son parent. La capture suit l’autre sens.',
    caption: 'Un clic remonte le DOM. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'js-scope': {
    src: '/lessons/catalog/closure-scope.svg',
    alt: 'Une fonction interne conserve l’accès aux variables de sa portée externe même après le retour de cette dernière.',
    caption: 'Une fermeture garde l’accès. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'js-promise': {
    src: '/lessons/catalog/promise-states.svg',
    alt: 'Une promesse en attente peut devenir accomplie ou rejetée. Ces deux états sont terminaux.',
    caption: 'Les états d’une promesse. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'ts-narrowing': {
    src: '/lessons/catalog/type-narrowing.svg',
    alt: 'Un test typeof distingue la branche string de la branche non string. La vérification permet des opérations adaptées.',
    caption: 'Préciser un type inconnu. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'react-render': {
    src: '/lessons/catalog/react-cycle.svg',
    alt: 'Une mise à jour déclenche un rendu React puis un commit. Le navigateur peut ensuite peindre l’écran.',
    caption: 'Du nouvel état à l’écran. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'react-effect-cleanup': {
    src: '/lessons/catalog/effect-cleanup.svg',
    alt: 'Un effet installe un abonnement. Son nettoyage retire cet abonnement avant une nouvelle installation ou au démontage.',
    caption: 'Abonner puis nettoyer. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'node-validation': {
    src: '/lessons/catalog/api-validation.svg',
    alt: 'Le navigateur envoie des données. Le serveur vérifie autorisation et format avant de les enregistrer.',
    caption: 'Le serveur garde la frontière. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'rest-resources': {
    src: '/lessons/catalog/rest-resources.svg',
    alt: 'Une URL désigne une ressource. GET en demande la représentation ; DELETE demande sa suppression selon le contrat.',
    caption: 'Ressource et représentation. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'backend-queue': {
    src: '/lessons/catalog/queue-ack.svg',
    alt: 'Le producteur place une tâche dans une file. Le consommateur la traite puis confirme selon le protocole de la file.',
    caption: 'Une tâche différée. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'sql-transactions': {
    src: '/lessons/catalog/sql-transaction.svg',
    alt: 'BEGIN ouvre une transaction ; deux écritures sont validées ensemble par COMMIT ou annulées par ROLLBACK.',
    caption: 'Valider une transaction. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'firestore-paths': {
    src: '/lessons/catalog/firestore-path.svg',
    alt: 'Le chemin users/uid/cards/cardId alterne collection, document, collection et document. Chaque document contient des champs.',
    caption: 'Alternance collections et documents. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'docker-volumes-persistence': {
    src: '/lessons/catalog/docker-persistence.svg',
    alt: 'Un conteneur remplacé peut retrouver les données du même volume. La couche inscriptible du conteneur ne survit pas à sa suppression.',
    caption: 'Le stockage indépendant du conteneur. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'cicd-pipeline': {
    src: '/lessons/catalog/ci-pipeline.svg',
    alt: 'Un événement push déclenche des tests. Le déploiement attend leur réussite et ses propres conditions.',
    caption: 'Des jobs avant le déploiement. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'cloud-responsibility': {
    src: '/lessons/catalog/cloud-responsibility.svg',
    alt: 'Dans cet exemple de conteneur géré, le fournisseur gère l’hôte. Le client garde le code, les permissions et les données.',
    caption: 'Répartir les responsabilités. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'terraform-state': {
    src: '/lessons/catalog/terraform-state.svg',
    alt: 'La configuration décrit le souhait. L’état relie les adresses Terraform aux objets distants. Le fournisseur lit les ressources réelles.',
    caption: 'Trois représentations de l’infrastructure. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'k8s-deployment': {
    src: '/lessons/catalog/kubernetes-reconcile.svg',
    alt: 'Un contrôleur observe deux pods pour un objectif de trois, puis crée un remplacement pour réduire cet écart.',
    caption: 'État souhaité et état observé. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'obs-signals': {
    src: '/lessons/catalog/observability-signals.svg',
    alt: 'Une métrique indique un changement, une trace situe le temps dans une requête et un journal décrit un événement.',
    caption: 'Trois regards sur un incident. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'sre-error-budget': {
    src: '/lessons/catalog/sre-budget.svg',
    alt: 'Pour un SLO de 99 pour cent sur 10000 requêtes éligibles, le budget autorise 100 requêtes non conformes dans la fenêtre.',
    caption: 'Un budget lié à un objectif. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'security-authn-authz': {
    src: '/lessons/catalog/auth-permission.svg',
    alt: 'Une identité valide est vérifiée avant la permission sur un objet donné. Être Alice ne donne pas les données de Bob.',
    caption: 'Identité puis autorisation. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'security-injection': {
    src: '/lessons/catalog/sql-parameters.svg',
    alt: 'Le SQL et la valeur utilisateur sont transmis séparément. Le paramètre reste une donnée et ne devient pas la syntaxe SQL.',
    caption: 'Séparer instruction et donnée. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'tests-unit-integration': {
    src: '/lessons/catalog/test-boundaries.svg',
    alt: 'Le test unitaire vise une fonction ; l’intégration vise la coopération de modules ; le bout en bout vise le parcours utilisateur.',
    caption: 'Trois périmètres de test. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'arch-state-machine': {
    src: '/lessons/catalog/state-machine.svg',
    alt: 'Une demande fait passer idle à loading puis success ou error. Une erreur peut déclencher une nouvelle tentative.',
    caption: 'Des transitions explicites. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'dist-cache-invalidation': {
    src: '/lessons/catalog/cache-lookup.svg',
    alt: 'Le cache doit contenir une entrée encore valide pour répondre. Une entrée absente ou expirée impose de recharger la source puis de remplir le cache.',
    caption: 'Consulter un cache valide. Une présence seule ne garantit pas la fraîcheur.',
    placementStepId: 'example',
  },
  'perf-measure': {
    src: '/lessons/catalog/performance-waterfall.svg',
    alt: 'Dans cet exemple séquentiel, le téléchargement du bundle dure davantage que le traitement serveur. Mesurer permet de cibler ce coût.',
    caption: 'Mesurer un chemin critique. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'git-working-tree': {
    src: '/lessons/catalog/git-staging.svg',
    alt: 'git add copie le contenu choisi dans l’index ; git commit enregistre le contenu de l’index dans un nouveau commit.',
    caption: 'Du travail au commit. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
  'debug-hypothesis': {
    src: '/lessons/catalog/debug-hypothesis.svg',
    alt: 'Une observation est choisie pour distinguer deux hypothèses. Le résultat guide l’enquête plutôt que de multiplier les modifications.',
    caption: 'Une observation discriminante. Schéma simplifié : les conditions de la leçon restent déterminantes.',
    placementStepId: 'example',
  },
}
