# Connexion Google ou email

Le 15 octobre 2026, le propriétaire a demandé la création de comptes par email et mot de passe en complément de Google. Firebase Authentication gère les mots de passe, les emails de vérification et la réinitialisation ; aucune donnée de mot de passe n’est écrite dans Firestore, localStorage ou les logs de l’application. Aucun nouveau fournisseur n’est ajouté.

La création demande un pseudo et un mot de passe de 12 à 128 caractères. La politique Firebase impose également ces limites côté serveur. La protection contre l’énumération des emails et les quotas existants sont conservés. Un compte email non vérifié reste sur l’écran de vérification, sans charger sa progression ; les règles Firestore et les services pédagogiques/de paiement refusent aussi cet accès. Après ouverture du lien, le bouton de confirmation recharge l’identité et son jeton avant de charger la progression.

Les formulaires permettent la connexion, la création et « Mot de passe oublié ». Le profil permet de réinitialiser le mot de passe ou d’en ajouter un au compte Google existant, après nouvelle confirmation Google. La liaison conserve le même UID Firebase, donc la progression et les droits Premium. Google reste disponible. Un email déjà utilisé ne doit pas créer un deuxième compte de progression.

L’export et la suppression prennent en charge les comptes email vérifiés. La suppression exige toujours `SUPPRIMER`, App Check et une authentification datant de moins de cinq minutes ; un compte avec mot de passe confirme celui-ci. Les fonctionnalités administrateur historiques restent réservées à l’authentification Google et aux claims administrateur existantes.

La configuration du fournisseur email/mot de passe a été activée le 15 octobre 2026 par un patch limité à `signIn.email` et `passwordPolicyConfig`. Les paramètres Google, les domaines, la confidentialité des emails et les quotas n’ont pas été modifiés. Le journal de configuration local ne contient pas de clé ni de mot de passe.

Validation : build frontend/Functions, tests unitaires de comptes vérifiés/non vérifiés et de reconnexion récente, tests de règles avec séparation des comptes, puis recette navigateur sur Firebase Auth et Firestore émulés. Les opérations de cette recette utilisent des comptes et des emails fictifs sans envoi de courrier réel.

Références : [Firebase email/mot de passe](https://firebase.google.com/docs/auth/web/password-auth), [liaison des comptes](https://firebase.google.com/docs/auth/web/account-linking), [vérification et réinitialisation](https://firebase.google.com/docs/auth/web/manage-users).

Le test d’intégration Auth couvre également l’ajout d’un mot de passe à une identité Google vérifiée, la connexion par mot de passe avec le même UID et sa réinitialisation. Il utilise `updatePassword` après réauthentification Google : cette opération conserve l’email vérifié et évite le chemin de liaison `signUp` incompatible avec l’émulateur utilisé. Ce test est exécuté avant chaque publication par le workflow Pages. Les nombres de tests évoluent avec le produit ; les résultats datés de la vérification actuelle sont consignés dans [STATUS.md](STATUS.md).
