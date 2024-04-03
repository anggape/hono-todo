CREATE TABLE `tokens` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`token` text NOT NULL,
	`expiresAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
