import type { Card } from '../types/card'

export const cards: Card[] = [
  {
    id: 'docker-image-vs-container',
    question: 'Quelle est la différence entre une image Docker et un conteneur ?',
    answer: 'Une image est un modèle. Un conteneur est une instance créée à partir de ce modèle.',
  },
  {
    id: 'docker-restart-image',
    question: 'Redémarrer un conteneur existant lui fait-il utiliser une nouvelle image ?',
    answer: 'Non. Un redémarrage utilise toujours le conteneur existant ; il ne le recrée pas à partir d’une nouvelle image.',
  },
  {
    id: 'docker-code-update',
    question: 'Ton code est intégré dans une image Docker. Comment utiliser sa version modifiée dans un conteneur ?',
    answer: 'Reconstruis l’image avec le code modifié, puis crée un nouveau conteneur à partir de cette image.',
  },
  {
    id: 'docker-writable-layer',
    question: 'Sans montage, que deviennent les fichiers écrits dans un conteneur lors de son arrêt, puis de sa suppression ?',
    answer: 'Un arrêt ou redémarrage conserve sa couche modifiable. Supprimer le conteneur supprime cette couche et ses fichiers.',
  },
  {
    id: 'docker-named-volume',
    question: 'Un volume nommé disparaît-il quand son conteneur est supprimé ?',
    answer: 'Non. Il reste disponible tant que le volume lui-même n’est pas supprimé. Un nouveau conteneur peut le remonter.',
  },
  {
    id: 'docker-volume-mount',
    question: 'Ton application écrit dans /app/data. Où monter son volume de données pour conserver les écritures ?',
    answer: 'Dans /app/data, le chemin où elle écrit. Un volume monté ailleurs ne conserve pas automatiquement ces fichiers.',
  },
  {
    id: 'docker-port-mapping',
    question: 'Avec -p 127.0.0.1:8080:3000, quels sont les ports de la machine et du conteneur ?',
    answer: '8080 est le port publié sur la machine ; 3000 est le port du conteneur. Depuis cette machine, ouvre http://localhost:8080.',
  },
  {
    id: 'docker-expose-publish',
    question: 'EXPOSE 3000 suffit-il à rendre une application accessible depuis la machine hôte ?',
    answer: 'Non. EXPOSE documente le port. Il faut le publier, par exemple avec -p, et l’application doit écouter sur une interface joignable dans le conteneur.',
  },
  {
    id: 'docker-container-localhost',
    question: 'Comment un conteneur joint-il un conteneur nommé api sur le même réseau bridge personnalisé ?',
    answer: 'Avec son nom et son port interne, par exemple http://api:3000. localhost désigne le conteneur appelant, pas api.',
  },
]
