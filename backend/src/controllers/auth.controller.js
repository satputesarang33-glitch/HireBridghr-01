import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { jwtLib } from '../lib/jwt.js';

export const authController = {
  /**
   * Register recruiter / company account
   */
  register: async (req, res, next) => {
    try {
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.register(req.body, clientInfo);

      // Set refresh token in HttpOnly cookie
      jwtLib.setRefreshTokenCookie(res, result.rawRefreshToken);

      return ApiResponse.created(res, 'Account created successfully', {
        user: result.user,
        token: result.accessToken,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Register candidate portal account
   */
  candidateSignup: async (req, res, next) => {
    try {
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.candidateSignup(req.body, clientInfo);

      jwtLib.setRefreshTokenCookie(res, result.rawRefreshToken);

      return ApiResponse.created(res, 'Candidate account created successfully', {
        user: result.user,
        token: result.accessToken,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Login user
   */
  login: async (req, res, next) => {
    try {
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.login(req.body, clientInfo);

      jwtLib.setRefreshTokenCookie(res, result.rawRefreshToken);

      return ApiResponse.success(res, 200, 'Welcome back', {
        user: result.user,
        token: result.accessToken,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Refresh Token Rotation
   */
  refresh: async (req, res, next) => {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.refresh(token, clientInfo);

      jwtLib.setRefreshTokenCookie(res, result.rawRefreshToken);

      return ApiResponse.success(res, 200, 'Token refreshed successfully', {
        user: result.user,
        token: result.accessToken,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Logout user
   */
  logout: async (req, res, next) => {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      let userId = req.user?.id;

      if (!userId && token) {
        try {
          const decoded = jwtLib.verifyRefreshToken(token);
          userId = decoded?.id;
        } catch {
          // Token might be expired, but we can still revoke its hash
        }
      }

      await authService.logout(token, userId);
      jwtLib.clearRefreshTokenCookie(res);

      return ApiResponse.success(res, 200, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get authenticated current user
   */
  getMe: async (req, res, next) => {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return ApiResponse.success(res, 200, 'Current user retrieved', user);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Forgot password request
   */
  forgotPassword: async (req, res, next) => {
    try {
      const result = await authService.forgotPassword(req.body.email);
      return ApiResponse.success(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (req, res, next) => {
    try {
      const result = await authService.resetPassword(req.body);
      return ApiResponse.success(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify email stub
   */
  verifyEmail: async (req, res, next) => {
    try {
      return ApiResponse.success(res, 200, 'Email successfully verified');
    } catch (error) {
      next(error);
    }
  },
};
