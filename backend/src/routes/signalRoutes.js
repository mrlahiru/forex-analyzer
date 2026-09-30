import { Router } from 'express';
import {
  getActiveSignals,
  evaluatePairSignal,
  evaluateAllSignals,
  getSignalById,
} from '../controllers/signalController.js';

const router = Router();

// Active monitored signals
router.get('/active', getActiveSignals);

// Evaluate all pairs on-demand
router.get('/evaluate', evaluateAllSignals);

// Evaluate specific pair on-demand (?timeframe=1h)
router.get('/evaluate/:pair', evaluatePairSignal);

// Single signal by ID
router.get('/:id', getSignalById);

// Default to active signals list
router.get('/', getActiveSignals);

export default router;
