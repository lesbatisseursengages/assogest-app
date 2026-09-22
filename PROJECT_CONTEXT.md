# PROJECT_CONTEXT — Les Bâtisseurs Engagés

## Objectif

Application existante de gestion de l’association **Les Bâtisseurs Engagés**. Cette copie est une reprise du projet existant, et non une refonte. Les données et les fonctionnalités doivent être conservées.

## Stack identifiée

- Frontend : React 19, TypeScript 5.9, Vite 7, Wouter, Tailwind CSS 4, Radix UI, TanStack React Query, tRPC React.
- Backend : Node.js/TypeScript, Express, tRPC, esbuild.
- Persistance : MySQL/TiDB Cloud via `drizzle-orm/mysql2` et Drizzle Kit.
- Fichiers : stockage S3 via les helpers intégrés (`server/storage.ts`).
- Paiements : intégration Stripe présente dans le code, activée uniquement si les secrets sont configurés.
- Tests : Vitest, 41 fichiers de tests serveur recensés.

## Structure

- `client/src/pages/` : 49 pages fonctionnelles et d’administration.
- `client/src/components/` : composants métier et composants UI réutilisables.
- `client/src/App.tsx` : sélection online/offline, authentification de l’interface et routes Wouter.
- `server/routers.ts` : routeur tRPC principal et assemblage des sous-routeurs.
- `server/*-router.ts` : domaines e-mail, CRM, adhésions, structures et gouvernance, entre autres.
- `server/db.ts` : accès aux données et opérations métier.
- `server/authorization.ts` : permissions granulaires et périmètres.
- `drizzle/schema.ts` : 62 tables MySQL déclarées.
- `drizzle/*.sql` : 37 migrations présentes, avec un historique non strictement séquentiel autour des migrations `0019`.
- `shared/` : constantes et logique partagée.

## Fonctionnalités identifiées

- Tableau de bord et statistiques globales.
- Membres, annuaire, profils, certificats, historique, statuts et progression.
- Adhésions, cotisations, règles tarifaires et rappels.
- Bénévoles.
- Documents, catégories, notes, archivage, restauration, upload S3 et exports PDF.
- Finances : dons, dépenses, transactions, rapports, multi-devises et reçus fiscaux.
- Projets : membres, tâches, commentaires, jalons, mises à jour, budgets et rapports.
- CRM : contacts, activités et rapports.
- Antennes et groupes.
- Gouvernance : assemblées, participants, procurations, résolutions et votes.
- Communication : annonces, actualités, commentaires, e-mails, modèles et historique.
- Notifications et préférences.
- Utilisateurs, rôles, permissions, périmètres, journaux d’audit et réinitialisations de mots de passe.
- Mode en ligne et mode hors ligne.

## Authentification et autorisation

Le backend contient l’intégration OAuth Manus et des sessions JWT signées par `JWT_SECRET`. Le propriétaire peut être promu administrateur via `OWNER_OPEN_ID`. Les permissions métier sont granulaires (`members.view`, `documents.manage`, `finances.view`, etc.) et les périmètres supportent `national`, `antenne`, `groupe` et `project`.

**Point critique à traiter avant mise en production :** `client/src/hooks/usePasswordAuth.ts` utilise actuellement une authentification locale de démonstration côté navigateur, avec utilisateurs et mots de passe par défaut codés en dur et un jeton aléatoire stocké en `sessionStorage`. Cette voie n’est pas une authentification sécurisée ni reliée aux tables serveur. Aucun changement n’a été appliqué pendant l’audit ; une stratégie de migration vers un mécanisme serveur doit être décidée et testée sans perdre les comptes ni les données.

## Base de données et données

La source de vérité attendue est MySQL/TiDB via `DATABASE_URL`. Le schéma contient notamment les tables `users`, `app_users`, `members`, `adhesions`, `cotisations`, `documents`, `projects`, `roles`, `permissions`, `user_roles`, `user_scopes`, `notifications`, `events`, `assemblies` et les tables financières.

Les documents `SCHEMA_AUDIT.md` et `MIGRATION_STRATEGY.md` indiquent une migration progressive non terminée. Ils signalent des index et clés étrangères manquants, des incohérences de nommage et des écarts entre schémas. **Ne pas lancer `pnpm db:push` ni supprimer/réinitialiser une base** sans comparaison avec la base cible et plan de migration validé.

