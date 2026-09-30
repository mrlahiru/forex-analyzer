import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import marketRoutes from './marketRoutes.js';
import analysisRoutes from './analysisRoutes.js';
import signalRoutes from './signalRoutes.js';
import riskRoutes from './riskRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = Router();

// Base health check
router.use('/health', healthRoutes);

// Market Data API (Phase 2)
router.use('/markets', marketRoutes);

// Technical Analysis Engine (Phase 3)
router.use('/analysis', analysisRoutes);

// Deterministic Signal Engine (Phase 4)
router.use('/signals', signalRoutes);

// Dynamic TP/SL & Risk Management Engine (Phase 5)
router.use('/risk', riskRoutes);

// OpenAI Intelligence & Synthesis Engine (Phase 7)
router.use('/ai', aiRoutes);

// Base API route placeholder info
router.get('/', (req, res) => {
  res.json({
    name: 'ForexAI Analyzer API',
    version: '1.0.0',
    description: 'Algorithmic Forex market analysis, technical indicators & AI signal explanation platform',
    status: 'online',
    endpoints: {
      health: '/api/health',
      markets: '/api/markets',
      analysis: '/api/analysis',
      signals: '/api/signals',
      risk: '/api/risk',
      auth: '/api/auth (Phase 1/Auth)',
      watchlist: '/api/watchlist (Phase 6)',
      backtest: '/api/backtest (Phase 10)',
    },
  });
});

export default router;
