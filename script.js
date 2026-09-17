/* ==========================================================================
   TRADEGEN — Next-Gen Trading. Smarter Decisions.
   Professional Stock Trading Simulator
   Frontend-Only: Vanilla HTML5, CSS3, & JavaScript (ES6+)
   Data Persistence: LocalStorage (Safe backward compatibility with TradeX)
   ========================================================================== */

/* ==========================================================================
   SECTION 1: CONSTANTS & CONFIGURATION
   ========================================================================== */

// LocalStorage key for accounts (retaining backward compatibility with existing users)
const STORAGE_KEY = "tradex_accounts_v3";
const SETTINGS_KEY = "tradegen_settings_v1";
const ALERTS_KEY = "tradegen_alerts_v1";
const NOTIFS_KEY = "tradegen_notifs_v1";

// Default starting cash balance for new simulated accounts
const STARTING_BALANCE = 100000;

// Simulated stock market equities database
const STOCK_DATA = [
    {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 228.35,
        sector: "Consumer Tech",
        volume: 58240000,
        dayHigh: 231.20,
        dayLow: 226.40
    },
    {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        price: 505.12,
        sector: "Cloud & AI",
        volume: 24190000,
        dayHigh: 509.80,
        dayLow: 502.10
    },
    {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        price: 186.74,
        sector: "Search & Advertising",
        volume: 32610000,
        dayHigh: 188.50,
        dayLow: 185.10
    },
    {
        symbol: "AMZN",
        name: "Amazon.com Inc.",
        price: 231.42,
        sector: "E-Commerce & AWS",
        volume: 41800000,
        dayHigh: 234.00,
        dayLow: 229.10
    },
    {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        price: 178.26,
        sector: "Semiconductors & AI",
        volume: 79540000,
        dayHigh: 181.90,
        dayLow: 175.40
    },
    {
        symbol: "TSLA",
        name: "Tesla Inc.",
        price: 342.17,
        sector: "Automotive & Energy",
        volume: 64200000,
        dayHigh: 348.50,
        dayLow: 336.80
    },
    {
        symbol: "META",
        name: "Meta Platforms",
        price: 765.45,
        sector: "Social Media",
        volume: 18450000,
        dayHigh: 772.00,
        dayLow: 758.20
    },
    {
        symbol: "NFLX",
        name: "Netflix Inc.",
        price: 1248.21,
        sector: "Streaming & Media",
        volume: 11200000,
        dayHigh: 1258.00,
        dayLow: 1236.50
    },
    {
        symbol: "JPM",
        name: "JPMorgan Chase & Co.",
        price: 302.91,
        sector: "Financial Services",
        volume: 15320000,
        dayHigh: 305.40,
        dayLow: 300.20
    },
    {
        symbol: "AMD",
        name: "Advanced Micro Devices",
        price: 164.33,
        sector: "Semiconductors",
        volume: 48900000,
        dayHigh: 167.20,
        dayLow: 162.00
    },
    {
        symbol: "INTC",
        name: "Intel Corporation",
        price: 36.82,
        sector: "Semiconductors",
        volume: 51200000,
        dayHigh: 37.60,
        dayLow: 36.10
    },
    {
        symbol: "COST",
        name: "Costco Wholesale",
        price: 985.21,
        sector: "Consumer Staples",
        volume: 8700000,
        dayHigh: 991.00,
        dayLow: 978.40
    }
];

// Fictional benchmark traders for the simulated leaderboard
const SIMULATED_TRADERS = [
    { name: "Alex Morgan", username: "alex_m", balance: 142850.00, returnPct: 42.85, trades: 64 },
    { name: "Ryan Vance", username: "ryan_trader", balance: 128400.00, returnPct: 28.40, trades: 49 },
    { name: "Maya Chen", username: "maya_alpha", balance: 119750.00, returnPct: 19.75, trades: 38 },
    { name: "Arjun Patel", username: "arjun_p", balance: 112300.00, returnPct: 12.30, trades: 27 },
    { name: "Sarah Jenkins", username: "sarah_j", balance: 105100.00, returnPct: 5.10, trades: 14 }
];

// Trader achievement definitions with criteria
const ACHIEVEMENTS_LIST = [
    {
        id: "first_trade",
        name: "First Step",
        desc: "Execute your first simulated trade",
        icon: "🌱",
        check: (user) => (user.portfolio.transactions || []).length >= 1,
        progress: (user) => Math.min(1, (user.portfolio.transactions || []).length)
    },
    {
        id: "trades_10",
        name: "Active Trader",
        desc: "Complete 10 simulated trades",
        icon: "⚡",
        check: (user) => (user.portfolio.transactions || []).length >= 10,
        progress: (user) => Math.min(10, (user.portfolio.transactions || []).length) / 10
    },
    {
        id: "trades_25",
        name: "Seasoned Trader",
        desc: "Complete 25 simulated trades",
        icon: "💼",
        check: (user) => (user.portfolio.transactions || []).length >= 25,
        progress: (user) => Math.min(25, (user.portfolio.transactions || []).length) / 25
    },
    {
        id: "trades_50",
        name: "Market Veteran",
        desc: "Complete 50 simulated trades",
        icon: "🏆",
        check: (user) => (user.portfolio.transactions || []).length >= 50,
        progress: (user) => Math.min(50, (user.portfolio.transactions || []).length) / 50
    },
    {
        id: "first_profit",
        name: "In The Green",
        desc: "Close a sell trade with a positive realized profit",
        icon: "🟢",
        check: (user) => (user.portfolio.transactions || []).some(t => t.type === "SELL" && t.realizedProfit > 0),
        progress: (user) => (user.portfolio.transactions || []).some(t => t.type === "SELL" && t.realizedProfit > 0) ? 1 : 0
    },
    {
        id: "profit_1k",
        name: "$1K Profit Club",
        desc: "Realize over $1,000 in total net trading profit",
        icon: "💰",
        check: (user, app) => app.calcRealizedProfit(user) >= 1000,
        progress: (user, app) => Math.min(1, Math.max(0, app.calcRealizedProfit(user) / 1000))
    },
    {
        id: "profit_5k",
        name: "$5K High Roller",
        desc: "Realize over $5,000 in total net trading profit",
        icon: "👑",
        check: (user, app) => app.calcRealizedProfit(user) >= 5000,
        progress: (user, app) => Math.min(1, Math.max(0, app.calcRealizedProfit(user) / 5000))
    },
    {
        id: "portfolio_3",
        name: "Portfolio Builder",
        desc: "Hold shares of 3 different stocks simultaneously",
        icon: "📊",
        check: (user) => Object.keys(user.portfolio.holdings || {}).length >= 3,
        progress: (user) => Math.min(3, Object.keys(user.portfolio.holdings || {}).length) / 3
    },
    {
        id: "portfolio_5",
        name: "Diversification Master",
        desc: "Hold shares of 5 different stocks simultaneously",
        icon: "🌐",
        check: (user) => Object.keys(user.portfolio.holdings || {}).length >= 5,
        progress: (user) => Math.min(5, Object.keys(user.portfolio.holdings || {}).length) / 5
    },
    {
        id: "watchlist_master",
        name: "Watchlist Master",
        desc: "Track 5 or more stocks in your watchlist",
        icon: "⭐",
        check: (user) => (user.watchlist || []).length >= 5,
        progress: (user) => Math.min(5, (user.watchlist || []).length) / 5
    }
];


/* ==========================================================================
   SECTION 2: DATA MODELS (STOCK, TRANSACTION, PORTFOLIO, USER)
   ========================================================================== */

/**
 * Represents a simulated stock equity with price momentum and historical ticks
 */
class Stock {
    constructor(data) {
        this.symbol = data.symbol;
        this.name = data.name;
        this.price = data.price;
        this.previousPrice = data.price;
        this.change = 0;
        this.sector = data.sector || "Equities";
        this.volume = data.volume || 1000000;
        this.dayHigh = data.dayHigh || data.price * 1.01;
        this.dayLow = data.dayLow || data.price * 0.99;

        // Initialize price sparkline history
        this.history = [];
        const base = data.price;
        for (let i = 20; i >= 0; i--) {
            const noise = (Math.random() - 0.5) * (base * 0.015);
            this.history.push(+(base + noise).toFixed(2));
        }
        this.history.push(this.price);
    }

    /**
     * Updates simulated stock price using realistic micro-movements
     */
    updatePrice() {
        this.previousPrice = this.price;

        // Gentle volatility factor (-0.6% to +0.6%) with realistic momentum
        const volatility = (Math.random() - 0.49) * 0.012;
        const newPrice = +(this.price * (1 + volatility)).toFixed(2);

        // Keep price positive and realistic
        this.price = Math.max(1.00, newPrice);

        // Calculate % change relative to previous tick
        this.change = +(((this.price - this.previousPrice) / this.previousPrice) * 100).toFixed(2);

        // Update day high & low
        if (this.price > this.dayHigh) this.dayHigh = this.price;
        if (this.price < this.dayLow) this.dayLow = this.price;

        // Realistic simulated volume increment
        const volumeDelta = Math.floor(Math.random() * 15000) + 1000;
        this.volume += volumeDelta;

        // Append to sparkline history
        this.history.push(this.price);
        if (this.history.length > 30) {
            this.history.shift();
        }
    }
}

/**
 * Represents an individual executed order transaction
 */
class Transaction {
    constructor(symbol, type, quantity, price, realizedProfit = 0) {
        this.id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
        this.symbol = symbol;
        this.type = type; // "BUY" or "SELL"
        this.quantity = quantity;
        this.price = price;
        this.total = +(quantity * price).toFixed(2);
        this.realizedProfit = +realizedProfit.toFixed(2);
        this.date = new Date().toISOString();
    }
}

/**
 * Manages user cash balance, holdings, transactions, and historical value
 */
class Portfolio {
    constructor(data = {}) {
        this.cash = data.cash ?? STARTING_BALANCE;
        this.initialCash = data.initialCash ?? STARTING_BALANCE;
        this.holdings = data.holdings ?? {};
        this.transactions = data.transactions ?? [];
        this.history = data.history ?? [];

        // Ensure history has at least initial starting cash point
        if (!this.history.length) {
            this.history.push({
                date: new Date().toISOString(),
                value: this.cash
            });
        }
    }

    buy(stock, quantity) {
        quantity = Math.floor(Number(quantity));

        if (isNaN(quantity) || quantity <= 0) {
            throw new Error("Quantity must be a positive whole number.");
        }

        const total = +(stock.price * quantity).toFixed(2);

        if (total > this.cash) {
            throw new Error(`Insufficient cash. Required: $${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}, Available: $${this.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`);
        }

        this.cash = +(this.cash - total).toFixed(2);

        if (!this.holdings[stock.symbol]) {
            this.holdings[stock.symbol] = {
                quantity: 0,
                averagePrice: 0
            };
        }

        const holding = this.holdings[stock.symbol];
        const oldCost = holding.quantity * holding.averagePrice;
        const newCost = quantity * stock.price;

        holding.quantity += quantity;
        holding.averagePrice = +((oldCost + newCost) / holding.quantity).toFixed(2);

        const transaction = new Transaction(stock.symbol, "BUY", quantity, stock.price, 0);
        this.transactions.unshift(transaction);

        return transaction;
    }

