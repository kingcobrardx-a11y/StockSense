import React from 'react';
import './Button.css';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon = null,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${isLoading ? 'btn-loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {isLoading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : (
        icon && iconPosition === 'left' && <span className="btn-icon left">{icon}</span>
      )}
      <span className="btn-content">{children}</span>
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="btn-icon right">{icon}</span>
      )}
    </button>
  );
}
