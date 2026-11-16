/**
 * Campus Commons - Vendor Concessionaire Application
 * Commercial Concession Licensing Desk:
 * Apply for campus commercial merchant permits and dining concession authorisations.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, CheckCircle, Sparkles, Building2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { applyAsVendor, fetchVendorProfile } from '../api/vendors';
import Alert from '../components/shared/Alert';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';

const VENDOR_TYPES = [
  { value: 'canteen', label: 'Canteen Dining - Meals, Snacks & Kitchen Pre-Orders' },
  { value: 'stationery', label: 'Academic Stationery - Blue Books, Logbooks & Drafting Sets' },
  { value: 'hostel_supply', label: 'Hostel Logistics - Room Necessities & Bedding' },
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
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center px-4 font-sans">
        <div className="bg-white p-8 rounded-lg border border-[#E4DDCF] text-center max-w-md shadow-xs">
          <Store className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <h2 className="font-serif font-bold text-lg text-zinc-950 mb-1">Authentication Required</h2>
          <p className="text-xs text-zinc-600 mb-6 font-sans">
            Please sign in to your student account to apply for a commercial campus vending permit.
          </p>
          <Button variant="primary" onClick={() => navigate('/login')} className="w-full text-xs font-mono font-bold">
            Sign In Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 pb-5 border-b border-[#E4DDCF] text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-zinc-700" />
            <span>COMMERCIAL CONCESSION LICENSING</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
            Apply for Campus Merchant Permit
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-lg mx-auto font-sans">
            Register your dining outlet, stationery counter, or student service to begin accepting campus pre-orders.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {step === 'existing' && existingVendor && (
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded bg-[#FAF8F3] border border-[#E4DDCF] text-zinc-700 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="font-serif font-bold text-lg text-zinc-950 mb-1">Application on Record</h2>
            <p className="text-xs text-zinc-600 mb-4 font-sans">
              You have already registered an application for <strong>{existingVendor.business_name}</strong>.
            </p>
            <div className="inline-block px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border border-amber-300 bg-amber-50 text-amber-900 mb-6">
              Status: {existingVendor.approval_status}
            </div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto font-sans leading-relaxed">
              Your permit application is currently being evaluated by the campus concessions committee. You will be notified once reviewed.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h2 className="font-serif font-bold text-lg text-zinc-950 mb-1">Permit Application Submitted</h2>
            <p className="text-xs text-zinc-600 mb-6 font-sans">
              Your commercial concession request has been received by the Central Registrar.
            </p>
            <Button variant="primary" onClick={() => navigate('/')} className="text-xs font-mono font-bold">
              Return to Campus Home
            </Button>
          </div>
        )}

        {step === 'form' && (
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Commercial Entity / Concession Name"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="e.g. South Campus Brew & Bagel Co."
                required
              />

              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Concession Domain
                </label>
                <select
                  name="vendor_type"
                  value={formData.vendor_type}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 rounded border border-[#E4DDCF] bg-white text-zinc-900 focus:outline-none focus:border-blue-900 font-mono"
                >
                  {VENDOR_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Primary Contact Phone"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
              />

              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Operational Proposal &amp; Menu Overview
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Outline your planned menu items, pricing structure, kitchen hygiene standards, and physical counter operating hours..."
                  className="w-full text-xs px-3 py-2 rounded border border-[#E4DDCF] bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-colors placeholder:text-zinc-400 font-sans leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full text-xs font-mono font-bold py-2.5"
                >
                  Submit Commercial Permit Dossier
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
