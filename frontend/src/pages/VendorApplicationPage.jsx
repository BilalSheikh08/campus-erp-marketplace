/**
 * Campus Commons - Vendor Concessionaire Application
 * Students and merchants applying for campus vending permits.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, CheckCircle, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { applyAsVendor, fetchVendorProfile } from '../api/vendors';
import Alert from '../components/shared/Alert';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';

const VENDOR_TYPES = [
  { value: 'canteen', label: 'Canteen Dining - Meals, Snacks & Beverages' },
  { value: 'stationery', label: 'Academic Stationery - Blue Books & Drafters' },
  { value: 'hostel_supply', label: 'Hostel Logistics - Room Necessities' },
];

export default function VendorApplicationPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [step, setStep] = useState('form');
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
    const checkExistingApplication = async () => {
      try {
        const vendor = await fetchVendorProfile();
        setExistingVendor(vendor);
        setStep('existing');
      } catch {
        setStep('form');
      }
    };

    if (user?.role === 'student') {
      checkExistingApplication();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await applyAsVendor(formData);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit vendor application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm">
          <Store className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-xs text-slate-500 mb-6">
            Please sign in to your student account to apply for a campus vendor permit.
          </p>
          <Button variant="blue" onClick={() => navigate('/login')} className="w-full font-bold">
            Sign In Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 pb-6 border-b border-slate-200 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Commercial Concession Licensing</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Apply as Campus Merchant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Operate official canteen stalls, sell examination supplies, or manage hostel equipment.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {step === 'existing' && existingVendor && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <Store className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Application Already on File</h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              You have an active permit application for <strong>{existingVendor.business_name}</strong> under review by University Administration.
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Business Unit:</span>
                <span className="font-bold text-slate-900">{existingVendor.business_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Concession Category:</span>
                <span className="font-semibold text-slate-900 capitalize">{existingVendor.vendor_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-amber-600 capitalize">{existingVendor.status || 'Pending Review'}</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full font-bold">
              Return to Homepage
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Permit Application Submitted!</h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-6">
              University administrators will review your credentials and business details. You will receive an alert once approved.
            </p>
            <Button variant="blue" onClick={() => navigate('/')} className="w-full font-bold">
              Back to Campus Commons
            </Button>
          </div>
        )}

        {step === 'form' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Commercial Stall / Business Name"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="e.g. Campus Corner Cafe"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Concession Domain
                </label>
                <select
                  name="vendor_type"
                  value={formData.vendor_type}
                  onChange={handleChange}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                >
                  {VENDOR_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Direct Counter Phone Number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Business Description &amp; Offerings
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detail your menu items, preparation times, or equipment quality..."
                  required
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition placeholder:text-slate-400"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="blue"
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl font-bold"
                >
                  Submit Vending Permit Application
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
