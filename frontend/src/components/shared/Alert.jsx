/**
 * Reusable alert component for displaying errors, warnings, success, or info messages.
 */

import { AlertCircle, CheckCircle, InfoIcon, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import PropTypes from 'prop-types';

export default function Alert({ type = 'info', title, message, onClose, dismissible = true }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    info: <InfoIcon className="h-5 w-5" />,
  };

  return (
    <div className={`border rounded-lg p-4 flex items-start gap-3 ${styles[type]}`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-grow">
        {title && <h3 className="font-semibold">{title}</h3>}
        {message && <p className={title ? 'mt-1 text-sm' : ''}>{message}</p>}
      </div>
      {dismissible && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

Alert.propTypes = {
  type: PropTypes.oneOf(['error', 'warning', 'success', 'info']),
  title: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
  dismissible: PropTypes.bool,
};
