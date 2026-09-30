import { Router } from 'express';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../controllers/watchlistController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Allow optional auth so authenticated users get their saved watchlist,
// while guest users seamlessly get the default tracked pairs
router.use(optionalAuth);

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:pair', removeFromWatchlist);

export default router;
