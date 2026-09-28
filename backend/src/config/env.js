import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment Schema Definition with Zod
 * Validates and provides fallback defaults for development
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  // Database Connection Strings
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),

  // Supabase Configuration
  SUPABASE_URL: z.string().url().optional().or(z.literal('')),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().or(z.literal('')),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional().or(z.literal('')),
  SUPABASE_RESUME_BUCKET: z.string().default('resumes'),

  // JWT Configuration
  JWT_ACCESS_SECRET: z.string().default('hirebridgehr-dev-access-super-secret-key-2026'),
  JWT_REFRESH_SECRET: z.string().default('hirebridgehr-dev-refresh-super-secret-key-2026'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),

  // Optional Email Service Provider Configuration
  EMAIL_PROVIDER: z.string().optional().default('console'),
  EMAIL_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().email().optional().default('noreply@hirebridgehr.com'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', JSON.stringify(result.error.format(), null, 2));
    throw new Error('Environment configuration validation failed');
  }
  return result.data;
};

export const env = parseEnv();
