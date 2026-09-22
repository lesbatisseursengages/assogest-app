# Audit fonctionnel — Les Bâtisseurs Engagés

## Conclusion

L’application existante est une application full-stack React, tRPC, Express et Drizzle/MySQL. Les modules demandés dans le cahier des charges sont déjà présents sous forme de pages et de procédures serveur. Le manque principal ne concernait donc pas la création de nouveaux modules, mais la couverture fonctionnelle du scénario de démonstration et la cohérence des données affichées dans les modules avancés.

La correction livrée dans cette itération complète le scénario avec les **campagnes de collecte**, les **adhésions**, les **événements** et le suivi opérationnel des projets. La base active contient désormais 8 contacts, 6 membres, 4 dons, 4 dépenses, 8 transactions, 8 documents, 6 activités CRM, 3 projets, 4 campagnes, 6 adhésions, 5 événements, 6 tâches et 6 jalons.

## Architecture identifiée

Le frontend est construit avec React 19, Vite, Tailwind et les composants Radix/shadcn. Le routage est assuré par Wouter. Le backend utilise Express et tRPC 11. Les requêtes SQL sont gérées par Drizzle ORM sur MySQL/TiDB. L’authentification en ligne repose sur Manus OAuth ; l’application possède également un mode hors ligne basé sur le stockage local.

Les routes sont regroupées dans `client/src/App.tsx`. Les procédures métier sont réparties entre `server/routers.ts` et les routeurs spécialisés CRM, membres/adhésions, gouvernance, e-mail, Stripe, antennes et paramètres administratifs. Le stockage de fichiers repose sur les helpers S3/Manus Storage.

## État des modules

| Module | État avant cet audit | Écart constaté | Correction appliquée |
|---|---|---|---|
| Dashboard | Fonctionnel et calculé depuis la base | Les indicateurs campagnes et adhésions pouvaient rester à zéro en mode démo | Les données correspondantes sont maintenant injectées et visibles dans les indicateurs existants |
| Contacts CRM | CRUD, recherche, segmentation et relations présents | Jeu démo déjà couvert | Aucun changement structurel |
| Membres | Registre, rôles, statuts, historique et annuaire présents | Jeu démo déjà couvert | Aucun changement structurel |
| Finances | Cotisations, dons, dépenses, graphiques, reçus et exports présents | Les données démo ne couvraient pas tous les parcours | Données existantes conservées et reliées aux contacts |
| Documents | Catégories, recherche, upload, archivage, restauration et notes présents | Jeu démo déjà couvert | Aucun changement structurel |
| CRM activités | Appels, réunions, e-mails et filtres présents | Jeu démo déjà couvert | Aucun changement structurel |
| Projets | Membres, tâches, jalons, budgets, mises à jour et commentaires présents | Le seed créait seulement le projet et son équipe | Ajout de tâches, jalons, lignes budgétaires et mise à jour pour chaque projet |
| Campagnes | Page, création, édition, suppression et statistiques présentes | Aucune donnée démo | Ajout de quatre campagnes avec statuts draft, active et completed |
| Adhésions | Page, filtres, statuts et statistiques présentes | Aucune donnée démo | Ajout de six adhésions liées aux membres avec statuts variés |
| Événements | Calendrier et CRUD présents | Aucune donnée démo | Ajout de cinq événements passés, récents et futurs |
| Communication | Annonces, actualités, e-mails et historique présents | Non nécessaire pour le périmètre de génération initial | Conservé, sans modification destructive |
| Gouvernance | Assemblées, participants, résolutions et votes présents | Non nécessaire pour le périmètre de génération initial | Conservé, sans modification destructive |
| Utilisateurs et permissions | Rôles, permissions, audit et administration présents | Les tests externes Stripe/MySQL restent dépendants de l’environnement | Aucun contournement des permissions ajouté |

## Données et réinitialisation

Le service `server/demo-data.ts` utilise le marqueur `demo-2026` et le libellé `[DÉMO 2026]`. La génération est idempotente. Une nouvelle génération supprime uniquement les enregistrements portant ce marqueur avant de recréer un scénario complet. Les données saisies manuellement ne sont pas ciblées.

La réinitialisation respecte les dépendances des projets. Les commentaires de tâches, tâches, jalons, budgets, mises à jour et équipes sont supprimés avant les projets associés. Les campagnes, adhésions et événements sont également nettoyés par leur marqueur textuel.

## Validation

