/**
 * Professional Home & Dashboard page for Campus ERP + Marketplace.
 * Displays a comprehensive, high-converting public landing page for visitors
 * and an executive command center for authenticated users.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import useNotificationStore from '../store/notificationStore';
import Button from '../components/shared/Button';
import DomainCard from '../components/marketplace/DomainCard';
import StatCounter from '../components/shared/StatCounter';
import {
  ArrowRight,
  ShoppingCart,
  BookOpen,
  Package,
  Home,
  CheckCircle,
  Clock,
  ShieldCheck,
  Zap,
  Users,
  Store,
  ChevronDown,
  Building,
  BarChart3,
  Bell,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const { itemCount } = useCartStore();
  const { unreadCount } = useNotificationStore();

  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  // Domain definitions
  const domains = [
    {
      id: 'canteen',
      title: 'Canteen Express',
      subtitle: 'Fast Campus Dining',
      description:
        'Skip the long lunch break lines. Pre-order meals, drinks, and snacks with live stock updates and token-based counter pickup.',
      features: [
        'Live breakfast, lunch & snacks menu',
        'Row-locked inventory ensures zero double-booking',
        'Instant pickup token generation & order tracking',
      ],
      badge: 'Fast Pickup',
      icon: ShoppingCart,
      gradient: 'from-orange-500 to-amber-600',
      borderAccent: 'border-orange-100 hover:border-orange-300',
      path: '/marketplace/canteen',
      ctaText: 'Explore Canteen Menu',
    },
    {
      id: 'stationery',
      title: 'Stationery Depot',
      subtitle: 'Academic Supplies',
      description:
        'Get lab records, assignment sheets, notebooks, pens, calculators, and electronics components delivered right on campus.',
      features: [
        'Official university examination sheets & blue books',
        'Engineering drawing tools, calculators & lab essentials',
        'Direct counter pickup or departmental delivery',
      ],
      badge: 'Campus Stocked',
      icon: Package,
      gradient: 'from-blue-600 to-indigo-600',
      borderAccent: 'border-blue-100 hover:border-blue-300',
      path: '/marketplace/stationery',
      ctaText: 'Browse Stationery',
    },
    {
      id: 'hostel_supply',
      title: 'Hostel Requisitions',
      subtitle: 'Warden-Approved Logistics',
      description:
        'Request mattresses, study lamps, room keys, and cleaning supplies directly through a digital warden approval pipeline.',
      features: [
        'Transparent 4-stage digital approval workflow',
        'Inventory reservation with automated audit logging',
        'Zero paper forms or manual register tracking',
      ],
      badge: 'Warden Monitored',
      icon: Home,
      gradient: 'from-emerald-500 to-teal-600',
      borderAccent: 'border-emerald-100 hover:border-emerald-300',
      path: isAuthenticated ? '/hostel-requests' : '/marketplace/hostel_supply',
      ctaText: 'View Hostel Supplies',
    },
    {
      id: 'books',
      title: 'Used Books Exchange',
      subtitle: 'Student P2P Marketplace',
      description:
        'Pass down textbooks, reference guides, and competitive exam books to fellow students. Zero platform commission fees.',
      features: [
        'Direct student-to-student transactions & verification',
        'Condition tags (Brand New, Like New, Good, Fair)',
        'Built-in reservation lock preventing duplicate sales',
      ],
      badge: 'Eco Friendly',
      icon: BookOpen,
      gradient: 'from-purple-600 to-pink-600',
      borderAccent: 'border-purple-100 hover:border-purple-300',
      path: '/books',
      ctaText: 'Browse Used Books',
    },
  ];

  // FAQ Items
  const faqs = [
    {
      q: 'How does food pickup work at the campus canteen?',
      a: 'Browse the active canteen menu, add items to your cart, and place your order. The backend immediately locks the inventory. Once the vendor prepares your meal, you receive an instant pickup token with real-time status updates.',
    },
    {
      q: 'How does the hostel supply request workflow operate?',
      a: 'Students submit a digital request specifying their hostel block and required items. The assigned hostel warden reviews the request, checks inventory availability, and clicks to approve or reject with comments. Upon collection, the warden marks it fulfilled, updating stock records automatically.',
    },
    {
      q: 'How safe is the second-hand book resale for students?',
      a: 'When an interested student reserves a book, a reservation lock is placed preventing anyone else from claiming it. Once the buyer and seller meet on campus, the seller confirms the transaction in the system, marking the book sold and closing the transaction safely.',
    },
    {
      q: 'Can local campus vendors register their stores on the platform?',
      a: 'Yes! Any authorized campus merchant or service provider can click "Become a Vendor" to submit their store registration. Campus administrators review business licenses and approval details before unlocking the vendor dashboard.',
    },
    {
      q: 'What makes this platform concurrency-safe?',
      a: 'The system uses transactional row-locking (via Django select_for_update) across orders, inventory depletion, and book reservations. This ensures that even during high-traffic campus rush hours, stock counts never go negative and items are never double-sold.',
    },
  ];

  // ==========================================
  // AUTHENTICATED EXECUTIVE DASHBOARD
  // ==========================================
  if (isAuthenticated) {
    const role = user?.role || 'student';

    return (
      <div className="min-h-screen bg-slate-50/60 pb-20">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Campus Unified Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Welcome back, {user?.name || 'Scholar'}!
              </h1>
              <p className="mt-1 text-slate-300 text-sm sm:text-base">
                Logged in as <span className="font-semibold text-indigo-400 capitalize">{role}</span>
                {user?.email && <span className="text-slate-400"> ({user.email})</span>}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/profile">
                <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  Edit Profile
                </Button>
              </Link>
              <Link to="/notifications">
                <Button size="sm" className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {role === 'student' && (
              <>
                <Link to="/cart" className="block">
                  <StatCounter
                    icon={ShoppingCart}
                    value={itemCount() > 0 ? `${itemCount()} Items` : 'Empty'}
                    label="Current Cart"
                    subtext="Ready for checkout"
                  />
                </Link>
                <Link to="/orders" className="block">
                  <StatCounter
                    icon={Package}
                    value="Orders"
                    label="Order History"
                    subtext="Track food & stationery"
                  />
                </Link>
                <Link to="/hostel-requests" className="block">
                  <StatCounter
                    icon={Home}
                    value="Requisitions"
                    label="Hostel Supplies"
                    subtext="Warden approval queue"
                  />
                </Link>
                <Link to="/books/my-listings" className="block">
                  <StatCounter
                    icon={BookOpen}
                    value="My Books"
                    label="P2P Listings"
                    subtext="Manage second-hand textbooks"
                  />
                </Link>
              </>
            )}

            {role === 'vendor' && (
              <>
                <Link to="/vendor/dashboard" className="block">
                  <StatCounter
                    icon={Store}
                    value="Dashboard"
                    label="Vendor Center"
                    subtext="Orders & status overview"
                  />
                </Link>
                <Link to="/vendor/listings" className="block">
                  <StatCounter
                    icon={Package}
                    value="Products"
                    label="Active Catalog"
                    subtext="Manage product details"
                  />
                </Link>
                <Link to="/vendor/inventory" className="block">
                  <StatCounter
                    icon={Zap}
                    value="Stock Controls"
                    label="Inventory"
                    subtext="Adjust levels & low-stock alerts"
                  />
                </Link>
                <Link to="/vendor/analytics" className="block">
                  <StatCounter
                    icon={TrendingUp}
                    value="Revenue"
                    label="Sales Analytics"
                    subtext="Daily sales & top items"
                  />
                </Link>
              </>
            )}

            {role === 'warden' && (
              <>
                <Link to="/warden/dashboard" className="block">
                  <StatCounter
                    icon={Building}
                    value="Warden Desk"
                    label="Hostel Operations"
                    subtext="Overview of requests"
                  />
                </Link>
                <Link to="/warden/requests" className="block">
                  <StatCounter
                    icon={Clock}
                    value="Approvals"
                    label="Student Requests"
                    subtext="Review & allocate supplies"
                  />
                </Link>
                <Link to="/notifications" className="block">
                  <StatCounter
                    icon={Bell}
                    value={`${unreadCount} New`}
                    label="Hostel Alerts"
                    subtext="Unread messages"
                  />
                </Link>
                <Link to="/profile" className="block">
                  <StatCounter
                    icon={ShieldCheck}
                    value="Verified"
                    label="Warden Credentials"
                    subtext="Hostel authority account"
                  />
                </Link>
              </>
            )}

            {role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="block">
                  <StatCounter
                    icon={ShieldCheck}
                    value="Admin Control"
                    label="Central System"
                    subtext="Platform overview"
                  />
                </Link>
                <Link to="/admin/vendors" className="block">
                  <StatCounter
                    icon={Store}
                    value="Applications"
                    label="Vendor Approvals"
                    subtext="Review merchant permits"
                  />
                </Link>
                <Link to="/admin/orders" className="block">
                  <StatCounter
                    icon={Package}
                    value="All Orders"
                    label="Platform Orders"
                    subtext="System-wide order log"
                  />
                </Link>
                <Link to="/admin/analytics" className="block">
                  <StatCounter
                    icon={BarChart3}
                    value="Insights"
                    label="ERP Analytics"
                    subtext="Revenue, categories & logs"
                  />
                </Link>
              </>
            )}
          </div>

          {/* Quick Domain Launchers */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Campus Services</h2>
                <p className="text-sm text-slate-600">Quickly jump into any of the 4 campus domains</p>
              </div>
              <Link to="/marketplace" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Full Catalog <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {domains.map((dom) => (
                <DomainCard key={dom.id} {...dom} />
              ))}
            </div>
          </div>

          {/* Quick Actions & Campus Banner */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
                <Store className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Want to sell on Campus Marketplace?</h3>
                <p className="text-sm text-slate-600">
                  Approved student entrepreneurs and campus shops can onboard as verified vendors.
                </p>
              </div>
            </div>
            <Link to="/become-vendor">
              <Button className="whitespace-nowrap flex items-center gap-2">
                Apply as Vendor <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PUBLIC / GUEST LANDING PAGE
  // ==========================================
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-20 pb-28">
        {/* Ambient background decoration */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Next-Gen Campus Commerce • One Engine, Four Skins</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight sm:leading-none mb-6">
              Everything Campus, in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">One Unified Hub</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Order canteen meals ahead of the rush, grab examination stationery, submit warden-approved hostel requisitions, and exchange second-hand books with zero hassle.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/marketplace">
                <Button size="lg" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group">
                  <span>Explore Marketplace</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/books">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold text-base rounded-2xl backdrop-blur-sm">
                  Browse Used Books
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto px-6 py-4 text-slate-300 hover:text-white font-medium text-base">
                  Sign In &rarr;
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-14 pt-10 border-t border-slate-800/80 flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <span>Verified Campus Roles</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                <span>Row-Locked Concurrency</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                <span>Instant Pickup Tokens</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span>Direct P2P Exchange</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Showcase */}
      <section className="relative -mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCounter
            icon={ShoppingCart}
            value="4"
            label="Integrated Domains"
            subtext="Canteen, Stationery, Hostel, Books"
          />
          <StatCounter
            icon={Users}
            value="1,200+"
            label="Campus Members"
            subtext="Students, Wardens & Vendors"
          />
          <StatCounter
            icon={Zap}
            value="100%"
            label="Concurrency Safe"
            subtext="Select-for-update row locks"
          />
          <StatCounter
            icon={ShieldCheck}
            value="0%"
            label="Commission on Books"
            subtext="Fair student textbook reuse"
          />
        </div>
      </section>

      {/* 3. The 4 Dedicated Domains Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100">
            One Engine • Four Skins
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
            Tailored Experiences for Every Need
          </h2>
          <p className="mt-4 text-slate-600 text-lg">
            A single unified backend engine powers four specialized marketplace workflows across the university campus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {domains.map((dom) => (
            <DomainCard key={dom.id} {...dom} />
          ))}
        </div>
      </section>

      {/* 4. Enterprise Architecture Spotlight */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
                Engineering Behind The Scenes
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight leading-tight">
                Built to withstand real campus peak hours.
              </h2>
              <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                Most campus apps fail when 500 students order lunch at 12:45 PM. Campus ERP was architected with high-concurrency database row locking and immutable price snapshots.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mt-0.5">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Transactional Stock Row-Locks</h4>
                    <p className="text-xs text-slate-600">Stock operations run within atomic select_for_update blocks. No phantom inventory.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mt-0.5">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Single-Vendor Order Splitting</h4>
                    <p className="text-xs text-slate-600">Multi-domain items in one cart automatically partition into vendor-specific orders.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mt-0.5">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Real-Time WebSocket Notifications</h4>
                    <p className="text-xs text-slate-600">Instant pickup alerts, warden status updates, and book buyer claims delivered over secure WebSockets.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link to="/about">
                  <Button variant="secondary" className="flex items-center gap-2">
                    <span>Read Full Architecture Spec</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Architecture Diagram Card */}
            <div className="lg:col-span-7">
              <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-slate-800">
                <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs text-slate-400 font-mono ml-2">campus-engine-v2.6.core</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                    PostgreSQL + Channels
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
                    <div className="text-amber-400 font-mono text-xs mb-1">01 / CANTEEN</div>
                    <div className="text-base font-bold text-white mb-2">Queue Elimination</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Pre-ordering with kitchen token dispatch keeps the dining hall moving at 3x speed.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
                    <div className="text-blue-400 font-mono text-xs mb-1">02 / STATIONERY</div>
                    <div className="text-base font-bold text-white mb-2">Curriculum Ready</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Department-approved lab manuals and exam blue books stocked in lockstep with class syllabus.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
                    <div className="text-emerald-400 font-mono text-xs mb-1">03 / HOSTEL</div>
                    <div className="text-base font-bold text-white mb-2">Digital Warden Gate</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Requests routed to block wardens with 1-click status transitions and immutable audit logs.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
                    <div className="text-purple-400 font-mono text-xs mb-1">04 / BOOKS</div>
                    <div className="text-base font-bold text-white mb-2">Circular Campus</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Seniors pass books to juniors directly, saving thousands in textbook expenses every semester.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-indigo-400 shrink-0" />
                    <span className="text-xs text-indigo-200">
                      Shared Core: <code className="text-white font-mono">Listing</code> + <code className="text-white font-mono">OrderLine</code> + <code className="text-white font-mono">Notification</code>
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                    DRF 3.15
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Role Portals Breakdown */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100">
            Dedicated Portals
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-4 tracking-tight">
            Designed for Every Stakeholder
          </h2>
          <p className="mt-4 text-slate-600 text-lg">
            Whether you are studying, cooking, managing inventory, or supervising campus residences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Student Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Students</h3>
            <p className="text-sm text-slate-600 mb-6">
              Instant mobile-first ordering, hostel supply requests, order history tracking, and student book trading.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 border-t pt-4 mb-6">
              <li className="flex items-center gap-2">✓ Fast cart checkout</li>
              <li className="flex items-center gap-2">✓ Real-time status notifications</li>
              <li className="flex items-center gap-2">✓ Direct student book selling</li>
            </ul>
            <Link to="/register">
              <Button variant="secondary" size="sm" className="w-full">Student Sign Up</Button>
            </Link>
          </div>

          {/* Vendor Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <Store className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Vendors</h3>
            <p className="text-sm text-slate-600 mb-6">
              Full product catalog control, real-time stock adjustment, incoming order preparation queues, and revenue charts.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 border-t pt-4 mb-6">
              <li className="flex items-center gap-2">✓ Low-stock threshold alerts</li>
              <li className="flex items-center gap-2">✓ Preparation queue tickets</li>
              <li className="flex items-center gap-2">✓ Sales & category analytics</li>
            </ul>
            <Link to="/become-vendor">
              <Button variant="secondary" size="sm" className="w-full">Become a Vendor</Button>
            </Link>
          </div>

          {/* Warden Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hostel Wardens</h3>
            <p className="text-sm text-slate-600 mb-6">
              Streamlined dashboard to evaluate resident equipment requisitions, manage supplies, and prevent double-allocations.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 border-t pt-4 mb-6">
              <li className="flex items-center gap-2">✓ 1-click Approve / Fulfill</li>
              <li className="flex items-center gap-2">✓ Automated stock decrement</li>
              <li className="flex items-center gap-2">✓ Full resident audit trails</li>
            </ul>
            <Link to="/login">
              <Button variant="secondary" size="sm" className="w-full">Warden Portal</Button>
            </Link>
          </div>

          {/* Admin Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Administration</h3>
            <p className="text-sm text-slate-600 mb-6">
              University oversight, merchant verification, platform-wide audit logging, and aggregate financial metrics.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 border-t pt-4 mb-6">
              <li className="flex items-center gap-2">✓ Vendor license verification</li>
              <li className="flex items-center gap-2">✓ Platform transaction reports</li>
              <li className="flex items-center gap-2">✓ Central listing governance</li>
            </ul>
            <Link to="/login">
              <Button variant="secondary" size="sm" className="w-full">Admin Login</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Interactive FAQ Accordion */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Everything you need to know about using Campus ERP & Marketplace.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 text-left font-semibold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50/50"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                      activeFaq === idx ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-slate-600">
            Still have questions? Check out our{' '}
            <Link to="/contact" className="font-semibold text-indigo-600 hover:text-indigo-800 underline">
              Campus Help & Contact Directory
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Bottom Conversion Banner */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Ready to upgrade your campus experience?
          </h2>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Join students, hostel wardens, and campus shops on the university&apos;s unified digital marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="px-8 py-4 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-2xl shadow-xl flex items-center gap-2">
                <span>Create Student Account</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="secondary" size="lg" className="px-8 py-4 bg-indigo-700/60 hover:bg-indigo-700 text-white border-white/20 font-semibold rounded-2xl">
                Browse as Guest
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
