<?php
/**
 * CryptoVerse - Student Personal Lesson Notes API
 * Location: api/notes.php
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
$lessonId = isset($_POST['lesson_id']) ? (int)$_POST['lesson_id'] : 0;
$noteText = isset($_POST['note_text']) ? trim($_POST['note_text']) : '';

if ($lessonId <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid lesson ID']);
    exit;
}

$stmt = $db->prepare("
    INSERT INTO user_notes (user_id, lesson_id, note_text, updated_at)
    VALUES (:uid, :lid, :txt, NOW())
");
$stmt->execute([
    ':uid' => $userId,
    ':lid' => $lessonId,
    ':txt' => $noteText
]);

// Return the timestamp for UI rendering
echo json_encode([
    'success' => true, 
    'timestamp' => date('M j, Y, g:i a')
]);
