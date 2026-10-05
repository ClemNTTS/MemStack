import type { Lesson } from '../types/lesson'

export const volumesLesson: Lesson = {
  id: 'docker-volumes-persistence',
  title: 'Volumes et persistance',
  category: 'DevOps · Docker',
  estimatedMinutes: 4,
  firstStepId: 'intro',
  cardIds: ['docker-writable-layer', 'docker-named-volume', 'docker-volume-mount'],
  steps: [
    { id: 'intro', type: 'message', text: 'Tu recrées ton conteneur et tes fichiers ont disparu. Docker n’a pas mangé ton travail : regardons où tu l’avais rangé.', nextStepId: 'situation' },
    { id: 'situation', type: 'message', text: 'Ton application écrit dans /app/data, sans montage. Les fichiers vivent dans la couche modifiable du conteneur. Un arrêt ou un redémarrage les conserve ; supprimer le conteneur supprime cette couche.', nextStepId: 'question' },
    { id: 'question', type: 'question', prompt: 'Comment garder ces fichiers quand tu remplaces le conteneur ?', choices: [
      { id: 'volume', label: 'Monter un volume nommé dans /app/data', feedback: 'Exact. Les données vivent alors dans un stockage indépendant du conteneur.', nextStepId: 'example' },
      { id: 'image', label: 'Reconstruire l’image après chaque écriture', feedback: 'L’image ne récupère pas automatiquement les fichiers écrits par un conteneur en cours d’exécution.', nextStepId: 'precision' },
    ] },
    { id: 'precision', type: 'message', text: 'L’image prépare l’application. Un volume conserve les données produites pendant son utilisation.', nextStepId: 'example' },
    { id: 'example', type: 'message', text: 'Exemple : docker run --mount type=volume,src=memstack-data,dst=/app/data mon-app. Un nouveau conteneur retrouve les fichiers s’il monte le même volume au chemin où l’application écrit.', nextStepId: 'conclusion' },
    { id: 'conclusion', type: 'message', text: 'Un volume nommé reste après suppression du conteneur, tant que tu ne supprimes pas le volume. Persistance ne veut pas dire sauvegarde : garde aussi une copie des données importantes.' },
  ],
}
