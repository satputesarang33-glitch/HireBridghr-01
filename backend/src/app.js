import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { v4 as uuidv4 } from 'uuid';

import { corsOptions } from './config/cors.js';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { swaggerDocument } from './docs/swagger.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { checkDatabaseConnection } from './lib/prisma.js';

const app = express();

// 1. Security Headers
app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  })
);

// 2. CORS Allowlist
app.use(cors(corsOptions));

// 3. HTTP Compression
app.use(compression());

// 4. Request Parsers
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Request Tracking ID
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// 6. Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// 7. Interactive API Documentation (Swagger UI)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 8. Health Check Endpoint
app.get(['/health', '/api/health'], async (req, res) => {
  const dbHealth = await checkDatabaseConnection();
  const statusCode = dbHealth.connected ? 200 : 503;

  return res.status(statusCode).json({
    status: dbHealth.connected ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: dbHealth,
    environment: env.NODE_ENV,
  });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'HirebridgeHR ATS Backend API',
    status: 'online',
    version: '1.0.0',
    docs: '/api/docs',
    health: '/api/health',
  });
});

// 9. Mount REST API Routes
// Supporting both /api and /api/v1 for 100% compatibility with frontend callers
app.use('/api', apiRouter);
app.use('/api/v1', apiRouter);

// 10. 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
