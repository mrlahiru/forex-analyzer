import { Router } from 'express';
import {
  getActiveSignals,
  getSignalHistory,
  verifySignals,
  evaluatePairSignal,
  evaluateAllSignals,
  getSignalById,
} from '../controllers/signalController.js';

import { getScannerEvents } from '../controllers/scannerController.js';

const router = Router();

// Signal lifecycle events (Phase 8)
router.get('/events', getScannerEvents);

// Signal Verification & Audit (Section 15)
router.post('/verify', verifySignals);
router.get('/verify', verifySignals);

// Signal History (Section 15)
router.get('/history', getSignalHistory);

// Active monitored signals
router.get('/active', getActiveSignals);

// Evaluate all pairs on-demand
router.get('/evaluate', evaluateAllSignals);
router.get('/evaluate/all', evaluateAllSignals);

// Evaluate specific pair on-demand (?timeframe=1h)
router.get('/evaluate/:pair', evaluatePairSignal);

// Single signal by ID
router.get('/:id', getSignalById);

// Default to active signals list
router.get('/', getActiveSignals);

export default router;
