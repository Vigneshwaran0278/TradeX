/* =========================================================
   TRADEX STOCK TRADING SIMULATOR
   Pure HTML + CSS + JavaScript
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const STORAGE_KEY = "tradex_accounts_v3";

const STARTING_BALANCE = 100000;


/* =========================================================
   STOCK DATABASE
========================================================= */

const STOCK_DATA = [

    {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 228.35
    },

    {
        symbol: "MSFT",
        name: "Microsoft",
        price: 505.12
    },

    {
        symbol: "GOOGL",
        name: "Alphabet",
        price: 186.74
    },

    {
        symbol: "AMZN",
        name: "Amazon",
        price: 231.42
    },

    {
        symbol: "NVDA",
        name: "NVIDIA",
        price: 178.26
    },

    {
        symbol: "TSLA",
        name: "Tesla",
        price: 342.17
    },

    {
        symbol: "META",
        name: "Meta Platforms",
        price: 765.45
    },

    {
        symbol: "NFLX",
        name: "Netflix",
        price: 1248.21
    },

    {
        symbol: "JPM",
        name: "JPMorgan Chase",
        price: 302.91
    },

    {
        symbol: "AMD",
        name: "AMD",
        price: 164.33
    },

    {
        symbol: "INTC",
        name: "Intel",
        price: 36.82
    },

    {
        symbol: "COST",
        name: "Costco",
        price: 985.21
    }

];


/* =========================================================
   OOP — STOCK
========================================================= */

class Stock {

    constructor(symbol, name, price) {

        this.symbol = symbol;

        this.name = name;

        this.price = price;

        this.previousPrice = price;

        this.change = 0;

    }


    updatePrice() {

        this.previousPrice = this.price;

        const volatility =
            (Math.random() - 0.5) * 0.018;

        this.price =
            this.price * (1 + volatility);

        this.change =
            ((this.price - this.previousPrice)
            / this.previousPrice) * 100;

    }


    getDirection() {

        if (this.price > this.previousPrice) {
            return "up";
        }

        if (this.price < this.previousPrice) {
            return "down";
        }

        return "same";

    }

}


/* =========================================================
   OOP — TRANSACTION
========================================================= */

class Transaction {

    constructor(
        symbol,
        type,
        quantity,
        price
    ) {

        this.id =
            Date.now() +
            Math.random()
                .toString(36)
                .substring(2);

        this.symbol = symbol;

        this.type = type;

        this.quantity = quantity;

        this.price = price;

        this.total =
            quantity * price;

        this.date =
            new Date().toISOString();

    }

}


/* =========================================================
   OOP — PORTFOLIO
========================================================= */

class Portfolio {

    constructor(data = {}) {

        this.cash =
            data.cash ?? STARTING_BALANCE;

        this.initialCash =
            data.initialCash ??
            STARTING_BALANCE;

        this.holdings =
            data.holdings ?? {};

        this.transactions =
            data.transactions ?? [];

        this.history =
            data.history ?? [];

    }


    buy(stock, quantity) {

        const total =
            stock.price * quantity;

        if (quantity <= 0) {

            throw new Error(
                "Quantity must be greater than zero."
            );

        }

        if (total > this.cash) {

            throw new Error(
                "Insufficient cash balance."
            );

        }


        this.cash -= total;


        if (!this.holdings[stock.symbol]) {

            this.holdings[stock.symbol] = {

                quantity: 0,

                averagePrice: 0

            };

        }


        const holding =
            this.holdings[stock.symbol];


        const oldValue =
            holding.quantity *
            holding.averagePrice;


        const newValue =
            quantity *
            stock.price;


        holding.quantity += quantity;


        holding.averagePrice =
            (oldValue + newValue) /
            holding.quantity;


        const transaction =
            new Transaction(
                stock.symbol,
                "BUY",
                quantity,
                stock.price
            );


        this.transactions.unshift(
            transaction
        );


        return transaction;

    }


    sell(stock, quantity) {

        const holding =
            this.holdings[stock.symbol];


        if (!holding ||
            holding.quantity < quantity) {

            throw new Error(
                "You do not own enough shares."
            );

        }


        if (quantity <= 0) {

            throw new Error(
                "Quantity must be greater than zero."
            );

        }


        this.cash +=
            stock.price * quantity;


        holding.quantity -= quantity;


        if (holding.quantity === 0) {

            delete this.holdings[
                stock.symbol
            ];

        }


        const transaction =
            new Transaction(
                stock.symbol,
                "SELL",
                quantity,
                stock.price
            );


        this.transactions.unshift(
            transaction
        );


        return transaction;

    }


