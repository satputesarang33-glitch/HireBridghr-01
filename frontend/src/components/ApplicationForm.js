import React from 'react';
import {
  User,
  MapPin,
  FileText,
  Briefcase,
  GraduationCap,
  Clock,
  Globe,
  HelpCircle
} from 'lucide-react';
import { ScreeningQuestions } from './ScreeningQuestions.js';
import { ApplicationPreview } from './ApplicationPreview.js';
import './ApplicationForm.css';

const DEFAULT_APPLICATION_FIELDS = [
  {
    key: 'personalInfo',
    name: 'Personal Information',
    desc: 'Candidate full name, email address, phone number',
    icon: User,
    defaultState: 'MANDATORY'
  },
  {
    key: 'address',
    name: 'Address',
    desc: 'Current city, state, country of residence',
    icon: MapPin,
    defaultState: 'OPTIONAL'
  },
  {
    key: 'resume',
    name: 'Resume',
    desc: 'Curriculum Vitae / Resume file upload (PDF/DOC)',
    icon: FileText,
    defaultState: 'MANDATORY'
  },
  {
    key: 'workExperience',
    name: 'Work Experience',
    desc: 'Past employment history, company, role, duration',
    icon: Briefcase,
    defaultState: 'MANDATORY'
  },
  {
    key: 'education',
    name: 'Education Details',
    desc: 'Highest degree obtained, institute, year of graduation',
    icon: GraduationCap,
    defaultState: 'OPTIONAL'
  },
  {
    key: 'noticePeriod',
    name: 'Notice Period',
    desc: 'Days required before candidate can join',
    icon: Clock,
    defaultState: 'MANDATORY'
  },
  {
    key: 'portfolio',
    name: 'Work / Portfolio',
    desc: 'Personal portfolio, GitHub, LinkedIn or Behance URL',
    icon: Globe,
    defaultState: 'OPTIONAL'
  },
  {
    key: 'screeningQuestions',
    name: 'Screening Questions',
    desc: 'Custom qualification and compliance questions',
    icon: HelpCircle,
    defaultState: 'MANDATORY'
  }
];

export function ApplicationForm({
  fieldSettings = {},
  onFieldSettingsChange,
  screeningQuestions = [],
  onScreeningQuestionsChange,
  jobTitle = '',
  company = '',
  location = '',
  className = ''
}) {
  const handleToggleState = (fieldKey, state) => {
    if (onFieldSettingsChange) {
      onFieldSettingsChange({
        ...fieldSettings,
        [fieldKey]: state
      });
    }
  };

  return (
    <div className={`ats-app-builder-layout ${className}`}>
      {/* Left Column: Form Builder Controls */}
      <div className="ats-app-builder-left">
        <div className="ats-app-builder-card">
          <div className="ats-app-builder-header">
            <h3 className="ats-app-builder-title">Application Form Builder</h3>
            <p className="ats-app-builder-subtitle">
              Configure candidate application fields. Mark fields as Mandatory, Optional, or turn them Off.
            </p>
          </div>

          <div className="ats-app-fields-list">
            {DEFAULT_APPLICATION_FIELDS.map((field) => {
              const currentState = fieldSettings[field.key] || field.defaultState;
              const Icon = field.icon;

              return (
                <div key={field.key} className="ats-app-field-row">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="ats-app-field-info">
                      <span className="ats-app-field-name">{field.name}</span>
                      <span className="ats-app-field-desc">{field.desc}</span>
                    </div>
                  </div>

                  {/* 3-Way Toggle Pills: Mandatory | Optional | Off */}
                  <div className="ats-toggle-pills">
                    <button
                      type="button"
                      className={`ats-toggle-pill ${
                        currentState === 'MANDATORY' ? 'is-active-mandatory' : ''
                      }`}
                      onClick={() => handleToggleState(field.key, 'MANDATORY')}
                    >
                      Mandatory
                    </button>
                    <button
                      type="button"
                      className={`ats-toggle-pill ${
                        currentState === 'OPTIONAL' ? 'is-active-optional' : ''
                      }`}
                      onClick={() => handleToggleState(field.key, 'OPTIONAL')}
                    >
                      Optional
                    </button>
                    <button
                      type="button"
                      className={`ats-toggle-pill ${
                        currentState === 'OFF' ? 'is-active-off' : ''
                      }`}
                      onClick={() => handleToggleState(field.key, 'OFF')}
                    >
                      Off
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Screening Questions Section (When enabled) */}
        {fieldSettings.screeningQuestions !== 'OFF' && (
          <div className="ats-app-builder-card">
            <ScreeningQuestions
              questions={screeningQuestions}
              onChange={onScreeningQuestionsChange}
            />
          </div>
        )}
      </div>

      {/* Right Column: Live Dynamic Application Preview */}
      <div className="ats-app-builder-right">
        <ApplicationPreview
          jobTitle={jobTitle}
          company={company}
          location={location}
          fieldSettings={fieldSettings}
          screeningQuestions={
            fieldSettings.screeningQuestions !== 'OFF' ? screeningQuestions : []
          }
        />
      </div>
    </div>
  );
}

export default ApplicationForm;
