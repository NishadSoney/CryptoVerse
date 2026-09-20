# CryptoVerse — Educational Cryptocurrency & Blockchain Platform

CryptoVerse is an educational cryptocurrency and blockchain web platform designed for beginners and advanced learners. It combines guided visual curriculum, interactive 3D blockchain protocol laboratories, live market discovery with plain-English metric translations, and a risk-free $100,000 USD virtual paper trading simulator.

---

## 🏛️ Architecture Overview

The system is built on a **Decoupled Hybrid Architecture**:
1. **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, and Motion for interactive reactive UI, real-time client-side cryptography labs (using the browser's native `window.crypto.subtle` API for SHA-256 hashing), and interactive charts.
2. **Backend**: PHP 8.0+ / MySQL 8.0+ optimized for **WAMP Server**, **LAMP**, or **XAMPP**, utilizing PDO prepared statements, atomic transactions (`PDO::beginTransaction`), session management, and password hashing (`PASSWORD_ARGON2ID` / `BCRYPT`).

---

## 🚀 Quick Start & WAMP Server Deployment

### Method A: 1-Click Web Installer (Recommended)
1. Copy the project folder to your WAMP server's web root:
   - Windows (WAMP): `C:\wamp64\www\cryptoverse`
   - Windows (XAMPP): `C:\xampp\htdocs\cryptoverse`
   - Linux (LAMP): `/var/www/html/cryptoverse`
2. Start WAMP/Apache and MySQL services.
3. Open your browser and navigate to:
   ```
   http://localhost/cryptoverse/install.php
   ```
4. Enter your MySQL database credentials (default WAMP user is `root` with no password).
5. Click **"Run Database Setup & Seed Data"**. The installer will automatically create the `cryptoverse` database, execute all table migrations, and seed all 15 lessons, quizzes, and demo accounts.
6. Done! Navigate to `http://localhost/cryptoverse/login.php` or `http://localhost/cryptoverse/index.html`.

### Method B: Manual Database Import
1. Open phpMyAdmin (`http://localhost/phpmyadmin`).
2. Create a new database named `cryptoverse` with collation `utf8mb4_unicode_ci`.
3. Select the `cryptoverse` database, click **Import**, and choose `database/schema.sql`.
4. Click **Go** to run all migrations and seeds.
5. Verify database connection credentials in `config/database.php`.

---

## 🔑 Demo User Credentials

After database installation, the following demo student account is ready to use:
- **Email**: `student@cryptoverse.edu`
- **Password**: `password123`
- **Starting Virtual Balance**: `$100,000.00 USD` (Paper Trading)

---

## 📂 Project Directory Structure

```
cryptoverse/
├── .htaccess                 # Apache security headers & directory protection
├── install.php               # 1-Click web installer for MySQL
├── index.html                # Frontend application entry point
├── login.php                 # PHP secure authentication & session login
├── register.php              # PHP user registration with Argon2id hashing
├── logout.php                # Session termination handler
├── dashboard.php             # Unified user command center & stats
├── learn.php                 # Interactive curriculum hub & progress
├── lesson.php                # Individual lesson viewer & quiz engine
├── markets.php               # Live market discovery & dual-mode analytics
├── practice.php              # $100k Virtual paper trading desk
│
├── api/                      # RESTful PHP Endpoints
│   ├── auth_login.php        # JSON API login handler
│   ├── auth_register.php     # JSON API registration handler
│   ├── quiz_submit.php       # Quiz submission & XP reward engine
│   ├── notes.php             # Personal student notes persistence
│   ├── trade_execute.php     # Atomic paper trading order execution
│   └── wallet_reset.php      # Virtual wallet balance reset ($100k)
│
├── config/                   # Configuration Files (Protected)
│   ├── config.php            # Global application settings & error handling
│   └── database.php          # PDO connection singleton
│
├── database/                 # Database Schemas & Migrations
│   └── schema.sql            # Full MySQL schema & curriculum seed data
│
├── includes/                 # Core Backend Modules
│   └── auth.php              # Authentication & session service
│
├── src/                      # React 19 Frontend Source
│   ├── components/           # UI components (LessonVisualizer, Navbar, etc.)
│   ├── context/              # Auth & state management (AuthContext.tsx)
│   ├── data/                 # Local curriculum & market data (db.ts)
│   ├── views/                # Views (LearnView, MarketsView, PracticeView)
│   ├── types.ts              # TypeScript interface definitions
│   └── App.tsx               # Main application container
│
└── package.json              # Frontend npm dependencies & build scripts
```

---

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

## 🛡️ Security & Best Practices
- **Prepared Statements**: All database operations in PHP utilize PDO parameterized queries, preventing SQL injection.
- **Session Protection**: Sessions are configured with `HttpOnly`, `SameSite=Lax`, and regenerate session IDs upon login to prevent session fixation.
- **Atomic Financial Transactions**: Trade executions utilize `PDO::beginTransaction()` and `commit()` to guarantee that cash deductions and asset quantities are updated atomically.
- **Clean Fallbacks**: The frontend SPA can run completely standalone in modern web environments, persisting state via `localStorage` when PHP is not actively mounted.
