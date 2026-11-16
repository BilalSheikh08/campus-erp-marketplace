/**
 * Campus Commons - Central Campus Administration Desk
 * University Registrar & Platform Governance Console:
 * Vendor permit review, platform order surveillance, catalog moderation, and institutional policies.
 */

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
  RefreshCw,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchOrders } from '../../api/orders';
import { fetchVendorApplications } from '../../api/vendors';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import { formatPrice } from '../../utils/formatters';

const ORDER_STATUS_BADGES = {
  placed: { label: 'Placed', style: 'bg-amber-50 text-amber-900 border-amber-300' },
  confirmed: { label: 'In Kitchen / Prep', style: 'bg-blue-50 text-blue-900 border-blue-300' },
  ready: { label: 'Ready at Counter', style: 'bg-emerald-50 text-emerald-900 border-emerald-300' },
  completed: { label: 'Handed Over', style: 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]' },
  cancelled: { label: 'Cancelled', style: 'bg-rose-50 text-rose-900 border-rose-300' },
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
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-lg border border-[#E4DDCF] max-w-md w-full text-center shadow-xs">
          <Alert type="error" message="Access restricted. Administrator privileges required." />
          <Button onClick={() => navigate('/')} className="mt-6 w-full text-xs font-bold font-mono">
            Return to Directory
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Consulting central governance registrar..." />;
  }

  const kpis = [
    {
      label: 'Campus Orders',
      value: stats.totalOrders,
      sub: 'All logged transactions',
      icon: ShoppingBag,
    },
    {
      label: 'Active Fulfillment',
      value: stats.pendingOrders,
      sub: 'Orders currently in progress',
      icon: Clock,
      highlight: stats.pendingOrders > 0,
    },
    {
      label: 'Authorized Vendors',
      value: stats.totalVendors,
      sub: 'Licensed campus concessionaires',
      icon: Store,
    },
    {
      label: 'Pending Permits',
      value: stats.pendingVendors,
      sub: 'Applications awaiting review',
      icon: ShieldCheck,
      highlight: stats.pendingVendors > 0,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <Shield className="h-3.5 w-3.5 text-zinc-700" />
              <span>CENTRAL REGISTRAR · GOVERNANCE &amp; OPERATIONS CONSOLE</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              Platform Administration Desk
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm mt-1 font-sans">
              Campus-wide transaction oversight, merchant licensing, catalog moderation, and institutional policies.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              className="text-xs p-2"
              title="Refresh ledger"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Link to="/admin/vendors">
              <Button variant="primary" size="sm" className="text-xs flex items-center gap-1.5 font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Vendor Permits ({stats.pendingVendors})</span>
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {/* 4 Core KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className={`bg-white rounded-lg p-5 border shadow-xs ${
                  kpi.highlight ? 'border-amber-400 bg-amber-50/20' : 'border-[#E4DDCF]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                    {kpi.label}
                  </span>
                  <div className="w-8 h-8 rounded bg-[#FAF8F3] border border-[#E4DDCF] flex items-center justify-center text-zinc-700">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-mono font-bold text-zinc-950 mt-2">
                  {kpi.value}
                </div>
                <p className="text-[11px] font-mono text-zinc-500 mt-1">{kpi.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Operational Modules Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to="/admin/vendors"
            className="p-5 rounded-lg bg-white border border-[#E4DDCF] hover:border-blue-900 shadow-xs transition-colors group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded bg-[#FAF8F3] border border-[#E4DDCF] text-zinc-800 flex items-center justify-center mb-3">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-zinc-950 group-hover:text-blue-900 transition-colors">
                Vendor Licensing Permits
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-sans">
                Review dining permits, academic stationery concessions, and onboarding records.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E4DDCF] flex items-center justify-between text-xs font-mono font-semibold text-zinc-500 group-hover:text-blue-900">
              <span>{stats.pendingVendors} pending review</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="p-5 rounded-lg bg-white border border-[#E4DDCF] hover:border-blue-900 shadow-xs transition-colors group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded bg-[#FAF8F3] border border-[#E4DDCF] text-zinc-800 flex items-center justify-center mb-3">
                <ShoppingBag className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-zinc-950 group-hover:text-blue-900 transition-colors">
                Order Surveillance
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-sans">
                Campus-wide transactions, counter 4-digit PIN verification logs, and digital receipts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E4DDCF] flex items-center justify-between text-xs font-mono font-semibold text-zinc-500 group-hover:text-blue-900">
              <span>{stats.totalOrders} total dockets</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to="/admin/listings"
            className="p-5 rounded-lg bg-white border border-[#E4DDCF] hover:border-blue-900 shadow-xs transition-colors group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded bg-[#FAF8F3] border border-[#E4DDCF] text-zinc-800 flex items-center justify-center mb-3">
                <Layers className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-zinc-950 group-hover:text-blue-900 transition-colors">
                Catalog Moderation
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-sans">
                Audit campus catalog items, verify student price caps, and toggle active visibility.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E4DDCF] flex items-center justify-between text-xs font-mono font-semibold text-zinc-500 group-hover:text-blue-900">
              <span>Catalog index</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="p-5 rounded-lg bg-white border border-[#E4DDCF] hover:border-blue-900 shadow-xs transition-colors group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded bg-[#FAF8F3] border border-[#E4DDCF] text-zinc-800 flex items-center justify-center mb-3">
                <BarChart3 className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-zinc-950 group-hover:text-blue-900 transition-colors">
                Enterprise Analytics
              </h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-sans">
                Gross campus clearinghouse volume, category breakdowns, and peak dining rush analysis.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E4DDCF] flex items-center justify-between text-xs font-mono font-semibold text-zinc-500 group-hover:text-blue-900">
              <span>Financial intelligence</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>

        {/* 2-Column Split Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 cols): Merchants & Live Transactions */}
          <div className="lg:col-span-7 space-y-8">
            {/* Campus Concessionaires */}
            <div className="bg-white rounded-lg border border-[#E4DDCF] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E4DDCF] flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-base text-zinc-950">Campus Concessionaires</h2>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">Licensed dining, stationery &amp; campus suppliers</p>
                </div>
                <Link to="/admin/vendors" className="text-xs font-mono font-semibold text-blue-900 hover:underline flex items-center gap-1">
                  <span>Manage Vendors</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="divide-y divide-[#E4DDCF]">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-[#FAF8F3] border border-[#E4DDCF] text-zinc-700 flex items-center justify-center">
                      <Store className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-zinc-950">Campus Canteen Express</h4>
                      <p className="text-xs text-zinc-500 font-sans">Student Centre Block 3 • Fast Dining Concession</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                    Authorized
                  </span>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-[#FAF8F3] border border-[#E4DDCF] text-zinc-700 flex items-center justify-center">
                      <Store className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-zinc-950">University Stationery Depot</h4>
                      <p className="text-xs text-zinc-500 font-sans">Ground Floor Annex • Academic &amp; Examination Supplies</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                    Authorized
                  </span>
                </div>

                {vendorsList
                  .filter((v) => v.business_name !== 'Campus Canteen Express' && v.business_name !== 'University Stationery Depot')
                  .slice(0, 3)
                  .map((vendor) => (
                    <div key={vendor.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-[#FAF8F3] border border-[#E4DDCF] text-zinc-700 flex items-center justify-center">
                          <Store className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-zinc-950">{vendor.business_name}</h4>
                          <p className="text-xs text-zinc-500 font-sans capitalize">{vendor.vendor_type} • Campus Vendor</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                        vendor.approval_status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {vendor.approval_status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Live Order Feed */}
            <div className="bg-white rounded-lg border border-[#E4DDCF] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E4DDCF] flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-base text-zinc-950">Live Transaction Surveillance</h2>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">Real-time order statuses and 4-digit pickup PINs</p>
                </div>
                <Link to="/admin/orders" className="text-xs font-mono font-semibold text-blue-900 hover:underline flex items-center gap-1">
                  <span>Full Ledger</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="divide-y divide-[#E4DDCF]">
                  {recentOrders.map((order) => {
                    const badge = ORDER_STATUS_BADGES[order.status] || {
                      label: order.status_display || order.status,
                      style: 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]',
                    };

                    return (
                      <div
                        key={order.id}
                        className="p-4 hover:bg-[#FAF8F3]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-zinc-950">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${badge.style}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 mt-1 font-mono">
                            Amount: <span className="font-bold text-zinc-950">{formatPrice(order.total_amount)}</span>
                            {order.items?.length ? ` • ${order.items.length} item(s)` : ''}
                            {order.student_name ? ` • Resident: ${order.student_name}` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {order.pickup_pin && (
                            <div className="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900 font-mono text-xs font-bold flex items-center gap-1.5">
                              <KeyRound className="h-3 w-3 text-amber-700" />
                              <span>{order.pickup_pin}</span>
                            </div>
                          )}
                          <Link to={`/orders/${order.id}`}>
                            <Button variant="outline" size="sm" className="text-xs py-1 px-2.5">
                              Receipt
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-400 text-xs font-mono">
                  No campus transactions recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Operational Policies & Direct Actions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Campus Operational Policies */}
            <div className="bg-white rounded-lg p-6 border border-[#E4DDCF] shadow-xs">
              <h3 className="font-serif font-bold text-base text-zinc-950 mb-1 flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-zinc-700" />
                <span>Platform Operational Rules</span>
              </h3>
              <p className="text-xs text-zinc-600 mb-4 font-sans">
                Institutional policies governing merchant licensing, transactions, and student protections.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded border border-[#E4DDCF] bg-[#FAF8F3] flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-serif font-bold text-zinc-950">Atomic Stock Allocation</div>
                    <p className="text-zinc-600 mt-0.5 leading-relaxed font-sans">
                      Meal sets and exam stationery items are deducted atomically during checkout to prevent double-selling during rush hours.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded border border-[#E4DDCF] bg-[#FAF8F3] flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-serif font-bold text-zinc-950">4-Digit Counter Token Verification</div>
                    <p className="text-zinc-600 mt-0.5 leading-relaxed font-sans">
                      Food and stationery handovers require mutual 4-digit PIN verification at physical pickup counters.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded border border-[#E4DDCF] bg-[#FAF8F3] flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-serif font-bold text-zinc-950">Warden Residence Hall Oversight</div>
                    <p className="text-zinc-600 mt-0.5 leading-relaxed font-sans">
                      Hostel room supplies require official superintendent endorsement and sign-off before inventory release.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded border border-[#E4DDCF] bg-[#FAF8F3] flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-serif font-bold text-zinc-950">Textbook Peer Handover Protocol</div>
                    <p className="text-zinc-600 mt-0.5 leading-relaxed font-sans">
                      Student textbook reservations are held in trust until buyer inspection and in-person campus key exchange.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Registrar Links */}
            <div className="bg-white rounded-lg p-6 border border-[#E4DDCF] shadow-xs">
              <h3 className="font-serif font-bold text-base text-zinc-950 mb-3 flex items-center gap-2">
                <FileSpreadsheet className="h-4.5 w-4.5 text-zinc-700" />
                <span>Administrative Direct Actions</span>
              </h3>
              <div className="space-y-2">
                <Link
                  to="/admin/vendors"
                  className="flex items-center justify-between p-3 rounded hover:bg-[#FAF8F3] text-xs font-mono text-zinc-800 border border-[#E4DDCF] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-zinc-500" />
                    Review Pending Merchant Permits
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                    {stats.pendingVendors}
                  </span>
                </Link>

                <Link
                  to="/admin/orders"
                  className="flex items-center justify-between p-3 rounded hover:bg-[#FAF8F3] text-xs font-mono text-zinc-800 border border-[#E4DDCF] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-zinc-500" />
                    Inspect All Order Receipts
                  </span>
                  <ArrowRight className="h-3 w-3 text-zinc-400" />
                </Link>

                <Link
                  to="/admin/listings"
                  className="flex items-center justify-between p-3 rounded hover:bg-[#FAF8F3] text-xs font-mono text-zinc-800 border border-[#E4DDCF] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-zinc-500" />
                    Audit Marketplace Catalog
                  </span>
                  <ArrowRight className="h-3 w-3 text-zinc-400" />
                </Link>

                <Link
                  to="/admin/analytics"
                  className="flex items-center justify-between p-3 rounded hover:bg-[#FAF8F3] text-xs font-mono text-zinc-800 border border-[#E4DDCF] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-zinc-500" />
                    View Campus Revenue Charts
                  </span>
                  <ArrowRight className="h-3 w-3 text-zinc-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
