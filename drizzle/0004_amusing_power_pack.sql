CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(255),
	`eventType` enum('reunion','formation','activite','evenement','autre') NOT NULL DEFAULT 'autre',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`color` varchar(7) DEFAULT '#1a4d2e',
	`organizer` varchar(255),
	`attendees` int DEFAULT 0,
	`image` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
