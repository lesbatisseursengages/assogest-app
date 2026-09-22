# Rapport de reprise — Les Bâtisseurs Engagés

**Périmètre :** analyse de l’archive fournie, sans modification des fonctionnalités métier, sans migration et sans réinitialisation de base.

## A. Stack technique identifiée

L’application est un monorepo TypeScript full-stack. Le frontend utilise React 19, Vite 7, Wouter, Tailwind CSS 4, Radix UI, TanStack React Query et tRPC. Le backend utilise Node.js, Express, tRPC et esbuild. La persistance utilise MySQL/TiDB avec Drizzle ORM et Drizzle Kit. Les fichiers sont gérés par un stockage S3 intégré. Vitest est utilisé pour les tests.

## B. Architecture du projet

Le point d’entrée frontend est `client/src/App.tsx`. Il sélectionne le mode en ligne/hors ligne, affiche l’authentification et monte les routes Wouter sous `DashboardLayout`. Le backend assemble les routeurs dans `server/routers.ts`, avec des sous-domaines dédiés à l’e-mail, au CRM, aux adhésions, aux structures et à la gouvernance. Les fonctions de persistance sont principalement dans `server/db.ts`. Les règles d’autorisation sont dans `server/authorization.ts`. Le projet recense 49 pages, 22 composants métier principaux, 7 routeurs serveur dédiés, 62 tables et 37 migrations SQL.

## C. Base de données identifiée

La base attendue est MySQL/TiDB, configurée par `DATABASE_URL`. Le schéma Drizzle contient les domaines utilisateurs, membres, adhésions, cotisations, finances, documents, projets, CRM, structures, gouvernance, communication, notifications, permissions et paiements. Une stratégie de migration progressive est déjà documentée. L’historique contient un trou apparent autour des migrations `0019`, à vérifier avec la table des migrations de la base réelle. Aucune commande de migration n’a été lancée.

Les audits fournis identifient des index et clés étrangères manquants, des incohérences de nommage (`users`/`app_users`, `activityLogs`/`auditLogs`, entre autres) et des écarts entre versions du schéma. Ces points nécessitent une comparaison avec la base existante avant toute correction.

## D. Services externes identifiés

Le code référence l’authentification OAuth Manus, le stockage S3 intégré, les services de notification intégrés, un proxy Forge/Maps éventuel, Stripe pour les paiements et un helper LLM optionnel. Aucun connecteur externe additionnel n’a été activé pendant l’audit.

## E. Variables d’environnement requises

