import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  AlertCircle,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchWardenHostelRequests } from '../../services/hostelRequestsApi';

export default function WardenDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    fulfilled: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchWardenHostelRequests({ page_size: 100 });
        const requests = Array.isArray(data) ? data : data.results || [];

        setStats({
          total: requests.length,
          pending: requests.filter((r) => ['submitted', 'pending_approval'].includes(r.status)).length,
          approved: requests.filter((r) => r.status === 'approved').length,
          rejected: requests.filter((r) => r.status === 'rejected').length,
          fulfilled: requests.filter((r) => r.status === 'fulfilled').length,
        });
        setRecentRequests(requests.slice(0, 5));
      } catch (err) {
        console.error('Failed to load warden dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    {
      label: 'Total Requests',
      value: stats.total,
      icon: ClipboardList,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Pending Approval',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: Clock,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Fulfilled',
      value: stats.fulfilled,
      icon: Package,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Warden Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage hostel supply requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link
          to="/warden/requests"
          className="bg-blue-600 text-white rounded-xl p-6 hover:bg-blue-700 transition flex items-center justify-between"
        >
          <div>
            <h3 className="text-lg font-semibold">View All Requests</h3>
            <p className="text-blue-100 mt-1">
              {stats.pending} requests pending your review
            </p>
          </div>
          <TrendingUp size={24} />
        </Link>
        <Link
          to="/warden/requests?status=pending_approval"
          className="bg-yellow-50 text-yellow-800 rounded-xl p-6 hover:bg-yellow-100 transition flex items-center justify-between"
        >
          <div>
            <h3 className="text-lg font-semibold">Pending Approvals</h3>
            <p className="text-yellow-700 mt-1">
              {stats.pending} requests need your attention
            </p>
          </div>
          <AlertCircle size={24} />
        </Link>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
          <Link
            to="/warden/requests"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hostel requests to display
            </div>
          ) : (
            recentRequests.map((request) => (
              <div key={request.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Package className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.listing_title || 'Hostel Request'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.student_name} · Qty: {request.quantity}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  request.status === 'fulfilled' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {request.status.replace('_', ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
