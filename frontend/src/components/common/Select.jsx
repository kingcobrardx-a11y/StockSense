import { useId } from 'react';
import { Icon } from './Icons';

export function Select({
  label,
  id,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  required = false,
  className = '',
  wrapperClassName = '',
  disabled = false,
  children,
  ...props
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div className={`form-group ${wrapperClassName}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="form-required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className={`select-wrapper ${error ? 'has-error' : ''}`}>
        <select
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`select-field ${className}`.trim()}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <span className="select-arrow" aria-hidden="true">
          <Icon name="chevron-down" size={16} />
        </span>
      </div>
      {error && (
        <p id={errorId} className="form-error" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="form-helper">
          {helperText}
        </p>
      )}
    </div>
  );
}
