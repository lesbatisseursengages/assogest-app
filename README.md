# Les Bâtisseurs Engagés

Application existante de gestion associative, reprise sans réinitialisation de données ni reconstruction de l’architecture.

## Démarrage local

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm dev
```

Le serveur de développement écoute par défaut sur le port `3000`. Le mode de production utilise le bundle généré dans `dist/`.

## Architecture

Le frontend est une application React/TypeScript servie par Vite. La navigation utilise Wouter et les appels métier passent par tRPC et TanStack React Query. Le backend est un serveur Express/Node.js regroupant les routeurs tRPC. Les données sont persistées dans MySQL/TiDB via Drizzle ORM et les fichiers sont envoyés vers le stockage S3 intégré.

Les dossiers importants sont `client/src/pages` pour les écrans, `client/src/components` pour les composants réutilisables, `server/routers.ts` et les sous-routeurs pour l’API métier, `server/db.ts` pour les accès aux données, `server/authorization.ts` pour les permissions et `drizzle/` pour le schéma et les migrations.

## Fonctionnalités existantes

L’application couvre notamment le tableau de bord, les membres, les adhésions et cotisations, les bénévoles, les documents, les finances, les projets, le CRM, les antennes et groupes, la gouvernance, les annonces et actualités, les e-mails, les notifications, les utilisateurs, les rôles, les permissions, les audits et le mode hors ligne. Les campagnes d’e-mails utilisent désormais Brevo côté serveur tout en conservant l’historique local. Voir `PROJECT_CONTEXT.md` pour la cartographie de reprise.

## Variables d’environnement

Les variables serveur référencées sont `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `PORT` et `NODE_ENV`. Le frontend référence aussi `VITE_OAUTH_PORTAL_URL`, `VITE_FRONTEND_FORGE_API_URL` et `VITE_FRONTEND_FORGE_API_KEY`. Brevo utilise `APP_BREVO_API_KEY` côté serveur. Stripe accepte les secrets WebDev dédiés `APP_STRIPE_SECRET_KEY` et `APP_STRIPE_WEBHOOK_SECRET` (avec repli vers `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` si les variables intégrées sont disponibles). Les secrets restent côté serveur, ne sont jamais stockés en base ni dans le dépôt, et ne doivent jamais être envoyés dans le chat.

## Base de données

Le schéma déclaré contient 62 tables et 37 migrations Drizzle. La base existante doit être analysée avant toute migration. Ne pas exécuter `pnpm db:push` sur une base de production sans sauvegarde, comparaison du schéma, validation des relations et procédure non destructive. Les audits existants sont `SCHEMA_AUDIT.md` et `MIGRATION_STRATEGY.md`.

## Authentification

Le backend contient l’intégration OAuth Manus et des sessions JWT. L’interface contient encore une voie locale de démonstration dans `client/src/hooks/usePasswordAuth.ts`, avec des identifiants codés en dur et une session `sessionStorage`. Cette voie doit être remplacée ou raccordée au serveur dans une mission dédiée, avec migration contrôlée des comptes et tests de permissions. Ne pas considérer cette authentification locale comme prête pour la production.

## Qualité et reprise

La base WebDev de test dédiée contient les migrations, tables, index et contraintes du projet importé. Elle est actuellement préremplie avec le scénario démo tchadien afin de permettre une présentation immédiate. `pnpm check` et `pnpm build` réussissent. Les corrections de compatibilité appliquées à cette base sont documentées dans `PROJECT_CONTEXT.md` et n’ont pas modifié les données métier non marquées.

La page Membres propose maintenant **Importer CSV**. Le fichier est prévisualisé et validé avant insertion ; les formats séparés par virgule ou point-virgule, les en-têtes français usuels, les statuts et les catégories d’adhésion sont reconnus. Les lignes invalides sont refusées, les doublons d’identifiant ou d’adresse e-mail sont ignorés avec un rapport, et chaque import est journalisé.

La page **Corbeille des documents** (`/archives`) permet de retrouver et restaurer les documents supprimés depuis l’application. Une suppression de document est non destructive : le document est marqué archivé (`isArchived = 1`) et reste récupérable. La restauration remet le document dans la liste active. La suppression physique n’est pas proposée par l’interface.

Le tableau de bord affiche également une jauge **Corbeille** alimentée par un comptage serveur des documents archivés. Elle reste cohérente après déconnexion et reconnexion et ouvre directement la corbeille. Le compteur est actuellement calculé sur l’instance de test ; le contrôle réel effectué le 17 septembre 2026 indiquait zéro document archivé.

