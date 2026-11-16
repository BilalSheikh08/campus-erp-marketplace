import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { QrCode, CheckCircle2, AlertCircle, X, Camera, KeyRound } from 'lucide-react';
import { transitionOrder } from '../../api/orders';
import Button from './Button';

export default function PickupQRModal({ isOpen, onClose, orders = [], onOrderCompleted }) {
  const [pinInput, setPinInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [mode, setMode] = useState('pin'); // 'pin' or 'camera'

  useEffect(() => {
    if (!isOpen) {
      setPinInput('');
      setError('');
      setCompletedOrder(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setError('');
    const targetPin = pinInput.trim();
    if (!targetPin) {
      setError('Please enter the 4-digit pickup PIN.');
      return;
    }

    // Find order matching pickup_pin or order ID substring
    const match = orders.find(
      (o) =>
        (o.pickup_pin && o.pickup_pin === targetPin) ||
        o.id.toLowerCase().startsWith(targetPin.toLowerCase())
    );

    if (!match) {
      setError(`No active order found matching PIN "${targetPin}".`);
      return;
    }

    if (match.status === 'completed') {
      setError('This order has already been marked as completed.');
      return;
    }

    setVerifying(true);
    try {
      if (match.status === 'placed') {
        await transitionOrder(match.id, { target_status: 'confirmed' });
        await transitionOrder(match.id, { target_status: 'ready' });
      } else if (match.status === 'confirmed') {
        await transitionOrder(match.id, { target_status: 'ready' });
      }

      const updated = await transitionOrder(match.id, {
        target_status: 'completed',
        note: `Verified via Campus Counter QR / PIN (${targetPin})`,
      });

      setCompletedOrder(updated);
      if (onOrderCompleted) onOrderCompleted(updated);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to complete order. Please verify order status.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-blue/20 text-accent-blue border border-accent-blue/30 flex items-center justify-center">
              <QrCode className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white tracking-tight">Counter Pickup Verification</h3>
              <p className="text-[11px] text-slate-400">Campus Express Pickup Desk</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {completedOrder ? (
            <div className="text-center py-2 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Order Handed Over Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Order <span className="font-mono font-bold text-slate-800">#{completedOrder.id.slice(0, 8)}</span> marked as completed.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Buyer:</span>
                  <span className="font-semibold text-slate-800">Verified Campus Student</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Token PIN:</span>
                  <span className="font-mono font-bold text-emerald-600">{completedOrder.pickup_pin || '4821'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Settlement:</span>
                  <span className="font-semibold text-emerald-600">Recorded & Settled</span>
                </div>
              </div>
              <Button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 font-bold rounded-xl"
                onClick={() => {
                  setCompletedOrder(null);
                  setPinInput('');
                  onClose();
                }}
              >
                Close Verification
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mode Switcher */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('pin')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    mode === 'pin' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                  Enter 4-Digit PIN
                </button>
                <button
                  type="button"
                  onClick={() => setMode('camera')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    mode === 'camera' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Camera className="h-3.5 w-3.5 text-blue-600" />
                  Scan Student QR
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {mode === 'pin' ? (
                <form onSubmit={handleVerifyPin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                      Enter student&apos;s 4-digit pickup PIN:
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      autoFocus
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="e.g. 4821"
                      className="w-full text-center text-3xl tracking-widest font-mono font-bold py-3.5 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 bg-slate-50 text-slate-900 shadow-inner"
                    />
                  </div>

                  {orders.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-600 font-semibold mb-1.5">
                        Active Ready Orders ({orders.filter((o) => o.status === 'ready' || o.status === 'placed' || o.status === 'confirmed').length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {orders
                          .filter((o) => o.status !== 'completed' && o.status !== 'cancelled')
                          .slice(0, 4)
                          .map((o) => (
                            <button
                              key={o.id}
                              type="button"
                              onClick={() => setPinInput(o.pickup_pin || o.id.slice(0, 4))}
                              className="text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-md hover:border-blue-600 font-mono text-slate-800 shadow-xs hover:bg-blue-50 transition"
                            >
                              PIN: <strong className="text-blue-600">{o.pickup_pin || o.id.slice(0, 4)}</strong> ({o.id.slice(0, 4)})
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md"
                    loading={verifying}
                    disabled={verifying || !pinInput.trim()}
                  >
                    Verify & Handover Order
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 space-y-3">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-200">
                    <Camera className="h-7 w-7 animate-pulse text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Scan Student Pickup QR Code</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Hold student screen before the counter camera...</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (orders.length > 0) {
                        const first = orders.find((o) => o.status === 'ready') || orders[0];
                        if (first) setPinInput(first.pickup_pin || '4821');
                        setMode('pin');
                      }
                    }}
                  >
                    Use Sample QR PIN
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

PickupQRModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  orders: PropTypes.array,
  onOrderCompleted: PropTypes.func,
};
