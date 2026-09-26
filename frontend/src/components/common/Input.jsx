import { useId } from 'react';
import { Icon } from './Icons';

export function Input({
  label,
  id,
  type = 'text',
  error,
  helperText,
  required = false,
  icon = null,
  className = '',
  wrapperClassName = '',
  disabled = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={`form-group ${wrapperClassName}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="form-required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className={`input-wrapper ${icon ? 'has-icon' : ''} ${error ? 'has-error' : ''}`}>
        {icon && (
          <span className="input-icon">
            <Icon name={icon} size={16} />
          </span>
        )}
        <input
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`input-field ${className}`.trim()}
          {...props}
        />
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
