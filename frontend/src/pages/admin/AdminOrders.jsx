/**
 * Admin Orders Management - view and manage all orders in the system.
 */

import { useEffect, useState } from 'react';
import { ChevronDown, Filter, Search } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchOrders, fetchOrder, transitionOrder } from '../../api/orders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';

const ORDER_STATUS_BADGE = {
  placed: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
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
      setError('Access denied. Admin only.');
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

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    // Search filter (by order ID, student name, or vendor name)
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
      // Refresh the order from backend
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Alert type="error" message="Access denied. Admin only." />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
          <p className="text-gray-600">Monitor and manage all orders across the platform</p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {transitionError && (
          <div className="mb-6">
            <Alert
              type="error"
              message={transitionError}
              dismissible
              onClose={() => setTransitionError(null)}
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, student, or vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-600">Placed</p>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter((o) => o.status === 'placed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-600">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter((o) => o.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-600">Ready</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.status === 'ready').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-600">
              {orders.filter((o) => o.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {orders.length === 0 ? 'No orders found' : 'No orders match your filters'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.student_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.vendor_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{order.total_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${ORDER_STATUS_BADGE[order.status]}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() =>
                            setExpandedOrder(expandedOrder === order.id ? null : order.id)
                          }
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedOrder === order.id ? 'rotate-180' : ''
                            }`}
                          />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expanded Order Details */}
        {expandedOrder && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            {filteredOrders.find((o) => o.id === expandedOrder) && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Order ID:</p>
                      <p className="font-medium text-gray-900">{expandedOrder}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status:</p>
                      <p
                        className={`font-medium ${
                          filteredOrders.find((o) => o.id === expandedOrder)?.status ===
                          'placed'
                            ? 'text-yellow-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {getStatusLabel(
                          filteredOrders.find((o) => o.id === expandedOrder)?.status
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Student:</p>
                      <p className="font-medium text-gray-900">
                        {filteredOrders.find((o) => o.id === expandedOrder)?.student_name ||
                          'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Vendor:</p>
                      <p className="font-medium text-gray-900">
                        {filteredOrders.find((o) => o.id === expandedOrder)?.vendor_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total:</p>
                      <p className="font-medium text-gray-900">
                        ₹{filteredOrders.find((o) => o.id === expandedOrder)?.total_price}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Created:</p>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          filteredOrders.find((o) => o.id === expandedOrder)?.created_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {filteredOrders.find((o) => o.id === expandedOrder)?.items &&
                  filteredOrders.find((o) => o.id === expandedOrder)?.items.length > 0 && (
                    <div className="mb-4 border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                      <div className="space-y-2">
                        {filteredOrders
                          .find((o) => o.id === expandedOrder)
                          ?.items.map((item, idx) => (
                            <div key={idx} className="text-sm text-gray-600 flex justify-between">
                              <span>
                                {item.listing_title} x {item.quantity}
                              </span>
                              <span>₹{item.price_at_order * item.quantity}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Status Transitions */}
                {getAvailableTransitions(
                  filteredOrders.find((o) => o.id === expandedOrder)?.status
                ).length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-900 mb-3">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableTransitions(
                        filteredOrders.find((o) => o.id === expandedOrder)?.status
                      ).map((newStatus) => (
                        <Button
                          key={newStatus}
                          onClick={() => handleTransition(expandedOrder, newStatus)}
                          disabled={transitioningOrder === expandedOrder}
                          variant="secondary"
                          className="text-sm"
                        >
                          {transitioningOrder === expandedOrder
                            ? 'Updating...'
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
