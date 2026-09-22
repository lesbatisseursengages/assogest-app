CREATE TABLE `global_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`associationName` varchar(255) NOT NULL DEFAULT 'Les Bâtisseurs Engagés',
	`seatCity` varchar(255) NOT NULL DEFAULT 'N''djaména-tchad',
	`folio` varchar(100) NOT NULL DEFAULT '10512',
	`email` varchar(320) NOT NULL DEFAULT 'contact.lesbatisseursengages@gmail.com',
	`website` varchar(500) NOT NULL DEFAULT 'www.lesbatisseursengage.com',
	`phone` varchar(20),
	`logo` text,
	`description` text,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `global_settings_id` PRIMARY KEY(`id`)
);
