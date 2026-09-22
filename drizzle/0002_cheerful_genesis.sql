CREATE TABLE `cotisations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` int NOT NULL,
	`montant` varchar(20) NOT NULL,
	`dateDebut` timestamp NOT NULL,
	`dateFin` timestamp NOT NULL,
	`statut` enum('payée','en attente','en retard') NOT NULL DEFAULT 'en attente',
	`datePayment` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cotisations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `depenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` varchar(255) NOT NULL,
	`montant` varchar(20) NOT NULL,
	`categorie` varchar(100) NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`approuvePar` int,
	`notes` text,
	`pieceJointe` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `depenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`donateur` varchar(255) NOT NULL,
	`montant` varchar(20) NOT NULL,
	`description` text,
	`email` varchar(320),
	`telephone` varchar(20),
	`date` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('cotisation','don','depense','autre') NOT NULL,
	`montant` varchar(20) NOT NULL,
	`description` varchar(255) NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`memberId` int,
	`referenceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
