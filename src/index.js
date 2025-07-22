import dotenv from 'dotenv';
import {appConfig, dbConfig, jwtConfig, googleConfig, connectDatabase, validateEnvironment  } from './config/index.js';
import app from './app.js';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnvironment();

// Connect to database
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start the server
    const server = app.listen(appConfig.PORT, () => {
      console.log(`🚀 Server running on port ${appConfig.PORT}`);
      console.log(`🌐 Environment: ${appConfig.NODE_ENV}`);
      console.log(`🔗 Backend URL: ${appConfig.BACKEND_BASE_URL}`);
      console.log(`🎯 Frontend URL: ${appConfig.FRONTEND_URL}`);
      console.log(`🎯 Swagger URL: ${appConfig.SWAGGER_URL}`);
      console.log('✨ Real Estate API is ready!');
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
