/**
 * Campus Commons - Vendor Applications & Permits Console
 * Central Registrar Concessionaire Licensing Desk:
 * Review credentials, operational proposals, and authorize / decline campus concession permits.
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ShieldCheck, ArrowLeft, Store, Phone, Calendar, RefreshCw } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchVendorApplications, approveVendor, rejectVendor } from '../../api/vendors';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-900 border-amber-300',
  approved: 'bg-emerald-50 text-emerald-900 border-emerald-300',
  rejected: 'bg-rose-50 text-rose-900 border-rose-300',
};

const STATUS_ICONS = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

const VENDOR_TYPES = {
  canteen: 'Canteen Dining Concession',
  stationery: 'Academic Stationery Depot',
  hostel_supply: 'Hostel Requisition Supplies',
};

export default function AdminVendorApprovalDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadVendors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = filter !== 'all' ? { approval_status: filter } : {};
      const data = await fetchVendorApplications(params);
      setVendors(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load vendor applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (vendorId) => {
    if (!window.confirm('Authorize this vendor for campus commercial operations?')) return;

    setIsProcessing(true);
    try {
      await approveVendor(vendorId);
      setSuccessMessage('Vendor authorized successfully. Concessionaire permit issued.');
      setTimeout(() => setSuccessMessage(null), 3000);
      setSelectedVendor(null);
      loadVendors();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve vendor');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (vendorId) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection justification note for compliance audit records.');
      return;
    }

    if (!window.confirm('Reject this vendor permit application?')) return;

    setIsProcessing(true);
    try {
      await rejectVendor(vendorId, { reason: rejectionReason });
      setSuccessMessage('Vendor application rejected and recorded in compliance registry.');
      setTimeout(() => setSuccessMessage(null), 3000);
      setSelectedVendor(null);
      setRejectionReason('');
      loadVendors();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reject vendor');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-lg border border-[#E4DDCF] max-w-md w-full text-center shadow-xs">
          <Alert type="error" message="Access restricted to campus platform administrators." />
          <Button onClick={() => navigate('/')} className="mt-6 w-full text-xs font-mono font-bold">
            Return to Directory
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Auditing vendor concession applications..." />;
  }

  const StatusIcon = selectedVendor ? STATUS_ICONS[selectedVendor.approval_status] : null;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-700" />
              <span>CENTRAL REGISTRAR · CONCESSIONAIRE PERMITS &amp; LICENSING</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              Vendor Permits &amp; Approvals
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm mt-1 font-sans">
              Review commercial onboarding proposals, examine vendor credentials, and issue campus permits.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/admin/dashboard">
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Governance Console</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={loadVendors}
              className="text-xs p-2"
              title="Refresh ledger"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}
        {successMessage && (
          <div className="mb-4">
            <Alert type="success" message={successMessage} dismissible onClose={() => setSuccessMessage(null)} />
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 font-mono">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setSelectedVendor(null);
              }}
              className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                filter === status
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'bg-white border border-[#E4DDCF] text-zinc-700 hover:bg-[#FAF8F3]'
              }`}
            >
              {status === 'all' ? 'All Applications' : `${status.toUpperCase()} PERMITS`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List (2 cols) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-[#E4DDCF] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E4DDCF]">
                <h2 className="font-serif font-bold text-sm text-zinc-950">
                  Registered Applications ({vendors.length})
                </h2>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Filter: {filter}
                </span>
              </div>

              {vendors.length === 0 ? (
                <div className="text-center text-zinc-400 py-16 text-xs">
                  <Store className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
                  <p className="font-serif font-bold text-zinc-700 text-sm">No vendor applications recorded</p>
                  <p className="mt-0.5 text-zinc-500 font-sans">No submissions match the current filter selection &ldquo;{filter}&rdquo;.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendors.map((vendor) => {
                    const isSelected = selectedVendor?.id === vendor.id;
                    return (
                      <div
                        key={vendor.id}
                        onClick={() => setSelectedVendor(vendor)}
                        className={`p-4 border rounded cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-900 bg-blue-50/30 ring-1 ring-blue-900/20'
                            : 'border-[#E4DDCF] bg-white hover:bg-[#FAF8F3]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-serif font-bold text-sm text-zinc-950">{vendor.business_name}</h3>
                            <p className="text-xs text-zinc-600 mt-0.5 font-sans">
                              {VENDOR_TYPES[vendor.vendor_type] || vendor.vendor_type}
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5 font-mono">
                              <Calendar className="h-3 w-3 text-zinc-400" />
                              <span>Applied: {new Date(vendor.created_at).toLocaleDateString()}</span>
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${STATUS_COLORS[vendor.approval_status]}`}>
                            {vendor.approval_status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Details Panel (1 col) */}
          <div>
            {selectedVendor ? (
              <div className="bg-white rounded-lg border border-[#E4DDCF] p-5 shadow-xs text-xs sticky top-24 font-sans">
                <div className="mb-4 flex items-center justify-between pb-3 border-b border-[#E4DDCF]">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Permit Dossier</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${STATUS_COLORS[selectedVendor.approval_status]}`}>
                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                    <span>{selectedVendor.approval_status}</span>
                  </span>
                </div>

                <div className="space-y-4 mb-5">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">Concession Entity</label>
                    <p className="font-serif font-bold text-base text-zinc-950 mt-0.5">{selectedVendor.business_name}</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">Operational Category</label>
                    <p className="text-zinc-800 font-semibold mt-0.5">{VENDOR_TYPES[selectedVendor.vendor_type] || selectedVendor.vendor_type}</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">Official Contact</label>
                    <p className="text-zinc-800 font-mono mt-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-zinc-400" />
                      <span>{selectedVendor.contact_number || 'Not provided'}</span>
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">Operational Proposal</label>
                    <p className="text-zinc-700 bg-[#FAF8F3] p-3 rounded border border-[#E4DDCF] mt-1 leading-relaxed text-xs">
                      {selectedVendor.description || 'No detailed proposal submitted.'}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">Registration Timestamp</label>
                    <p className="text-zinc-600 mt-0.5 font-mono text-[11px]">
                      {new Date(selectedVendor.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {selectedVendor.approval_status === 'pending' && (
                  <div className="space-y-3 pt-4 border-t border-[#E4DDCF]">
                    <Button
                      onClick={() => handleApprove(selectedVendor.id)}
                      disabled={isProcessing}
                      variant="primary"
                      className="w-full text-xs font-mono font-bold py-2.5"
                    >
                      Authorize Campus Concession
                    </Button>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-700 mb-1">
                        Decline Justification (If Rejecting)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain reason for administrative compliance log..."
                        rows="2"
                        className="w-full text-xs p-2.5 border border-[#E4DDCF] rounded focus:outline-none focus:border-red-600 bg-white text-zinc-900 font-sans"
                      />
                    </div>

                    <Button
                      onClick={() => handleReject(selectedVendor.id)}
                      disabled={isProcessing || !rejectionReason.trim()}
                      variant="outline"
                      className="w-full text-xs font-mono text-red-700 border-red-300 hover:bg-red-50"
                    >
                      Decline Permit Application
                    </Button>
                  </div>
                )}

                {selectedVendor.approval_status === 'rejected' && selectedVendor.rejection_reason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900 mt-3 font-mono">
                    <strong>Rejection Reason:</strong> {selectedVendor.rejection_reason}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-dashed border-[#E4DDCF] p-8 text-center text-xs text-zinc-400 flex flex-col items-center justify-center font-sans">
                <Store className="h-8 w-8 text-zinc-300 mb-2" />
                Select an application from the registry to inspect permit credentials.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
