-- ============================================================
-- CryptoVerse — Database Schema & Seed Data 
-- Target Database: MySQL 8.0+
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


-- ============================================================
-- SEED DATA: QUIZZES AND QUESTIONS
-- ============================================================

INSERT INTO `quizzes` (`id`, `lesson_id`, `title`, `pass_score`, `xp_reward`) VALUES
(1, 1, 'Assessment: What Is Money?', 80, 75),
(2, 2, 'Assessment: What Is Cryptocurrency?', 80, 75),
(3, 3, 'Assessment: What Is Bitcoin?', 80, 75),
(4, 4, 'Assessment: What Is Blockchain?', 80, 75),
(5, 5, 'Assessment: Public vs Private Keys', 80, 75),
(6, 6, 'Assessment: What Is a Crypto Wallet?', 80, 75),
(7, 7, 'Assessment: What Is an Exchange?', 80, 75),
(8, 8, 'Assessment: Market Cap Explained', 80, 75),
(9, 9, 'Assessment: Understanding Price and Volume', 80, 75),
(10, 10, 'Assessment: Reading Candlestick Charts', 80, 75),
(11, 11, 'Assessment: Support and Resistance', 80, 75),
(12, 12, 'Assessment: RSI Explained (Relative Strength Index)', 80, 75),
(13, 13, 'Assessment: Risk Management & Capital Preservation', 80, 75),
(14, 14, 'Assessment: Crypto Scams & Protection', 80, 75),
(15, 15, 'Assessment: DeFi Basics (Decentralized Finance)', 80, 75),
(16, 16, 'Assessment: Reading Market Graphs & Trading', 80, 75);

INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question_text`, `explanation`, `sort_order`) VALUES
(1, 1, 'Which of the following is NOT one of the three classic economic functions of money?', 'Please refer to the lesson content to review this topic.', 1),
(2, 1, 'What fundamentally gives any form of currency its purchasing power?', 'Please refer to the lesson content to review this topic.', 2),
(3, 1, 'What is commodity money?', 'Please refer to the lesson content to review this topic.', 3),
(4, 1, 'What does "fiat" mean in the context of fiat currency?', 'Please refer to the lesson content to review this topic.', 4),
(5, 1, 'Why is portability an important characteristic of money?', 'Please refer to the lesson content to review this topic.', 5),
(6, 2, 'What is the primary difference between a traditional bank ledger and a cryptocurrency blockchain?', 'Please refer to the lesson content to review this topic.', 1),
(7, 2, 'What problem does cryptocurrency solve that digital money in a bank doesn''t?', 'Please refer to the lesson content to review this topic.', 2),
(8, 2, 'Which technology ensures that cryptocurrency transactions cannot be forged?', 'Please refer to the lesson content to review this topic.', 3),
(9, 2, 'What is a consensus mechanism?', 'Please refer to the lesson content to review this topic.', 4),
(10, 2, 'Why is cryptocurrency considered censorship-resistant?', 'Please refer to the lesson content to review this topic.', 5),
(11, 3, 'Who is the pseudonymous creator of Bitcoin?', 'Please refer to the lesson content to review this topic.', 1),
(12, 3, 'What is the maximum supply of Bitcoin that will ever exist?', 'Please refer to the lesson content to review this topic.', 2),
(13, 3, 'What is the "Double-Spending" problem that Bitcoin solved?', 'Please refer to the lesson content to review this topic.', 3),
(14, 3, 'How often does the Bitcoin block reward halve?', 'Please refer to the lesson content to review this topic.', 4),
(15, 3, 'What consensus mechanism does Bitcoin use?', 'Please refer to the lesson content to review this topic.', 5),
(16, 4, 'Why is a blockchain described as "tamper-evident" or "immutable"?', 'Please refer to the lesson content to review this topic.', 1),
(17, 4, 'What is a "block" in a blockchain?', 'Please refer to the lesson content to review this topic.', 2),
(18, 4, 'What happens if someone tries to alter a transaction in a past block?', 'Please refer to the lesson content to review this topic.', 3),
(19, 4, 'Who keeps a copy of the blockchain ledger?', 'Please refer to the lesson content to review this topic.', 4),
(20, 4, 'What is a "hash" in the context of blockchain?', 'Please refer to the lesson content to review this topic.', 5),
(21, 5, 'If someone asks for your 12-word seed phrase to "verify your account", what should you do?', 'Please refer to the lesson content to review this topic.', 1),
(22, 5, 'What is a Public Key analogous to in traditional finance?', 'Please refer to the lesson content to review this topic.', 2),
(23, 5, 'What is a Private Key analogous to?', 'Please refer to the lesson content to review this topic.', 3),
(24, 5, 'Can you derive a private key from a public key?', 'Please refer to the lesson content to review this topic.', 4),
(25, 5, 'What happens if you lose your private key and your seed phrase?', 'Please refer to the lesson content to review this topic.', 5),
(26, 6, 'Does a cryptocurrency wallet actually store your digital coins?', 'Please refer to the lesson content to review this topic.', 1),
(27, 6, 'What is a "Hot Wallet"?', 'Please refer to the lesson content to review this topic.', 2),
(28, 6, 'What is a "Cold Wallet" (Hardware Wallet)?', 'Please refer to the lesson content to review this topic.', 3),
(29, 6, 'What is a seed phrase (recovery phrase)?', 'Please refer to the lesson content to review this topic.', 4),
(30, 6, 'Why use a hardware wallet over a mobile app for large amounts?', 'Please refer to the lesson content to review this topic.', 5),
(31, 7, 'What is a Centralized Exchange (CEX)?', 'Please refer to the lesson content to review this topic.', 1),
(32, 7, 'What does "Not your keys, not your coins" mean?', 'Please refer to the lesson content to review this topic.', 2),
(33, 7, 'What is a Decentralized Exchange (DEX)?', 'Please refer to the lesson content to review this topic.', 3),
(34, 7, 'How does a DEX typically determine the price of an asset?', 'Please refer to the lesson content to review this topic.', 4),
(35, 7, 'Which is a major risk of using a Decentralized Exchange (DEX)?', 'Please refer to the lesson content to review this topic.', 5),
(36, 8, 'If your total paper trading capital is $100,000 and you adhere to the 1% risk rule, what is the maximum dollar amount you should risk losing on a single trade?', 'Please refer to the lesson content to review this topic.', 1),
(37, 8, 'How is Market Capitalization calculated in crypto?', 'Please refer to the lesson content to review this topic.', 2),
(38, 8, 'Why is judging a coin by its low unit price (e.g., $0.0001) a trap for beginners?', 'Please refer to the lesson content to review this topic.', 3),
(39, 8, 'What does Fully Diluted Valuation (FDV) represent?', 'Please refer to the lesson content to review this topic.', 4),
(40, 8, 'If Coin A has a price of $10 and supply of 1 Million, and Coin B has a price of $1 and supply of 100 Million, which has the larger Market Cap?', 'Please refer to the lesson content to review this topic.', 5),
(41, 9, 'What does "Volume" refer to in cryptocurrency trading?', 'Please refer to the lesson content to review this topic.', 1),
(42, 9, 'Why is high trading volume considered a confirmation signal?', 'Please refer to the lesson content to review this topic.', 2),
(43, 9, 'What does a sharp price increase on very LOW trading volume often indicate?', 'Please refer to the lesson content to review this topic.', 3),
(44, 9, 'How do traders use the relationship between price and volume?', 'Please refer to the lesson content to review this topic.', 4),
(45, 9, 'What is a "bull trap"?', 'Please refer to the lesson content to review this topic.', 5),
(46, 10, 'What four data points does a single Japanese Candlestick represent?', 'Please refer to the lesson content to review this topic.', 1),
(47, 10, 'What does a GREEN (or white) candlestick indicate?', 'Please refer to the lesson content to review this topic.', 2),
(48, 10, 'What do the thin lines (wicks or shadows) on the top and bottom of a candlestick represent?', 'Please refer to the lesson content to review this topic.', 3),
(49, 10, 'What does a long UPPER wick generally indicate about market sentiment?', 'Please refer to the lesson content to review this topic.', 4),
(50, 10, 'If the Open and Close prices are almost exactly the same (creating a cross or plus-sign shape), what is this pattern called?', 'Please refer to the lesson content to review this topic.', 5),
(51, 11, 'What is a "Support" level in technical analysis?', 'Please refer to the lesson content to review this topic.', 1),
(52, 11, 'What is a "Resistance" level?', 'Please refer to the lesson content to review this topic.', 2),
(53, 11, 'What often happens when a strong Resistance level is finally broken with high volume?', 'Please refer to the lesson content to review this topic.', 3),
(54, 11, 'Why do support and resistance levels work?', 'Please refer to the lesson content to review this topic.', 4),
(55, 11, 'How should a trader view a support or resistance line?', 'Please refer to the lesson content to review this topic.', 5),
(56, 12, 'What does RSI stand for?', 'Please refer to the lesson content to review this topic.', 1),
(57, 12, 'What is the standard scale range for the RSI oscillator?', 'Please refer to the lesson content to review this topic.', 2),
(58, 12, 'Generally, an RSI reading above 70 suggests the asset is:', 'Please refer to the lesson content to review this topic.', 3),
(59, 12, 'What is a "Bullish Divergence" on the RSI?', 'Please refer to the lesson content to review this topic.', 4),
(60, 12, 'Should you enter a trade based SOLELY on the RSI crossing 30 or 70?', 'Please refer to the lesson content to review this topic.', 5),
(61, 13, 'What is the "1% Rule" in risk management?', 'Please refer to the lesson content to review this topic.', 1),
(62, 13, 'What is a Stop-Loss order?', 'Please refer to the lesson content to review this topic.', 2),
(63, 13, 'If you have $10,000 in capital and follow the 1% rule, what is your maximum acceptable risk per trade?', 'Please refer to the lesson content to review this topic.', 3),
(64, 13, 'Why is capital preservation considered the most important rule in trading?', 'Please refer to the lesson content to review this topic.', 4),
(65, 13, 'What does Risk/Reward Ratio (RR) mean?', 'Please refer to the lesson content to review this topic.', 5),
(66, 14, 'If a random person messages you on Telegram or Discord offering "Guaranteed 10x Returns" or "Customer Support", what is the most likely scenario?', 'Please refer to the lesson content to review this topic.', 1),
(67, 14, 'What is a "Phishing" scam?', 'Please refer to the lesson content to review this topic.', 2),
(68, 14, 'What should you do before clicking a link to a crypto exchange or DeFi protocol?', 'Please refer to the lesson content to review this topic.', 3),
(69, 14, 'What is a "Rug Pull"?', 'Please refer to the lesson content to review this topic.', 4),
(70, 14, 'Can a cryptocurrency transaction be reversed if you send funds to a scammer?', 'Please refer to the lesson content to review this topic.', 5),
(71, 15, 'What does DeFi stand for?', 'Please refer to the lesson content to review this topic.', 1),
(72, 15, 'What technology allows DeFi protocols to operate without human employees?', 'Please refer to the lesson content to review this topic.', 2),
(73, 15, 'What is a Smart Contract?', 'Please refer to the lesson content to review this topic.', 3),
(74, 15, 'How do decentralized lending platforms (like Aave) ensure loans are repaid without credit checks?', 'Please refer to the lesson content to review this topic.', 4),
(75, 15, 'What is a Liquidity Pool in an Automated Market Maker (AMM)?', 'Please refer to the lesson content to review this topic.', 5),
(76, 16, 'What does "Confluence" mean in trading?', 'Please refer to the lesson content to review this topic.', 1),
(77, 16, 'If an asset approaches a major Support zone, prints a Bullish Engulfing candle, and shows RSI Oversold divergence, this is an example of:', 'Please refer to the lesson content to review this topic.', 2),
(78, 16, 'Why shouldn''t you take a trade based on a single indicator (like RSI crossing 30)?', 'Please refer to the lesson content to review this topic.', 3),
(79, 16, 'What separates a professional trader from a gambler?', 'Please refer to the lesson content to review this topic.', 4),
(80, 16, 'If your analysis provides a high-confluence entry trigger, what is the mandatory next step before executing the trade?', 'Please refer to the lesson content to review this topic.', 5);

INSERT INTO `quiz_options` (`id`, `question_id`, `option_text`, `is_correct`) VALUES
(1, 1, 'Guaranteed Annual Inflation', 1),
(2, 1, 'Unit of Account', 0),
(3, 1, 'Store of Value', 0),
(4, 1, 'Medium of Exchange', 0),
(5, 2, 'Mutual trust, scarcity, and collective acceptance', 1),
(6, 2, 'A government decree alone', 0),
(7, 2, 'The banks that print it', 0),
(8, 2, 'The physical weight of the coins', 0),
(9, 3, 'Money that has intrinsic value like gold or silver', 1),
(10, 3, 'Digital tokens on a blockchain', 0),
(11, 3, 'Credit issued by a central bank', 0),
(12, 3, 'Paper money backed by a government', 0),
(13, 4, 'Issued by a private corporation', 0),
(14, 4, 'By decree or order of the government', 1),
(15, 4, 'Backed by physical gold reserves', 0),
(16, 4, 'Mathematically scarce and decentralized', 0),
(17, 5, 'So it requires a bank vault to store safely', 0),
(18, 5, 'So it cannot be easily divided', 0),
(19, 5, 'So it can be easily transported and exchanged across distances', 1),
(20, 5, 'So it can be consumed as food during emergencies', 0),
(21, 6, 'Traditional banks do not use ledgers', 0),
(22, 6, 'A blockchain can only handle physical transactions', 0),
(23, 6, 'Blockchains are decentralized and secured by cryptography across a global network', 1),
(24, 6, 'Cryptocurrencies require a physical vault to store coins', 0),
(25, 7, 'The ability to send money quickly', 0),
(26, 7, 'The ability to use a credit card', 0),
(27, 7, 'The need for an internet connection', 0),
(28, 7, 'The need to trust a centralized third party not to manipulate the ledger', 1),
(29, 8, 'Anti-virus software installed on the node', 0),
(30, 8, 'Asymmetric cryptography and digital signatures', 1),
(31, 8, 'A central server authenticating passwords', 0),
(32, 8, 'Firewalls built into the wallet app', 0),
(33, 9, 'A mathematical protocol for a decentralized network to agree on the true state of the ledger', 1),
(34, 9, 'A server that processes transactions centrally', 0),
(35, 9, 'A voting system for the board of directors of a crypto company', 0),
(36, 9, 'A legal contract signed by users', 0),
(37, 10, 'No central authority can block a valid transaction or freeze an account', 1),
(38, 10, 'It is backed by physical gold', 0),
(39, 10, 'It does not require an internet connection', 0),
(40, 10, 'It hides your IP address from the government', 0),
(41, 11, 'Hal Finney', 0),
(42, 11, 'Vitalik Buterin', 0),
(43, 11, 'Satoshi Nakamoto', 1),
(44, 11, 'Elon Musk', 0),
(45, 12, '21 billion', 0),
(46, 12, '21 million', 1),
(47, 12, 'An infinite amount', 0),
(48, 12, '100 million', 0),
(49, 13, 'Preventing a user from spending the same digital token twice without a central authority', 1),
(50, 13, 'Preventing banks from printing too much money', 0),
(51, 13, 'Preventing inflation caused by lost passwords', 0),
(52, 13, 'Preventing merchants from charging a customer twice', 0),
(53, 14, 'Every time a new country adopts it', 0),
(54, 14, 'Every 10 years', 0),
(55, 14, 'Roughly every 4 years (210,000 blocks)', 1),
(56, 14, 'Every year on January 1st', 0),
(57, 15, 'Proof of Work (PoW)', 1),
(58, 15, 'Delegated Proof of Stake (DPoS)', 0),
(59, 15, 'Proof of Authority (PoA)', 0),
(60, 15, 'Proof of Stake (PoS)', 0),
(61, 16, 'Each block contains the cryptographic hash of the previous block, chaining them together mathematically', 1),
(62, 16, 'It is encrypted with military-grade passwords', 0),
(63, 16, 'It is saved on a USB drive in a secure bank vault', 0),
(64, 16, 'A company CEO cannot edit erroneous entries without a board vote', 0),
(65, 17, 'A batch of validated transactions grouped together and cryptographically sealed', 1),
(66, 17, 'A password used to access a wallet', 0),
(67, 17, 'A firewall rule that prevents hackers', 0),
(68, 17, 'A physical piece of hardware used to mine crypto', 0),
(69, 18, 'The hash of that block changes, breaking the cryptographic link to all subsequent blocks', 1),
(70, 18, 'Nothing, past transactions can be easily edited', 0),
(71, 18, 'The network charges them a higher fee', 0),
(72, 18, 'The central server sends an error message', 0),
(73, 19, 'Thousands of independent nodes (computers) distributed globally', 1),
(74, 19, 'The creator of the cryptocurrency', 0),
(75, 19, 'A central server located in Switzerland', 0),
(76, 19, 'Only the users who are currently sending money', 0),
(77, 20, 'A type of password you need to remember', 0),
(78, 20, 'A fee paid to miners', 0),
(79, 20, 'A unique, fixed-length string of characters generated from data using a mathematical function', 1),
(80, 20, 'A physical token used for security', 0),
(81, 21, 'Change your password first, then send it', 0),
(82, 21, 'Provide it so they can fix your account issue', 0),
(83, 21, 'Refuse immediately; never share your seed phrase with anyone', 1),
(84, 21, 'Send half the words now and half later', 0),
(85, 22, 'Your social security number', 0),
(86, 22, 'Your online banking password', 0),
(87, 22, 'Your debit card PIN', 0),
(88, 22, 'Your bank account number or email address', 1),
(89, 23, 'Your email address', 0),
(90, 23, 'The master key or PIN that authorizes spending from your account', 1),
(91, 23, 'Your public username', 0),
(92, 23, 'Your home mailing address', 0),
(93, 24, 'No, unless you pay a fee', 0),
(94, 24, 'Yes, if you have a fast enough commercial computer', 0),
(95, 24, 'Yes, but only if you contact the developer', 0),
(96, 24, 'No, the mathematical trapdoor function is practically impossible to reverse', 1),
(97, 25, 'You can reset it by clicking "Forgot Password"', 0),
(98, 25, 'You can call customer support to restore it', 0),
(99, 25, 'The network will automatically refund you after 30 days', 0),
(100, 25, 'You lose access to your funds forever; they cannot be recovered', 1),
(101, 26, 'No, coins always live on the blockchain; a wallet simply stores the keys to access them', 1),
(102, 26, 'Yes, the coins are downloaded into the wallet file', 0),
(103, 26, 'No, the coins are stored on the exchange''s server', 0),
(104, 26, 'Yes, but only if it is a hardware wallet', 0),
(105, 27, 'A wallet that requires a physical button press to sign transactions', 0),
(106, 27, 'A wallet that holds highly volatile tokens', 0),
(107, 27, 'A physical device stored in a fireproof safe', 0),
(108, 27, 'A software wallet that is connected to the internet (e.g., mobile app or browser extension)', 1),
(109, 28, 'An air-gapped physical device that keeps private keys completely isolated from internet malware', 1),
(110, 28, 'A mobile app used for daily spending', 0),
(111, 28, 'A wallet that has been frozen due to suspicious activity', 0),
(112, 28, 'An account on a centralized exchange', 0),
(113, 29, 'A password you use to log into a website', 0),
(114, 29, 'A phrase you must chant to send a transaction', 0),
(115, 29, 'A hint you set in case you forget your PIN', 0),
(116, 29, 'A human-readable list of words (usually 12 or 24) that mathematically represents your private master key', 1),
(117, 30, 'Hardware wallets earn you more interest', 0),
(118, 30, 'Hardware wallets process transactions faster', 0),
(119, 30, 'Hardware wallets keep keys offline, protecting them from hackers and computer viruses', 1),
(120, 30, 'Hardware wallets charge lower network fees', 0),
(121, 31, 'An automated smart contract on the blockchain', 0),
(122, 31, 'A corporate intermediary that takes custody of your funds and matches buyers and sellers internally', 1),
(123, 31, 'A hardware wallet provider', 0),
(124, 31, 'A peer-to-peer network of anonymous users', 0),
(125, 32, 'You must encrypt your coins to claim ownership', 0),
(126, 32, 'If you don''t memorize your keys, they are invalid', 0),
(127, 32, 'If you leave funds on a custodial exchange, you rely entirely on their solvency and honesty; you don''t truly own the crypto', 1),
(128, 32, 'If you lose your physical house keys, you can''t access your hardware wallet', 0),
(129, 33, 'An exchange that requires intense identity verification (KYC)', 0),
(130, 33, 'A traditional company located in multiple countries', 0),
(131, 33, 'An automated smart contract protocol (like Uniswap) that executes non-custodial swaps directly on-chain', 1),
(132, 33, 'A mobile app that only trades Bitcoin', 0),
(133, 34, 'By having a CEO set the daily price', 0),
(134, 34, 'By asking users to vote on the price', 0),
(135, 34, 'By checking the price on Wall Street', 0),
(136, 34, 'Using an Automated Market Maker (AMM) mathematical formula based on the ratio of tokens in a liquidity pool', 1),
(137, 35, 'You have to trust the exchange''s bank reserves', 0),
(138, 35, 'The CEO might run away with your funds', 0),
(139, 35, 'Your account might get frozen by customer support', 0),
(140, 35, 'Smart contract vulnerabilities or bugs could be exploited by hackers', 1),
(141, 36, '$10,000 (10%)', 0),
(142, 36, '$50,000 (50%)', 0),
(143, 36, '$1,000 (1%)', 1),
(144, 36, '$100 (0.1%)', 0),
(145, 37, 'Trading Volume × Current Price', 0),
(146, 37, 'Total Supply + Trading Volume', 0),
(147, 37, 'Current Unit Price ÷ Maximum Supply', 0),
(148, 37, 'Current Unit Price × Circulating Supply', 1),
(149, 38, 'Because a low unit price might simply mean the circulating supply is artificially massive, not that the coin is "cheap" or has room to grow', 1),
(150, 38, 'Because cheap coins always go to zero', 0),
(151, 38, 'Because you cannot buy whole units of cheap coins', 0),
(152, 38, 'Because high-priced coins are the only ones that go up', 0),
(153, 39, 'The market cap if the maximum total supply of tokens were in circulation at the current price', 1),
(154, 39, 'The minimum price the coin will ever reach', 0),
(155, 39, 'The total amount of money invested by venture capitalists', 0),
(156, 39, 'The daily trading volume divided by market cap', 0),
(157, 40, 'Coin B (Market Cap: $100 Million)', 1),
(158, 40, 'They are exactly the same', 0),
(159, 40, 'Coin A (Market Cap: $10 Million)', 0),
(160, 40, 'You cannot calculate it with this information', 0),
(161, 41, 'The loudness of the news surrounding a coin', 0),
(162, 41, 'The physical size of the blockchain ledger', 0),
(163, 41, 'The total dollar amount or number of coins traded over a specific timeframe', 1),
(164, 41, 'The total supply of the cryptocurrency', 0),
(165, 42, 'It indicates the coin is about to be delisted', 0),
(166, 42, 'It proves there is significant market participation and conviction behind a price movement', 1),
(167, 42, 'It means the exchange is taking lower fees', 0),
(168, 42, 'It guarantees the price will continue to go up', 0),
(169, 43, 'A lack of true liquidity and conviction; the move might be a trap or easily reversed', 1),
(170, 43, 'The coin has reached its maximum supply', 0),
(171, 43, 'A massive institutional buyer is entering the market', 0),
(172, 43, 'A highly secure and stable market environment', 0),
(173, 44, 'Price tells you where the market went; volume tells you how much force was behind the move', 1),
(174, 44, 'Volume dictates the exact future price', 0),
(175, 44, 'Price and volume are identical metrics', 0),
(176, 44, 'Traders ignore volume and only look at price', 0),
(177, 45, 'A strategy where investors hold forever', 0),
(178, 45, 'A physical safe used to store Bitcoin', 0),
(179, 45, 'A false signal where price breaks upward on low volume, tricking buyers before reversing downward', 1),
(180, 45, 'When a market slowly increases over 10 years', 0),
(181, 46, 'Open, High, Low, and Close (OHLC)', 1),
(182, 46, 'Open, Hash, Ledger, and Close', 0),
(183, 46, 'Oscillator, High, Low, and Consolidation', 0),
(184, 46, 'Overbought, High, Low, and Crossed', 0),
(185, 47, 'The coin was just listed on an exchange', 0),
(186, 47, 'The Closing price was lower than the Opening price (sellers won)', 0),
(187, 47, 'The market had zero trading volume', 0),
(188, 47, 'The Closing price was higher than the Opening price (buyers won)', 1),
(189, 48, 'The trading fees paid to miners', 0),
(190, 48, 'The estimated future price', 0),
(191, 48, 'The highest and lowest prices reached during that time period', 1),
(192, 48, 'The average price over a 24 hour period', 0),
(193, 49, 'Buyers completely dominated the session with no resistance', 0),
(194, 49, 'The price is guaranteed to go up in the next session', 0),
(195, 49, 'The exchange went offline during the session', 0),
(196, 49, 'Buyers pushed the price up, but sellers aggressively rejected it and pushed it back down', 1),
(197, 50, 'A Doji (indicating market indecision)', 1),
(198, 50, 'A Bull Flag', 0),
(199, 50, 'An Engulfing Candle', 0),
(200, 50, 'A Hammer', 0),
(201, 51, 'A historical price floor where buyers tend to step in and prevent the price from falling further', 1),
(202, 51, 'A ceiling where sellers force the price down', 0),
(203, 51, 'A guaranteed price that a central bank defends', 0),
(204, 51, 'The highest price an asset has ever reached', 0),
(205, 52, 'A floor where buyers constantly buy the asset', 0),
(206, 52, 'The lowest point on a candlestick wick', 0),
(207, 52, 'The fee paid to execute a trade', 0),
(208, 52, 'A historical price ceiling where sellers tend to emerge and block the price from rising further', 1),
(209, 53, 'The asset price immediately crashes to zero', 0),
(210, 53, 'Polarity flips, and the old resistance often becomes a new support level', 1),
(211, 53, 'The support level moves higher than the current price', 0),
(212, 53, 'The exchange stops trading the asset', 0),
(213, 54, 'Because miners refuse to process blocks outside these levels', 0),
(214, 54, 'Because they are legally enforced by the blockchain code', 0),
(215, 54, 'They only work on Centralized Exchanges', 0),
(216, 54, 'They act as psychological zones where traders remember past price action and place clusters of limit orders', 1),
(217, 55, 'As an irrelevant line on the chart', 0),
(218, 55, 'As a guarantee of future profits', 0),
(219, 55, 'As a flexible "zone" or area of interest, not an exact to-the-penny laser beam', 1),
(220, 55, 'As a completely unbreakable wall', 0),
(221, 56, 'Random Sentiment Indicator', 0),
(222, 56, 'Rapid Scalping Instrument', 0),
(223, 56, 'Relative Strength Index', 1),
(224, 56, 'Real-time Supply Index', 0),
(225, 57, '0 to 100', 1),
(226, 57, '1 to 10', 0),
(227, 57, '0 to 1,000', 0),
(228, 57, '-100 to +100', 0),
(229, 58, 'Oversold (a great time to buy)', 0),
(230, 58, 'Delisted', 0),
(231, 58, 'Consolidating (moving sideways)', 0),
(232, 58, 'Overbought (potentially overextended and due for a pullback)', 1),
(233, 59, 'When the price makes a Higher High and RSI makes a Higher High', 0),
(234, 59, 'When the price makes a Lower Low, but the RSI makes a Higher Low (indicating weakening downside momentum)', 1),
(235, 59, 'When the RSI stays exactly at 50 for a week', 0),
(236, 59, 'When the price and RSI both go straight up', 0),
(237, 60, 'Yes, but only on 1-minute charts', 0),
(238, 60, 'No, RSI is only used for traditional stocks, not crypto', 0),
(239, 60, 'Yes, it works 100% of the time', 0),
(240, 60, 'No, RSI is a momentum gauge and should be combined with other factors like support/resistance and volume', 1),
(241, 61, 'Never risk losing more than 1% of your total trading capital on a single trade if your stop-loss is hit', 1),
(242, 61, 'Only buy coins that go up 1% a day', 0),
(243, 61, 'Only trade 1% of the days in a month', 0),
(244, 61, 'Aim for exactly 1% profit on every trade', 0),
(245, 62, 'An order that guarantees you never lose any money', 0),
(246, 62, 'A predefined order that automatically exits your position if the price falls to a certain level, capping your loss', 1),
(247, 62, 'A command that stops the blockchain from producing blocks', 0),
(248, 62, 'A request to the exchange to refund your deposit', 0),
(249, 63, '$1', 0),
(250, 63, '$100', 1),
(251, 63, '$10', 0),
(252, 63, '$1,000', 0),
(253, 64, 'Because exchanges charge fees based on your total balance', 0),
(254, 64, 'Because the government requires it', 0),
(255, 64, 'Because it guarantees a 100% win rate', 0),
(256, 64, 'Because if you lose all your capital, you are out of the game and cannot take advantage of future opportunities', 1),
(257, 65, 'The ratio of winning trades to losing trades over a year', 0),
(258, 65, 'The difference between your account balance and your margin debt', 0),
(259, 65, 'The amount of money you risk losing compared to the amount of profit you aim to make on a trade', 1),
(260, 65, 'The probability that a trade will be successful', 0),
(261, 66, 'It is a scam; legitimate support teams never DM you first and there are no guaranteed returns in crypto', 1),
(262, 66, 'It is a networking opportunity with a VIP trader', 0),
(263, 66, 'It is an official airdrop program', 0),
(264, 66, 'It is a legitimate support agent trying to help you', 0),
(265, 67, 'A fake website or email designed to look identical to a real platform to steal your passwords or seed phrase', 1),
(266, 67, 'A legitimate strategy to catch early token launches', 0),
(267, 67, 'A virus that physically damages your hardware wallet', 0),
(268, 67, 'A tax levied by decentralized exchanges', 0),
(269, 68, 'Double-check the URL for exact spelling and bookmark the official sites to avoid malicious clones', 1),
(270, 68, 'Enter your seed phrase to verify the site is real', 0),
(271, 68, 'Click it immediately if it was sent by a friend', 0),
(272, 68, 'Disable your antivirus software', 0),
(273, 69, 'When a major exchange upgrades its servers', 0),
(274, 69, 'When the developers of a project abandon it and steal all the liquidity/funds invested by users', 1),
(275, 69, 'When a transaction is reversed by a bank', 0),
(276, 69, 'When a carpet is sold on a blockchain marketplace', 0),
(277, 70, 'Yes, if you report it to the police within 24 hours', 0),
(278, 70, 'No, blockchain transactions are immutable and irreversible without a central authority', 1),
(279, 70, 'Yes, you can call the blockchain customer support hotline', 0),
(280, 70, 'Yes, the funds will automatically bounce back in 7 days', 0),
(281, 71, 'Dynamic Encryption Finality', 0),
(282, 71, 'Decentralized Finance', 1),
(283, 71, 'Distributed Exchange Funds Index', 0),
(284, 71, 'Digital Economy Fiat Integration', 0),
(285, 72, 'AI Customer Support Chatbots', 0),
(286, 72, 'Centralized databases in Switzerland', 0),
(287, 72, 'Smart Contracts (autonomous code executing on a blockchain)', 1),
(288, 72, 'Off-shore banking laws', 0),
(289, 73, 'A legally binding paper contract signed by a lawyer', 0),
(290, 73, 'An agreement between a miner and an exchange', 0),
(291, 73, 'Self-executing computer code living on the blockchain that automatically enforces the terms of an agreement', 1),
(292, 73, 'A password used to encrypt a wallet', 0),
(293, 74, 'By tracking users'' social security numbers', 0),
(294, 74, 'By hiring decentralized debt collectors', 0),
(295, 74, 'By relying on the honor system', 0),
(296, 74, 'By requiring users to over-collateralize their loans with other crypto assets locked in a smart contract', 1),
(297, 75, 'A pool of water used to cool down mining computers', 0),
(298, 75, 'A traditional order book managed by a broker', 0),
(299, 75, 'A crowdsourced pool of tokens locked in a smart contract that facilitates decentralized trading', 1),
(300, 75, 'A reserve of fiat currency held in a bank vault', 0),
(301, 76, 'When the market is entirely sideways with zero volume', 0),
(302, 76, 'When a chart looks like a river flowing downwards', 0),
(303, 76, 'When multiple different technical indicators and price action signals all point to the same conclusion, increasing probability', 1),
(304, 76, 'When buyers and sellers completely disagree on price', 0),
(305, 77, 'A guaranteed 100% win rate trade', 0),
(306, 77, 'A signal to immediately short sell the asset', 0),
(307, 77, 'A bearish breakdown pattern', 0),
(308, 77, 'High-probability confluence suggesting a potential long (buy) setup', 1),
(309, 78, 'Because only volume matters', 0),
(310, 78, 'Because indicators are delayed by 24 hours', 0),
(311, 78, 'Because single indicators fail often; trading requires building a probabilistic case with multiple aligning clues', 1),
(312, 78, 'Because RSI is illegal to use in cryptocurrency', 0),
(313, 79, 'Following a strict mechanical system, relying on confluence, and rigorously managing risk', 1),
(314, 79, 'Always going "all in" on gut feelings', 0),
(315, 79, 'Trading 100 times a day to maximize action', 0),
(316, 79, 'Never using stop losses because they trust their instinct', 0),
(317, 80, 'Move your coins to a centralized exchange', 0),
(318, 80, 'Post the trade on social media to build hype', 0),
(319, 80, 'Determine exactly where your invalidation level (stop-loss) is and calculate position size according to risk rules', 1),
(320, 80, 'Borrow money to maximize your potential returns', 0);


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
