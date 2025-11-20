import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { initSocket } from './socket';

// Load environment variables
// When compiled, __dirname will be `dist/`. The real .env is at projectRoot/.env or backend/.env.
// Try common locations in order: one level up (backend/.env), two levels up (repo root), and CWD fallback.
(() => {
  const candidates = [
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(process.cwd(), '.env'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      console.log(`[env] Loaded environment from ${p}`);
      return;
    }
  }
  // Fallback to default behavior
  dotenv.config();
  console.warn('[env] Loaded environment from default .env resolution (no explicit file found)');
})();

// Import routes AFTER env is loaded to ensure downstream modules pick up env vars
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import appointmentRoutes from './routes/appointment.routes';
import doctorRoutes from './routes/doctor.routes';
import messageRoutes from './routes/message.routes';
import patientRoutes from './routes/patient.routes';
import treatmentRoutes from './routes/treatment.routes';
import recordsRoutes from './routes/records.routes';
import adminRoutes from './routes/admin.routes';
import payoutRoutes from './routes/payout.routes';
import paymentRoutes from './routes/payment.routes';
import calendarRoutes from './routes/calendar.routes';
import { messageSyncService } from './services/message-sync.service';

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(cors());
// Increase body size limits to support base64 images for profile uploads
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(morgan('dev'));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Documentation
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ChifaaCare API Documentation',
  })
);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/treatments', treatmentRoutes);
app.use('/api/v1/records', recordsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/clinic/payouts', payoutRoutes);
app.use('/api/v1/calendar', calendarRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'Connected' : 'Not configured'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token. Please log in again!',
    });
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      status: 'error',
      message: 'A record with this value already exists',
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start the server with Socket.IO
const server = http.createServer(app);
initSocket(server);
server.listen(port, () => {
  console.log(`Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`API Documentation: http://localhost:${port}/api-docs`);
  
  // Start the message sync scheduler
  console.log('Starting message cleanup scheduler...');
  messageSyncService.startScheduler();
  console.log('✅ Message sync scheduler started');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  messageSyncService.stopScheduler();
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

// Close Prisma connection on shutdown
process.on('beforeExit', async () => {
  messageSyncService.stopScheduler();
  await prisma.$disconnect();
});

export default app;