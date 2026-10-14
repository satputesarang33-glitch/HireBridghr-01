import React from 'react';
import './Input.css';

export function Input({
  label,
  required = false,
  error,
  helperText,
  icon: Icon,
  suffixIcon: SuffixIcon,
  className = '',
  id,
  type = 'text',
  ...rest
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`ats-input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="ats-input-label">
          <span>
            {label}
            {required && <span className="ats-input-required">*</span>}
          </span>
        </label>
      )}

      <div className="ats-input-wrapper">
        {Icon && (
          <span className="ats-input-prefix-icon">
            <Icon className="w-4 h-4" />
          </span>
        )}

        <input
          id={inputId}
          type={type}
          className={`ats-input-field ${Icon ? 'has-prefix' : ''} ${SuffixIcon ? 'has-suffix' : ''} ${error ? 'is-invalid' : ''}`}
          {...rest}
        />

        {SuffixIcon && (
          <span className="ats-input-suffix-icon">
            <SuffixIcon className="w-4 h-4" />
          </span>
        )}
      </div>

      {error && <span className="ats-input-error-msg">{error}</span>}
      {!error && helperText && <span className="ats-input-helper-msg">{helperText}</span>}
    </div>
  );
}

export default Input;
