import React from 'react';
import { Eye, Upload, CheckCircle2, ChevronDown, FileText } from 'lucide-react';
import './ApplicationPreview.css';

export function ApplicationPreview({
  jobTitle = 'Product Manager',
  company = 'Apex Global Tech',
  location = 'San Francisco, CA',
  fieldSettings = {},
  screeningQuestions = [],
  className = ''
}) {
  const isFieldVisible = (key) => fieldSettings[key] !== 'OFF';
  const isFieldMandatory = (key) => fieldSettings[key] === 'MANDATORY';

  return (
    <div className={`ats-app-preview-container ${className}`}>
      <div className="ats-app-preview-header">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-800">Application Preview</span>
        </div>
        <span className="ats-app-preview-badge">
          Candidate View
        </span>
      </div>

      <div className="ats-app-preview-body">
        {/* Job Header */}
        <div>
          <h4 className="ats-app-preview-job-title">{jobTitle || 'Job Application'}</h4>
          <div className="ats-app-preview-job-meta mt-1">
            <span>{company || 'Company'}</span>
            <span>•</span>
            <span>{location || 'Location'}</span>
          </div>
        </div>

        {/* 1. Personal Information */}
        {isFieldVisible('personalInfo') && (
          <div className="ats-app-preview-section">
            <div className="ats-app-preview-section-title">
              <span>Personal Information</span>
              {isFieldMandatory('personalInfo') ? (
                <span className="text-[10px] text-red-500 font-semibold">Required</span>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="ats-app-preview-field">
                <span className="ats-app-preview-field-label">First Name *</span>
                <div className="ats-app-preview-mock-input">Jane</div>
              </div>
              <div className="ats-app-preview-field">
                <span className="ats-app-preview-field-label">Last Name *</span>
                <div className="ats-app-preview-mock-input">Doe</div>
              </div>
            </div>

            <div className="ats-app-preview-field">
              <span className="ats-app-preview-field-label">Email Address *</span>
              <div className="ats-app-preview-mock-input">jane.doe@example.com</div>
            </div>

            <div className="ats-app-preview-field">
              <span className="ats-app-preview-field-label">Phone Number</span>
              <div className="ats-app-preview-mock-input">+1 (555) 000-0000</div>
            </div>
          </div>
        )}

        {/* 2. Address */}
        {isFieldVisible('address') && (
          <div className="ats-app-preview-section">
            <div className="ats-app-preview-section-title">
              <span>Address Details</span>
              {isFieldMandatory('address') ? (
                <span className="text-[10px] text-red-500 font-semibold">Required</span>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="ats-app-preview-field">
                <span className="ats-app-preview-field-label">City</span>
                <div className="ats-app-preview-mock-input">San Francisco</div>
              </div>
              <div className="ats-app-preview-field">
                <span className="ats-app-preview-field-label">Country</span>
                <div className="ats-app-preview-mock-input">United States</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Resume */}
        {isFieldVisible('resume') && (
          <div className="ats-app-preview-section">
            <div className="ats-app-preview-section-title">
              <span>Resume / CV</span>
              {isFieldMandatory('resume') ? (
                <span className="text-[10px] text-red-500 font-semibold">Required</span>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
              )}
            </div>

            <div className="ats-app-preview-dropzone">
              <Upload className="w-5 h-5 text-indigo-500" />
              <span className="text-xs font-semibold text-slate-700">Attach Resume</span>
              <span className="text-[10px] text-slate-400">PDF, DOC, DOCX up to 10MB</span>
            </div>
          </div>
        )}

        {/* 4. Work Experience */}
        {isFieldVisible('workExperience') && (
          <div className="ats-app-preview-section">
            <div className="ats-app-preview-section-title">
              <span>Work Experience</span>
              {isFieldMandatory('workExperience') ? (
                <span className="text-[10px] text-red-500 font-semibold">Required</span>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
              )}
            </div>

            <div className="ats-app-preview-field">
              <span className="ats-app-preview-field-label">Most Recent Role / Employer</span>
              <div className="ats-app-preview-mock-input">Senior Specialist at TechCorp</div>
            </div>
            <div className="ats-app-preview-field">
              <span className="ats-app-preview-field-label">Years of Relevant Experience</span>
              <div className="ats-app-preview-mock-input">5 Years</div>
            </div>
          </div>
        )}

        {/* 5. Education Details */}
        {isFieldVisible('education') && (
          <div className="ats-app-preview-section">
            <div className="ats-app-preview-section-title">
              <span>Education Details</span>
              {isFieldMandatory('education') ? (
                <span className="text-[10px] text-red-500 font-semibold">Required</span>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
              )}
            </div>

            <div className="ats-app-preview-field">
              <span className="ats-app-preview-field-label">Highest Degree / Institute</span>
              <div className="ats-app-preview-mock-input">B.S. in Computer Science</div>
            </div>
          </div>
        )}

        {/* 6. Notice Period */}
        {isFieldVisible('noticePeriod') && (
          <div className="ats-app-preview-section">
            <div className="ats-app-preview-section-title">
              <span>Notice Period</span>
              {isFieldMandatory('noticePeriod') ? (
                <span className="text-[10px] text-red-500 font-semibold">Required</span>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
              )}
            </div>

            <div className="ats-app-preview-mock-input flex items-center justify-between">
              <span>Select notice period (e.g. 30 Days)</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        )}

        {/* 7. Work / Portfolio */}
        {isFieldVisible('portfolio') && (
          <div className="ats-app-preview-section">
            <div className="ats-app-preview-section-title">
              <span>Work / Portfolio</span>
              {isFieldMandatory('portfolio') ? (
                <span className="text-[10px] text-red-500 font-semibold">Required</span>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
              )}
            </div>

            <div className="ats-app-preview-field">
              <span className="ats-app-preview-field-label">LinkedIn / GitHub / Portfolio URL</span>
              <div className="ats-app-preview-mock-input">https://linkedin.com/in/janedoe</div>
            </div>
          </div>
        )}

        {/* 8. Screening Questions */}
        {isFieldVisible('screeningQuestions') && screeningQuestions && screeningQuestions.length > 0 && (
          <div className="ats-app-preview-section">
            <div className="ats-app-preview-section-title">
              <span>Screening Questions ({screeningQuestions.length})</span>
            </div>

            {screeningQuestions.map((sq, idx) => (
              <div key={sq.id || idx} className="ats-app-preview-field">
                <span className="ats-app-preview-field-label">
                  {idx + 1}. {sq.question}
                  {sq.isMandatory && <span className="text-red-500 ml-0.5">*</span>}
                </span>

                {sq.type === 'YES_NO' ? (
                  <div className="flex items-center gap-4 mt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600">
                      <input type="radio" name={`sq-${idx}`} defaultChecked readOnly /> Yes
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-600">
                      <input type="radio" name={`sq-${idx}`} readOnly /> No
                    </label>
                  </div>
                ) : sq.type === 'MULTIPLE_CHOICE' ? (
                  <div className="flex flex-col gap-1 mt-1">
                    {(sq.options || ['Option A', 'Option B']).map((opt, oIdx) => (
                      <label key={oIdx} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <input type="radio" name={`sq-${idx}`} readOnly /> {opt}
                      </label>
                    ))}
                  </div>
                ) : sq.type === 'DROPDOWN' ? (
                  <div className="ats-app-preview-mock-input flex items-center justify-between">
                    <span>Select an option...</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ) : (
                  <div className="ats-app-preview-mock-input">
                    {sq.placeholder || 'Type your answer here...'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button type="button" className="ats-app-preview-submit-btn">
          Submit Application
        </button>
      </div>
    </div>
  );
}

export default ApplicationPreview;