    getInvestedValue(market) {

        return Object.entries(
            this.holdings
        ).reduce(

            (total, [symbol, holding]) => {

                const stock =
                    market[symbol];

                if (!stock) {
                    return total;
                }

                return total +
                    holding.quantity *
                    stock.price;

            },

            0
        );

    }


    getTotalValue(market) {

        return this.cash +
            this.getInvestedValue(market);

    }


    getProfit(market) {

        return this.getTotalValue(market)
            - this.initialCash;

    }


    recordHistory(market) {

        this.history.push({

            date: new Date().toISOString(),

            value:
                this.getTotalValue(market)

        });


        if (this.history.length > 100) {

            this.history.shift();

        }

    }

}


/* =========================================================
   OOP — USER
========================================================= */

class User {

    constructor(data) {

        this.id =
            data.id ||
            crypto.randomUUID();

        this.fullName =
            data.fullName;

        this.username =
            data.username;

        this.email =
            data.email;

        this.passwordHash =
            data.passwordHash;

        this.portfolio =
            new Portfolio(
                data.portfolio
            );

        this.watchlist =
            data.watchlist ||
            [];

        this.createdAt =
            data.createdAt ||
            new Date().toISOString();

    }


    serialize() {

        return {

            id: this.id,

            fullName: this.fullName,

            username: this.username,

            email: this.email,

            passwordHash:
                this.passwordHash,

            portfolio: this.portfolio,

            watchlist:
                this.watchlist,

            createdAt:
                this.createdAt

        };

    }

}


/* =========================================================
   AUTH MANAGER
========================================================= */

class AuthManager {

    constructor() {

        this.data =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                )
            ) || {

                users: {},

                currentUser: null

            };

    }


    save() {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(this.data)

        );

    }


    async hashPassword(password) {

        const encoder =
            new TextEncoder();

        const data =
            encoder.encode(password);

        const hash =
            await crypto.subtle.digest(
                "SHA-256",
                data
            );

        return Array.from(
            new Uint8Array(hash)
        )
        .map(
            b =>
                b.toString(16)
                 .padStart(2, "0")
        )
        .join("");

    }


    usernameExists(username) {

        return !!this.data.users[
            username.toLowerCase()
        ];

    }


    emailExists(email) {

        return Object.values(
            this.data.users
        )
        .some(
            user =>
                user.email.toLowerCase()
                === email.toLowerCase()
        );

    }


    async register(
        fullName,
        username,
        email,
        password
    ) {

        username =
            username.trim();

        email =
            email.trim();


        if (fullName.trim().length < 2) {

            throw new Error(
                "Enter a valid full name."
            );

        }


        if (
            !/^[a-zA-Z0-9_]{3,20}$/
                .test(username)
        ) {

            throw new Error(
                "Username must contain 3–20 letters, numbers or underscores."
            );

        }


        if (
            !/^\S+@\S+\.\S+$/
                .test(email)
        ) {

            throw new Error(
                "Enter a valid email address."
            );

        }


        if (password.length < 6) {

            throw new Error(
                "Password must contain at least 6 characters."
            );

        }


        if (
            this.usernameExists(username)
        ) {

            throw new Error(
                "Username already exists."
            );

        }


        if (
            this.emailExists(email)
        ) {

            throw new Error(
                "Email already exists."
            );

        }


        const passwordHash =
            await this.hashPassword(
                password
            );


        const user =
            new User({

                fullName,

                username,

                email,

                passwordHash

            });


        this.data.users[
            username.toLowerCase()
        ] =
            user.serialize();


        this.data.currentUser =
            username.toLowerCase();


        this.save();


        return user;

    }


    async login(identity, password) {

        const key =
            identity.trim().toLowerCase();


        let user =
            this.data.users[key];


        if (!user) {

            user =
                Object.values(
                    this.data.users
                )
                .find(
                    u =>
                        u.email.toLowerCase()
                        === key
                );

        }


        if (!user) {

            throw new Error(
                "Account not found."
            );

        }


        const hash =
            await this.hashPassword(
                password
            );


        if (
            hash !== user.passwordHash
        ) {

            throw new Error(
                "Incorrect password."
            );

        }


        this.data.currentUser =
            user.username.toLowerCase();


        this.save();


        return new User(user);

    }


    getCurrentUser() {

        const key =
            this.data.currentUser;

        if (!key) {
            return null;
        }


        const user =
            this.data.users[key];

        if (!user) {
            return null;
        }


        return new User(user);

    }


    saveUser(user) {

        this.data.users[
            user.username.toLowerCase()
        ] =
            user.serialize();

        this.save();

    }


    logout() {

        this.data.currentUser =
            null;

        this.save();

    }

}