## Variables d’environnement réellement référencées

- `DATABASE_URL` : connexion MySQL/TiDB.
- `JWT_SECRET` : signature des sessions backend.
- `VITE_APP_ID` : identifiant de l’application Manus.
- `OAUTH_SERVER_URL` : serveur OAuth Manus.
- `OWNER_OPEN_ID` : identifiant du propriétaire administrateur.
- `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` : services intégrés/proxy.
- `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`, `VITE_FRONTEND_FORGE_API_URL`, `VITE_FRONTEND_FORGE_API_KEY` : variables frontend référencées.
- `APP_STRIPE_SECRET_KEY`, `APP_STRIPE_WEBHOOK_SECRET` : secrets dédiés de l’intégration Stripe dans WebDev ; le code accepte aussi `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` en repli lorsque les variables intégrées sont disponibles. `APP_BREVO_API_KEY` est la clé API Brevo v3 dédiée à l’envoi transactionnel. Ces valeurs restent côté serveur et ne sont ni stockées dans la base ni exposées au navigateur.
- `PORT`, `NODE_ENV` : exécution du serveur.
- `OPENAI_API_KEY` est référencée par le helper LLM serveur si cette fonction est utilisée.

Les valeurs ne sont pas inventées ni copiées dans le dépôt.

## Services externes

OAuth Manus, MySQL/TiDB, stockage S3 intégré, notification intégrée, proxy Forge/Maps éventuel, Stripe optionnel, Brevo pour les e-mails transactionnels et LLM optionnel. n8n et PayPal ne sont pas encore configurés.

