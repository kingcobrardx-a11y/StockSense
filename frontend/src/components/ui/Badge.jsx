import React from 'react';
import './Badge.css';

export default function Badge({
  children,
  variant = 'default', // success | warning | danger | info | purple | neutral | default
  size = 'md',        // sm | md
  dot = false,
  className = '',
}) {
  // Map common status words automatically if variant is default
  let resolvedVariant = variant;
  if (variant === 'default' && typeof children === 'string') {
    const text = children.toLowerCase();
    if (text.includes('in stock') || text.includes('received') || text.includes('completed') || text.includes('optimal') || text.includes('delivered') || text.includes('approved')) {
      resolvedVariant = 'success';
    } else if (text.includes('low') || text.includes('partial') || text.includes('packing') || text.includes('in transit') || text.includes('alert')) {
      resolvedVariant = 'warning';
    } else if (text.includes('out of stock') || text.includes('urgent') || text.includes('damage') || text.includes('danger')) {
      resolvedVariant = 'danger';
    } else if (text.includes('pending') || text.includes('scheduled') || text.includes('ready')) {
      resolvedVariant = 'info';
    } else {
      resolvedVariant = 'neutral';
    }
  }

  return (
    <span className={`badge-pill badge-${resolvedVariant} badge-${size} ${className}`}>
      {dot && <span className={`badge-dot dot-${resolvedVariant}`} />}
      {children}
    </span>
  );
}
