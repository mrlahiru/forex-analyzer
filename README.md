# ForexAI Analyzer — Full-Stack Algorithmic Signal & Quantitative Risk Platform

ForexAI Analyzer is an institutional-grade, full-stack algorithmic Forex market analysis, technical indicator evaluation, deterministic signal generation, and quantitative risk platform. 

It synthesizes multi-timeframe market data, computes comprehensive technical indicators and market structure swings, scores setups against a **transparent 100-point deterministic model**, anchors dynamic multi-target TP1/TP2/TP3 and ATR-buffered Stop Loss levels, executes background automated scanning via cron, delivers real-time Telegram alerts, runs historical strategy backtests, and runs fully containerized via Docker Compose with an Nginx reverse proxy.

---

> [!CAUTION]
> ### Regulatory & Safety Disclaimer
> - **Purely Analytical & Signal Generation**: This platform is designed solely for algorithmic analysis, quantitative research, and educational demonstration.
> - **NO Real Broker Trade Execution**: The system does NOT connect to live broker order routing APIs, and does NOT execute real money transactions.
> - **NO Profit Guarantees**: Currency markets involve substantial risk of loss. Past backtested performance is not indicative of future results. No mathematical model guarantees profits or eliminates risk.
> - **Non-Hallucinatory AI**: Large language models (OpenAI) are constrained strictly to summarizing quantitative metrics calculated by the deterministic math engine; AI is never used to invent trading levels.

---

## Architecture Overview

```
forex-ai-analyzer/
├── frontend/                     # React 18 + Vite + Tailwind CSS + Lightweight Charts
│   ├── src/
│   │   ├── components/           # TradingViewChart, AiAnalysisCard, ScannerConsole,
│   │   │                         # TelegramAlertConsole, BacktestConsole, ProductionConsole
│   │   ├── layouts/              # MainLayout shell with Navbar & Status header
│   │   ├── pages/                # Interactive Dashboard with full 11-phase consoles
│   │   └── services/             # Axios API client (/api reverse-proxied or direct)
│   ├── nginx.conf                # Production Nginx reverse proxy with gzip & security headers
│   ├── Dockerfile                # Multi-stage production build (Node 20 builder -> Nginx runner)
│   └── package.json
│
├── backend/                      # Node.js LTS + Express + Mongoose REST API
│   ├── src/
│   │   ├── config/               # Database connection manager & environment validation
│   │   ├── controllers/          # Health, Markets, Analysis, Signals, Risk, AI, Scanner, Alerts, Backtest
│   │   ├── middleware/           # CORS, security headers, centralized error & 404 handlers
│   │   ├── models/               # MongoDB Mongoose schemas (MarketData, Signal, Alert, BacktestResult)
│   │   ├── routes/               # Express REST routers for all 11 modules
│   │   ├── services/
│   │   │   ├── marketData/       # Twelve Data API provider with synthetic fallback engines
│   │   │   ├── analysis/         # EMA (20/50/200), RSI (Wilder), MACD (12,26,9), ATR, Swings & S/R
│   │   │   ├── scoring/          # Deterministic 100-point rule engine & MTF veto confirmation
│   │   │   ├── risk/             # Dynamic TP1 (1:1), TP2 (1:2), TP3 (1:3), ATR SL & lot sizing
│   │   │   ├── ai/               # OpenAI GPT-4o-mini structured analysis & institutional fallback
│   │   │   ├── signals/          # node-cron scheduled market scanner & lifecycle state machine
│   │   │   ├── notifications/    # Telegram bot notification engine with HTML alert templates
│   │   │   └── backtesting/      # Historical strategy backtester (Win Rate, Profit Factor, Drawdown)
│   │   └── server.js             # HTTP server entrypoint (Port 5001)
│   ├── Dockerfile                # Multi-stage production build with non-root security (forexuser:1001)
│   └── package.json
│
├── analysis/                     # Python quantitative analysis & backtesting scripts
│   ├── backtesting/              # backtester.py with pandas, numpy equity curve simulations
│   └── requirements.txt
│
├── .github/
│   └── workflows/
│       └── ci.yml                # Automated GitHub Actions CI workflow (Node, Vite, Docker)
├── docker-compose.yml            # Production container orchestration (Mongo, Backend, Frontend/Nginx)
├── .env.example                  # Local environment template
├── .env.production.example       # Production Docker environment template
└── README.md
```

