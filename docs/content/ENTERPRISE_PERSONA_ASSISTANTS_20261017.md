# Simulation de personas — parcours Assistants

17 octobre 2026. Simulation par agent sur les sources, sans session navigateur, sans personne réelle et sans appel à un assistant externe. Le même agent a déjà lu exemples et clés lors de la revue Q&A : aucune cécité totale n'est revendiquée. Pour cette phase, les productions ci-dessous sont reconstruites depuis scénario, consigne et amorce ; elles servent à tester faisabilité et clarté, pas à mesurer un taux de réussite ni une durée humaine. Leurs formulations n'ont pas été notées automatiquement.

## Rôles

- **Assistant administratif novice simulé**, à l'aise avec courriels et traitement de texte, quelques essais ChatGPT sans méthode. Recherche une consigne qu'il peut reprendre demain, redoute la page blanche et le jargon.
- **Commercial occasionnel simulé**, prépare des offres et des réunions, connaît son métier mais utilise peu les assistants. Attend des livrables et un gain de préparation, pas une certification technique.

## Productions et retours par ID

### `ent-assistants-brief` — administratif

Production reconstruite avant comparaison de phase :

> Prépare un mail aux douze nouveaux collègues : rendez-vous lundi à 9 h, salle Pin. L'ordinateur est fourni, chacun apporte un carnet. Demande de répondre en cas de souci d'horaire. Mets un objet et un texte court, accueillant. Je vérifierai que le rendez-vous comporte jour/heure/salle et qu'on ne demande pas d'apporter un ordinateur.

Les informations et deux critères sont trouvables. L'apprenant peut ignorer le mot brief et produire une bonne demande : point positif. Petite friction : beaucoup d'éléments répètent la mission de fondation. Retour simulé : « Je vois enfin quoi mettre dans la demande, mais j'aimerais voir aussi le mail obtenu pour comprendre le résultat. » Recommandation : une sortie illustrative courte après le brief, clairement distincte de sa demande, sans changer le livrable attendu.

### `ent-assistants-documents` — commercial

Production :

> À partir de DEMANDE, CATALOGUE ACTUEL et LOGISTIQUE, prépare une proposition courte et signale la condition de délai. Quantité : 40, minimum 30 respecté (demande/catalogue). Produits : 240 €, inférieur à 280 € (demande/catalogue). Livré : 265 € (catalogue/logistique). Vendredi : possible si validation avant mardi midi (logistique). Pourra-t-on valider avant mardi midi ?

Production possible sans donnée inventée. Le budget produits est suffisamment clair mais pourrait être confondu par lecture rapide : bon objet de feedback. Retour simulé : « Dans mon quotidien je voudrais aussi une trame de proposition à envoyer ; ici j'ai surtout un tableau. » Recommandation facultative : étape de transfert proposant de transformer le tableau en mail, avec conservation de la condition, sans devoir utiliser un outil payant.

### `ent-assistants-meeting` — administratif

Production :

> Demande : transforme les notes en relevé pour les participants, puis un suivi en trois phrases. Sépare les engagements des idées. Décision : essai deux créneaux lundi. Action : grille, Zoé, jeudi. Proposition : samedi, non acté. Ouvert : qui prépare le bilan et quand ? Suivi : L'essai commence lundi et Zoé prépare la grille jeudi. Le samedi reste à discuter. Qui prend le bilan et à quelle date ?

Dossier autonome et livrable concret. La formulation « engagements des idées » est moins technique mais correcte. Retour simulé : « Facile à adapter à mes réunions. Je ne sais pas si je dois mettre du contexte sur l'objectif de la réunion dans le vrai outil. » Recommandation : rappeler contexte/public dans la fiche réutilisable, sans ajouter une condition cachée au QCM.

### `ent-assistants-options` — commercial

Production :

> Compare pour douze personnes, plafond 500 €, trajet court préféré. A : exclue, dix places. B : 450 €, quatorze places, 20 min ; C : 480 €, douze places, 10 min. C économise dix minutes de trajet pour 30 € de plus. Je propose C si elle est disponible et équipée ; demander date et équipement avant réservation.

Tableau transposable même écrit en lignes ; le format ne devrait pas être surévalué. Retour simulé : « Je comprends les compromis, mais c'est presque une comparaison que je ferais sans IA. » Recommandation : un transfert facultatif avec quatre critères et une quatrième option augmenterait la valeur perçue sans compliquer la mission de base. Ne pas imposer des scores pondérés artificiels.

### `ent-assistants-iterate` — commercial

Production :

> A : V1 oublie la grille/jeudi ; V2 convient. B : V1 oublie le devis/lundi ; V2 ajoute une remise non prévue. Modification : rappeler uniquement le livrable et sa date sans avantage commercial. Attendus : « La grille sera prête jeudi » ; « Le devis sera prêt lundi ». Modèle conservé : rédige un suivi bref pour [livrable] attendu [date] ; n'ajoute aucun engagement. Rejouer les deux cas.

**Piège révélé** : « sera prêt » peut devenir un engagement plus affirmatif que « attendu ». Ce n'est pas une mauvaise compréhension des critères principaux, mais une nuance métier utile à travailler. Exemple de réajustement : « La grille est attendue jeudi ; le devis est attendu lundi. » Retour simulé : « J'avais retiré la remise mais promis la disponibilité. » Recommandation auteur : feedback d'auto-comparaison sur le degré d'engagement, avec exemples de formulations acceptables. Pas de blocage général.

### `ent-assistants-team-playbook` — administratif

Production :

> But/public : relevé pour les participants. Entrées : notes autorisées et destinataires. Modèle : à partir de [notes], sépare décisions/actions/propositions/points ouverts, en [format]. Exemple : essai lundi ; grille Zoé jeudi ; samedi proposé. Critères : statuts fidèles et responsables/dates conservés. Camille entretient ; revue le 15 novembre 2026. Un collègue essaie un nouveau cas seul, note ses questions et le temps complet. 20−14=6 minutes sur ce cas, à confirmer sur d'autres.

Production possible mais longue à saisir sur téléphone dans une seule zone. Retour simulé : « J'aimerais emporter la fiche sans copier tout le texte à la main. » Recommandation UI : copier/télécharger le livrable, avertissement sortie, critères visibles tôt. Le manager ne doit pas recevoir ces réponses.

## Bilan de simulation et demandes aux auteurs

Aucun obstacle de contenu empêchant la production des six livrables. Les difficultés utiles sont le passage brief→sortie réelle, le degré d'engagement et l'export du travail. Les métiers variés évitent le cas support unique. Le parcours prépare une méthode structurée ; aucune mesure ici ne prouve une amélioration des performances d'employés. Ne pas annoncer six réussites humaines ni une durée calibrée.

Demandes prioritaires : nouveau dossier final avec chiffres et défauts différents du cours ; distracteurs plausibles ; nuance « attendu »/« sera prêt » ; capacité à conserver son livrable. Les deux premières relèvent de l'auteur, les deux suivantes de l'amélioration pédagogique et UI.
