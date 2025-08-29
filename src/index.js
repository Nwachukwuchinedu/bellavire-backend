import dotenv from 'dotenv';
import { appConfig, dbConfig, jwtConfig, googleConfig, connectDatabase, validateEnvironment } from './config/index.js';
import app from './app.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { initializeSocket } from './services/socketService.js';

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
    const httpServer = createServer(app);

    // Initialize Socket.IO
    const io = new Server(httpServer, {
      cors: {
        origin: [
          process.env.FRONTEND_URL,
          'http://localhost:5500',
          'http://localhost:3000',
          'http://127.0.0.1:5500',
          'http://127.0.0.1:3000',
          'https://bellavire-frontend.vercel.app'
        ],
        credentials: true,
      },
      transports: ['polling', 'websocket'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Initialize socket service
    initializeSocket(io);

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      console.log('🔌 User connected:', socket.id);
      console.log('🔌 Socket transport:', socket.conn.transport.name);

      // Join user to their personal room
      socket.on('join-user', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`👤 User ${userId} joined their room`);
      });

      // Handle new message
      socket.on('new-message', (data) => {
        const { chatId, message, recipientId } = data;
        // Emit to the recipient's room
        socket.to(`user-${recipientId}`).emit('message-received', {
          chatId,
          message
        });
        console.log(`💬 Message sent from ${socket.id} to user ${recipientId}`);
      });

      // Handle typing indicator
      socket.on('typing', (data) => {
        const { chatId, recipientId, isTyping, senderType } = data;
        socket.to(`user-${recipientId}`).emit('user-typing', {
          chatId,
          isTyping,
          senderType
        });
        console.log(`⌨️ Typing indicator sent from ${socket.id} to user ${recipientId}`);
      });

      // Handle disconnect
      socket.on('disconnect', (reason) => {
        console.log('🔌 User disconnected:', socket.id, 'Reason:', reason);
      });

      // Test event handler
      socket.on('test-event', (data) => {
        console.log('🧪 Test event received:', data);
        socket.emit('test-response', {
          message: 'Server received your test!',
          originalData: data,
          timestamp: new Date()
        });
      });
    });

    // Start the server
    httpServer.listen(appConfig.PORT, () => {
      console.log(`🚀 Server running on port ${appConfig.PORT}`);
      console.log(`🌐 Environment: ${appConfig.NODE_ENV}`);
      console.log(`🔗 Backend URL: ${appConfig.BACKEND_BASE_URL}`);
      console.log(`🎯 Frontend URL: ${appConfig.FRONTEND_URL}`);
      console.log(`🎯 Swagger URL: ${appConfig.SWAGGER_URL}`);
      console.log('✨ Bellavire API is ready!');
      console.log('🔌 Socket.IO is ready!');
    });

    // Handle server shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      httpServer.close(() => {
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
