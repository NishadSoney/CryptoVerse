<?php
/**
 * CryptoVerse - Login Page
 * Location: login.php
 */

declare(strict_types=1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

// Redirect to dashboard if already logged in
AuthService::requireGuest();

$error = '';
$submitted = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $error = 'Please enter both email and password.';
    } else {
        $result = AuthService::login($email, $password);
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
  <title>Log in — CryptoVerse</title>
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

  <!-- Right Side: Login Panel -->
  <section class="auth-panel" aria-labelledby="auth-title">
    <div class="auth-panel-inner">
      <a href="index.php" class="mobile-brand brand"><span class="brand-mark">C</span><span>CRYPTOVERSE</span></a>
      <div class="auth-kicker"><i data-lucide="lock-keyhole" style="width: 15px; height: 15px;"></i> PRIVATE LEARNING SPACE</div>
      <h2 id="auth-title">Welcome back.</h2>
      <p class="auth-lede">Pick up where you left off.</p>

      <?php if ($error): ?>
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #FCA5A5; padding: 10px; border-radius: 4px; font-size: 11px; margin-bottom: 20px;">
          <?= htmlspecialchars($error) ?>
        </div>
      <?php endif; ?>

      <form class="auth-form" method="POST" action="login.php">
        <label>Email address
          <input name="email" type="email" placeholder="you@example.com" required value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" />
        </label>
        
        <label>Password
          <div class="password-wrap">
            <input name="password" id="password-field" type="password" placeholder="Your password" required />
            <button type="button" class="password-toggle" id="toggle-pwd" aria-label="Toggle password">
              <i data-lucide="eye" id="eye-icon" style="width: 17px; height: 17px;"></i>
            </button>
          </div>
        </label>

        <div class="form-meta">
          <label class="check-label"><input type="checkbox" name="remember" /> <span>Remember me</span></label>
          <a href="#">Forgot password?</a>
        </div>
        
        <button class="button auth-submit" type="submit">Log in <i data-lucide="arrow-right" style="width: 17px; height: 17px;"></i></button>
      </form>
      
      <p class="auth-switch">New to CryptoVerse? <a href="signup.php">Create an account</a></p>
      <p class="auth-legal">By continuing, you agree to our Terms and acknowledge our Privacy Policy.</p>
    </div>
  </section>
</main>

<script>
  lucide.createIcons();

  // Password visibility toggle logic
  const togglePwd = document.getElementById('toggle-pwd');
  const pwdField = document.getElementById('password-field');
  const eyeIcon = document.getElementById('eye-icon');

  togglePwd.addEventListener('click', () => {
    if (pwdField.type === 'password') {
      pwdField.type = 'text';
      eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
      pwdField.type = 'password';
      eyeIcon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
  });
</script>

</body>
</html>
