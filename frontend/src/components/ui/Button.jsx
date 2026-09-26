import React from 'react';
import './Button.css';

export default function Button({
  children,
  variant = 'primary', // primary | secondary | outline | danger | ghost | success
  size = 'md',        // sm | md | lg
  icon: Icon = null,
  iconRight: IconRight = null,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`custom-btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {Icon && <Icon className="btn-icon" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      {children && <span className="btn-label">{children}</span>}
      {IconRight && <IconRight className="btn-icon-right" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
    </button>
  );
}
