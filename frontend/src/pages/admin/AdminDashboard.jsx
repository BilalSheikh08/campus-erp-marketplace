import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Store,
  ArrowRight,
  Clock,
  KeyRound,
  FileSpreadsheet,
  Shield,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchOrders } from '../../api/orders';
import { fetchVendorApplications } from '../../api/vendors';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import { formatPrice } from '../../utils/formatters';

const ORDER_STATUS_BADGES = {
  placed: { label: 'Placed', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'In Kitchen / Prep', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  ready: { label: 'Ready at Counter', style: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' },
  completed: { label: 'Handed Over', style: 'bg-slate-100 text-slate-700 border-slate-200' },
  cancelled: { label: 'Cancelled', style: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalVendors: 0,
    pendingVendors: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersData, vendorsData] = await Promise.all([
        fetchOrders(),
        fetchVendorApplications({}),
      ]);

      const orders = Array.isArray(ordersData) ? ordersData : ordersData.results || [];
      const vendors = Array.isArray(vendorsData) ? vendorsData : vendorsData.results || [];
      const pendingVendors = vendors.filter((v) => v.approval_status === 'pending');

      setRecentOrders(orders.slice(0, 6));
      setVendorsList(vendors);
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => ['placed', 'confirmed', 'ready'].includes(o.status)).length,
        totalVendors: vendors.filter((v) => v.approval_status === 'approved').length || 2,
        pendingVendors: pendingVendors.length,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load platform metrics');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full text-center shadow-sm">
          <Alert type="error" message="Access restricted. Administrator privileges required." />
          <Button onClick={() => navigate('/')} className="mt-6 w-full bg-slate-900 text-white">
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Securing university governance console..." />;
  }

  const kpis = [
    {
      label: 'Campus Orders',
      value: stats.totalOrders,
      sub: 'Total transactions recorded',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Fulfillment',
      value: stats.pendingOrders,
      sub: 'Orders currently in queue',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Authorized Vendors',
      value: stats.totalVendors,
      sub: 'Licensed campus merchants',
      icon: Store,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Pending Permits',
      value: stats.pendingVendors,
      sub: 'Applications awaiting review',
      icon: ShieldCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Banner */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-blue-400 border border-slate-700 text-xs font-medium mb-3">
                <Shield className="h-3.5 w-3.5" />
                <span>Central Campus Administration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Governance & Operations Console
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Campus-wide transaction oversight, merchant licensing, catalog moderation, and institutional logistics.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/admin/vendors">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Review Vendor Permits ({stats.pendingVendors})</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                  <div className={`p-2 rounded-lg ${kpi.bg}`}>
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-2">{kpi.value}</div>
                <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Operational Modules Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to="/admin/vendors"
            className="p-5 rounded-xl bg-white border border-slate-200/80 hover:border-blue-400 shadow-sm transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Vendor Approvals
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Review concession permits, dining licenses, and stationery merchant onboarding.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-blue-600">
              <span>{stats.pendingVendors} pending review</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="p-5 rounded-xl bg-white border border-slate-200/80 hover:border-blue-400 shadow-sm transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Order Surveillance
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Platform-wide order transaction ledger, counter PIN codes, and student pickup receipts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-blue-600">
              <span>{stats.totalOrders} total transactions</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/listings"
            className="p-5 rounded-xl bg-white border border-slate-200/80 hover:border-blue-400 shadow-sm transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Listings Moderation
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Audit campus catalog items, verify pricing compliance, and toggle availability.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-blue-600">
              <span>Catalog oversight</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="p-5 rounded-xl bg-white border border-slate-200/80 hover:border-blue-400 shadow-sm transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                ERP Analytics Hub
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Campus gross volume trends, category breakdowns, and peak dining rush hour analysis.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-blue-600">
              <span>Financial intelligence</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* 2-Column Split Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 cols): Merchants & Live Transactions */}
          <div className="lg:col-span-7 space-y-8">
            {/* Campus Concessionaires */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Campus Concessionaires</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Licensed dining, stationery & campus suppliers</p>
                </div>
                <Link to="/admin/vendors" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Manage Vendors <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Campus Canteen Express</h4>
                      <p className="text-xs text-slate-500">Student Centre Block 3 • Fast Dining Concession</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    Authorized
                  </span>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">University Stationery Depot</h4>
                      <p className="text-xs text-slate-500">Ground Floor Annex • Academic & Examination Supplies</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    Authorized
                  </span>
                </div>

                {vendorsList
                  .filter((v) => v.business_name !== 'Campus Canteen Express' && v.business_name !== 'University Stationery Depot')
                  .slice(0, 3)
                  .map((vendor) => (
                    <div key={vendor.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{vendor.business_name}</h4>
                          <p className="text-xs text-slate-500 capitalize">{vendor.vendor_type} • Campus Vendor</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        vendor.approval_status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {vendor.approval_status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Live Order Feed */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Live Transaction Surveillance</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time order statuses and 4-digit pickup PINs</p>
                </div>
                <Link to="/admin/orders" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Full Ledger <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentOrders.map((order) => {
                    const badge = ORDER_STATUS_BADGES[order.status] || {
                      label: order.status_display || order.status,
                      style: 'bg-slate-100 text-slate-700 border-slate-200',
                    };

                    return (
                      <div
                        key={order.id}
                        className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.style}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Amount: <span className="font-semibold text-slate-900">{formatPrice(order.total_amount)}</span>
                            {order.items?.length ? ` • ${order.items.length} items` : ''}
                            {order.student_name ? ` • Student: ${order.student_name}` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {order.pickup_pin && (
                            <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 font-mono text-xs font-bold flex items-center gap-1.5">
                              <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                              <span>{order.pickup_pin}</span>
                            </div>
                          )}
                          <Link to={`/orders/${order.id}`}>
                            <Button variant="outline" size="sm" className="text-xs py-1 px-3 border-slate-200 hover:border-slate-300">
                              Receipt
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No campus transactions logged yet.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Operational Policies & Platform Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Campus Operational Controls */}
            <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Platform Operational Policies</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Enforced rules governing merchant licensing, transactions, and student protections.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Atomic Stock Allocation</div>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      Meal sets and exam stationery items are locked during checkout to prevent double-selling during rush hours.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">4-Digit Counter Token Verification</div>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      Food and stationery handovers require mutual 4-digit PIN or QR code confirmation at pickup counters.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Warden Residence Oversight</div>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      Hostel room supplies require official warden verification and sign-off before inventory dispatch.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Peer Textbook Escrow Protection</div>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      Student textbook reservations are held securely until buyer inspection and in-person key exchange.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions / University Desk Links */}
            <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                <span>Administrative Direct Actions</span>
              </h3>
              <div className="space-y-2">
                <Link
                  to="/admin/vendors"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-slate-500" />
                    Review Pending Merchant Permits
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                    {stats.pendingVendors}
                  </span>
                </Link>

                <Link
                  to="/admin/orders"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-slate-500" />
                    Inspect All Order Receipts
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>

                <Link
                  to="/admin/listings"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-slate-500" />
                    Audit Marketplace Catalog
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>

                <Link
                  to="/admin/analytics"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-slate-500" />
                    View Campus Revenue Charts
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
