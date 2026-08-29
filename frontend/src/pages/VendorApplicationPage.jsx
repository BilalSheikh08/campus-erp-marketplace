/**
 * Vendor application page - students can apply to become vendors.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AlertCircle, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { applyAsVendor, fetchVendorProfile } from '../api/vendors';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/shared/Alert';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';

const VENDOR_TYPES = [
  { value: 'canteen', label: 'Canteen - Food & Beverages' },
  { value: 'stationery', label: 'Stationery - Books & Supplies' },
  { value: 'hostel_supply', label: 'Hostel Supply - Essentials' },
];

export default function VendorApplicationPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [step, setStep] = useState('form'); // form, loading, success, error
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [existingVendor, setExistingVendor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    business_name: '',
    vendor_type: 'canteen',
    description: '',
    contact_number: '',
  });

  useEffect(() => {
    // Check if user already has a vendor application
    const checkExistingApplication = async () => {
      try {
        const vendor = await fetchVendorProfile();
        setExistingVendor(vendor);
        setHasExistingApplication(true);
        setStep('existing');
      } catch (err) {
        // No existing vendor profile - user can apply
        setStep('form');
      }
    };

    if (user?.role === 'student') {
      checkExistingApplication();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await applyAsVendor(formData);
      setExistingVendor(result);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit application');
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (user.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Alert type="error" message="Only students can apply to become vendors." />
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Vendor</h1>
          <p className="text-gray-600">Apply to start selling on Campus ERP Marketplace</p>
        </div>

        {/* Existing Application */}
        {step === 'existing' && existingVendor && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Application Submitted</h2>
                <p className="text-gray-600 mt-1">You already have a vendor application</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Business Name</label>
                <p className="text-lg text-gray-900 mt-1">{existingVendor.business_name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Business Type</label>
                <p className="text-lg text-gray-900 mt-1">
                  {VENDOR_TYPES.find(t => t.value === existingVendor.vendor_type)?.label}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    existingVendor.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                    existingVendor.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {existingVendor.approval_status?.charAt(0).toUpperCase() + existingVendor.approval_status?.slice(1)}
                  </span>
                </div>
              </div>

              {existingVendor.approval_status === 'approved' && (
                <Alert
                  type="success"
                  message="Congratulations! Your vendor application has been approved. You can now create listings."
                />
              )}

              {existingVendor.approval_status === 'rejected' && existingVendor.rejection_reason && (
                <Alert
                  type="error"
                  message={`Application rejected: ${existingVendor.rejection_reason}`}
                />
              )}

              {existingVendor.approval_status === 'pending' && (
                <Alert
                  type="info"
                  message="Your application is under review. We'll notify you once a decision is made."
                />
              )}
            </div>

            <Button onClick={() => navigate('/')} variant="ghost" className="w-full">
              Back Home
            </Button>
          </div>
        )}

        {/* Application Form */}
        {step === 'form' && !hasExistingApplication && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            {error && (
              <div className="mb-6">
                <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Business Name"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="e.g., ABC Canteen"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  name="vendor_type"
                  value={formData.vendor_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  {VENDOR_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your business..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <Input
                label="Contact Number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="e.g., +91-9876543210"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Once approved, you&apos;ll be able to create and manage product listings, track orders, and build your vendor store.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Success State */}
        {step === 'success' && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your application. Our team will review it and get back to you soon.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Return Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
