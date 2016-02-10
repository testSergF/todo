CREATE database `todo` CHARACTER SET `utf8`;
USE `todo`;

CREATE TABLE IF NOT EXISTS `content` (
  `id` bigint(15) NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT '',
  `text` mediumtext NOT NULL DEFAULT '',
  `created` bigint(15),
  `updated` bigint(15),
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `user` (
  `userdata_storage` varchar(20) NOT NULL DEFAULT 'server'
);
