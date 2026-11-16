/**
 * Campus Commons - Vendor Concessionaire Operations Dashboard
 * Merchant Order Desk & Dispatch Counter:
 * High-speed order preparation queue, inline 4-digit PIN verification counter,
 * catalog management, and stock control.
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
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { fetchOrders, transitionOrder } from '../../api/orders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import PickupQRModal from '../../components/shared/PickupQRModal';

const STATUS_CONFIGS = {
  placed: { badge: 'bg-amber-50 text-amber-800 border-amber-300', label: 'New Order' },
  confirmed: { badge: 'bg-blue-50 text-blue-900 border-blue-300', label: 'Preparing' },
  ready: { badge: 'bg-emerald-50 text-emerald-900 border-emerald-300', label: 'Ready at Window' },
  completed: { badge: 'bg-[#FAF8F3] text-zinc-600 border-[#E4DDCF]', label: 'Handed Over' },
  cancelled: { badge: 'bg-red-50 text-red-800 border-red-300', label: 'Cancelled' },
};

export default function VendorDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Quick inline PIN verification at the counter desk
  const [quickPin, setQuickPin] = useState('');
  const [pinVerifying, setPinVerifying] = useState(false);
  const [pinFeedback, setPinFeedback] = useState(null);

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

  const handleInlinePinSubmit = async (e) => {
    e.preventDefault();
    const pin = quickPin.trim();
    if (!pin) return;

    const match = orders.find(
      (o) =>
        (o.pickup_pin && o.pickup_pin === pin) ||
        o.id.toLowerCase().startsWith(pin.toLowerCase())
    );

    if (!match) {
      setPinFeedback({ type: 'error', text: `No active order matches PIN "${pin}".` });
      return;
    }

    if (match.status === 'completed') {
      setPinFeedback({ type: 'error', text: `Docket #${match.id.slice(0, 8)} has already been handed over.` });
      return;
    }

    setPinVerifying(true);
    setPinFeedback(null);
    try {
      if (match.status === 'placed') {
        await transitionOrder(match.id, { target_status: 'confirmed' });
        await transitionOrder(match.id, { target_status: 'ready' });
      } else if (match.status === 'confirmed') {
        await transitionOrder(match.id, { target_status: 'ready' });
      }

      await transitionOrder(match.id, { target_status: 'completed', note: 'Verified by counter PIN input.' });
      setPinFeedback({ type: 'success', text: `Order #${match.id.slice(0, 8).toUpperCase()} verified! Handover completed.` });
      setQuickPin('');
      await loadOrders();
    } catch (err) {
      setPinFeedback({ type: 'error', text: err.response?.data?.detail || 'PIN verification failed.' });
    } finally {
      setPinVerifying(false);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'placed' || o.status === 'confirmed');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  if (isLoading) {
    return <LoadingSpinner message="Consulting vendor dispatch ledger..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-900 mb-1.5">
              <Store className="h-3.5 w-3.5 text-amber-700" />
              <span>MERCHANT CONCESSION · DISPATCH OPERATIONS</span>
            </div>
            <h1 className="font-serif text-3xl font-normal text-zinc-950 tracking-tight">
              Merchant Order Desk
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm mt-0.5 font-sans">
              Live preparation queue, express pickup PIN clearance, and catalog stock controls.
            </p>
          </div>

          <div className="flex items-center gap-2.5 font-sans">
            <Button
              variant="outline"
              size="sm"
              onClick={loadOrders}
              className="flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Ledger</span>
            </Button>
            <Button
              onClick={() => setShowQRModal(true)}
              variant="primary"
              size="sm"
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Scanner &amp; Modal PIN</span>
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

        {/* High-Speed Inline Counter Verification Dock */}
        <div className="bg-white rounded-lg border border-[#E4DDCF] p-4 sm:p-5 mb-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900">
                <KeyRound className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-zinc-950">Express Counter PIN Handover</h2>
                <p className="text-xs font-mono text-zinc-500">Student reads 4-digit token at express window</p>
              </div>
            </div>

            <form onSubmit={handleInlinePinSubmit} className="flex items-center gap-2">
              <input
                type="text"
                maxLength={8}
                value={quickPin}
                onChange={(e) => setQuickPin(e.target.value)}
                placeholder="Enter 4-Digit PIN..."
                className="w-40 sm:w-48 text-sm font-mono tracking-widest px-3 py-1.5 rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-blue-900 text-center uppercase"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={pinVerifying}
                disabled={pinVerifying || !quickPin.trim()}
                className="text-xs font-semibold"
              >
                <span>Verify PIN</span>
              </Button>
            </form>
          </div>

          {pinFeedback && (
            <div className="mt-3">
              <Alert
                type={pinFeedback.type}
                message={pinFeedback.text}
                dismissible
                onClose={() => setPinFeedback(null)}
              />
            </div>
          )}
        </div>

        {/* Ledger Statistics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-4 shadow-xs">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Total Dockets</p>
            <p className="text-2xl font-mono font-bold text-zinc-950 mt-1">{orders.length}</p>
            <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Recorded concession orders</p>
          </div>

          <div className="bg-white rounded-lg border border-[#E4DDCF] p-4 shadow-xs">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-700">In Preparation</p>
            <p className="text-2xl font-mono font-bold text-amber-700 mt-1">{pendingOrders.length}</p>
            <p className="text-[11px] text-zinc-500 font-sans mt-0.5">In kitchen / packing queue</p>
          </div>

          <div className="bg-white rounded-lg border border-[#E4DDCF] p-4 shadow-xs">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-800">Ready at Window</p>
            <p className="text-2xl font-mono font-bold text-emerald-800 mt-1">{readyOrders.length}</p>
            <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Awaiting 4-digit PIN collection</p>
          </div>

          <div className="bg-white rounded-lg border border-[#E4DDCF] p-4 shadow-xs">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Handed Over</p>
            <p className="text-2xl font-mono font-bold text-zinc-950 mt-1">{completedOrders.length}</p>
            <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Completed fulfillments</p>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link
            to="/vendor/listings"
            className="flex items-center justify-between p-4 rounded-lg bg-white border border-[#E4DDCF] hover:border-zinc-400 transition-colors shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#FAF8F3] text-amber-900 border border-[#E4DDCF] flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-zinc-950">Catalog &amp; Menu Folio</h4>
                <p className="text-[11px] text-zinc-500 font-sans">Edit dishes, stationery, or supplies</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/vendor/inventory"
            className="flex items-center justify-between p-4 rounded-lg bg-white border border-[#E4DDCF] hover:border-zinc-400 transition-colors shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#FAF8F3] text-blue-900 border border-[#E4DDCF] flex items-center justify-center">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-zinc-950">Stock Control Ledger</h4>
                <p className="text-[11px] text-zinc-500 font-sans">Fast delta adjustments &amp; sync</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/vendor/analytics"
            className="flex items-center justify-between p-4 rounded-lg bg-white border border-[#E4DDCF] hover:border-zinc-400 transition-colors shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#FAF8F3] text-purple-900 border border-[#E4DDCF] flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-zinc-950">Sales Revenue Reports</h4>
                <p className="text-[11px] text-zinc-500 font-sans">Concession totals &amp; volume records</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Live Kitchen & Counter Orders Queue */}
        <div className="bg-white rounded-lg border border-[#E4DDCF] p-5 shadow-xs mb-8">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E4DDCF] mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-zinc-950">Live Preparation &amp; Collection Queue</h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">Orders requiring preparation or express counter release</p>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-800 bg-[#FAF8F3] px-2.5 py-1 rounded border border-[#E4DDCF]">
              {pendingOrders.length + readyOrders.length} In Active Queue
            </span>
          </div>

          {pendingOrders.length === 0 && readyOrders.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs font-mono">
              <Clock className="h-6 w-6 mx-auto mb-2 text-zinc-400" />
              All orders dispatched. Concession counter queue clear.
            </div>
          ) : (
            <div className="space-y-3">
              {[...pendingOrders, ...readyOrders].map((ord) => {
                const statusCfg = STATUS_CONFIGS[ord.status] || STATUS_CONFIGS.placed;
                return (
                  <div
                    key={ord.id}
                    className="p-4 rounded border border-[#E4DDCF] bg-[#FAF8F3] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-zinc-950 text-xs">
                          DOCKET #{ord.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${statusCfg.badge}`}>
                          {statusCfg.label}
                        </span>
                        {ord.pickup_pin && (
                          <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                            PIN: {ord.pickup_pin}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-700 font-sans">
                        {ord.items?.map((it) => `${it.quantity}× ${it.title_snapshot}`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto font-sans">
                      {ord.status === 'placed' && (
                        <Button
                          size="sm"
                          variant="primary"
                          loading={actionLoading === ord.id}
                          onClick={() => handleQuickTransition(ord.id, 'confirmed')}
                          className="text-xs font-semibold"
                        >
                          Confirm Order
                        </Button>
                      )}
                      {ord.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="primary"
                          loading={actionLoading === ord.id}
                          onClick={() => handleQuickTransition(ord.id, 'ready')}
                          className="text-xs font-semibold"
                        >
                          Mark Ready at Window
                        </Button>
                      )}
                      {ord.status === 'ready' && (
                        <Button
                          size="sm"
                          variant="primary"
                          loading={actionLoading === ord.id}
                          onClick={() => handleQuickTransition(ord.id, 'completed')}
                          className="text-xs font-semibold"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Handover &amp; Clear
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/orders/${ord.id}`)}
                        className="text-xs"
                      >
                        Docket
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