## Développement et déploiement

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm dev
pnpm start
```

Le build produit le frontend Vite et le serveur bundle dans `dist/`. Le script `db:push` génère puis applique des migrations ; il est réservé à une procédure de migration contrôlée et non à une initialisation aveugle.

## Contraintes permanentes

Comprendre l’existant avant modification ; réutiliser les composants ; préserver les données ; vérifier les rôles ; ne jamais inventer de secret ; tester chaque changement ; mettre à jour `README.md` et ce fichier ; valider le build avant déploiement ; ne pas remplacer l’ancienne application ni son URL sans validation complète.

## État de la reprise

Audit initial effectué sur l’archive fournie. Aucune fonctionnalité métier ni donnée n’a été supprimée ou modifiée. Les résultats du build et des tests sont consignés dans le rapport de reprise associé.

## État de l’instance WebDev de test — 14 septembre 2026

La base dédiée de test est désormais structurée sans données associatives de démonstration. Les 37 entrées de migration sont enregistrées dans `__drizzle_migrations`. Le contrôle réel a relevé 66 tables, 44 index et 71 contraintes. La seule ligne non vide est le compte système `users` créé par l’infrastructure WebDev pour l’authentification ; aucun membre, projet, document, don, dépense, cotisation ou transaction de démonstration n’a été inséré.

Pour rendre l’historique fourni applicable sur une base vierge, trois adaptations minimales ont été effectuées uniquement sur cette base de test : ajout des colonnes `members.memberID` et `members.gender` ainsi que de l’index unique attendu par les migrations, neutralisation de l’ajout redondant de `members.photo` déjà introduit par une migration précédente, et conversion à l’exécution de `DEFAULT 'CURRENT_TIMESTAMP'` en `DEFAULT CURRENT_TIMESTAMP` pour les tables concernées. Les fichiers SQL originaux n’ont pas été réécrits et les hash originaux sont conservés dans le journal.

La suite de validation sur cette base structurée est entièrement verte : 41 fichiers de tests, 314 tests réussis, vérification TypeScript réussie et build de production réussi. Le bundle comporte encore un avertissement de taille et un avertissement de découpage dynamique `jspdf`, sans échec de compilation.

## Import CSV des membres

La page Membres expose une procédure `previewCsv` puis `importCsv`, protégées par la permission `members.manage`. Le parseur partagé accepte les fichiers CSV séparés par virgule ou point-virgule, les valeurs entre guillemets, les en-têtes français usuels et douze champs membres. Les lignes sont limitées à 1 000 par import, validées avant insertion, et les doublons d’identifiant ou d’e-mail sont ignorés sans écrasement. L’import crée l’historique de statut et une entrée de journal d’activité ; aucune donnée n’est créée avant la confirmation de l’utilisateur.


## Correctif permissions administrateur — 14 septembre 2026

La page `/admin/permissions` avait deux problèmes sur la base WebDev de test : la table `user_scopes` était déclarée dans le schéma Drizzle mais absente physiquement de la base, et `members.portalProfile` levait une erreur lorsqu’un compte administrateur ne possédait pas encore de profil membre associé. La table `user_scopes` a été recréée avec `CREATE TABLE IF NOT EXISTS`, sans insertion de données ; son contrôle confirme une structure conforme et zéro ligne. `portalProfile` renvoie désormais `null` dans ce cas, ce que l’interface sait afficher comme état vide. La suite de validation reste verte : 41 fichiers et 314 tests, TypeScript et build réussis.


## Navigation secondaire des modules — 15 septembre 2026

Le composant réutilisable `client/src/components/ModuleSubnav.tsx` fournit des boutons de navigation contextuelle dans les modules **Finances**, **Membres**, **CRM**, **Administration** et **Projets**. Les boutons réutilisent les routes et onglets existants : ils ne créent pas de données et ne modifient pas la logique métier. Validation effectuée : TypeScript, 41 fichiers de tests et 314 tests réussis, puis build de production réussi.


## Correctif permissions granulaires — 15 septembre 2026

La page `/admin/permissions` ne fonctionnait pas comme attendu parce que la base de test contenait 21 permissions, mais aucun rôle (`roles = 0`), aucune association utilisateur-rôle (`user_roles = 0`) et aucune association rôle-permission (`role_permissions = 0`). La consultation affichait donc une matrice vide et aucun rôle sélectionnable. Une initialisation idempotente a été ajoutée : au chargement des rôles, l’application garantit l’existence du rôle système `Administrateur` et lui associe toutes les permissions configurables existantes. Cette configuration n’ajoute aucun utilisateur, membre, projet ou autre donnée métier. Après initialisation, la base contient 1 rôle système, 21 permissions et 21 associations rôle-permission. La validation complète reste verte avec 41 fichiers et 314 tests réussis, TypeScript et build réussis.


## Navigation contextuelle globale — 15 septembre 2026

La sous-navigation est désormais rendue par `DashboardLayout` via `ContextualModuleNav`, et non plus uniquement par certaines pages. La barre s’affiche automatiquement selon la route active et reste visible sur les sous-pages des modules Documents, Membres, Projets et événements, Structures, CRM, Communication, Administration et Activité. Les pages déjà équipées de sous-menus locaux ont été nettoyées pour éviter les doublons. Les boutons utilisent les routes existantes et mettent à jour la page affichée via Wouter. Finance conserve ses onglets internes existants. Validation : 41 fichiers et 314 tests réussis, TypeScript et build réussis.

## Corbeille récupérable des documents — 16 septembre 2026

La suppression d’un document depuis l’interface est désormais non destructive : elle positionne `documents.isArchived` à `1` au lieu de supprimer la ligne. La page `/archives` sert de **corbeille des documents** ; elle conserve la recherche et le filtre par catégorie et propose l’action `Restaurer`, qui remet `isArchived` à `0`. Les journaux d’activité distinguent maintenant le déplacement en corbeille (`archive`) de la suppression physique. Aucun nettoyage automatique ni suppression définitive n’est exposé à l’utilisateur. Les autres modules qui utilisent encore une suppression physique devront être migrés séparément après analyse de leurs relations métier.

Le tableau de bord interroge désormais la base pour compter séparément les documents actifs et les documents en corbeille (`archivedDocuments`). La jauge **Corbeille** est cliquable et ouvre `/archives`. Le comptage ne dépend ni du stockage local du navigateur ni de la session : il est recalculé depuis MySQL/TiDB à chaque connexion. Un contrôle SQL de l’instance de test a confirmé que le compteur actuel est `0` ; aucune donnée supprimée antérieurement n’a donc pu être récupérée automatiquement.

## Intégration Brevo — 19 septembre 2026

La clé API Brevo v3 de l’association est conservée dans le secret serveur `APP_BREVO_API_KEY`. Elle a été validée sans envoi de message contre l’endpoint officiel `GET /v3/account`. Le nouveau client `server/brevo.ts` appelle `POST https://api.brevo.com/v3/smtp/email` uniquement côté serveur, avec un expéditeur issu de l’identité de l’association et des destinataires issus du filtre membres. Le routeur e-mail conserve les tables `email_history` et `email_recipients`, enregistre les statuts `sent` ou `failed` et n’utilise plus la notification interne comme faux envoi. Les campagnes sont limitées aux membres disposant d’une adresse e-mail valide. Aucun e-mail réel n’a été envoyé automatiquement lors de cette intégration ; un test contrôlé depuis le compositeur reste à effectuer. n8n et les webhooks Brevo seront traités dans une étape séparée.


