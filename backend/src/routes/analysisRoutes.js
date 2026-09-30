import { Router } from 'express';
import {
  getAnalysisByPair,
  getMultiTimeframeAnalysis,
  getAllPairsAnalysis,
} from '../controllers/analysisController.js';

const router = Router();

// Multi-timeframe analysis for specific pair (4H, 1H, 15M, 5M)
router.get('/:pair/multi-timeframe', getMultiTimeframeAnalysis);

// Specific pair analysis with optional ?timeframe=1h
router.get('/:pair', getAnalysisByPair);

// All pairs technical analysis
router.get('/', getAllPairsAnalysis);

export default router;
