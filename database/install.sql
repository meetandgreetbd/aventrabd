SET NAMES utf8mb4;

-- 0000_new_rick_jones.sql
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`job_id` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(190) NOT NULL,
	`phone` varchar(40) NOT NULL DEFAULT '',
	`cover_note` text NOT NULL,
	`cv_file` varchar(80) NOT NULL,
	`cv_name` varchar(200) NOT NULL,
	`status` enum('new','reviewed','shortlisted','rejected') NOT NULL DEFAULT 'new',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);

CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(160) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`department` varchar(120) NOT NULL DEFAULT '',
	`location` varchar(120) NOT NULL DEFAULT '',
	`type` enum('full-time','part-time','contract','internship') NOT NULL DEFAULT 'full-time',
	`summary` varchar(300) NOT NULL DEFAULT '',
	`description` text NOT NULL,
	`requirements` text NOT NULL,
	`deadline` date,
	`status` enum('draft','open','closed') NOT NULL DEFAULT 'draft',
	`seo_title` varchar(200) NOT NULL DEFAULT '',
	`seo_description` varchar(320) NOT NULL DEFAULT '',
	`noindex` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `jobs_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`title` varchar(160) NOT NULL,
	`photo` varchar(80) NOT NULL DEFAULT '',
	`bio` text NOT NULL,
	`member_group` enum('leadership','team') NOT NULL DEFAULT 'leadership',
	`sort_order` int NOT NULL DEFAULT 0,
	`visible` boolean NOT NULL DEFAULT true,
	CONSTRAINT `members_id` PRIMARY KEY(`id`)
);

CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(190) NOT NULL,
	`message` text NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);

CREATE TABLE `pages` (
	`slug` varchar(40) NOT NULL,
	`content` json NOT NULL,
	`seo_title` varchar(200) NOT NULL DEFAULT '',
	`seo_description` varchar(320) NOT NULL DEFAULT '',
	`noindex` boolean NOT NULL DEFAULT false,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_slug` PRIMARY KEY(`slug`)
);

CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`user_id` int NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);

CREATE TABLE `settings` (
	`setting_key` varchar(40) NOT NULL,
	`value` json NOT NULL,
	CONSTRAINT `settings_setting_key` PRIMARY KEY(`setting_key`)
);

CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quote` text NOT NULL,
	`author` varchar(120) NOT NULL,
	`role` varchar(160) NOT NULL DEFAULT '',
	`sort_order` int NOT NULL DEFAULT 0,
	`visible` boolean NOT NULL DEFAULT true,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);

CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(190) NOT NULL,
	`password_hash` varchar(100) NOT NULL,
	`role` enum('admin','editor') NOT NULL DEFAULT 'editor',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);

ALTER TABLE `applications` ADD CONSTRAINT `applications_job_id_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
