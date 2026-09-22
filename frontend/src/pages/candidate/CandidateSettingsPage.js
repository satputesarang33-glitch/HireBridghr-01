import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Sun,
  Moon,
  Save,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';

export function CandidateSettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [profileSearchable, setProfileSearchable] = useState(true);

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    toast.success('Preferences saved', 'Your notification and privacy preferences have been updated.');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwords.newPass || passwords.newPass.length < 8) {
      toast.error('Validation error', 'New password must be at least 8 characters.');
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      toast.error('Validation error', 'Passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    setTimeout(() => {
      setIsChangingPass(false);
      setPasswords({ current: '', newPass: '', confirmPass: '' });
      toast.success('Password updated', 'Your password has been changed successfully.');
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-white/80 dark:border-white/10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Candidate Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account security, notification alerts, and appearance preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification & Privacy Settings */}
        <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            Communication &amp; Privacy
          </h3>

          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
              <div>
                <p className="font-semibold text-white">Application Status Alerts</p>
                <p className="text-slate-400 text-[11px]">Receive in-app alerts when recruiters update your status</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="rounded bg-slate-800 border-white/20 text-cyan-500 w-4 h-4 shrink-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
              <div>
                <p className="font-semibold text-white">Email Notifications</p>
                <p className="text-slate-400 text-[11px]">Send interview invitations and milestone updates to your email</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded bg-slate-800 border-white/20 text-cyan-500 w-4 h-4 shrink-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
              <div>
                <p className="font-semibold text-white">Recruiter Discovery</p>
                <p className="text-slate-400 text-[11px]">Allow hiring teams to discover your candidate profile for unlisted roles</p>
              </div>
              <input
                type="checkbox"
                checked={profileSearchable}
                onChange={(e) => setProfileSearchable(e.target.checked)}
                className="rounded bg-slate-800 border-white/20 text-cyan-500 w-4 h-4 shrink-0"
              />
            </label>

            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Preferences
            </Button>
          </form>
        </div>

        {/* Appearance & Display Settings */}
        <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-cyan-400" />
            Theme &amp; Display
          </h3>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Interface Theme</p>
                <p className="text-[11px] text-slate-400">
                  Currently active: <strong className="capitalize text-cyan-400">{theme} Mode</strong> (Liquid Glass)
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={theme === 'dark' ? Sun : Moon}
                onClick={toggleTheme}
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </Button>
            </div>
            <p className="text-[11px] text-slate-400">
              Designed with Figma-grade frosted crystal aesthetics for both high-contrast dark and clean light modes.
            </p>
          </div>

          {/* Account Security Change Password */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Change Password
            </h4>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                required
              />
              <Input
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={passwords.confirmPass}
                onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                required
              />
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  {showPassword ? 'Hide password' : 'Show password'}
                </button>
                <Button type="submit" variant="primary" size="sm" isLoading={isChangingPass}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
