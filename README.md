# CryptoVerse — Educational Cryptocurrency & Blockchain Platform

## 📖 Introduction

Welcome to **CryptoVerse**, a comprehensive educational platform built to demystify the complex world of cryptocurrency and blockchain technology. 

Designed for both absolute beginners and advanced learners, CryptoVerse provides a safe, interactive, and engaging environment to learn about digital assets without any financial risk. Whether you are looking to understand the fundamental mechanics of blockchain, learn how to analyze cryptocurrency markets, or practice trading with a virtual portfolio, this platform has everything you need.

Our mission is to bridge the knowledge gap in the Web3 space by combining guided theoretical lessons with hands-on, practical tools. By offering interactive cryptographic labs and a real-time simulated trading environment, we empower users to confidently navigate the decentralized economy.

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

## 🏛️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript. Built with **Three.js** for interactive 3D WebGL scenes, **IntersectionObserver** APIs for smooth scroll animations, **TradingView Lightweight Charts** for market visualization, and **Lucide Icons** for UI iconography. All frontend styles and scripts run natively in the browser without build tooling.
- **Backend**: **Node.js (v18+) & Express** with built-in SQLite (`node:sqlite`). Zero setup required — no external database server, Apache, or MySQL needed.

---

## ⚡ Quick Start

No external database installation required! The backend uses SQLite with all tables and seed curriculum automatically pre-loaded.

### 1. Install & Run
```bash
# Navigate to the project folder
cd CryptoVerse-WAMP_Version

# Install dependencies
npm install

# Start the server
npm start
```

### 2. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```
The database (`database/cryptoverse.db`) initializes automatically with all curriculum lessons, interactive quizzes, glossary terms, and the pre-configured demo account.

---

## 🔑 Demo User Credentials

After initialization, the following demo student account is ready to use for testing:
- **Email**: `student@cryptoverse.edu`
- **Password**: `password123`
- **Starting Virtual Balance**: `$100,000.00 USD` (Paper Trading)

---

## 📂 Project Directory Structure

```text
CryptoVerse-WAMP_Version/
├── server.js                 # Node.js Express server & unified API routes
├── db.js                     # Built-in SQLite database layer & auto-seeder
├── views/                    # Express modular view templates
│   ├── header.js             # Shared responsive navigation & header
│   ├── landing.js            # Interactive 3D landing page view
│   ├── login.js              # Authentication login view
│   ├── signup.js             # User registration view
│   ├── dashboard.js          # User command center & learning progress
│   ├── learn.js              # Interactive curriculum hub
│   ├── lesson.js             # Lesson viewer & interactive quiz engine
│   ├── markets.js            # Live market discovery & analytics
│   ├── practice.js           # $100k Virtual paper trading desk
│   └── profile.js            # Account settings & trade export
├── services/
│   └── newsService.js        # Live RSS crypto news aggregator
├── assets/                   # Static frontend assets
│   ├── css/                  # Vanilla CSS stylesheets
│   ├── images/               # Image assets
│   └── js/                   # Vanilla JavaScript, Three.js & charts
├── database/
│   ├── cryptoverse.db        # SQLite database (auto-seeded)
│   └── schema.sql            # Seed curriculum and table blueprints
├── metadata.json             # Project metadata
├── package.json              # Dependencies and start scripts
└── README.md                 # Project documentation
```

---

## 🛡️ Security & Best Practices
- **Prepared Statements**: All database operations utilize SQLite prepared statements with parameter binding to prevent SQL injection.
- **Session Protection**: HttpOnly session cookies with secure session secret management.
- **Password Security**: Strong password hashing using `bcryptjs`.
- **Atomic Financial Transactions**: Trade executions utilize SQLite transaction safeguards to ensure consistency for cash balance and asset quantities.
