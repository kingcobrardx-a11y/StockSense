import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({
  message = 'Loading...',
  size = 'md', // 'sm' | 'md' | 'lg'
  fullPage = false,
  className = '',
}) {
  return (
    <div className={`spinner-container ${fullPage ? 'full-page' : ''} ${className}`}>
      <div className={`spinner spinner-${size}`} />
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
}
