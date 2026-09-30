import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import marketRoutes from './marketRoutes.js';
import analysisRoutes from './analysisRoutes.js';
import signalRoutes from './signalRoutes.js';
import riskRoutes from './riskRoutes.js';
import aiRoutes from './aiRoutes.js';
import scannerRoutes from './scannerRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import backtestRoutes from './backtestRoutes.js';
import authRoutes from './authRoutes.js';
import watchlistRoutes from './watchlistRoutes.js';

const router = Router();

// Base health check
router.use('/health', healthRoutes);

// User Authentication & Profile (Section 1 & 18)
router.use('/auth', authRoutes);

// Market Data API (Phase 2)
router.use('/markets', marketRoutes);

// Custom User Watchlist (Section 2 & 18)
router.use('/watchlist', watchlistRoutes);

// Technical Analysis Engine (Phase 3)
router.use('/analysis', analysisRoutes);

// Deterministic Signal Engine (Phase 4)
router.use('/signals', signalRoutes);

// Dynamic TP/SL & Risk Management Engine (Phase 5)
router.use('/risk', riskRoutes);

// OpenAI Intelligence & Synthesis Engine (Phase 7)
router.use('/ai', aiRoutes);

// Automatic Market Scanner & Background Engine (Phase 8)
router.use('/scanner', scannerRoutes);

// Telegram Notifications & Alerts Engine (Phase 9)
router.use('/notifications', notificationRoutes);

// Historical Backtesting Engine (Phase 10)
router.use('/backtest', backtestRoutes);

// Base API route placeholder info
router.get('/', (req, res) => {
  res.json({
    name: 'ForexAI Analyzer API',
    version: '1.0.0',
    description: 'Algorithmic Forex market analysis, technical indicators & AI signal explanation platform',
    status: 'online',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      markets: '/api/markets',
      watchlist: '/api/watchlist',
      analysis: '/api/analysis',
      signals: '/api/signals',
      risk: '/api/risk',
      ai: '/api/ai',
      scanner: '/api/scanner',
      notifications: '/api/notifications',
      backtest: '/api/backtest',
    },
  });
});

export default router;
