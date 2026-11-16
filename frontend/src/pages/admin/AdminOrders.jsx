import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Filter, Search, ArrowLeft, ShoppingBag, KeyRound, ExternalLink } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchOrders, fetchOrder, transitionOrder } from '../../api/orders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import { formatPrice } from '../../utils/formatters';

const ORDER_STATUS_BADGE = {
  placed: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [transitioningOrder, setTransitioningOrder] = useState(null);
  const [transitionError, setTransitionError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Administrator privileges required.');
      setIsLoading(false);
      return;
    }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrders();
      const ordersList = Array.isArray(data) ? data : data.results || [];
      setOrders(ordersList);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(query) ||
          o.student_name?.toLowerCase().includes(query) ||
          o.vendor_name?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, statusFilter, searchQuery]);

  const handleTransition = async (orderId, newStatus) => {
    setTransitioningOrder(orderId);
    setTransitionError(null);
    try {
      await transitionOrder(orderId, { target_status: newStatus });
      const updatedOrder = await fetchOrder(orderId);
      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)));
      setExpandedOrder(null);
    } catch (err) {
      setTransitionError(err.response?.data?.detail || 'Failed to update order status');
    } finally {
      setTransitioningOrder(null);
    }
  };

  const getAvailableTransitions = (currentStatus) => {
    const transitions = {
      placed: ['confirmed', 'cancelled'],
      confirmed: ['ready', 'cancelled'],
      ready: ['completed'],
      completed: [],
      cancelled: [],
    };
    return transitions[currentStatus] || [];
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <Alert type="error" message="Access restricted to campus platform administrators." />
          <Button onClick={() => navigate('/')} className="mt-4 w-full">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Auditing campus orders ledger..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Governance Console
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="h-7 w-7 text-blue-600" />
            <span>Platform Orders Surveillance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cross-vendor fulfillment timeline, counter pickup tokens, and settlement audits.
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {transitionError && (
          <div className="mb-4">
            <Alert
              type="error"
              message={transitionError}
              dismissible
              onClose={() => setTransitionError(null)}
            />
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Throughput</p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Placed</p>
            <p className="text-2xl font-black text-amber-600 mt-1 font-mono">
              {orders.filter((o) => o.status === 'placed').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">In Prep</p>
            <p className="text-2xl font-black text-blue-600 mt-1 font-mono">
              {orders.filter((o) => o.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">At Counter</p>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
              {orders.filter((o) => o.status === 'ready').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fulfilled</p>
            <p className="text-2xl font-black text-slate-700 mt-1 font-mono">
              {orders.filter((o) => o.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID, student name, or merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 bg-white rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm border border-slate-200 bg-white rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">All Order Statuses</option>
              <option value="placed">Placed (Pending Kitchen)</option>
              <option value="confirmed">Confirmed (In Prep)</option>
              <option value="ready">Ready for Counter Pickup</option>
              <option value="completed">Completed & Settled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs sm:text-sm">
              <ShoppingBag className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <div className="font-semibold text-slate-700">No orders recorded</div>
              <p className="text-xs text-slate-400 mt-0.5">
                {orders.length === 0 ? 'No campus orders placed yet' : 'No orders matching current filter criteria'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Order Token</th>
                    <th className="px-4 py-3.5">Buyer (Student)</th>
                    <th className="px-4 py-3.5">Campus Merchant</th>
                    <th className="px-4 py-3.5">Amount</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => {
                    const isExpanded = expandedOrder === order.id;
                    const badge = ORDER_STATUS_BADGE[order.status] || 'bg-slate-100 text-slate-700';

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-xs text-slate-900 block">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          {order.pickup_pin && (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5">
                              <KeyRound className="h-2.5 w-2.5" /> PIN: {order.pickup_pin}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {order.student_name || 'Campus Student'}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">
                          {order.vendor_name || 'Concession'}
                        </td>
                        <td className="px-4 py-3.5 font-bold font-mono text-slate-900 text-xs sm:text-sm">
                          {formatPrice(order.total_amount || order.total_price)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                              className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 text-xs"
                            >
                              <ChevronDown
                                className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                              Audit
                            </button>
                            <button
                              onClick={() => navigate(`/orders/${order.id}`)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                              title="Full Order Receipt"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expanded Order Audit Drawer */}
        {expandedOrder && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm text-xs">
            {filteredOrders.find((o) => o.id === expandedOrder) && (
              <>
                <div className="mb-4 pb-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Order Audit Specification #{expandedOrder.slice(0, 8).toUpperCase()}
                  </h3>
                  <button
                    onClick={() => setExpandedOrder(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-medium"
                  >
                    Close inspection
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Student Buyer</span>
                    <span className="font-bold text-slate-900">
                      {filteredOrders.find((o) => o.id === expandedOrder)?.student_name || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Merchant Store</span>
                    <span className="font-bold text-slate-900">
                      {filteredOrders.find((o) => o.id === expandedOrder)?.vendor_name || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Settlement Total</span>
                    <span className="font-bold font-mono text-emerald-700 text-sm">
                      {formatPrice(filteredOrders.find((o) => o.id === expandedOrder)?.total_amount || filteredOrders.find((o) => o.id === expandedOrder)?.total_price)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Pickup Token PIN</span>
                    <span className="font-mono font-black text-blue-600 text-sm">
                      {filteredOrders.find((o) => o.id === expandedOrder)?.pickup_pin || 'VERIFIED'}
                    </span>
                  </div>
                </div>

                {/* Items */}
                {filteredOrders.find((o) => o.id === expandedOrder)?.items &&
                  filteredOrders.find((o) => o.id === expandedOrder)?.items.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-2">Item Breakdown</h4>
                      <div className="space-y-1.5 p-3 bg-white rounded-lg border border-slate-100">
                        {filteredOrders
                          .find((o) => o.id === expandedOrder)
                          ?.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between py-1 text-slate-800 border-b border-slate-50 last:border-0 text-xs">
                              <span>
                                {item.listing_title} × <strong className="font-mono">{item.quantity}</strong>
                              </span>
                              <span className="font-mono font-bold">{formatPrice(item.price_at_order * item.quantity)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Status Transitions */}
                {getAvailableTransitions(
                  filteredOrders.find((o) => o.id === expandedOrder)?.status
                ).length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Administrative Override Action
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableTransitions(
                        filteredOrders.find((o) => o.id === expandedOrder)?.status
                      ).map((newStatus) => (
                        <Button
                          key={newStatus}
                          onClick={() => handleTransition(expandedOrder, newStatus)}
                          disabled={transitioningOrder === expandedOrder}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          {transitioningOrder === expandedOrder
                            ? 'Transitioning...'
                            : `Mark as ${getStatusLabel(newStatus)}`}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
