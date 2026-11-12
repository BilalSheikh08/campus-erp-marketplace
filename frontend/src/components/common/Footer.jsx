import { ArrowUpRight, BookOpen, Building2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const campusLinks = [
  { to: '/marketplace', label: 'Campus marketplace' },
  { to: '/marketplace/canteen', label: 'Canteen' },
  { to: '/marketplace/stationery', label: 'Stationery' },
  { to: '/marketplace/hostel_supply', label: 'Hostel supplies' },
];

const accountLinks = [
  { to: '/books', label: 'Used books' },
  { to: '/become-vendor', label: 'Become a vendor' },
  { to: '/about', label: 'About the platform' },
  { to: '/contact', label: 'Contact support' },
];

export default function Footer() {
  return (
    <footer className="campus-footer mt-auto">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-white/15 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_.8fr]">
          <div className="max-w-md">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4a75d] text-[#203a2d]"><Building2 className="h-5 w-5" /></span>
              <span className="text-lg font-bold tracking-tight text-white">Campus<span className="text-[#e4a75d]">ERP</span></span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-[#bdc9bf]">
              One campus account for everyday shopping, student book exchange, and hostel supply requests.
            </p>
            <Link to="/marketplace" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#f0bd7d]">
              Explore the marketplace <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <nav aria-label="Campus services">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#e4a75d]">Campus services</h2>
            <ul className="mt-4 space-y-3 text-sm text-[#d7ded7]">
              {campusLinks.map((item) => <li key={item.to}><Link to={item.to}>{item.label}</Link></li>)}
            </ul>
          </nav>

          <nav aria-label="Platform links">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#e4a75d]">More</h2>
            <ul className="mt-4 space-y-3 text-sm text-[#d7ded7]">
              {accountLinks.map((item) => <li key={item.to}><Link to={item.to}>{item.label}</Link></li>)}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-[#a9b8ac] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Campus ERP Marketplace</p>
          <p className="flex items-center gap-2"><ShoppingBag className="h-3.5 w-3.5" /> Campus commerce, made more convenient <BookOpen className="ml-1 h-3.5 w-3.5" /></p>
        </div>
      </div>
    </footer>
  );
}
