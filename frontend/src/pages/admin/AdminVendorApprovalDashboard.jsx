/**
 * Admin vendor approval dashboard - approve/reject vendor applications.
 */

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchVendorApplications, approveVendor, rejectVendor } from '../../api/vendors';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const STATUS_ICONS = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

const VENDOR_TYPES = {
  canteen: 'Canteen',
  stationery: 'Stationery',
  hostel_supply: 'Hostel Supply',
};

export default function AdminVendorApprovalDashboard() {
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
    if (!window.confirm('Are you sure you want to approve this vendor?')) return;

    setIsProcessing(true);
    try {
      await approveVendor(vendorId);
      setSuccessMessage('Vendor approved successfully');
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
      setError('Please provide a rejection reason');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this vendor?')) return;

    setIsProcessing(true);
    try {
      await rejectVendor(vendorId, { reason: rejectionReason });
      setSuccessMessage('Vendor rejected');
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Alert type="error" message="Access denied. Admin only." />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading vendor applications..." />;
  }

  const StatusIcon = selectedVendor ? STATUS_ICONS[selectedVendor.approval_status] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Applications</h1>
          <p className="text-gray-600">Review and approve vendor applications</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}
        {successMessage && (
          <div className="mb-6">
            <Alert type="success" message={successMessage} dismissible onClose={() => setSuccessMessage(null)} />
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map(status => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setSelectedVendor(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {vendors.length === 0 ? (
                <p className="text-center text-gray-600 py-12">No vendor applications found</p>
              ) : (
                <div className="space-y-4">
                  {vendors.map(vendor => (
                    <div
                      key={vendor.id}
                      onClick={() => setSelectedVendor(vendor)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedVendor?.id === vendor.id
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{vendor.business_name}</h3>
                          <p className="text-sm text-gray-600">{VENDOR_TYPES[vendor.vendor_type]}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(vendor.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[vendor.approval_status]}`}>
                          {vendor.approval_status?.charAt(0).toUpperCase() + vendor.approval_status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          {selectedVendor && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${STATUS_COLORS[selectedVendor.approval_status]}`}>
                  {StatusIcon && <StatusIcon className="h-6 w-6" />}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Business Name</label>
                  <p className="text-gray-900 mt-1">{selectedVendor.business_name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="text-gray-900 mt-1">{VENDOR_TYPES[selectedVendor.vendor_type]}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Contact</label>
                  <p className="text-gray-900 mt-1">{selectedVendor.contact_number || '—'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900 mt-1">{selectedVendor.description || '—'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Applied On</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedVendor.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedVendor.approval_status === 'pending' && (
                <div className="space-y-4">
                  <Button
                    onClick={() => handleApprove(selectedVendor.id)}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Approve Vendor
                  </Button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why you're rejecting this application..."
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <Button
                    onClick={() => handleReject(selectedVendor.id)}
                    disabled={isProcessing || !rejectionReason.trim()}
                    variant="danger"
                    className="w-full"
                  >
                    Reject Vendor
                  </Button>
                </div>
              )}

              {selectedVendor.approval_status === 'rejected' && selectedVendor.rejection_reason && (
                <Alert
                  type="info"
                  message={`Rejection reason: ${selectedVendor.rejection_reason}`}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
