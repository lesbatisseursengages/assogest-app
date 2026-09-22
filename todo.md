# Mission 2026-09 — Environnement de démonstration réaliste

Le backlog historique du dépôt est conservé dans `TODO_BACKLOG.md`. Le présent fichier suit uniquement la mission exécutée dans cette session.

## Données et cohérence

- [x] Seed transactionnel idempotent pour 8 contacts, 6 membres, 4 dons, 4 dépenses, 8 transactions, 8 documents, 6 activités CRM et 3 projets.
- [x] Réinitialisation ciblée des enregistrements marqués `demo-2026` sans toucher aux données métier.
- [x] Contacts réalistes du Tchad : partenaires, bénéficiaires, donateurs, bénévoles, fournisseur et bailleur.
- [x] Membres avec numéros uniques, rôles et statuts actifs/inactifs.
- [x] Dons liés aux contacts et dépenses/transactions avec libellés validé, en attente et rejeté dans la structure existante.
- [x] Documents avec catégories, priorités et états complété, en cours et en attente.
- [x] Activités CRM appels, réunions et e-mails reliées aux contacts.
- [x] Projets avec statuts, dates, budgets et responsables membres.

## Backend, base et interface

- [x] Service `server/demo-data.ts` transactionnel et idempotent.
- [x] Procédures tRPC `demoData.summary`, `demoData.generate` et `demoData.reset`.
- [x] Boutons « Générer des données de démonstration » et « Réinitialiser les données » dans Paramètres → Données.
- [x] Compteurs de données démo visibles et actualisés dans l’interface.
- [x] Dashboard calculé côté serveur : membres actifs, dons, documents urgents et activité CRM récente.
- [x] Schéma WebDev aligné avec les tables existantes et defaults timestamp compatibles MySQL.
- [x] Données métier non marquées préservées lors de la génération et de la réinitialisation.

## Validation et livraison

- [x] Vérification réelle de la génération : 8 contacts, 6 membres, 4 dons, 4 dépenses, 8 transactions, 8 documents, 6 activités et 3 projets.
- [x] Vérification réelle de la réinitialisation : tous les compteurs démo reviennent à zéro.
- [x] `pnpm check` validé.
- [x] `pnpm build` validé.
- [x] 312 tests Vitest passent ; les 6 échecs restants sont documentés comme dépendances externes (TLS MySQL et clé Stripe de test).
- [x] `README.md` et `PROJECT_CONTEXT.md` documentés.
- [x] Scénario démo activé dans la base WebDev.
- [x] Checkpoint WebDev final sauvegardé.


## Audit fonctionnel et enrichissement 2026-09-20
- [x] Auditer les modules existants et leurs écarts au cahier des charges.
- [x] Alimenter les campagnes et adhésions du scénario de démonstration.
- [x] Alimenter les événements et le suivi détaillé des projets.
- [x] Étendre la réinitialisation ciblée aux nouveaux enregistrements démo.
- [x] Afficher les nouveaux compteurs dans Paramètres → Données.
- [x] Rédiger le rapport d’audit et mettre à jour la documentation.
- [x] Valider TypeScript, build et génération réelle en base.
