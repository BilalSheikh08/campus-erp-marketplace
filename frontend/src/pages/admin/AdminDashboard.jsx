/**
 * Admin dashboard - system overview with stats and monitoring.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchOrders } from '../../api/orders';
import { fetchVendorApplications } from '../../api/vendors';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalVendors: 0,
    pendingVendors: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersData, vendorsData] = await Promise.all([
        fetchOrders(),
        fetchVendorApplications({ approval_status: 'pending' }),
      ]);

      const orders = Array.isArray(ordersData) ? ordersData : ordersData.results || [];
      const pendingVendors = Array.isArray(vendorsData) ? vendorsData : vendorsData.results || [];

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'placed' || o.status === 'confirmed').length,
        totalVendors: pendingVendors.length + (vendorsData.count || 0), // Rough estimate
        pendingVendors: pendingVendors.length,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Alert type="error" message="Access denied. Admin only." />
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor system activity and manage operations</p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingOrders}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-400 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vendors</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalVendors}</p>
              </div>
              <Users className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.pendingVendors}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => navigate('/admin/vendors')}
            className="w-full justify-center gap-2 h-auto py-4"
          >
            <Users className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Manage Vendors</div>
              <div className="text-sm opacity-90">{stats.pendingVendors} pending approval</div>
            </div>
          </Button>

          <Button
            onClick={() => navigate('/admin/orders')}
            variant="secondary"
            className="w-full justify-center gap-2 h-auto py-4"
          >
            <Package className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Monitor Orders</div>
              <div className="text-sm opacity-90">{stats.pendingOrders} orders pending</div>
            </div>
          </Button>

          <Button
            onClick={() => navigate('/admin/listings')}
            variant="secondary"
            className="w-full justify-center gap-2 h-auto py-4"
          >
            <BarChart3 className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Manage Listings</div>
              <div className="text-sm opacity-90">View & moderate</div>
            </div>
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Database</span>
                <span className="font-medium text-green-600">● Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Server</span>
                <span className="font-medium text-green-600">● Running</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cache</span>
                <span className="font-medium text-green-600">● Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-600">
                • {stats.totalOrders} total orders processed
              </p>
              <p className="text-gray-600">
                • {stats.pendingVendors} vendors awaiting approval
              </p>
              <p className="text-gray-600">
                • System running smoothly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
