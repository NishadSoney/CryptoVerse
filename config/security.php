<?php
/**
 * CryptoVerse - Security & Sanitization Layer
 * Location: config/security.php
 */

declare(strict_types=1);

namespace CryptoVerse\Security;

class SecurityGuard {
    /**
     * Generate or fetch the session CSRF token
     */
    public static function getCsrfToken(): string {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    /**
     * Validate CSRF token from incoming request
     */
    public static function validateCsrfToken(?string $token): bool {
        if (empty($token) || empty($_SESSION['csrf_token'])) {
            return false;
        }
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Render hidden CSRF form input
     */
    public static function csrfField(): string {
        $token = self::getCsrfToken();
        return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($token, ENT_QUOTES, 'UTF-8') . '">';
    }

    /**
     * Sanitize plain string input
     */
    public static function sanitizeString(?string $input): string {
        if ($input === null) return '';
        return trim(strip_tags($input));
    }

    /**
     * Escape output for safe HTML display (XSS prevention)
     */
    public static function escape(?string $string): string {
        return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
    }

    /**
     * Sanitize and validate email
     */
    public static function sanitizeEmail(?string $email): ?string {
        if (empty($email)) return null;
        $clean = filter_var(trim($email), FILTER_SANITIZE_EMAIL);
        return filter_var($clean, FILTER_VALIDATE_EMAIL) ? $clean : null;
    }
}
