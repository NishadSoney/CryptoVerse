<?php
require_once __DIR__ . '/config/database.php';

use CryptoVerse\Config\Database;

try {
    $db = Database::getConnection();
    
    // Create the missing user_notes table
    $sql = "
    CREATE TABLE IF NOT EXISTS `user_notes` (
      `user_id` INT UNSIGNED NOT NULL,
      `lesson_id` INT UNSIGNED NOT NULL,
      `note_text` TEXT NOT NULL,
      `updated_at` DATETIME NOT NULL,
      PRIMARY KEY (`user_id`, `lesson_id`),
      FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
      FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $db->exec($sql);
    echo "Successfully created user_notes table.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
