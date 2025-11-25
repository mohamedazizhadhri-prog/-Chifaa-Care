import dotenv from 'dotenv';

// IMPORTANT: Load environment variables FIRST before anything else
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { setupSocketHandlers } from './socket';
import { errorHandler } from './middleware/errorHandler';
import gameRoutes from './routes/game.routes';
import authRoutes from './routes/auth.routes';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Socket.IO setup
setupSocketHandlers(io);

// Initialize services and start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database and Redis if URLs are provided
    if (process.env.DATABASE_URL) {
      console.log('📦 Initializing database...');
      await initializeDatabase();
    } else {
      console.log('⚠️  Skipping database initialization (DATABASE_URL not set)');
    }
    
    if (process.env.REDIS_URL) {
      console.log('📦 Initializing Redis...');
      await initializeRedis();
    } else {
      console.log('⚠️  Skipping Redis initialization (REDIS_URL not set)');
    }
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🎮 Socket.IO server ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { io };
