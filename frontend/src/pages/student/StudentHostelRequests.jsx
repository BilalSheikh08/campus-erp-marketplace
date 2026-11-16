/**
 * Campus Commons - Student Hostel Requisitions
 * Residence Hall Requisition Docket Ledger:
 * Room maintenance & equipment requests, warden review stamps, and cancellation options.
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
    label: 'Docket Submitted',
    color: 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]',
    icon: Clock,
  },
  pending_approval: {
    label: 'Pending Warden Review',
    color: 'bg-amber-50 text-amber-800 border-amber-300',
    icon: AlertCircle,
  },
  approved: {
    label: 'Warden Approved',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Declined by Warden',
    color: 'bg-red-50 text-red-800 border-red-300',
    icon: XCircle,
  },
  fulfilled: {
    label: 'Fulfilled & Issued',
    color: 'bg-blue-50 text-blue-900 border-blue-300',
    icon: Package,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-[#FAF8F3] text-zinc-500 border-[#E4DDCF]',
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
    if (!window.confirm('Are you sure you want to cancel this requisition docket?')) return;
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

  if (loading) return <LoadingSpinner message="Consulting residence hall requisition ledger..." />;

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-10 pb-24 text-zinc-900 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <Building2 className="h-3.5 w-3.5 text-emerald-800" />
              <span>RESIDENCE SUPERINTENDENT · STUDENT REQUISITIONS</span>
            </div>
            <h1 className="font-serif text-3xl font-normal text-zinc-950 tracking-tight">
              Hostel Requisitions &amp; Supply Ledger
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-sans">
              Track room mattresses, study lamps, cleaning equipment, and warden decision stamps.
            </p>
          </div>
          <Link to="/marketplace/hostel_supply">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs font-semibold">
              <Plus size={14} /> Requisition Room Supply
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded mb-6 font-mono">
            {error}
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex gap-1.5 mb-6 flex-wrap font-mono text-xs">
          {['all', 'submitted', 'pending_approval', 'approved', 'rejected', 'fulfilled', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded text-xs transition cursor-pointer ${
                filter === status
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-white border border-[#E4DDCF] text-zinc-700 hover:bg-[#FAF8F3]'
              }`}
            >
              {status === 'all' ? 'All Dockets' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-10 text-center shadow-xs">
            <EmptyState
              icon={<Package className="mx-auto h-8 w-8 text-zinc-400" />}
              title="No hostel requisitions on record"
              message="You haven't submitted any room equipment requests matching this filter."
              action={
                <Link to="/marketplace/hostel_supply">
                  <Button variant="primary" size="sm" className="mt-2 text-xs">
                    Browse Hostel Supplies Catalog
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#E4DDCF] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#FAF8F3] border-b border-[#E4DDCF] text-zinc-600 font-mono font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Docket ID</th>
                    <th className="px-5 py-3">Equipment Item</th>
                    <th className="px-5 py-3">Qty</th>
                    <th className="px-5 py-3">Resident Room</th>
                    <th className="px-5 py-3">Warden Decision</th>
                    <th className="px-5 py-3">Submission</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DDCF]">
                  {filteredRequests.map((req) => {
                    const statusConfig = STATUS_CONFIG[req.status] || STATUS_CONFIG.submitted;
                    const StatusIcon = statusConfig.icon;
                    return (
                      <tr key={req.id} className="hover:bg-[#FAF8F3] transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-zinc-950">
                          #{req.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-zinc-900">
                          {req.listing?.title || 'Hostel Supply Item'}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-zinc-800">{req.quantity}</td>
                        <td className="px-5 py-3.5 font-mono text-zinc-600">{req.room_number || 'Unspecified'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${statusConfig.color}`}>
                            <StatusIcon size={11} />
                            <span>{statusConfig.label}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-zinc-500">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleViewDetail(req.id)}
                            className="p-1 text-zinc-600 hover:text-blue-900 hover:bg-[#FAF8F3] rounded border border-[#E4DDCF] transition cursor-pointer"
                            title="Inspect Docket"
                          >
                            <Eye size={14} />
                          </button>
                          {canCancel(req.status) && (
                            <button
                              onClick={() => handleCancel(req.id)}
                              disabled={cancelling === req.id}
                              className="p-1 text-red-700 hover:text-red-900 hover:bg-red-50 rounded border border-red-200 transition cursor-pointer disabled:opacity-50"
                              title="Cancel Requisition"
                            >
                              <X size={14} />
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

        {/* Request Detail Modal */}
        {selectedRequest && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-100"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedRequest(null);
            }}
          >
            <div className="bg-white rounded-lg max-w-lg w-full shadow-lg border border-[#E4DDCF] overflow-hidden transform transition-all font-sans">
              <div className="px-5 py-3.5 bg-[#18181B] text-white flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-white">Residence Requisition Docket</h3>
                  <p className="text-[11px] font-mono text-zinc-400">DOCKET #{selectedRequest.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 text-zinc-400 hover:text-white rounded transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {detailLoading ? (
                  <LoadingSpinner message="Consulting requisition details..." />
                ) : detailError ? (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded font-mono">
                    {detailError}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-[#E4DDCF]">
                      <div>
                        <p className="font-serif font-bold text-base text-zinc-950">
                          {selectedRequest.listing?.title || 'Hostel Supply'}
                        </p>
                        <p className="text-zinc-600 font-mono text-xs">Resident Room: {selectedRequest.room_number || 'Unassigned'}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${STATUS_CONFIG[selectedRequest.status]?.color}`}>
                        {STATUS_CONFIG[selectedRequest.status]?.label || selectedRequest.status}
                      </span>
                    </div>

                    <div className="bg-[#FAF8F3] p-4 rounded border border-[#E4DDCF] space-y-2 font-mono">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Requested Quantity:</span>
                        <span className="font-bold text-zinc-900">{selectedRequest.quantity} unit(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Submission Timestamp:</span>
                        <span className="text-zinc-800">
                          {new Date(selectedRequest.created_at).toLocaleString()}
                        </span>
                      </div>
                      {selectedRequest.warden_notes && (
                        <div className="pt-2 border-t border-[#E4DDCF] mt-2 font-sans">
                          <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 block mb-1">
                            Warden Superintendent Remarks:
                          </span>
                          <p className="text-zinc-900 bg-white p-2.5 rounded border border-[#E4DDCF] text-xs">
                            {selectedRequest.warden_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {canCancel(selectedRequest.status) && (
                      <Button
                        variant="danger"
                        className="w-full py-2 rounded text-xs font-semibold"
                        onClick={() => handleCancel(selectedRequest.id)}
                        disabled={cancelling === selectedRequest.id}
                      >
                        Cancel Requisition Docket
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
