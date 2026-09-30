import http from 'http';
import { WebSocketServer } from 'ws';
import app from './app.js';
import config from './config/index.js';
import { connectDB } from './config/db.js';
import { initScheduledJobs } from './jobs/index.js';
import { marketScanner } from './services/signals/index.js';

const server = http.createServer(app);

// Real-Time WebSocket Server (Section 1: WebSocket support)
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  ws.send(
    JSON.stringify({
      type: 'CONNECTED',
      message: 'ForexAI Real-Time WebSocket Feed Active',
      timestamp: new Date().toISOString(),
    })
  );

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      }
    } catch (e) {
      // ignore
    }
  });
});

// Broadcast real-time scanner lifecycle events to all connected clients
marketScanner.onEvent((event, signal) => {
  const payload = JSON.stringify({
    type: 'SCANNER_EVENT',
    event,
    signal: {
      pair: signal.pair,
      direction: signal.direction,
      score: signal.score,
      entry: signal.entry,
      tp1: signal.tp1,
      tp2: signal.tp2,
      tp3: signal.tp3,
      stopLoss: signal.stopLoss,
    },
  });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
});

const startServer = async () => {
  // Connect to Database (gracefully handles offline DB)
  await connectDB();

  server.listen(config.port, () => {
    console.log('====================================================');
    console.log('  🚀 ForexAI Analyzer Backend API Server Running');
    console.log(`  📡 Port:        ${config.port}`);
    console.log(`  🌐 Local URL:   http://localhost:${config.port}`);
    console.log(`  🔌 WebSockets:  ws://localhost:${config.port}/ws`);
    console.log(`  🩺 Health:      http://localhost:${config.port}/api/health`);
    console.log(`  ⚙️  Environment: ${config.nodeEnv}`);
    console.log('====================================================');

    // Initialize scheduled background jobs (Phase 8 Market Scanner)
    initScheduledJobs();
  });
};

const handleShutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startServer().catch((err) => {
  console.error('[Server] Failed to initialize server:', err);
  process.exit(1);
});
