/**
 * Order detail page - display full order information with student/vendor actions.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { fetchOrder, transitionOrder } from '../api/orders';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/shared/Alert';
import Button from '../components/shared/Button';
import { formatPrice } from '../utils/formatters';

const STATUS_COLORS = {
  placed: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-blue-100 text-blue-800',
  ready: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  disputed: 'bg-orange-100 text-orange-800',
};

const STATUS_LABELS = {
  placed: 'Order Placed',
  confirmed: 'Order Confirmed',
  ready: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

const STATUS_ICONS = {
  placed: Package,
  confirmed: Truck,
  ready: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle,
  disputed: AlertCircle,
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

  // Determine what actions are available
  const getAvailableActions = () => {
    if (!order || !user) return [];

    const actions = [];
    const isStudent = user.role === 'student';
    const isVendor = user.role === 'vendor';

    // Student actions
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
          label: 'Mark as Completed',
          status: 'completed',
          variant: 'primary',
          disabled: transitionLoading,
        });
        actions.push({
          label: 'Report Issue',
          status: 'disputed',
          variant: 'warning',
          disabled: transitionLoading,
        });
      }
    }

    // Vendor actions - can transition orders they're a vendor for
    if (isVendor && order.items?.some(item => item.vendor?.user?.id === user.id)) {
      if (order.status === 'placed') {
        actions.push({
          label: 'Confirm Order',
          status: 'confirmed',
          variant: 'primary',
          disabled: transitionLoading,
        });
      }
      if (order.status === 'confirmed') {
        actions.push({
          label: 'Mark as Ready',
          status: 'ready',
          variant: 'primary',
          disabled: transitionLoading,
        });
      }
    }

    return actions;
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Alert type="error" message="Order not found" />
          <Button onClick={() => navigate('/orders')} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[order.status] || Package;
  const actions = getAvailableActions();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order {order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-gray-600">
              Placed on {new Date(order.created_at).toLocaleDateString()}
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

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg ${STATUS_COLORS[order.status]}`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Status</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {STATUS_LABELS[order.status] || order.status}
              </h2>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-4">Status History</h3>
            <div className="space-y-3">
              {order.status_logs?.length > 0 ? (
                order.status_logs.map((log, idx) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      {idx < order.status_logs.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{STATUS_LABELS[log.status] || log.status}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(log.changed_at).toLocaleString()}
                      </p>
                      {log.note && <p className="text-sm text-gray-700 mt-1">{log.note}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No status history available</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items?.length > 0 ? (
              order.items.map(item => (
                <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.title_snapshot}</p>
                    {item.vendor_name_snapshot && (
                      <p className="text-sm text-gray-600">From: {item.vendor_name_snapshot}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Quantity: {item.quantity} × {formatPrice(item.price_at_order)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No items in this order</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">{formatPrice(order.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-gray-900">Free</span>
            </div>
            <div className="flex justify-between pt-4 border-t">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-primary">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium text-gray-900">
                {order.payment_method === 'mock' && 'Test Payment'}
                {order.payment_method === 'campus_wallet' && 'Campus Wallet'}
                {order.payment_method === 'cash_on_pickup' && 'Cash on Pickup'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                order.payment_status === 'refunded' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
              </span>
            </div>
            {order.pickup_slot && (
              <div className="flex justify-between">
                <span className="text-gray-600">Pickup Slot</span>
                <span className="font-medium text-gray-900">{order.pickup_slot}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              {actions.map(action => (
                <Button
                  key={action.status}
                  onClick={() => handleTransition(action.status)}
                  disabled={action.disabled}
                  variant={action.variant}
                  className="w-full"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/orders')}
          className="w-full"
        >
          Back to Orders
        </Button>
      </div>
    </div>
  );
}
