require('dotenv').config();

module.exports = {
  PORT: 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: 'mongodb+srv://job_app:j8YIfQiNFqotguUi@cluster0.m4cama4.mongodb.net/autoapply_pro?retryWrites=true&w=majority',
  JWT_SECRET: '7f8c2d91b4e5a7c9d3e1f6a8b0c2d4e6',
  JWT_EXPIRES_IN: '7d',
  REFRESH_TOKEN_SECRET: 'e9a1c7d4f8b2a5c6d3e7f1a9b4c8d2e5',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  ENCRYPTION_KEY: '12345678901234567890123456789012',
  ENCRYPTION_IV: '1234567890123456',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  CLIENT_URL: 'http://localhost:5173',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 587,
  SMTP_USER: '',
  SMTP_PASS: '',
};