Les références réellement trouvées sont `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `VITE_OAUTH_PORTAL_URL`, `VITE_FRONTEND_FORGE_API_URL`, `VITE_FRONTEND_FORGE_API_KEY`, `PORT` et `NODE_ENV`. Stripe utilise `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`. Le helper LLM référence `OPENAI_API_KEY` lorsqu’il est utilisé. Les valeurs ne sont pas présentes dans l’archive et n’ont pas été inventées.

## F. Fonctionnalités existantes

Le tableau de bord expose des indicateurs et statistiques. Les membres disposent d’un annuaire, de profils, d’un historique, de statuts, de grades, de certificats et d’une progression. Les adhésions et cotisations prennent en charge les règles tarifaires et les rappels. Les documents disposent de catégories, notes, recherche, filtrage, archivage, restauration, permissions, upload S3 et export PDF. Les finances couvrent dons, dépenses, transactions, rapports multi-devises et reçus fiscaux. Les projets couvrent membres, tâches, commentaires, jalons, mises à jour, budgets et rapports. Le CRM couvre contacts, activités et rapports. L’application inclut aussi les bénévoles, événements, antennes, groupes, assemblées, votes, annonces, actualités, e-mails, notifications, audits, utilisateurs, rôles, permissions, paramètres et mode hors ligne.

## G. Modules fonctionnels

Les modules fonctionnels identifiés sont : tableau de bord ; membres et annuaire ; adhésions et cotisations ; bénévoles ; documents et archives ; finances ; campagnes et dons ; projets ; CRM ; événements ; antennes et groupes ; gouvernance ; communication ; notifications ; gestion utilisateurs ; rôles et permissions ; journaux d’audit ; paramètres ; portail membre ; portail bénévole ; mode hors ligne.

## H. Modules incomplets ou à confirmer

La migration progressive du schéma est documentée mais non terminée. L’authentification locale frontend reste une démonstration et n’est pas reliée de façon fiable aux comptes serveur. Les intégrations e-mail transactionnel, HelloAsso/Stripe en production, calendrier et observabilité ne sont pas toutes activées ou documentées comme opérationnelles. La disponibilité réelle des données doit être confirmée par une connexion à la base cible. Le build production doit être exécuté séparément après configuration d’un environnement complet.

## I. Erreurs identifiées

Le contrôle automatisé révèle des échecs de tests provoqués par l’absence de base de données accessible : plusieurs fonctions lèvent `Database not available`, et le test du nombre minimal d’administrateurs obtient zéro. Ce n’est pas une preuve de corruption des données ; c’est un défaut de configuration de l’environnement de test. Le rapport existant datant de mars 2026 annonçait une suite verte, mais il n’est pas représentatif de la vérification actuelle sans les variables et la base nécessaires.

Un risque de sécurité majeur est également présent : `client/src/hooks/usePasswordAuth.ts` contient deux utilisateurs et mots de passe par défaut en clair dans le bundle frontend, utilise un jeton aléatoire non signé en `sessionStorage` et permet de modifier les utilisateurs localement. Cette voie doit être traitée avant une mise en production.

## J. Erreurs corrigées

Aucune correction métier, de schéma ou d’authentification n’a été appliquée lors de cette première mission. Les fichiers de documentation `PROJECT_CONTEXT.md` et `README.md` ont été ajoutés pour formaliser l’état de reprise conformément aux instructions.

## K. État de l’authentification

Deux mécanismes coexistent dans le code : l’intégration OAuth Manus côté serveur avec sessions JWT, et l’authentification locale de démonstration côté frontend. Les rôles et permissions serveur sont plus riches que les deux rôles locaux `admin` et `membre`. Cette divergence doit être résolue par une migration contrôlée, après confirmation du mécanisme d’identité retenu et des comptes à préserver.

## L. État des données

Aucune base n’a été supprimée, réinitialisée ou migrée. L’archive contient le schéma et les migrations, mais pas les données de production. La connexion à la base réelle n’est pas disponible dans l’environnement de reprise. Les données existantes doivent donc être considérées comme non transférées tant que `DATABASE_URL` et une procédure de sauvegarde/validation n’ont pas été fournis par l’environnement Manus cible.

## M. État du nouveau déploiement

Aucun nouveau déploiement n’a été effectué pendant l’audit. L’ancienne application n’a pas été modifiée.

## N. URL du nouveau déploiement

Aucune URL de nouvelle instance n’est disponible à ce stade. L’URL de référence communiquée reste `https://lesbatisseursengages.manus.space/dashboard` et n’a pas été modifiée.

## O. État de GitHub

L’archive extraite ne contient pas de dépôt Git exploitable ni de remote GitHub. Aucun nouveau dépôt n’a été créé afin d’éviter une action inutile avant validation de la stratégie de reprise.

## P. Recommandations pour la suite

La première priorité est de fournir ou reconnecter un environnement de test avec une base non destructive afin de relancer `pnpm test` puis `pnpm build` dans des conditions représentatives. La seconde est de décider du mécanisme d’authentification officiel et de supprimer les identifiants codés en dur de l’interface après migration contrôlée. La troisième est de comparer le schéma Drizzle aux tables réelles, de préparer des migrations additives avec sauvegarde et de ne pas supprimer les tables legacy avant validation. Ensuite, il faudra tester les parcours critiques — connexion, permissions, membres, adhésions, documents, finances et persistance — puis seulement préparer un déploiement séparé de l’ancienne application.
