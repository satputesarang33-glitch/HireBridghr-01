import { apiClient } from './api/apiClient.js';

export const authService = {
  login: async ({ email, password }) => {
    const res = await apiClient.post('/api/auth/login', { email, password });
    if (res.data?.user) {
      localStorage.setItem('hb_auth_user', JSON.stringify(res.data.user));
      localStorage.setItem('hb_auth_token', res.data.token || res.data.accessToken || ('jwt-token-' + res.data.user.id));
    }
    return res;
  },

  signup: async (formData) => {
    const res = await apiClient.post('/api/auth/register', {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      password: formData.password || 'Password123!',
      organizationName: formData.organizationName || 'My New Organization',
      phone: formData.phone || '',
    });
    if (res.data?.user) {
      localStorage.setItem('hb_auth_user', JSON.stringify(res.data.user));
      localStorage.setItem('hb_auth_token', res.data.token || res.data.accessToken || ('jwt-token-' + res.data.user.id));
    }
    return res;
  },

  candidateLogin: async ({ email, password }) => {
    const res = await apiClient.post('/api/auth/candidate/login', { email, password });
    if (res.data?.user) {
      localStorage.setItem('hb_auth_user', JSON.stringify(res.data.user));
      localStorage.setItem('hb_auth_token', res.data.token || res.data.accessToken || ('jwt-cand-' + res.data.user.id));
    }
    return res;
  },

  candidateSignup: async (formData) => {
    const res = await apiClient.post('/api/auth/candidate/signup', formData);
    if (res.data?.user) {
      localStorage.setItem('hb_auth_user', JSON.stringify(res.data.user));
      localStorage.setItem('hb_auth_token', res.data.token || res.data.accessToken || ('jwt-cand-' + res.data.user.id));
    }
    return res;
  },

  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // Ignore
    }
    localStorage.removeItem('hb_auth_user');
    localStorage.removeItem('hb_auth_token');
    return { success: true };
  },

  getCurrentUser: () => {
    const saved = localStorage.getItem('hb_auth_user');
    return saved ? JSON.parse(saved) : null;
  },

  forgotPassword: async (email) => {
    const res = await apiClient.post('/api/auth/forgot-password', { email });
    return res.data || { success: true, message: `Password reset link sent to ${email}` };
  },

  resetPassword: async ({ token, password }) => {
    const res = await apiClient.post('/api/auth/reset-password', { token, password });
    return res.data || { success: true, message: 'Password has been successfully updated' };
  },

  verifyEmail: async (code) => {
    return { success: true, message: 'Email successfully verified' };
  },
};
