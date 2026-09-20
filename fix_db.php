<?php
require_once __DIR__ . '/config/database.php';

use CryptoVerse\Config\Database;

try {
    $db = Database::getConnection();
    
    // Create the missing user_lesson_progress table
    $sql = "
    CREATE TABLE IF NOT EXISTS `user_lesson_progress` (
      `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      `user_id` INT UNSIGNED NOT NULL,
      `lesson_id` INT UNSIGNED NOT NULL,
      `completed` TINYINT(1) DEFAULT 0,
      `score` INT UNSIGNED DEFAULT 0,
      `completed_at` DATETIME NULL,
      UNIQUE KEY `uk_user_lesson_prog` (`user_id`, `lesson_id`),
      FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
      FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $db->exec($sql);
    echo "Successfully created user_lesson_progress table.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
