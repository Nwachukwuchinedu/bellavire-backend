import dotenv from 'dotenv';
dotenv.config();

export const appConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  BACKEND_BASE_URL: process.env.BACKEND_BASE_URL || 'http://localhost:5000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  SWAGGER_URL: process.env.SWAGGER_URL || 'http://localhost:5000/api-docs',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test'
};
