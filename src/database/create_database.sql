    CREATE TABLE `users` (
      `id` INT PRIMARY KEY AUTO_INCREMENT,
      `username` VARCHAR(50) UNIQUE NOT NULL,
      `email` VARCHAR(100) UNIQUE NOT NULL,
      `passwordHash` VARCHAR(50) NOT NULL,
      `created_at` timestamp DEFAULT 'current_timestamp'
    );

    CREATE TABLE `characters` (
      `id` INT PRIMARY KEY AUTO_INCREMENT,
      `user_id` INT NOT NULL,
      `name` VARCHAR(50) NOT NULL,
      `class` VARCHAR(50) NOT NULL,
      `level` INT DEFAULT 1,
      `created_at` TIMESTAMP DEFAULT (current_timestamp)
    );

    CREATE TABLE `matches` (
      `id` INT PRIMARY KEY AUTO_INCREMENT,
      `match_id` VARCHAR(50) UNIQUE NOT NULL,
      `start_time` DATETIME NOT NULL,
      `end_time` DATETIME NOT NULL,
      `map` VARCHAR(100) NOT NULL
    );

    CREATE TABLE `user_matches` (
      `id` INT PRIMARY KEY AUTO_INCREMENT,
      `character_id` INT NOT NULL,
      `match_id` INT NOT NULL,
      `kills` INT DEFAULT 0,
      `escaped` BOOLEAN DEFAULT false
    );

    ALTER TABLE `characters` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

    ALTER TABLE `user_matches` ADD FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`);

    ALTER TABLE `user_matches` ADD FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`);
