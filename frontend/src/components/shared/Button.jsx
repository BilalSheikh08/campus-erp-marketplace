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
    'inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl cursor-pointer';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs sm:text-sm',
    lg: 'px-6 py-3 text-sm sm:text-base font-bold',
    icon: 'p-2',
  };

  const variantClasses = {
    default: 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:scale-[0.99]',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-[0.99]',
    blue: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-[0.99]',
    amber: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm active:scale-[0.99]',
    crimson: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-[0.99]',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200',
    outline: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
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
