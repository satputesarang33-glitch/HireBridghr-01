import argon2 from 'argon2';
import bcrypt from 'bcryptjs';
import { logger } from './logger.js';

export const passwordUtils = {
  /**
   * Hash a plain-text password using Argon2id (with bcrypt fallback)
   * @param {string} password
   * @returns {Promise<string>}
   */
  hashPassword: async (password) => {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
      });
    } catch (err) {
      logger.warn('Argon2 failed, falling back to bcryptjs', { error: err.message });
      const salt = await bcrypt.genSalt(12);
      return bcrypt.hash(password, salt);
    }
  },

  /**
   * Verify password against hash
   * @param {string} hash
   * @param {string} password
   * @returns {Promise<boolean>}
   */
  verifyPassword: async (hash, password) => {
    if (!hash || !password) return false;
    try {
      if (hash.startsWith('$argon2')) {
        return await argon2.verify(hash, password);
      }
      return await bcrypt.compare(password, hash);
    } catch (err) {
      logger.error('Error verifying password', err);
      return false;
    }
  },
};
