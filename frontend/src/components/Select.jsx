import React from 'react';
import { ChevronDown } from 'lucide-react';
import './Select.css';

export default function Select({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...rest
}) {
  const selectId = id || name;

  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}

      <div className="select-wrapper">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="form-select"
          required={required}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt, idx) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={idx} value={val}>
                {text}
              </option>
            );
          })}
        </select>
        <span className="select-arrow">
          <ChevronDown size={16} />
        </span>
      </div>

      {error && <span className="form-error-msg">{error}</span>}
      {!error && helperText && <span className="form-helper-msg">{helperText}</span>}
    </div>
  );
}