`pnpm check` et `pnpm build` passent après la correction. La génération réelle sur la base WebDev a confirmé les volumes attendus. Le build affiche seulement les avertissements déjà connus concernant la taille de certains bundles et l’import de `jspdf`.

La suite Vitest reste partiellement dépendante de services externes : les tests qui interrogent MySQL peuvent échouer lors d’une coupure TLS et les tests Stripe nécessitent une clé de test valide. Ces limites ne bloquent pas la génération, l’affichage ou la réinitialisation du scénario démo.

## Éléments restant à traiter ultérieurement

La connexion Stripe réelle doit être vérifiée avec des secrets actifs dans l’environnement cible. Les tests MySQL doivent être exécutés dans un environnement où la négociation TLS est stable. Ces sujets relèvent de la configuration d’intégration et non d’un module métier manquant dans l’application.

## Références

[1]: ./server/demo-data.ts "Service transactionnel de données de démonstration"
[2]: ./client/src/App.tsx "Routes principales de l’application"
[3]: ./drizzle/schema.ts "Schéma Drizzle des modules métier"
[4]: ./client/src/pages/Settings.tsx "Interface de génération et réinitialisation des données"


## Extension de la démonstration — gouvernance et communication

La couverture démo a été étendue aux modules gouvernance, annonces et notifications. Le scénario crée trois assemblées avec des statuts différents. Il relie douze participations aux membres actifs, six résolutions aux assemblées, une procuration à l’assemblée ouverte et six votes à l’assemblée clôturée. Cette combinaison permet de tester le quorum, la présence, la représentation et les résultats de vote.

Le module annonces contient quatre entrées avec les statuts publié, brouillon et archivé. Le module notifications contient six entrées lues et non lues. Chaque notification possède un lien d’action, un type et une clé de déduplication stable. Les deux modules utilisent le marqueur `[DÉMO 2026]` pour permettre une réinitialisation ciblée.

La vérification sur la base active a confirmé les volumes suivants : 3 assemblées, 12 participations, 6 résolutions, 1 procuration, 6 votes, 4 annonces et 6 notifications. `pnpm check` et `pnpm build` restent validés.


## Tableau de bord gouvernance

Une procédure protégée `governance.dashboard` fournit désormais une synthèse calculée côté serveur. La nouvelle page affiche quatre indicateurs principaux : assemblées, participation, résolutions et assemblées clôturées. Elle liste ensuite chaque assemblée avec son statut, sa date, le nombre de participants, les résolutions, les votes et une visualisation du quorum atteint ou restant à compléter.

La page est accessible via `/governance/dashboard` et constitue maintenant l’entrée principale du menu **Gouvernance & AG**. L’écran opérationnel `/governance` reste disponible pour créer les séances et gérer les participants, résolutions et votes. La validation TypeScript et le build de production sont réussis.


## Trois améliorations finales du tableau de bord gouvernance

Le dashboard comprend maintenant un graphique comparatif par assemblée pour la participation, les résolutions et les votes. Un export PDF côté navigateur produit un procès-verbal synthétique avec le quorum et le détail des résultats de chaque résolution.

Les alertes avant assemblée utilisent le planificateur sécurisé déjà présent pour les rappels d’adhésion. L’administrateur active le rappel quotidien depuis le tableau de bord. Le système cible les assemblées planifiées dans les sept prochains jours, notifie le responsable et les participants possédant un compte, puis déduplique les notifications par assemblée, destinataire et jour.

La validation `pnpm check` et `pnpm build` est réussie. Le build conserve uniquement les avertissements existants sur la taille du bundle et le découpage dynamique de `jspdf`.


La validation a exécuté 318 tests : 316 tests passent. Les deux échecs restants sont indépendants de la gouvernance et proviennent de secrets d’intégration absents ou invalides dans l’environnement (`Brevo` sans clé API et `Stripe` avec une clé de test refusée). La vérification TypeScript et le build de production passent.


## Email des rappels et archivage documentaire

Les rappels gouvernance prennent maintenant en charge l’email Brevo de manière optionnelle et non bloquante. Les notifications internes restent la source fiable lorsque Brevo n’est pas configuré. L’archivage PDF génère un document sécurisé via `storagePut` et crée une fiche complétée dans la catégorie de gouvernance.

Le diagnostic des secrets confirme que Brevo et Stripe ne peuvent pas être activés dans cet environnement sans fournir les clés correspondantes. Aucun secret n’a été affiché, créé ou remplacé. TypeScript et le build de production restent validés après ces changements.
