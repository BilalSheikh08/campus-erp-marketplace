import { useState } from 'react';
import PropTypes from 'prop-types';
import { Utensils, BookOpen, Package, Building, ShoppingBag } from 'lucide-react';

const DOMAIN_STYLES = {
  canteen: {
    icon: Utensils,
    name: 'Campus Dining',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    gradient: 'from-orange-500/10 via-amber-500/5 to-transparent',
    iconColor: 'text-orange-600',
  },
  stationery: {
    icon: Package,
    name: 'Stationery & Supplies',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    gradient: 'from-sky-500/10 via-blue-500/5 to-transparent',
    iconColor: 'text-sky-600',
  },
  hostel_supply: {
    icon: Building,
    name: 'Hostel Requisition',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    iconColor: 'text-emerald-600',
  },
  hostel: {
    icon: Building,
    name: 'Hostel Requisition',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    iconColor: 'text-emerald-600',
  },
  book: {
    icon: BookOpen,
    name: 'Academic Textbook',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    gradient: 'from-purple-500/15 via-indigo-500/5 to-transparent',
    iconColor: 'text-purple-600',
  },
  books: {
    icon: BookOpen,
    name: 'Academic Textbook',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    gradient: 'from-purple-500/15 via-indigo-500/5 to-transparent',
    iconColor: 'text-purple-600',
  },
};

export default function SafeImage({
  src,
  alt = 'Campus item',
  domain,
  category,
  className = 'w-full h-full object-cover',
}) {
  const [hasError, setHasError] = useState(false);
  const key = (domain || category || 'canteen').toLowerCase();
  const theme = DOMAIN_STYLES[key] || DOMAIN_STYLES.canteen;
  const IconComponent = theme.icon || ShoppingBag;

  // Clean initials or fallback text from alt
  const initials = alt
    ? alt
        .split(' ')
        .slice(0, 3)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'CE';

  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full relative overflow-hidden bg-slate-100 flex flex-col items-center justify-center p-4 border border-slate-200 select-none bg-gradient-to-br ${theme.gradient}`}
        role="img"
        aria-label={`${alt} (${theme.name})`}
      >
        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105">
          <IconComponent className={`h-7 w-7 ${theme.iconColor}`} />
        </div>
        <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${theme.badge} mb-1`}>
          {theme.name}
        </span>
        <span className="text-xs font-semibold text-slate-700 text-center line-clamp-1 max-w-[85%]">
          {alt || initials}
        </span>
      </div>
    );
  }

  const resolvedSrc = src?.startsWith('/media/')
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${src}`
    : src?.startsWith('media/')
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${src}`
    : src;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

SafeImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  domain: PropTypes.string,
  category: PropTypes.string,
  className: PropTypes.string,
};
