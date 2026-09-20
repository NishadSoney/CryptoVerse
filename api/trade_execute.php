<?php
/**
 * CryptoVerse - Paper Trade Order Execution Engine
 * Location: api/trade_execute.php
 * Target: WAMP Server / Apache / PHP 8+
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

use CryptoVerse\Config\Database;

header('Content-Type: application/json');

// Enforce student session
if (!AuthService::check()) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized session. Please log in.']);
    exit;
}

$db = Database::getConnection();
$userId = (int)$_SESSION['user_id'];

// Read inputs
$symbol = isset($_POST['symbol']) ? strtoupper(trim($_POST['symbol'])) : '';
$type = isset($_POST['type']) ? strtoupper(trim($_POST['type'])) : '';
$quantity = isset($_POST['quantity']) ? (float)$_POST['quantity'] : 0.0;
$unitPrice = isset($_POST['price']) ? (float)$_POST['price'] : 0.0;

if (empty($symbol) || !in_array($type, ['BUY', 'SELL'], true) || $quantity <= 0.0 || $unitPrice <= 0.0) {
    echo json_encode(['success' => false, 'error' => 'Invalid trade parameters provided.']);
    exit;
}

if (!preg_match('/^[A-Z0-9]{2,10}$/', $symbol)) {
    echo json_encode(['success' => false, 'error' => 'Invalid ticker symbol format.']);
    exit;
}

$totalOrderValue = $quantity * $unitPrice;

try {
    $db->beginTransaction();

    // 1. Fetch user's virtual wallet
    $walletStmt = $db->prepare("SELECT id, virtual_cash FROM wallets WHERE user_id = :uid FOR UPDATE");
    $walletStmt->execute([':uid' => $userId]);
    $wallet = $walletStmt->fetch();

    if (!$wallet) {
        $db->rollBack();
        echo json_encode(['success' => false, 'error' => 'Virtual paper wallet not found.']);
        exit;
    }

    $walletId = (int)$wallet['id'];
    $currentCash = (float)$wallet['virtual_cash'];

    if ($type === 'BUY') {
        // Check sufficient virtual funds
        if ($totalOrderValue > $currentCash) {
            $db->rollBack();
            echo json_encode([
                'success' => false, 
                'error' => "Insufficient virtual cash. Needed: $" . number_format($totalOrderValue, 2) . ", Available: $" . number_format($currentCash, 2)
            ]);
            exit;
        }

        // Deduct virtual cash
        $newCash = $currentCash - $totalOrderValue;
        $updateCashStmt = $db->prepare("UPDATE wallets SET virtual_cash = :cash, updated_at = NOW() WHERE id = :wid");
        $updateCashStmt->execute([':cash' => $newCash, ':wid' => $walletId]);

        // Upsert wallet_assets holding
        $holdStmt = $db->prepare("SELECT id, quantity, avg_buy_price FROM wallet_assets WHERE wallet_id = :wid AND asset_symbol = :sym");
        $holdStmt->execute([':wid' => $walletId, ':sym' => $symbol]);
        $holding = $holdStmt->fetch();

        if ($holding) {
            $oldQty = (float)$holding['quantity'];
            $oldAvg = (float)$holding['avg_buy_price'];
            $newQty = $oldQty + $quantity;
            $newAvg = (($oldQty * $oldAvg) + $totalOrderValue) / $newQty;

            $updateHoldStmt = $db->prepare("
                UPDATE wallet_assets 
                SET quantity = :qty, avg_buy_price = :avg, updated_at = NOW() 
                WHERE id = :hid
            ");
            $updateHoldStmt->execute([':qty' => $newQty, ':avg' => $newAvg, ':hid' => $holding['id']]);
        } else {
            $insertHoldStmt = $db->prepare("
                INSERT INTO wallet_assets (wallet_id, asset_symbol, quantity, avg_buy_price, updated_at)
                VALUES (:wid, :sym, :qty, :avg, NOW())
            ");
            $insertHoldStmt->execute([
                ':wid' => $walletId,
                ':sym' => $symbol,
                ':qty' => $quantity,
                ':avg' => $unitPrice
            ]);
        }

    } else {
        // SELL order
        $holdStmt = $db->prepare("SELECT id, quantity, avg_buy_price FROM wallet_assets WHERE wallet_id = :wid AND asset_symbol = :sym FOR UPDATE");
        $holdStmt->execute([':wid' => $walletId, ':sym' => $symbol]);
        $holding = $holdStmt->fetch();

        if (!$holding || (float)$holding['quantity'] < $quantity) {
            $owned = $holding ? (float)$holding['quantity'] : 0.0;
            $db->rollBack();
            echo json_encode([
                'success' => false,
                'error' => "Insufficient {$symbol} holdings. You own " . number_format($owned, 4) . " {$symbol}, but tried to sell " . number_format($quantity, 4) . "."
            ]);
            exit;
        }

        // Add proceeds to virtual cash
        $newCash = $currentCash + $totalOrderValue;
        $updateCashStmt = $db->prepare("UPDATE wallets SET virtual_cash = :cash, updated_at = NOW() WHERE id = :wid");
        $updateCashStmt->execute([':cash' => $newCash, ':wid' => $walletId]);

        // Reduce asset quantity
        $remainingQty = (float)$holding['quantity'] - $quantity;
        if ($remainingQty <= 0.000001) {
            $delStmt = $db->prepare("DELETE FROM wallet_assets WHERE id = :hid");
            $delStmt->execute([':hid' => $holding['id']]);
        } else {
            $updateHoldStmt = $db->prepare("UPDATE wallet_assets SET quantity = :qty, updated_at = NOW() WHERE id = :hid");
            $updateHoldStmt->execute([':qty' => $remainingQty, ':hid' => $holding['id']]);
        }
    }

    // 2. Insert into trades ledger
    $tradeStmt = $db->prepare("
        INSERT INTO trades (user_id, asset_symbol, trade_type, quantity, price, total_value, created_at)
        VALUES (:uid, :sym, :type, :qty, :price, :total, NOW())
    ");
    $tradeStmt->execute([
        ':uid' => $userId,
        ':sym' => $symbol,
        ':type' => $type,
        ':qty' => $quantity,
        ':price' => $unitPrice,
        ':total' => $totalOrderValue
    ]);

    // 3. Award XP for practicing risk management (+30 XP)
    $xpStmt = $db->prepare("
        UPDATE user_profiles 
        SET xp_total = xp_total + 30,
            current_level = FLOOR((xp_total + 30) / 500) + 1,
            last_active_date = CURRENT_DATE
        WHERE user_id = :uid
    ");
    $xpStmt->execute([':uid' => $userId]);

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => "Successfully executed simulated {$type} order of {$quantity} {$symbol} for $" . number_format($totalOrderValue, 2) . "!",
        'new_cash' => $newCash,
        'xp_awarded' => 30
    ]);

} catch (\Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log('[CryptoVerse Trade Execution Error] ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'An error occurred while executing the virtual trade.']);
}
