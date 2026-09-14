/**
 * Reusable empty state component for displaying when lists are empty.
 */

import PropTypes from 'prop-types';

function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon && (
        <div className="text-6xl mb-4 opacity-40">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 text-center max-w-sm">
        {message}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  action: PropTypes.node,
};

EmptyState.defaultProps = {
  icon: null,
  action: null,
};

export default EmptyState;
