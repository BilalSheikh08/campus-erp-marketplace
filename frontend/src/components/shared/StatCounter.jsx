import PropTypes from 'prop-types';

export default function StatCounter({ icon: Icon, value, label, subtext }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
          <div className="text-sm font-semibold text-slate-700">{label}</div>
        </div>
      </div>
      {subtext && <p className="mt-3 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
}

StatCounter.propTypes = {
  icon: PropTypes.elementType,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  subtext: PropTypes.string,
};
