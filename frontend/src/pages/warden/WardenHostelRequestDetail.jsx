/**
 * Campus Commons - Warden Requisition Dossier
 * Residence Hall Superintendent Requisition Inspection Sheet:
 * Resident room audit, equipment specs, official warden remarks, and approval/rejection panel.
 */

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
  submitted: { label: 'Submitted', color: 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]', icon: Clock },
  pending_approval: { label: 'Pending Warden Approval', color: 'bg-amber-50 text-amber-900 border-amber-300', icon: AlertCircle },
  approved: { label: 'Approved by Warden', color: 'bg-emerald-50 text-emerald-900 border-emerald-300', icon: CheckCircle },
  rejected: { label: 'Declined', color: 'bg-rose-50 text-rose-900 border-rose-300', icon: XCircle },
  fulfilled: { label: 'Fulfilled & Issued', color: 'bg-blue-50 text-blue-900 border-blue-300', icon: Package },
  cancelled: { label: 'Cancelled by Student', color: 'bg-[#FAF8F3] text-zinc-500 border-[#E4DDCF]', icon: X },
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
      actions.push({ action: 'approved', label: 'Authorize & Issue Approval Stamp', color: 'bg-emerald-800 hover:bg-emerald-900 text-white' });
      actions.push({ action: 'rejected', label: 'Decline Requisition', color: 'bg-rose-800 hover:bg-rose-900 text-white' });
    }
    if (request.status === 'approved') {
      actions.push({ action: 'fulfilled', label: 'Confirm Physical Issue to Room', color: 'bg-blue-900 hover:bg-blue-950 text-white' });
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
    return <LoadingSpinner message="Consulting requisition docket..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] py-10 px-4 font-sans">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/warden/requests')}
            className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-950 mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Requisitions</span>
          </button>
          <div className="bg-red-50 border border-red-200 rounded p-5 text-xs text-red-800 font-mono">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] py-16 px-4 text-center font-sans">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-[#E4DDCF]">
          <p className="text-sm font-serif font-bold text-zinc-900">Hostel requisition not found.</p>
          <Button onClick={() => navigate('/warden/requests')} className="mt-4 text-xs font-bold">
            Return to Requisitions
          </Button>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[request.status] || {
    label: request.status_display || request.status,
    color: 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]',
    icon: Clock,
  };
  const allowedActions = getAllowedActions();
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/warden/requests')}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Requisitions Queue</span>
        </button>

        <div className="bg-white rounded-lg border border-[#E4DDCF] shadow-xs p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 pb-5 border-b border-[#E4DDCF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                  REQUISITION DOSSIER
                </span>
                <span>•</span>
                <span className="font-mono text-xs font-bold text-zinc-950">
                  #{request.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950 tracking-tight mt-1">
                Room Supply Requisition Review
              </h1>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5 font-mono">
                <Calendar className="h-3 w-3 text-zinc-400" />
                <span>Submitted on {new Date(request.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </p>
            </div>
            {StatusIcon && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border ${status.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{status.label}</span>
              </span>
            )}
          </div>

          {/* Student & Assigned Warden Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded border border-[#E4DDCF] bg-[#FAF8F3]">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Applying Resident Student
              </span>
              <div className="font-serif font-bold text-zinc-950 text-base flex items-center gap-2">
                <User className="h-4 w-4 text-zinc-700" />
                <span>{request.student_name}</span>
              </div>
              <p className="text-xs font-mono text-zinc-500 mt-0.5">{request.student_email}</p>
              <div className="mt-2.5 pt-2 border-t border-[#E4DDCF] text-xs font-mono text-zinc-700">
                Residence: <strong className="text-zinc-950">Room {request.room_number || 'N/A'}, Hall {request.hostel_block || 'A'}</strong>
              </div>
            </div>

            <div className="p-4 rounded border border-[#E4DDCF] bg-[#FAF8F3]">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Superintendent Authority
              </span>
              <div className="font-serif font-bold text-zinc-950 text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-zinc-700" />
                <span>{request.warden_name || 'Chief Residence Warden'}</span>
              </div>
              <p className="text-xs font-mono text-zinc-500 mt-0.5">{request.warden_email || 'warden@campus.edu'}</p>
              <div className="mt-2.5 pt-2 border-t border-[#E4DDCF] text-xs font-mono text-zinc-700">
                Department: <strong className="text-zinc-950">Campus Residential Logistics</strong>
              </div>
            </div>
          </div>

          {/* Requisition Specs */}
          <div className="mb-6 rounded border border-[#E4DDCF] p-5 bg-white">
            <h3 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-zinc-500" />
              <span>Requisition Specification</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-zinc-400 block mb-0.5 text-[10px] uppercase">Requested Item</span>
                <span className="font-serif font-bold text-zinc-950 text-sm block">{request.listing_title}</span>
                <span className="text-zinc-500 block mt-0.5">₹{request.listing_price} unit rate</span>
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5 text-[10px] uppercase">Requested Volume</span>
                <span className="font-bold text-zinc-950 text-sm block">{request.quantity} units</span>
                <span className="text-emerald-800 font-semibold block mt-0.5">Total Value: ₹{request.total_value}</span>
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5 text-[10px] uppercase">Required By Date</span>
                <span className="font-semibold text-zinc-800 text-sm block">
                  {request.required_by_date ? new Date(request.required_by_date).toLocaleDateString() : 'Immediate Allocation'}
                </span>
              </div>
            </div>

            {request.special_instructions && (
              <div className="mt-4 pt-3 border-t border-[#E4DDCF] text-xs font-sans">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Student Reason / Declaration:</span>
                <p className="text-zinc-800 mt-1 italic bg-[#FAF8F3] p-3 rounded border border-[#E4DDCF] leading-relaxed">
                  &ldquo;{request.special_instructions}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Warden Notes */}
          {request.warden_notes && (
            <div className="mb-6 bg-blue-50/60 rounded border border-blue-200 p-4 text-xs font-sans">
              <h3 className="font-mono font-bold text-blue-900 uppercase tracking-wider text-[10px] mb-1">
                Warden Endorsement Remarks
              </h3>
              <p className="text-blue-950 leading-relaxed">{request.warden_notes}</p>
            </div>
          )}

          {/* Audit Logs */}
          {request.status_logs && request.status_logs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-zinc-500" />
                <span>Audit &amp; Action Log</span>
              </h3>
              <div className="space-y-2">
                {request.status_logs.map((log) => (
                  <div key={log.id} className="p-3 bg-[#FAF8F3] rounded border border-[#E4DDCF] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-zinc-950 uppercase text-[11px]">{log.status.replace('_', ' ')}</span>
                      <span className="text-zinc-500 text-[11px] font-mono block sm:inline sm:ml-2">
                        by {log.changed_by_name} ({log.changed_by_email})
                      </span>
                      {log.note && <p className="text-zinc-700 mt-1 italic font-sans">&ldquo;{log.note}&rdquo;</p>}
                    </div>
                    <div className="text-zinc-400 font-mono text-[10px] shrink-0">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Actions Section */}
          {allowedActions.length > 0 && (
            <div className="mt-8 pt-5 border-t border-[#E4DDCF]">
              <h3 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-3">
                Superintendent Decision &amp; Execution
              </h3>

              {request.status === 'pending_approval' && showRejectionForm && (
                <div className="mb-4 bg-rose-50/70 rounded border border-rose-200 p-4">
                  <label className="block text-xs font-mono font-bold text-rose-900 mb-1.5 uppercase">
                    Decline Justification Note (Required)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="State administrative reason for declining this room supply (e.g. resident already reached maximum quota)..."
                    className="w-full px-3 py-2 border border-rose-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white text-xs text-zinc-900 font-sans"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleTransition('rejected')}
                      disabled={transitioning || !rejectionReason.trim()}
                      className="text-xs font-bold font-mono"
                    >
                      {transitioning ? 'Recording...' : 'Confirm Rejection'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRejectionForm(false)}
                      disabled={transitioning}
                      className="text-xs font-mono"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {request.status === 'pending_approval' && !showRejectionForm && (
                <div className="mb-4">
                  <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Approval Endorsement Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Room 204 verified in hall register. Authorized for release from Block A depot..."
                    className="w-full px-3 py-2 border border-[#E4DDCF] rounded bg-white text-xs text-zinc-900 focus:outline-none focus:border-blue-900 font-sans"
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
                    className={`px-4 py-2 text-xs font-mono font-bold rounded shadow-xs transition-all ${btn.color} disabled:opacity-50 cursor-pointer`}
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
