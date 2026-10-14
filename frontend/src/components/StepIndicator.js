import React from 'react';
import { Check } from 'lucide-react';
import './StepIndicator.css';

export function StepIndicator({
  steps = [
    { number: 1, label: 'About Job' },
    { number: 2, label: 'Application Form' },
    { number: 3, label: 'Hiring Flow' },
    { number: 4, label: 'Finishing Up' }
  ],
  currentStep = 1,
  onStepClick,
  className = ''
}) {
  return (
    <div className={`ats-step-indicator ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;

        return (
          <React.Fragment key={step.number}>
            <button
              type="button"
              className="ats-step-item"
              onClick={() => onStepClick && onStepClick(step.number)}
              disabled={!onStepClick}
            >
              <div
                className={`ats-step-circle ${
                  isActive ? 'is-active' : isCompleted ? 'is-completed' : ''
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.number}
              </div>
              <span
                className={`ats-step-label ${
                  isActive ? 'is-active' : isCompleted ? 'is-completed' : ''
                }`}
              >
                {step.label}
              </span>
            </button>

            {index < steps.length - 1 && (
              <div
                className={`ats-step-connector ${
                  isCompleted ? 'is-completed' : ''
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default StepIndicator;
