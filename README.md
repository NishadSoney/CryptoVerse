# CryptoVerse — Educational Cryptocurrency & Blockchain Platform (WAMP Version)

> [!NOTE]
> This is the **WAMP Version** of CryptoVerse, pre-configured for local running and deployment using WAMP Server (Windows, Apache, MySQL, PHP).

## 📖 Introduction

Welcome to **CryptoVerse**, a comprehensive educational platform built to demystify the complex world of cryptocurrency and blockchain technology. 

Designed for both absolute beginners and advanced learners, CryptoVerse provides a safe, interactive, and engaging environment to learn about digital assets without any financial risk. Whether you are looking to understand the fundamental mechanics of blockchain, learn how to analyze cryptocurrency markets, or practice trading with a virtual portfolio, this platform has everything you need.

Our mission is to bridge the knowledge gap in the Web3 space by combining guided theoretical lessons with hands-on, practical tools. By offering interactive cryptographic labs and a real-time simulated trading environment, we empower users to confidently navigate the decentralized economy.
## 💡 Core Features & Innovations

### 1. Interactive 3D Blockchain Protocol Labs
- **Live Cryptographic Hashing**: Visual playground using browser-native `crypto.subtle` SHA-256 hashing. Watch hashes update instantly character-by-character.
- **Blockchain Linkage & Tamper Simulator**: Chain 3 sequential blocks together. Mutate Block #1 and observe the cryptographic chain break in real-time as subsequent block hashes become invalid.
- **Asymmetric Cryptography Lab**: Generate public/private key pairs and digitally sign transactions to understand how non-custodial ownership works.

### 2. Guided 15-Lesson Dual-Mode Curriculum
- Dual explanations: **Simple (Plain English)** for newcomers and **Technical (Protocol Specs)** for developers.
- Knowledge check quizzes with instant grading, XP rewards, and level progression.
- Personal study notes synchronized per lesson.

### 3. Market Discovery with Plain-English Translations
- **Anti-Unit-Bias Guidance**: Explains why token price alone does not reflect true valuation, emphasizing Market Capitalization.
- **Simple vs. Advanced Toggle**: View plain-English fundamentals or flip to technical volume, high/low spread, and consensus metrics.

### 4. Risk-Free $100,000 Paper Trading Simulator
- Execute simulated **BUY** and **SELL** orders with live portfolio balance and holdings valuation.
- **1% Golden Rule Risk Calculator**: Calculates optimal position sizing given an entry and stop-loss level, preventing catastrophic drawdown.
- Transaction history audit ledger and 1-click sandbox reset.

---

## 🏛️ Tech Stack

CryptoVerse supports both a modern standalone Node.js backend (recommended, zero-config) and the legacy WAMP stack:

- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript. Built with **Three.js** for interactive 3D WebGL scenes, **IntersectionObserver** APIs for smooth scroll animations, **TradingView Lightweight Charts** for market visualization, and **Lucide Icons** for UI iconography. All frontend styles and scripts run natively in the browser without build tooling.
- **Modern Backend (Active)**: **Node.js (v18+) & Express** with built-in SQLite (`node:sqlite`). Zero setup required — no external database server, no Apache, no WAMP needed.
- **Legacy Backend (Optional)**: **PHP 8.0+** & **MySQL 8.0+** on Apache (WAMP/LAMP/XAMPP).

---

## ⚡ Quick Start (Modern Standalone — Recommended)

No Apache, WAMP, or MySQL installation required! The modern backend uses SQLite with all 20 tables and seed curriculum automatically pre-loaded.

### 1. Install & Run
```bash
# Clone or navigate to the project folder
cd CryptoVerse-WAMP_Version

# Install dependencies (Express, bcryptjs, session, etc.)
npm install

# Start the server
npm start
```

### 2. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```
That's it! The database (`database/cryptoverse.db`) initializes automatically with all 16 curriculum lessons, interactive quizzes, glossary terms, and the pre-configured demo account.

---

## 🚀 Alternative: WAMP Server Deployment (Legacy PHP)

If you prefer running with traditional WAMP Server (Windows, Apache, MySQL, PHP):

### 1. WAMP Installation & Setup
1. Download and install [WampServer](https://www.wampserver.com/en/).
2. Start WampServer. Ensure the WAMP tray icon in your Windows taskbar turns **GREEN**.
3. Copy the entire `cryptoverse` project folder into your WAMP web root directory:
   - `C:\wamp64\www\cryptoverse`

### 2. Database Setup via phpMyAdmin
1. Open your browser and navigate to:
   - `http://localhost/phpmyadmin`
2. Log in (default username: `root`, no password).
3. Create a new database named **`cryptoverse`** with collation `utf8mb4_unicode_ci`.
4. Import `database/schema.sql` into the `cryptoverse` database.

### 3. Launching via WAMP
Navigate to:
```
http://localhost/cryptoverse/
```

---

## 🔑 Demo User Credentials

After database installation, the following demo student account is ready to use for testing:
- **Email**: `student@cryptoverse.edu`
- **Password**: `password123`
- **Starting Virtual Balance**: `$100,000.00 USD` (Paper Trading)

---

## 📂 Project Directory Structure

```text
cryptoverse/
├── server.js                 # Modern Node.js Express server & API routes
├── db.js                     # Built-in SQLite database layer & auto-seeder
├── views/                    # Express view templates (exact replica of PHP markup)
├── services/                 # Backend services (live RSS news aggregator)
│
├── .htaccess                 # Apache security headers & directory protection (legacy)
├── index.php                 # Landing page (PHP legacy)
├── login.php                 # PHP authentication & login
├── signup.php                # PHP user registration
├── logout.php                # Session termination handler
├── dashboard.php             # Unified user command center & stats
├── learn.php                 # Interactive curriculum hub & progress
├── lesson.php                # Individual lesson viewer & quiz engine
├── markets.php               # Live market discovery & dual-mode analytics
├── practice.php              # $100k Virtual paper trading desk
├── profile.php               # User settings and profile management
│
├── api/                      # RESTful PHP Endpoints
│   ├── news.php              # Fetches cryptocurrency news
│   ├── notes.php             # Personal student notes persistence
│   ├── quiz_submit.php       # Quiz submission & XP reward engine
│   ├── trade_execute.php     # Atomic paper trading order execution
│   └── wallet_reset.php      # Virtual wallet balance reset ($100k)
│
├── assets/                   # Static Frontend Assets (100% UNTOUCHED & SHARED)
│   ├── css/                  # Vanilla CSS stylesheets
│   ├── images/               # Image assets
│   └── js/                   # Vanilla JavaScript, Three.js & TradingView logic
│
├── config/                   # Configuration Files (Protected)
│   ├── config.php            # Global application settings & error handling
│   └── database.php          # PDO connection singleton
│
├── database/                 # Database Schemas & Migrations
│   ├── cryptoverse.db        # SQLite database (auto-created for Node server)
│   └── schema.sql            # Full MySQL schema & curriculum seed data
│
└── includes/                 # Core Backend Modules (PHP legacy)
    ├── auth.php              # Authentication & session service
    ├── functions.php         # Utility functions
    └── header.php            # Global header template
```

---

## 🛡️ Security & Best Practices
- **Prepared Statements**: All database operations in PHP utilize PDO parameterized queries, preventing SQL injection.
- **Session Protection**: Sessions regenerate session IDs upon login to prevent session fixation.
- **Atomic Financial Transactions**: Trade executions utilize `PDO::beginTransaction()` and `commit()` to guarantee that cash deductions and asset quantities are updated atomically.
