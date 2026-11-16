/**
 * Campus Commons - Student Orders & Counter Pickup Tokens
 * Track active orders, view 4-digit pickup PINs, and review past receipts.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag, ArrowRight, KeyRound } from 'lucide-react';
import { fetchOrders } from '../api/orders';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/shared/Alert';
import Button from '../components/shared/Button';
import { formatPrice } from '../utils/formatters';

const STATUS_CONFIGS = {
  placed: { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  confirmed: { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  ready: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500 animate-pulse' },
  completed: { badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  cancelled: { badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  disputed: { badge: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
};

const STATUS_LABELS = {
  placed: 'Order Placed',
  confirmed: 'Kitchen Confirmed',
  ready: 'Ready for Pickup',
  completed: 'Completed & Handed Over',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage('Order placed successfully! Keep your counter pickup PIN ready.');
      setTimeout(() => setSuccessMessage(null), 6000);
    }

    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchOrders();
        setOrders(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load order history');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [location]);

  if (isLoading) {
    return <LoadingSpinner message="Retrieving your campus orders..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
              <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />
              <span>Campus Digital Receipts</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              My Orders &amp; Pickup Tokens
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Track dining pre-orders, stationery supplies, and present 4-digit PINs at express pickup counters.
            </p>
          </div>

          <Link to="/marketplace">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <span>Order More Items</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 animate-in fade-in duration-150">
            <Alert type="success" message={successMessage} dismissible onClose={() => setSuccessMessage(null)} />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 sm:p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">No campus orders found</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              Browse the canteen menu, order stationery supplies, or reserve hostel equipment to receive your pickup PIN.
            </p>
            <Button
              onClick={() => navigate('/marketplace')}
              variant="blue"
              className="px-6 py-2.5 font-bold"
            >
              Explore Campus Marketplace
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusCfg = STATUS_CONFIGS[order.status] || STATUS_CONFIGS.placed;
              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-slate-300 hover:shadow-md p-6 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-mono font-bold text-sm">
                        #{order.id.slice(0, 4)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5 ${statusCfg.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            <span>{STATUS_LABELS[order.status] || order.status}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Prominent PIN Token */}
                    {order.pickup_pin && (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3 self-start sm:self-auto">
                        <KeyRound className="h-5 w-5 text-amber-600" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                            Pickup PIN
                          </span>
                          <span className="text-lg font-mono font-extrabold text-slate-950 tracking-wider">
                            {order.pickup_pin}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Items Summary */}
                  <div className="py-3 border-y border-slate-100 flex flex-wrap gap-2 items-center">
                    {order.items?.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1 rounded-xl font-medium"
                      >
                        {item.quantity}× {item.title_snapshot}
                      </span>
                    ))}
                  </div>

                  {/* Footer Total */}
                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Settled</span>
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-blue-800 transition-colors">
                      <span>View Receipt &amp; Pickup QR</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
