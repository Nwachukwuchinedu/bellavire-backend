import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';
import statusMonitor from 'express-status-monitor';


import { compressionMiddleware } from './middleware/compressionMiddleware.js';
import { performanceMiddleware } from './middleware/performanceMiddleware.js';
import { initializeDatabaseIndexes } from './config/databaseIndexes.js';

const app = express();

// Use morgan for HTTP request logging
app.use(morgan('dev'));

// Express status monitor
app.use(statusMonitor());

// Middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


// Apply middleware
app.use(compressionMiddleware);
app.use(performanceMiddleware);

// Initialize database indexes (will wait for connection)
initializeDatabaseIndexes();

// Swagger definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Bellavire API',
        version: '1.0.0',
        description: 'API documentation for the Bellavire project',
    },
    servers: [
        {
            url: `${process.env.BACKEND_BASE_URL}/api`,
            description: 'Development server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT access token'
            }
        }
    },

};

const options = {
    swaggerDefinition,
    // Path to the API docs
    apis: ['./src/routes/**/*.js', './src/models/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve status monitor at /status
app.get('/status', statusMonitor().pageRoute);

// Routes
app.use('/api', routes);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

export default app;
