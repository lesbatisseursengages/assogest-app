CREATE TABLE `email_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int,
	`subject` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`recipientCount` int NOT NULL,
	`sentBy` int NOT NULL,
	`status` enum('pending','sending','sent','failed') NOT NULL DEFAULT 'pending',
	`successCount` int DEFAULT 0,
	`failureCount` int DEFAULT 0,
	`errorMessage` text,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`emailHistoryId` int NOT NULL,
	`recipientId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`status` enum('pending','sent','failed','bounced') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_recipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`description` text,
	`category` varchar(50) DEFAULT 'general',
	`variables` text,
	`isSystem` boolean DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);
