import { apiClient } from './api/apiClient.js';
import { mockUsers } from './api/mockData.js';

export const authService = {
  login: async ({ email, password }) => {
    // In mock mode, find matching user or default to first recruiter
    const matched = mockUsers.find(u => u.email.toLowerCase() === email?.toLowerCase());
    const user = matched || mockUsers[0];
    localStorage.setItem('hb_auth_user', JSON.stringify(user));
    localStorage.setItem('hb_auth_token', 'jwt-mock-token-' + user.id);
    return { success: true, data: { user, token: 'jwt-mock-token-' + user.id } };
  },

  signup: async (formData) => {
    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      role: 'OWNER',
      organizationId: 'org-new',
      organizationName: formData.organizationName || 'My New Organization',
      jobTitle: 'Founder / Lead Recruiter',
      phone: formData.phone || '',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
    };
    localStorage.setItem('hb_auth_user', JSON.stringify(newUser));
    localStorage.setItem('hb_auth_token', 'jwt-mock-token-' + newUser.id);
    return { success: true, data: { user: newUser, token: 'jwt-mock-token-' + newUser.id } };
  },

  candidateLogin: async ({ email, password }) => {
    const res = await apiClient.post('/api/auth/candidate/login', { email, password });
    if (res.data?.user) {
      localStorage.setItem('hb_auth_user', JSON.stringify(res.data.user));
      localStorage.setItem('hb_auth_token', res.data.token || ('jwt-cand-' + res.data.user.id));
    }
    return res;
  },

  candidateSignup: async (formData) => {
    const res = await apiClient.post('/api/auth/candidate/signup', formData);
    if (res.data?.user) {
      localStorage.setItem('hb_auth_user', JSON.stringify(res.data.user));
      localStorage.setItem('hb_auth_token', res.data.token || ('jwt-cand-' + res.data.user.id));
    }
    return res;
  },

  logout: async () => {
    try {
      await apiClient.post('/api/auth/candidate/logout');
    } catch {
      // Ignore if not candidate
    }
    localStorage.removeItem('hb_auth_user');
    localStorage.removeItem('hb_auth_token');
    return { success: true };
  },

  getCurrentUser: () => {
    const saved = localStorage.getItem('hb_auth_user');
    return saved ? JSON.parse(saved) : mockUsers[0]; // defaults to Owner Sarah Connor for rich experience
  },

  switchRoleUser: (userId) => {
    const target = mockUsers.find(u => u.id === userId);
    if (target) {
      localStorage.setItem('hb_auth_user', JSON.stringify(target));
      return target;
    }
    return null;
  },

  forgotPassword: async (email) => {
    const res = await apiClient.post('/api/auth/candidate/forgot-password', { email });
    return res.data || { success: true, message: `Password reset link sent to ${email}` };
  },

  resetPassword: async ({ token, password }) => {
    const res = await apiClient.post('/api/auth/candidate/reset-password', { token, password });
    return res.data || { success: true, message: 'Password has been successfully updated' };
  },

  verifyEmail: async (code) => {
    return { success: true, message: 'Email successfully verified' };
  },
};
