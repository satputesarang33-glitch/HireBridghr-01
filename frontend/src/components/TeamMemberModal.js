import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  UserPlus,
  Trash2,
  Check,
  Shield,
  Users
} from 'lucide-react';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Select } from './Select.js';
import { availableTeamMembers, assignableRoles } from '../data/TeamMembers.js';
import './TeamMemberModal.css';

export function TeamMemberModal({
  isOpen,
  onClose,
  assignedMembers = [],
  onUpdateAssignedMembers
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Recruiter');

  const filteredTeam = useMemo(() => {
    return availableTeamMembers.filter((m) => {
      const q = searchTerm.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.department?.toLowerCase().includes(q)
      );
    });
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (!selectedUser) {
      alert('Please select a team member from the list.');
      return;
    }

    const alreadyAssigned = assignedMembers.some((m) => m.id === selectedUser.id);
    if (alreadyAssigned) {
      alert(`${selectedUser.name} is already assigned to this hiring team.`);
      return;
    }

    const newMember = {
      ...selectedUser,
      role: selectedRole
    };

    onUpdateAssignedMembers([...assignedMembers, newMember]);
    setSelectedUser(null);
  };

  const handleRemoveMember = (memberId) => {
    onUpdateAssignedMembers(assignedMembers.filter((m) => m.id !== memberId));
  };

  return (
    <div className="ats-modal-overlay" onClick={onClose}>
      <div className="ats-tm-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="ats-modal-header">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="ats-modal-title">Hiring Team & Interviewers</h3>
          </div>
          <button type="button" className="ats-modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="ats-modal-body">
          {/* Member Search */}
          <Input
            icon={Search}
            placeholder="Search colleagues by name, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Available Members List */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-700">
              Select Colleague
            </span>
            <div className="ats-tm-members-list">
              {filteredTeam.map((member) => {
                const isSelected = selectedUser?.id === member.id;
                const isAlreadyAssigned = assignedMembers.some((m) => m.id === member.id);

                return (
                  <div
                    key={member.id}
                    className={`ats-tm-member-item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => !isAlreadyAssigned && setSelectedUser(member)}
                    style={{ opacity: isAlreadyAssigned ? 0.5 : 1 }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"
                        style={{ backgroundColor: member.color || '#4F46E5' }}
                      >
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          member.initial || member.name.charAt(0)
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">{member.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {member.email} • {member.department}
                        </span>
                      </div>
                    </div>

                    {isAlreadyAssigned ? (
                      <span className="text-[11px] font-semibold text-emerald-600">Assigned</span>
                    ) : isSelected ? (
                      <Check className="w-4 h-4 text-indigo-600" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assign Role and Add */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="sm:col-span-2">
              <Select
                label="Assign Role in Requisition"
                options={assignableRoles}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="primary"
              icon={UserPlus}
              disabled={!selectedUser}
              onClick={handleAddMember}
            >
              Add Member
            </Button>
          </div>

          {/* Currently Assigned Team Members List */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800">
              Assigned Team Members ({assignedMembers.length})
            </span>
            <div className="ats-tm-assigned-list">
              {assignedMembers.map((m) => (
                <div key={m.id} className="ats-tm-assigned-item">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"
                      style={{ backgroundColor: m.color || '#4F46E5' }}
                    >
                      {m.avatar ? (
                        <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        m.initial || m.name.charAt(0)
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{m.name}</span>
                      <span className="text-[11px] text-slate-400">{m.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="ats-tm-role-badge">{m.role || 'Recruiter'}</span>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-red-500 p-1"
                      onClick={() => handleRemoveMember(m.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ats-modal-footer">
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TeamMemberModal;
