-- ============================================================
-- CryptoVerse — Database Schema & Seed Data
-- Target Database: MySQL 8.0+ (WAMP Server / phpMyAdmin Compatible)
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================

CREATE DATABASE IF NOT EXISTS `cryptoverse` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `cryptoverse`;

-- ------------------------------------------------------------
-- 1. USERS & PROFILES
-- ------------------------------------------------------------

DROP TABLE IF EXISTS `user_achievements`;
DROP TABLE IF EXISTS `challenge_results`;
DROP TABLE IF EXISTS `quiz_results`;
DROP TABLE IF EXISTS `user_progress`;
DROP TABLE IF EXISTS `trades`;
DROP TABLE IF EXISTS `wallet_assets`;
DROP TABLE IF EXISTS `wallets`;
DROP TABLE IF EXISTS `watchlist_assets`;
DROP TABLE IF EXISTS `quiz_options`;
DROP TABLE IF EXISTS `quiz_questions`;
DROP TABLE IF EXISTS `quizzes`;
DROP TABLE IF EXISTS `lessons`;
DROP TABLE IF EXISTS `modules`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `achievements`;
DROP TABLE IF EXISTS `challenges`;
DROP TABLE IF EXISTS `glossary_terms`;
DROP TABLE IF EXISTS `user_profiles`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `experience_level` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'BEGINNER',
  `role` ENUM('STUDENT', 'ADMIN') DEFAULT 'STUDENT',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` DATETIME NULL,
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_profiles` (
  `user_id` INT UNSIGNED PRIMARY KEY,
  `avatar_url` VARCHAR(255) DEFAULT '/assets/images/avatars/default.svg',
  `xp_total` INT UNSIGNED DEFAULT 0,
  `current_level` INT UNSIGNED DEFAULT 1,
  `streak_days` INT UNSIGNED DEFAULT 1,
  `last_active_date` DATE NULL,
  `preferred_chart_mode` ENUM('SIMPLE', 'ADVANCED') DEFAULT 'SIMPLE',
  `enable_3d_effects` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. PAPER TRADING WALLETS, ASSETS & TRADES
-- ------------------------------------------------------------

CREATE TABLE `wallets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `virtual_cash` DECIMAL(15, 2) NOT NULL DEFAULT 100000.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `wallet_assets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `wallet_id` INT UNSIGNED NOT NULL,
  `asset_symbol` VARCHAR(10) NOT NULL,
  `quantity` DECIMAL(18, 8) NOT NULL DEFAULT 0.00000000,
  `avg_buy_price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_wallet_asset` (`wallet_id`, `asset_symbol`),
  FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `trades` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `asset_symbol` VARCHAR(10) NOT NULL,
  `trade_type` ENUM('BUY', 'SELL') NOT NULL,
  `quantity` DECIMAL(18, 8) NOT NULL,
  `price` DECIMAL(15, 2) NOT NULL,
  `total_value` DECIMAL(15, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_trades_user` (`user_id`),
  INDEX `idx_trades_symbol` (`asset_symbol`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `watchlist_assets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `asset_symbol` VARCHAR(10) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_watch_asset` (`user_id`, `asset_symbol`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. CURRICULUM, LESSONS & PROGRESS
-- ------------------------------------------------------------

CREATE TABLE `courses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NOT NULL,
  `badge_icon` VARCHAR(50) DEFAULT 'book-open',
  `sort_order` INT UNSIGNED DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `modules` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `level_badge` VARCHAR(50) DEFAULT 'LEVEL 1 — FOUNDATIONS',
  `sort_order` INT UNSIGNED DEFAULT 1,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lessons` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `module_id` INT UNSIGNED NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(200) NOT NULL,
  `summary` VARCHAR(300) NOT NULL,
  `simple_explanation` TEXT NOT NULL,
  `analogy` TEXT NOT NULL,
  `technical_explanation` TEXT NOT NULL,
  `key_takeaway` VARCHAR(300) NOT NULL,
  `xp_reward` INT UNSIGNED DEFAULT 50,
  `estimated_minutes` INT UNSIGNED DEFAULT 4,
  `sort_order` INT UNSIGNED DEFAULT 1,
  FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_progress` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `lesson_id` INT UNSIGNED NOT NULL,
  `status` ENUM('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'AVAILABLE',
  `completed_at` DATETIME NULL,
  UNIQUE KEY `uk_user_lesson` (`user_id`, `lesson_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. ASSESSMENTS & QUIZZES
-- ------------------------------------------------------------

CREATE TABLE `quizzes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `lesson_id` INT UNSIGNED NOT NULL UNIQUE,
  `title` VARCHAR(200) NOT NULL,
  `pass_score` INT UNSIGNED DEFAULT 80,
  `xp_reward` INT UNSIGNED DEFAULT 75,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quiz_questions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT UNSIGNED NOT NULL,
  `question_text` TEXT NOT NULL,
  `explanation` TEXT NOT NULL,
  `sort_order` INT UNSIGNED DEFAULT 1,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quiz_options` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `question_id` INT UNSIGNED NOT NULL,
  `option_text` TEXT NOT NULL,
  `is_correct` BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quiz_results` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `quiz_id` INT UNSIGNED NOT NULL,
  `score_percent` INT UNSIGNED NOT NULL,
  `xp_awarded` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. GLOSSARY, ACHIEVEMENTS & CHALLENGES
-- ------------------------------------------------------------

CREATE TABLE `glossary_terms` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `term` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `category` VARCHAR(50) NOT NULL,
  `simple_definition` TEXT NOT NULL,
  `technical_definition` TEXT NOT NULL,
  `example_usage` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `achievements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `icon_name` VARCHAR(50) NOT NULL,
  `xp_reward` INT UNSIGNED DEFAULT 100
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_achievements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `achievement_id` INT UNSIGNED NOT NULL,
  `unlocked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_achievement` (`user_id`, `achievement_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `challenges` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `xp_reward` INT UNSIGNED DEFAULT 50,
  `type` ENUM('LESSON', 'QUIZ', 'TRADE', 'SECURITY') NOT NULL,
  `target_count` INT UNSIGNED DEFAULT 1,
  `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `challenge_results` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `challenge_id` INT UNSIGNED NOT NULL,
  `completed_date` DATE NOT NULL,
  `xp_awarded` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uk_user_challenge_day` (`user_id`, `challenge_id`, `completed_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA: COURSES, MODULES & INITIAL 15 LESSONS
-- ============================================================

INSERT INTO `courses` (`id`, `title`, `slug`, `description`, `badge_icon`, `sort_order`) VALUES
(1, 'CryptoVerse Master Curriculum', 'cryptoverse-curriculum', 'The complete educational pathway from ground-level monetary fundamentals to advanced risk systems and decentralized finance.', 'compass', 1);

INSERT INTO `modules` (`id`, `course_id`, `title`, `slug`, `level_badge`, `sort_order`) VALUES
(1, 1, 'Foundations of Crypto', 'foundations', 'LEVEL 1 — FOUNDATIONS', 1),
(2, 1, 'Market Mechanics', 'market-mechanics', 'LEVEL 2 — MARKETS', 2),
(3, 1, 'Technical & Chart Analysis', 'chart-analysis', 'LEVEL 3 — ANALYSIS', 3),
(4, 1, 'Risk Management & Psychology', 'risk-management', 'LEVEL 4 — RISK', 4),
(5, 1, 'Advanced Web3 & DeFi', 'advanced-web3', 'LEVEL 5 — ADVANCED', 5);

INSERT INTO `lessons` (`id`, `module_id`, `slug`, `title`, `summary`, `simple_explanation`, `analogy`, `technical_explanation`, `key_takeaway`, `xp_reward`, `estimated_minutes`, `sort_order`) VALUES
-- 1. What Is Money?
(1, 1, 'what-is-money', 'What Is Money?', 
 'Discover what gives money value and how humanity evolved from bartering seashells to digital tokens.',
 'Money is simply a mutually agreed-upon tool that lets people trade effort, goods, and time without directly swapping physical items like cows or wheat. For anything to work well as money, people must trust it, it must be hard to fake or copy, easy to carry, and hold value over time.',
 'Imagine a community ledger kept on a town chalkboard. If you fix someone\'s roof, the town records that you have 5 tokens. Later, you trade 2 tokens to the baker for bread. Money is the agreed-upon record of your past work.',
 'Economically, sound money fulfills three core functions: a Medium of Exchange, a Unit of Account, and a Store of Value. Historically, money evolved from commodity money (gold, silver) to representative money (gold certificates), to fiat currency backed by government decrees, and now to algorithmic digital scarcity.',
 'Money is fundamentally a collective social agreement anchored in scarcity, portability, and trust.', 50, 4, 1),

-- 2. What Is Cryptocurrency?
(2, 1, 'what-is-cryptocurrency', 'What Is Cryptocurrency?',
 'Understand how cryptography and computer networks combine to create censorship-resistant digital assets.',
 'A cryptocurrency is purely digital money secured by mathematical codes rather than a bank or central authority. Instead of trusting a private corporation or a government to track balances, a global network of computers confirms and records transactions automatically.',
 'Think of digital email vs physical letters. Traditional bank money is like asking a post office clerk to hand-deliver cash; cryptocurrency is like sending an encrypted email directly to someone anywhere in the world in seconds.',
 'Cryptocurrencies rely on decentralized consensus algorithms (e.g., Proof of Work, Proof of Stake), asymmetric cryptography (public-private key pairs), and cryptographic hash functions to maintain a tamper-proof state without a single point of failure.',
 'Cryptocurrency is self-sovereign digital value powered by open code and decentralized network consensus.', 50, 4, 2),

-- 3. What Is Bitcoin?
(3, 1, 'what-is-bitcoin', 'What Is Bitcoin?',
 'Meet the original cryptocurrency created in 2008 by Satoshi Nakamoto to solve the double-spending problem.',
 'Bitcoin is the very first cryptocurrency, invented in 2008 following the global financial crisis. It was created to be digital gold: scarce (there will only ever be 21 million Bitcoins created), decentralized, and impossible for any single government or company to inflate or shut down.',
 'Gold has value partly because it is difficult and expensive to dig out of the ground, and no one can print more of it on a paper press. Bitcoin is digital gold with a mathematically enforced limit of 21 million coins.',
 'Bitcoin functions on a Proof-of-Work (PoW) consensus mechanism with a Nakamoto consensus rule. It features an automated algorithmic difficulty adjustment every 2016 blocks and a 4-year block reward halving cycle that asymptotically approaches its 21 million hard cap.',
 'Bitcoin solved the computer science problem of digital scarcity without requiring a centralized administrator.', 50, 5, 3),

-- 4. What Is Blockchain?
(4, 1, 'what-is-blockchain', 'What Is Blockchain?',
 'Explore the append-only distributed ledger technology that makes crypto tamper-resistant.',
 'A blockchain is an open digital ledger of transactions that is duplicated across thousands of computers worldwide. Transactions are grouped into "blocks" and mathematically chained together in chronological order. Once a block is added, changing any detail would break all subsequent links.',
 'Imagine a chain of locked glass boxes. When a page of transactions fills up, it gets placed in a glass box, locked with a unique mathematical padlock, and chained to the previous box. Everyone has an exact duplicate of this chain.',
 'A blockchain is an append-only distributed state machine. Each block contains a block header with a cryptographic hash of the previous block, a Merkle tree root of valid transactions, a timestamp, and a nonce solving the network difficulty target.',
 'Because each block points to the hash of the preceding block, modifying historical records is computationally infeasible.', 50, 5, 4),

-- 5. Public vs Private Keys
(5, 1, 'public-vs-private-keys', 'Public vs Private Keys',
 'Learn how asymmetric cryptography keeps your funds secure: your email address versus your password.',
 'When you own cryptocurrency, you don\'t own physical coins; you own a secret password called a Private Key. Your Public Key is like your bank account number or email address—safe to share so others can send you funds. Your Private Key is the master key that authorizes spending; if someone steals it, they own your money.',
 'Your public key is your mailbox address where anyone can drop an envelope through the slot. Your private key is the unique brass key that unlocks the back of the mailbox to take the letters out.',
 'Asymmetric cryptography uses mathematical trapdoor functions (such as the secp256k1 elliptic curve in Bitcoin). A public key and digital address are derived one-way from the private key; it is practically impossible to reverse-engineer the private key from the public address.',
 'Never share your private key or seed phrase with anyone—in crypto, the keyholder is the definitive owner.', 50, 4, 5),

-- 6. What Is a Crypto Wallet?
(6, 1, 'what-is-a-crypto-wallet', 'What Is a Crypto Wallet?',
 'Discover software and hardware key managers: hot wallets vs cold wallets.',
 'A cryptocurrency wallet does not actually store coins inside your phone or computer. The coins always live on the blockchain network. Instead, your wallet is a secure keychain that holds your private keys and lets you check balances and sign outgoing transactions.',
 'Think of your wallet like a debit card and PIN reader. The money is in the network banking system; your card and PIN simply give you access to authorize transactions.',
 'Wallets fall into two major categories: Hot Wallets (connected to the internet, e.g., mobile apps and browser extensions) and Cold Storage / Hardware Wallets (air-gapped physical microcontrollers like Ledger or Trezor that keep private keys completely isolated from network malware).',
 'A wallet is a cryptographic key manager, not a physical coin container.', 50, 4, 6),

-- 7. What Is an Exchange?
(7, 1, 'what-is-an-exchange', 'What Is an Exchange?',
 'Understand Centralized Exchanges (CEX) vs Decentralized Exchanges (DEX).',
 'A cryptocurrency exchange is a digital platform where people can trade fiat money (like USD or EUR) for cryptocurrencies, or swap one crypto asset for another. Some are centralized companies (like Coinbase), while others are automated smart contract protocols (DEXs like Uniswap).',
 'A Centralized Exchange is like a currency exchange booth at an international airport with a teller. A Decentralized Exchange is like an automated vending machine with no cashier, operated entirely by pre-programmed code.',
 'Centralized Exchanges (CEX) act as custodial intermediaries managing off-chain order books, requiring KYC and custody of user keys. Decentralized Exchanges (DEX) utilize Automated Market Maker (AMM) formulas (e.g., x * y = k) executing non-custodial swaps directly on the blockchain.',
 'Always remember the rule: "Not your keys, not your coins" when keeping funds on centralized custodial exchanges.', 50, 4, 7),

-- 8. Market Cap Explained
(8, 2, 'market-cap-explained', 'Market Cap Explained',
 'Why a $1 coin might be much bigger than a $100 coin: calculating real valuation.',
 'Beginners often make the mistake of thinking a coin priced at $0.05 is "cheaper" than a coin priced at $500. What actually matters is Market Capitalization: the total current price multiplied by the total number of circulating coins.',
 'If Company A has 10 slices of pizza priced at $10 each, its pizza is worth $100. If Company B cuts a tiny pizza into 1,000,000 microscopic crumbs and sells each crumb for $0.50, its total market cap is $500,000! Individual unit price means nothing without supply.',
 'Market Cap = Current Unit Price × Circulating Supply. Fully Diluted Valuation (FDV) = Current Unit Price × Maximum Total Supply. Analyzing FDV protects investors from future dilution caused by token unlock schedules.',
 'Never judge an asset by unit price alone; always evaluate its Market Cap and circulating supply dynamics.', 50, 4, 8),

-- 9. Understanding Price and Volume
(9, 2, 'price-and-volume', 'Understanding Price and Volume',
 'How buyer and seller agreements form price ticks, and why volume validates movement.',
 'Price is simply the last price at which a buyer and a seller agreed to make a trade. Volume is the total amount of money traded over a specific timeframe (usually 24 hours). High trading volume proves that a price move has strong market backing; low volume warns that a move might be an illusion.',
 'If one person sells a rusty bicycle at an auction for $1,000, the "price" looks high. But if only 1 bicycle was sold all year, there is no real demand volume. If 50,000 people bought bicycles at $500 that same day, that price is heavily validated by high volume.',
 'Volume precedes price action. A breakout above a key resistance level on heavy volume confirms institutional participation, while a breakout on anemic volume suggests a lack of liquidity and a high probability of a "bull trap".',
 'Price tells you where the market went; volume tells you how much conviction was behind the move.', 50, 4, 9),

-- 10. Reading Candlestick Charts
(10, 3, 'reading-candlestick-charts', 'Reading Candlestick Charts',
 'Decode Open, High, Low, and Close (OHLC) bars across different time intervals.',
 'A candlestick chart is a visual map of price action over time. Each candle represents a chosen window (such as 1 hour or 1 day) and reveals four key numbers: the Open (where price started), High (the highest point reached), Low (the lowest point reached), and Close (where it ended).',
 'Think of each candle as a daily tug-of-war match between buyers (green team) and sellers (red team). The wick shows the farthest boundaries both teams pushed, while the thick body shows who held ground when the whistle blew.',
 'Green candles denote Close > Open; Red candles denote Close < Open. Upper wicks indicate overhead supply rejection, while lower wicks signal strong dip absorption. Candlestick patterns (e.g., Pin Bars, Engulfing bars, Dojis) represent shifting momentum.',
 'Candlesticks summarize market sentiment and participant struggle in four clean data points.', 50, 5, 10),

-- 11. Support and Resistance
(11, 3, 'support-and-resistance', 'Support and Resistance',
 'Identify invisible price floors and ceilings created by historical trader memory.',
 'Support is a price level where buyers historically step in with enough demand to pause or reverse a downtrend (a price floor). Resistance is a price level where sellers historically emerge to take profits and cap an uptrend (a price ceiling).',
 'Imagine bouncing a basketball inside a room. The floor keeps the ball from falling into the basement (Support). The ceiling stops the ball from flying into the sky (Resistance). If the ball is thrown hard enough to smash through the ceiling, the old ceiling becomes the new floor.',
 'Support and resistance are psychological concentration zones where unfilled limit orders accumulate. When resistance is broken with significant volume, polarity flips, turning the old resistance level into prospective support.',
 'Trade around verified levels rather than chasing prices in the middle of no-man\'s-land.', 50, 5, 11),

-- 12. RSI Explained
(12, 3, 'rsi-explained', 'RSI Explained (Relative Strength Index)',
 'Master the classic momentum oscillator to spot overbought and oversold conditions.',
 'The Relative Strength Index (RSI) is an indicator that measures the speed and change of price movements on a scale from 0 to 100. When RSI rises above 70, the asset is considered "Overbought" (prices ran up very fast and may need to cool down). When RSI falls below 30, it is "Oversold" (panic selling may be exhausted).',
 'Think of a sprinter running at a full sprint uphill. If their heart rate exceeds 190 bpm (RSI > 70), they are winded and must slow to catch their breath. If they rest completely (RSI < 30), they are primed to start running again.',
 'RSI calculates the ratio of smoothed average gains over average losses across an N-period window (typically 14). Divergence occurs when price prints a higher high but RSI prints a lower high, signaling weakening momentum and potential trend exhaustion.',
 'RSI is an educational gauge of market momentum—never use a single indicator as a standalone trade trigger.', 50, 5, 12),

-- 13. Risk Management
(13, 4, 'risk-management', 'Risk Management & Capital Preservation',
 'The number one rule of trading: survive to play another day. Position sizing and stop-loss.',
 'Trading success is not about winning every trade; it is about keeping your losses small when you are wrong and letting your winners run when you are right. Professional traders never risk more than 1% to 2% of their total capital on any single idea.',
 'A deep-sea diver always checks their oxygen tank before swimming into a cave. Your capital is your oxygen: if you lose 50% of your account, you need a 100% gain just to get back to even!',
 'Position Size Formula = (Account Size × Risk %) ÷ (Entry Price - Stop Loss Price). Enforcing a disciplined Risk-to-Reward ratio (minimum 1:2) ensures that a trader can be profitable even with a 40% win rate.',
 'Preservation of capital is your primary mandate; profit is merely a byproduct of strict risk discipline.', 50, 6, 13),

-- 14. Crypto Scams & Security
(14, 4, 'crypto-scams-security', 'Crypto Scams & Protection',
 'Identify phishing links, fake airdrops, impersonators, and malicious smart contracts.',
 'Because crypto transactions cannot be reversed by a customer service hotline, scammers use deceptive tricks like fake giveaway websites, Telegram direct messages, spoofed exchange emails, and malicious smart contract approvals to steal funds.',
 'If a stranger on the street claims they will double any $100 bill you hand them, you immediately recognize it as a scam. The exact same trick exists on social media with "Send 1 ETH to receive 2 ETH". No legitimate project ever gives away free wealth.',
 'Key attack vectors include DNS spoofing, clipboard hijackers replacing wallet addresses, fake dApps requesting unlimited token approval allowances (ERC-20 permit exploit), and Telegram impersonation. Real projects will never initiate private DMs asking for seed phrases.',
 'Never type your seed phrase anywhere online, verify all URLs meticulously, and revoke unknown smart contract approvals.', 50, 6, 14),

-- 15. DeFi Basics
(15, 5, 'defi-basics', 'DeFi Basics (Decentralized Finance)',
 'Learn how smart contracts replace bankers, brokers, and escrow agents on open blockchains.',
 'Decentralized Finance (DeFi) is a collection of financial tools—like loans, interest-earning accounts, and trading desks—built with autonomous computer code (smart contracts) on blockchains like Ethereum. There are no corporate boardrooms, branches, or paperwork required.',
 'Traditional finance is like a bank with marble pillars, bankers, and paper applications that takes three business days to approve a loan. DeFi is like an automated bank run entirely by unbreakable vending machine software operating 24/7/365.',
 'DeFi protocols leverage composable smart contracts to create non-custodial automated protocols: Lending pools (e.g., Aave) relying on collateral ratios, AMMs (e.g., Uniswap) managing liquidity pools, and decentralized stablecoins (e.g., DAI) maintaining dollar pegs through collateralization.',
 'DeFi eliminates intermediary rent-seeking, but introduces smart contract code vulnerability risks.', 50, 6, 15);

-- ============================================================
-- SEED DATA: QUIZZES & QUESTIONS FOR LESSONS
-- ============================================================

INSERT INTO `quizzes` (`id`, `lesson_id`, `title`, `pass_score`, `xp_reward`) VALUES
(1, 1, 'Assessment: What Is Money?', 80, 75),
(2, 4, 'Assessment: Blockchain Fundamentals', 80, 75),
(3, 5, 'Assessment: Public & Private Keys', 80, 75),
(4, 13, 'Assessment: Risk Management & Sizing', 80, 75),
(5, 14, 'Assessment: Scam Defense & Safety', 80, 75);

INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question_text`, `explanation`, `sort_order`) VALUES
(1, 1, 'Which of the following is NOT one of the three classic economic functions of money?', 'The three classical economic functions of money are: Medium of Exchange, Store of Value, and Unit of Account. Guaranteed inflation is not a property of sound money.', 1),
(2, 1, 'What fundamentally gives any form of currency its purchasing power?', 'Money gains purchasing power through collective social agreement, scarcity, and trust that others will accept it in the future.', 2),
(3, 2, 'Why is a blockchain described as "tamper-evident" or "immutable"?', 'Because each block contains the cryptographic hash of the previous block; modifying historical data breaks the cryptographic link for all subsequent blocks.', 1),
(4, 3, 'If someone asks for your 12-word seed phrase or private key to "verify your account", what should you do?', 'NEVER share your private key or seed phrase under any circumstance. Legitimate administrators, support staff, and wallets will never ask for it.', 1),
(5, 4, 'If your total paper trading capital is $100,000 and you adhere to the 1% risk rule, what is the maximum dollar amount you should risk losing on a single trade?', '1% of $100,000 is $1,000. This is the maximum loss you should accept if your stop-loss is triggered.', 1);

INSERT INTO `quiz_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES
(1, 1, 'Medium of Exchange', 0),
(2, 1, 'Store of Value', 0),
(3, 1, 'Unit of Account', 0),
(4, 1, 'Guaranteed Annual Inflation', 1),

(5, 2, 'A government decree alone, regardless of debt', 0),
(6, 2, 'Mutual trust, scarcity, and acceptance by people', 1),
(7, 2, 'The physical weight of paper notes', 0),

(8, 3, 'It is saved on a USB drive in a bank vault', 0),
(9, 3, 'Each block is mathematically chained to the previous block\'s hash', 1),
(10, 3, 'A company CEO can edit erroneous entries', 0),

(11, 4, 'Provide it immediately to fix the issue', 0),
(12, 4, 'Refuse immediately and report the attempt as a phishing scam', 1),
(13, 4, 'Send half the words now and half later', 0),

(14, 5, '$10,000 (10%)', 0),
(15, 5, '$1,000 (1%)', 1),
(16, 5, '$50,000 (50%)', 0);

-- ============================================================
-- SEED DATA: GLOSSARY TERMS
-- ============================================================

INSERT INTO `glossary_terms` (`term`, `slug`, `category`, `simple_definition`, `technical_definition`, `example_usage`) VALUES
('Blockchain', 'blockchain', 'Architecture', 'A shared digital notebook copied across thousands of computers that cannot be easily erased or edited.', 'A distributed append-only ledger of cryptographically linked blocks verified through decentralized consensus.', 'Every Bitcoin transaction is permanently recorded onto the Bitcoin blockchain.'),
('Private Key', 'private-key', 'Security', 'The master secret password that allows you to authorize spending your cryptocurrency.', 'A 256-bit cryptographic secret generated randomly that creates mathematical digital signatures to spend funds.', 'Store your private key securely offline, because anyone with access can transfer your coins.'),
('Public Key', 'public-key', 'Security', 'Your public crypto account number that you can safely share with anyone to receive funds.', 'An asymmetric cryptographic key mathematically derived from a private key, typically hashed into a public wallet address.', 'You can copy your public key or address to send to a friend so they can transfer funds to you.'),
('Market Capitalization', 'market-cap', 'Economics', 'The total current value of all circulating coins of an asset combined.', 'Current unit spot price multiplied by circulating coin supply.', 'Bitcoin currently has the highest market capitalization in the crypto ecosystem.'),
('Relative Strength Index (RSI)', 'rsi', 'Analysis', 'A momentum score from 0 to 100 showing if an asset is running up too fast (overbought) or falling too hard (oversold).', 'An oscillator calculating smoothed moving average gain ratios over a specified lookback period (usually 14 periods).', 'The 4-hour chart showed an RSI of 78, signaling overbought conditions.'),
('Paper Trading', 'paper-trading', 'Trading', 'Simulated trading using virtual practice money to learn without risking real funds.', 'A risk-free market simulation where simulated order execution tracks live or historical market tick feeds.', 'CryptoVerse provides $100,000 in virtual capital for risk-free paper trading.');

-- ============================================================
-- SEED DATA: ACHIEVEMENTS & DAILY CHALLENGES
-- ============================================================

INSERT INTO `achievements` (`code`, `title`, `description`, `icon_name`, `xp_reward`) VALUES
('FIRST_STEPS', 'First Steps', 'Completed your very first educational lesson.', 'award', 100),
('BLOCKCHAIN_EXPLORER', 'Blockchain Explorer', 'Passed the Blockchain Fundamentals assessment with a score of 80% or higher.', 'shield-check', 150),
('SECURITY_SENTINEL', 'Security Sentinel', 'Mastered the anti-scam safety curriculum.', 'lock', 200),
('VIRTUAL_TRADER', 'Virtual Trader', 'Executed your first paper trade order with simulated funds.', 'trending-up', 150),
('PORTFOLIO_DIVERSIFIER', 'Prudent Allocator', 'Hold at least 3 distinct virtual crypto assets in your paper portfolio.', 'pie-chart', 200),
('SEVEN_DAY_STREAK', 'Consistent Learner', 'Maintained an unbroken 7-day study streak.', 'flame', 300);

INSERT INTO `challenges` (`title`, `description`, `xp_reward`, `type`, `target_count`, `is_active`) VALUES
('Daily Security Review', 'Read the daily anti-scam tip in the Security Center.', 50, 'SECURITY', 1, 1),
('Execute 1 Calculated Paper Trade', 'Practice order sizing on any listed crypto asset.', 75, 'TRADE', 1, 1),
('Complete 1 Lesson Assessment', 'Pass any quiz with a passing score to reinforce retention.', 100, 'QUIZ', 1, 1);