---

## 11-Phase Implementation Breakdown

| Phase | Module | Key Features & Implementation |
| :--- | :--- | :--- |
| **Phase 1** | **Project Architecture & Setup** | Node.js Express API on port `5001`, MongoDB Mongoose schemas, CORS, React 18 + Vite frontend with Tailwind dark theme, and health diagnostics at `GET /api/health`. |
| **Phase 2** | **Market Data Ingestion** | `MarketDataProvider` abstract interface with Twelve Data REST client, robust failover to OANDA/AlphaVantage or simulation engine, and OHLCV candlestick bar delivery for 7 core currency pairs. |
| **Phase 3** | **Technical Analysis Engine** | Mathematical calculation of EMA (20, 50, 200), RSI (14-period Wilder smoothing), MACD (12, 26, 9), ATR (14), Market Structure (Swing Highs/Lows, BOS/CHoCH), and dynamic Support/Resistance clusters. |
| **Phase 4** | **Deterministic 100-Pt Scoring** | Quantitative score breakdown: EMA Trend (25), MACD (20), RSI (15), Structure (15), S/R (15), Volatility (10). Multi-timeframe confirmation (4H, 1H, 15M, 5M) with MTF veto filter. |
| **Phase 5** | **Dynamic TP/SL & Risk Calculator** | Structural entry anchors, ATR-buffered Stop Loss, multi-target Take Profits (TP1 conservative 1:1, TP2 structural 1:2, TP3 runner 1:3), institutional lot sizing (1-2% risk model), and pip value calculations. |
| **Phase 6** | **TradingView Lightweight Charts** | Interactive candlestick chart with volume histogram, toggleable EMA 20/50/200 overlays, and horizontal price rays for Entry, TP1, TP2, TP3, and SL. |
| **Phase 7** | **OpenAI Intelligence Synthesis** | Structured prompt synthesis using GPT-4o-mini providing Executive Summaries, Technical Justifications, Invalidation Criteria, and Scenario Risks with zero hallucination. Fallback institutional engine active when API key is absent. |
| **Phase 8** | **Automatic Market Scanner** | `node-cron` background scheduler (`*/1 * * * *`) that scans all currency pairs, tracks signal lifecycle states (`CREATED` $\to$ `ACTIVE` $\to$ `TP1_HIT` $\to$ `TP2_HIT` $\to$ `TP3_HIT` / `SL_HIT`), and emits real-time events. |
| **Phase 9** | **Telegram Notifications** | Asynchronous Telegram Bot alert engine with HTML card formatting for new signals, multi-target TP milestones, and stop-out alerts. Built-in interactive test dispatcher and live chat mockup. |
| **Phase 10** | **Strategy Backtesting Engine** | Quantitative historical bar simulator evaluating the 100-point rule engine across historical datasets. Computes Win Rate %, Profit Factor, Max Drawdown %, Net PnL, Total Pips, SVG Equity Curve, and trade execution logs. |
| **Phase 11** | **Production Dockerization & CI/CD** | Multi-stage Node.js 20 & Nginx Alpine Dockerfiles, non-root user execution (`forexuser`), healthchecked MongoDB 7.0, `docker-compose.yml`, GitHub Actions CI pipeline, and security headers. |

---

## Quantitative 100-Point Scoring Model

Every currency pair is scored against an objective, rule-based mathematical matrix:

```
Total Signal Score = EMA_Trend (25) + MACD (20) + RSI (15) + Structure (15) + S/R (15) + Volatility (10)
```

| Factor | Weight | Scoring Criteria |
| :--- | :---: | :--- |
| **EMA Trend Alignment** | **25 pts** | Price vs EMA 20, 50, and 200. Full points awarded when Price > EMA 20 > EMA 50 > EMA 200 (Bullish) or Price < EMA 20 < EMA 50 < EMA 200 (Bearish). |
| **MACD Momentum** | **20 pts** | MACD Line vs Signal Line crossover and Histogram expansion in the direction of the dominant trend. |
| **RSI Momentum** | **15 pts** | Evaluates Wilder RSI(14). Healthy momentum zone (40–60 for continuation, 50-crossover). Penalizes extreme overbought (>70) or oversold (<30) conditions. |
| **Market Structure** | **15 pts** | Identifies Higher Highs / Higher Lows (Uptrend) or Lower Highs / Lower Lows (Downtrend) and Break of Structure (BOS) confirms. |
| **Support & Resistance** | **15 pts** | Proximity to dynamic liquidity levels, structural swing pivots, and order block bounce confirmation. |
| **Volatility & ATR** | **10 pts** | Validates average true range expansion to avoid low-liquidity chop and false breakouts. |

