import { Router } from 'express';
import {
  getScannerStatus,
  triggerManualScan,
  startScanner,
  stopScanner,
  getScannerEvents,
} from '../controllers/scannerController.js';

const router = Router();

// GET /api/scanner/status
router.get('/status', getScannerStatus);

// POST /api/scanner/run (Manual trigger)
router.post('/run', triggerManualScan);

// POST /api/scanner/start (Admin start)
router.post('/start', startScanner);

// POST /api/scanner/stop (Admin stop)
router.post('/stop', stopScanner);

// GET /api/scanner/events
router.get('/events', getScannerEvents);

export default router;
