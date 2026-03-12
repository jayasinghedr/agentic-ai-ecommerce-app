export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 5000,
  jwtSecret: process.env.JWT_SECRET || 'nexagear-jwt-secret-change-in-production',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || 'nexagear-refresh-secret-change-in-production',
  jwtAccessExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
