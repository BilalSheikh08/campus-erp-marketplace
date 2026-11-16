/**
 * Campus Commons - Vendor Product Editor
 * Create or update listing with domain specifications (canteen, stationery, hostel).
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';
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
  return 'Could not save the listing. Please try again.';
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

      navigate('/vendor/listings', { state: { notice: editing ? 'Listing updated successfully.' : 'New listing created successfully.' } });
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Opening product editor..." />;

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24 text-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/vendor/listings')}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {editing ? 'Edit Catalog Listing' : 'Create New Catalog Listing'}
              </h1>
              <p className="text-xs text-slate-500">
                Department: <strong className="text-slate-900 capitalize">{CATEGORY_LABELS[category] || category}</strong> ({vendor?.business_name})
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
              label="Listing Title / Product Name"
              name="title"
              value={form.title}
              onChange={update}
              placeholder="e.g. Masala Dosa with Sambar"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Price (₹)"
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={form.price}
                onChange={update}
                placeholder="e.g. 65.00"
                required
              />
              <Input
                label="SKU / Internal Identifier (Optional)"
                name="sku"
                value={form.sku}
                onChange={update}
                placeholder="e.g. CNT-DOSA-01"
              />
            </div>

            <ImageUploader
              label="Product Photo"
              value={form.image_url}
              onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={update}
                placeholder="Describe dietary info, paper quality, or room equipment specs..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition placeholder:text-slate-400"
              />
            </div>

            {/* Canteen Specific Fields */}
            {category === 'canteen' && (
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 space-y-3">
                <p className="text-xs font-bold text-orange-950 uppercase tracking-wider">Canteen Kitchen Attributes</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Preparation Time (Minutes)"
                    type="number"
                    name="prep_time_minutes"
                    value={form.prep_time_minutes}
                    onChange={update}
                    placeholder="e.g. 15"
                  />
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="is_veg"
                      name="is_veg"
                      checked={form.is_veg}
                      onChange={update}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_veg" className="text-xs font-semibold text-slate-800">
                      Vegetarian Recipe
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <Button
                type="submit"
                variant="blue"
                size="lg"
                loading={saving}
                disabled={saving}
                className="flex-1 py-3.5 rounded-2xl font-bold"
              >
                {editing ? 'Update Listing' : 'Publish to Campus Catalog'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/vendor/listings')}
                className="px-6 rounded-2xl"
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
