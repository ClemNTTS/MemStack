import type { Lesson } from '../types/lesson'

export const todayLesson: Lesson = {
  id: 'docker-images-containers',
  title: 'Images et conteneurs',
  category: 'DevOps · Docker',
  estimatedMinutes: 4,
  firstStepId: 'intro',
  steps: [
    {
      id: 'intro',
      type: 'message',
      text: 'Ton code a changé, mais ton conteneur affiche toujours l’ancienne version. Docker fait la sieste ?',
      nextStepId: 'situation',
    },
    {
      id: 'situation',
      type: 'message',
      text: 'Ton code est copié dans l’image au moment du build, sans montage du dossier source. Tu modifies les fichiers sur ton ordinateur, puis redémarres le conteneur existant. Rien n’a changé à l’écran.',
      nextStepId: 'diagnostic',
    },
    {
      id: 'diagnostic',
      type: 'question',
      prompt: 'Que vérifierais-tu en premier ?',
      choices: [
        {
          id: 'image',
          label: 'L’image utilisée pour créer le conteneur',
          feedback: 'Oui. Ce conteneur a peut-être été créé à partir d’une ancienne image.',
          nextStepId: 'conclusion',
        },
        {
          id: 'restart',
          label: 'Redémarrer encore le même conteneur',
          feedback: 'Un redémarrage ne donne pas automatiquement une nouvelle image au conteneur.',
          nextStepId: 'precision',
        },
      ],
    },
    {
      id: 'precision',
      type: 'message',
      text: 'Pour utiliser ton code modifié, reconstruis l’image, puis crée un nouveau conteneur à partir de cette version.',
      nextStepId: 'conclusion',
    },
    {
      id: 'conclusion',
      type: 'message',
      text: 'L’image sert de modèle. Le conteneur est une instance créée à partir de ce modèle. Plusieurs conteneurs peuvent utiliser la même image.',
      nextStepId: 'update',
    },
    {
      id: 'update',
      type: 'message',
      text: 'Dans cet exemple, reconstruis l’image avec ton code modifié, puis crée un nouveau conteneur à partir de cette image. Redémarrer l’ancien ne change pas l’image dont il provient. Avec un dossier source monté depuis ton ordinateur, la mise à jour suit une autre logique.',
    },
  ],
  cardIds: ['docker-image-vs-container', 'docker-restart-image', 'docker-code-update'],
}
