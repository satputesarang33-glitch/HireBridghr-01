import { env } from './env.js';

const parseOrigins = () => {
  const defaults = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  const envOrigins = [env.CLIENT_URL, process.env.ALLOWED_ORIGINS]
    .filter(Boolean)
    .flatMap((val) => val.split(',').map((s) => s.trim()))
    .filter(Boolean);

  return Array.from(new Set([...defaults, ...envOrigins]));
};

const allowedOrigins = parseOrigins();

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests with no origin (such as mobile apps, curl, health probes)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || (env.NODE_ENV === 'development' && origin.startsWith('http://localhost:'))) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-Id',
    'X-Organization-Id',
  ],
  exposedHeaders: ['Content-Range', 'X-Total-Count', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
};
