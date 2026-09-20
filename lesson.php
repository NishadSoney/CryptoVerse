<?php
/**
 * CryptoVerse - Interactive Lesson Viewer & Dual-Mode Engine
 * Location: lesson.php
 * Target: WAMP Server / Apache / PHP 8+
 */

declare(strict_types=1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

use CryptoVerse\Config\Database;

if (!AuthService::check()) {
    header('Location: /login.php');
    exit;
}

$db = Database::getConnection();
$userId = (int)$_SESSION['user_id'];
$lessonId = isset($_GET['id']) ? (int)$_GET['id'] : 1;

// Fetch lesson data
$stmt = $db->prepare("SELECT * FROM lessons WHERE id = :id LIMIT 1");
$stmt->execute([':id' => $lessonId]);
$lesson = $stmt->fetch();

if (!$lesson) {
    header('Location: /learn.php');
    exit;
}

// Fetch quiz questions for this lesson from normalized tables
$quizStmt = $db->prepare("
    SELECT q.id, q.question_text AS scenario
    FROM quizzes z
    JOIN quiz_questions q ON z.id = q.quiz_id
    WHERE z.lesson_id = :lid
    ORDER BY q.sort_order ASC
");
$quizStmt->execute([':lid' => $lessonId]);
$quizzes = $quizStmt->fetchAll();

$optionsByQid = [];
if (!empty($quizzes)) {
    $qIds = array_column($quizzes, 'id');
    $inClause = implode(',', array_fill(0, count($qIds), '?'));
    $optStmt = $db->prepare("SELECT id, question_id, option_text FROM quiz_options WHERE question_id IN ($inClause) ORDER BY id ASC");
    $optStmt->execute($qIds);
    $allOptions = $optStmt->fetchAll();
    foreach ($allOptions as $opt) {
        $optionsByQid[$opt['question_id']][] = $opt;
    }
}

// Fetch student personal notes for this lesson
$noteStmt = $db->prepare("SELECT note_text, updated_at FROM user_notes WHERE user_id = :uid AND lesson_id = :lid ORDER BY updated_at DESC");
$noteStmt->execute([':uid' => $userId, ':lid' => $lessonId]);
$savedNotes = $noteStmt->fetchAll();
$userNote = '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($lesson['title']) ?> — CryptoVerse</title>
  <link rel="stylesheet" href="assets/css/landing.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
<style>
  @media (max-width: 1024px) {
    main {
      grid-template-columns: 1fr !important;
      gap: 2rem !important;
    }
    .lesson-right-col {
      position: static !important;
    }
  }
  .quiz-dot:hover {
    transform: scale(1.1);
  }
</style>
</head>
<body style="background-color: #080914; color: #F8FAFC; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif;">

  <!-- TOP APP BAR -->
  <header style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: #101027; padding: 0.75rem 1.5rem; position: sticky; top: 0; z-index: 40;">
    <div style="max-width: 96rem; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
      <a href="learn.php" style="display: flex; align-items: center; gap: 0.5rem; text-decoration: none; color: #94A3B8; font-size: 0.8125rem; font-weight: 600;">
        <i data-lucide="arrow-left" style="width: 1rem; height: 1rem;"></i>
        <span>Back to Curriculum</span>
      </a>

      <!-- DUAL EXPLANATION MODE SWITCHER -->
      <div style="display: flex; align-items: center; background: rgba(0, 0, 0, 0.5); padding: 3px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
        <button id="btn-mode-beginner" onclick="setMode('beginner')" style="padding: 4px 12px; font-size: 0.75rem; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; background: #6150d5; color: #FFF; transition: all 0.2s;">
          Beginner (Analogies)
        </button>
        <button id="btn-mode-technical" onclick="setMode('technical')" style="padding: 4px 12px; font-size: 0.75rem; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; background: transparent; color: #94A3B8; transition: all 0.2s;">
          Technical (Protocol)
        </button>
      </div>
    </div>
  </header>

  <!-- MAIN LESSON WORKSPACE -->
  <main style="max-width: 96rem; margin: 2rem auto; padding: 0 1.5rem 6rem 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
  <div class="lesson-left-col">
    
    <!-- LESSON TITLE & BADGES -->
    <div style="margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <span style="font-size: 0.6875rem; font-family: 'Space Mono', monospace; color: #b6adff; font-weight: 700;">
          LESSON <?= str_pad((string)$lesson['sort_order'], 2, '0', STR_PAD_LEFT) ?>
        </span>
        <span style="color: #475569;">•</span>
        <span style="font-size: 0.6875rem; color: #94A3B8;"><?= (int)$lesson['estimated_minutes'] ?> min read</span>
        <span style="color: #475569;">•</span>
        <span style="font-size: 0.6875rem; color: #5de3ca; font-weight: 700; font-family: 'Space Mono', monospace;">+<?= (int)$lesson['xp_reward'] ?> XP</span>
      </div>
      <h1 style="font-size: 2rem; font-weight: 800; line-height: 1.25; margin: 0 0 0.75rem 0;"><?= htmlspecialchars($lesson['title']) ?></h1>
      <p style="font-size: 1rem; color: #94A3B8; margin: 0;"><?= htmlspecialchars($lesson['summary']) ?></p>
    </div>

    <!-- DUAL EXPLANATION SECTIONS -->
    <!-- 1. BEGINNER EXPLANATION -->
    <div id="section-beginner" style="display: block; background: #14142b; border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 1rem; padding: 2rem; margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: #b6adff; font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
        <i data-lucide="sparkles" style="width: 1.125rem; height: 1.125rem;"></i>
        <span>Beginner Mode: Real-World Analogy</span>
      </div>
      <div style="font-size: 0.9375rem; line-height: 1.7; color: #CBD5E1;">
        <p style="margin-top: 0; font-style: italic; color: #93C5FD; border-left: 3px solid #8d7aff; padding-left: 1rem;">
          <?= htmlspecialchars($lesson['analogy']) ?>
        </p>
        <p><?= nl2br(htmlspecialchars($lesson['simple_explanation'])) ?></p>
      </div>
    </div>

    <!-- 2. TECHNICAL EXPLANATION -->
    <div id="section-technical" style="display: none; background: #14142b; border: 1px solid rgba(129, 140, 248, 0.2); border-radius: 1rem; padding: 2rem; margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: #818CF8; font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
        <i data-lucide="cpu" style="width: 1.125rem; height: 1.125rem;"></i>
        <span>Technical Mode: Network & Cryptographic Specification</span>
      </div>
      <div style="font-size: 0.9375rem; line-height: 1.7; color: #CBD5E1;">
        <p><?= nl2br(htmlspecialchars($lesson['technical_explanation'])) ?></p>
      </div>
    </div>

    <!-- INTERACTIVE SIMULATOR: LIVE SHA-256 HASH CALCULATOR -->
    <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; padding: 1.5rem; margin-bottom: 2.5rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="terminal" style="width: 1.125rem; height: 1.125rem; color: #38BDF8;"></i>
          <span style="font-size: 0.875rem; font-weight: 700; color: #FFF;">Interactive Protocol Lab: Cryptographic Hash Simulator</span>
        </div>
        <span style="font-size: 0.6875rem; font-family: 'Space Mono', monospace; color: #64748B;">SHA-256 ALGORITHM</span>
      </div>
      <p style="font-size: 0.75rem; color: #94A3B8; margin: 0 0 0.75rem 0;">
        Type any message in the input box. Notice how changing a single letter alters the entire 64-character hexadecimal output completely (the cryptographic <em>avalanche effect</em>).
      </p>
      <input type="text" id="hash-input" value="CryptoVerse Transaction 001" oninput="calculateLiveHash(this.value)" style="width: 100%; box-sizing: border-box; background: #080914; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 0.5rem; padding: 0.625rem 0.875rem; color: #FFF; font-size: 0.8125rem; font-family: 'Space Mono', monospace; margin-bottom: 0.75rem;">
      <div>
        <span style="font-size: 0.6875rem; color: #64748B; text-transform: uppercase; font-weight: 700;">Calculated Hash:</span>
        <div id="hash-output" style="font-family: 'Space Mono', monospace; font-size: 0.75rem; color: #38BDF8; word-break: break-all; background: #080914; padding: 0.625rem; border-radius: 0.375rem; border: 1px solid rgba(56, 189, 248, 0.2); margin-top: 0.25rem;">
          e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
        </div>
      </div>
    </div>



  </div>
  
  <div class="lesson-right-col" style="position: sticky; top: 6rem; align-self: start;">
    <!-- SCENARIO-BASED QUIZ ENGINE -->
    <?php if (!empty($quizzes)): ?>
      <div style="background: #14142b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; padding: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <div>
            <span style="font-size: 0.6875rem; font-family: 'Space Mono', monospace; color: #5de3ca; font-weight: 700;">CHECKPOINT QUIZ</span>
            <h2 style="font-size: 1.25rem; font-weight: 800; margin: 0.25rem 0 0 0;">Scenario-Based Knowledge Check</h2>
          </div>
          <span style="font-size: 0.75rem; color: #94A3B8;">Pass score: 70%+</span>
        </div>

        <div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 2rem;" id="quiz-indicators">
          <?php foreach ($quizzes as $qIdx => $q): ?>
            <div class="quiz-dot" id="quiz-dot-<?= $qIdx ?>" style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: <?= $qIdx === 0 ? '#5de3ca' : 'rgba(255,255,255,0.1)' ?>; color: <?= $qIdx === 0 ? '#111' : '#94A3B8' ?>; font-size: 0.75rem; font-weight: 700; transition: all 0.3s; cursor: pointer; box-shadow: <?= $qIdx === 0 ? '0 0 10px rgba(93,227,202,0.5)' : 'none' ?>;">
              <?= $qIdx + 1 ?>
            </div>
          <?php endforeach; ?>
        </div>

        <form id="quiz-form" onsubmit="submitQuiz(event, <?= (int)$lesson['id'] ?>)">
          <div style="position: relative; min-height: 250px;">
            <?php foreach ($quizzes as $qIdx => $q): 
              $opts = $optionsByQid[$q['id']] ?? [];
            ?>
              <div id="quiz-question-<?= $qIdx ?>" style="display: <?= $qIdx === 0 ? 'block' : 'none' ?>; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 0.75rem; padding: 1.5rem;">
                <div style="font-size: 0.9375rem; font-weight: 700; color: #FFF; margin-bottom: 1.25rem; line-height: 1.5;">
                  <?= htmlspecialchars($q['scenario']) ?>
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  <?php foreach ($opts as $opt): ?>
                    <label style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.875rem; border-radius: 0.5rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer; font-size: 0.875rem; color: #CBD5E1; transition: background 0.2s;">
                      <input type="radio" name="question_<?= (int)$q['id'] ?>" value="<?= (int)$opt['id'] ?>" required style="margin-top: 3px;">
                      <span><?= htmlspecialchars($opt['option_text']) ?></span>
                    </label>
                  <?php endforeach; ?>
                </div>
              </div>
            <?php endforeach; ?>
          </div>

          <div style="margin-top: 2rem; display: flex; align-items: center; justify-content: space-between;">
            <button type="button" id="quiz-btn-prev" onclick="prevQuestion()" style="padding: 0.75rem 1.5rem; font-size: 0.8125rem; font-weight: 700; color: #FFF; background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; cursor: pointer; visibility: hidden; transition: all 0.2s;">
              <i data-lucide="arrow-left" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> Previous
            </button>
            
            <div id="quiz-result" style="font-size: 0.875rem; font-weight: 700;"></div>
            
            <?php if (count($quizzes) > 1): ?>
            <button type="button" id="quiz-btn-next" onclick="nextQuestion()" style="padding: 0.75rem 1.5rem; font-size: 0.8125rem; font-weight: 700; color: #FFF; background: #8d7aff; border: none; border-radius: 0.5rem; cursor: pointer; box-shadow: 0 4px 12px rgba(141, 122, 255, 0.3); transition: all 0.2s;">
              Next <i data-lucide="arrow-right" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-left: 4px;"></i>
            </button>
            <?php else: ?>
            <button type="submit" id="quiz-btn-next" style="padding: 0.75rem 2rem; font-size: 0.8125rem; font-weight: 700; color: #111; background: #5de3ca; border: none; border-radius: 0.5rem; cursor: pointer; box-shadow: 0 4px 12px rgba(93, 227, 202, 0.3); transition: all 0.2s;">
              Submit Answers & Claim XP
            </button>
            <?php endif; ?>
          </div>
        </form>
      </div>
    <?php endif; ?>

    <!-- STUDENT PERSONAL NOTES SCRATCHPAD -->
    <div style="background: #14142b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; padding: 1.5rem; margin-top: 2rem; margin-bottom: 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 700; color: #FFF;">
          <i data-lucide="edit-3" style="width: 1rem; height: 1rem; color: #F59E0B;"></i>
          <span>Personal Study Notes</span>
        </div>
        <span id="note-saved-status" style="font-size: 0.6875rem; color: #5de3ca; display: none;">Saved!</span>
      </div>
      
      <div style="position: relative;">
        <textarea id="student-notes" placeholder="Jot down notes, questions, or key takeaways for this lesson..." style="width: 100%; box-sizing: border-box; height: 6rem; background: #080914; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; padding: 0.75rem; padding-bottom: 3rem; color: #E2E8F0; font-size: 0.875rem; resize: vertical;"></textarea>
        <button onclick="saveNote(<?= (int)$lesson['id'] ?>)" style="position: absolute; bottom: 0.75rem; right: 0.75rem; padding: 0.4rem 1rem; font-size: 0.75rem; font-weight: 700; color: #111; background: #5de3ca; border: none; border-radius: 0.375rem; cursor: pointer; box-shadow: 0 2px 8px rgba(93, 227, 202, 0.3); transition: all 0.2s;">
          Save Note
        </button>
      </div>

      <!-- Saved Notes History -->
      <div id="notes-history-container" style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
        <?php foreach ($savedNotes as $note): ?>
          <div class="saved-note-item" style="background: rgba(255,255,255,0.03); border-left: 2px solid #8d7aff; padding: 1rem; border-radius: 0 0.5rem 0.5rem 0;">
            <div style="font-size: 0.9375rem; color: #E2E8F0; line-height: 1.6; margin-bottom: 0.5rem; white-space: pre-wrap;"><?= htmlspecialchars($note['note_text']) ?></div>
            <div style="font-size: 0.6875rem; color: #64748B; font-family: 'Space Mono', monospace;"><?= date('M j, Y, g:i a', strtotime($note['updated_at'])) ?></div>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>  </main>

  <script>
    // Dual mode switcher
    function setMode(mode) {
      const beginnerSec = document.getElementById('section-beginner');
      const techSec = document.getElementById('section-technical');
      const btnBeginner = document.getElementById('btn-mode-beginner');
      const btnTech = document.getElementById('btn-mode-technical');

      if (mode === 'beginner') {
        beginnerSec.style.display = 'block';
        techSec.style.display = 'none';
        btnBeginner.style.background = '#6150d5';
        btnBeginner.style.color = '#FFF';
        btnTech.style.background = 'transparent';
        btnTech.style.color = '#94A3B8';
      } else {
        beginnerSec.style.display = 'none';
        techSec.style.display = 'block';
        btnTech.style.background = '#4F46E5';
        btnTech.style.color = '#FFF';
        btnBeginner.style.background = 'transparent';
        btnBeginner.style.color = '#94A3B8';
      }
    }

    // Live SHA-256 calculator simulation using Web Crypto API
    async function calculateLiveHash(text) {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      document.getElementById('hash-output').textContent = hashHex;
    }

    // Initial hash calculation on page load
    calculateLiveHash(document.getElementById('hash-input').value);

    // Save student notes via AJAX
    async function saveNote(lessonId) {
        const textInput = document.getElementById('student-notes');
        const text = textInput.value.trim();
        if(!text) return;
        
        const formData = new FormData();
        formData.append('lesson_id', lessonId);
        formData.append('note_text', text);

        try {
          const res = await fetch('/api/notes.php', { method: 'POST', body: formData });
          const data = await res.json();
          if (res.ok && data.success) {
            const status = document.getElementById('note-saved-status');
            status.style.display = 'inline';
            setTimeout(() => { status.style.display = 'none'; }, 2000);
            
            // Add note to UI without refresh
            const historyContainer = document.getElementById('notes-history-container');
            const newNote = document.createElement('div');
            newNote.className = 'saved-note-item';
            newNote.style = 'background: rgba(255,255,255,0.03); border-left: 2px solid #8d7aff; padding: 1rem; border-radius: 0 0.5rem 0.5rem 0; margin-bottom: 1rem;';
            newNote.innerHTML = `
                <div style="font-size: 0.9375rem; color: #E2E8F0; line-height: 1.6; margin-bottom: 0.5rem; white-space: pre-wrap;">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
                <div style="font-size: 0.6875rem; color: #64748B; font-family: 'Space Mono', monospace;">${data.timestamp}</div>
            `;
            historyContainer.insertBefore(newNote, historyContainer.firstChild);
            textInput.value = ''; // clear input
          }
        } catch (e) {
          console.error(e);
        }
    }
    
    let noteTimer;
    function autoSaveNote(lessonId) {
      clearTimeout(noteTimer);
      noteTimer = setTimeout(async () => {
        const text = document.getElementById('student-notes').value;
        const formData = new FormData();
        formData.append('lesson_id', lessonId);
        formData.append('note_text', text);

        try {
          const res = await fetch('/api/notes.php', { method: 'POST', body: formData });
          if (res.ok) {
            const status = document.getElementById('note-saved-status');
            status.style.display = 'inline';
            setTimeout(() => { status.style.display = 'none'; }, 2000);
          }
        } catch (e) {
          console.error(e);
        }
      }, 600);
    }

    // Quiz Pagination Logic
    let currentQuizIndex = 0;
    const totalQuizzes = <?= count($quizzes) ?>;

    function updateQuizUI() {
      // Hide all questions
      for (let i = 0; i < totalQuizzes; i++) {
        document.getElementById(`quiz-question-${i}`).style.display = 'none';
        
        // Update dots
        const dot = document.getElementById(`quiz-dot-${i}`);
        if (i === currentQuizIndex) {
          dot.style.background = '#5de3ca';
          dot.style.color = '#111';
          dot.style.boxShadow = '0 0 10px rgba(93,227,202,0.5)';
        } else if (i < currentQuizIndex) {
          dot.style.background = 'rgba(93,227,202,0.2)';
          dot.style.color = '#5de3ca';
          dot.style.boxShadow = 'none';
        } else {
          dot.style.background = 'rgba(255,255,255,0.1)';
          dot.style.color = '#94A3B8';
          dot.style.boxShadow = 'none';
        }
      }
      
      // Show active question
      document.getElementById(`quiz-question-${currentQuizIndex}`).style.display = 'block';

      // Update buttons
      const btnPrev = document.getElementById('quiz-btn-prev');
      const btnNext = document.getElementById('quiz-btn-next');
      
      if(btnPrev) {
          btnPrev.style.visibility = currentQuizIndex === 0 ? 'hidden' : 'visible';
      }
      
      if(btnNext && totalQuizzes > 1) {
          if (currentQuizIndex === totalQuizzes - 1) {
            btnNext.innerHTML = 'Submit Answers <i data-lucide="check-circle" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-left: 4px;"></i>';
            btnNext.style.background = '#5de3ca';
            btnNext.style.color = '#111';
            btnNext.style.boxShadow = '0 4px 12px rgba(93, 227, 202, 0.3)';
            btnNext.type = 'submit';
            btnNext.removeAttribute('onclick');
          } else {
            btnNext.innerHTML = 'Next <i data-lucide="arrow-right" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-left: 4px;"></i>';
            btnNext.style.background = '#8d7aff';
            btnNext.style.color = '#FFF';
            btnNext.style.boxShadow = '0 4px 12px rgba(141, 122, 255, 0.3)';
            btnNext.type = 'button';
            btnNext.setAttribute('onclick', 'nextQuestion()');
          }
          if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }

    function prevQuestion() {
      if (currentQuizIndex > 0) {
        currentQuizIndex--;
        updateQuizUI();
      }
    }

    function nextQuestion() {
      if (currentQuizIndex < totalQuizzes - 1) {
        currentQuizIndex++;
        updateQuizUI();
      }
    }

    // Submit quiz via AJAX
    async function submitQuiz(e, lessonId) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      formData.append('lesson_id', lessonId);

      try {
        const res = await fetch('/api/quiz_submit.php', { method: 'POST', body: formData });
        const data = await res.json();
        const resultDiv = document.getElementById('quiz-result');

        if (data.success) {
          resultDiv.innerHTML = `<span style="color: #5de3ca;">✓ Passed! Score: ${data.score}% (+${data.xp_awarded} XP)</span>`;
          setTimeout(() => {
            window.location.href = '/learn.php';
          }, 1800);
        } else {
          resultDiv.innerHTML = `<span style="color: #EF4444;">Score: ${data.score}%. Need 70% to pass. Try again!</span>`;
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  </script>
</body>
</html>
