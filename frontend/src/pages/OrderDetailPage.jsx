/**
 * Campus Commons - Order Detail & Counter Voucher Receipt
 * Redesigned with university dispatch receipt & voucher ticket aesthetic:
 * tactile service ticket, clear status timeline, and itemized ledger.
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
  placed: { badge: 'bg-amber-50 text-amber-800 border-amber-300', icon: Package },
  confirmed: { badge: 'bg-blue-50 text-blue-900 border-blue-300', icon: Truck },
  ready: { badge: 'bg-emerald-50 text-emerald-900 border-emerald-300', icon: CheckCircle },
  completed: { badge: 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]', icon: CheckCircle },
  cancelled: { badge: 'bg-red-50 text-red-800 border-red-300', icon: XCircle },
  disputed: { badge: 'bg-purple-50 text-purple-900 border-purple-300', icon: AlertCircle },
};

const STATUS_LABELS = {
  placed: 'Requisition Placed',
  confirmed: 'Kitchen/Depot Confirmed',
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
          label: 'Cancel Requisition',
          status: 'cancelled',
          variant: 'danger',
          disabled: transitionLoading,
        });
      }
      if (order.status === 'ready') {
        actions.push({
          label: 'Confirm Pickup & Handover',
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
    return <LoadingSpinner message="Consulting order docket..." />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] py-12 px-4 font-sans">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-[#E4DDCF] shadow-xs text-center">
          <Alert type="error" message="Order record not found" />
          <Button onClick={() => navigate('/orders')} className="mt-4 w-full text-xs">
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
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between pb-4 border-b border-[#E4DDCF]">
          <button
            onClick={() => navigate('/orders')}
            className="px-3 py-1.5 hover:bg-[#FAF8F3] rounded border border-[#E4DDCF] bg-white flex items-center gap-1.5 text-xs font-mono text-zinc-700 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>ALL DOCKETS</span>
          </button>
          <div className="text-right font-mono">
            <span className="font-bold text-sm text-zinc-950 block">
              DOCKET #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <p className="text-zinc-500 text-xs">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}
        {successMessage && (
          <div className="mb-5">
            <Alert type="success" message={successMessage} dismissible onClose={() => setSuccessMessage(null)} />
          </div>
        )}

        {/* Physical Dispatch Slip Style Pickup Voucher */}
        {(order.status === 'ready' || order.status === 'confirmed' || order.status === 'placed') && (
          <div className="bg-[#FFFBEB] rounded-lg border border-amber-300 p-6 sm:p-7 mb-6 shadow-xs relative">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-white p-3 rounded border border-amber-300 text-center shrink-0 shadow-xs">
                <div className="w-20 h-20 bg-zinc-950 rounded flex items-center justify-center p-2 text-white">
                  <QrCode className="w-full h-full text-white" />
                </div>
                <p className="text-[9px] uppercase font-mono font-bold tracking-wider text-zinc-500 mt-1.5">Counter QR</p>
              </div>

              <div className="space-y-2.5 flex-1 text-center sm:text-left">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-amber-400 bg-amber-100 text-amber-900 inline-block mb-1">
                    {order.status === 'ready' ? 'Ready for Counter Pickup' : 'Order Processing In Queue'}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-zinc-950">
                    Official Counter Collection Slip
                  </h3>
                  <p className="text-xs text-zinc-700 font-sans mt-0.5">
                    Show this encrypted QR code at the service counter, or quote your 4-digit PIN:
                  </p>
                </div>

                <div className="inline-flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded border border-amber-300 shadow-xs">
                  <KeyRound className="h-4 w-4 text-amber-700" />
                  <span className="text-xs font-mono font-semibold text-zinc-600">PICKUP PIN:</span>
                  <span className="text-xl font-mono font-extrabold text-amber-950 tracking-widest">
                    {order.pickup_pin || '4821'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-lg border border-[#E4DDCF] p-6 mb-6 shadow-xs">
          <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-[#E4DDCF]">
            <div className={`p-3 rounded border ${statusCfg.badge}`}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">Order Lifecycle Status</p>
              <h2 className="font-serif text-xl font-bold text-zinc-950">
                {STATUS_LABELS[order.status] || order.status}
              </h2>
            </div>
          </div>

          {/* Status Timeline */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3">
              Status Audit Log
            </h3>
            <div className="space-y-3 font-mono text-xs">
              {order.status_logs?.length > 0 ? (
                order.status_logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-2.5 rounded border border-[#E4DDCF] bg-[#FAF8F3]">
                    <div className="w-2 h-2 rounded-full bg-blue-900 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-zinc-900">{STATUS_LABELS[log.status] || log.status}</span>
                        <span className="text-[10px] text-zinc-500">{new Date(log.changed_at).toLocaleString()}</span>
                      </div>
                      {log.note && (
                        <p className="text-xs text-zinc-600 mt-1 font-sans">
                          {log.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 font-sans">Order registered in central platform queue.</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="bg-white rounded-lg border border-[#E4DDCF] shadow-xs p-6 mb-6">
          <h3 className="font-serif font-bold text-base text-zinc-950 mb-3 pb-2 border-b border-[#E4DDCF]">
            Itemized Concession Requisition
          </h3>
          <div className="divide-y divide-[#E4DDCF]">
            {order.items?.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-start">
                  <div>
                    <p className="font-serif font-bold text-zinc-900 text-sm">{item.title_snapshot}</p>
                    {item.vendor_name_snapshot && (
                      <p className="text-xs font-mono text-zinc-500 mt-0.5">Concession: {item.vendor_name_snapshot}</p>
                    )}
                    <p className="text-xs font-mono text-zinc-600 mt-0.5">
                      Qty: <strong>{item.quantity}</strong> × {formatPrice(item.price_at_order)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-zinc-950 text-sm">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500">No items listed in this order docket.</p>
            )}
          </div>
        </div>

        {/* Settlement Summary */}
        <div className="bg-white rounded-lg border border-[#E4DDCF] shadow-xs p-6 mb-6">
          <h3 className="font-serif font-bold text-base text-zinc-950 mb-3 pb-2 border-b border-[#E4DDCF]">
            Settlement Summary
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-zinc-600">
              <span>Items Total</span>
              <span className="font-bold text-zinc-900">{formatPrice(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Collection Handling</span>
              <span className="font-semibold text-emerald-800">Free Counter Handover</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Settlement Mode</span>
              <span className="font-bold text-zinc-900 capitalize">
                {order.payment_method || 'Cash on Pickup'}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#E4DDCF] items-baseline">
              <span className="font-serif font-bold text-sm text-zinc-950">Grand Total</span>
              <span className="text-xl font-mono font-bold text-zinc-950">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Actions (if any) */}
        {actions.length > 0 && (
          <div className="bg-white rounded-lg border border-[#E4DDCF] shadow-xs p-5 mb-6 space-y-2.5">
            <h3 className="font-serif font-bold text-zinc-950 text-sm mb-1">Available Transitions</h3>
            {actions.map((act) => (
              <Button
                key={act.status}
                onClick={() => handleTransition(act.status)}
                disabled={act.disabled}
                variant={act.variant === 'danger' ? 'danger' : 'primary'}
                className="w-full py-2.5 rounded text-xs font-semibold"
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
