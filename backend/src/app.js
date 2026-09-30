import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import config from './config/index.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or dev server proxies)
      if (!origin) return callback(null, true);
      // In development allow localhost origins
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin === config.clientUrl
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'ForexAI Analyzer API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api',
    healthCheck: '/api/health',
  });
});

// API Routes
app.use('/api', routes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