## Mode de démonstration réaliste (2026)

L’application dispose d’un scénario de démonstration tchadien activable depuis **Paramètres → Données**. Le service `server/demo-data.ts` alimente les tables existantes `crm_contacts`, `members`, `dons`, `depenses`, `transactions`, `documents`, `crm_activities`, `projects` et `project_members` au moyen d’une transaction Drizzle. Les données sont reliées par les adresses e-mail des contacts, les numéros d’adhésion et les responsables de projets ; les montants sont en XOF et les dates couvrent plusieurs périodes passées et récentes.

Le scénario comprend 8 contacts, 6 membres, 4 dons, 4 dépenses, 8 transactions, 8 documents, 6 activités CRM et 3 projets. Les documents couvrent les statuts, procès-verbaux, rapports et factures avec des états `completed`, `in-progress` et `pending`. Les activités CRM couvrent les appels, réunions et e-mails et sont rattachées aux contacts.

Chaque enregistrement de démonstration porte le marqueur technique `demo-2026` dans un champ non intrusif (tags, description ou identifiant d’adhésion). La génération est idempotente : elle réinitialise d’abord uniquement ces enregistrements marqués. Le bouton **Réinitialiser les données** supprime exclusivement les données du scénario et ne touche pas aux données créées manuellement. Aucun schéma existant n’est recréé et aucune donnée métier non marquée n’est supprimée.

Le routeur tRPC expose `demoData.summary`, `demoData.generate` et `demoData.reset`. Le tableau de bord calcule désormais le nombre de membres au statut `active` et expose le nombre d’activités CRM récentes des sept derniers jours. Les indicateurs financiers continuent de s’appuyer sur les tables historiques de dons, dépenses et cotisations.


## Mode démo et validation WebDev — 20 septembre 2026

Le mode de démonstration est implémenté dans `server/demo-data.ts` et accessible via les procédures tRPC `demoData.summary`, `demoData.generate` et `demoData.reset`. La vérification réelle sur la base WebDev a confirmé la génération de **8 contacts, 6 membres, 4 dons, 4 dépenses, 8 transactions, 8 documents, 6 activités CRM et 3 projets**, puis la réinitialisation exacte à zéro. Le marqueur technique partagé est `demo-2026` ; le nettoyage couvre aussi le libellé visible `[DÉMO 2026]`.

Le schéma de l’instance WebDev a été aligné avec `pnpm drizzle-kit push --config drizzle.config.ts` après correction des 71 defaults timestamp qui utilisaient une chaîne `CURRENT_TIMESTAMP` incompatible avec MySQL. Cette correction reste dans `drizzle/schema.ts` sous la forme `.defaultNow()` ; les migrations historiques ne sont pas réécrites. La base de test ne contenait initialement que les tables d’authentification et aucune donnée associative, donc aucune donnée métier existante n’a été supprimée.


## Audit et enrichissement fonctionnel — 20 septembre 2026

L’audit a confirmé que les modules CRM, membres, finances, documents, projets, campagnes, adhésions, événements, communication, gouvernance, utilisateurs et permissions existent déjà dans l’architecture importée. L’écart principal portait sur la couverture des données de démonstration, et non sur l’absence de pages métier.

