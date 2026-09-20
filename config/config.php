<?php
/**
 * CryptoVerse - Application Configuration
 * Location: config/config.php
 */

declare(strict_types=1);

// Application Information
define('APP_NAME', 'CryptoVerse');
define('APP_VERSION', '1.0.0');
define('APP_ENV', getenv('APP_ENV') ?: 'development');
define('APP_URL', getenv('APP_URL') ?: 'http://localhost/cryptoverse');

// Database Credentials (Defaults configured for local WAMP Server)
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', (int)(getenv('DB_PORT') ?: 3306));
define('DB_NAME', getenv('DB_NAME') ?: 'cryptoverse');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');
define('DB_CHARSET', 'utf8mb4');

// Virtual Trading Parameters
define('INITIAL_VIRTUAL_BALANCE', 100000.00); // $100,000 Starting Virtual Capital
define('SIMULATION_FLAG', true); // Always true — strictly educational

// Session Security Configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_samesite', 'Lax');
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        ini_set('session.cookie_secure', '1');
    }
    session_name('cryptoverse_sess');
    session_start();
}
