<?php
/**
 * CryptoVerse - One-Click Database Setup & Installer
 * Location: install.php
 * Target: WAMP Server / Apache / MySQL 8+
 */

declare(strict_types=1);

require_once __DIR__ . '/config/config.php';

$message = null;
$error = null;
$installed = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'install') {
    $host = $_POST['db_host'] ?? '127.0.0.1';
    $port = (int)($_POST['db_port'] ?? 3306);
    $user = $_POST['db_user'] ?? 'root';
    $pass = $_POST['db_pass'] ?? '';
    $dbName = $_POST['db_name'] ?? 'cryptoverse';

    try {
        // Connect to MySQL server (without selecting DB first in case it doesn't exist)
        $pdo = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        // Create Database if not exists
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        $pdo->exec("USE `{$dbName}`;");

        // Read and execute database/schema.sql
        $schemaPath = __DIR__ . '/database/schema.sql';
        if (!file_exists($schemaPath)) {
            throw new Exception("Schema file not found at: {$schemaPath}");
        }

        $sql = file_get_contents($schemaPath);
        
        // Execute multi-query batch
        $pdo->exec($sql);

        $installed = true;
        $message = "Database [{$dbName}] and all schema tables, seed courses, lessons, and demo user accounts were successfully created and populated!";

    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CryptoVerse — 1-Click WAMP / MySQL Installer</title>
  <link rel="stylesheet" href="assets/css/landing.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="background-color: #0A0D14; color: #F8FAFC; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">

  <div style="width: 100%; max-width: 34rem; background: #121722; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.25rem; padding: 2.25rem; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
    
    <div style="text-align: center; margin-bottom: 2rem;">
      <span style="font-family: 'Space Mono', monospace; font-size: 0.6875rem; color: #60A5FA; background: rgba(59, 130, 246, 0.1); padding: 4px 10px; border-radius: 9999px; font-weight: 700; text-transform: uppercase;">
        WAMP / LAMP Deployment
      </span>
      <h1 style="font-size: 1.75rem; font-weight: 800; margin: 0.75rem 0 0.5rem 0;">CryptoVerse Installer</h1>
      <p style="font-size: 0.8125rem; color: #94A3B8; margin: 0;">
        Automatically initialize MySQL database tables, curriculum seeds, and paper trading ledgers.
      </p>
    </div>

    <?php if ($message): ?>
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.5rem;">
        <h3 style="color: #34D399; font-size: 0.9375rem; font-weight: 700; margin: 0 0 0.5rem 0;">Installation Successful!</h3>
        <p style="color: #A7F3D0; font-size: 0.8125rem; margin: 0 0 1rem 0;"><?= htmlspecialchars($message) ?></p>
        <div style="display: flex; gap: 0.75rem;">
          <a href="login.php" style="display: inline-block; background: #10B981; color: #FFF; padding: 0.625rem 1.25rem; border-radius: 0.5rem; text-decoration: none; font-weight: 700; font-size: 0.8125rem;">
            Go to Login
          </a>
          <a href="dashboard.php" style="display: inline-block; background: rgba(255, 255, 255, 0.1); color: #FFF; padding: 0.625rem 1.25rem; border-radius: 0.5rem; text-decoration: none; font-weight: 700; font-size: 0.8125rem;">
            Open Dashboard
          </a>
        </div>
      </div>
    <?php endif; ?>

    <?php if ($error): ?>
      <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 0.75rem; padding: 1rem 1.25rem; margin-bottom: 1.5rem;">
        <strong style="color: #FDA4AF; font-size: 0.875rem;">Installation Error:</strong>
        <p style="color: #FECDD3; font-size: 0.8125rem; margin: 0.375rem 0 0 0; font-family: 'Space Mono', monospace;">
          <?= htmlspecialchars($error) ?>
        </p>
      </div>
    <?php endif; ?>

    <?php if (!$installed): ?>
      <form method="POST">
        <input type="hidden" name="action" value="install">

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #94A3B8; margin-bottom: 0.375rem;">MySQL Host</label>
            <input type="text" name="db_host" value="127.0.0.1" required style="width: 100%; box-sizing: border-box; background: #0A0D14; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 0.5rem; padding: 0.625rem; color: #FFF; font-family: 'Space Mono', monospace; font-size: 0.875rem;">
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #94A3B8; margin-bottom: 0.375rem;">Port</label>
            <input type="number" name="db_port" value="3306" required style="width: 100%; box-sizing: border-box; background: #0A0D14; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 0.5rem; padding: 0.625rem; color: #FFF; font-family: 'Space Mono', monospace; font-size: 0.875rem;">
          </div>
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #94A3B8; margin-bottom: 0.375rem;">Database Name</label>
          <input type="text" name="db_name" value="cryptoverse" required style="width: 100%; box-sizing: border-box; background: #0A0D14; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 0.5rem; padding: 0.625rem; color: #FFF; font-family: 'Space Mono', monospace; font-size: 0.875rem;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #94A3B8; margin-bottom: 0.375rem;">MySQL Username</label>
            <input type="text" name="db_user" value="root" required style="width: 100%; box-sizing: border-box; background: #0A0D14; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 0.5rem; padding: 0.625rem; color: #FFF; font-family: 'Space Mono', monospace; font-size: 0.875rem;">
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #94A3B8; margin-bottom: 0.375rem;">MySQL Password</label>
            <input type="password" name="db_pass" placeholder="Empty on default WAMP" style="width: 100%; box-sizing: border-box; background: #0A0D14; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 0.5rem; padding: 0.625rem; color: #FFF; font-family: 'Space Mono', monospace; font-size: 0.875rem;">
          </div>
        </div>

        <button type="submit" style="width: 100%; padding: 0.875rem; border-radius: 0.5rem; border: none; font-weight: 800; font-size: 0.875rem; cursor: pointer; background: #2563EB; color: #FFF; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
          Run Database Setup & Seed Data
        </button>
      </form>
    <?php endif; ?>

    <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 0.75rem; color: #64748B; text-align: center;">
      Demo student login after installation: <br>
      <code style="color: #93C5FD; font-family: 'Space Mono', monospace;">student@cryptoverse.edu</code> / <code style="color: #93C5FD; font-family: 'Space Mono', monospace;">password123</code>
    </div>

  </div>

</body>
</html>
