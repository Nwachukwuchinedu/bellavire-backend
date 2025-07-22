export * from './appConfig.js';
export * from './dbConfig.js';
export * from './jwtConfig.js';
export * from './googleConfig.js';

export const validateEnvironment = () => {
  // Check for JWT secrets (either separate or single)
  const jwtSecrets = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'JWT_SECRET'];
  const hasJwtSecret = jwtSecrets.some(key => process.env[key]);

  if (!hasJwtSecret) {
    console.error('❌ Missing required JWT secret. Please set one of:', jwtSecrets);
    process.exit(1);
  }

  // Check for Google OAuth (required for Google auth to work)
  const googleRequired = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
  const googleMissing = googleRequired.filter(key => !process.env[key]);

  if (googleMissing.length > 0) {
    console.warn('⚠️ Missing Google OAuth environment variables:', googleMissing);
    console.warn('   Google OAuth will not work without these variables');
  }

  // Check for database connection
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ Missing MONGODB_URI - database connection may fail');
  }

  // Check for backend URL
  if (!process.env.BACKEND_BASE_URL) {
    console.warn('⚠️ Missing BACKEND_BASE_URL - using default http://localhost:5000');
  }

  console.log('✅ Environment validation passed');
};
