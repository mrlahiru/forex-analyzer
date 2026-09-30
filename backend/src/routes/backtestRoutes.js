import { Router } from 'express';
import {
  runBacktest,
  getBacktestResults,
  getBacktestStrategies,
} from '../controllers/backtestController.js';

const router = Router();

// POST /api/backtest/run
router.post('/run', runBacktest);

// GET /api/backtest/results
router.get('/results', getBacktestResults);

// GET /api/backtest/strategies
router.get('/strategies', getBacktestStrategies);

export default router;
