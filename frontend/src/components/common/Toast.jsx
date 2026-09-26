import { useToast } from '../../context/ToastContext';
import { Icon } from './Icons';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <aside className="toast-container" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => {
        const iconName =
          toast.type === 'success'
            ? 'check'
            : toast.type === 'warning'
            ? 'alert-triangle'
            : toast.type === 'error'
            ? 'alert'
            : 'info';

        return (
          <div
            key={toast.id}
            className={`toast-item toast-${toast.type}`}
            role="status"
          >
            <div className="toast-icon">
              <Icon name={iconName} size={18} />
            </div>
            <div className="toast-message">{toast.message}</div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        );
      })}
    </aside>
  );
}
