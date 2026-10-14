import React from 'react';
import { ChevronDown } from 'lucide-react';
import './Select.css';

export function Select({
  label,
  required = false,
  error,
  options = [],
  placeholder = 'Select an option',
  value,
  onChange,
  className = '',
  id,
  ...rest
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`ats-select-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="ats-select-label">
          {label}
          {required && <span className="ats-select-required">*</span>}
        </label>
      )}

      <div className="ats-select-wrapper">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          className={`ats-select-field ${error ? 'border-red-500' : ''}`}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt, i) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={i} value={val}>
                {text}
              </option>
            );
          })}
        </select>
        <span className="ats-select-chevron">
          <ChevronDown className="w-4 h-4" />
        </span>
      </div>

      {error && <span className="ats-select-error-msg">{error}</span>}
    </div>
  );
}

export default Select;
