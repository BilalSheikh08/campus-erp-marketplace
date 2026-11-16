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
  path,
  ctaText = 'Explore Marketplace',
}) {
  return (
    <div className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 group">
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            {Icon && <Icon className="h-6 w-6 text-blue-400" />}
          </div>
          {badge && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        {subtitle && <p className="text-xs font-semibold text-blue-600 mb-2">{subtitle}</p>}
        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
          {description}
        </p>

        {features && features.length > 0 && (
          <ul className="space-y-2 mb-6 border-t border-slate-100 pt-3 text-xs">
            {features.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        to={path}
        className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-800 font-semibold text-xs transition-all border border-slate-200 group/btn"
      >
        <span>{ctaText}</span>
        <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
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
  path: PropTypes.string.isRequired,
  ctaText: PropTypes.string,
};
