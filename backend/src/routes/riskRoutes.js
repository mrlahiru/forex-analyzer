import { Router } from 'express';
import {
  calculateRisk,
  getPairRiskParameters,
} from '../controllers/riskController.js';

const router = Router();

// Calculate position size and risk breakdown
router.post('/calculate', calculateRisk);

// Get recommended dynamic TP/SL levels for pair
router.get('/parameters/:pair', getPairRiskParameters);

export default router;
