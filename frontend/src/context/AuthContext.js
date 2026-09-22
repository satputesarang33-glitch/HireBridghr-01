import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import { mockUsers } from '../services/api/mockData.js';

const AuthContext = createContext(null);

// Permission matrix
const ROLE_PERMISSIONS = {
  OWNER: ['*'], // all permissions
  ADMIN: [
    'jobs.view', 'jobs.create', 'jobs.edit', 'jobs.publish', 'jobs.close',
    'candidates.view', 'candidates.create', 'candidates.edit', 'candidates.assign', 'candidates.notes',
    'applications.view', 'applications.manage',
    'interviews.view', 'interviews.schedule', 'interviews.feedback',
    'reports.view', 'reports.export',
    'settings.view', 'settings.team', 'settings.org',
  ],
  RECRUITER: [
    'jobs.view', 'jobs.create', 'jobs.edit', 'jobs.publish',
    'candidates.view', 'candidates.create', 'candidates.edit', 'candidates.assign', 'candidates.notes',
    'applications.view', 'applications.manage',
    'interviews.view', 'interviews.schedule', 'interviews.feedback',
    'reports.view', 'reports.export',
  ],
  HIRING_MANAGER: [
    'jobs.view',
    'candidates.view', 'candidates.notes',
    'applications.view',
    'interviews.view', 'interviews.feedback',
  ],
  INTERVIEWER: [
    'candidates.view_basic',
    'interviews.view_assigned', 'interviews.feedback',
  ],
  VIEWER: [
    'jobs.view', 'candidates.view_basic', 'applications.view', 'reports.view',
  ],
  CANDIDATE: [
    'CAN_VIEW_JOBS',
    'CAN_APPLY_TO_JOBS',
    'CAN_VIEW_OWN_APPLICATIONS',
    'CAN_EDIT_OWN_PROFILE',
    'CAN_UPLOAD_RESUME',
    'CAN_SAVE_JOBS',
    'CAN_VIEW_OWN_NOTIFICATIONS',
  ],
  SUPER_ADMIN: ['*'],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.success) {
        setUser(res.data.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    setLoading(true);
    try {
      const res = await authService.signup(formData);
      if (res.success) {
        setUser(res.data.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const candidateLogin = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.candidateLogin(credentials);
      if (res.data?.user) {
        setUser(res.data.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const candidateSignup = async (formData) => {
    setLoading(true);
    try {
      const res = await authService.candidateSignup(formData);
      if (res.data?.user) {
        setUser(res.data.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  // Switch active role or mock persona for testing
  const switchUser = (userId) => {
    const nextUser = authService.switchRoleUser(userId);
    if (nextUser) {
      setUser(nextUser);
    }
  };

  // Permission checkers
  const hasRole = (role) => {
    if (!user) return false;
    if (user.role === 'OWNER' || user.role === 'SUPER_ADMIN') return true;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  };

  const can = (permission) => {
    if (!user) return false;
    if (user.role === 'OWNER' || user.role === 'SUPER_ADMIN') return true;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  };

  const hasPermission = can;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'GUEST',
        organization: { id: user?.organizationId, name: user?.organizationName },
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        candidateLogin,
        candidateSignup,
        logout,
        switchUser,
        availableUsers: mockUsers,
        hasRole,
        can,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
