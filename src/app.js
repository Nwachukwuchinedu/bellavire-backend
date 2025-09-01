import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';
//import statusMonitor from 'express-status-monitor';


import { compressionMiddleware } from './middleware/compressionMiddleware.js';
import { performanceMiddleware } from './middleware/performanceMiddleware.js';
import { handleMultipartRequests } from './middleware/encryptionMiddleware.js';
import { initializeDatabaseIndexes } from './config/databaseIndexes.js';

const app = express();

// Use morgan for HTTP request logging
app.use(morgan('dev'));

// Express status monitor
//app.use(statusMonitor());

// Middleware
// Configure CORS with development-friendly settings
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:5500',
            'http://localhost:3000',
            'http://localhost:8000',
            'http://localhost:8080',
            'http://127.0.0.1:5500',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:8000',
            'http://127.0.0.1:8080',
            'https://bellavire-frontend.vercel.app'
        ].filter(Boolean); // Remove undefined/null values
        
        // In development, be more permissive
        if (process.env.NODE_ENV !== 'production') {
            // Allow any localhost/127.0.0.1 origin in development
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                return callback(null, true);
            }
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    exposedHeaders: ['X-Encrypted']
};

app.use(cors(corsOptions));
app.use(express.json());
// Parse encrypted text/plain bodies so decryption middleware can read strings
app.use(express.text({ type: 'text/plain' }));
app.use(cookieParser());


// Apply middleware
app.use(compressionMiddleware);
app.use(performanceMiddleware);

// Apply encryption middleware (must be after express.json() but before routes)
// app.use(handleMultipartRequests);

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
//app.get('/status', statusMonitor().pageRoute);

// Routes
app.use('/api', routes);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

export default app;
