<?php
/**
 * CryptoVerse - Quiz Assessment & XP Processing API
 * Location: api/quiz_submit.php
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

if ($lessonId <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid lesson ID']);
    exit;
}

// Fetch all quiz questions for this lesson from normalized tables
$stmt = $db->prepare("
    SELECT q.id, o.id AS correct_option_id
    FROM quizzes z
    JOIN quiz_questions q ON z.id = q.quiz_id
    JOIN quiz_options o ON q.id = o.question_id
    WHERE z.lesson_id = :lid AND o.is_correct = 1
");
$stmt->execute([':lid' => $lessonId]);
$questions = $stmt->fetchAll();

if (empty($questions)) {
    echo json_encode(['success' => false, 'error' => 'No quiz found for this lesson']);
    exit;
}

$totalQuestions = count($questions);
$correctCount = 0;

foreach ($questions as $q) {
    $field = 'question_' . $q['id'];
    if (isset($_POST[$field])) {
        $userAnswer = (int)$_POST[$field];
        if ($userAnswer === (int)$q['correct_option_id']) {
            $correctCount++;
        }
    }
}

$scorePct = (int)round(($correctCount / $totalQuestions) * 100);
$passed = $scorePct >= 70;

// Fetch lesson XP reward
$lessonStmt = $db->prepare("SELECT xp_reward FROM lessons WHERE id = :lid");
$lessonStmt->execute([':lid' => $lessonId]);
$xpReward = (int)($lessonStmt->fetchColumn() ?: 50);

$xpAwarded = 0;

if ($passed) {
    // Check if previously completed
    $progStmt = $db->prepare("SELECT completed FROM user_lesson_progress WHERE user_id = :uid AND lesson_id = :lid");
    $progStmt->execute([':uid' => $userId, ':lid' => $lessonId]);
    $alreadyCompleted = (bool)$progStmt->fetchColumn();

    // Upsert lesson progress
    $upsertStmt = $db->prepare("
        INSERT INTO user_lesson_progress (user_id, lesson_id, completed, score, completed_at)
        VALUES (:uid, :lid, 1, :score, NOW())
        ON DUPLICATE KEY UPDATE
            completed = 1,
            score = GREATEST(score, :score2),
            completed_at = NOW()
    ");
    $upsertStmt->execute([
        ':uid' => $userId,
        ':lid' => $lessonId,
        ':score' => $scorePct,
        ':score2' => $scorePct
    ]);

    // Award XP if this is the first completion
    if (!$alreadyCompleted) {
        $xpAwarded = $xpReward;
        $xpStmt = $db->prepare("
            UPDATE user_profiles 
            SET xp_total = xp_total + :xp,
                current_level = FLOOR((xp_total + :xp2) / 500) + 1,
                last_active_date = CURRENT_DATE
            WHERE user_id = :uid
        ");
        $xpStmt->execute([
            ':xp' => $xpReward,
            ':xp2' => $xpReward,
            ':uid' => $userId
        ]);
    }
}

echo json_encode([
    'success' => $passed,
    'score' => $scorePct,
    'correct_count' => $correctCount,
    'total_count' => $totalQuestions,
    'xp_awarded' => $xpAwarded
]);
