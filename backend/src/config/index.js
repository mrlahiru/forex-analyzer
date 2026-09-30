import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root or parent root if available
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/forex-ai-analyzer',
  jwtSecret: process.env.JWT_SECRET || 'forex_ai_analyzer_secret_key_change_in_production',

  marketData: {
    twelveDataKey: process.env.TWELVE_DATA_API_KEY || '',
    oandaKey: process.env.OANDA_API_KEY || '',
    alphaVantageKey: process.env.ALPHA_VANTAGE_API_KEY || '',
    polygonKey: process.env.POLYGON_API_KEY || '',
  },

  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },
};

export default config;
