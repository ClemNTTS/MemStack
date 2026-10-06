import type { Challenge } from '../types/challenge'

export const challenges: Challenge[] = [
  {
    id: 'docker-images-diagnostic',
    version: 1,
    title: 'La nouvelle image, le même bug',
    courseId: 'docker-basics',
    lessonIds: ['docker-images-containers'],
    estimatedMinutes: 5,
    scenario: 'Le conteneur `memstack-web` a déjà été créé à partir de `memstack-app:v1`, sans montage de code depuis l’hôte. Mémo corrige son application, puis lance ces commandes illustratives depuis le projet :\n\n```bash\ndocker build -t memstack-app:v2 .\ndocker restart memstack-web\n```\n\nLe correctif est bien présent dans l’image v2, mais le conteneur affiche encore l’ancien comportement.',
    prompt: 'Pourquoi le redémarrage ne suffit-il pas ? Décris ce que tu changerais et ce que tu vérifierais avant de remplacer le conteneur. Tu peux expliquer avec tes mots ou proposer des commandes ; rien ne sera exécuté.',
    correction: 'Le conteneur existant a été créé à partir de l’image v1. `docker restart` redémarre ce même conteneur ; il ne le recrée pas à partir de v2. Il faut créer un nouveau conteneur à partir de l’image corrigée, en reprenant la configuration utile (ports, variables, volumes, réseau). Vérifie d’abord où sont les données : celles de la couche inscriptible du conteneur ne survivront pas à sa suppression.\n\nExemple illustratif : une fois les données sécurisées et l’ancien conteneur retiré, créer son remplaçant avec l’image v2. Les options propres à ton application doivent être ajoutées.\n\n```bash\ndocker run --name memstack-web memstack-app:v2\n```\n\nContrôle ensuite que le nouveau conteneur utilise l’image attendue et que le comportement corrigé est présent. Changer un tag ou reconstruire une image ne modifie pas rétroactivement les conteneurs déjà créés.',
    checkpoints: [
      'Je distingue construire une image, créer un conteneur et redémarrer un conteneur existant.',
      'Je propose de recréer le conteneur à partir de v2, avec sa configuration nécessaire.',
      'Je vérifie la persistance des données avant de supprimer l’ancien conteneur.',
    ],
    counterexamples: [
      'Un simple arrêt puis redémarrage peut suffire pour relancer un processus bloqué ; cela ne change toujours pas son image de départ.',
      'Si du code est monté depuis l’hôte, sa modification peut être visible selon l’application : cette situation est explicitement exclue ici.',
    ],
    sources: [
      { title: 'Docker — Images', url: 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/' },
      { title: 'Docker — Redémarrer un conteneur', url: 'https://docs.docker.com/reference/cli/docker/container/restart/' },
      { title: 'Docker — Cycle de vie des volumes', url: 'https://docs.docker.com/engine/storage/volumes/' },
    ],
  },
  {
    id: 'docker-volumes-diagnostic',
    version: 1,
    title: 'Où sont passées les notes de Mémo ?',
    courseId: 'docker-basics',
    lessonIds: ['docker-volumes-persistence'],
    estimatedMinutes: 5,
    scenario: 'Voici le lancement initial illustratif d’une application, sans volume ni bind mount :\n\n```bash\ndocker run --name memstack-notes memstack-app:v1\n```\n\nL’application écrit ses notes dans `/app/data/notes.json`. Plus tard, Mémo supprime ce conteneur et en crée un nouveau avec la même image : ses notes ont disparu. Il veut conserver les prochaines notes quand il remplacera un conteneur.',
    prompt: 'Explique la disparition, puis propose un montage pour les prochaines données. Que faut-il réutiliser lors du prochain remplacement ? Est-ce que ce montage récupère automatiquement les anciennes notes déjà perdues ?',
    correction: 'Les notes étaient dans la couche inscriptible du conteneur supprimé. Une nouvelle instance retrouve les fichiers de son image, pas les modifications de l’ancienne instance. Pour les prochaines notes, monte un volume nommé au chemin où l’application écrit :\n\n```bash\ndocker run --name memstack-notes \\\n  --mount type=volume,src=memstack-notes-data,dst=/app/data \\\n  memstack-app:v1\n```\n\nL’image et le nom du conteneur sont des exemples. Lors du remplacement, remonte le même volume nommé `memstack-notes-data` au même chemin `/app/data`. Le nom du conteneur ne conserve pas les fichiers ; le volume reste distinct de son cycle de vie. Ce montage protège les prochaines écritures, mais ne récupère pas les notes déjà détruites. Un volume n’est pas une sauvegarde : sa suppression, un écrasement de fichier ou une panne du stockage peuvent encore faire perdre les données.',
    checkpoints: [
      'J’identifie la couche inscriptible du conteneur supprimé comme emplacement des anciennes notes.',
      'Je monte un volume au chemin réellement utilisé par l’application et réutilise le même volume lors du remplacement.',
      'Je distingue persistance future, récupération des données déjà perdues et sauvegarde.',
    ],
    counterexamples: [
      'Redémarrer le même conteneur sans le supprimer conserve normalement sa couche inscriptible : redémarrage et remplacement sont différents.',
      'Monter un autre volume nommé ou le monter à `/backup` ne permet pas de retrouver les notes écrites dans `/app/data`.',
    ],
    sources: [
      { title: 'Docker — Volumes et cycle de vie', url: 'https://docs.docker.com/engine/storage/volumes/' },
      { title: 'Docker — Stockage et couche inscriptible', url: 'https://docs.docker.com/engine/storage/' },
    ],
  },
  {
    id: 'docker-ports-diagnostic',
    version: 1,
    title: 'Deux adresses, une seule API',
    courseId: 'docker-basics',
    lessonIds: ['docker-ports-networks'],
    estimatedMinutes: 6,
    scenario: 'Extrait de lancement illustratif, à examiner sans l’exécuter :\n\n```bash\ndocker network create memstack-net\ndocker run -d --name memstack-api --network memstack-net \\\n  -p 127.0.0.1:8080:3000 memstack-api:v1\ndocker run -d --name memstack-worker --network memstack-net \\\n  memstack-worker:v1\n```\n\nL’API écoute sur `0.0.0.0:3000` dans son conteneur. Un navigateur tourne sur l’hôte Docker. Le worker partage avec l’API ce réseau bridge créé par l’utilisateur, et le nom `memstack-api` y est résolu. Dans son code, le worker essaie d’appeler `http://localhost:8080` : échec.',
    prompt: 'Quelle URL utiliser dans le navigateur sur l’hôte ? Quelle URL utiliser depuis le worker ? Explique pourquoi `localhost` ne désigne pas le même endroit, et ce que change la publication sur `127.0.0.1`.',
    correction: 'Depuis le navigateur sur l’hôte, utilise `http://127.0.0.1:8080` : le port 8080 de l’hôte est publié vers le port 3000 du conteneur. Cette adresse IPv4 correspond exactement à la publication ; le nom `localhost` peut aussi résoudre une adresse IPv6. Depuis le worker sur ce réseau partagé, utilise `http://memstack-api:3000` : il joint le nom réseau de l’API et son port interne. Il n’a pas besoin de passer par le port publié de l’hôte.\n\n```text\nNavigateur sur l’hôte → 127.0.0.1:8080 → API:3000\nWorker sur le réseau partagé → memstack-api:3000\n```\n\nDans le worker, `localhost` désigne le worker lui-même. La publication `127.0.0.1:8080:3000` limite l’accès au port publié à l’interface loopback de l’hôte ; elle ne donne pas aux autres machines un accès normal à ce port. Le scénario suppose des conteneurs Linux sur le réseau bridge décrit, une API effectivement démarrée et des règles réseau qui autorisent les échanges.',
    checkpoints: [
      'Je distingue le port 8080 publié sur l’hôte et le port 3000 écouté par l’API.',
      'Depuis le worker, je cible le nom de l’API et son port interne sur le réseau partagé.',
      'J’explique que localhost est local à chaque environnement et que la publication est limitée à la loopback de l’hôte.',
    ],
    counterexamples: [
      'Sans réseau partagé avec résolution du nom, `memstack-api:3000` n’est pas une adresse garantie : il faut d’abord vérifier le réseau.',
      'Une API liée uniquement à `127.0.0.1` dans son propre conteneur ne devient pas accessible aux autres conteneurs simplement parce qu’un port est publié.',
    ],
    sources: [
      { title: 'Docker — Publication de ports', url: 'https://docs.docker.com/engine/network/port-publishing/' },
      { title: 'Docker — Réseaux bridge créés par l’utilisateur', url: 'https://docs.docker.com/engine/network/drivers/bridge/' },
    ],
  },
]
