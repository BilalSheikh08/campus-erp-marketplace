import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  X,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchWardenHostelRequest, transitionHostelRequest } from '../../services/hostelRequestsApi';

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800', icon: Clock },
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  fulfilled: { label: 'Fulfilled', color: 'bg-purple-100 text-purple-800', icon: Package },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: X },
};

export default function WardenHostelRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWardenHostelRequest(id);
      setRequest(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const getAllowedActions = () => {
    if (!request) return [];
    const actions = [];
    if (request.status === 'pending_approval') {
      actions.push({ action: 'approved', label: 'Approve', color: 'bg-green-600 hover:bg-green-700' });
      actions.push({ action: 'rejected', label: 'Reject', color: 'bg-red-600 hover:bg-red-700' });
    }
    if (request.status === 'approved') {
      actions.push({ action: 'fulfilled', label: 'Mark Fulfilled', color: 'bg-purple-600 hover:bg-purple-700' });
    }
    return actions;
  };

  const handleTransition = async (targetStatus) => {
    if (targetStatus === 'rejected' && !showRejectionForm) {
      setShowRejectionForm(true);
      return;
    }

    try {
      setTransitioning(true);
      await transitionHostelRequest(
        id,
        targetStatus,
        targetStatus === 'rejected' ? rejectionReason : notes
      );
      await loadRequest();
      setNotes('');
      setRejectionReason('');
      setShowRejectionForm(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Transition failed');
    } finally {
      setTransitioning(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <button
          onClick={() => navigate('/warden/requests')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={18} />
          Back to Requests
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-gray-500">Request not found</div>
      </div>
    );
  }

  const status = STATUS_CONFIG[request.status] || {};
  const allowedActions = getAllowedActions();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/warden/requests')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft size={18} />
        Back to Requests
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hostel Request #{request.id.slice(0, 8)}</h1>
              <p className="text-gray-500 text-sm mt-1">
                Submitted on {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
            {status.icon && (
              <div className={`px-3 py-1 rounded-full ${status.color} flex items-center gap-2`}>
                {status.icon && <status.icon size={16} />}
                <span className="font-medium text-sm">{status.label}</span>
              </div>
            )}
          </div>
        </div>

        {/* Student Info */}
        <div className="mb-6 grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Student</h3>
            <p className="text-gray-900">{request.student_name}</p>
            <p className="text-gray-600 text-sm">{request.student_email}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Assigned Warden</h3>
            <p className="text-gray-900">
              {request.warden_name || 'Unassigned'}
            </p>
            {request.warden_email && (
              <p className="text-gray-600 text-sm">{request.warden_email}</p>
            )}
          </div>
        </div>

        {/* Request Details */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Request Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Listing</p>
              <p className="text-gray-900 font-medium">{request.listing_title}</p>
              <p className="text-sm text-gray-600 mt-1">₹{request.listing_price}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantity</p>
              <p className="text-gray-900 font-medium">{request.quantity} units</p>
              <p className="text-sm text-gray-600 mt-1">Total: ₹{request.total_value}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Required By</p>
              <p className="text-gray-900 font-medium">
                {new Date(request.required_by_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Special Instructions</p>
              <p className="text-gray-900 font-medium">
                {request.special_instructions || 'None'}
              </p>
            </div>
          </div>
        </div>

        {/* Warden Notes */}
        {request.warden_notes && (
          <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">Warden Notes</h3>
            <p className="text-gray-700">{request.warden_notes}</p>
          </div>
        )}

        {/* Status History */}
        {request.status_logs && request.status_logs.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Status History</h3>
            <div className="space-y-3">
              {request.status_logs.map((log) => (
                <div key={log.id} className="flex gap-4 pb-3 border-b border-gray-200 last:border-0">
                  <div className="text-sm text-gray-600 min-w-fit">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium capitalize">{log.status.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-600">
                      by {log.changed_by_name} ({log.changed_by_email})
                    </p>
                    {log.note && <p className="text-sm text-gray-700 mt-1">{log.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {allowedActions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>

            {request.status === 'pending_approval' && showRejectionForm && (
              <div className="mb-6 bg-red-50 rounded-lg p-4 border border-red-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (Required)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why you are rejecting this request..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={3}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleTransition('rejected')}
                    disabled={transitioning || !rejectionReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {transitioning ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                  <button
                    onClick={() => setShowRejectionForm(false)}
                    disabled={transitioning}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {request.status === 'pending_approval' && !showRejectionForm && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={2}
                />
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              {allowedActions.map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => handleTransition(btn.action)}
                  disabled={transitioning}
                  className={`px-4 py-2 text-white rounded-lg ${btn.color} disabled:opacity-50 text-sm font-medium transition`}
                >
                  {transitioning ? 'Processing...' : btn.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
