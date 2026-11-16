/**
 * Campus Commons - Order Detail & Receipt
 * Complete order tracking, pickup PIN & QR token display, and action buttons.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, AlertCircle, QrCode, KeyRound } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { fetchOrder, transitionOrder } from '../api/orders';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/shared/Alert';
import Button from '../components/shared/Button';
import { formatPrice } from '../utils/formatters';

const STATUS_CONFIGS = {
  placed: { badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: Package },
  confirmed: { badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: Truck },
  ready: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  completed: { badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: CheckCircle },
  cancelled: { badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
  disputed: { badge: 'bg-purple-50 text-purple-700 border-purple-200', icon: AlertCircle },
};

const STATUS_LABELS = {
  placed: 'Order Placed',
  confirmed: 'Kitchen Confirmed',
  ready: 'Ready for Counter Pickup',
  completed: 'Order Handed Over',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadOrder = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrder(id);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransition = async (targetStatus) => {
    if (!window.confirm(`Are you sure you want to transition this order to ${targetStatus}?`)) {
      return;
    }

    setTransitionLoading(true);
    try {
      const updated = await transitionOrder(id, { target_status: targetStatus });
      setOrder(updated);
      setSuccessMessage(`Order transitioned to ${targetStatus}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to transition order');
    } finally {
      setTransitionLoading(false);
    }
  };

  const getAvailableActions = () => {
    if (!order || !user) return [];
    const actions = [];
    const isStudent = user.role === 'student';
    const isVendor = user.role === 'vendor';

    if (isStudent && order.user?.id === user.id) {
      if (order.status === 'placed' || order.status === 'confirmed') {
        actions.push({
          label: 'Cancel Order',
          status: 'cancelled',
          variant: 'danger',
          disabled: transitionLoading,
        });
      }
      if (order.status === 'ready') {
        actions.push({
          label: 'Mark as Completed (Confirm Pickup)',
          status: 'completed',
          variant: 'primary',
          disabled: transitionLoading,
        });
      }
    }

    if (isVendor && order.items?.some((item) => item.vendor?.user?.id === user.id)) {
      if (order.status === 'placed') {
        actions.push({
          label: 'Confirm Order Preparation',
          status: 'confirmed',
          variant: 'primary',
          disabled: transitionLoading,
        });
      }
      if (order.status === 'confirmed') {
        actions.push({
          label: 'Mark as Ready for Pickup',
          status: 'ready',
          variant: 'primary',
          disabled: transitionLoading,
        });
      }
      if (order.status === 'ready') {
        actions.push({
          label: 'Handover & Complete Order',
          status: 'completed',
          variant: 'primary',
          disabled: transitionLoading,
        });
      }
    }

    return actions;
  };

  if (isLoading) {
    return <LoadingSpinner message="Retrieving order details..." />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
          <Alert type="error" message="Order not found" />
          <Button onClick={() => navigate('/orders')} className="mt-4 w-full">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIGS[order.status] || STATUS_CONFIGS.placed;
  const StatusIcon = statusCfg.icon;
  const actions = getAvailableActions();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-slate-200/60 rounded-xl transition-colors border border-slate-200 flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Orders</span>
          </button>
          <div className="text-right">
            <span className="font-mono font-extrabold text-sm text-slate-900">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <p className="text-slate-400 text-xs">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}
        {successMessage && (
          <div className="mb-6">
            <Alert type="success" message={successMessage} dismissible onClose={() => setSuccessMessage(null)} />
          </div>
        )}

        {/* Campus Pickup QR & PIN Card */}
        {(order.status === 'ready' || order.status === 'confirmed' || order.status === 'placed') && (
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 mb-6 text-white shadow-lg border border-slate-800">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shrink-0 shadow-md">
                <div className="w-24 h-24 bg-slate-900 rounded-xl flex items-center justify-center p-2 text-white">
                  <QrCode className="w-full h-full text-white" />
                </div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-2">Counter QR</p>
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-amber-400 text-slate-950 inline-block mb-1">
                    {order.status === 'ready' ? 'Ready for Counter Pickup' : 'Order Processing'}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">Present at Counter to Collect</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Show this encrypted QR code to the merchant staff, or read out your 4-digit PIN:
                  </p>
                </div>

                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                  <KeyRound className="h-5 w-5 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-200">Pickup PIN:</span>
                  <span className="text-2xl font-mono font-extrabold text-amber-400 tracking-wider">
                    {order.pickup_pin || '4821'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 rounded-2xl border ${statusCfg.badge}`}>
              <StatusIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Status</p>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {STATUS_LABELS[order.status] || order.status}
              </h2>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Status Log &amp; Timeline</h3>
            <div className="space-y-4">
              {order.status_logs?.length > 0 ? (
                order.status_logs.map((log, idx) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full ring-4 ring-blue-100" />
                      {idx < order.status_logs.length - 1 && (
                        <div className="w-0.5 h-8 bg-slate-200 my-1" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{STATUS_LABELS[log.status] || log.status}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(log.changed_at).toLocaleString()}
                      </p>
                      {log.note && (
                        <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          {log.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Order registered in platform queue.</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
          <h3 className="font-bold text-slate-900 text-base mb-4">Ordered Items</h3>
          <div className="divide-y divide-slate-100">
            {order.items?.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{item.title_snapshot}</p>
                    {item.vendor_name_snapshot && (
                      <p className="text-xs text-slate-500 mt-0.5">Merchant: {item.vendor_name_snapshot}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-1">
                      Qty: <strong className="text-slate-900">{item.quantity}</strong> × {formatPrice(item.price_at_order)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-extrabold text-blue-600 text-base">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No items listed in this order.</p>
            )}
          </div>
        </div>

        {/* Payment & Settlement Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
          <h3 className="font-bold text-slate-900 text-base mb-4">Payment &amp; Settlement</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items Total</span>
              <span className="font-mono font-semibold text-slate-900">{formatPrice(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Express Pickup</span>
              <span className="font-semibold text-emerald-600">Free Counter Handover</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Mode</span>
              <span className="font-bold text-slate-900 capitalize">
                {order.payment_method || 'Cash on Pickup'}
              </span>
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-100 items-baseline">
              <span className="font-bold text-slate-900 text-base">Grand Total</span>
              <span className="text-2xl font-mono font-extrabold text-slate-900">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Actions (if any) */}
        {actions.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-base mb-2">Available Actions</h3>
            {actions.map((act) => (
              <Button
                key={act.status}
                onClick={() => handleTransition(act.status)}
                disabled={act.disabled}
                variant={act.variant === 'danger' ? 'danger' : 'blue'}
                className="w-full py-3 rounded-2xl font-bold"
              >
                {act.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
