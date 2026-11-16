/**
 * Campus Commons - Student Hostel Requisitions
 * Track dorm equipment requisitions, warden approval states, and delivery status.
 */

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
  Building2,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/shared/Button';
import {
  fetchStudentHostelRequests,
  fetchHostelRequest,
  cancelHostelRequest,
} from '../../services/hostelRequestsApi';

const STATUS_CONFIG = {
  submitted: {
    label: 'Submitted',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  },
  pending_approval: {
    label: 'Pending Warden Approval',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircle,
  },
  approved: {
    label: 'Approved by Warden',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Declined',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
  },
  fulfilled: {
    label: 'Delivered / Fulfilled',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Package,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-slate-100 text-slate-500 border-slate-200',
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
    if (!window.confirm('Are you sure you want to cancel this requisition?')) return;
    try {
      setCancelling(id);
      await cancelHostelRequest(id);
      await loadRequests();
      if (selectedRequest?.id === id) {
        const updated = await fetchHostelRequest(id);
        setSelectedRequest(updated);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel requisition');
    } finally {
      setCancelling(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const canCancel = (status) => ['submitted', 'pending_approval'].includes(status);

  if (loading) return <LoadingSpinner message="Loading hostel requisitions..." />;

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Building2 className="h-7 w-7 text-emerald-600" /> My Hostel Requisitions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track room mattresses, study lamps, cleaning kits, and warden verification.
            </p>
          </div>
          <Link to="/marketplace/hostel_supply">
            <Button variant="blue" size="sm" className="gap-1.5 font-bold">
              <Plus size={16} /> New Supply Request
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'submitted', 'pending_approval', 'approved', 'rejected', 'fulfilled', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                filter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <EmptyState
              icon={<Package className="mx-auto h-12 w-12 text-slate-300" />}
              title="No hostel requisitions found"
              message="You haven't submitted any room equipment requests matching this filter."
              action={
                <Link to="/marketplace/hostel_supply">
                  <Button variant="blue" className="mt-4 font-bold">
                    Browse Hostel Supplies
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Request ID</th>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Qty</th>
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => {
                    const statusConfig = STATUS_CONFIG[req.status] || STATUS_CONFIG.submitted;
                    const StatusIcon = statusConfig.icon;
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          #{req.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {req.listing?.title || 'Hostel Supply Item'}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-700">{req.quantity}</td>
                        <td className="px-6 py-4 text-slate-600">{req.room_number || 'Unspecified'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConfig.color}`}>
                            <StatusIcon size={12} />
                            <span>{statusConfig.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleViewDetail(req.id)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {canCancel(req.status) && (
                            <button
                              onClick={() => handleCancel(req.id)}
                              disabled={cancelling === req.id}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                              title="Cancel Request"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Request Detail Modal with Dark Backdrop */}
        {selectedRequest && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedRequest(null);
            }}
          >
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">Hostel Requisition Detail</h3>
                  <p className="text-[11px] text-slate-400">ID: #{selectedRequest.id.slice(0, 8)}</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {detailLoading ? (
                  <LoadingSpinner message="Loading request..." />
                ) : detailError ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                    {detailError}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <p className="font-bold text-base text-slate-900">
                          {selectedRequest.listing?.title || 'Hostel Supply'}
                        </p>
                        <p className="text-slate-500">Room: {selectedRequest.room_number || 'Not specified'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_CONFIG[selectedRequest.status]?.color}`}>
                        {STATUS_CONFIG[selectedRequest.status]?.label || selectedRequest.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Requested Quantity:</span>
                        <span className="font-bold text-slate-900">{selectedRequest.quantity} unit(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Submitted Date:</span>
                        <span className="font-mono text-slate-700">
                          {new Date(selectedRequest.created_at).toLocaleString()}
                        </span>
                      </div>
                      {selectedRequest.warden_notes && (
                        <div className="pt-2 border-t border-slate-200 mt-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                            Warden Feedback Note:
                          </span>
                          <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                            {selectedRequest.warden_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {canCancel(selectedRequest.status) && (
                      <Button
                        variant="danger"
                        className="w-full py-2.5 rounded-xl font-bold"
                        onClick={() => handleCancel(selectedRequest.id)}
                        disabled={cancelling === selectedRequest.id}
                      >
                        Cancel Requisition
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
