import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const jwtLib = {
  /**
   * Sign an Access Token
   * @param {{ id: string, email: string, role?: string, organizationId?: string }} payload
   */
  signAccessToken: (payload) => {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.ACCESS_TOKEN_TTL,
    });
  },

  /**
   * Sign a Refresh Token
   * @param {{ id: string, tokenVersion?: number }} payload
   */
  signRefreshToken: (payload) => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.REFRESH_TOKEN_TTL,
    });
  },

  /**
   * Verify an Access Token
   * @param {string} token
   */
  verifyAccessToken: (token) => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  },

  /**
   * Verify a Refresh Token
   * @param {string} token
   */
  verifyRefreshToken: (token) => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  },

  /**
   * Compute a secure SHA-256 hash of a token for database storage
   * @param {string} token
   */
  hashToken: (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  /**
   * Generate a cryptographically random token (for password reset, invitation, email verification)
   * @param {number} bytes
   */
  generateRandomToken: (bytes = 32) => {
    return crypto.randomBytes(bytes).toString('hex');
  },

  /**
   * Set Refresh Token in HttpOnly cookie
   * @param {import('express').Response} res
   * @param {string} token
   */
  setRefreshTokenCookie: (res, token) => {
    const isProduction = env.NODE_ENV === 'production';
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
  },

  /**
   * Clear Refresh Token cookie
   * @param {import('express').Response} res
   */
  clearRefreshTokenCookie: (res) => {
    const isProduction = env.NODE_ENV === 'production';
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
    });
  },
};
