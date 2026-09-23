/**
 * Orders history page - display user's orders.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { fetchOrders } from '../api/orders';
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
  placed: 'Placed',
  confirmed: 'Confirmed',
  ready: 'Ready for Pickup',
  completed: 'Completed',
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
    // Show success message if redirected from checkout
    if (location.state?.success) {
      setSuccessMessage('Order placed successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    }

    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchOrders();
        setOrders(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [location]);

  if (isLoading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6">
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
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              Start shopping to create your first order.
            </p>
            <Button onClick={() => navigate('/marketplace')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Order {order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                {/* Order Items Summary */}
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm text-gray-600 mb-2">
                    {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {item.title_snapshot}
                      </span>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        +{(order.items?.length || 0) - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Total and Navigate */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Cart */}
        <div className="mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
          >
            Back to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
