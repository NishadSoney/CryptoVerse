<?php
/**
 * CryptoVerse - Export History
 * Location: export_history.php
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

use CryptoVerse\Config\Database;

AuthService::requireAuth();

$db = Database::getConnection();
$userId = (int)$_SESSION['user_id'];

// Fetch wallet balance
$walletStmt = $db->prepare("SELECT virtual_cash FROM wallets WHERE user_id = :uid");
$walletStmt->execute([':uid' => $userId]);
$wallet = $walletStmt->fetch();
$balance = $wallet ? (float)$wallet['virtual_cash'] : 0.0;

// Fetch all trades
$tradesStmt = $db->prepare("SELECT * FROM trades WHERE user_id = :uid ORDER BY created_at DESC");
$tradesStmt->execute([':uid' => $userId]);
$trades = $tradesStmt->fetchAll(PDO::FETCH_ASSOC);

$filename = "cryptoverse_history_" . date('Y-m-d_H-i') . ".txt";

header('Content-Type: text/plain; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');

echo "=========================================================\n";
echo " CRYPTOVERSE - PAPER TRADING HISTORY\n";
echo "=========================================================\n";
echo "Account: " . $_SESSION['name'] . " (ID: " . $userId . ")\n";
echo "Generated: " . date('Y-m-d H:i:s T') . "\n";
echo "Current Available Balance: $" . number_format($balance, 2) . "\n";
echo "=========================================================\n\n";

if (empty($trades)) {
    echo "No trading activity found.\n";
} else {
    echo sprintf("%-20s | %-10s | %-10s | %-15s | %-15s | %-15s\n", "Date", "Type", "Asset", "Quantity", "Price", "Net Cash Impact");
    echo str_repeat("-", 98) . "\n";
    
    foreach ($trades as $trade) {
        $date = date('Y-m-d H:i:s', strtotime($trade['created_at']));
        $type = $trade['trade_type'];
        $asset = $trade['asset_symbol'];
        $qty = rtrim(rtrim(number_format($trade['quantity'], 8), '0'), '.');
        $price = "$" . number_format($trade['price'], 2);
        
        // Calculate impact on cash
        $impact = ($type === 'BUY' ? "-" : "+") . "$" . number_format($trade['total_value'], 2);
        
        echo sprintf("%-20s | %-10s | %-10s | %-15s | %-15s | %-15s\n", $date, $type, $asset, $qty, $price, $impact);
    }
}

echo "\n=========================================================\n";
echo " End of Report\n";
echo "=========================================================\n";
exit;