Le scénario démo a été étendu sans nouvelle table ni refonte. Il alimente maintenant `campaigns`, `adhesions`, `events`, `project_tasks`, `project_milestones`, `project_budget_items` et `project_updates`, en plus des tables déjà couvertes. La base WebDev active contient 4 campagnes, 6 adhésions, 5 événements, 6 tâches et 6 jalons supplémentaires. Les sous-éléments restent reliés aux projets et aux membres responsables.

La réinitialisation respecte l’ordre des dépendances des projets et supprime uniquement les lignes marquées `demo-2026` ou `[DÉMO 2026]`. Les modules existants restent accessibles par leurs routes actuelles. Le rapport détaillé est conservé dans `AUDIT_FONCTIONNEL_2026-09.md`.


## Extension du scénario démo — gouvernance et communication — 20 septembre 2026

Le seed alimente désormais les tables `assemblies`, `assembly_participants`, `assembly_resolutions`, `assembly_proxies`, `assembly_votes`, `announcements` et `notifications`. Les trois assemblées couvrent les états clôturée, ouverte et planifiée. Les relations vérifiées comprennent 12 participations, 6 résolutions, 1 procuration et 6 votes. Les annonces couvrent les états publié, brouillon et archivé ; les notifications couvrent les états lu et non lu avec des liens vers les modules concernés.

La réinitialisation supprime d’abord les votes et les résolutions avant les assemblées, puis nettoie les annonces et notifications par le marqueur `[DÉMO 2026]`. Les compteurs des trois modules sont renvoyés par `demoData.summary` et affichés dans Paramètres → Données. La vérification réelle de la base a confirmé 3 assemblées, 4 annonces et 6 notifications.


## Tableau de bord gouvernance — 20 septembre 2026

La procédure protégée `governance.dashboard` calcule une synthèse serveur à partir des assemblées, participations, résolutions et votes. Elle renvoie les compteurs d’assemblées ouvertes, planifiées et clôturées, le nombre de participants, de résolutions, de votes et de quorums atteints. Chaque assemblée renvoyée contient son taux de participation et l’état de son quorum.

La page `client/src/pages/GovernanceDashboard.tsx` affiche ces indicateurs dans une vue dédiée. Elle est accessible à `/governance/dashboard`, ajoutée à la sous-navigation contextuelle et utilisée comme entrée principale du menu **Gouvernance & AG**. La page opérationnelle `/governance` est conservée pour la gestion détaillée des séances.


## Améliorations gouvernance — graphiques, PDF et rappels — 20 septembre 2026

`governance.dashboard` renvoie désormais les résultats agrégés de chaque résolution. `GovernanceDashboard.tsx` exploite ces données avec Recharts pour comparer la participation, les résolutions et les votes par assemblée. `client/src/lib/governanceExport.ts` génère côté navigateur un PDF de procès-verbal et de résultats de vote sans stocker de fichier sur le serveur.

Les rappels utilisent le même mécanisme Heartbeat que les rappels d’adhésion. La mutation `governance.setupReminderSchedule` crée de façon idempotente la planification `governance-assembly-reminders`. Le callback `/api/scheduled/governance-assembly-reminders` est authentifié par l’identité cron, limite la recherche aux assemblées au statut `scheduled` prévues dans les sept prochains jours et crée des notifications dédupliquées. Aucune planification n’est créée automatiquement sans action explicite de l’administrateur.


## Email des rappels et archivage PDF — 20 septembre 2026

`generateGovernanceReminderNotifications` envoie d’abord une notification interne dédupliquée. Si `APP_BREVO_API_KEY` et l’email d’identité de l’association sont disponibles, il appelle `sendBrevoEmail` pour le responsable et les participants ayant un email. Les erreurs Brevo sont journalisées et comptabilisées sans annuler la notification interne. Les clés ne sont jamais exposées au client.

La mutation `governance.archivePdf` reçoit le PDF généré côté navigateur, le stocke via `storagePut` sous `documents/governance/{assemblyId}/...`, puis crée un document complété dans la catégorie `gouvernance`. L’objet reste accessible depuis le module Documents et le fichier n’est pas conservé en base.

Le diagnostic du 20 septembre 2026 confirme l’absence de `BREVO_API_KEY`, `BREVO_API_KEY_PROD`, `STRIPE_SECRET_KEY` et `STRIPE_TEST_SECRET_KEY` dans l’environnement. Aucune valeur n’a été inventée ni modifiée.
