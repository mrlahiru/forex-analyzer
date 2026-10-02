import { getDbStatus } from '../config/db.js';
import { marketDataManager } from '../services/marketData/index.js';

export const getHealth = (req, res) => {
  const dbStatus = getDbStatus();
  
  res.status(200).json({
    status: 'ok',
    service: 'ForexAI Analyzer Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(1)}s`,
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    supportedPairs: marketDataManager.supportedPairs,
    supportedTimeframes: ['1m', '5m', '15m', '30m', '1h', '4h', '1d'],
    features: {
      marketDataAbstraction: true,
      deterministicScoring: true,
      multiTimeframeConfirmation: true,
      riskCalculator: true,
      aiExplanation: true,
      telegramNotifications: true,
    },
  });
};
