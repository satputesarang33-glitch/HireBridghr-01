import React from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import { Select } from './Select.js';
import './Sidebar.css';

export function Sidebar({
  jobStatus = 'OPEN',
  onJobStatusChange,
  department = '',
  onDepartmentChange,
  departments = [],
  createdFrom = '',
  onCreatedFromChange,
  createdTill = '',
  onCreatedTillChange,
  location = '',
  onLocationChange,
  locations = [],
  client = '',
  onClientChange,
  clients = [],
  onCreateJob,
  onResetFilters,
  className = ''
}) {
  const hasActiveFilters =
    jobStatus !== 'OPEN' ||
    Boolean(department) ||
    Boolean(createdFrom) ||
    Boolean(createdTill) ||
    Boolean(location) ||
    Boolean(client);

  return (
    <aside className={`ats-sidebar ${className}`}>
      {/* Primary CTA */}
      <div className="ats-sidebar-cta">
        <button
          type="button"
          onClick={onCreateJob}
          className="ats-sidebar-create-btn"
        >
          <span>Create New Job</span>
        </button>
      </div>

      {/* Filter 1: Job Status */}
      <div className="ats-sidebar-section">
        <span className="ats-sidebar-title">Job Status</span>
        <div className="ats-radio-group">
          <label className="ats-radio-label" onClick={() => onJobStatusChange('OPEN')}>
            <div className={`ats-radio-custom ${jobStatus === 'OPEN' ? 'is-checked' : ''}`}>
              {jobStatus === 'OPEN' && <div className="ats-radio-dot" />}
            </div>
            <span className={`ats-radio-text ${jobStatus === 'OPEN' ? 'is-checked' : ''}`}>
              Open Jobs
            </span>
          </label>

          <label className="ats-radio-label" onClick={() => onJobStatusChange('CLOSED')}>
            <div className={`ats-radio-custom ${jobStatus === 'CLOSED' ? 'is-checked' : ''}`}>
              {jobStatus === 'CLOSED' && <div className="ats-radio-dot" />}
            </div>
            <span className={`ats-radio-text ${jobStatus === 'CLOSED' ? 'is-checked' : ''}`}>
              Closed Jobs
            </span>
          </label>
        </div>
      </div>

      {/* Filter 2: Department */}
      <div className="ats-sidebar-section">
        <span className="ats-sidebar-title">Department</span>
        <Select
          placeholder="Select department"
          options={departments}
          value={department}
          onChange={(e) => onDepartmentChange(e.target.value)}
        />
      </div>

      {/* Filter 3: Created Date Range */}
      <div className="ats-sidebar-section">
        <span className="ats-sidebar-title">Created Date Range</span>
        <div className="ats-date-inputs">
          <div className="ats-date-wrapper">
            <input
              type="date"
              className="ats-date-input"
              value={createdFrom}
              onChange={(e) => onCreatedFromChange(e.target.value)}
              onClick={(e) => {
                try {
                  e.target.showPicker?.();
                } catch (err) {}
              }}
              placeholder="Created From"
            />
            <Calendar className="w-4 h-4 ats-date-icon" />
          </div>
          <div className="ats-date-wrapper">
            <input
              type="date"
              className="ats-date-input"
              value={createdTill}
              onChange={(e) => onCreatedTillChange(e.target.value)}
              onClick={(e) => {
                try {
                  e.target.showPicker?.();
                } catch (err) {}
              }}
              placeholder="Created Till"
            />
            <Calendar className="w-4 h-4 ats-date-icon" />
          </div>
        </div>
      </div>

      {/* Filter 4: Location */}
      <div className="ats-sidebar-section">
        <span className="ats-sidebar-title">Location</span>
        <Select
          placeholder="Select location"
          options={locations}
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </div>

      {/* Filter 5: Client */}
      <div className="ats-sidebar-section">
        <span className="ats-sidebar-title">Client</span>
        <Select
          placeholder="Select client"
          options={clients}
          value={client}
          onChange={(e) => onClientChange(e.target.value)}
        />
      </div>

      {/* Reset filters action */}
      {hasActiveFilters && onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="ats-sidebar-reset-btn"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      )}
    </aside>
  );
}

export default Sidebar;
