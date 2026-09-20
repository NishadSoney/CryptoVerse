<?php
require_once 'config/database.php';
try {
    $db = \CryptoVerse\Config\Database::getConnection();
    $stmt = $db->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "SUCCESS: Database 'cryptoverse' and 'users' table exist.";
    } else {
        echo "WARNING: Database 'cryptoverse' connects, but 'users' table is missing.";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
