# ForexAI Analyzer — Full-Stack AI Trading Analysis Platform

ForexAI Analyzer is an algorithmic Forex market analysis, technical indicator evaluation, and AI-assisted signal explanation platform. It collects market data, calculates multi-timeframe technical indicators and market structure, generates rule-based deterministic **BUY / SELL / NO TRADE** signals with precise Entry, TP1, TP2, TP3, and Stop Loss levels, monitors active setups, and delivers multi-channel alerts.

> **Important Safety & Compliance Notice:**
> - This platform is purely an **analytical and signal-generation tool**.
> - It does **NOT** claim guaranteed profits or risk-free trades.
> - It does **NOT** execute real trades or connect directly to broker order routing in this version.
> - All signals are calculated using **transparent, deterministic quantitative rules**; AI is used solely to summarize and explain the setup context.

---

## Architecture Overview

```text
forex-ai-analyzer/
├── frontend/               # React 18 + Vite + Tailwind CSS + TradingView Charts
│   ├── src/
│   │   ├── components/     # UI components (Header, Sidebar, Badges, etc.)
│   │   ├── layouts/        # Layout shells (MainLayout)
│   │   ├── pages/          # Pages (Dashboard, Markets, Signals, etc.)
│   │   ├── services/       # Axios API client & endpoints
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # State context providers
│   │   └── utils/          # Helper functions & formatters
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                # Node.js + Express + Mongoose REST API
│   ├── src/
│   │   ├── config/         # Environment & MongoDB connection manager
│   │   ├── controllers/    # API controllers (health, markets, signals)
│   │   ├── middleware/     # CORS, error handling, 404 handler
│   │   ├── models/         # Mongoose schemas (User, MarketData, Signal, Alert, etc.)
│   │   ├── routes/         # Express API route modules
│   │   ├── services/       # Provider abstraction, indicators, scoring, risk, AI
│   │   ├── jobs/           # node-cron scheduled market scanner
│   │   └── utils/          # Math and formatting utilities
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── analysis/               # Python quantitative & backtesting modules
│   ├── indicators/         # Quantitative technical calculations
│   ├── market_structure/   # High/Low swing detection & breakouts
│   ├── strategies/         # Multi-factor strategy implementations
│   ├── backtesting/        # Historical performance analytics
│   └── requirements.txt
│
├── docker-compose.yml      # Local container orchestration
├── .gitignore
├── package.json            # Root workspace scripts
└── README.md
```

---

## Phase 1 Completed Features

- **Node.js / Express Backend API**:
  - Running on port `5001` (`http://localhost:5001`).
  - Configured with `dotenv`, `cors`, `express.json()`, and modular error handling.
  - MongoDB connection manager via `mongoose` with automatic reconnection and non-fatal fallback.
  - Production-ready health endpoint: `GET /api/health` reporting uptime, DB connection status, supported pairs, and system capability flags.
  - Complete Mongoose schemas for `User`, `MarketData`, `Signal`, `SignalEvent`, and `Alert`.
  - Service directory layout prepared for provider abstraction, scoring engine, risk management, and OpenAI.

- **React + Vite Frontend**:
  - Modern financial dark theme trading terminal.
  - Tailwind CSS with custom palette (`#080B11` canvas, emerald bullish glow, rose bearish glow).
  - Configured with Lucide React icons, React Router, and Axios.
  - Real-time API health monitor with automatic ping and latency tracking.
  - Interactive Market Overview cards across the 7 core currency pairs (`EUR/USD`, `GBP/USD`, `USD/JPY`, `USD/CHF`, `AUD/USD`, `USD/CAD`, `NZD/USD`) with Entry, TP1, TP2, TP3, and SL levels.
  - Responsive header, navigation sidebar, and Phase roadmap display.

- **Analysis Service**:
  - Python module structure initialized with `requirements.txt` (`pandas`, `numpy`, `scipy`).

---

## Prerequisites

- **Node.js**: v20+ or v24 LTS (Installed: `v24.19.0`)
- **npm**: v10+ or v11+ (Installed: `11.17.0`)
- **Python**: v3.10+ (Installed: `3.12.10`)
- **MongoDB**: MongoDB Atlas connection string (or local MongoDB on `mongodb://localhost:27017`)

---

## Environment Variables

Copy the template from `.env.example` or configure `backend/.env`:

```env
# Server
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (MongoDB Atlas URI or local instance)
MONGODB_URI=mongodb://localhost:27017/forex-ai-analyzer

# Authentication Secret
JWT_SECRET=your_jwt_secret_key_here

# Market Data Providers (Phase 2)
TWELVE_DATA_API_KEY=
OANDA_API_KEY=
ALPHA_VANTAGE_API_KEY=
POLYGON_API_KEY=

# OpenAI Intelligence (Phase 7)
OPENAI_API_KEY=

# Telegram Alerts (Phase 9)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

---

## Quick Start / Running the Application

### 1. Start the Backend API (Port 5001)

In terminal 1:
```bash
cd backend
npm run dev
```

*The backend server will run at `http://localhost:5001`.*
*Verify health status at: `http://localhost:5001/api/health`*

### 2. Start the Frontend Application (Vite Port 5173)

In terminal 2:
```bash
cd frontend
npm run dev
```

*Open your browser and navigate to `http://localhost:5173`.*

---

## API Endpoints (Phase 1)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API service root greeting & version info |
| `GET` | `/api` | API directory of available routes |
| `GET` | `/api/health` | System health, MongoDB status, supported pairs, and flags |

---

## Development Order & Roadmap

1. **Phase 1: Project Initialization** &nbsp; *(Completed)*
2. **Phase 2: Market Data Layer** &nbsp; *(Next up: Twelve Data provider abstraction, OANDA/AlphaVantage fallbacks, candlestick ingestion)*
3. **Phase 3: Technical Analysis Engine** &nbsp; *(EMA 20/50/200, RSI, MACD, ATR, Market Structure & S/R)*
4. **Phase 4: Signal Scoring Engine** &nbsp; *(Deterministic 100-point scoring model, multi-timeframe confirmation)*
5. **Phase 5: Dynamic TP/SL Engine** &nbsp; *(Structural Entry, TP1, TP2, TP3, SL, Risk/Reward calculation)*
6. **Phase 6: Interactive Dashboard** &nbsp; *(TradingView Lightweight Charts integration, timeframe switcher)*
7. **Phase 7: AI Market Explanation** &nbsp; *(OpenAI structured synthesis, key risks & scenario analysis)*
8. **Phase 8: Automatic Market Scanner** &nbsp; *(node-cron scheduler, active signal tracking & TP/SL hit states)*
9. **Phase 9: Telegram Notifications** &nbsp; *(Telegram bot for signal triggers and TP/SL alerts)*
10. **Phase 10: Backtesting Engine** &nbsp; *(Historical simulation, win rate, profit factor, max drawdown)*
11. **Phase 11: Production Deployment** &nbsp; *(Docker Compose, CI/CD, production hardening)*