### Decision Thresholds & Multi-Timeframe Confirmation
- **$\ge 75$ Points**: Strong Conviction (`BUY` or `SELL`). Multi-timeframe confirmation verified.
- **$60 - 74$ Points**: Moderate Conviction (`BUY` or `SELL`). Higher timeframe trend must agree.
- **$< 60$ Points**: Market in consolidation or conflicting signals $\to$ **`NO TRADE`**.
- **Multi-Timeframe Veto**: Even if the 1-hour score is $\ge 70$, if the 4-hour higher timeframe trend opposes the direction, the signal is downgraded to **`NO TRADE`** to prevent trading against dominant institutional flow.

---

## Dynamic Multi-Target TP/SL Engine

The platform eliminates guesswork by anchoring exits directly to market structure and ATR buffers:

1. **Stop Loss (SL)**:
   - **BUY**: Anchored just below the most recent Swing Low with an ATR buffer (`SwingLow - 1.5 * ATR`).
   - **SELL**: Anchored just above the most recent Swing High with an ATR buffer (`SwingHigh + 1.5 * ATR`).
2. **Take Profit 1 (TP1 - Conservative 1:1)**:
   - First scale-out target securing capital at $1.0\times$ the risk distance.
3. **Take Profit 2 (TP2 - Structural 1:2)**:
   - Core structural target securing $2.0\times$ the risk distance or the nearest opposing S/R zone.
4. **Take Profit 3 (TP3 - Runner 1:3)**:
   - High-reward expansion target capturing $3.0\times$ risk distance on extended trends.
5. **Position Sizing**:
   - Calculates exact standard lots, mini lots, micro lots, and currency units based on user account balance and risk percentage (default: 1.0% to 2.0% max capital risk).

---

## Local Development Quickstart

### Prerequisites
- **Node.js**: v20+ or v24 LTS (`node -v`)
- **npm**: v10+ or v11+ (`npm -v`)
- **MongoDB**: Local MongoDB or MongoDB Atlas URI

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/forex-analyzer.git
cd forex-analyzer

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### 2. Configure Environment Variables
Copy `.env.example` into `backend/.env`:
```bash
cp .env.example backend/.env
```
Fill in your optional API keys (Twelve Data, OpenAI, Telegram). If left blank, the built-in institutional synthetic engine and mock console will automatically take over.

### 3. Launch Development Servers
Run the backend and frontend simultaneously:

**Terminal 1 (Backend - Port 5001):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend - Port 5173):**
```bash
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## Production Docker Deployment

The entire stack is production-hardened using multi-stage Docker builds, an Nginx reverse proxy, non-root user execution, and automated health checks.

```
       Internet / Client Browser
                 │
                 ▼ (Port 80 / 5173)
┌──────────────────────────────────────────────┐
│  Nginx Alpine Reverse Proxy + React SPA      │
│  - Static Asset Caching & Gzip Compression   │
│  - Security Headers (X-Frame, nosniff, XSS)  │
│  - Reverse proxies `/api/*` ──────────────┐  │
└───────────────────────────────────────────┼──┘
                                            │
                                            ▼ (Port 5001)
┌──────────────────────────────────────────────┐
│  Node.js Express API Engine (Node 20 Alpine) │
│  - Runs as non-root user `forexuser` (1001)  │
│  - 100-pt Scoring, Cron Scanner & Telegram   │
│  - Connects to internal DB host ──────────┐  │
└───────────────────────────────────────────┼──┘
                                            │
                                            ▼ (Port 27017)