/* =========================================================
   TRADING APPLICATION
========================================================= */

class TradingApp {

    constructor() {

        this.auth =
            new AuthManager();

        this.user = null;

        this.market = {};

        this.selectedStock = null;

        this.tradeType = "BUY";


        STOCK_DATA.forEach(
            data => {

                this.market[data.symbol] =
                    new Stock(
                        data.symbol,
                        data.name,
                        data.price
                    );

            }
        );


        this.cacheDOM();

        this.bindEvents();

        this.checkAuthentication();

    }


    cacheDOM() {

        this.authScreen =
            document.getElementById(
                "authScreen"
            );

        this.appScreen =
            document.getElementById(
                "appScreen"
            );

        this.loginForm =
            document.getElementById(
                "loginForm"
            );

        this.registerForm =
            document.getElementById(
                "registerForm"
            );

        this.toast =
            document.getElementById(
                "toast"
            );

        this.modal =
            document.getElementById(
                "tradeModal"
            );

    }


    bindEvents() {

        /* AUTH TABS */

        document
            .querySelectorAll(".auth-tab")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".auth-tab"
                            )
                            .forEach(
                                b =>
                                    b.classList
                                     .remove("active")
                            );


                        button.classList
                            .add("active");


                        const mode =
                            button.dataset.auth;


