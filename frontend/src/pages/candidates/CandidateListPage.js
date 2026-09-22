import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  UserCheck,
  Tag,
  FileText,
  Mail,
  Phone,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { useCandidates, useCreateCandidate } from '../../hooks/useCandidates.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { ApplicationStageBadge } from '../../components/ui/Badge.js';
import { Modal } from '../../components/ui/Modal.js';
import { TableSkeleton } from '../../components/ui/Skeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';

export function CandidateListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: candRes, isLoading } = useCandidates({
    search,
    status: statusFilter,
    tag: tagFilter,
  });

  const createCandMutation = useCreateCandidate();

  const candidates = candRes?.data || [];

  // New Candidate Form State
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    currentTitle: '',
    currentCompany: '',
    location: '',
    experienceYears: 4,
    skills: 'React, Node.js, TypeScript',
    source: 'Direct Sourcing',
    status: 'NEW',
    assignedRecruiterName: 'Elena Rostova',
    tags: ['Sourced'],
  });

  const handleCreateCandidate = (e) => {
    e.preventDefault();
    createCandMutation.mutate(
      {
        ...newCandidate,
        skills: newCandidate.skills.split(',').map((s) => s.trim()).filter(Boolean),
        experienceYears: Number(newCandidate.experienceYears),
      },
      {
        onSuccess: () => {
          setShowAddModal(false);
          setNewCandidate({
            name: '',
            email: '',
            phone: '',
            currentTitle: '',
            currentCompany: '',
            location: '',
            experienceYears: 4,
            skills: 'React, Node.js, TypeScript',
            source: 'Direct Sourcing',
            status: 'NEW',
            assignedRecruiterName: 'Elena Rostova',
            tags: ['Sourced'],
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Talent & Candidate CRM</h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized talent vault. Search skills, review resumes, track recruitment stages and recruiter ownership.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
          Add Candidate
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search by name, skill, email, title..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Stages', value: 'ALL' },
                { label: 'New', value: 'NEW' },
                { label: 'Screening', value: 'SCREENING' },
                { label: 'Shortlisted', value: 'SHORTLISTED' },
                { label: 'Interview', value: 'INTERVIEW' },
                { label: 'Offer', value: 'OFFER' },
                { label: 'Hired', value: 'HIRED' },
              ]}
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              options={[
                { label: 'All Tags', value: 'ALL' },
                { label: 'Senior', value: 'Senior' },
                { label: 'Immediate Joiner', value: 'Immediate Joiner' },
                { label: 'High Priority', value: 'High Priority' },
                { label: 'Top Tier Design', value: 'Top Tier Design' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Candidate Table */}
      {isLoading ? (
        <div className="glass-panel rounded-xl border border-white/10">
          <TableSkeleton rows={5} cols={6} />
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description="No candidates match your search filters. You can add a candidate manually or import via job application."
          actionLabel="Add Candidate"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="glass-panel rounded-xl border border-white/10 overflow-x-auto shadow-glass-sm">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Candidate & Current Role</th>
                <th>Skills & Tags</th>
                <th>Experience</th>
                <th>Location</th>
                <th>Source</th>
                <th>Stage</th>
                <th>Owner</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((cand) => (
                <tr key={cand.id}>
                  <td>
                    <Link
                      to={`/candidates/${cand.id}`}
                      className="font-bold text-white hover:text-brand-300 transition-colors block"
                    >
                      {cand.name}
                    </Link>
                    <span className="text-[11px] text-slate-400">
                      {cand.currentTitle} &bull; {cand.currentCompany}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(cand.skills || []).slice(0, 3).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300">
                          {s}
                        </span>
                      ))}
                      {(cand.skills || []).length > 3 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          +{cand.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-mono font-medium text-slate-200">
                      {cand.experienceYears} Yrs
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {cand.location}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-400">{cand.source}</span>
                  </td>
                  <td>
                    <ApplicationStageBadge stage={cand.status} />
                  </td>
                  <td>
                    <span className="text-xs text-slate-300">{cand.assignedRecruiterName || 'Unassigned'}</span>
                  </td>
                  <td className="text-right">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => navigate(`/candidates/${cand.id}`)}
                      className="text-xs py-1 px-2.5"
                    >
                      Profile &rarr;
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Candidate Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Candidate Profile"
        description="Register a candidate directly into your talent pool."
      >
        <form onSubmit={handleCreateCandidate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              placeholder="Alexander Wright"
              value={newCandidate.name}
              onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={newCandidate.email}
              onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={newCandidate.phone}
              onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
            />
            <Input
              label="Location"
              placeholder="San Francisco, CA"
              value={newCandidate.location}
              onChange={(e) => setNewCandidate({ ...newCandidate, location: e.target.value })}
            />
            <Input
              label="Current Title"
              placeholder="Senior Backend Engineer"
              value={newCandidate.currentTitle}
              onChange={(e) => setNewCandidate({ ...newCandidate, currentTitle: e.target.value })}
            />
            <Input
              label="Current Company"
              placeholder="Tech Corp"
              value={newCandidate.currentCompany}
              onChange={(e) => setNewCandidate({ ...newCandidate, currentCompany: e.target.value })}
            />
            <Input
              label="Experience (Years)"
              type="number"
              value={newCandidate.experienceYears}
              onChange={(e) => setNewCandidate({ ...newCandidate, experienceYears: e.target.value })}
            />
            <Select
              label="Sourcing Channel"
              value={newCandidate.source}
              onChange={(e) => setNewCandidate({ ...newCandidate, source: e.target.value })}
              options={[
                { label: 'Direct Sourcing', value: 'Direct Sourcing' },
                { label: 'LinkedIn', value: 'LinkedIn' },
                { label: 'Referral', value: 'Referral' },
                { label: 'Career Page', value: 'Career Page' },
              ]}
            />
          </div>

          <Input
            label="Key Skills (Comma Separated)"
            placeholder="Node.js, PostgreSQL, TypeScript, AWS"
            value={newCandidate.skills}
            onChange={(e) => setNewCandidate({ ...newCandidate, skills: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createCandMutation.isPending}
            >
              Save Candidate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
