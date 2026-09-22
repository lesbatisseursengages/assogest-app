CREATE TABLE `adhesion_pipeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`stage` enum('inquiry','application','review','approved','rejected','member') NOT NULL DEFAULT 'inquiry',
	`applicationDate` date,
	`approvalDate` date,
	`rejectionReason` text,
	`notes` text,
	`assignedTo` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adhesion_pipeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`type` enum('call','email','meeting','task','note','event') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`dueDate` timestamp,
	`completedDate` timestamp,
	`assignedTo` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`company` varchar(255),
	`position` varchar(100),
	`address` text,
	`city` varchar(100),
	`postalCode` varchar(20),
	`country` varchar(100),
	`birthDate` date,
	`joinDate` date,
	`segment` varchar(50) DEFAULT 'general',
	`status` enum('prospect','active','inactive','archived') NOT NULL DEFAULT 'prospect',
	`notes` text,
	`tags` varchar(500),
	`lastInteraction` timestamp,
	`engagementScore` int DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_email_integration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`emailHistoryId` int,
	`subject` varchar(255) NOT NULL,
	`content` text,
	`direction` enum('sent','received') NOT NULL,
	`status` enum('sent','failed','bounced','opened','clicked') NOT NULL DEFAULT 'sent',
	`sentBy` int,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_email_integration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('engagement','pipeline','activity','segment','custom') NOT NULL,
	`description` text,
	`data` json,
	`filters` json,
	`generatedBy` int NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_reports_id` PRIMARY KEY(`id`)
);
