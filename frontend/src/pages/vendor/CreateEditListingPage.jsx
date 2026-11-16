/**
 * Campus Commons - Vendor Product Specification Sheet
 * University Concession Docket Entry:
 * Structured form with domain-specific metadata (kitchen preparation times, stationery specs, hostel guidelines).
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Store, FileText } from 'lucide-react';
import { createListing, fetchListingDetail, updateListing } from '../../api/listings';
import { fetchVendorProfile } from '../../api/vendors';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import ImageUploader from '../../components/shared/ImageUploader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORY_LABELS = { canteen: 'Canteen Dining', stationery: 'Academic Stationery', hostel_supply: 'Hostel Supplies' };
const DETAIL_KEY = { canteen: 'canteen_detail', stationery: 'stationery_detail', hostel_supply: 'hostel_supply_detail' };
const INITIAL_FORM = {
  title: '', description: '', price: '', image_url: '',
  is_veg: true, prep_time_minutes: '', available_from: '', available_to: '',
  sku: '', unit: 'piece', barcode: '', request_only: false, supply_category: '',
};

const getError = (error) => {
  const data = error.response?.data;
  if (typeof data?.detail === 'string') return data.detail;
  if (data && typeof data === 'object') return Object.values(data).flat().join(' ');
  return 'Could not save the listing. Please verify the entered data.';
};

export default function CreateEditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [vendor, setVendor] = useState(null);
  const [category, setCategory] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const profile = await fetchVendorProfile();
        if (!active) return;
        setVendor(profile);
        if (!editing) {
          setCategory(profile.vendor_type);
          return;
        }
        const listing = await fetchListingDetail(id);
        if (!active) return;
        const detail = listing[DETAIL_KEY[listing.category_type]] || {};
        setCategory(listing.category_type);
        setForm({ ...INITIAL_FORM, ...listing, ...detail, price: String(listing.price || ''), image_url: listing.image_url || '' });
      } catch (requestError) {
        if (active) setError(getError(requestError));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [editing, id]);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        image_url: form.image_url.trim(),
        category_type: category,
      };

      if (category === 'canteen') {
        payload.canteen_detail = {
          is_vegetarian: form.is_veg,
          prep_time_minutes: form.prep_time_minutes ? Number(form.prep_time_minutes) : null,
          available_from: form.available_from || null,
          available_to: form.available_to || null,
        };
      } else if (category === 'stationery') {
        payload.stationery_detail = {
          brand: form.sku || null,
          paper_type: form.unit || null,
          is_exam_approved: true,
        };
      } else if (category === 'hostel_supply') {
        payload.hostel_supply_detail = {
          requires_approval: form.request_only,
          max_per_student: 2,
        };
      }

      if (editing) {
        await updateListing(id, payload);
      } else {
        await createListing(payload);
      }

      navigate('/vendor/listings', { state: { notice: editing ? 'Listing updated successfully.' : 'New listing published to campus catalog.' } });
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Consulting concession registry..." />;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/vendor/listings')}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Concession Catalog</span>
        </button>

        <div className="bg-white rounded-lg border border-[#E4DDCF] p-6 sm:p-8 shadow-xs">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-[#E4DDCF]">
            <div className="w-10 h-10 rounded bg-[#FAF8F3] text-zinc-800 flex items-center justify-center border border-[#E4DDCF]">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                <FileText className="h-3 w-3" />
                <span>SPECIFICATION DOSSIER · {CATEGORY_LABELS[category] || category}</span>
              </div>
              <h1 className="font-serif text-2xl font-normal text-zinc-950 tracking-tight">
                {editing ? 'Modify Catalog Entry' : 'Register New Concession Item'}
              </h1>
              <p className="text-xs text-zinc-600 mt-0.5 font-sans">
                Vendor: <strong className="text-zinc-900">{vendor?.business_name || 'Concession Desk'}</strong>
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} dismissible onClose={() => setError('')} />
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Item Title / Concession Nomenclature"
              name="title"
              value={form.title}
              onChange={update}
              placeholder="e.g. Masala Dosa with Chutney & Sambar"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Physical Counter Rate (₹)"
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={form.price}
                onChange={update}
                placeholder="65.00"
                required
              />
              <Input
                label="SKU / Stock Reference (Optional)"
                name="sku"
                value={form.sku}
                onChange={update}
                placeholder="CNT-MEAL-04"
              />
            </div>

            <ImageUploader
              label="Reference Photo"
              value={form.image_url}
              onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
            />

            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                Specification &amp; Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={update}
                placeholder="Specify ingredients, dietary declarations, page counts, or equipment allocation terms..."
                className="w-full text-xs px-3 py-2 rounded border border-[#E4DDCF] bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-colors placeholder:text-zinc-400 font-sans leading-relaxed"
              />
            </div>

            {/* Canteen Specific Fields */}
            {category === 'canteen' && (
              <div className="p-4 rounded border border-[#E4DDCF] bg-[#FAF8F3] space-y-3">
                <p className="text-[10px] font-mono font-bold text-zinc-700 uppercase tracking-wider">Kitchen &amp; Preparation Parameters</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Estimated Kitchen Prep Time (Minutes)"
                    type="number"
                    name="prep_time_minutes"
                    value={form.prep_time_minutes}
                    onChange={update}
                    placeholder="12"
                  />
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="is_veg"
                      name="is_veg"
                      checked={form.is_veg}
                      onChange={update}
                      className="rounded border-[#E4DDCF] text-blue-900 focus:ring-blue-900"
                    />
                    <label htmlFor="is_veg" className="text-xs font-semibold text-zinc-800">
                      Certified Vegetarian Recipe
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={saving}
                disabled={saving}
                className="flex-1 py-2.5 rounded text-xs font-bold"
              >
                {editing ? 'Save Changes' : 'Authorize & Publish to Catalog'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate('/vendor/listings')}
                className="px-6 rounded text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
