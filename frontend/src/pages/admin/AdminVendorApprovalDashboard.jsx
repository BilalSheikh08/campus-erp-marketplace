import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ShieldCheck, ArrowLeft, Store, Phone, Calendar } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchVendorApplications, approveVendor, rejectVendor } from '../../api/vendors';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
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
    if (!window.confirm('Are you sure you want to approve this vendor for campus operations?')) return;

    setIsProcessing(true);
    try {
      await approveVendor(vendorId);
      setSuccessMessage('Vendor authorized successfully. Merchant can now manage listings.');
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
      setError('Please provide a rejection justification note for audit logs');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this vendor application?')) return;

    setIsProcessing(true);
    try {
      await rejectVendor(vendorId, { reason: rejectionReason });
      setSuccessMessage('Vendor application rejected and recorded in compliance log.');
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full text-center">
          <Alert type="error" message="Access restricted to campus platform administrators." />
          <Button onClick={() => navigate('/')} className="mt-6 w-full bg-slate-900 text-white">
            Return to Homepage
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
    <div className="min-h-screen bg-slate-50 py-8 pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Governance Console
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-7 w-7 text-blue-600" />
            <span>Vendor Permits & Approvals</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review onboarding credentials, business permits, and campus concession authorizations.
          </p>
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
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setSelectedVendor(null);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === status
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'all' ? 'All Applications' : status}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List (2 cols) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4">
                Applications ({vendors.length})
              </h2>

              {vendors.length === 0 ? (
                <div className="text-center text-slate-400 py-16 text-xs">
                  <Store className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No vendor applications found</p>
                  <p className="mt-0.5 text-slate-400">No applications matching filter &ldquo;{filter}&rdquo;.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendors.map((vendor) => {
                    const isSelected = selectedVendor?.id === vendor.id;
                    return (
                      <div
                        key={vendor.id}
                        onClick={() => setSelectedVendor(vendor)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-600/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-sm text-slate-900">{vendor.business_name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {VENDOR_TYPES[vendor.vendor_type] || vendor.vendor_type}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              Applied: {new Date(vendor.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[vendor.approval_status]}`}>
                            {vendor.approval_status?.toUpperCase()}
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
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm text-xs sticky top-24">
                <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Permit Details</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[selectedVendor.approval_status]}`}>
                    {StatusIcon && <StatusIcon className="h-3.5 w-3.5" />}
                    <span className="capitalize">{selectedVendor.approval_status}</span>
                  </span>
                </div>

                <div className="space-y-4 mb-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Store / Merchant</label>
                    <p className="text-slate-900 font-bold text-sm mt-0.5">{selectedVendor.business_name}</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Concession Category</label>
                    <p className="text-slate-800 font-medium mt-0.5">{VENDOR_TYPES[selectedVendor.vendor_type] || selectedVendor.vendor_type}</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Number</label>
                    <p className="text-slate-800 font-medium mt-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {selectedVendor.contact_number || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operational Proposal</label>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1 leading-relaxed text-xs">
                      {selectedVendor.description || 'No detailed proposal submitted.'}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submitted Timestamp</label>
                    <p className="text-slate-600 mt-0.5 font-mono text-[11px]">
                      {new Date(selectedVendor.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {selectedVendor.approval_status === 'pending' && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <Button
                      onClick={() => handleApprove(selectedVendor.id)}
                      disabled={isProcessing}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      Authorize Campus Concession
                    </Button>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Decline Reason (If rejecting)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain reason for administrative log..."
                        rows="2"
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-600 bg-white text-slate-900"
                      />
                    </div>

                    <Button
                      onClick={() => handleReject(selectedVendor.id)}
                      disabled={isProcessing || !rejectionReason.trim()}
                      variant="danger"
                      className="w-full"
                    >
                      Decline Permit Application
                    </Button>
                  </div>
                )}

                {selectedVendor.approval_status === 'rejected' && selectedVendor.rejection_reason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 mt-3">
                    <strong>Rejection Reason:</strong> {selectedVendor.rejection_reason}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                <Store className="h-8 w-8 text-slate-300 mb-2" />
                Select an application from the list to inspect permit details and take action.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