┌──────────────────────────────────────────────┐
│  MongoDB 7.0 Engine                          │
│  - Persistent storage volume: `mongo_data`   │
│  - Automated healthcheck via `mongosh ping`  │
└──────────────────────────────────────────────┘
```

### 1. Configure Production Environment
```bash
cp .env.production.example .env
```

### 2. Launch Entire Containerized Stack
```bash
docker compose up --build -d
```

### 3. Verify Container Status & Health
```bash
docker compose ps
```
Output:
```
NAME                 IMAGE                      COMMAND                  SERVICE    STATUS
forex-ai-backend     forex-ai-backend:latest    "docker-entrypoint.s…"   backend    Up (healthy)
forex-ai-frontend    forex-ai-frontend:latest   "/docker-entrypoint.…"   frontend   Up (healthy)
forex-ai-mongodb     mongo:7.0                  "docker-entrypoint.s…"   mongodb    Up (healthy)
```

### 4. Monitor Live Backend Logs
```bash
docker compose logs -f backend
```

### 5. Teardown
```bash
docker compose down
```

---

## REST API Reference

All backend endpoints are accessible at `http://localhost:5001/api` (or `/api` in production via Nginx).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server uptime, DB status, and system capabilities. |
| `POST` | `/auth/register` | Register a new user account with bcrypt password hashing and JWT token issuance. |
| `POST` | `/auth/login` | Authenticate existing user credentials and receive JWT access token. |
| `GET` | `/auth/me` | Fetch currently authenticated user profile and saved preferences. |
| `GET` | `/watchlist` | Retrieve user-specific currency pair watchlist with live quotes. |
| `POST` | `/watchlist` | Add a currency pair to custom watchlist. |
| `DELETE` | `/watchlist/:pair` | Remove a currency pair from custom watchlist. |
| `GET` | `/markets` | Real-time prices, 24h change %, and active signals for all 7 pairs. |
| `GET` | `/markets/:pair/candles` | OHLCV candlestick bars for specified pair and timeframe (`1m`, `5m`, `15m`, `1h`, `4h`, `1d`). |
| `GET` | `/analysis/:pair` | EMA 20/50/200, Wilder RSI, MACD, ATR, swings, and S/R levels. |
| `GET` | `/analysis/:pair/multi-timeframe` | Multi-timeframe trend alignment and MTF veto evaluation across 4H, 1H, 15M, 5M. |
| `GET` | `/signals/evaluate/:pair` | 100-point deterministic score, breakdown, triggers, and BUY/SELL/NO TRADE verdict. |
| `GET` | `/signals/active` | All currently active valid trading signals. |
| `GET` | `/signals/history` | Historical closed trade records, outcome pips, win rates, and multi-parameter filters (Section 15). |
| `POST` | `/risk/calculate` | Compute lot sizes, pip value, and reward projections for specified account balance & risk %. |
| `GET` | `/risk/parameters/:pair` | Structural entry, ATR-buffered SL, and dynamic TP1, TP2, TP3 targets. |
| `GET` | `/ai/explain/:pair` | Non-hallucinatory AI synthesis: Executive Summary, Justification, Invalidation & Risks. |
| `GET` | `/scanner/status` | Current state of the background cron scanner and tracked active signals. |
| `POST` | `/scanner/run` | Trigger an immediate manual scan of all currency pairs. |
| `GET` | `/scanner/events` | Real-time stream of signal lifecycle events (`CREATED`, `TP1_HIT`, `SL_HIT`, etc.). |
| `GET` | `/notifications/status` | Telegram bot connectivity and notification queue status. |
| `POST` | `/notifications/test` | Dispatch a formatted institutional test signal to Telegram. |
| `POST` | `/notifications/settings` | Update alert preferences (TP hits, SL hits, minimum score threshold). |
| `POST` | `/backtest/run` | Execute historical strategy backtest across bars (`pair`, `timeframe`, `bars`, `riskRewardRatio`). |
| `GET` | `/backtest/results` | Fetch historical backtest execution run summary and KPI statistics. |

### Real-Time WebSocket Feed
- **URL**: `ws://localhost:5001/ws`
- **Events**: Instant push of scanner lifecycle events (`TP1_HIT`, `TP2_HIT`, `TP3_HIT`, `SL_HIT`) and ping/pong heartbeats.

---

## Continuous Integration (CI/CD)

The repository includes an automated GitHub Actions CI pipeline defined in [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml) that executes on every push and pull request to `master` and `main`:

1. **Backend Validation**:
   - Node.js 20 environment with npm caching.
   - Syntax validation via `node --check` across entry points, scoring engines, and controllers.
2. **Frontend Build**:
   - Production Vite bundle compilation (`npm run build`).
   - Validates asset bundling, tree-shaking, and CSS compilation.
3. **Docker Compose Validation**:
   - Automated syntax and schema verification with `docker compose config`.

---

## License

This project is licensed under the **MIT License**.
