# CryptoVerse — Educational Cryptocurrency & Blockchain Platform

CryptoVerse is an educational cryptocurrency and blockchain web platform designed for beginners and advanced learners. It combines guided curriculum, interactive 3D elements, live market discovery, and a risk-free $100,000 USD virtual paper trading simulator.

---

## 🏛️ Tech Stack

CryptoVerse is built using a lightweight, native web stack with no complex build steps required:

- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript. We utilize **Three.js** for engaging 3D scenes and **IntersectionObserver** APIs for smooth, high-performance scroll reveal animations. **Lucide Icons** are used for modern, scalable iconography.
- **Backend**: **PHP 8.0+**
- **Database**: **MySQL 8.0+**
- **Server Environment**: Designed optimally for **WAMP Server** (Windows), but fully compatible with LAMP or XAMPP stacks.

---

## 🚀 Quick Start & WAMP Server Deployment

Follow these instructions to get CryptoVerse running locally using WAMP server.

### 1. WAMP Installation & Setup
1. Download and install [WampServer](https://www.wampserver.com/en/).
2. Start WampServer. **Crucial:** Wait until the WAMP tray icon in your Windows taskbar turns **GREEN**. This indicates that both the Apache web server and the MySQL database server are running successfully. If it is orange or red, check for port conflicts (e.g., Skype or IIS using port 80).
3. Copy the entire `cryptoverse` project folder into your WAMP web root directory:
   - `C:\wamp64\www\cryptoverse`

### 2. Database Setup via phpMyAdmin
1. Open your browser and navigate to the WAMP phpMyAdmin interface:
   - `http://localhost/phpmyadmin`
2. Log in. (The default WAMP username is `root` with **no password**).
3. In the left sidebar or the "Databases" tab, create a new database named **`cryptoverse`** with the collation `utf8mb4_unicode_ci`.
4. Select the newly created `cryptoverse` database.
5. Click on the **Import** tab at the top.
6. Click **Choose File** and select the `database/schema.sql` file located in your `cryptoverse` project folder.
7. Click **Go** at the bottom of the page to run the import. This will build all the required tables and insert the seed data (lessons, quizzes, and demo accounts).

### 3. Launching the App
1. Once the database is imported, verify the database credentials in `config/database.php` (if you are using the default WAMP setup, no changes are needed).
2. Open your browser and navigate to:
   - `http://localhost/cryptoverse/`
3. You should see the CryptoVerse landing page!

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
├── .htaccess                 # Apache security headers & directory protection
├── index.php                 # Landing page
├── login.php                 # PHP secure authentication & session login
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
├── assets/                   # Static Frontend Assets
│   ├── css/                  # Vanilla CSS stylesheets
│   ├── images/               # Image assets
│   └── js/                   # Vanilla JavaScript & Three.js logic
│
├── config/                   # Configuration Files (Protected)
│   ├── config.php            # Global application settings & error handling
│   └── database.php          # PDO connection singleton
│
├── database/                 # Database Schemas & Migrations
│   └── schema.sql            # Full MySQL schema & curriculum seed data
│
└── includes/                 # Core Backend Modules
    ├── auth.php              # Authentication & session service
    ├── functions.php         # Utility functions
    └── header.php            # Global header template
```

---

## 🛡️ Security & Best Practices
- **Prepared Statements**: All database operations in PHP utilize PDO parameterized queries, preventing SQL injection.
- **Session Protection**: Sessions regenerate session IDs upon login to prevent session fixation.
- **Atomic Financial Transactions**: Trade executions utilize `PDO::beginTransaction()` and `commit()` to guarantee that cash deductions and asset quantities are updated atomically.
