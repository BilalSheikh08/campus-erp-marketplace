/**
 * Reusable empty state component for lists, tables, and queues.
 * Redesigned with university archival notice aesthetic.
 */

import PropTypes from 'prop-types';

function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 border border-dashed border-[#E4DDCF] bg-[#FAF8F3] rounded-lg text-center max-w-xl mx-auto my-6">
      {icon && (
        <div className="w-12 h-12 rounded bg-white border border-[#E4DDCF] flex items-center justify-center text-zinc-500 mb-3 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-lg font-bold text-zinc-950 mb-1">
        {title}
      </h3>
      <p className="text-xs text-zinc-600 max-w-md mb-5 leading-relaxed font-sans">
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
