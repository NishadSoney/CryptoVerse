<?php
/**
 * CryptoVerse - Database Connection Manager (PDO Singleton)
 * Location: config/database.php
 * Target: PHP 8.0+, WAMP / Apache / MySQL
 */

declare(strict_types=1);

namespace CryptoVerse\Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;

    /**
     * Retrieve the active PDO connection singleton.
     * Throws an exception if connection fails.
     */
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $host = defined('DB_HOST') ? DB_HOST : '127.0.0.1';
            $port = defined('DB_PORT') ? DB_PORT : 3306;
            $dbname = defined('DB_NAME') ? DB_NAME : 'cryptoverse';
            $user = defined('DB_USER') ? DB_USER : 'root';
            $pass = defined('DB_PASS') ? DB_PASS : '';
            $charset = defined('DB_CHARSET') ? DB_CHARSET : 'utf8mb4';

            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$charset} COLLATE {$charset}_unicode_ci"
            ];

            try {
                self::$instance = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                // Log internal error safely without exposing raw database credentials to client
                error_log('[CryptoVerse DB Error] ' . $e->getMessage());
                throw new \RuntimeException('Database connection could not be established. Please check your WAMP MySQL service.');
            }
        }

        return self::$instance;
    }

    /**
     * Prevent cloning or unserializing the singleton
     */
    private function __construct() {}
    private function __clone() {}
    public function __wakeup() {
        throw new \Exception("Cannot unserialize singleton");
    }
}
