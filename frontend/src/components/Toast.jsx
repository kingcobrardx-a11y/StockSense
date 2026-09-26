import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

export default function Toast({
  message,
  type = 'success', // 'success' | 'error' | 'warning' | 'info'
  duration = 4000,
  onClose,
  action,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) setTimeout(onClose, 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) setTimeout(onClose, 200);
  };

  if (!isVisible && !message) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="toast-icon-success" />,
    error: <AlertCircle size={18} className="toast-icon-error" />,
    warning: <AlertTriangle size={18} className="toast-icon-warning" />,
    info: <Info size={18} className="toast-icon-info" />,
  };

  return (
    <div className={`toast-card toast-${type} ${isVisible ? 'toast-show' : 'toast-hide'}`}>
      <span className="toast-icon-wrapper">{icons[type] || icons.info}</span>
      <div className="toast-message-body">
        <span className="toast-message-text">{message}</span>
      </div>
      {action && <div className="toast-action">{action}</div>}
      <button className="toast-close-btn" onClick={handleClose} aria-label="Close notification">
        <X size={15} />
      </button>
    </div>
  );
}
