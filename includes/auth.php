<?php
/**
 * CryptoVerse - Authentication Service & Middleware
 * Location: includes/auth.php
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';

use CryptoVerse\Config\Database;
use CryptoVerse\Security\SecurityGuard;

class AuthService {
    /**
     * Authenticate user with email/username and password.
     * Updates last_login timestamp upon success.
     */
    public static function login(string $identifier, string $password): array {
        $db = Database::getConnection();

        $stmt = $db->prepare("
            SELECT u.id, u.name, u.username, u.email, u.password_hash, u.experience_level, u.role,
                   p.xp_total, p.current_level, p.streak_days, w.virtual_cash
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            LEFT JOIN wallets w ON u.id = w.user_id
            WHERE u.email = :id1 OR u.username = :id2
            LIMIT 1
        ");
        $stmt->execute([':id1' => $identifier, ':id2' => $identifier]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return ['success' => false, 'error' => 'Invalid email/username or password.'];
        }

        // Session fixation protection
        session_regenerate_id(true);

        // Store active session parameters
        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['name'] = $user['name'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['experience_level'] = $user['experience_level'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['logged_in'] = true;

        // Record last login
        $updateStmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = :id");
        $updateStmt->execute([':id' => $user['id']]);

        return ['success' => true, 'user' => $user];
    }

    /**
     * Register a new user, create their profile, and provision their $100k virtual wallet.
     * Encapsulated inside an atomic database transaction.
     */
    public static function register(
        string $name,
        string $username,
        string $email,
        string $password,
        string $experienceLevel = 'BEGINNER'
    ): array {
        $db = Database::getConnection();

        // Validation
        if (strlen($name) < 2) {
            return ['success' => false, 'error' => 'Full name must be at least 2 characters.'];
        }
        if (!preg_match('/^[a-zA-Z0-9_]{3,30}$/', $username)) {
            return ['success' => false, 'error' => 'Username must be 3-30 alphanumeric characters or underscores.'];
        }
        $validEmail = SecurityGuard::sanitizeEmail($email);
        if (!$validEmail) {
            return ['success' => false, 'error' => 'Please provide a valid email address.'];
        }
        if (strlen($password) < 8) {
            return ['success' => false, 'error' => 'Password must be at least 8 characters long.'];
        }
        $validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
        if (!in_array(strtoupper($experienceLevel), $validLevels, true)) {
            $experienceLevel = 'BEGINNER';
        }

        // Check if username or email is already taken
        $checkStmt = $db->prepare("SELECT id, email, username FROM users WHERE email = :email OR username = :username LIMIT 1");
        $checkStmt->execute([':email' => $validEmail, ':username' => $username]);
        $existing = $checkStmt->fetch();

        if ($existing) {
            if ($existing['email'] === $validEmail) {
                return ['success' => false, 'error' => 'An account with that email already exists.'];
            }
            return ['success' => false, 'error' => 'That username is already taken.'];
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        // Atomic transaction to ensure complete user record, profile, and wallet initialization
        try {
            $db->beginTransaction();

            // 1. Insert User
            $userStmt = $db->prepare("
                INSERT INTO users (name, username, email, password_hash, experience_level, role)
                VALUES (:name, :username, :email, :password_hash, :level, 'STUDENT')
            ");
            $userStmt->execute([
                ':name' => $name,
                ':username' => $username,
                ':email' => $validEmail,
                ':password_hash' => $passwordHash,
                ':level' => strtoupper($experienceLevel)
            ]);
            $userId = (int)$db->lastInsertId();

            // 2. Initialize Profile
            $profileStmt = $db->prepare("
                INSERT INTO user_profiles (user_id, xp_total, current_level, streak_days, last_active_date)
                VALUES (:user_id, 0, 1, 1, CURRENT_DATE)
            ");
            $profileStmt->execute([':user_id' => $userId]);

            // 3. Initialize Paper Trading Wallet with $100,000.00
            $walletStmt = $db->prepare("
                INSERT INTO wallets (user_id, virtual_cash)
                VALUES (:user_id, :cash)
            ");
            $walletStmt->execute([
                ':user_id' => $userId,
                ':cash' => INITIAL_VIRTUAL_BALANCE
            ]);

            // 4. Initialize first lesson as AVAILABLE in user_progress
            $progressStmt = $db->prepare("
                INSERT INTO user_progress (user_id, lesson_id, status)
                VALUES (:user_id, 1, 'AVAILABLE')
            ");
            $progressStmt->execute([':user_id' => $userId]);

            $db->commit();

            // Auto-login newly registered user
            return self::login($validEmail, $password);

        } catch (\Exception $e) {
            $db->rollBack();
            error_log('[Registration Error] ' . $e->getMessage());
            return ['success' => false, 'error' => 'Registration failed. Please try again.'];
        }
    }

    /**
     * Check if current visitor has a verified active session.
     */
    public static function check(): bool {
        return !empty($_SESSION['user_id']) && !empty($_SESSION['logged_in']);
    }

    /**
     * Get the logged-in user object or null.
     */
    public static function user(): ?array {
        if (!self::check()) {
            return null;
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT u.id, u.name, u.username, u.email, u.experience_level, u.role,
                   p.xp_total, p.current_level, p.streak_days, p.preferred_chart_mode,
                   w.virtual_cash
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            LEFT JOIN wallets w ON u.id = w.user_id
            WHERE u.id = :id
            LIMIT 1
        ");
        $stmt->execute([':id' => $_SESSION['user_id']]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Guard middleware for protected routes: redirects to login if unauthenticated.
     */
    public static function requireAuth(): void {
        if (!self::check()) {
            header('Location: /login.php?redirect=' . urlencode($_SERVER['REQUEST_URI'] ?? '/dashboard.php'));
            exit;
        }
    }

    /**
     * Guard middleware for guest routes (login/signup): redirects to dashboard if already logged in.
     */
    public static function requireGuest(): void {
        if (self::check()) {
            header('Location: /dashboard.php');
            exit;
        }
    }

    /**
     * Terminate user session and clear cookies.
     */
    public static function logout(): void {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }
        session_destroy();
    }
}
