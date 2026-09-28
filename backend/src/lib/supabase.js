import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let supabaseClient = null;

if (env.SUPABASE_URL && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_PUBLISHABLE_KEY)) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;
  supabaseClient = createClient(env.SUPABASE_URL, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
} else {
  logger.warn('Supabase URL or Key not set. Supabase storage will operate in stub/mock mode until configured in .env');
}

export const supabase = supabaseClient;

/**
 * Storage helpers for private resume bucket
 */
export const storageService = {
  /**
   * Upload resume buffer to private bucket
   * @param {string} path - destination path e.g. "org-1/candidate-1/resume.pdf"
   * @param {Buffer} fileBuffer
   * @param {string} mimeType
   */
  uploadResume: async (path, fileBuffer, mimeType) => {
    if (!supabaseClient) {
      logger.info(`[Storage Mock] Uploaded resume to path: ${path}`);
      return { path, url: `/storage/mock/${path}` };
    }

    const bucket = env.SUPABASE_RESUME_BUCKET;
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      logger.error('Failed to upload file to Supabase Storage', error);
      throw error;
    }

    return data;
  },

  /**
   * Generate short-lived signed URL for private resume access
   * @param {string} path
   * @param {number} expiresIn - duration in seconds (default 15 mins)
   */
  getSignedResumeUrl: async (path, expiresIn = 900) => {
    if (!supabaseClient) {
      return `/storage/mock/${path}`;
    }

    const bucket = env.SUPABASE_RESUME_BUCKET;
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      logger.error('Failed to generate signed URL from Supabase Storage', error);
      throw error;
    }

    return data?.signedUrl;
  },

  /**
   * Delete file from private storage
   * @param {string} path
   */
  deleteResume: async (path) => {
    if (!supabaseClient) return true;

    const bucket = env.SUPABASE_RESUME_BUCKET;
    const { error } = await supabaseClient.storage.from(bucket).remove([path]);
    if (error) {
      logger.error('Failed to delete file from Supabase Storage', error);
      throw error;
    }
    return true;
  },
};
