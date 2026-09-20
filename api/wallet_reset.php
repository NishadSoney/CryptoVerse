<?php
/**
 * CryptoVerse - Reset Virtual Paper Wallet
 * Location: api/wallet_reset.php
 * Target: WAMP Server / Apache / PHP 8+
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

use CryptoVerse\Config\Database;

header('Content-Type: application/json');

if (!AuthService::check()) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$db = Database::getConnection();
$userId = (int)$_SESSION['user_id'];

try {
    $db->beginTransaction();

    // Reset cash to $100,000.00
    $stmt = $db->prepare("UPDATE wallets SET virtual_cash = 100000.00, updated_at = NOW() WHERE user_id = :uid");
    $stmt->execute([':uid' => $userId]);

    // Fetch wallet ID
    $wStmt = $db->prepare("SELECT id FROM wallets WHERE user_id = :uid");
    $wStmt->execute([':uid' => $userId]);
    $walletId = $wStmt->fetchColumn();

    if ($walletId) {
        // Clear all virtual holdings
        $delStmt = $db->prepare("DELETE FROM wallet_assets WHERE wallet_id = :wid");
        $delStmt->execute([':wid' => $walletId]);
    }

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Virtual paper trading balance reset to $100,000.00 USD.'
    ]);

} catch (\Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo json_encode(['success' => false, 'error' => 'Failed to reset virtual wallet.']);
}
