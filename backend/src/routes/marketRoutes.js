import { Router } from 'express';
import {
  getAllMarkets,
  getMarketByPair,
  getCandles,
  getProviderStatus,
  setProvider,
} from '../controllers/marketController.js';

const router = Router();

// Provider diagnostic status
router.get('/status', getProviderStatus);

// Dynamically set active market data provider (e.g. yahoo_finance, twelve_data, mock)
router.post('/provider', setProvider);

// All markets list with current quotes (supports /, /quotes, and /prices)
router.get('/', getAllMarkets);
router.get('/quotes', getAllMarkets);
router.get('/prices', getAllMarkets);

// Specific market candles (OHLCV)
// Note: pair may be encoded (e.g. EUR%2FUSD) or clean (EURUSD)
router.get('/:pair/candles', getCandles);

// Specific market quote
router.get('/:pair', getMarketByPair);

export default router;
