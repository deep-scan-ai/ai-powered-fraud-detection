import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

function AlertBanner({
  type = 'info', // 'success' | 'warning' | 'error' | 'info'
  title,
  message,
  onClose,
  className = '',
}) {
  const stylesByType = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: CheckCircle,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: AlertCircle,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: XCircle,
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: Info,
    },
  };

  const { container, icon: Icon } = stylesByType[type] || stylesByType.info;

  return (
    <div
      className={`flex items-start gap-3 border rounded-lg px-4 py-3 shadow-sm ${container} ${className}`}
    >
      <div className="mt-0.5">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        {title && <h3 className="font-semibold text-sm mb-0.5">{title}</h3>}
        {message && <p className="text-sm">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-current hover:opacity-70 transition-opacity"
          aria-label="Close alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default AlertBanner;