                        if (
                            mode === "login"
                        ) {

                            this.loginForm
                                .classList
                                .remove("hidden");

                            this.registerForm
                                .classList
                                .add("hidden");

                        } else {

                            this.loginForm
                                .classList
                                .add("hidden");

                            this.registerForm
                                .classList
                                .remove("hidden");

                        }

                    }
                );

            });


        /* LOGIN */

        this.loginForm
            .addEventListener(
                "submit",
                e => {

                    e.preventDefault();

                    this.handleLogin();

                }
            );


        /* REGISTER */

        this.registerForm
            .addEventListener(
                "submit",
                e => {

                    e.preventDefault();

                    this.handleRegister();

                }
            );


        /* LOGOUT */

        document
            .getElementById("logoutBtn")
            .addEventListener(
                "click",
                () => {

                    this.auth.logout();

                    location.reload();

                }
            );


        /* NAVIGATION */

        document
            .querySelectorAll(".nav-item")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        this.showSection(
                            button.dataset.section
                        );

                    }
                );

            });


        /* SEARCH */

        document
            .getElementById("stockSearch")
            .addEventListener(
                "input",
                e => {

                    this.renderMarkets(
                        e.target.value
                    );

                }
            );


        /* CHART RANGE */

        document
            .getElementById("chartRange")
            .addEventListener(
                "change",
                () =>
                    this.renderChart()
            );


        /* MODAL */

        document
            .getElementById("closeModal")
            .addEventListener(
                "click",
                () =>
                    this.closeTradeModal()
            );


        this.modal.addEventListener(
            "click",
            e => {

                if (
                    e.target ===
                    this.modal
                ) {

                    this.closeTradeModal();

                }

            }
        );


        /* BUY / SELL */

        document
            .getElementById("buyTab")
            .addEventListener(
                "click",
                () => {

                    this.tradeType =
                        "BUY";

                    this.updateTradeModal();

                }
            );


        document
            .getElementById("sellTab")
            .addEventListener(
                "click",
                () => {

                    this.tradeType =
                        "SELL";

                    this.updateTradeModal();

                }
            );


        document
            .getElementById(
                "tradeQuantity"
            )
            .addEventListener(
                "input",
                () =>
                    this.updateTradeModal()
            );


        document
            .getElementById(
                "executeTrade"
            )
            .addEventListener(
                "click",
                () =>
                    this.executeTrade()
            );

    }


    async handleLogin() {

        const identity =
            document.getElementById(
                "loginIdentity"
            ).value;

        const password =
            document.getElementById(
                "loginPassword"
            ).value;


        try {

            this.user =
                await this.auth.login(
                    identity,
                    password
                );


            this.showApp();

        }

        catch(error) {

            this.showFormMessage(
                "loginMessage",
                error.message,
                "error"
            );

        }

    }


    async handleRegister() {

        const name =
            document.getElementById(
                "registerName"
            ).value;

        const username =
            document.getElementById(
                "registerUsername"
            ).value;

        const email =
            document.getElementById(
                "registerEmail"
            ).value;

        const password =
            document.getElementById(
                "registerPassword"
            ).value;

        const confirm =
            document.getElementById(
                "registerConfirm"
            ).value;


        if (password !== confirm) {

            this.showFormMessage(
                "registerMessage",
                "Passwords do not match.",
                "error"
            );

            return;

        }


        try {

            this.user =
                await this.auth.register(
                    name,
                    username,
                    email,
                    password
                );


            this.showFormMessage(
                "registerMessage",
                "Account created successfully!",
                "success"
            );


            setTimeout(
                () =>
                    this.showApp(),
                500
            );

        }

        catch(error) {

            this.showFormMessage(
                "registerMessage",
                error.message,
                "error"
            );

        }

    }


    showFormMessage(
        id,
        message,
        type
    ) {

        const element =
            document.getElementById(id);

        element.textContent =
            message;

        element.className =
            `form-message ${type}`;

    }


    checkAuthentication() {

        const current =
            this.auth.getCurrentUser();


        if (current) {

            this.user =
                current;

            this.showApp();

        }

    }


    showApp() {

        this.authScreen
            .classList
            .add("hidden");

        this.appScreen
            .classList
            .remove("hidden");


        this.updateUserUI();

        this.renderEverything();

        this.startMarket();

    }


    updateUserUI() {

        document.getElementById(
            "userName"
        ).textContent =
            this.user.fullName;


        document.getElementById(
            "userEmail"
        ).textContent =
            this.user.email;


        document.getElementById(
            "welcomeText"
        ).textContent =
            `Welcome back, ${this.user.fullName.split(" ")[0]}!`;


        document.getElementById(
            "userAvatar"
        ).textContent =
            this.user.fullName
                .charAt(0)
                .toUpperCase();

    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    showSection(section) {

        document
            .querySelectorAll(".page-section")
            .forEach(
                s =>
                    s.classList.add(
                        "hidden"
                    )
            );


        document
            .getElementById(
                `${section}Section`
            )
            .classList.remove(
                "hidden"
            );


        document
            .querySelectorAll(".nav-item")
            .forEach(
                n =>
                    n.classList.remove(
                        "active"
                    )
            );


        const active =
            document.querySelector(
                `.nav-item[data-section="${section}"]`
            );


        if (active) {

            active.classList.add(
                "active"
            );

        }


        const titles = {

            dashboard: "Dashboard",

            markets: "Markets",

            portfolio: "Portfolio",

            orders: "Order History",

            watchlist: "Watchlist"

        };


        document.getElementById(
            "pageTitle"
        ).textContent =
            titles[section];

    }


    /* =====================================================
       MARKET SIMULATION
    ===================================================== */

    startMarket() {

        if (this.marketTimer) {
            clearInterval(
                this.marketTimer
            );
        }


        this.marketTimer =
            setInterval(
                () => {

                    Object.values(
                        this.market
                    )
                    .forEach(
                        stock =>
                            stock.updatePrice()
                    );


                    this.user.portfolio
                        .recordHistory(
                            this.market
                        );


                    this.auth.saveUser(
                        this.user
                    );


                    this.renderEverything();

                },

                2500
            );

    }


    /* =====================================================
       RENDER EVERYTHING
    ===================================================== */

    renderEverything() {

        this.renderStats();

        this.renderMovers();

        this.renderDashboardHoldings();

        this.renderMarkets();

        this.renderPortfolio();

        this.renderOrders();

        this.renderWatchlist();

        this.renderChart();

    }


    /* =====================================================
       STATS
    ===================================================== */

    renderStats() {

        const portfolio =
            this.user.portfolio;


        const total =
            portfolio.getTotalValue(
                this.market
            );


        const invested =
            portfolio.getInvestedValue(
                this.market
            );


        const profit =
            total -
            portfolio.initialCash;


        const profitPercent =
            (profit /
            portfolio.initialCash)
            * 100;


        document.getElementById(
            "totalPortfolio"
        ).textContent =
            this.money(total);


        document.getElementById(
            "cashBalance"
        ).textContent =
            this.money(
                portfolio.cash
            );


        document.getElementById(
            "investedValue"
        ).textContent =
            this.money(invested);


        document.getElementById(
            "totalProfit"
        ).textContent =
            this.money(profit);


        document.getElementById(
            "profitPercent"
        ).textContent =
            `${profitPercent >= 0 ? "+" : ""}${profitPercent.toFixed(2)}%`;


        const change =
            document.getElementById(
                "portfolioChange"
            );


        change.textContent =
            `${profitPercent >= 0 ? "+" : ""}${profitPercent.toFixed(2)}%`;


        change.className =
            profit >= 0
                ? "green"
                : "red";


        document.getElementById(
            "totalProfit"
        ).className =
            profit >= 0
                ? "green"
                : "red";


        document.getElementById(
            "portfolioPageValue"
        ).textContent =
            this.money(total);


        document.getElementById(
            "portfolioPageCash"
        ).textContent =
            this.money(
                portfolio.cash
            );


        const pageProfit =
            document.getElementById(
                "portfolioPageProfit"
            );


        pageProfit.textContent =
            this.money(profit);


        pageProfit.className =
            profit >= 0
                ? "green"
                : "red";

    }


    /* =====================================================
       MARKET MOVERS
    ===================================================== */

    renderMovers() {

        const container =
            document.getElementById(
                "marketMovers"
            );


        const stocks =
            Object.values(
                this.market
            )
            .sort(
                (a,b) =>
                    Math.abs(b.change)
                    -
                    Math.abs(a.change)
            )
            .slice(0,5);


        container.innerHTML =
            stocks.map(
                stock => `

                <div class="mover">

                    <div class="mover-left">

                        <div class="stock-logo">
                            ${stock.symbol[0]}
                        </div>

                        <div>
                            <strong>
                                ${stock.symbol}
                            </strong>

                            <small>
                                ${stock.name}
                            </small>
                        </div>

                    </div>

                    <div>

                        <strong>
                            ${this.money(
                                stock.price
                            )}
                        </strong>

                        <small class="${
                            stock.change >= 0
                            ? "green"
                            : "red"
                        }">

                            ${
                                stock.change >= 0
                                ? "+"
                                : ""
                            }${stock.change.toFixed(2)}%

                        </small>

                    </div>

                </div>

            `
            )
            .join("");

    }


    /* =====================================================
       DASHBOARD HOLDINGS
    ===================================================== */

    renderDashboardHoldings() {

        const container =
            document.getElementById(
                "dashboardHoldings"
            );


        const holdings =
            Object.entries(
                this.user.portfolio
                    .holdings
            );


        if (!holdings.length) {

            container.innerHTML = `

                <div class="empty-state">

                    <p>
                        You don't own any stocks yet.
                    </p>

                    <button
                        class="secondary-btn"
                        onclick="app.showSection('markets')">

                        Explore Markets

                    </button>

                </div>

            `;

            return;

        }


        container.innerHTML =
            holdings.map(
                ([symbol, holding]) => {

                    const stock =
                        this.market[symbol];


                    const value =
                        holding.quantity *
                        stock.price;


                    const profit =
                        (
                            stock.price -
                            holding.averagePrice
                        ) *
                        holding.quantity;


                    return `

                    <div class="holding">

                        <div class="holding-name">

                            <div class="stock-logo">
                                ${symbol[0]}
                            </div>

                            <div>

                                <strong>
                                    ${symbol}
                                </strong>

                                <small>
                                    ${stock.name}
                                </small>

                            </div>

                        </div>

                        <div>
                            ${holding.quantity} shares
                        </div>

                        <div>
                            ${this.money(value)}
                        </div>

                        <div class="${
                            profit >= 0
                            ? "green"
                            : "red"
                        }">

                            ${
                                profit >= 0
                                ? "+"
                                : ""
                            }${this.money(profit)}

                        </div>

                        <button
                            class="secondary-btn"
                            onclick="app.openTradeModal('${symbol}','SELL')">

                            Sell

                        </button>

                    </div>

                    `;

                }
            )
            .join("");

    }


    /* =====================================================
       MARKETS
    ===================================================== */

    renderMarkets(search = "") {

        const container =
            document.getElementById(
                "marketGrid"
            );


        const query =
            search.toLowerCase();


        const stocks =
            Object.values(
                this.market
            )
            .filter(
                stock =>
                    stock.symbol
                        .toLowerCase()
                        .includes(query)
                    ||
                    stock.name
                        .toLowerCase()
                        .includes(query)
            );


        container.innerHTML =
            stocks.map(
                stock =>
                    this.stockCard(
                        stock
                    )
            )
            .join("");

    }


    stockCard(stock) {

        const watched =
            this.user.watchlist
                .includes(
                    stock.symbol
                );


        return `

        <div class="stock-card">

            <div class="stock-card-top">

                <div class="stock-card-name">

                    <div class="stock-logo">
                        ${stock.symbol[0]}
                    </div>

                    <div>

                        <strong>
                            ${stock.symbol}
                        </strong>

                        <small>
                            ${stock.name}
                        </small>

                    </div>

                </div>

                <span class="${
                    stock.change >= 0
                    ? "green"
                    : "red"
                }">

                    ${
                        stock.change >= 0
                        ? "+"
                        : ""
                    }${stock.change.toFixed(2)}%

                </span>

            </div>

            <div class="stock-price">

                ${this.money(stock.price)}

            </div>

            <div class="stock-change ${
                stock.change >= 0
                ? "green"
                : "red"
            }">

                Simulated Market Price

            </div>

            <div class="stock-actions">

                <button
                    class="buy-btn"
                    onclick="app.openTradeModal('${stock.symbol}','BUY')">

                    BUY

                </button>

                <button
                    class="sell-btn"
                    onclick="app.openTradeModal('${stock.symbol}','SELL')">

                    SELL

                </button>

                <button
                    class="watch-btn"
                    onclick="app.toggleWatchlist('${stock.symbol}')">

                    ${watched
                        ? "★ Remove from Watchlist"
                        : "☆ Add to Watchlist"}

                </button>

            </div>

        </div>

        `;

    }


    /* =====================================================
       PORTFOLIO
    ===================================================== */

    renderPortfolio() {

        const container =
            document.getElementById(
                "portfolioTable"
            );


        const holdings =
            Object.entries(
                this.user.portfolio
                    .holdings
            );


        if (!holdings.length) {

            container.innerHTML = `

                <p style="color:#8d98aa">
                    No active positions.
                    Buy a stock from the Markets page.
                </p>

            `;

            return;

        }


        container.innerHTML = `

            <table class="table">

                <thead>

                    <tr>

                        <th>Stock</th>
                        <th>Shares</th>
                        <th>Avg Price</th>
                        <th>Current Price</th>
                        <th>Market Value</th>
                        <th>P/L</th>

                    </tr>

                </thead>

                <tbody>

                    ${
                        holdings.map(
                            ([symbol,holding]) => {

                                const stock =
                                    this.market[symbol];


                                const value =
                                    holding.quantity *
                                    stock.price;


                                const profit =
                                    (
                                        stock.price -
                                        holding.averagePrice
                                    ) *
                                    holding.quantity;


                                return `

                                <tr>

                                    <td>
                                        <strong>
                                            ${symbol}
                                        </strong>
                                        <br>
                                        <small>
                                            ${stock.name}
                                        </small>
                                    </td>

                                    <td>
                                        ${holding.quantity}
                                    </td>

                                    <td>
                                        ${this.money(
                                            holding.averagePrice
                                        )}
                                    </td>

                                    <td>
                                        ${this.money(
                                            stock.price
                                        )}
                                    </td>

                                    <td>
                                        ${this.money(value)}
                                    </td>

                                    <td class="${
                                        profit >= 0
                                        ? "green"
                                        : "red"
                                    }">

                                        ${
                                            profit >= 0
                                            ? "+"
                                            : ""
                                        }${this.money(profit)}

                                    </td>

                                </tr>

                                `;

                            }
                        ).join("")
                    }

                </tbody>

            </table>

        `;

    }


    /* =====================================================
       ORDERS
    ===================================================== */

    renderOrders() {

        const container =
            document.getElementById(
                "ordersTable"
            );


        const transactions =
            this.user.portfolio
                .transactions;


        if (!transactions.length) {

            container.innerHTML = `

                <p style="color:#8d98aa">
                    No transactions yet.
                </p>

            `;

            return;

        }


        container.innerHTML = `

            <table class="table">

                <thead>

                    <tr>

                        <th>Date</th>
                        <th>Type</th>
                        <th>Stock</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>

                    </tr>

                </thead>

                <tbody>

                    ${
                        transactions.map(
                            transaction => `

                            <tr>

                                <td>
                                    ${new Date(
                                        transaction.date
                                    ).toLocaleString()}
                                </td>

                                <td class="${
                                    transaction.type === "BUY"
                                    ? "green"
                                    : "red"
                                }">

                                    ${transaction.type}

                                </td>

                                <td>
                                    <strong>
                                        ${transaction.symbol}
                                    </strong>
                                </td>

                                <td>
                                    ${transaction.quantity}
                                </td>

                                <td>
                                    ${this.money(
                                        transaction.price
                                    )}
                                </td>

                                <td>
                                    ${this.money(
                                        transaction.total
                                    )}
                                </td>

                            </tr>

                        `
                        ).join("")
                    }

                </tbody>

            </table>

        `;

    }


    /* =====================================================
       WATCHLIST
    ===================================================== */

    renderWatchlist() {

        const container =
            document.getElementById(
                "watchlistGrid"
            );


        const stocks =
            this.user.watchlist
                .map(
                    symbol =>
                        this.market[symbol]
                )
                .filter(Boolean);


        if (!stocks.length) {

            container.innerHTML = `

                <div class="panel">

                    <p style="color:#8d98aa">

                        Your watchlist is empty.
                        Add stocks from the Markets page.

                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML =
            stocks.map(
                stock =>
                    this.stockCard(stock)
            )
            .join("");

    }


    toggleWatchlist(symbol) {

        const index =
            this.user.watchlist
                .indexOf(symbol);


        if (index >= 0) {

            this.user.watchlist
                .splice(index,1);

            this.toastMessage(
                `${symbol} removed from watchlist.`
            );

        } else {

            this.user.watchlist
                .push(symbol);

            this.toastMessage(
                `${symbol} added to watchlist ⭐`
            );

        }


        this.auth.saveUser(
            this.user
        );


        this.renderMarkets();

        this.renderWatchlist();

    }


    /* =====================================================
       TRADE MODAL
    ===================================================== */

    openTradeModal(
        symbol,
        type = "BUY"
    ) {

        this.selectedStock =
            this.market[symbol];

        this.tradeType =
            type;


        document.getElementById(
            "tradeSymbol"
        ).textContent =
            symbol;


        document.getElementById(
            "tradeCompany"
        ).textContent =
            this.selectedStock.name;


        document.getElementById(
            "tradeLogo"
        ).textContent =
            symbol[0];


        document.getElementById(
            "tradeQuantity"
        ).value =
            1;


        this.modal
            .classList
            .remove("hidden");


        this.updateTradeModal();

    }


    closeTradeModal() {

        this.modal
            .classList
            .add("hidden");

    }


    updateTradeModal() {

        if (!this.selectedStock) {
            return;
        }


        const quantity =
            Number(
                document.getElementById(
                    "tradeQuantity"
                ).value
            ) || 0;


        document.getElementById(
            "tradePrice"
        ).textContent =
            this.money(
                this.selectedStock.price
            );


        document.getElementById(
            "estimatedTotal"
        ).textContent =
            this.money(
                quantity *
                this.selectedStock.price
            );


        document.getElementById(
            "availableCash"
        ).textContent =
            this.money(
                this.user.portfolio.cash
            );


        document
            .getElementById("buyTab")
            .classList
            .toggle(
                "active",
                this.tradeType === "BUY"
            );


        document
            .getElementById("sellTab")
            .classList
            .toggle(
                "active",
                this.tradeType === "SELL"
            );


        document.getElementById(
            "executeTrade"
        ).textContent =
            this.tradeType === "BUY"
                ? "Buy Stock"
                : "Sell Stock";

    }


    executeTrade() {

        const quantity =
            Number(
                document.getElementById(
                    "tradeQuantity"
                ).value
            );


        try {

            let transaction;


            if (
                this.tradeType === "BUY"
            ) {

                transaction =
                    this.user.portfolio.buy(
                        this.selectedStock,
                        quantity
                    );

            } else {

                transaction =
                    this.user.portfolio.sell(
                        this.selectedStock,
                        quantity
                    );

            }


            this.auth.saveUser(
                this.user
            );


            this.closeTradeModal();


            this.toastMessage(

                `${
                    transaction.type
                } ${transaction.quantity} ${
                    transaction.symbol
                } @ ${
                    this.money(
                        transaction.price
                    )
                }`

            );


            this.renderEverything();

        }

        catch(error) {

            document.getElementById(
                "tradeMessage"
            ).textContent =
                error.message;

            document.getElementById(
                "tradeMessage"
            ).className =
                "form-message error";

        }

    }


    /* =====================================================
       PERFORMANCE CHART
    ===================================================== */

    renderChart() {

        const canvas =
            document.getElementById(
                "performanceChart"
            );


        if (!canvas) {
            return;
        }


        const ctx =
            canvas.getContext("2d");


        const parent =
            canvas.parentElement;


        canvas.width =
            parent.clientWidth * 2;

        canvas.height =
            280 * 2;


        ctx.scale(2,2);


        const width =
            parent.clientWidth;

        const height =
            280;


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        let history =
            this.user.portfolio
                .history;


        if (!history.length) {

            history = [

                {
                    value:
                        this.user.portfolio
                            .initialCash
                }

            ];

        }


        const range =
            document.getElementById(
                "chartRange"
            ).value;


        if (range !== "all") {

            history =
                history.slice(
                    -Number(range)
                );

        }


        const values =
            history.map(
                point =>
                    point.value
            );


        const min =
            Math.min(...values);

        const max =
            Math.max(...values);


        const padding = 25;


        const chartWidth =
            width -
            padding * 2;


        const chartHeight =
            height -
            padding * 2;


        /* GRID */

        ctx.strokeStyle =
            "rgba(255,255,255,.06)";

        ctx.lineWidth = 1;


        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const y =
                padding +
                i *
                chartHeight /
                4;


            ctx.beginPath();

            ctx.moveTo(
                padding,
                y
            );

            ctx.lineTo(
                width - padding,
                y
            );

            ctx.stroke();

        }


        /* LINE */

        ctx.beginPath();


        values.forEach(
            (value,index) => {

                const x =
                    padding +
                    (
                        index /
                        Math.max(
                            values.length - 1,
                            1
                        )
                    ) *
                    chartWidth;


                const normalized =
                    max === min
                    ? .5
                    :
                    (
                        value - min
                    ) /
                    (
                        max - min
                    );


                const y =
                    padding +
                    (
                        1 -
                        normalized
                    ) *
                    chartHeight;


                if (index === 0) {

                    ctx.moveTo(
                        x,
                        y
                    );

                } else {

                    ctx.lineTo(
                        x,
                        y
                    );

                }

            }
        );


        ctx.strokeStyle =
            "#6f82ff";

        ctx.lineWidth = 3;

        ctx.stroke();


        /* AREA */

        const lastX =
            padding +
            chartWidth;


        ctx.lineTo(
            lastX,
            height - padding
        );


        ctx.lineTo(
            padding,
            height - padding
        );


        ctx.closePath();


        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                height
            );


        gradient.addColorStop(
            0,
            "rgba(93,124,255,.25)"
        );


        gradient.addColorStop(
            1,
            "rgba(93,124,255,0)"
        );


        ctx.fillStyle =
            gradient;

        ctx.fill();

    }


    /* =====================================================
       UTILITIES
    ===================================================== */

    money(value) {

        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2
            }
        ).format(value);

    }


    toastMessage(message) {

        this.toast.textContent =
            message;

        this.toast.classList
            .add("show");


        setTimeout(
            () => {

                this.toast.classList
                    .remove("show");

            },
            2800
        );

    }

}


/* =========================================================
   START APPLICATION
========================================================= */

const app =
    new TradingApp();