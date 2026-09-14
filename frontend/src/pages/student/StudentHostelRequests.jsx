import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  X,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  fetchStudentHostelRequests,
  fetchHostelRequest,
  cancelHostelRequest,
} from '../../services/hostelRequestsApi';

const STATUS_CONFIG = {
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
  },
  pending_approval: {
    label: 'Pending Approval',
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle,
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  fulfilled: {
    label: 'Fulfilled',
    color: 'bg-purple-100 text-purple-800',
    icon: Package,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800',
    icon: X,
  },
};

export default function StudentHostelRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [filter, setFilter] = useState('all');

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStudentHostelRequests();
      setRequests(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load hostel requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleViewDetail = async (id) => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      const data = await fetchHostelRequest(id);
      setSelectedRequest(data);
    } catch (err) {
      setDetailError(err.response?.data?.detail || 'Failed to load request details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      setCancelling(id);
      await cancelHostelRequest(id);
      await loadRequests();
      if (selectedRequest?.id === id) {
        const updated = await fetchHostelRequest(id);
        setSelectedRequest(updated);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel request');
    } finally {
      setCancelling(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const canCancel = (status) => {
    return ['submitted', 'pending_approval'].includes(status);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Hostel Requests</h1>
          <p className="text-gray-600 mt-1">Track your hostel supply requests</p>
        </div>
        <Link
          to="/listings?category=hostel_supply"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          New Request
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'submitted', 'pending_approval', 'approved', 'rejected', 'fulfilled', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : STATUS_CONFIG[status]?.label || status}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No hostel requests"
          description={
            filter === 'all'
              ? "You haven't submitted any hostel requests yet."
              : `No requests with status "${filter}".`
          }
          action={
            filter === 'all' && (
              <Link
                to="/listings?category=hostel_supply"
                className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Submit a Request
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const config = STATUS_CONFIG[request.status] || {
              label: request.status,
              color: 'bg-gray-100 text-gray-800',
              icon: Package,
            };
            const StatusIcon = config.icon;
            return (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Package className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {request.listing_title || 'Hostel Request'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {request.quantity} · Required by:{' '}
                        {new Date(request.required_by_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                      <StatusIcon size={14} />
                      {config.label}
                    </span>
                    <button
                      onClick={() => handleViewDetail(request.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {canCancel(request.status) && (
                      <button
                        onClick={() => handleCancel(request.id)}
                        disabled={cancelling === request.id}
                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        {cancelling === request.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {detailLoading ? (
                <LoadingSpinner />
              ) : detailError ? (
                <div className="text-red-600">{detailError}</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Listing</p>
                      <p className="font-medium">{selectedRequest.listing_title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-medium">{selectedRequest.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Required By</p>
                      <p className="font-medium">
                        {new Date(selectedRequest.required_by_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Value</p>
                      <p className="font-medium">₹{selectedRequest.total_value}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mt-1 ${STATUS_CONFIG[selectedRequest.status]?.color || 'bg-gray-100'}`}>
                        {STATUS_CONFIG[selectedRequest.status]?.label || selectedRequest.status}
                      </span>
                    </div>
                    {selectedRequest.special_instructions && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Special Instructions</p>
                        <p className="font-medium">{selectedRequest.special_instructions}</p>
                      </div>
                    )}
                    {selectedRequest.warden_notes && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Warden Notes</p>
                        <p className="font-medium">{selectedRequest.warden_notes}</p>
                      </div>
                    )}
                  </div>

                  {selectedRequest.status_logs && selectedRequest.status_logs.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Status History</h3>
                      <div className="space-y-3">
                        {selectedRequest.status_logs.map((log) => (
                          <div key={log.id} className="flex items-start gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                            <div>
                              <p>
                                <span className="font-medium">
                                  {STATUS_CONFIG[log.status]?.label || log.status}
                                </span>
                                {' by '}
                                {log.changed_by_name || 'System'}
                              </p>
                              <p className="text-gray-500">
                                {new Date(log.created_at).toLocaleString()}
                              </p>
                              {log.note && <p className="text-gray-600 mt-1">{log.note}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {canCancel(selectedRequest.status) && (
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleCancel(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  disabled={cancelling === selectedRequest.id}
                  className="w-full bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 transition disabled:opacity-50"
                >
                  {cancelling === selectedRequest.id ? 'Cancelling...' : 'Cancel Request'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
