import http from 'http';
import app from './app.js';
import config from './config/index.js';
import { connectDB } from './config/db.js';
import { initScheduledJobs } from './jobs/index.js';

const server = http.createServer(app);

const startServer = async () => {
  // Connect to Database (gracefully handles offline DB)
  await connectDB();

  server.listen(config.port, () => {
    console.log('====================================================');
    console.log('  🚀 ForexAI Analyzer Backend API Server Running');
    console.log(`  📡 Port:        ${config.port}`);
    console.log(`  🌐 Local URL:   http://localhost:${config.port}`);
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
