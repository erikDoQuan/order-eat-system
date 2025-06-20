import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  host: process.env.APP_HOST || '0.0.0.0',
  port: parseInt(process.env.APP_PORT) || 3000,
  appEnv: process.env.APP_ENV || 'development',
  logLevel: process.env.APP_LOG_LEVEL || 'info',
  isDocumentationEnabled: process.env.DOCUMENTATION_ENABLED === 'true',
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3001', 'http://localhost:3002'],
}));
