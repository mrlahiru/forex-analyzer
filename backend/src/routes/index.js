import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import marketRoutes from './marketRoutes.js';
import analysisRoutes from './analysisRoutes.js';

const router = Router();

// Base health check
router.use('/health', healthRoutes);

// Market Data API (Phase 2)
router.use('/markets', marketRoutes);

// Technical Analysis Engine (Phase 3)
router.use('/analysis', analysisRoutes);

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
      signals: '/api/signals (Phase 4)',
      auth: '/api/auth (Phase 1/Auth)',
      watchlist: '/api/watchlist (Phase 6)',
      backtest: '/api/backtest (Phase 10)',
    },
  });
});

export default router;
