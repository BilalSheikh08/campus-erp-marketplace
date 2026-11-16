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
  User,
  Building2,
  Calendar,
  FileText,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/shared/Button';
import { fetchWardenHostelRequest, transitionHostelRequest } from '../../services/hostelRequestsApi';

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Clock },
  pending_approval: { label: 'Pending Warden Approval', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
  approved: { label: 'Approved by Warden', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  rejected: { label: 'Declined', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
  fulfilled: { label: 'Fulfilled & Issued', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Package },
  cancelled: { label: 'Cancelled by Student', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: X },
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
      setError(err.response?.data?.detail || 'Failed to load requisition');
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
      actions.push({ action: 'approved', label: 'Approve Requisition', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' });
      actions.push({ action: 'rejected', label: 'Decline Requisition', color: 'bg-rose-600 hover:bg-rose-700 text-white' });
    }
    if (request.status === 'approved') {
      actions.push({ action: 'fulfilled', label: 'Confirm Room Delivery & Issue', color: 'bg-blue-600 hover:bg-blue-700 text-white' });
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
      alert(err.response?.data?.detail || 'Status update failed');
    } finally {
      setTransitioning(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading requisition audit record..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/warden/requests')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Requests
          </button>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-sm text-rose-800">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">Hostel requisition not found.</p>
          <Button onClick={() => navigate('/warden/requests')} className="mt-4 text-xs">
            Return to Requests
          </Button>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[request.status] || {
    label: request.status_display || request.status,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
  };
  const allowedActions = getAllowedActions();
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-slate-50 py-8 pb-20 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/warden/requests')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Requisitions Review
        </button>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 pb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Hostel Requisition #{request.id.slice(0, 8).toUpperCase()}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Submitted on {new Date(request.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </p>
            </div>
            {StatusIcon && (
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{status.label}</span>
              </span>
            )}
          </div>

          {/* Student & Warden Profile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Applying Resident
              </span>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>{request.student_name}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{request.student_email}</p>
              <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                Residence: <strong className="text-slate-800">Room {request.room_number || 'N/A'}, Block {request.hostel_block || 'A'}</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Assigned Authority
              </span>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-600" />
                <span>{request.warden_name || 'Hostel Warden Desk'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{request.warden_email || 'warden@campus.edu'}</p>
              <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                Department: <strong className="text-slate-800">Campus Residential Logistics</strong>
              </div>
            </div>
          </div>

          {/* Requisition Specs */}
          <div className="mb-6 rounded-xl border border-slate-200/80 p-5 bg-white">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Package className="h-4 w-4 text-slate-500" />
              <span>Requisition Specification</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Requested Item</span>
                <span className="font-bold text-slate-900 text-sm">{request.listing_title}</span>
                <span className="text-slate-500 block mt-0.5">₹{request.listing_price} unit rate</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Requested Volume</span>
                <span className="font-bold text-slate-900 text-sm">{request.quantity} units</span>
                <span className="text-emerald-600 font-semibold block mt-0.5">Total Value: ₹{request.total_value}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Required By</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {request.required_by_date ? new Date(request.required_by_date).toLocaleDateString() : 'Immediate'}
                </span>
              </div>
            </div>

            {request.special_instructions && (
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">Student Remarks / Instructions:</span>
                <p className="text-slate-700 mt-1 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  &ldquo;{request.special_instructions}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Warden Notes */}
          {request.warden_notes && (
            <div className="mb-6 bg-blue-50/60 rounded-xl p-4 border border-blue-100 text-xs">
              <h3 className="font-bold text-blue-900 uppercase tracking-wider text-[11px] mb-1">
                Warden Endorsement Remarks
              </h3>
              <p className="text-blue-800 leading-relaxed">{request.warden_notes}</p>
            </div>
          )}

          {/* Audit Logs */}
          {request.status_logs && request.status_logs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-slate-500" />
                <span>Audit Trail</span>
              </h3>
              <div className="space-y-2">
                {request.status_logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 capitalize">{log.status.replace('_', ' ')}</span>
                      <span className="text-slate-500 text-[11px] block sm:inline sm:ml-2">
                        by {log.changed_by_name} ({log.changed_by_email})
                      </span>
                      {log.note && <p className="text-slate-600 mt-1 italic">&ldquo;{log.note}&rdquo;</p>}
                    </div>
                    <div className="text-slate-400 font-mono text-[11px] shrink-0">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions Section */}
          {allowedActions.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Warden Decision & Execution
              </h3>

              {request.status === 'pending_approval' && showRejectionForm && (
                <div className="mb-4 bg-rose-50 rounded-xl p-4 border border-rose-200">
                  <label className="block text-xs font-bold text-rose-900 mb-1.5">
                    Decline Justification Note (Required)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="State reason for declining this room supply (e.g., student already allocated bed frame)..."
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white text-xs text-slate-900"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleTransition('rejected')}
                      disabled={transitioning || !rejectionReason.trim()}
                    >
                      {transitioning ? 'Recording...' : 'Confirm Rejection'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRejectionForm(false)}
                      disabled={transitioning}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {request.status === 'pending_approval' && !showRejectionForm && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Approval Endorsement Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Room 204 verified. Supply authorized from Block B hostel depot inventory..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    rows={2}
                  />
                </div>
              )}

              <div className="flex gap-2.5 flex-wrap">
                {allowedActions.map((btn) => (
                  <button
                    key={btn.action}
                    onClick={() => handleTransition(btn.action)}
                    disabled={transitioning}
                    className={`px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition-all ${btn.color} disabled:opacity-50`}
                  >
                    {transitioning ? 'Updating status...' : btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
