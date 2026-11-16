/**
 * Campus Commons - Order Surveillance Ledger
 * Central Registrar Transaction Surveillance:
 * Campus-wide transaction audit, real-time status transitions, and pickup PIN records.
 */

import { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Filter, Search, ArrowLeft, ShoppingBag, KeyRound, ExternalLink, RefreshCw } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchOrders, fetchOrder, transitionOrder } from '../../api/orders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import { formatPrice } from '../../utils/formatters';

const ORDER_STATUS_BADGE = {
  placed: 'bg-amber-50 text-amber-900 border-amber-300',
  confirmed: 'bg-blue-50 text-blue-900 border-blue-300',
  ready: 'bg-emerald-50 text-emerald-900 border-emerald-300',
  completed: 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]',
  cancelled: 'bg-rose-50 text-rose-900 border-rose-300',
};

export default function AdminOrders() {
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
      ready: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };
    return transitions[currentStatus] || [];
  };

  if (isLoading) {
    return <LoadingSpinner message="Consulting central order surveillance ledger..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <ShoppingBag className="h-3.5 w-3.5 text-zinc-700" />
              <span>CENTRAL REGISTRAR · TRANSACTION SURVEILLANCE LEDGER</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              Campus Order Surveillance
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm mt-1 font-sans">
              Audit live commercial transactions, monitor pickup tokens, and oversee concession fulfillment.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/admin/dashboard">
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Governance Console</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={loadOrders}
              className="text-xs p-2"
              title="Refresh ledger"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}
        {transitionError && (
          <div className="mb-6">
            <Alert type="error" message={transitionError} dismissible onClose={() => setTransitionError(null)} />
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-lg p-4 border border-[#E4DDCF] shadow-xs mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID, resident name, or vendor concession..."
                className="w-full pl-10 pr-3.5 py-2 text-xs font-sans rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-900 focus:outline-none focus:border-blue-900 focus:bg-white placeholder:text-zinc-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-zinc-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-mono px-3 py-2 rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-900 focus:outline-none focus:border-blue-900"
              >
                <option value="all">All Statuses ({orders.length})</option>
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed / Preparing</option>
                <option value="ready">Ready at Counter</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            Showing <strong className="text-zinc-900">{filteredOrders.length}</strong> of {orders.length} campus transaction dockets
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-[#E4DDCF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F3] border-b border-[#E4DDCF] text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Docket ID</th>
                  <th className="px-5 py-3.5">Concession / Vendor</th>
                  <th className="px-5 py-3.5">Resident Student</th>
                  <th className="px-5 py-3.5">Total Settlement</th>
                  <th className="px-5 py-3.5">Fulfillment Status</th>
                  <th className="px-5 py-3.5">4-Digit PIN</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DDCF]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-zinc-400">
                      <ShoppingBag className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                      <p className="font-serif font-bold text-zinc-800 text-sm">No transaction records found</p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-sans">
                        No orders match the current filter selection.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isExpanded = expandedOrder === order.id;
                    const availableTransitions = getAvailableTransitions(order.status);

                    return (
                      <Fragment key={order.id}>
                        <tr className="hover:bg-[#FAF8F3]/60 transition-colors">
                          <td className="px-5 py-3.5 font-mono">
                            <Link
                              to={`/orders/${order.id}`}
                              className="font-bold text-zinc-950 hover:text-blue-900 transition-colors inline-flex items-center gap-1"
                            >
                              <span>#{order.id.slice(0, 8).toUpperCase()}</span>
                              <ExternalLink className="h-3 w-3 text-zinc-400" />
                            </Link>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-serif font-bold text-zinc-950 text-sm block">
                              {order.vendor_name || 'Campus Concession'}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500 capitalize">
                              {order.category_type || 'General'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-sans">
                            <span className="font-semibold text-zinc-900 block">
                              {order.student_name || 'Resident'}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {order.student_email || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono font-bold text-zinc-950 text-sm">
                            {formatPrice(order.total_amount)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                                ORDER_STATUS_BADGE[order.status] || 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {order.pickup_pin ? (
                              <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900 font-mono text-xs font-bold inline-flex items-center gap-1">
                                <KeyRound className="h-3 w-3 text-amber-700" />
                                <span>{order.pickup_pin}</span>
                              </span>
                            ) : (
                              <span className="text-zinc-400 font-mono">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                              className="text-xs p-1.5 ml-auto"
                              title="Expand order audit"
                            >
                              <ChevronDown
                                className={`h-3.5 w-3.5 text-zinc-600 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </Button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-[#FAF8F3] border-b border-[#E4DDCF]">
                            <td colSpan={7} className="px-5 py-3">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-500">Docket Items:</span>
                                  <div className="text-xs text-zinc-800 mt-1 space-y-0.5 font-mono">
                                    {(order.items || []).map((it, idx) => (
                                      <p key={idx}>• {it.title} × {it.quantity} ({formatPrice(it.unit_price)})</p>
                                    ))}
                                  </div>
                                </div>
                                {availableTransitions.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Transition Status:</span>
                                    {availableTransitions.map((st) => (
                                      <Button
                                        key={st}
                                        size="sm"
                                        variant="outline"
                                        disabled={transitioningOrder === order.id}
                                        onClick={() => handleTransition(order.id, st)}
                                        className="text-[10px] font-mono uppercase px-2 py-1"
                                      >
                                        Mark {st}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