    sell(stock, quantity) {
        quantity = Math.floor(Number(quantity));

        if (isNaN(quantity) || quantity <= 0) {
            throw new Error("Quantity must be a positive whole number.");
        }

        const holding = this.holdings[stock.symbol];

        if (!holding || holding.quantity < quantity) {
            const owned = holding ? holding.quantity : 0;
            throw new Error(`Insufficient shares. You own ${owned} shares of ${stock.symbol}.`);
        }

        const proceeds = +(stock.price * quantity).toFixed(2);
        const costBasis = +(holding.averagePrice * quantity).toFixed(2);
        const realizedProfit = +(proceeds - costBasis).toFixed(2);

        this.cash = +(this.cash + proceeds).toFixed(2);
        holding.quantity -= quantity;

        if (holding.quantity === 0) {
            delete this.holdings[stock.symbol];
        }

        const transaction = new Transaction(stock.symbol, "SELL", quantity, stock.price, realizedProfit);
        this.transactions.unshift(transaction);

        return transaction;
    }

    getInvestedValue(market) {
        return Object.entries(this.holdings).reduce((total, [symbol, holding]) => {
            const stock = market[symbol];
            if (!stock) return total;
            return total + (holding.quantity * stock.price);
        }, 0);
    }

    getTotalValue(market) {
        return +(this.cash + this.getInvestedValue(market)).toFixed(2);
    }

    getProfit(market) {
        return +(this.getTotalValue(market) - this.initialCash).toFixed(2);
    }

    recordHistory(market) {
        const val = this.getTotalValue(market);
        this.history.push({
            date: new Date().toISOString(),
            value: val
        });

        // Retain last 80 historical snapshot points
        if (this.history.length > 80) {
            this.history.shift();
        }
    }
}

/**
 * User account model
 */
class User {
    constructor(data) {
        this.id = data.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
        this.fullName = data.fullName;
        this.username = data.username;
        this.email = data.email;
        this.passwordHash = data.passwordHash;
        this.portfolio = new Portfolio(data.portfolio);
        this.watchlist = data.watchlist || ["AAPL", "NVDA", "TSLA"];
        this.unlockedAchievements = data.unlockedAchievements || [];
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    serialize() {
        return {
            id: this.id,
            fullName: this.fullName,
            username: this.username,
            email: this.email,
            passwordHash: this.passwordHash,
            portfolio: this.portfolio,
            watchlist: this.watchlist,
            unlockedAchievements: this.unlockedAchievements,
            createdAt: this.createdAt
        };
    }
}


/* ==========================================================================
   SECTION 3: AUTHENTICATION & LOCAL STORAGE MANAGER
   ========================================================================== */

class AuthManager {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return { users: {}, currentUser: null };
            }
            const parsed = JSON.parse(raw);
            return {
                users: parsed.users || {},
                currentUser: parsed.currentUser || null
            };
        } catch (err) {
            console.error("Failed to load user data from LocalStorage:", err);
            return { users: {}, currentUser: null };
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (err) {
            console.error("Failed to save user data to LocalStorage:", err);
        }
    }

    async hashPassword(password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hash = await crypto.subtle.digest("SHA-256", data);
            return Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, "0"))
                .join("");
        } catch (e) {
            // Simple fallback hash for compatibility
            let hash = 0;
            for (let i = 0; i < password.length; i++) {
                hash = ((hash << 5) - hash) + password.charCodeAt(i);
                hash |= 0;
            }
            return String(hash);
        }
    }

    usernameExists(username) {
        return !!this.data.users[username.toLowerCase()];
    }

    emailExists(email) {
        return Object.values(this.data.users).some(
            u => u.email && u.email.toLowerCase() === email.toLowerCase()
        );
    }

    async register(fullName, username, email, password) {
        username = username.trim();
        email = email.trim();

        if (fullName.trim().length < 2) {
            throw new Error("Enter a valid full name.");
        }
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            throw new Error("Username must contain 3–20 letters, numbers, or underscores.");
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            throw new Error("Enter a valid email address.");
        }
        if (password.length < 6) {
            throw new Error("Password must contain at least 6 characters.");
        }
        if (this.usernameExists(username)) {
            throw new Error("Username already exists.");
        }
        if (this.emailExists(email)) {
            throw new Error("Email address already in use.");
        }

        const passwordHash = await this.hashPassword(password);
        const user = new User({
            fullName: fullName.trim(),
            username: username,
            email: email,
            passwordHash: passwordHash
        });

        this.data.users[username.toLowerCase()] = user.serialize();
        this.data.currentUser = username.toLowerCase();
        this.save();

        return user;
    }

    async login(identity, password) {
        const key = identity.trim().toLowerCase();
        let userData = this.data.users[key];

        if (!userData) {
            userData = Object.values(this.data.users).find(
                u => u.email && u.email.toLowerCase() === key
            );
        }

        if (!userData) {
            throw new Error("Account not found. Please create an account.");
        }

        const hash = await this.hashPassword(password);
        if (hash !== userData.passwordHash) {
            throw new Error("Incorrect password. Please try again.");
        }

        this.data.currentUser = userData.username.toLowerCase();
        this.save();

        return new User(userData);
    }

    getCurrentUser() {
        const key = this.data.currentUser;
        if (!key) return null;
        const userData = this.data.users[key];
        if (!userData) return null;
        return new User(userData);
    }

    saveUser(user) {
        if (!user) return;
        this.data.users[user.username.toLowerCase()] = user.serialize();
        this.save();
    }

    logout() {
        this.data.currentUser = null;
        this.save();
    }
}


/* ==========================================================================
   SECTION 4: SOUND EFFECTS SYNTHESIZER (WEB AUDIO API)
   ========================================================================== */

class SoundEffects {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx && typeof AudioContext !== "undefined") {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                this.ctx = null;
            }
        }
    }

    playSuccess() {
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {}
    }

    playAlert() {
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = "triangle";
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.1); // E5

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            osc.start(now);
            osc.stop(now + 0.3);
        } catch (e) {}
    }
}


/* ==========================================================================
   SECTION 5: MAIN TRADING APPLICATION CONTROLLER
   ========================================================================== */

class TradingApp {
    constructor() {
        this.auth = new AuthManager();
        this.sound = new SoundEffects();
        this.user = null;

        // Market equities state map
        this.market = {};
        STOCK_DATA.forEach(data => {
            this.market[data.symbol] = new Stock(data);
        });

        // App state variables
        this.selectedStock = null;
        this.tradeType = "BUY";
        this.currentMarketFilter = "all";
        this.currentMarketView = "grid"; // "grid" or "table"
        this.currentOrdersFilter = "ALL";
        this.currentOrdersSort = "newest";
        this.currentWatchlistSort = "symbol";
        this.currentChartRange = "all";

        // Load persisted price alerts & notifications
        this.alerts = this.loadAlerts();
        this.notifications = this.loadNotifications();
        this.settings = this.loadSettings();

        // Initialize DOM and bindings
        this.cacheDOM();
        this.applySettings();
        this.bindEvents();
        this.checkAuthentication();
    }

    /* --- DOM Elements Caching --- */
    cacheDOM() {
        this.authScreen = document.getElementById("authScreen");
        this.appScreen = document.getElementById("appScreen");
        this.loginForm = document.getElementById("loginForm");
        this.registerForm = document.getElementById("registerForm");
        this.toast = document.getElementById("toast");

        // Modals
        this.tradeModal = document.getElementById("tradeModal");
        this.stockDetailsModal = document.getElementById("stockDetailsModal");
        this.priceAlertModal = document.getElementById("priceAlertModal");
        this.notifModal = document.getElementById("notifModal");
        this.settingsModal = document.getElementById("settingsModal");
        this.confirmModal = document.getElementById("confirmModal");

        // Sidebar & Navigation
        this.sidebar = document.getElementById("appSidebar");
        this.sidebarBackdrop = document.getElementById("sidebarBackdrop");
        this.mobileMenuBtn = document.getElementById("mobileMenuBtn");
        this.sidebarCloseBtn = document.getElementById("sidebarCloseBtn");

        // Search & Notifs
        this.globalSearchInput = document.getElementById("globalSearchInput");
        this.searchSuggestions = document.getElementById("searchSuggestions");
        this.notifBellBtn = document.getElementById("notifBellBtn");
        this.notifBadge = document.getElementById("notifBadge");
    }

