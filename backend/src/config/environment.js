import dotenv from 'dotenv'

dotenv.config()

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  HOST: process.env.HOST || 'localhost',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pianoverse',

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-change-in-production',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '30d',

  // AWS S3
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || 'pianoverse-files',
  AWS_CLOUDFRONT_DOMAIN: process.env.AWS_CLOUDFRONT_DOMAIN || '',

  // AI Services
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY || '',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',

  // Frontend URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  FRONTEND_PRODUCTION_URL: process.env.FRONTEND_PRODUCTION_URL || 'https://pianoverse.com',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',

  // Email
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@pianoverse.com',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // Socket.IO
  SOCKET_IO_CORS_ORIGIN: process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000',

  // Feature flags
  ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES !== 'false',
  ENABLE_REAL_TIME_FEATURES: process.env.ENABLE_REAL_TIME_FEATURES !== 'false',
}

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
]

if (config.NODE_ENV === 'production') {
  requiredEnvVars.push(
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'OPENAI_API_KEY'
  )
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: Required environment variable ${envVar} is not set`)
  }
}
