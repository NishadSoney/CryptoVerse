<?php
/**
 * CryptoVerse - Signup Page
 * Location: signup.php
 */

declare(strict_types=1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

// Redirect to dashboard if already logged in
AuthService::requireGuest();

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $username = trim($_POST['username'] ?? ''); // we'll derive this or ask for it. Let's derive from name if not provided, or add a field. We will add a field.
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    
    if (empty($name) || empty($email) || empty($password) || empty($confirm_password) || empty($username)) {
        $error = 'Please fill out all fields.';
    } elseif ($password !== $confirm_password) {
        $error = 'Passwords do not match. Please try again.';
    } else {
        // Call registration logic
        $result = AuthService::register($name, $username, $email, $password);
        if ($result['success']) {
            header('Location: dashboard.php');
            exit;
        } else {
            $error = $result['error'];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign up — CryptoVerse</title>
  <link rel="stylesheet" href="assets/css/landing.css">
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>

<main class="auth-shell">
  <!-- Left Side: Graphic / Copy -->
  <div class="auth-aside">
    <a href="index.php" class="brand"><span class="brand-mark">C</span><span>CRYPTOVERSE</span></a>
    <div class="auth-aside-copy">
      <div class="eyebrow"><span class="eyebrow-dot"></span> LEARN WITHOUT THE NOISE</div>
      <h1>Make sense of<br /><em>what moves</em><br />the world.</h1>
      <p>A calmer way to understand crypto, practice your decisions, and build lasting confidence.</p>
      <div class="auth-proof"><span class="proof-icon"><i data-lucide="check" style="width: 15px; height: 15px;"></i></span><span>Virtual money only. Always.</span></div>
    </div>
    <div class="auth-aside-foot">LEARN · EXPLORE · PRACTICE</div>
  </div>

  <!-- Right Side: Signup Panel -->
  <section class="auth-panel" aria-labelledby="auth-title">
    <div class="auth-panel-inner">
      <a href="index.php" class="mobile-brand brand"><span class="brand-mark">C</span><span>CRYPTOVERSE</span></a>
      <div class="auth-kicker"><i data-lucide="lock-keyhole" style="width: 15px; height: 15px;"></i> PRIVATE LEARNING SPACE</div>
      <h2 id="auth-title">Start your journey.</h2>
      <p class="auth-lede">Create an account and make the complex feel clear.</p>

      <?php if ($error): ?>
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #FCA5A5; padding: 10px; border-radius: 4px; font-size: 11px; margin-bottom: 20px;">
          <?= htmlspecialchars($error) ?>
        </div>
      <?php endif; ?>

      <form class="auth-form" method="POST" action="signup.php">
        <label>Full Name
          <input name="name" type="text" placeholder="Your name" required value="<?= htmlspecialchars($_POST['name'] ?? '') ?>" />
        </label>
        
        <label>Username
          <input name="username" type="text" placeholder="Choose a username" required value="<?= htmlspecialchars($_POST['username'] ?? '') ?>" />
        </label>
        
        <label>Email address
          <input name="email" type="email" placeholder="you@example.com" required value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" />
        </label>
        
        <label>Password
          <div class="password-wrap">
            <input name="password" id="password-field" type="password" placeholder="At least 8 characters" minlength="8" required />
            <button type="button" class="password-toggle toggle-pwd" data-target="password-field" aria-label="Toggle password">
              <i data-lucide="eye" style="width: 17px; height: 17px;"></i>
            </button>
          </div>
        </label>
        
        <label>Confirm Password
          <div class="password-wrap">
            <input name="confirm_password" id="confirm-password-field" type="password" placeholder="Type password again" minlength="8" required />
            <button type="button" class="password-toggle toggle-pwd" data-target="confirm-password-field" aria-label="Toggle confirm password">
              <i data-lucide="eye" style="width: 17px; height: 17px;"></i>
            </button>
          </div>
        </label>
        
        <button class="button auth-submit" type="submit">Create account <i data-lucide="arrow-right" style="width: 17px; height: 17px;"></i></button>
      </form>
      
      <p class="auth-switch">Already learning with us? <a href="login.php">Log in</a></p>
      <p class="auth-legal">By continuing, you agree to our Terms and acknowledge our Privacy Policy.</p>
    </div>
  </section>
</main>

<script>
  lucide.createIcons();

  // Password visibility toggle logic
  const toggles = document.querySelectorAll('.toggle-pwd');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.getAttribute('data-target');
      const pwdField = document.getElementById(targetId);
      const eyeIcon = toggle.querySelector('i');
      
      if (pwdField.type === 'password') {
        pwdField.type = 'text';
        eyeIcon.setAttribute('data-lucide', 'eye-off');
      } else {
        pwdField.type = 'password';
        eyeIcon.setAttribute('data-lucide', 'eye');
      }
      lucide.createIcons();
    });
  });
</script>

</body>
</html>
