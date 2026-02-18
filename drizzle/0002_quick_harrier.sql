ALTER TABLE `leads` MODIFY COLUMN `source` varchar(100) DEFAULT 'banner';--> statement-breakpoint
ALTER TABLE `leads` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `whatsapp` varchar(30);--> statement-breakpoint
ALTER TABLE `users` ADD `source` varchar(100) DEFAULT 'oauth';