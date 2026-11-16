import PropTypes from 'prop-types';

export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const inputId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] font-semibold text-zinc-700 mb-1 tracking-wider uppercase"
        >
          {label}
          {required && <span className="text-red-700 ml-1 font-bold">*</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full text-sm px-3.5 py-2 rounded-lg border bg-white text-zinc-900 transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-900/30 focus:border-blue-900 disabled:bg-[#F1ECE1] disabled:text-zinc-400 disabled:cursor-not-allowed ${
          error ? 'border-red-700 ring-1 ring-red-700/20' : 'border-[#E4DDCF]'
        } ${className}`}
        {...props}
      />

      {error && <p className="text-xs text-red-700 mt-1 font-medium">{error}</p>}
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