    /* --- Settings & Persistence Helpers --- */
    loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? JSON.parse(raw) : { compact: false, animations: true, sounds: true };
        } catch (e) {
            return { compact: false, animations: true, sounds: true };
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
        } catch (e) {}
    }

    applySettings() {
        if (this.settings.compact) {
            document.body.classList.add("compact");
        } else {
            document.body.classList.remove("compact");
        }

        const compactCheckbox = document.getElementById("settingCompact");
        const animCheckbox = document.getElementById("settingAnimations");
        const soundCheckbox = document.getElementById("settingSounds");

        if (compactCheckbox) compactCheckbox.checked = !!this.settings.compact;
        if (animCheckbox) animCheckbox.checked = this.settings.animations !== false;
        if (soundCheckbox) soundCheckbox.checked = this.settings.sounds !== false;
    }

    loadAlerts() {
        try {
            const raw = localStorage.getItem(ALERTS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    saveAlerts() {
        try {
            localStorage.setItem(ALERTS_KEY, JSON.stringify(this.alerts));
        } catch (e) {}
    }

    loadNotifications() {
        try {
            const raw = localStorage.getItem(NOTIFS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    saveNotifications() {
        try {
            localStorage.setItem(NOTIFS_KEY, JSON.stringify(this.notifications));
        } catch (e) {}
    }

    addNotification(title, message, icon = "🔔") {
        const notif = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
            title,
            message,
            icon,
            date: new Date().toISOString(),
            read: false
        };
        this.notifications.unshift(notif);
        if (this.notifications.length > 50) this.notifications.pop();
        this.saveNotifications();
        this.updateNotifBadge();
    }

    updateNotifBadge() {
        const unread = this.notifications.filter(n => !n.read).length;
        if (this.notifBadge) {
            if (unread > 0) {
                this.notifBadge.textContent = unread > 9 ? "9+" : unread;
                this.notifBadge.classList.remove("hidden");
            } else {
                this.notifBadge.classList.add("hidden");
            }
        }
        const notifHeaderCount = document.getElementById("notifHeaderCount");
        if (notifHeaderCount) {
            notifHeaderCount.textContent = `${unread} unread`;
        }
    }

    /* --- Event Listeners Setup --- */
    bindEvents() {
        // Auth Tab Switching
        document.querySelectorAll(".auth-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
                tab.classList.add("active");

                const target = tab.getAttribute("data-auth");
                if (target === "login") {
                    this.loginForm.classList.remove("hidden");
                    this.registerForm.classList.add("hidden");
                } else {
                    this.loginForm.classList.add("hidden");
                    this.registerForm.classList.remove("hidden");
                }
            });
        });

        // Form Submissions
        this.loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        this.registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout
        document.getElementById("logoutBtn").addEventListener("click", () => {
            this.handleLogout();
        });

        // Navigation Menu
        document.querySelectorAll(".nav-item").forEach(item => {
            item.addEventListener("click", () => {
                const section = item.getAttribute("data-section");
                this.showSection(section);
                this.closeMobileSidebar();
            });
        });

        // Mobile Sidebar Drawer
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener("click", () => this.openMobileSidebar());
        }
        if (this.sidebarCloseBtn) {
            this.sidebarCloseBtn.addEventListener("click", () => this.closeMobileSidebar());
        }
        if (this.sidebarBackdrop) {
            this.sidebarBackdrop.addEventListener("click", () => this.closeMobileSidebar());
        }

        // Global Stock Search
        if (this.globalSearchInput) {
            this.globalSearchInput.addEventListener("input", (e) => {
                this.handleGlobalSearch(e.target.value);
            });
            document.addEventListener("keydown", (e) => {
                if (e.key === "/" && document.activeElement !== this.globalSearchInput && !this.isInputActive()) {
                    e.preventDefault();
                    this.globalSearchInput.focus();
                }
            });
            document.addEventListener("click", (e) => {
                if (!this.globalSearchInput.contains(e.target) && !this.searchSuggestions.contains(e.target)) {
                    this.searchSuggestions.classList.add("hidden");
                }
            });
        }

        // Markets Filter Chips & Search
        const stockSearchInput = document.getElementById("stockSearch");
        if (stockSearchInput) {
            stockSearchInput.addEventListener("input", (e) => {
                this.renderMarkets(e.target.value);
            });
        }

        document.querySelectorAll(".chip").forEach(chip => {
            chip.addEventListener("click", () => {
                document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
                chip.classList.add("active");
                this.currentMarketFilter = chip.getAttribute("data-filter");
                this.renderMarkets(stockSearchInput ? stockSearchInput.value : "");
            });
        });

        // Market Grid / Table view toggle
        const viewGridBtn = document.getElementById("viewGridBtn");
        const viewTableBtn = document.getElementById("viewTableBtn");
        if (viewGridBtn && viewTableBtn) {
            viewGridBtn.addEventListener("click", () => {
                viewGridBtn.classList.add("active");
                viewTableBtn.classList.remove("active");
                this.currentMarketView = "grid";
                document.getElementById("marketGrid").classList.remove("hidden");
                document.getElementById("marketTableContainer").classList.add("hidden");
                this.renderMarkets();
            });
            viewTableBtn.addEventListener("click", () => {
                viewTableBtn.classList.add("active");
                viewGridBtn.classList.remove("active");
                this.currentMarketView = "table";
                document.getElementById("marketGrid").classList.add("hidden");
                document.getElementById("marketTableContainer").classList.remove("hidden");
                this.renderMarkets();
            });
        }

        // Watchlist Sorting
        const watchlistSort = document.getElementById("watchlistSort");
        if (watchlistSort) {
            watchlistSort.addEventListener("change", (e) => {
                this.currentWatchlistSort = e.target.value;
                this.renderWatchlist();
            });
        }

        // Orders Filters & Sorting
        document.querySelectorAll(".order-filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".order-filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.currentOrdersFilter = btn.getAttribute("data-order-filter");
                this.renderOrders();
            });
        });

        const ordersSort = document.getElementById("ordersSort");
        if (ordersSort) {
            ordersSort.addEventListener("change", (e) => {
                this.currentOrdersSort = e.target.value;
                this.renderOrders();
            });
        }

        // Chart Range Timeframes
        document.querySelectorAll(".timeframe-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".timeframe-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.currentChartRange = btn.getAttribute("data-range");
                const select = document.getElementById("chartRange");
                if (select) select.value = this.currentChartRange;
                this.renderChart();
            });
        });

        const chartRangeSelect = document.getElementById("chartRange");
        if (chartRangeSelect) {
            chartRangeSelect.addEventListener("change", (e) => {
                this.currentChartRange = e.target.value;
                this.renderChart();
            });
        }

        // Trade Modal Controls
        document.getElementById("closeModal").addEventListener("click", () => this.closeTradeModal());
        document.getElementById("buyTab").addEventListener("click", () => this.setTradeType("BUY"));
        document.getElementById("sellTab").addEventListener("click", () => this.setTradeType("SELL"));

        const qtyInput = document.getElementById("tradeQuantity");
        const qtyMinusBtn = document.getElementById("qtyMinusBtn");
        const qtyPlusBtn = document.getElementById("qtyPlusBtn");

        if (qtyInput) {
            qtyInput.addEventListener("input", () => this.updateTradeModal());
        }
        if (qtyMinusBtn) {
            qtyMinusBtn.addEventListener("click", () => {
                const current = Math.floor(Number(qtyInput.value)) || 1;
                if (current > 1) {
                    qtyInput.value = current - 1;
                    this.updateTradeModal();
                }
            });
        }
        if (qtyPlusBtn) {
            qtyPlusBtn.addEventListener("click", () => {
                const current = Math.floor(Number(qtyInput.value)) || 1;
                qtyInput.value = current + 1;
                this.updateTradeModal();
            });
        }

        // Quantity Presets
        document.querySelectorAll(".preset-btn[data-qty]").forEach(btn => {
            btn.addEventListener("click", () => {
                const add = Number(btn.getAttribute("data-qty"));
                const current = Math.floor(Number(qtyInput.value)) || 0;
                qtyInput.value = Math.max(1, current + add);
                this.updateTradeModal();
            });
        });

        const qtyMaxBtn = document.getElementById("qtyMaxBtn");
        if (qtyMaxBtn) {
            qtyMaxBtn.addEventListener("click", () => {
                if (!this.selectedStock || !this.user) return;
                if (this.tradeType === "BUY") {
                    const maxAffordable = Math.floor(this.user.portfolio.cash / this.selectedStock.price);
                    qtyInput.value = Math.max(1, maxAffordable);
                } else {
                    const holding = this.user.portfolio.holdings[this.selectedStock.symbol];
                    const owned = holding ? holding.quantity : 0;
                    qtyInput.value = Math.max(1, owned);
                }
                this.updateTradeModal();
            });
        }

        const tradeStockSelect = document.getElementById("tradeStockSelect");
        if (tradeStockSelect) {
            tradeStockSelect.addEventListener("change", (e) => {
                const stock = this.market[e.target.value];
                if (stock) {
                    this.openTradeModal(stock.symbol, this.tradeType);
                }
            });
        }

        document.getElementById("executeTrade").addEventListener("click", () => {
            this.executeTrade();
        });

        // Stock Details Modal Controls
        document.getElementById("closeDetailsModal").addEventListener("click", () => {
            this.stockDetailsModal.classList.add("hidden");
        });
        document.getElementById("detailsTradeBuyBtn").addEventListener("click", () => {
            if (this.selectedStock) {
                this.stockDetailsModal.classList.add("hidden");
                this.openTradeModal(this.selectedStock.symbol, "BUY");
            }
        });
        document.getElementById("detailsTradeSellBtn").addEventListener("click", () => {
            if (this.selectedStock) {
                this.stockDetailsModal.classList.add("hidden");
                this.openTradeModal(this.selectedStock.symbol, "SELL");
            }
        });
        document.getElementById("detailsWatchlistBtn").addEventListener("click", () => {
            if (this.selectedStock) {
                this.toggleWatchlist(this.selectedStock.symbol);
                this.updateStockDetailsModal(this.selectedStock);
            }
        });
        document.getElementById("detailsAlertBtn").addEventListener("click", () => {
            if (this.selectedStock) {
                this.openPriceAlertModal(this.selectedStock.symbol);
            }
        });

        // Price Alert Modal Controls
        document.getElementById("sidebarAlertsBtn").addEventListener("click", () => {
            this.openPriceAlertModal();
        });
        document.getElementById("closeAlertModal").addEventListener("click", () => {
            this.priceAlertModal.classList.add("hidden");
        });
        document.getElementById("createAlertForm").addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleCreateAlert();
        });

        // Notifications Modal Controls
        this.notifBellBtn.addEventListener("click", () => {
            this.openNotifModal();
        });
        document.getElementById("closeNotifModal").addEventListener("click", () => {
            this.notifModal.classList.add("hidden");
        });
        document.getElementById("markAllReadBtn").addEventListener("click", () => {
            this.notifications.forEach(n => n.read = true);
            this.saveNotifications();
            this.updateNotifBadge();
            this.renderNotifList();
        });
        document.getElementById("clearAllNotifsBtn").addEventListener("click", () => {
            this.notifications = [];
            this.saveNotifications();
            this.updateNotifBadge();
            this.renderNotifList();
            this.toastMessage("Notifications cleared.");
        });

        // Settings Modal Controls
        document.getElementById("sidebarSettingsBtn").addEventListener("click", () => {
            this.openSettingsModal();
        });
        document.getElementById("closeSettingsModal").addEventListener("click", () => {
            this.settingsModal.classList.add("hidden");
        });

        document.getElementById("settingCompact").addEventListener("change", (e) => {
            this.settings.compact = e.target.checked;
            this.saveSettings();
            this.applySettings();
        });
        document.getElementById("settingAnimations").addEventListener("change", (e) => {
            this.settings.animations = e.target.checked;
            this.saveSettings();
        });
        document.getElementById("settingSounds").addEventListener("change", (e) => {
            this.settings.sounds = e.target.checked;
            this.saveSettings();
        });

        // Settings Danger Zone
        document.getElementById("clearWatchlistBtn").addEventListener("click", () => {
            this.confirmAction("Clear Watchlist", "Are you sure you want to remove all tracked stocks from your watchlist?", () => {
                this.user.watchlist = [];
                this.auth.saveUser(this.user);
                this.renderWatchlist();
                this.renderMarkets();
                this.toastMessage("Watchlist cleared.");
            });
        });

        document.getElementById("clearOrderHistoryBtn").addEventListener("click", () => {
            this.confirmAction("Clear Order History", "Are you sure you want to clear your transaction history ledger?", () => {
                this.user.portfolio.transactions = [];
                this.auth.saveUser(this.user);
                this.renderOrders();
                this.renderAnalytics();
                this.toastMessage("Order history cleared.");
            });
        });

        const handleResetSim = () => {
            this.confirmAction("Reset Simulation to $100,000", "This will reset your cash to $100,000, wipe all active stock positions, and clear order history. This cannot be undone.", () => {
                this.user.portfolio = new Portfolio({ cash: STARTING_BALANCE, initialCash: STARTING_BALANCE });
                this.user.unlockedAchievements = [];
                this.auth.saveUser(this.user);
                this.renderEverything();
                this.toastMessage("Simulation reset to $100,000.00 cash.");
                this.addNotification("Simulation Reset", "Your account was restored to $100,000.00 virtual cash.", "↺");
            });
        };

        document.getElementById("sidebarResetBtn").addEventListener("click", handleResetSim);
        document.getElementById("settingsResetBtn").addEventListener("click", () => {
            this.settingsModal.classList.add("hidden");
            handleResetSim();
        });

        // Window resize debounced canvas re-render
        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.renderChart();
                this.renderAllocationChart();
            }, 150);
        });
    }

    isInputActive() {
        const active = document.activeElement;
        return active && (active.tagName === "INPUT" || active.tagName === "SELECT" || active.tagName === "TEXTAREA");
    }

    /* --- Mobile Sidebar Helpers --- */
    openMobileSidebar() {
        if (this.sidebar) this.sidebar.classList.add("open");
        if (this.sidebarBackdrop) this.sidebarBackdrop.classList.add("show");
    }

    closeMobileSidebar() {
        if (this.sidebar) this.sidebar.classList.remove("open");
        if (this.sidebarBackdrop) this.sidebarBackdrop.classList.remove("show");
    }

    /* --- Confirmation Modal Helper --- */
    confirmAction(title, message, onConfirm) {
        document.getElementById("confirmTitle").textContent = title;
        document.getElementById("confirmMessage").textContent = message;

        const proceedBtn = document.getElementById("confirmProceedBtn");
        const cancelBtn = document.getElementById("confirmCancelBtn");

        const cleanup = () => {
            this.confirmModal.classList.add("hidden");
            proceedBtn.replaceWith(proceedBtn.cloneNode(true));
            cancelBtn.replaceWith(cancelBtn.cloneNode(true));
        };

        this.confirmModal.classList.remove("hidden");

        document.getElementById("confirmProceedBtn").addEventListener("click", () => {
            cleanup();
            if (typeof onConfirm === "function") onConfirm();
        });

        document.getElementById("confirmCancelBtn").addEventListener("click", () => {
            cleanup();
        });
    }

    /* --- Authentication Handlers --- */
    async handleLogin() {
        const identity = document.getElementById("loginIdentity").value;
        const password = document.getElementById("loginPassword").value;

        try {
            this.user = await this.auth.login(identity, password);
            this.showFormMessage("loginMessage", "Login successful! Loading TradeGen...", "success");
            setTimeout(() => this.showApp(), 400);
        } catch (error) {
            this.showFormMessage("loginMessage", error.message, "error");
        }
    }

    async handleRegister() {
        const name = document.getElementById("registerName").value;
        const username = document.getElementById("registerUsername").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirm = document.getElementById("registerConfirm").value;

        if (password !== confirm) {
            this.showFormMessage("registerMessage", "Passwords do not match.", "error");
            return;
        }

        try {
            this.user = await this.auth.register(name, username, email, password);
            this.showFormMessage("registerMessage", "Account created successfully! Welcome to TradeGen.", "success");
            setTimeout(() => this.showApp(), 500);
        } catch (error) {
            this.showFormMessage("registerMessage", error.message, "error");
        }
    }

    handleLogout() {
        this.confirmAction("Sign Out", "Are you sure you want to sign out of TradeGen?", () => {
            if (this.marketTimer) clearInterval(this.marketTimer);
            this.auth.logout();
            this.user = null;
            this.appScreen.classList.add("hidden");
            this.authScreen.classList.remove("hidden");
            this.toastMessage("Signed out safely.");
        });
    }

    showFormMessage(elementId, message, type) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.textContent = message;
        el.className = `form-message ${type}`;
    }

    checkAuthentication() {
        const current = this.auth.getCurrentUser();
        if (current) {
            this.user = current;
            this.showApp();
        } else {
            this.authScreen.classList.remove("hidden");
            this.appScreen.classList.add("hidden");
        }
    }

    showApp() {
        this.authScreen.classList.add("hidden");
        this.appScreen.classList.remove("hidden");

        this.updateUserUI();
        this.populateStockSelects();
        this.renderEverything();
        this.startMarketTicker();
        this.updateNotifBadge();
    }

    updateUserUI() {
        if (!this.user) return;
        document.getElementById("userName").textContent = this.user.fullName;
        document.getElementById("userEmail").textContent = this.user.email;
        document.getElementById("welcomeText").textContent = `Welcome back, ${this.user.fullName.split(" ")[0]}!`;
        document.getElementById("userAvatar").textContent = this.user.fullName.charAt(0).toUpperCase();
    }

    populateStockSelects() {
        const symbols = Object.keys(this.market);

        // Trade Modal select
        const tradeSelect = document.getElementById("tradeStockSelect");
        if (tradeSelect) {
            tradeSelect.innerHTML = symbols.map(s => {
                const stock = this.market[s];
                return `<option value="${s}">${stock.symbol} — ${stock.name} (${this.money(stock.price)})</option>`;
            }).join("");
        }

        // Alert Modal select
        const alertSelect = document.getElementById("alertStockSelect");
        if (alertSelect) {
            alertSelect.innerHTML = symbols.map(s => {
                const stock = this.market[s];
                return `<option value="${s}">${stock.symbol} — ${stock.name}</option>`;
            }).join("");
        }
    }

    /* --- Navigation Switching --- */
    showSection(section) {
        document.querySelectorAll(".page-section").forEach(s => s.classList.add("hidden"));

        const target = document.getElementById(`${section}Section`);
        if (target) target.classList.remove("hidden");

        document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
        const active = document.querySelector(`.nav-item[data-section="${section}"]`);
        if (active) active.classList.add("active");

        const titles = {
            dashboard: "Dashboard",
            markets: "Simulated Markets",
            watchlist: "My Watchlist",
            portfolio: "Portfolio & Positions",
            analytics: "Trading Analytics",
            orders: "Order History",
            leaderboard: "Paper Trading Leaderboard",
            achievements: "Trader Achievements"
        };

        const pageTitle = document.getElementById("pageTitle");
        if (pageTitle) pageTitle.textContent = titles[section] || "TradeGen";

        // Re-render target section view
        if (section === "dashboard") {
            this.renderChart();
            this.renderAllocationChart();
        } else if (section === "markets") {
            this.renderMarkets();
        } else if (section === "watchlist") {
            this.renderWatchlist();
        } else if (section === "portfolio") {
            this.renderPortfolio();
        } else if (section === "analytics") {
            this.renderAnalytics();
        } else if (section === "orders") {
            this.renderOrders();
        } else if (section === "leaderboard") {
            this.renderLeaderboard();
        } else if (section === "achievements") {
            this.renderAchievements();
        }
    }


    /* ==========================================================================
       SECTION 6: SIMULATED MARKET TICKER ENGINE
       ========================================================================== */

    startMarketTicker() {
        if (this.marketTimer) clearInterval(this.marketTimer);

        this.marketTimer = setInterval(() => {
            // Update prices with realistic random movements
            Object.values(this.market).forEach(stock => {
                stock.updatePrice();
            });

            // Check price alerts against newly ticked prices
            this.checkPriceAlerts();

            // Record portfolio performance over time
            if (this.user) {
                this.user.portfolio.recordHistory(this.market);
                this.auth.saveUser(this.user);
            }

            // Check achievements triggers
            this.checkAchievements();

            // Re-render components
            this.renderStats();
            this.renderMarketOverviewBar();
            this.renderMovers();
            this.renderDashboardHoldings();

            // Active page updates
            const activeNav = document.querySelector(".nav-item.active");
            const currentSection = activeNav ? activeNav.getAttribute("data-section") : "dashboard";

            if (currentSection === "dashboard") {
                this.renderChart();
                this.renderAllocationChart();
            } else if (currentSection === "markets") {
                this.renderMarkets();
            } else if (currentSection === "watchlist") {
                this.renderWatchlist();
            } else if (currentSection === "portfolio") {
                this.renderPortfolio();
            } else if (currentSection === "leaderboard") {
                this.renderLeaderboard();
            }

            // If Stock Details modal is open, live update its stats & chart
            if (this.selectedStock && !this.stockDetailsModal.classList.contains("hidden")) {
                this.updateStockDetailsModal(this.selectedStock);
            }

            // If Trade modal is open, update current price
            if (this.selectedStock && !this.tradeModal.classList.contains("hidden")) {
                this.updateTradeModal();
            }
        }, 3000);
    }

    /* ==========================================================================
       SECTION 7: MASTER RENDERERS
       ========================================================================== */

    renderEverything() {
        this.renderStats();
        this.renderMarketOverviewBar();
        this.renderMovers();
        this.renderDashboardHoldings();
        this.renderMarkets();
        this.renderWatchlist();
        this.renderPortfolio();
        this.renderAnalytics();
        this.renderOrders();
        this.renderLeaderboard();
        this.renderAchievements();
        this.renderChart();
        this.renderAllocationChart();
    }

    /* --- Dashboard Market Overview Bar --- */
    renderMarketOverviewBar() {
        const stocks = Object.values(this.market);
        if (!stocks.length) return;

        const gainers = stocks.filter(s => s.change > 0);
        const losers = stocks.filter(s => s.change < 0);
        const gainerPct = Math.round((gainers.length / stocks.length) * 100);

        let sentiment = "Neutral (50%)";
        if (gainerPct >= 60) sentiment = `Bullish (${gainerPct}%)`;
        else if (gainerPct <= 40) sentiment = `Bearish (${100 - gainerPct}%)`;

        const avgMove = (stocks.reduce((acc, s) => acc + s.change, 0) / stocks.length).toFixed(2);

        const sortedByChange = [...stocks].sort((a, b) => b.change - a.change);
        const topGainer = sortedByChange[0];
        const topLoser = sortedByChange[sortedByChange.length - 1];
        const mostActive = [...stocks].sort((a, b) => b.volume - a.volume)[0];

        const sentimentEl = document.getElementById("overviewSentiment");
        if (sentimentEl) {
            sentimentEl.textContent = sentiment;
            sentimentEl.className = gainerPct >= 60 ? "green" : (gainerPct <= 40 ? "red" : "muted");
        }

        const avgMoveEl = document.getElementById("overviewAvgMove");
        if (avgMoveEl) {
            avgMoveEl.textContent = `${Number(avgMove) >= 0 ? "+" : ""}${avgMove}%`;
            avgMoveEl.className = Number(avgMove) >= 0 ? "green" : "red";
        }

        const topGainerEl = document.getElementById("overviewTopGainer");
        if (topGainerEl && topGainer) {
            topGainerEl.textContent = `${topGainer.symbol} +${topGainer.change.toFixed(2)}%`;
        }

        const topLoserEl = document.getElementById("overviewTopLoser");
        if (topLoserEl && topLoser) {
            topLoserEl.textContent = `${topLoser.symbol} ${topLoser.change.toFixed(2)}%`;
        }

        const mostActiveEl = document.getElementById("overviewMostActive");
        if (mostActiveEl && mostActive) {
            mostActiveEl.textContent = `${mostActive.symbol} (${(mostActive.volume / 1000000).toFixed(1)}M)`;
        }
    }

    /* --- Dashboard Stats Cards --- */
    renderStats() {
        if (!this.user) return;

        const portfolio = this.user.portfolio;
        const total = portfolio.getTotalValue(this.market);
        const invested = portfolio.getInvestedValue(this.market);
        const profit = total - portfolio.initialCash;
        const profitPercent = (profit / portfolio.initialCash) * 100;

        // Total Portfolio
        const totalPortEl = document.getElementById("totalPortfolio");
        if (totalPortEl) totalPortEl.textContent = this.money(total);

        // Portfolio % return
        const portChangeEl = document.getElementById("portfolioChange");
        if (portChangeEl) {
            portChangeEl.textContent = `${profitPercent >= 0 ? "+" : ""}${profitPercent.toFixed(2)}%`;
            portChangeEl.className = profit >= 0 ? "green" : "red";
        }

        // Available Cash
        const cashBalanceEl = document.getElementById("cashBalance");
        if (cashBalanceEl) cashBalanceEl.textContent = this.money(portfolio.cash);

        // Invested Value
        const investedValEl = document.getElementById("investedValue");
        if (investedValEl) investedValEl.textContent = this.money(invested);

        const positionsCount = Object.keys(portfolio.holdings).length;
        const posCountLabel = document.getElementById("positionsCountLabel");
        if (posCountLabel) {
            posCountLabel.textContent = `${positionsCount} active position${positionsCount === 1 ? "" : "s"}`;
        }

        // Total Profit
        const totalProfitEl = document.getElementById("totalProfit");
        if (totalProfitEl) {
            totalProfitEl.textContent = `${profit >= 0 ? "+" : ""}${this.money(profit)}`;
            totalProfitEl.className = profit >= 0 ? "green" : "red";
        }

        const profitPercentEl = document.getElementById("profitPercent");
        if (profitPercentEl) {
            profitPercentEl.textContent = `${profitPercent >= 0 ? "+" : ""}${profitPercent.toFixed(2)}%`;
            profitPercentEl.className = profit >= 0 ? "green" : "red";
        }

        // Today's simulated P/L (calculated from current holdings price changes)
        let todayProfit = 0;
        Object.entries(portfolio.holdings).forEach(([sym, holding]) => {
            const stock = this.market[sym];
            if (stock) {
                const tickDiff = stock.price - stock.previousPrice;
                todayProfit += tickDiff * holding.quantity;
            }
        });

        const todayProfitEl = document.getElementById("todayProfit");
        if (todayProfitEl) {
            todayProfitEl.textContent = `${todayProfit >= 0 ? "+" : ""}${this.money(todayProfit)}`;
            todayProfitEl.className = todayProfit >= 0 ? "green" : "red";
        }

        const todayProfitPercentEl = document.getElementById("todayProfitPercent");
        if (todayProfitPercentEl) {
            const todayPct = total > 0 ? (todayProfit / total) * 100 : 0;
            todayProfitPercentEl.textContent = `${todayPct >= 0 ? "+" : ""}${todayPct.toFixed(2)}% today`;
            todayProfitPercentEl.className = todayPct >= 0 ? "green" : "red";
        }

        // Win Rate Calculation
        const sells = portfolio.transactions.filter(t => t.type === "SELL");
        const wins = sells.filter(t => t.realizedProfit > 0).length;
        const winRate = sells.length > 0 ? ((wins / sells.length) * 100).toFixed(1) : "0.0";

        const dashWinRate = document.getElementById("dashboardWinRate");
        if (dashWinRate) dashWinRate.textContent = `${winRate}%`;

        const dashTradeRatio = document.getElementById("dashboardTradeRatio");
        if (dashTradeRatio) {
            dashTradeRatio.textContent = `${wins} wins / ${sells.length} closed`;
        }

        // Portfolio Page specific elements
        const portPageVal = document.getElementById("portfolioPageValue");
        if (portPageVal) portPageVal.textContent = this.money(total);

        const portPageCash = document.getElementById("portfolioPageCash");
        if (portPageCash) portPageCash.textContent = this.money(portfolio.cash);

        const portPageProfit = document.getElementById("portfolioPageProfit");
        if (portPageProfit) {
            portPageProfit.textContent = `${profit >= 0 ? "+" : ""}${this.money(profit)}`;
            portPageProfit.className = profit >= 0 ? "green" : "red";
        }

        const portPageReturn = document.getElementById("portfolioPageReturn");
        if (portPageReturn) {
            portPageReturn.textContent = `${profitPercent >= 0 ? "+" : ""}${profitPercent.toFixed(2)}% total return`;
            portPageReturn.className = profit >= 0 ? "green" : "red";
        }

        const portPosCount = document.getElementById("portfolioPositionsCount");
        if (portPosCount) {
            portPosCount.textContent = `${positionsCount} open position${positionsCount === 1 ? "" : "s"}`;
        }
    }

    /* --- Market Movers Panel --- */
    renderMovers() {
        const container = document.getElementById("marketMovers");
        if (!container) return;

        const stocks = Object.values(this.market)
            .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
            .slice(0, 5);

        container.innerHTML = stocks.map(stock => `
            <div class="mover" onclick="app.openStockDetails('${stock.symbol}')" style="cursor:pointer;">
                <div class="mover-left">
                    <div class="stock-logo">${stock.symbol.charAt(0)}</div>
                    <div>
                        <strong>${stock.symbol}</strong>
                        <small class="muted">${stock.name}</small>
                    </div>
                </div>
                <div style="text-align: right;">
                    <strong>${this.money(stock.price)}</strong>
                    <small class="${stock.change >= 0 ? "green" : "red"}" style="display:block;">
                        ${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}%
                    </small>
                </div>
            </div>
        `).join("");
    }

    /* --- Dashboard Holdings Preview --- */
    renderDashboardHoldings() {
        const container = document.getElementById("dashboardHoldings");
        if (!container || !this.user) return;

        const holdings = Object.entries(this.user.portfolio.holdings);

        if (!holdings.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>You don't own any stocks yet. Start building your portfolio!</p>
                    <button class="primary-btn" onclick="app.showSection('markets')">
                        Explore Markets →
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = holdings.slice(0, 4).map(([symbol, holding]) => {
            const stock = this.market[symbol];
            if (!stock) return "";
            const value = holding.quantity * stock.price;
            const profit = (stock.price - holding.averagePrice) * holding.quantity;

            return `
                <div class="holding" onclick="app.openStockDetails('${symbol}')" style="cursor:pointer;">
                    <div class="holding-name">
                        <div class="stock-logo">${symbol.charAt(0)}</div>
                        <div>
                            <strong>${symbol}</strong>
                            <small class="muted">${holding.quantity} shares</small>
                        </div>
                    </div>
                    <div>
                        <strong>${this.money(value)}</strong>
                        <small class="${profit >= 0 ? "green" : "red"}" style="display:block;">
                            ${profit >= 0 ? "+" : ""}${this.money(profit)}
                        </small>
                    </div>
                </div>
            `;
        }).join("");
    }

    /* --- Markets View (Grid & Table) --- */
    renderMarkets(searchQuery = "") {
        const grid = document.getElementById("marketGrid");
        const tableView = document.getElementById("marketTableView");
        if (!grid) return;

        const query = (searchQuery || "").trim().toLowerCase();
        let stocks = Object.values(this.market);

        // Category filter
        if (this.currentMarketFilter === "tech") {
            stocks = stocks.filter(s => s.sector.includes("Tech") || s.sector.includes("Semiconductors"));
        } else if (this.currentMarketFilter === "gainers") {
            stocks = stocks.filter(s => s.change > 0);
        } else if (this.currentMarketFilter === "losers") {
            stocks = stocks.filter(s => s.change < 0);
        } else if (this.currentMarketFilter === "watched" && this.user) {
            stocks = stocks.filter(s => this.user.watchlist.includes(s.symbol));
        }

        // Text search filter
        if (query) {
            stocks = stocks.filter(s =>
                s.symbol.toLowerCase().includes(query) ||
                s.name.toLowerCase().includes(query) ||
                s.sector.toLowerCase().includes(query)
            );
        }

        if (!stocks.length) {
            const emptyHtml = `<div class="panel empty-state full-width"><p>No equities found matching your criteria.</p></div>`;
            grid.innerHTML = emptyHtml;
            if (tableView) tableView.innerHTML = emptyHtml;
            return;
        }

        // Grid View HTML
        grid.innerHTML = stocks.map(stock => this.stockCardHTML(stock)).join("");

        // Table View HTML
        if (tableView) {
            tableView.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Stock</th>
                            <th>Sector</th>
                            <th>Price</th>
                            <th>24h Change</th>
                            <th>Day High / Low</th>
                            <th>Volume</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stocks.map(stock => `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;" onclick="app.openStockDetails('${stock.symbol}')">
                                        <div class="stock-logo">${stock.symbol.charAt(0)}</div>
                                        <div>
                                            <strong>${stock.symbol}</strong><br>
                                            <small class="muted">${stock.name}</small>
                                        </div>
                                    </div>
                                </td>
                                <td class="muted">${stock.sector}</td>
                                <td><strong>${this.money(stock.price)}</strong></td>
                                <td class="${stock.change >= 0 ? "green" : "red"}">
                                    ${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}%
                                </td>
                                <td>${this.money(stock.dayHigh)} / ${this.money(stock.dayLow)}</td>
                                <td class="muted">${(stock.volume / 1000000).toFixed(2)}M</td>
                                <td>
                                    <div style="display: flex; gap: 6px;">
                                        <button class="buy-btn" onclick="event.stopPropagation(); app.openTradeModal('${stock.symbol}','BUY')">BUY</button>
                                        <button class="sell-btn" onclick="event.stopPropagation(); app.openTradeModal('${stock.symbol}','SELL')">SELL</button>
                                        <button class="secondary-btn" onclick="event.stopPropagation(); app.openStockDetails('${stock.symbol}')">Details</button>
                                    </div>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;
        }
    }

    stockCardHTML(stock) {
        const isWatched = this.user && this.user.watchlist.includes(stock.symbol);
        const sharesOwned = (this.user && this.user.portfolio.holdings[stock.symbol])
            ? this.user.portfolio.holdings[stock.symbol].quantity
            : 0;

        return `
            <div class="stock-card" onclick="app.openStockDetails('${stock.symbol}')">
                <div class="stock-card-top">
                    <div class="stock-card-name">
                        <div class="stock-logo">${stock.symbol.charAt(0)}</div>
                        <div>
                            <strong>${stock.symbol}</strong>
                            <small>${stock.name}</small>
                        </div>
                    </div>
                    <span class="badge ${stock.change >= 0 ? "green" : "red"}">
                        ${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}%
                    </span>
                </div>

                <div class="stock-price">
                    ${this.money(stock.price)}
                </div>

                <div class="stock-meta-row">
                    <span>H: ${this.money(stock.dayHigh)} | L: ${this.money(stock.dayLow)}</span>
                    <span>${sharesOwned > 0 ? `Owned: ${sharesOwned}` : stock.sector}</span>
                </div>

                <div class="stock-actions" onclick="event.stopPropagation()">
                    <button class="buy-btn" onclick="app.openTradeModal('${stock.symbol}','BUY')">BUY</button>
                    <button class="sell-btn" onclick="app.openTradeModal('${stock.symbol}','SELL')">SELL</button>
                    <button class="watch-btn" onclick="app.toggleWatchlist('${stock.symbol}')" title="Watchlist">
                        ${isWatched ? "★" : "☆"}
                    </button>
                </div>
            </div>
        `;
    }

    /* --- Watchlist View with Sorting --- */
    renderWatchlist() {
        const container = document.getElementById("watchlistGrid");
        if (!container || !this.user) return;

        let stocks = this.user.watchlist
            .map(sym => this.market[sym])
            .filter(Boolean);

        if (!stocks.length) {
            container.innerHTML = `
                <div class="panel empty-state full-width">
                    <p>Your watchlist is currently empty. Star stocks from the Markets view to track them here!</p>
                    <button class="primary-btn" onclick="app.showSection('markets')">Browse Markets</button>
                </div>
            `;
            return;
        }

        // Apply selected sort
        switch (this.currentWatchlistSort) {
            case "priceDesc":
                stocks.sort((a, b) => b.price - a.price);
                break;
            case "priceAsc":
                stocks.sort((a, b) => a.price - b.price);
                break;
            case "changeDesc":
                stocks.sort((a, b) => b.change - a.change);
                break;
            case "changeAsc":
                stocks.sort((a, b) => a.change - b.change);
                break;
            case "volumeDesc":
                stocks.sort((a, b) => b.volume - a.volume);
                break;
            case "symbol":
            default:
                stocks.sort((a, b) => a.symbol.localeCompare(b.symbol));
                break;
        }

        container.innerHTML = stocks.map(stock => `
            <div class="stock-card" onclick="app.openStockDetails('${stock.symbol}')">
                <div class="stock-card-top">
                    <div class="stock-card-name">
                        <div class="stock-logo">${stock.symbol.charAt(0)}</div>
                        <div>
                            <strong>${stock.symbol}</strong>
                            <small>${stock.name}</small>
                        </div>
                    </div>
                    <span class="badge ${stock.change >= 0 ? "green" : "red"}">
                        ${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}%
                    </span>
                </div>

                <div class="stock-price">${this.money(stock.price)}</div>

                <div class="stock-meta-row">
                    <span>High: ${this.money(stock.dayHigh)}</span>
                    <span>Low: ${this.money(stock.dayLow)}</span>
                </div>

                <div class="stock-actions" onclick="event.stopPropagation()">
                    <button class="buy-btn" onclick="app.openTradeModal('${stock.symbol}','BUY')">Trade</button>
                    <button class="secondary-btn" onclick="app.openPriceAlertModal('${stock.symbol}')" title="Set Price Alert">🔔 Alert</button>
                    <button class="watch-btn" onclick="app.toggleWatchlist('${stock.symbol}')" title="Remove from Watchlist">✕</button>
                </div>
            </div>
        `).join("");
    }

    toggleWatchlist(symbol) {
        if (!this.user) return;
        const index = this.user.watchlist.indexOf(symbol);

        if (index >= 0) {
            this.user.watchlist.splice(index, 1);
            this.toastMessage(`${symbol} removed from watchlist.`);
        } else {
            this.user.watchlist.push(symbol);
            this.toastMessage(`${symbol} added to watchlist ⭐`);
            this.addNotification("Watchlist Updated", `Added ${symbol} to your tracked watchlist.`, "⭐");
        }

        this.auth.saveUser(this.user);
        this.renderWatchlist();
        this.renderMarkets();
        this.checkAchievements();
    }

    /* --- Portfolio Positions Table --- */
    renderPortfolio() {
        const container = document.getElementById("portfolioTable");
        if (!container || !this.user) return;

        const holdings = Object.entries(this.user.portfolio.holdings);

        if (!holdings.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No active positions found in your portfolio.</p>
                    <button class="primary-btn" onclick="app.showSection('markets')">
                        Invest Available Cash →
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Asset</th>
                        <th>Shares</th>
                        <th>Avg Cost</th>
                        <th>Current Price</th>
                        <th>Market Value</th>
                        <th>Unrealized P/L</th>
                        <th>Return %</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${holdings.map(([symbol, holding]) => {
                        const stock = this.market[symbol];
                        if (!stock) return "";
                        const value = holding.quantity * stock.price;
                        const cost = holding.quantity * holding.averagePrice;
                        const profit = value - cost;
                        const returnPct = cost > 0 ? (profit / cost) * 100 : 0;

                        return `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;" onclick="app.openStockDetails('${symbol}')">
                                        <div class="stock-logo">${symbol.charAt(0)}</div>
                                        <div>
                                            <strong>${symbol}</strong><br>
                                            <small class="muted">${stock.name}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>${holding.quantity}</td>
                                <td>${this.money(holding.averagePrice)}</td>
                                <td>${this.money(stock.price)}</td>
                                <td><strong>${this.money(value)}</strong></td>
                                <td class="${profit >= 0 ? "green" : "red"}">
                                    <strong>${profit >= 0 ? "+" : ""}${this.money(profit)}</strong>
                                </td>
                                <td class="${returnPct >= 0 ? "green" : "red"}">
                                    ${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%
                                </td>
                                <td>
                                    <div style="display: flex; gap: 6px;">
                                        <button class="buy-btn" onclick="app.openTradeModal('${symbol}','BUY')">Buy</button>
                                        <button class="sell-btn" onclick="app.openTradeModal('${symbol}','SELL')">Sell</button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        `;
    }

    /* --- Analytics View --- */
    calcRealizedProfit(user) {
        if (!user || !user.portfolio || !user.portfolio.transactions) return 0;
        return user.portfolio.transactions
            .filter(t => t.type === "SELL")
            .reduce((sum, t) => sum + (t.realizedProfit || 0), 0);
    }

    renderAnalytics() {
        if (!this.user) return;

        const transactions = this.user.portfolio.transactions || [];
        const buys = transactions.filter(t => t.type === "BUY");
        const sells = transactions.filter(t => t.type === "SELL");

        const winningSells = sells.filter(t => t.realizedProfit > 0);
        const losingSells = sells.filter(t => t.realizedProfit < 0);

        const winRate = sells.length > 0 ? ((winningSells.length / sells.length) * 100).toFixed(1) : "0.0";
        const totalRealizedPL = this.calcRealizedProfit(this.user);
        const avgTradeVal = transactions.length > 0
            ? (transactions.reduce((sum, t) => sum + t.total, 0) / transactions.length)
            : 0;

        // Largest winning & losing sells
        let largestWin = 0;
        let largestWinStock = "None yet";
        let largestLoss = 0;
        let largestLossStock = "None yet";

        sells.forEach(t => {
            if (t.realizedProfit > largestWin) {
                largestWin = t.realizedProfit;
                largestWinStock = `${t.symbol} (${t.quantity} shares)`;
            }
            if (t.realizedProfit < largestLoss) {
                largestLoss = t.realizedProfit;
                largestLossStock = `${t.symbol} (${t.quantity} shares)`;
            }
        });

        // Most traded stock
        const counts = {};
        transactions.forEach(t => counts[t.symbol] = (counts[t.symbol] || 0) + 1);
        let mostTraded = "—";
        let mostTradedCount = 0;
        Object.entries(counts).forEach(([sym, cnt]) => {
            if (cnt > mostTradedCount) {
                mostTradedCount = cnt;
                mostTraded = sym;
            }
        });

        // Update DOM elements
        document.getElementById("analyticsTotalTrades").textContent = transactions.length;
        document.getElementById("analyticsBuySellRatio").textContent = `${buys.length} Buys / ${sells.length} Sells`;
        document.getElementById("analyticsWinRate").textContent = `${winRate}%`;
        document.getElementById("analyticsWinLossCount").textContent = `${winningSells.length} wins / ${losingSells.length} losses`;

        const plEl = document.getElementById("analyticsRealizedPL");
        plEl.textContent = `${totalRealizedPL >= 0 ? "+" : ""}${this.money(totalRealizedPL)}`;
        plEl.className = totalRealizedPL >= 0 ? "green" : "red";

        document.getElementById("analyticsAvgTradeVal").textContent = this.money(avgTradeVal);

        document.getElementById("analyticsLargestWin").textContent = `+${this.money(largestWin)}`;
        document.getElementById("analyticsLargestWinStock").textContent = largestWinStock;

        document.getElementById("analyticsLargestLoss").textContent = `-${this.money(Math.abs(largestLoss))}`;
        document.getElementById("analyticsLargestLossStock").textContent = largestLossStock;

        document.getElementById("analyticsMostTraded").textContent = mostTraded;
        document.getElementById("analyticsMostTradedCount").textContent = `${mostTradedCount} executed orders`;

        // Ratio Bars
        const totalClosed = sells.length;
        const winPercent = totalClosed > 0 ? (winningSells.length / totalClosed) * 100 : 50;
        const lossPercent = totalClosed > 0 ? (losingSells.length / totalClosed) * 100 : 50;

        document.getElementById("winBar").style.width = `${winPercent}%`;
        document.getElementById("lossBar").style.width = `${lossPercent}%`;
        document.getElementById("winLabel").textContent = `Profitable Trades: ${winningSells.length}`;
        document.getElementById("lossLabel").textContent = `Loss Trades: ${losingSells.length}`;

        const totalOrders = transactions.length;
        const buyPercent = totalOrders > 0 ? (buys.length / totalOrders) * 100 : 50;
        const sellPercent = totalOrders > 0 ? (sells.length / totalOrders) * 100 : 50;

        document.getElementById("buyBar").style.width = `${buyPercent}%`;
        document.getElementById("sellBar").style.width = `${sellPercent}%`;
        document.getElementById("buyLabel").textContent = `Buy Orders: ${buys.length}`;
        document.getElementById("sellLabel").textContent = `Sell Orders: ${sells.length}`;
    }

    /* --- Orders Transaction History --- */
    renderOrders() {
        const container = document.getElementById("ordersTable");
        if (!container || !this.user) return;

        let transactions = [...(this.user.portfolio.transactions || [])];

        // Apply filter
        if (this.currentOrdersFilter === "BUY") {
            transactions = transactions.filter(t => t.type === "BUY");
        } else if (this.currentOrdersFilter === "SELL") {
            transactions = transactions.filter(t => t.type === "SELL");
        } else if (this.currentOrdersFilter === "PROFIT") {
            transactions = transactions.filter(t => t.type === "SELL" && t.realizedProfit > 0);
        } else if (this.currentOrdersFilter === "LOSS") {
            transactions = transactions.filter(t => t.type === "SELL" && t.realizedProfit < 0);
        }

        // Apply sort
        switch (this.currentOrdersSort) {
            case "oldest":
                transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case "highest":
                transactions.sort((a, b) => b.total - a.total);
                break;
            case "lowest":
                transactions.sort((a, b) => a.total - b.total);
                break;
            case "newest":
            default:
                transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }

        if (!transactions.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No executed transactions matching current filter.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Date &amp; Time</th>
                        <th>Type</th>
                        <th>Stock</th>
                        <th>Shares</th>
                        <th>Execution Price</th>
                        <th>Total Value</th>
                        <th>Realized P/L</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(t => {
                        const dateObj = new Date(t.date);
                        const formattedDate = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
                        const formattedTime = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

                        return `
                            <tr>
                                <td>
                                    <span>${formattedDate}</span><br>
                                    <small class="muted">${formattedTime}</small>
                                </td>
                                <td>
                                    <span class="badge ${t.type === "BUY" ? "green" : "red"}">
                                        ${t.type}
                                    </span>
                                </td>
                                <td>
                                    <strong>${t.symbol}</strong>
                                </td>
                                <td>${t.quantity}</td>
                                <td>${this.money(t.price)}</td>
                                <td><strong>${this.money(t.total)}</strong></td>
                                <td>
                                    ${t.type === "SELL" ? `
                                        <span class="${t.realizedProfit >= 0 ? "green" : "red"}">
                                            ${t.realizedProfit >= 0 ? "+" : ""}${this.money(t.realizedProfit)}
                                        </span>
                                    ` : `<span class="muted">—</span>`}
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        `;
    }

    /* --- Simulated Leaderboard --- */
    renderLeaderboard() {
        const container = document.getElementById("leaderboardTable");
        if (!container || !this.user) return;

        const userTotal = this.user.portfolio.getTotalValue(this.market);
        const userReturn = ((userTotal - this.user.portfolio.initialCash) / this.user.portfolio.initialCash) * 100;

        // Merge simulated traders + current user
        const allTraders = [
            ...SIMULATED_TRADERS,
            {
                name: `${this.user.fullName} (You)`,
                username: this.user.username,
                balance: userTotal,
                returnPct: userReturn,
                trades: (this.user.portfolio.transactions || []).length,
                isUser: true
            }
        ];

        // Sort descending by portfolio value
        allTraders.sort((a, b) => b.balance - a.balance);

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Trader</th>
                        <th>Portfolio Value</th>
                        <th>Return %</th>
                        <th>Trades</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${allTraders.map((trader, index) => {
                        const rank = index + 1;
                        let rankClass = "rank-badge";
                        if (rank === 1) rankClass += " rank-1";
                        else if (rank === 2) rankClass += " rank-2";
                        else if (rank === 3) rankClass += " rank-3";
                        else if (trader.isUser) rankClass += " rank-user";

                        return `
                            <tr style="${trader.isUser ? "background: rgba(99, 102, 241, 0.12); font-weight: 600;" : ""}">
                                <td>
                                    <div class="${rankClass}">${rank}</div>
                                </td>
                                <td>
                                    <strong>${trader.name}</strong><br>
                                    <small class="muted">@${trader.username}</small>
                                </td>
                                <td><strong>${this.money(trader.balance)}</strong></td>
                                <td class="${trader.returnPct >= 0 ? "green" : "red"}">
                                    ${trader.returnPct >= 0 ? "+" : ""}${trader.returnPct.toFixed(2)}%
                                </td>
                                <td>${trader.trades}</td>
                                <td>
                                    ${trader.isUser
                                        ? `<span class="badge" style="background:var(--primary);color:#fff;">YOU</span>`
                                        : `<span class="badge">SIMULATED</span>`
                                    }
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        `;
    }

    /* --- Achievements System --- */
    checkAchievements() {
        if (!this.user) return;
        let newlyUnlocked = false;

        ACHIEVEMENTS_LIST.forEach(item => {
            if (!this.user.unlockedAchievements.includes(item.id)) {
                if (item.check(this.user, this)) {
                    this.user.unlockedAchievements.push(item.id);
                    newlyUnlocked = true;

                    this.toastMessage(`🎖️ Achievement Unlocked: "${item.name}"!`);
                    this.addNotification("Achievement Unlocked!", `You unlocked "${item.name}" — ${item.desc}`, "🎖️");
                    if (this.settings.sounds) this.sound.playSuccess();
                }
            }
        });

        if (newlyUnlocked) {
            this.auth.saveUser(this.user);
            this.renderAchievements();
        }
    }

    renderAchievements() {
        const grid = document.getElementById("achievementsGrid");
        const badge = document.getElementById("achievementsSummaryBadge");
        const fill = document.getElementById("achievementsFill");
        if (!grid || !this.user) return;

        const unlockedIds = this.user.unlockedAchievements || [];
        const total = ACHIEVEMENTS_LIST.length;
        const count = unlockedIds.length;
        const pct = Math.round((count / total) * 100);

        if (badge) badge.textContent = `${count} / ${total} Unlocked (${pct}%)`;
        if (fill) fill.style.width = `${pct}%`;

        grid.innerHTML = ACHIEVEMENTS_LIST.map(item => {
            const isUnlocked = unlockedIds.includes(item.id);
            const progressRatio = isUnlocked ? 1 : (item.progress ? item.progress(this.user, this) : 0);
            const progressPercent = Math.round(progressRatio * 100);

            return `
                <div class="achievement-card ${isUnlocked ? "unlocked" : "locked"}">
                    <div class="achievement-icon">${item.icon}</div>
                    <div class="achievement-info" style="flex:1;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h4>${item.name}</h4>
                            <span class="badge ${isUnlocked ? "green" : ""}">${isUnlocked ? "UNLOCKED" : "LOCKED"}</span>
                        </div>
                        <p>${item.desc}</p>
                        <div class="achievement-progress-wrap">
                            <div class="achievement-mini-track">
                                <div class="achievement-mini-fill" style="width: ${progressPercent}%;"></div>
                            </div>
                            <span class="achievement-progress-text">${progressPercent}% Completed</span>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }


    /* ==========================================================================
       SECTION 8: NATIVE HTML5 CANVAS CHARTS
       ========================================================================== */

    /* --- Portfolio Performance Interactive Line Chart --- */
    renderChart() {
        const canvas = document.getElementById("performanceChart");
        if (!canvas || !this.user) return;

        const ctx = canvas.getContext("2d");
        const container = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        const width = container.clientWidth;
        const height = 280;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, width, height);

        let history = [...(this.user.portfolio.history || [])];
        if (!history.length) {
            history = [{ value: this.user.portfolio.initialCash }];
        }

        // Slice based on timeframe
        if (this.currentChartRange !== "all") {
            const num = Number(this.currentChartRange);
            if (!isNaN(num) && num > 0) {
                history = history.slice(-num);
            }
        }

        const values = history.map(h => h.value);
        let minVal = Math.min(...values);
        let maxVal = Math.max(...values);

        // Add 5% padding to chart bounds
        if (minVal === maxVal) {
            minVal *= 0.95;
            maxVal *= 1.05;
        } else {
            const diff = maxVal - minVal;
            minVal -= diff * 0.05;
            maxVal += diff * 0.05;
        }

        const paddingLeft = 60;
        const paddingRight = 20;
        const paddingTop = 25;
        const paddingBottom = 30;

        const plotW = width - paddingLeft - paddingRight;
        const plotH = height - paddingTop - paddingBottom;

        // Draw horizontal grid lines & Y-axis labels
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1;
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "11px Inter, sans-serif";
        ctx.textAlign = "right";

        const gridSteps = 4;
        for (let i = 0; i <= gridSteps; i++) {
            const y = paddingTop + (plotH / gridSteps) * i;
            const labelVal = maxVal - ((maxVal - minVal) / gridSteps) * i;

            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(width - paddingRight, y);
            ctx.stroke();

            ctx.fillText(this.moneyCompact(labelVal), paddingLeft - 8, y + 4);
        }

        // Plot Points
        const points = values.map((val, idx) => {
            const x = paddingLeft + (idx / Math.max(values.length - 1, 1)) * plotW;
            const y = paddingTop + (1 - (val - minVal) / (maxVal - minVal)) * plotH;
            return { x, y, val };
        });

        // Fill Area under curve
        if (points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }

            ctx.lineTo(points[points.length - 1].x, height - paddingBottom);
            ctx.lineTo(points[0].x, height - paddingBottom);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
            gradient.addColorStop(0, "rgba(99, 102, 241, 0.28)");
            gradient.addColorStop(1, "rgba(99, 102, 241, 0.0)");
            ctx.fillStyle = gradient;
            ctx.fill();

            // Stroke the line
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = "#6366f1";
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Highlight latest current point
            const last = points[points.length - 1];
            ctx.beginPath();
            ctx.arc(last.x, last.y, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = "#6366f1";
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();
        }
    }

    /* --- Portfolio Allocation Donut Chart --- */
    renderAllocationChart() {
        const canvas = document.getElementById("allocationChart");
        if (!canvas || !this.user) return;

        const ctx = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
        const size = 170;

        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, size, size);

        const portfolio = this.user.portfolio;
        const total = portfolio.getTotalValue(this.market);
        const cash = portfolio.cash;

        const slices = [
            { label: "Cash", value: cash, color: "#6366f1" }
        ];

        const palette = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6", "#06b6d4"];
        let colorIdx = 0;

        Object.entries(portfolio.holdings).forEach(([sym, holding]) => {
            const stock = this.market[sym];
            if (stock) {
                slices.push({
                    label: sym,
                    value: holding.quantity * stock.price,
                    color: palette[colorIdx % palette.length]
                });
                colorIdx++;
            }
        });

        const centerX = size / 2;
        const centerY = size / 2;
        const outerRadius = 72;
        const innerRadius = 50;

        let startAngle = -Math.PI / 2;

        slices.forEach(slice => {
            const portion = total > 0 ? (slice.value / total) : 0;
            const sliceAngle = portion * Math.PI * 2;
            const endAngle = startAngle + sliceAngle;

            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
            ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            ctx.closePath();

            ctx.fillStyle = slice.color;
            ctx.fill();

            startAngle = endAngle;
        });

        // Center Cash Percentage
        const cashPct = total > 0 ? Math.round((cash / total) * 100) : 100;
        const donutCashPercent = document.getElementById("donutCashPercent");
        if (donutCashPercent) donutCashPercent.textContent = `${cashPct}%`;

        // Render Legend
        const legendContainer = document.getElementById("allocationLegend");
        if (legendContainer) {
            legendContainer.innerHTML = slices.map(s => {
                const pct = total > 0 ? ((s.value / total) * 100).toFixed(1) : "0.0";
                return `
                    <div class="legend-item">
                        <span style="display:flex; align-items:center;">
                            <span class="legend-dot" style="background:${s.color};"></span>
                            ${s.label}
                        </span>
                        <strong>${pct}%</strong>
                    </div>
                `;
            }).join("");
        }

        // Diversification Score Indicator
        const positionsCount = Object.keys(portfolio.holdings).length;
        let score = "Low";
        let barFill = "25%";
        let badgeClass = "badge";

        if (positionsCount >= 5 && cashPct <= 50) {
            score = "High";
            barFill = "100%";
            badgeClass = "badge green";
        } else if (positionsCount >= 2) {
            score = "Moderate";
            barFill = "65%";
            badgeClass = "badge";
        }

        const divText = document.getElementById("diversificationText");
        if (divText) divText.textContent = score;

        const divBadge = document.getElementById("diversificationBadge");
        if (divBadge) {
            divBadge.textContent = score;
            divBadge.className = badgeClass;
        }

        const divBarFill = document.getElementById("diversificationBarFill");
        if (divBarFill) divBarFill.style.width = barFill;
    }


    /* ==========================================================================
       SECTION 9: STOCK DETAILS MODAL & SPARKLINE
       ========================================================================== */

    openStockDetails(symbol) {
        const stock = this.market[symbol];
        if (!stock) return;

        this.selectedStock = stock;
        this.updateStockDetailsModal(stock);
        this.stockDetailsModal.classList.remove("hidden");
    }

    updateStockDetailsModal(stock) {
        document.getElementById("detailsLogo").textContent = stock.symbol.charAt(0);
        document.getElementById("detailsSymbol").textContent = stock.symbol;
        document.getElementById("detailsCompany").textContent = `${stock.name} • ${stock.sector}`;

        const changeEl = document.getElementById("detailsChange");
        changeEl.textContent = `${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}%`;
        changeEl.className = `badge ${stock.change >= 0 ? "green" : "red"}`;

        document.getElementById("detailsPrice").textContent = this.money(stock.price);
        document.getElementById("detailsPrevPrice").textContent = this.money(stock.previousPrice);
        document.getElementById("detailsDayHigh").textContent = this.money(stock.dayHigh);
        document.getElementById("detailsDayLow").textContent = this.money(stock.dayLow);
        document.getElementById("detailsVolume").textContent = `${(stock.volume / 1000000).toFixed(2)}M`;

        // User position in this stock
        document.getElementById("detailsPositionSymbol").textContent = stock.symbol;
        const holding = this.user && this.user.portfolio.holdings[stock.symbol];

        if (holding && holding.quantity > 0) {
            const val = holding.quantity * stock.price;
            const cost = holding.quantity * holding.averagePrice;
            const pl = val - cost;

            document.getElementById("detailsOwnedShares").textContent = `${holding.quantity} shares`;
            document.getElementById("detailsAvgPrice").textContent = this.money(holding.averagePrice);
            document.getElementById("detailsPositionValue").textContent = this.money(val);

            const plEl = document.getElementById("detailsUnrealizedPL");
            plEl.textContent = `${pl >= 0 ? "+" : ""}${this.money(pl)}`;
            plEl.className = pl >= 0 ? "green" : "red";
        } else {
            document.getElementById("detailsOwnedShares").textContent = "0 shares";
            document.getElementById("detailsAvgPrice").textContent = "$0.00";
            document.getElementById("detailsPositionValue").textContent = "$0.00";
            document.getElementById("detailsUnrealizedPL").textContent = "$0.00";
        }

        // Watchlist button text
        const isWatched = this.user && this.user.watchlist.includes(stock.symbol);
        document.getElementById("detailsWatchlistBtn").textContent = isWatched
            ? "★ In Watchlist"
            : "☆ Add to Watchlist";

        // Draw interactive sparkline chart
        this.renderStockSparkline(stock);
    }

    renderStockSparkline(stock) {
        const canvas = document.getElementById("stockDetailsChart");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const container = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        const width = container.clientWidth;
        const height = 120;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, width, height);

        const history = stock.history || [stock.price];
        const minVal = Math.min(...history) * 0.995;
        const maxVal = Math.max(...history) * 1.005;

        const pad = 15;
        const plotW = width - (pad * 2);
        const plotH = height - (pad * 2);

        const points = history.map((val, idx) => {
            const x = pad + (idx / Math.max(history.length - 1, 1)) * plotW;
            const y = pad + (1 - (val - minVal) / (maxVal - minVal)) * plotH;
            return { x, y };
        });

        if (points.length > 0) {
            // Gradient fill
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.lineTo(points[points.length - 1].x, height - pad);
            ctx.lineTo(points[0].x, height - pad);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(0, pad, 0, height - pad);
            const isUp = stock.change >= 0;
            gradient.addColorStop(0, isUp ? "rgba(34, 197, 94, 0.28)" : "rgba(239, 68, 68, 0.28)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = gradient;
            ctx.fill();

            // Line stroke
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = isUp ? "#22c55e" : "#ef4444";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }


    /* ==========================================================================
       SECTION 10: ADVANCED BUY / SELL ORDER EXECUTION
       ========================================================================== */

    openTradeModal(symbol, type = "BUY") {
        const stock = this.market[symbol];
        if (!stock) return;

        this.selectedStock = stock;
        this.tradeType = type;

        document.getElementById("tradeSymbol").textContent = symbol;
        document.getElementById("tradeCompany").textContent = stock.name;
        document.getElementById("tradeLogo").textContent = symbol.charAt(0);
        document.getElementById("tradeCurrentPriceBadge").textContent = this.money(stock.price);

        const tradeStockSelect = document.getElementById("tradeStockSelect");
        if (tradeStockSelect) tradeStockSelect.value = symbol;

        document.getElementById("tradeQuantity").value = 1;
        document.getElementById("tradeMessage").className = "form-message";
        document.getElementById("tradeMessage").textContent = "";

        this.setTradeType(type);
        this.updateTradeModal();

        this.tradeModal.classList.remove("hidden");
    }

    closeTradeModal() {
        this.tradeModal.classList.add("hidden");
    }

    setTradeType(type) {
        this.tradeType = type;
        const buyTab = document.getElementById("buyTab");
        const sellTab = document.getElementById("sellTab");
        const execBtn = document.getElementById("executeTrade");

        if (type === "BUY") {
            buyTab.classList.add("active");
            sellTab.classList.remove("active");
            execBtn.textContent = `Buy ${this.selectedStock ? this.selectedStock.symbol : "Stock"}`;
            execBtn.className = "primary-btn trade-button";
        } else {
            sellTab.classList.add("active");
            buyTab.classList.remove("active");
            execBtn.textContent = `Sell ${this.selectedStock ? this.selectedStock.symbol : "Stock"}`;
            execBtn.className = "primary-btn trade-button";
            execBtn.style.background = "linear-gradient(135deg, var(--danger), #b91c1c)";
        }

        this.updateTradeModal();
    }

    updateTradeModal() {
        if (!this.selectedStock || !this.user) return;

        const qtyInput = document.getElementById("tradeQuantity");
        let quantity = Math.floor(Number(qtyInput.value));

        if (isNaN(quantity) || quantity < 1) {
            quantity = 1;
        }

        const price = this.selectedStock.price;
        const total = quantity * price;

        document.getElementById("tradePrice").textContent = this.money(price);
        document.getElementById("estimatedTotal").textContent = this.money(total);
        document.getElementById("availableCash").textContent = this.money(this.user.portfolio.cash);

        const holding = this.user.portfolio.holdings[this.selectedStock.symbol];
        const owned = holding ? holding.quantity : 0;
        document.getElementById("quantityOwnedLabel").textContent = `Owned: ${owned} shares`;

        // If selling, calculate estimated realized profit/loss
        const sellPLRow = document.getElementById("tradeSellPLRow");
        if (this.tradeType === "SELL" && holding) {
            const costBasis = quantity * holding.averagePrice;
            const estimatedPL = total - costBasis;

            sellPLRow.classList.remove("hidden");
            const plEl = document.getElementById("estimatedSellPL");
            plEl.textContent = `${estimatedPL >= 0 ? "+" : ""}${this.money(estimatedPL)}`;
            plEl.className = estimatedPL >= 0 ? "green" : "red";
        } else {
            sellPLRow.classList.add("hidden");
        }
    }

    executeTrade() {
        const qtyInput = document.getElementById("tradeQuantity");
        const quantity = Math.floor(Number(qtyInput.value));

        if (isNaN(quantity) || quantity <= 0) {
            this.showFormMessage("tradeMessage", "Please enter a valid whole share quantity greater than zero.", "error");
            return;
        }

        try {
            let transaction;

            if (this.tradeType === "BUY") {
                transaction = this.user.portfolio.buy(this.selectedStock, quantity);
                this.toastMessage(`Bought ${quantity} shares of ${this.selectedStock.symbol} @ ${this.money(transaction.price)}`);
                this.addNotification("Order Executed: BUY", `Purchased ${quantity} shares of ${this.selectedStock.symbol} for ${this.money(transaction.total)}.`, "📈");
            } else {
                transaction = this.user.portfolio.sell(this.selectedStock, quantity);
                const plText = transaction.realizedProfit >= 0
                    ? `Profit: +${this.money(transaction.realizedProfit)}`
                    : `Loss: -${this.money(Math.abs(transaction.realizedProfit))}`;

                this.toastMessage(`Sold ${quantity} shares of ${this.selectedStock.symbol} (${plText})`);
                this.addNotification("Order Executed: SELL", `Sold ${quantity} shares of ${this.selectedStock.symbol} for ${this.money(transaction.total)} (${plText}).`, "🧾");
            }

            if (this.settings.sounds) {
                this.sound.playSuccess();
            }

            this.auth.saveUser(this.user);
            this.closeTradeModal();
            this.checkAchievements();
            this.renderEverything();
        } catch (error) {
            this.showFormMessage("tradeMessage", error.message, "error");
        }
    }


    /* ==========================================================================
       SECTION 11: PRICE ALERTS SYSTEM
       ========================================================================== */

    openPriceAlertModal(prefillSymbol = null) {
        if (prefillSymbol) {
            const select = document.getElementById("alertStockSelect");
            if (select) select.value = prefillSymbol;
            const stock = this.market[prefillSymbol];
            if (stock) {
                document.getElementById("alertTargetPrice").value = stock.price.toFixed(2);
            }
        }
        this.renderAlertsList();
        this.priceAlertModal.classList.remove("hidden");
    }

    handleCreateAlert() {
        const symbol = document.getElementById("alertStockSelect").value;
        const condition = document.getElementById("alertCondition").value;
        const targetPrice = parseFloat(document.getElementById("alertTargetPrice").value);

        if (isNaN(targetPrice) || targetPrice <= 0) {
            this.toastMessage("Please enter a valid target price.");
            return;
        }

        const alert = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
            symbol,
            condition, // "ABOVE" or "BELOW"
            targetPrice: +targetPrice.toFixed(2),
            triggered: false,
            createdAt: new Date().toISOString()
        };

        this.alerts.push(alert);
        this.saveAlerts();
        this.renderAlertsList();

        const condLabel = condition === "ABOVE" ? "rises above" : "drops below";
        this.toastMessage(`Alert set: ${symbol} ${condLabel} $${targetPrice.toFixed(2)}`);
        this.addNotification("Price Alert Created", `Notify when ${symbol} ${condLabel} $${targetPrice.toFixed(2)}`, "🔔");
    }

    deleteAlert(id) {
        this.alerts = this.alerts.filter(a => a.id !== id);
        this.saveAlerts();
        this.renderAlertsList();
        this.toastMessage("Price alert removed.");
    }

    checkPriceAlerts() {
        this.alerts.forEach(alert => {
            if (alert.triggered) return;

            const stock = this.market[alert.symbol];
            if (!stock) return;

            let conditionMet = false;
            if (alert.condition === "ABOVE" && stock.price >= alert.targetPrice) {
                conditionMet = true;
            } else if (alert.condition === "BELOW" && stock.price <= alert.targetPrice) {
                conditionMet = true;
            }

            if (conditionMet) {
                alert.triggered = true;
                this.saveAlerts();

                const condText = alert.condition === "ABOVE" ? "crossed above" : "dropped below";
                const msg = `${alert.symbol} ${condText} target price $${alert.targetPrice.toFixed(2)} (Current: ${this.money(stock.price)})`;

                this.toastMessage(`🔔 Price Alert Triggered: ${msg}`);
                this.addNotification("Price Alert Triggered!", msg, "⚡");

                if (this.settings.sounds) {
                    this.sound.playAlert();
                }
            }
        });
    }

    renderAlertsList() {
        const container = document.getElementById("alertsList");
        const countBadge = document.getElementById("alertsCountBadge");
        if (!container) return;

        if (countBadge) countBadge.textContent = this.alerts.length;

        if (!this.alerts.length) {
            container.innerHTML = `<p class="muted" style="text-align:center; padding: 16px 0; font-size:12px;">No price alerts created yet.</p>`;
            return;
        }

        container.innerHTML = this.alerts.map(a => `
            <div class="alert-item ${a.triggered ? "triggered" : ""}">
                <div>
                    <strong>${a.symbol}</strong>
                    <span>${a.condition === "ABOVE" ? "≥" : "≤"} $${a.targetPrice.toFixed(2)}</span>
                    <small style="display:block; color:var(--text-dim); font-size:10px;">
                        ${a.triggered ? "✓ Triggered" : "Active"}
                    </small>
                </div>
                <button class="text-btn danger" onclick="app.deleteAlert('${a.id}')">Delete</button>
            </div>
        `).join("");
    }


    /* ==========================================================================
       SECTION 12: GLOBAL STOCK SEARCH ENGINE
       ========================================================================== */

    handleGlobalSearch(query) {
        const term = (query || "").trim().toLowerCase();
        if (!term) {
            this.searchSuggestions.classList.add("hidden");
            this.searchSuggestions.innerHTML = "";
            return;
        }

        const matches = Object.values(this.market).filter(stock =>
            stock.symbol.toLowerCase().includes(term) ||
            stock.name.toLowerCase().includes(term)
        ).slice(0, 6);

        if (!matches.length) {
            this.searchSuggestions.innerHTML = `<div style="padding:10px; color:var(--text-dim); font-size:12px;">No stocks matching "${query}"</div>`;
            this.searchSuggestions.classList.remove("hidden");
            return;
        }

        this.searchSuggestions.innerHTML = matches.map(stock => `
            <div class="suggestion-item" onclick="app.selectSearchResult('${stock.symbol}')">
                <div class="suggestion-left">
                    <div class="stock-logo">${stock.symbol.charAt(0)}</div>
                    <div>
                        <strong>${stock.symbol}</strong>
                        <small>${stock.name}</small>
                    </div>
                </div>
                <div class="suggestion-right">
                    <strong>${this.money(stock.price)}</strong>
                    <small class="${stock.change >= 0 ? "green" : "red"}">
                        ${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}%
                    </small>
                </div>
            </div>
        `).join("");

        this.searchSuggestions.classList.remove("hidden");
    }

    selectSearchResult(symbol) {
        this.searchSuggestions.classList.add("hidden");
        this.globalSearchInput.value = "";
        this.openStockDetails(symbol);
    }


    /* ==========================================================================
       SECTION 13: NOTIFICATIONS & SETTINGS MODALS
       ========================================================================== */

    openNotifModal() {
        this.renderNotifList();
        this.notifModal.classList.remove("hidden");
    }

    renderNotifList() {
        const list = document.getElementById("notifList");
        if (!list) return;

        if (!this.notifications.length) {
            list.innerHTML = `<p class="muted" style="text-align:center; padding: 24px 0; font-size: 13px;">No notifications yet.</p>`;
            return;
        }

        list.innerHTML = this.notifications.map(n => `
            <div class="notif-item ${n.read ? "" : "unread"}">
                <div class="notif-icon">${n.icon || "🔔"}</div>
                <div class="notif-content">
                    <strong>${n.title}</strong>
                    <p>${n.message}</p>
                    <small>${new Date(n.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
                </div>
            </div>
        `).join("");
    }

    openSettingsModal() {
        this.applySettings();
        this.settingsModal.classList.remove("hidden");
    }


    /* ==========================================================================
       SECTION 14: FORMATTING & UTILITIES
       ========================================================================== */

    money(val) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val || 0);
    }

    moneyCompact(val) {
        if (Math.abs(val) >= 1000000) {
            return "$" + (val / 1000000).toFixed(1) + "M";
        }
        if (Math.abs(val) >= 1000) {
            return "$" + (val / 1000).toFixed(1) + "k";
        }
        return "$" + Math.round(val);
    }

    toastMessage(message) {
        if (!this.toast) return;
        this.toast.textContent = message;
        this.toast.classList.add("show");

        if (this.toastTimer) clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            this.toast.classList.remove("show");
        }, 3200);
    }
}


/* ==========================================================================
   SECTION 15: APPLICATION INITIALIZATION
   ========================================================================== */

let app;
window.addEventListener("DOMContentLoaded", () => {
    app = new TradingApp();
});
