/**
 * Campus Commons - Main University Portal & Marketplace
 * Inspired by high-craft editorial design with celestial slate hero,
 * floating search console, active pickup tokens, and 4 campus department hubs.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from '../components/shared/Button';
import PickupQRModal from '../components/shared/PickupQRModal';
import { fetchOrders } from '../api/orders';
import { formatPrice } from '../utils/formatters';
import {
  ArrowRight,
  ShoppingCart,
  BookOpen,
  Package,
  Building2,
  Store,
  Shield,
  Search,
  KeyRound,
  QrCode,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
        .then((data) => {
          setOrders(Array.isArray(data) ? data : data?.results || []);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

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
      tagline: 'Fresh Kitchen Pre-Orders',
      desc: 'Pre-order hot meals, rolls, and beverages. Collect at the express pickup window with your 4-digit token PIN.',
      path: '/marketplace/canteen',
      cta: 'Explore Menu',
      icon: ShoppingCart,
      accent: 'text-orange-600 bg-orange-50 border-orange-200',
      badge: 'Fast Counter Pickup',
    },
    {
      id: 'stationery',
      title: 'Stationery Depot',
      tagline: 'Coursework & Exam Supplies',
      desc: 'Official semester blue books, engineering drafters, lab journals, calculators, and exam kits.',
      path: '/marketplace/stationery',
      cta: 'Browse Supplies',
      icon: Package,
      accent: 'text-sky-600 bg-sky-50 border-sky-200',
      badge: 'Campus Stocked',
    },
    {
      id: 'hostel',
      title: 'Hostel Logistics',
      tagline: 'Warden-Supervised Requests',
      desc: 'Room mattresses, study lamps, cleaning equipment, and room key maintenance verified by residence staff.',
      path: isAuthenticated ? '/hostel-requests' : '/marketplace/hostel_supply',
      cta: 'View Requisitions',
      icon: Building2,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      badge: 'Residence Desk',
    },
    {
      id: 'books',
      title: 'Used Books Exchange',
      tagline: 'Student P2P Marketplace',
      desc: 'Pass down engineering, science, and humanities textbooks to junior peers. Zero platform commission and campus handoffs.',
      path: '/books',
      cta: 'Find Textbooks',
      icon: BookOpen,
      accent: 'text-purple-600 bg-purple-50 border-purple-200',
      badge: '0% Platform Fee',
    },
  ];

  const activeOrders = orders.filter(
    (o) => o.status === 'placed' || o.status === 'confirmed' || o.status === 'ready'
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section: Celestial Midnight Art Direction */}
      <section className="relative bg-gradient-to-b from-slate-950 via-[#0A1128] to-slate-900 text-white pt-16 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Decorative Star/Grid Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto text-center space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300 shadow-sm backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>The Unified University Campus Clearinghouse</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium">Semester Active</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Everything for campus life. <br />
            <span className="font-editorial italic font-normal text-slate-200">
              In one seamless place.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Pre-order hot dining, restock exam stationery, submit warden-monitored hostel requisitions, and exchange textbooks with peers.
          </p>

          {/* Floating High-Craft Search & Discovery Card */}
          <div className="pt-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-elevated border border-slate-200/80 text-left">
              {/* Category Segment Tabs */}
              <div className="flex overflow-x-auto gap-1 pb-3 mb-3 border-b border-slate-100 scrollbar-none text-xs font-semibold">
                {[
                  { id: 'all', label: 'All Concessions' },
                  { id: 'canteen', label: 'Dining' },
                  { id: 'stationery', label: 'Stationery' },
                  { id: 'hostel_supply', label: 'Hostel' },
                  { id: 'books', label: 'Textbooks' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search campus meals, blue books, lamps, textbooks..."
                    className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
                <Button
                  type="submit"
                  variant="blue"
                  size="lg"
                  className="py-3.5 px-6 rounded-2xl shadow-sm text-sm font-bold flex items-center justify-center gap-2"
                >
                  <span>Search Campus</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-400">Popular:</span>
                {['Veg Thali', 'Graph Sheet Set', 'CLRS Algorithms', 'Hostel Mattress', 'Lab Record'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item);
                      navigate(`/marketplace?search=${encodeURIComponent(item)}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Workspace Alerts (If Logged In as Vendor, Warden, or Admin) */}
      {isAuthenticated && (user?.role === 'vendor' || user?.role === 'warden' || user?.role === 'admin') && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                {user.role === 'vendor' && <Store className="h-6 w-6 text-orange-400" />}
                {user.role === 'warden' && <Building2 className="h-6 w-6 text-emerald-400" />}
                {user.role === 'admin' && <Shield className="h-6 w-6 text-blue-400" />}
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Operations Console</p>
                <h3 className="text-base font-bold text-slate-900">
                  Welcome back, {user.name} ({user.role?.toUpperCase()})
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {user.role === 'vendor' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none flex items-center gap-1.5"
                    onClick={() => setShowQRModal(true)}
                  >
                    <QrCode className="h-4 w-4 text-slate-700" />
                    <span>Pickup PIN Scanner</span>
                  </Button>
                  <Link to="/vendor/dashboard" className="flex-1 sm:flex-none">
                    <Button variant="default" size="sm" className="w-full">
                      Merchant Desk
                    </Button>
                  </Link>
                </>
              )}
              {user.role === 'warden' && (
                <Link to="/warden/dashboard" className="w-full sm:w-auto">
                  <Button variant="default" size="sm" className="w-full">
                    Residence Management Desk
                  </Button>
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="w-full sm:w-auto">
                  <Button variant="default" size="sm" className="w-full">
                    Platform Governance Console
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Active Orders Banner for Students */}
      {isAuthenticated && activeOrders.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-blue-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 flex items-center justify-center text-blue-300 border border-blue-500/30">
                  <KeyRound className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Active Counter Pickup Orders</h3>
                  <p className="text-xs text-blue-200">
                    Flash your 4-digit PIN at the counter to collect your order instantly.
                  </p>
                </div>
              </div>
              <Link to="/orders" className="text-xs font-semibold text-blue-300 hover:text-white flex items-center gap-1 transition">
                <span>View Full Order History</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
              {activeOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/15 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-blue-200 font-bold">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {order.items?.length || 1} item(s) • <strong className="text-white">{formatPrice(order.total_amount)}</strong>
                    </p>
                  </div>

                  <div className="text-right pl-3 border-l border-white/20">
                    <span className="text-[10px] text-blue-200 block uppercase font-bold">Pickup PIN</span>
                    <span className="text-lg font-mono font-extrabold text-amber-400 tracking-wider">
                      {order.pickup_pin || '4821'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Campus Concessions: 4 Key Domains */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              <span>Campus Clearinghouse</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Four Core Campus Departments
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Access certified campus vendors, stationery supplies, residence hall equipment, and textbook exchange desks.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 group transition"
          >
            <span>Explore Complete Catalog</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {campusDomains.map((wing) => {
            const Icon = wing.icon;
            return (
              <div
                key={wing.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {wing.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {wing.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mb-3">{wing.tagline}</p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {wing.desc}
                  </p>
                </div>

                <Link to={wing.path} className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-bold py-2.5 rounded-xl border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-between"
                  >
                    <span>{wing.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Logistics Guide: 3-Step Counter Pickup */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Fast Counter Logistics
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Designed for rush-hour efficiency. Never wait in canteen or stationery queues again.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-mono font-bold text-sm flex items-center justify-center mb-4 border border-blue-200">
                01
              </div>
              <h3 className="font-bold text-base text-slate-900">Pre-Order &amp; Reserve Online</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Choose dining meals, stationery packs, or course books. Real inventory is locked at checkout so items never oversell.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-mono font-bold text-sm flex items-center justify-center mb-4 border border-amber-200">
                02
              </div>
              <h3 className="font-bold text-base text-slate-900">Receive Instant 4-Digit PIN</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Your order is confirmed with an encrypted 4-digit pickup PIN and matching QR code displayed right on your receipt.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-mono font-bold text-sm flex items-center justify-center mb-4 border border-emerald-200">
                03
              </div>
              <h3 className="font-bold text-base text-slate-900">Flash PIN &amp; Collect</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Walk straight to the express collection window. The merchant inputs your PIN and hands over your prepared order in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pickup Verification Modal */}
      <PickupQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        orders={orders}
        onOrderCompleted={(completed) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === completed.id ? completed : o))
          );
        }}
      />
    </div>
  );
}
