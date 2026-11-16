import PropTypes from 'prop-types';

export default function Button({
  children,
  type = 'button',
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium tracking-tight transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg cursor-pointer';

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-xs sm:text-sm',
    lg: 'px-5 py-2.5 text-sm sm:text-base font-semibold',
    icon: 'p-2',
  };

  const variantClasses = {
    default: 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-900 shadow-xs active:translate-y-px',
    primary: 'bg-blue-900 hover:bg-blue-950 text-white border border-blue-900 shadow-xs active:translate-y-px',
    blue: 'bg-blue-900 hover:bg-blue-950 text-white border border-blue-900 shadow-xs active:translate-y-px',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs active:translate-y-px',
    crimson: 'bg-red-800 hover:bg-red-900 text-white shadow-xs active:translate-y-px',
    secondary: 'bg-[#F1ECE1] hover:bg-[#E3DDD0] text-zinc-900 border border-[#E4DDCF]',
    outline: 'bg-white hover:bg-[#FAF8F3] text-zinc-800 border border-[#E4DDCF] shadow-xs',
    ghost: 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]',
    danger: 'bg-red-800 hover:bg-red-900 text-white shadow-xs',
    forest: 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs',
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.default} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'icon']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
};
