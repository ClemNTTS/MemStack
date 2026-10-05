import type { Lesson } from '../types/lesson'

export const portsLesson: Lesson = {
  id: 'docker-ports-networks',
  title: 'Ports et réseaux',
  category: 'DevOps · Docker',
  estimatedMinutes: 5,
  firstStepId: 'intro',
  cardIds: ['docker-port-mapping', 'docker-expose-publish', 'docker-container-localhost'],
  steps: [
    { id: 'intro', type: 'message', text: 'Ton application tourne dans Docker, mais ton navigateur ne la trouve pas. Elle a ouvert une porte… dans une autre maison.', nextStepId: 'ports' },
    { id: 'ports', type: 'message', text: 'L’application écoute sur le port 3000 du conteneur. Pour la joindre depuis ta machine, publie un port : docker run -p 127.0.0.1:8080:3000 mon-app. Ici, 8080 est le port de ta machine, 3000 celui du conteneur.', nextStepId: 'question' },
    { id: 'question', type: 'question', prompt: 'Quelle adresse ouvrir dans ton navigateur avec cette commande ?', choices: [
      { id: 'host', label: 'http://localhost:8080', feedback: 'Oui : le navigateur passe par le port publié sur ta machine.', nextStepId: 'listen' },
      { id: 'container', label: 'http://localhost:3000', feedback: '3000 désigne ici le port interne. Le port publié sur ta machine est 8080.', nextStepId: 'listen' },
    ] },
    { id: 'listen', type: 'message', text: 'L’application doit écouter sur une interface joignable, généralement 0.0.0.0 dans le conteneur. EXPOSE dans le Dockerfile ne publie pas un port. Le préfixe 127.0.0.1 limite l’exemple à l’accès local depuis ta machine.', nextStepId: 'network' },
    { id: 'network', type: 'message', text: 'Entre conteneurs, localhost désigne le conteneur lui-même. Sur un réseau bridge créé par toi, un conteneur nommé api peut être joint par son nom : http://api:3000. Ils doivent partager ce réseau ; publier un port sur la machine n’est pas nécessaire pour cette communication.', nextStepId: 'conclusion' },
    { id: 'conclusion', type: 'message', text: 'Depuis le navigateur : adresse de la machine et port publié. Entre conteneurs du même réseau bridge personnalisé : nom du conteneur et port interne. Deux trajets, deux adresses.' },
  ],
}
