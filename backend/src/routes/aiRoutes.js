import { Router } from 'express';
import {
  getAiExplanation,
  postAiExplanation,
} from '../controllers/aiController.js';

const router = Router();

// GET /api/ai/explain/:pair?timeframe=1h
router.get('/explain/:pair', getAiExplanation);

// POST /api/ai/explain (Custom payload)
router.post('/explain', postAiExplanation);

export default router;
