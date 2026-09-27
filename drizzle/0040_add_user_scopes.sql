CREATE TABLE IF NOT EXISTS `user_scopes` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `scopeType` enum('national','antenne','groupe','project') NOT NULL,
  `scopeId` int,
  `accessLevel` enum('viewer','editor','manager') NOT NULL DEFAULT 'viewer',
  `assignedBy` int,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `user_scopes_user_idx` (`userId`),
  INDEX `user_scopes_scope_idx` (`scopeType`, `scopeId`)
);
