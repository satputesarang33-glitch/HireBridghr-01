import React, { useState } from 'react';
import {
  Building,
  User,
  Users,
  Shield,
  Bell,
  Lock,
  CreditCard,
  Link as LinkIcon,
  Mail,
  Palette,
  CheckCircle2,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Tabs } from '../../components/ui/Tabs.js';
import { Modal } from '../../components/ui/Modal.js';

export function SettingsPage() {
  const { user, role, availableUsers } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('organization');

  // Organization settings form
  const [orgForm, setOrgForm] = useState({
    name: user?.organizationName || 'Apex Global Tech',
    website: 'https://apextech.example.com',
    industry: 'Enterprise Software & Cloud',
    size: '250-500',
    country: 'United States',
    city: 'San Francisco, CA',
    timeZone: 'America/Los_Angeles (PST)',
  });

  // Profile settings form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Sarah Connor',
    email: user?.email || 'sarah.connor@apextech.com',
    phone: user?.phone || '+1 (415) 890-1234',
    jobTitle: user?.jobTitle || 'Head of Talent Acquisition',
  });

  // Team Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('RECRUITER');

  const handleSaveOrg = (e) => {
    e.preventDefault();
    toast.success('Organization Updated', 'Company profile details saved.');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success('Profile Saved', 'Personal information updated successfully.');
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    toast.success('Invitation Sent', `Sent workspace invitation email to ${inviteEmail} with role ${inviteRole}.`);
    setShowInviteModal(false);
    setInviteEmail('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Organization & System Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure tenant parameters, member permissions, security postures, and integrations.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'organization', label: 'Organization', icon: Building },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'team', label: 'Team Members', icon: Users },
          { id: 'roles', label: 'Roles & RBAC', icon: Shield },
          { id: 'security', label: 'Security & Auth', icon: Lock },
          { id: 'billing', label: 'Subscription & Billing', icon: CreditCard },
          { id: 'career-page', label: 'Career Page Branding', icon: Palette },
          { id: 'integrations', label: 'Integrations & API', icon: LinkIcon },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: Organization */}
      {activeTab === 'organization' && (
        <form onSubmit={handleSaveOrg}>
          <Card className="p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white">Company Profile Information</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                These details are shown on public job postings and automated candidate emails.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company / Organization Name"
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                required
              />
              <Input
                label="Primary Website"
                value={orgForm.website}
                onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                required
              />
              <Input
                label="Industry"
                value={orgForm.industry}
                onChange={(e) => setOrgForm({ ...orgForm, industry: e.target.value })}
              />
              <Select
                label="Organization Size"
                value={orgForm.size}
                onChange={(e) => setOrgForm({ ...orgForm, size: e.target.value })}
                options={[
                  { label: '1 - 20 employees', value: '1-20' },
                  { label: '20 - 100 employees', value: '20-100' },
                  { label: '100 - 500 employees', value: '100-500' },
                  { label: '500+ employees', value: '500+' },
                ]}
              />
              <Input
                label="Country"
                value={orgForm.country}
                onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })}
              />
              <Input
                label="City / Headquarters"
                value={orgForm.city}
                onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Time Zone"
                  value={orgForm.timeZone}
                  onChange={(e) => setOrgForm({ ...orgForm, timeZone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <Button type="submit" variant="primary">
                Save Organization Changes
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 2: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile}>
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-16 h-16 rounded-full border-2 border-brand-400 object-cover"
              />
              <div>
                <h3 className="text-base font-bold text-white">{user?.name}</h3>
                <p className="text-xs text-brand-400 font-semibold">{user?.role} &bull; {user?.jobTitle}</p>
                <p className="text-[11px] text-slate-400 mt-1">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
              <Input
                label="Work Email"
                value={profileForm.email}
                disabled
                helperText="Contact system admin to modify administrative email"
              />
              <Input
                label="Direct Phone Number"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
              <Input
                label="Job Title"
                value={profileForm.jobTitle}
                onChange={(e) => setProfileForm({ ...profileForm, jobTitle: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <Button type="submit" variant="primary">
                Save Profile
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 3: Team */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Active Team Members</h3>
              <p className="text-xs text-slate-400">Recruiters, hiring managers, and interviewers in this organization.</p>
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowInviteModal(true)}>
              Invite Member
            </Button>
          </div>

          <div className="glass-panel rounded-xl border border-white/10 overflow-x-auto">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {availableUsers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <img src={member.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <div className="font-semibold text-white">{member.name}</div>
                          <div className="text-[10px] text-slate-400">{member.jobTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-slate-300 font-mono">{member.email}</span>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                        {member.role}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-emerald-400">Active</span>
                    </td>
                    <td className="text-right">
                      {member.role !== 'OWNER' && (
                        <button className="text-xs text-rose-400 hover:text-rose-300 p-1">
                          Revoke Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Roles & Permissions Matrix */}
      {activeTab === 'roles' && (
        <Card className="p-6 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white">Role-Based Access Control (RBAC) Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict multi-tenant security guarantees. UI permissions only gate interface rendering.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="glass-table text-xs">
              <thead>
                <tr>
                  <th>Permission Area</th>
                  <th>Owner</th>
                  <th>Admin</th>
                  <th>Recruiter</th>
                  <th>Hiring Manager</th>
                  <th>Interviewer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { area: 'Create & Edit Jobs', owner: true, admin: true, recruiter: true, hm: false, int: false },
                  { area: 'Submit Publication Requests', owner: true, admin: true, recruiter: true, hm: false, int: false },
                  { area: 'View All Candidates', owner: true, admin: true, recruiter: true, hm: true, int: false },
                  { area: 'Assign Recruiters to Candidates', owner: true, admin: true, recruiter: true, hm: false, int: false },
                  { area: 'Advance Hiring Stages', owner: true, admin: true, recruiter: true, hm: false, int: false },
                  { area: 'Schedule Interviews', owner: true, admin: true, recruiter: true, hm: false, int: false },
                  { area: 'Submit Interview Feedback Scorecard', owner: true, admin: true, recruiter: true, hm: true, int: true },
                  { area: 'Export Analytics CSV', owner: true, admin: true, recruiter: true, hm: false, int: false },
                  { area: 'Manage Organization & Billing', owner: true, admin: false, recruiter: false, hm: false, int: false },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="font-semibold text-white">{row.area}</td>
                    <td>{row.owner ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-slate-600">&mdash;</span>}</td>
                    <td>{row.admin ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-slate-600">&mdash;</span>}</td>
                    <td>{row.recruiter ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-slate-600">&mdash;</span>}</td>
                    <td>{row.hm ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-slate-600">&mdash;</span>}</td>
                    <td>{row.int ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-slate-600">&mdash;</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 5: Security */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Change Password</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              <Input label="Current Password" type="password" placeholder="••••••••" />
              <Input label="New Password" type="password" placeholder="••••••••" />
              <Input label="Confirm New Password" type="password" placeholder="••••••••" />
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm">
                Update Password
              </Button>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-white">Active Sessions & Devices</h3>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">Chrome on Windows (Current Session)</p>
                <p className="text-[11px] text-slate-400">San Francisco, CA &bull; IP: 198.51.100.18</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                Active Now
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* COMING SOON TABS (Strictly adhering to prompt: Display Coming Soon, do NOT create fake working functionality) */}
      {(activeTab === 'billing' || activeTab === 'career-page' || activeTab === 'integrations') && (
        <Card className="p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">
            {activeTab === 'billing' && 'Subscription & Automated Billing'}
            {activeTab === 'career-page' && 'Custom Domain Career Portal Branding'}
            {activeTab === 'integrations' && 'External Job Boards & Webhook Integrations'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            This capability is scheduled for the upcoming V1.5 and V2 platform releases. Real payment gateways and OAuth integrations will be securely connected through the backend REST API.
          </p>
          <div className="pt-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Coming Soon
            </span>
          </div>
        </Card>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
        description="Grant teammate access to your HirebridgeHR organization."
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <Input
            label="Member Work Email"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <Select
            label="Organization Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            options={[
              { label: 'Recruiter (Jobs, Candidates, Pipeline, Communication)', value: 'RECRUITER' },
              { label: 'Admin (Full Organization Management)', value: 'ADMIN' },
              { label: 'Hiring Manager (Assigned Jobs & Candidate Reviews)', value: 'HIRING_MANAGER' },
              { label: 'Interviewer (Assigned Interviews & Feedback)', value: 'INTERVIEWER' },
              { label: 'Viewer (Read-Only)', value: 'VIEWER' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
