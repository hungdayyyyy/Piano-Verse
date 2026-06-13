import http from 'http';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { config } from './config/environment.js';

async function startServer() {
  try {
    // Connect to databases
    console.log('🔌 Connecting to MongoDB...');
    await connectDatabase();

    console.log('🔌 Connecting to Redis...');
    await connectRedis();

    // Create HTTP server
    const server = http.createServer(app);

    // Start listening
    server.listen(config.PORT, () => {
      console.log(`
╔══════════════════════════════════════╗
║  🎹 Piano Verse Backend API          ║
║     Environment: ${config.NODE_ENV.toUpperCase()}                  ║
║     Port: ${config.PORT}                       ║
║     URL: http://localhost:${config.PORT}       ║
║     Docs: http://localhost:${config.PORT}/api-docs ║
╚══════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
