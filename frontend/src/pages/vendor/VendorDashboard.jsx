/**
 * Campus Commons - Vendor Concessionaire Operations Dashboard
 * Live order preparation queue, 4-digit pickup PIN verification, and catalog metrics.
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  Plus,
  QrCode,
  Clock,
  ArrowRight,
  Store,
  RefreshCw,
} from 'lucide-react';
import { fetchOrders, transitionOrder } from '../../api/orders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import PickupQRModal from '../../components/shared/PickupQRModal';

const STATUS_CONFIGS = {
  placed: { badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'New Order' },
  confirmed: { badge: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Preparing' },
  ready: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Ready at Counter' },
  completed: { badge: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Completed' },
  cancelled: { badge: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Cancelled' },
};

export default function VendorDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrders();
      setOrders(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load vendor orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTransition = async (orderId, targetStatus) => {
    setActionLoading(orderId);
    try {
      await transitionOrder(orderId, { target_status: targetStatus });
      await loadOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update order status');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'placed' || o.status === 'confirmed');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  if (isLoading) {
    return <LoadingSpinner message="Opening vendor operations desk..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold mb-2">
              <Store className="h-3.5 w-3.5 text-orange-600" />
              <span>Merchant Concessionaire Desk</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Vendor Dashboard
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Live preparation queue, customer pickup verification, and catalog control.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={loadOrders}
              className="flex items-center gap-2 rounded-2xl"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => setShowQRModal(true)}
              variant="blue"
              className="flex items-center gap-2 py-2.5 px-5 rounded-2xl font-bold shadow-xs"
            >
              <QrCode className="h-4 w-4" />
              <span>Pickup Scanner (PIN &amp; QR)</span>
            </Button>
          </div>
        </div>

        {/* Modal for QR / PIN verification */}
        <PickupQRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          orders={orders}
          onOrderCompleted={() => loadOrders()}
        />

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">{orders.length}</p>
            <p className="text-xs text-slate-500 mt-1">Recorded platform orders</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">In Preparation</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-2 font-mono">{pendingOrders.length}</p>
            <p className="text-xs text-slate-500 mt-1">In kitchen / packing queue</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Ready at Counter</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2 font-mono">{readyOrders.length}</p>
            <p className="text-xs text-slate-500 mt-1">Awaiting 4-digit PIN collection</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Settled &amp; Handed Over</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">{completedOrders.length}</p>
            <p className="text-xs text-slate-500 mt-1">Completed fulfillments</p>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/vendor/listings"
            className="flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Manage Catalog Listings</h4>
                <p className="text-xs text-slate-500">Edit dishes, stationery, or supplies</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/vendor/inventory"
            className="flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Inventory &amp; Stock Levels</h4>
                <p className="text-xs text-slate-500">Fast delta adjustments &amp; low stock sync</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/vendor/analytics"
            className="flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Sales Analytics &amp; Reports</h4>
                <p className="text-xs text-slate-500">Revenue breakdown and top sellers</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Incoming Orders Preparation Queue */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Live Kitchen &amp; Counter Orders</h2>
              <p className="text-xs text-slate-500 mt-0.5">Orders requiring preparation or counter handover</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {pendingOrders.length + readyOrders.length} Active in Queue
            </span>
          </div>

          {pendingOrders.length === 0 && readyOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              No active orders in the queue right now. All caught up!
            </div>
          ) : (
            <div className="space-y-4">
              {[...pendingOrders, ...readyOrders].map((ord) => {
                const statusCfg = STATUS_CONFIGS[ord.status] || STATUS_CONFIGS.placed;
                return (
                  <div
                    key={ord.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          #{ord.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.badge}`}>
                          {statusCfg.label}
                        </span>
                        {ord.pickup_pin && (
                          <span className="font-mono font-bold text-xs bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg border border-amber-200">
                            PIN: {ord.pickup_pin}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {ord.items?.map((it) => `${it.quantity}× ${it.title_snapshot}`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {ord.status === 'placed' && (
                        <Button
                          size="sm"
                          variant="blue"
                          loading={actionLoading === ord.id}
                          onClick={() => handleQuickTransition(ord.id, 'confirmed')}
                          className="font-bold text-xs"
                        >
                          Confirm Order
                        </Button>
                      )}
                      {ord.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="blue"
                          loading={actionLoading === ord.id}
                          onClick={() => handleQuickTransition(ord.id, 'ready')}
                          className="font-bold text-xs"
                        >
                          Mark Ready
                        </Button>
                      )}
                      {ord.status === 'ready' && (
                        <Button
                          size="sm"
                          onClick={() => setShowQRModal(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          Verify &amp; Handover
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/orders/${ord.id}`)}
                        className="text-xs"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
