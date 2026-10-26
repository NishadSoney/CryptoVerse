# CryptoVerse — Learn Crypto & Blockchain Without Financial Risk

CryptoVerse is a web platform designed to make cryptocurrency and blockchain concepts accessible, visual, and risk-free. It pairs dual-track theoretical curriculum (plain English fundamentals alongside protocol specifications) with interactive cryptographic protocol labs and provides a real-time $100,000 paper trading balance to simulate the trading environment.

---

## Features

### 1. Interactive Protocol Labs
- **SHA-256 Playground**: Real-time cryptographic hashing powered by browser-native `crypto.subtle`.
- **Blockchain Tamper Simulator**: Multi-block chain demonstrating hash linkages, block headers, and Avalanche cascade invalidation upon data mutation.
- **Key Pairs & Digital Signatures**: Public/private key generation and message signing demonstrations.

### 2. Dual-Track Curriculum & Quizzes
- 16 guided lessons spanning monetary history, cryptographic primitives, smart contracts, market mechanics, and risk management.
- Dual explanations: simplified plain English for beginners and protocol specs for developers.
- Built-in quiz engine with instant scoring, XP tracking, and personal study notes.

### 3. Market Discovery & Analytics
- Live Binance ticker and orderbook streaming.
- Anti-unit-bias explanations emphasizing circulating supply and market capitalization over raw unit price.
- Live crypto news aggregator via decentralized RSS feeds.

### 4. Paper Trading Sandbox
- $100,000 virtual USD starting balance for practicing spot market orders.
- Portfolio allocation breakdowns, real-time PnL tracking, and transaction history ledger.
- Exportable audit trail and 1-click sandbox reset.

---

## Tech Stack

- **Backend**: Node.js, Express, `node:sqlite` (SQLite3 with WAL mode), `express-session`, `bcryptjs`
- **Frontend**: Vanilla JavaScript (ES6+), Three.js (WebGL visualizations), TradingView Lightweight Charts, Lucide Icons, Vanilla CSS
- **Database**: Embedded SQLite with automatic seeding — no external DB services or configurations needed.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)

### Setup & Run
```bash
# Clone and enter the repository
cd CryptoVerse-WAMP_Version

# Install dependencies
npm install

# Start the development server
npm start
```

Visit `http://localhost:3000` in your browser.

### Demo Account
A seeded student account is pre-configured for instant testing:
- **Email**: `student@cryptoverse.edu`
- **Password**: `password123`
- **Starting Virtual Balance**: `$100,000.00`

---

## Project Structure

```text
├── server.js                 # Express application entry & middleware pipeline
├── db.js                     # SQLite connection & database seeder
├── middleware/
│   └── auth.js               # Route protection (requireAuth, requireGuest)
├── routes/
│   ├── auth.js               # Authentication (login, signup, logout)
│   ├── pages.js              # View routes (dashboard, learn, practice, profile)
│   └── api.js                # REST endpoints (trading, quizzes, notes, news)
├── services/
│   ├── newsService.js        # RSS crypto news aggregation & caching
│   ├── marketPrices.js       # Live asset price reference
│   └── userService.js        # User profile & progress data fetching
├── views/                    # Server-rendered HTML templates
├── assets/                   # Static styles, 3D scenes, charts, and scripts
├── database/
│   ├── cryptoverse.db        # SQLite database file
│   └── seed.sql              # Clean SQLite schema & curriculum seed data
├── .env.example              # Environment variable template
├── package.json
└── README.md
```

---

## Architecture & Security
- **Parameterized SQL**: All database operations use SQLite prepared statements with parameter binding to prevent SQL injection.
- **Session Security**: HttpOnly session cookies with strict SameSite policies.
- **Password Hashing**: `bcryptjs` with salt work factor of 10.
- **Atomic Transactions**: Trading executions run inside SQLite transactions (`BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK`) to guarantee cash deductions and asset balances remain synchronized.
