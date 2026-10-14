import React from 'react';
import {
  Star,
  Zap,
  MoreVertical,
  ChevronDown,
  Edit,
  GitPullRequest,
  Share2,
  Trash2,
  CheckCircle,
  Users,
  Globe
} from 'lucide-react';
import { Dropdown, DropdownItem, DropdownDivider } from './Dropdown.js';
import './JobCard.css';

export function JobCard({
  job,
  onToggleStar,
  onBoost,
  onAddCandidate,
  onEditJob,
  onViewPipeline,
  onToggleStatus,
  onDeleteJob,
  onSyndicate,
  className = ''
}) {
  const {
    id,
    jobId,
    title,
    company,
    client,
    department,
    location,
    jobType,
    employmentType = 'FULLTIME',
    createdDate,
    createdAt,
    reopenedDate,
    totalCandidates = 0,
    activeCandidates = 0,
    status = 'OPEN',
    isStarred = false,
    isBoosted = false,
    teamMembers = []
  } = job;

  // Format date display
  const dateLabel = reopenedDate
    ? `Reopened on: ${reopenedDate}`
    : `Created on: ${createdDate || (createdAt ? new Date(createdAt).toLocaleDateString() : 'Recent')}`;

  const metaParts = [];
  if (department) metaParts.push(department);
  if (location) metaParts.push(location);
  if (employmentType || jobType) metaParts.push((employmentType || jobType).toUpperCase());

  return (
    <div className={`ats-job-card ${className}`}>
      {/* Top Header Row */}
      <div className="ats-job-card-header">
        <div className="ats-job-card-title-row">
          <button
            type="button"
            className="ats-job-star-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleStar) onToggleStar(job);
            }}
            title={isStarred ? 'Remove from priority' : 'Mark as priority'}
          >
            <Star
              className="w-5 h-5"
              fill={isStarred ? '#F59E0B' : 'transparent'}
              stroke={isStarred ? '#F59E0B' : '#CBD5E1'}
            />
          </button>

          <h3
            className="ats-job-title"
            onClick={() => onViewPipeline && onViewPipeline(job)}
          >
            {title}
          </h3>
        </div>

        <div className="ats-job-card-actions">
          {/* Boost Button */}
          <button
            type="button"
            className={`ats-job-boost-btn ${isBoosted ? 'is-boosted' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onBoost) onBoost(job);
            }}
          >
            <Zap className="w-3.5 h-3.5" fill="currentColor" />
            <span>Boost</span>
          </button>

          {/* Three Dots Menu */}
          <Dropdown
            align="right"
            trigger={
              <button
                type="button"
                className="ats-job-options-btn"
                title="Job options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            }
          >
            {({ close }) => (
              <>
                <DropdownItem
                  icon={GitPullRequest}
                  onClick={() => {
                    close();
                    if (onViewPipeline) onViewPipeline(job);
                  }}
                >
                  View Pipeline
                </DropdownItem>

                <DropdownItem
                  icon={Edit}
                  onClick={() => {
                    close();
                    if (onEditJob) onEditJob(job);
                  }}
                >
                  Edit Job Details
                </DropdownItem>

                <DropdownItem
                  icon={Globe}
                  onClick={() => {
                    close();
                    if (onSyndicate) onSyndicate(job);
                  }}
                >
                  Syndicate & Channels
                </DropdownItem>

                <DropdownItem
                  icon={Share2}
                  onClick={() => {
                    close();
                    navigator.clipboard?.writeText(window.location.origin + `/jobs/${jobId || id}`);
                    alert('Job share link copied to clipboard!');
                  }}
                >
                  Share Job Link
                </DropdownItem>

                <DropdownDivider />

                <DropdownItem
                  icon={CheckCircle}
                  onClick={() => {
                    close();
                    if (onToggleStatus) onToggleStatus(job);
                  }}
                >
                  {status === 'OPEN' ? 'Mark as Closed' : 'Reopen Job'}
                </DropdownItem>

                <DropdownItem
                  icon={Trash2}
                  danger
                  onClick={() => {
                    close();
                    if (onDeleteJob) onDeleteJob(job);
                  }}
                >
                  Delete Job
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>

      {/* Company & Location Metadata Row */}
      <div className="ats-job-card-meta">
        {company && company !== title && (
          <span className="ats-job-company-name">{company || client}</span>
        )}

        <div className="ats-job-meta-line">
          {metaParts.map((part, index) => (
            <React.Fragment key={index}>
              <span>{part}</span>
              <span className="ats-job-bullet">•</span>
            </React.Fragment>
          ))}
          <span>{dateLabel}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="ats-job-stats-row">
        <div className="ats-job-stat-col">
          <span className="ats-job-stat-label">Total Candidates</span>
          <span className="ats-job-stat-value">{totalCandidates}</span>
        </div>

        <div className="ats-job-stat-col">
          <span className="ats-job-stat-label">Active Candidates</span>
          <span className="ats-job-stat-value">{activeCandidates}</span>
        </div>

        <div className="ats-job-stat-col">
          <span className="ats-job-stat-label">Job ID</span>
          <span className="ats-job-stat-value">{jobId || id}</span>
        </div>
      </div>

      {/* Footer Row */}
      <div className="ats-job-card-footer">
        {/* Team Avatars */}
        <div className="ats-job-team-avatars">
          {teamMembers && teamMembers.length > 0 ? (
            teamMembers.slice(0, 3).map((member, index) => (
              <div
                key={member.id || index}
                className="ats-job-avatar-circle"
                style={{ backgroundColor: member.color || '#4F46E5' }}
                title={`${member.name} (${member.role})`}
              >
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} />
                ) : (
                  <span>{member.initial || (member.name ? member.name.charAt(0) : 'U')}</span>
                )}
              </div>
            ))
          ) : (
            <div
              className="ats-job-avatar-circle"
              style={{ backgroundColor: '#10B981' }}
              title="Talent Team"
            >
              <span>N</span>
            </div>
          )}
        </div>

        {/* Add Candidates Button */}
        <button
          type="button"
          className="ats-job-add-candidates-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onAddCandidate) onAddCandidate(job);
          }}
        >
          <span>Add Candidates</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default JobCard;
