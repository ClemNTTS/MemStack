# MemStack sur téléphone

MemStack peut être ajoutée à l’écran d’accueil et s’ouvrir dans une fenêtre dédiée, sans la barre d’adresse du navigateur. Le manifeste décrit l’application, son point d’entrée, sa portée, ses couleurs et ses icônes. Les métadonnées Apple couvrent aussi les versions de Safari utilisant ces indications.

## Installation

- **Android** : ouvrir `https://memstack.fr` dans Chrome ou un navigateur compatible. Dans le profil, « Installer MemStack » apparaît si le navigateur propose son invitation native. Sinon, ouvrir le menu du navigateur et choisir « Installer l’application » ou « Ajouter à l’écran d’accueil ».
- **iPhone / iPad** : ouvrir le site dans Safari, ouvrir le menu de partage, choisir « Sur l’écran d’accueil », puis « Ajouter ». Si l’option est présente, laisser « Ouvrir comme app web » activée.
- Le profil contient les instructions et n’affiche pas la section d’installation dans une fenêtre déjà en mode autonome. Aucun dialogue d’installation ne s’ouvre automatiquement.

Selon le navigateur, l’installation peut produire une application autonome ou un raccourci. L’invitation native Android dépend de l’éligibilité et des choix du navigateur : son absence ne doit pas bloquer les instructions manuelles. Sur iOS, l’application ne peut pas déclencher directement le dialogue d’ajout.

## Connexion et fonctionnement

Internet et un compte Google restent obligatoires. Aucune exception n’est ajoutée au contrôle d’accès. L’application installée peut avoir une session distincte du navigateur, notamment sur iOS : une reconnexion Google peut être nécessaire à la première ouverture.

Il n’y a **pas de service worker**, de cache applicatif ni de mode d’apprentissage hors ligne. Un service worker n’est pas nécessaire à l’installation selon les critères actuels documentés par MDN. Cette décision évite d’introduire une copie persistante du catalogue ou des réponses et conserve le fonctionnement réseau existant. Le cache HTTP normal du navigateur reste soumis aux en-têtes du serveur ; il ne permet pas de contourner le contrôle de connexion de MemStack.

Les mises à jour suivent le chargement habituel du site. Fermer puis rouvrir l’application ou recharger la page permet de récupérer la nouvelle version ; aucune stratégie de mise à jour de service worker n’est à entretenir.

## Fichiers et validation

- `public/manifest.webmanifest` : URLs relatives pour fonctionner avec la base Vite, lancement à l’accueil, portée de l’application, affichage autonome.
- `public/icons/` : icônes PNG 192 et 512 px, variante maskable 512 px, icône Apple 180 px et favicon PNG 48 px. Elles reprennent la mascotte existante `public/memo/recalled.png`, composée sur un fond opaque de la marque.
- `scripts/generate-pwa-icons.mjs` régénère les PNG avec `sharp`, dépendance de développement verrouillée dans `package-lock.json`. Après `npm ci`, exécuter `node scripts/generate-pwa-icons.mjs`. La variante maskable garde toute la composition dans le cercle central protégé de 80 % du diamètre.
- `src/pwa/install.ts` capture l’invitation native dès le démarrage, même avant l’ouverture du profil. `InstallApp` affiche le bouton uniquement après cet événement.

Avant livraison : exécuter `npm run build`, vérifier le manifeste et les dimensions des PNG dans `dist`, puis vérifier l’affichage du profil et de ses instructions en largeur téléphone. Sur un appareil réel : installer depuis Safari et Chrome Android, relancer via l’icône, se connecter à Google, ouvrir un défi et une révision, couper Internet et vérifier le blocage, puis rétablir le réseau. Une fenêtre de navigateur redimensionnée vérifie la mise en page mais ne remplace pas ces contrôles d’installation et d’authentification sur iOS/Android.

`npm test` vérifie le contrat d’installation, la résolution des URLs sous une base de déploiement, le décodage et les dimensions réelles des cinq PNG, leur opacité et la zone de sécurité maskable. Les icônes sont livrées dans Git ; leur génération ne fait pas partie du build et aucun binaire de traitement d’image n’est envoyé au téléphone.

La connexion Google existante utilise `signInWithPopup`, démarrée par un geste de l’utilisateur. Elle reste inchangée. Il faut contrôler sur Safari installé que la fenêtre Google s’ouvre et que son retour conserve la session. Un bloqueur de fenêtres, des restrictions de stockage ou une session séparée peuvent demander une nouvelle connexion ; l’installation ne constitue pas une preuve que ce parcours fonctionne sur toutes les versions iOS. Aucun changement vers `signInWithRedirect` n’a été introduit sans validation de sa configuration Firebase.

## Sources officielles

- [MDN — Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) : manifeste, HTTPS, critères navigateur, service worker facultatif.
- [Apple — Turn a website into an app in Safari on iPhone](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios) : ajout à l’écran d’accueil et ouverture comme application web.
- [WebKit — Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) : ouverture autonome d’une application à partir de son manifeste.

Sources consultées le 8 octobre 2026. Les noms des commandes peuvent varier avec la version et la langue du navigateur.
