<?php
/**
 * CryptoVerse - Core Helper Functions
 * Location: includes/functions.php
 */

declare(strict_types=1);

/**
 * Format currency with USD sign and comma grouping
 */
function formatCurrency(float $amount, int $decimals = 2): string {
    return '$' . number_format($amount, $decimals);
}

/**
 * Format cryptocurrency quantity up to 8 decimals without trailing zeros
 */
function formatCrypto(float $quantity, int $maxDecimals = 8): string {
    $formatted = number_format($quantity, $maxDecimals, '.', ',');
    return rtrim(rtrim($formatted, '0'), '.');
}

/**
 * Format percentage with positive/negative color semantics
 */
function formatPercentChange(float $percent): string {
    $sign = $percent >= 0 ? '+' : '';
    $class = $percent >= 0 ? 'text-emerald-400' : 'text-rose-400';
    $formatted = $sign . number_format($percent, 2) . '%';
    return "<span class=\"{$class} font-semibold font-mono\">{$formatted}</span>";
}

/**
 * Calculate user rank level based on accumulated XP
 */
function calculateLevel(int $xp): array {
    $level = 1 + (int)floor($xp / 500);
    $currentLevelBase = ($level - 1) * 500;
    $nextLevelTarget = $level * 500;
    $progressInLevel = $xp - $currentLevelBase;
    $percentage = min(100, max(0, (int)round(($progressInLevel / 500) * 100)));

    $titles = [
        1 => 'Novice Explorer',
        2 => 'Crypto Apprentice',
        3 => 'Blockchain Scout',
        4 => 'Market Analyst',
        5 => 'DeFi Navigator',
        6 => 'Master Strategist'
    ];

    $title = $titles[$level] ?? 'Crypto Veteran';

    return [
        'level' => $level,
        'title' => $title,
        'progress_percent' => $percentage,
        'xp_in_level' => $progressInLevel,
        'xp_for_next' => 500
    ];
}
