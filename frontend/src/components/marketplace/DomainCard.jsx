import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DomainCard({
  title,
  subtitle,
  description,
  features,
  badge,
  icon: Icon,
  gradient,
  borderAccent,
  path,
  ctaText = 'Explore Marketplace',
}) {
  return (
    <div className={`relative flex flex-col justify-between p-8 rounded-3xl bg-white border ${borderAccent || 'border-slate-200'} shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group`}>
      {/* Background ambient glow */}
      <div className={`absolute -right-16 -top-16 w-44 h-44 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity blur-2xl pointer-events-none`} />

      <div>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
            {Icon && <Icon className="h-7 w-7" />}
          </div>
          {badge && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 tracking-wide uppercase">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        {subtitle && <p className="text-xs font-medium text-indigo-600 mb-3">{subtitle}</p>}
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {description}
        </p>

        {features && features.length > 0 && (
          <ul className="space-y-2 mb-8 border-t border-slate-100 pt-4">
            {features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        to={path}
        className="inline-flex items-center justify-between w-full px-5 py-3 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-800 font-semibold text-sm transition-all duration-200 group/btn"
      >
        <span>{ctaText}</span>
        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

DomainCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  description: PropTypes.string.isRequired,
  features: PropTypes.arrayOf(PropTypes.string),
  badge: PropTypes.string,
  icon: PropTypes.elementType,
  gradient: PropTypes.string,
  borderAccent: PropTypes.string,
  path: PropTypes.string.isRequired,
  ctaText: PropTypes.string,
};
