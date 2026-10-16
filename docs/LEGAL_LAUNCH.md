# Préparation juridique du lancement — 16 octobre 2026

État : **non finalisé**. Les pages publiques sont une information de préparation, pas une attestation de conformité ni des CGV finalisées. `src/legal/legalConfig.ts` conserve les informations non fournies à `null` et `approved: false`. Ne pas basculer ce drapeau pour masquer les informations manquantes.

## Livrables disponibles

- `/legal` : identité à compléter et description des fournisseurs connus.
- `/privacy` : compte, progression, classement mondial, équipe, export et suppression ; limites explicites sur conservation et transferts non vérifiés.
- `/terms` : description de l’usage et de la séparation des abonnements, tarification existante et places actives.
- `/enterprise-data` : visibilité manager, séparation Dev/Entreprise et besoins de l’annexe de données.
- `LegalLinks` : liens publics sans connexion requise ; intégration avant `AccessGate`.

## Informations que seul l’éditeur peut fournir

1. Nom/raison sociale, statut, adresse professionnelle, immatriculation et informations fiscales applicables.
2. Directeur de publication, adresse de support et adresse d’exercice des droits. Ne pas employer automatiquement une adresse personnelle publiée dans une conversation.
3. Médiateur de la consommation compétent et modalités applicables avec le marchand officiel.
4. Durées décidées pour comptes inactifs, progression, invitations, incidents et journaux, sauvegardes, marqueur de suppression et facturation. Une durée annoncée exige une procédure réellement mise en œuvre.
5. Garanties commerciales effectivement proposées, disponibilité et assistance (ne pas inventer de SLA ou promesse de réponse sous 24 h).

## Avant ouverture payante — reste à faire

- Vérifier l’entité du marchand officiel dans un Checkout Managed Payments, ses conditions client et le lien exact à fournir. Ne pas confondre conditions Stripe destinées au développeur avec celles destinées à l’acheteur.
- Faire correspondre informations précontractuelles, renouvellement, taxes et tarifs aux Checkout LIVE. L’offre Entreprise facture les accès activés, responsables compris, et non les connexions mensuelles.
- Définir droits applicables, remboursement, rétractation et résiliation avec la responsabilité du marchand officiel. Le portail de résiliation ordinaire n’est pas automatiquement une fonction de rétractation.
- **Rétractation en ligne :** la DGCCRF indique une obligation applicable depuis le 19 juin 2026 pour les contrats en ligne concernés, avec accès visible et accusé de réception durable. Vérifier le périmètre exact et le mécanisme de Managed Payments ; si insuffisant, implémenter une demande persistante avec date, confirmation et circuit de traitement. Une simple page informative ou un lien email ne prouve pas la satisfaction de cette exigence. Aucune renonciation automatique fondée seulement sur l’accès au contenu ne doit être supposée.
- Publier des conditions finalisées et assurer leur présentation avant l’achat, leur versionnement et la confirmation de commande. Aucune acceptation nouvelle n’est enregistrée par les composants livrés ici.
- Compléter les coordonnées légales de GitHub/Google selon les entités contractantes réelles.

## Données et organisations

- Établir le registre : finalités, personnes, données, destinataires, bases juridiques, conservation et droits. La participation obligatoire au classement n’est pas présentée comme un consentement.
- Répartir les responsabilités par traitement entre MemStack et l’organisation : l’organisation décide de son usage de formation ; les finalités propres de MemStack ne se confondent pas avec une sous-traitance. Formaliser, lorsque nécessaire, l’annexe article 28 (instructions, sécurité, assistance, incidents, droits, sous-traitants, transferts, sort des données et audits).
- Informer les collaborateurs de l’usage du classement et de la visibilité des compteurs. Ces compteurs ne sont pas une évaluation de la performance professionnelle.
- Vérifier DPA et sous-traitants Google, Stripe, GitHub, localisation effective de Firestore/Auth/journaux et mécanismes de transfert. La région des Functions ne suffit pas à garantir un hébergement intégral en Europe.
- Recenser les traceurs en navigateur, y compris App Check/reCAPTCHA, stockage local et ressources externes. Aucun SDK Analytics identifié dans `src/firebase/client.ts` ne suffit à conclure à l’absence de traceurs. Appliquer information et consentement selon usages/exemptions réels ; ne pas ajouter un bandeau factice.
- Vérifier export, suppression, retrait d’un membre et données conservées après clôture d’organisation avec des comptes jetables.
- Valider une procédure de demande de droits et de gestion des incidents, avec destinataire de contact réel.

## Sources officielles consultées

- [CNIL : information des personnes](https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence).
- [CNIL : durées de conservation](https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees).
- [CNIL : responsable et sous-traitant, article 28](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre4).
- [CNIL : règles relatives aux cookies](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies).
- [DGCCRF : rétractation, mise à jour du 2 octobre 2026](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/delais-de-reflexion-ou-de-retractation-comment-sappliquent-t-ils).
- [Stripe : Managed Payments](https://docs.stripe.com/payments/managed-payments).
- [Stripe : conditions de service, volet Managed Payments](https://stripe.com/legal/ssa-services-terms).
- [Stripe : assistance transactionnelle Managed Payments](https://support.stripe.com/questions/managed-payments-transaction-support-refunds-and-order-management?locale=en-GB).

Les sources fixent des exigences générales ; l’application au statut exact de l’éditeur, au contrat du marchand officiel et aux clients reste à valider. Cette liste fournit les tâches concrètes à terminer, sans déclarer le lancement juridiquement prêt.
