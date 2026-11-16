/**
 * Campus Commons - Main University Portal & Marketplace
 * Distinctive university publication & campus wayfinding design:
 * Warm paper base, deep ink typography, physical dispatch slips for pickup PINs,
 * and clear department directory layout.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from '../components/shared/Button';
import { fetchOrders } from '../api/orders';
import { formatPrice } from '../utils/formatters';
import {
  ArrowRight,
  ShoppingCart,
  BookOpen,
  Package,
  Building2,
  Search,
  KeyRound,
  ChevronRight,
  MapPin,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      fetchOrders()
        .then((data) => {
          setOrders(Array.isArray(data) ? data : data?.results || []);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user?.role]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (activeTab === 'books') {
      navigate(`/books?search=${encodeURIComponent(query)}`);
    } else if (activeTab !== 'all') {
      navigate(`/marketplace?domain=${activeTab}&search=${encodeURIComponent(query)}`);
    } else {
      navigate(`/marketplace?search=${encodeURIComponent(query)}`);
    }
  };

  const campusDomains = [
    {
      id: 'canteen',
      title: 'Canteen Dining',
      code: 'ANNEX-A',
      location: 'Ground Floor, Dining Hall',
      tagline: 'Kitchen Express Pre-Orders',
      desc: 'Pre-order hot thalis, freshly rolled snacks, and beverages. Collect at the express collection hatch using your 4-digit token PIN.',
      path: '/marketplace/canteen',
      cta: 'Explore Kitchen Menu',
      icon: ShoppingCart,
      accent: 'border-amber-200 bg-amber-50/60 text-amber-900',
      badge: 'Counter Pickup',
    },
    {
      id: 'stationery',
      title: 'Stationery Depot',
      code: 'BLOCK-02',
      location: 'Academic Concourse South',
      tagline: 'Coursework & Examination Supplies',
      desc: 'Official examination blue books, engineering graph pads, laboratory logbooks, drafting tools, and approved scientific calculators.',
      path: '/marketplace/stationery',
      cta: 'View Depot Catalog',
      icon: Package,
      accent: 'border-sky-200 bg-sky-50/60 text-sky-900',
      badge: 'Official Stock',
    },
    {
      id: 'hostel',
      title: 'Hostel Logistics',
      code: 'RES-01',
      location: 'Superintendent Office, Hall 1',
      tagline: 'Warden-Verified Room Supplies',
      desc: 'Resident mattress allocations, task lamps, desk seating, room maintenance kits, and verified hall requisitions.',
      path: isAuthenticated ? '/hostel-requests' : '/marketplace/hostel_supply',
      cta: 'Lodge Requisition',
      icon: Building2,
      accent: 'border-emerald-200 bg-emerald-50/60 text-emerald-900',
      badge: 'Supervised',
    },
    {
      id: 'books',
      title: 'Used Books Exchange',
      code: 'LIB-WEST',
      location: 'Central Library Portico',
      tagline: 'Peer-to-Peer Academic Exchange',
      desc: 'Acquire verified course textbooks from senior students or list your previous semester volumes. Zero commission, physical campus handoff.',
      path: '/books',
      cta: 'Search Bookshelf',
      icon: BookOpen,
      accent: 'border-purple-200 bg-purple-50/60 text-purple-900',
      badge: 'P2P Circulation',
    },
  ];

  const activeOrders = orders.filter(
    (o) => o.status === 'placed' || o.status === 'confirmed' || o.status === 'ready'
  );

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 font-sans">
      {/* University Masthead & Hero Section */}
      <section className="border-b border-[#E4DDCF] bg-[#FAF8F3] pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Folio Line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E4DDCF] text-[11px] font-mono text-zinc-600 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-950 uppercase tracking-widest">GAZETTE DISPATCH</span>
              <span>•</span>
              <span>VOL. 14, NO. 02</span>
              <span>•</span>
              <span>SEMESTER CALENDAR 2026-27</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              <span>All 4 Campus Concession Desks Operational</span>
            </div>
          </div>

          {/* Broadside Headline */}
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-zinc-950 tracking-tight leading-tight">
              The University Central Exchange <br />
              <span className="italic font-light text-zinc-700">&amp; Concessions Clearinghouse.</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Official campus infrastructure for meal pre-orders, examination stationery, residence hall requisitions, and peer textbook circulation.
            </p>
          </div>

          {/* Search & Index Console */}
          <div className="max-w-3xl mx-auto">
            <div className="paper-surface rounded-lg p-3 sm:p-4 border border-[#E4DDCF] bg-white shadow-xs">
              {/* Category Segment Tabs */}
              <div className="flex overflow-x-auto gap-1 pb-2.5 mb-3 border-b border-[#E4DDCF] scrollbar-none text-xs font-mono">
                {[
                  { id: 'all', label: 'All Concessions' },
                  { id: 'canteen', label: 'Dining (Meals)' },
                  { id: 'stationery', label: 'Depot (Stationery)' },
                  { id: 'hostel_supply', label: 'Hostel Supplies' },
                  { id: 'books', label: 'Used Textbooks' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded transition-colors cursor-pointer whitespace-nowrap text-xs font-medium ${
                      activeTab === tab.id
                        ? 'bg-zinc-900 text-white font-semibold'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search meals, examination blue books, task lamps, textbook ISBN..."
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 bg-[#FAF8F3] hover:bg-white focus:bg-white rounded border border-[#E4DDCF] focus:outline-none focus:ring-1 focus:ring-blue-900/30 focus:border-blue-900 transition-colors font-sans"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="px-5 py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <span>Search Catalog</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </form>

              {/* Directory Reference Tags */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 text-[11px] font-mono text-zinc-500">
                <span className="font-semibold text-zinc-400">Quick Index:</span>
                {['Veg Thali', 'Blue Examination Book', 'Algorithms CLRS', 'Study Lamp', 'Lab Journal'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item);
                      navigate(`/marketplace?search=${encodeURIComponent(item)}`);
                    }}
                    className="px-2 py-0.5 rounded border border-[#E4DDCF] bg-[#FAF8F3] hover:bg-[#EFECE1] text-zinc-700 transition-colors cursor-pointer text-[10px]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Active Pickup Vouchers (If student has open orders) */}
      {isAuthenticated && user?.role === 'student' && activeOrders.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="border border-[#E4DDCF] bg-white rounded-lg p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4DDCF]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-zinc-950">Active Counter Pickup Vouchers</h3>
                  <p className="text-xs text-zinc-500 font-mono">Present your 4-digit PIN at the express counter window.</p>
                </div>
              </div>
              <Link to="/orders" className="text-xs font-mono font-semibold text-blue-900 hover:underline flex items-center gap-1">
                <span>View All Orders &amp; Receipts</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Voucher Cards Styled Like Physical Service Slips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {activeOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="bg-[#FAF8F3] rounded border border-[#E4DDCF] p-4 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-zinc-600 block">
                        DOCKET #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <p className="text-xs text-zinc-700 mt-0.5">
                        {order.items?.length || 1} item(s) • <span className="font-semibold text-zinc-900">{formatPrice(order.total_amount)}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-800">
                      {order.status}
                    </span>
                  </div>

                  {/* Monospace PIN Ticket Stamping */}
                  <div className="pt-2 border-t border-dashed border-[#E4DDCF] flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">EXPRESS PIN:</span>
                    <span className="font-mono font-bold text-lg text-amber-900 tracking-widest bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                      {order.pickup_pin || '4821'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Four Core Campus Departments Broadside */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-3 border-b border-[#E4DDCF]">
          <div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-500 uppercase block mb-1">
              DIRECTORY SECTION 01
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950">
              The Four Official Campus Concessions
            </h2>
          </div>
          <Link
            to="/marketplace"
            className="text-xs font-mono font-semibold text-blue-900 hover:underline inline-flex items-center gap-1 group"
          >
            <span>Complete Directory Catalog</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {campusDomains.map((wing) => {
            const Icon = wing.icon;
            return (
              <div
                key={wing.id}
                className="bg-white rounded-lg border border-[#E4DDCF] hover:border-zinc-400 transition-colors p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold text-zinc-500 border border-[#E4DDCF] px-1.5 py-0.5 rounded bg-[#FAF8F3]">
                      {wing.code}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600">
                      {wing.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded bg-[#FAF8F3] text-zinc-900 border border-[#E4DDCF]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-zinc-950">
                      {wing.title}
                    </h3>
                  </div>

                  <p className="text-[11px] font-mono text-zinc-500 mb-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{wing.location}</span>
                  </p>

                  <p className="text-xs text-zinc-600 leading-relaxed mb-6 font-sans">
                    {wing.desc}
                  </p>
                </div>

                <Link to={wing.path} className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-medium py-2 rounded border-[#E4DDCF] hover:bg-[#FAF8F3] flex items-center justify-between"
                  >
                    <span>{wing.cta}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* University Dispatch Protocol (3 Steps) */}
      <section className="border-t border-[#E4DDCF] bg-[#FAF8F3] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 block mb-1">
              STANDARD OPERATING PROCEDURE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950">
              The Campus Express Counter Protocol
            </h2>
            <p className="text-xs text-zinc-600 mt-1 font-sans">
              Rules and instructions for rapid order fulfillment across university concession windows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-lg border border-[#E4DDCF]">
              <span className="font-mono text-xs font-bold text-zinc-400 block mb-2">PROTOCOL I</span>
              <h3 className="font-serif text-base font-bold text-zinc-900 mb-2">Requisition &amp; Digital Pre-Order</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Browse canteen batches, stationery packs, or second-hand texts. Inventory is checked and reserved instantly upon checkout.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E4DDCF]">
              <span className="font-mono text-xs font-bold text-zinc-400 block mb-2">PROTOCOL II</span>
              <h3 className="font-serif text-base font-bold text-zinc-900 mb-2">Issue of Encrypted 4-Digit Docket PIN</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Upon order confirmation, a secure 4-digit token is generated on your student account and listed in your active docket tray.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E4DDCF]">
              <span className="font-mono text-xs font-bold text-zinc-400 block mb-2">PROTOCOL III</span>
              <h3 className="font-serif text-base font-bold text-zinc-900 mb-2">Express Hatch Presentation &amp; Release</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                Proceed directly to the express hatch. Quote your PIN or scan the QR docket; merchant verifies and hands over the package.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
