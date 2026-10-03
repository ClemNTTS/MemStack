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
]