## Règles de développement

Comprendre l’existant avant de coder, réutiliser les composants, préserver les données, vérifier les rôles et permissions, travailler avec des migrations non destructives, tester les changements, vérifier le build, puis mettre à jour `PROJECT_CONTEXT.md` et ce README. L’ancienne application et son URL de production ne doivent pas être supprimées ou modifiées inutilement.

### Navigation secondaire des modules

Les modules principaux disposent d’une sous-navigation contextuelle réutilisable via `client/src/components/ModuleSubnav.tsx`. Elle permet d’accéder rapidement aux sous-fonctionnalités depuis Finances, Membres, CRM, Administration et Projets, sans repasser par le menu latéral.


## Données de démonstration

Pour préparer une présentation ou un test complet, ouvrez **Paramètres → Données** puis cliquez sur **Générer des données de démonstration**. Le scénario pré-remplit les contacts, membres, dons, dépenses, transactions, documents, activités CRM, projets, campagnes, adhésions et événements avec des données cohérentes pour l’association Les Bâtisseurs Engagés au Tchad.

La génération peut être relancée sans créer de doublons : les enregistrements du scénario sont repérés par le marqueur technique `demo-2026`. Le bouton **Réinitialiser les données** demande une confirmation et supprime uniquement ces enregistrements de démonstration ; les données saisies manuellement sont conservées.

Le tableau de bord recalcule les membres actifs, les montants financiers, les campagnes, les adhésions, les documents urgents et l’activité CRM récente directement depuis la base. Les montants de démonstration sont exprimés en francs CFA (XOF) et les dates sont volontairement étalées entre historique, récent et à venir.


La vérification intégrée du scénario confirme les volumes attendus et l’idempotence : après génération, les compteurs sont 8 contacts, 6 membres, 4 dons, 4 dépenses, 8 transactions, 8 documents, 6 activités, 3 projets, 4 campagnes, 6 adhésions, 5 événements, 6 tâches et 6 jalons. Les statuts financiers sont représentés dans les libellés et notes existants de la structure (`validé`, `en attente`, `rejeté`) afin de respecter les tables historiques sans les modifier.

Un rapport détaillé de l’audit et des écarts corrigés est disponible dans `AUDIT_FONCTIONNEL_2026-09.md`.


Le scénario couvre aussi la gouvernance et la communication interne : il crée 3 assemblées, 12 participations, 6 résolutions, 1 procuration et 6 votes, ainsi que 4 annonces et 6 notifications. Les statuts mélangent brouillon, planifié, ouvert, clôturé, publié et archivé afin de tester les filtres et les états d’interface.


## Tableau de bord gouvernance

Le menu **Gouvernance & AG** ouvre désormais `/governance/dashboard`. Cette vue synthétise le nombre d’assemblées, les assemblées ouvertes ou clôturées, les participations, les résolutions et les votes. Chaque assemblée affiche sa date, son statut, sa participation et une barre de quorum. La page `/governance` conserve l’écran opérationnel pour créer les assemblées, inviter les membres, pointer les présences et gérer les votes.


## Améliorations du tableau de bord gouvernance

Le tableau de bord affiche maintenant un graphique comparant la participation, les résolutions et les votes pour chaque assemblée. Chaque ligne d’assemblée possède une action d’export PDF qui produit un procès-verbal synthétique avec la date, le statut, le quorum, les résultats détaillés des résolutions et les mentions disponibles.

Le bouton **Activer les rappels** configure un rappel quotidien à 9 h UTC. Le callback sécurisé recherche les assemblées planifiées dans les sept prochains jours et crée une notification dédupliquée pour le responsable et les membres participants liés à un compte utilisateur. Les doublons quotidiens sont évités par une clé stable. L’activation nécessite une session administrateur disposant de la permission `governance.manage`.


## Email et archivage des procès-verbaux

Les rappels d’assemblées créent toujours une notification interne. Lorsque `APP_BREVO_API_KEY` et l’adresse email de l’association sont configurées, le même rappel est envoyé par Brevo au responsable et aux participants disposant d’un email. Un échec Brevo ne bloque pas la notification interne.

L’action **Archiver** d’une assemblée génère le PDF côté navigateur, l’envoie au stockage sécurisé puis crée une entrée dans **Documents → Gouvernance et Pilotage** avec le statut complété et le fichier PDF attaché. Les clés Brevo et Stripe ne sont pas présentes dans l’environnement actuel ; elles doivent être ajoutées dans les secrets WebDev pour activer les appels externes et les tests d’intégration correspondants.
