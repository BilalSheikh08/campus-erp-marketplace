/**
 * Campus Commons - Student Orders & Counter Pickup Vouchers
 * Redesigned with university dispatch receipt & voucher ticket aesthetic:
 * warm paper background, monospace docket identifiers, prominent 4-digit PIN vouchers,
 * and clear itemization.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Package, ChevronRight, ArrowRight, KeyRound, Receipt } from 'lucide-react';
import { fetchOrders } from '../api/orders';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/shared/Alert';
import Button from '../components/shared/Button';
import { formatPrice } from '../utils/formatters';

const STATUS_CONFIGS = {
  placed: { badge: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  confirmed: { badge: 'bg-blue-50 text-blue-900 border-blue-300', dot: 'bg-blue-600' },
  ready: { badge: 'bg-emerald-50 text-emerald-900 border-emerald-300', dot: 'bg-emerald-600 animate-pulse' },
  completed: { badge: 'bg-[#FAF8F3] text-zinc-600 border-[#E4DDCF]', dot: 'bg-zinc-400' },
  cancelled: { badge: 'bg-red-50 text-red-800 border-red-300', dot: 'bg-red-600' },
  disputed: { badge: 'bg-purple-50 text-purple-900 border-purple-300', dot: 'bg-purple-600' },
};

const STATUS_LABELS = {
  placed: 'Requisition Placed',
  confirmed: 'Kitchen/Depot Confirmed',
  ready: 'Ready at Counter Window',
  completed: 'Handed Over & Closed',
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
      setSuccessMessage('Requisition docket created successfully! Your 4-digit pickup PIN is active.');
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
    return <LoadingSpinner message="Consulting central order ledger..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <Receipt className="h-3.5 w-3.5" />
              <span>STUDENT DESK · DIGITAL PICKUP RECEIPTS</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              My Orders &amp; Pickup Tokens
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm mt-1 font-sans">
              Track dining pre-orders, stationery supplies, and present your 4-digit PIN at express pickup counters.
            </p>
          </div>

          <Link to="/marketplace">
            <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs">
              <span>Order Additional Items</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 animate-in fade-in duration-100">
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
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-12 text-center shadow-xs max-w-lg mx-auto">
            <div className="w-12 h-12 rounded bg-[#FAF8F3] border border-[#E4DDCF] text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <Package className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-lg font-bold text-zinc-900 mb-1">No campus orders found</h2>
            <p className="text-zinc-600 text-xs max-w-sm mx-auto mb-5 leading-relaxed font-sans">
              Browse the canteen menu, order stationery supplies, or reserve hostel equipment to receive your pickup PIN.
            </p>
            <Button
              onClick={() => navigate('/marketplace')}
              variant="primary"
              size="md"
              className="text-xs font-semibold"
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
                  className="bg-white rounded-lg border border-[#E4DDCF] hover:border-zinc-400 p-5 sm:p-6 transition-colors cursor-pointer group shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#FAF8F3] border border-[#E4DDCF] flex items-center justify-center text-zinc-800 font-mono font-bold text-xs">
                        #{order.id.slice(0, 4).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-zinc-950 text-sm">
                            DOCKET #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border inline-flex items-center gap-1.5 uppercase ${statusCfg.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            <span>{STATUS_LABELS[order.status] || order.status}</span>
                          </span>
                        </div>
                        <p className="text-xs font-mono text-zinc-500">
                          Issued {new Date(order.created_at).toLocaleDateString()} at{' '}
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Prominent PIN Voucher Block */}
                    {order.pickup_pin && (
                      <div className="bg-[#FFFBEB] border border-amber-300 rounded p-2.5 px-3.5 flex items-center gap-2.5 self-start sm:self-auto">
                        <KeyRound className="h-4 w-4 text-amber-700" />
                        <div>
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-800 block">
                            EXPRESS PIN
                          </span>
                          <span className="text-base font-mono font-extrabold text-amber-950 tracking-widest">
                            {order.pickup_pin}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Items Summary */}
                  <div className="py-2.5 border-y border-[#E4DDCF] flex flex-wrap gap-2 items-center">
                    {order.items?.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-[#FAF8F3] border border-[#E4DDCF] text-zinc-800 px-2.5 py-0.5 rounded font-mono"
                      >
                        {item.quantity}× {item.title_snapshot}
                      </span>
                    ))}
                  </div>

                  {/* Footer Total */}
                  <div className="pt-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-400 block uppercase font-bold">Total Settled</span>
                      <span className="text-sm font-bold text-zinc-950 font-mono">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-blue-900 group-hover:underline">
                      <span>View Receipt &amp; Pickup QR</span>
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
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
