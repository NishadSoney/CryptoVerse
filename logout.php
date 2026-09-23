<?php
/**
 * CryptoVerse - Logout Script
 * Location: logout.php
 */

require_once __DIR__ . '/config/config.php';

// Destroy the session
session_unset();
session_destroy();

// Redirect to the landing page
header("Location: /index.php");
exit;
