import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import {appConfig, dbConfig, jwtConfig, googleConfig, connectDatabase, validateEnvironment  } from './config/index.js';
import app from './app.js';
import realTimeChatService from './services/realTimeChatService.js';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnvironment();

// Connect to database
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = new Server(server, {
      cors: {
        origin: [
          process.env.FRONTEND_URL,
          'http://localhost:5500',
          'https://bellavire-frontend.vercel.app'
        ],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Initialize real-time chat service
    realTimeChatService.initializeSocket(io);

    // Start the server
    server.listen(appConfig.PORT, () => {
      console.log(`🚀 Server running on port ${appConfig.PORT}`);
      console.log(`🌐 Environment: ${appConfig.NODE_ENV}`);
      console.log(`🔗 Backend URL: ${appConfig.BACKEND_BASE_URL}`);
      console.log(`🎯 Frontend URL: ${appConfig.FRONTEND_URL}`);
      console.log(`🎯 Swagger URL: ${appConfig.SWAGGER_URL}`);
      console.log(`⚡ Socket.IO initialized for real-time chat`);
      console.log('✨ Bellavire API is ready!');
    });

    // Handle server shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('🛑 Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();
