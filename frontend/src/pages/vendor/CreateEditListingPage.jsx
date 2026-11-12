/** Create or update a listing using the shared catalog API schema. */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createListing, fetchListingDetail, updateListing } from '../../api/listings';
import { fetchVendorProfile } from '../../api/vendors';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORY_LABELS = { canteen: 'Canteen', stationery: 'Stationery', hostel_supply: 'Hostel supply' };
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

  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const detailKey = DETAIL_KEY[category];
    const detail = category === 'canteen'
      ? { is_veg: form.is_veg, prep_time_minutes: form.prep_time_minutes || null, available_from: form.available_from || null, available_to: form.available_to || null }
      : category === 'stationery'
        ? { sku: form.sku.trim(), unit: form.unit.trim(), barcode: form.barcode.trim() || null }
        : { request_only: form.request_only, supply_category: form.supply_category.trim() };
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.price,
      image_url: form.image_url.trim() || null,
      [detailKey]: detail,
      ...(!editing && { category_type: category }),
    };
    try {
      if (editing) await updateListing(id, payload);
      else await createListing(payload);
      navigate('/vendor/listings', { state: { notice: editing ? 'Listing updated.' : 'Listing created.' } });
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading listing form…" />;
  const approved = vendor?.approval_status === 'approved';

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate('/vendor/listings')} className="mb-5 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" />Back to listings</button>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{editing ? 'Edit listing' : 'Create listing'}</h1>
        <p className="mb-7 text-gray-600">{CATEGORY_LABELS[category] || 'Marketplace'} product</p>
        {error && <div className="mb-5"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}
        {!approved && <div className="mb-5"><Alert type="error" message="Your vendor account must be approved before you can manage listings." /></div>}

        <form onSubmit={submit} className="space-y-6 rounded-lg bg-white p-6 shadow-sm sm:p-8">
          <Input label="Product title" name="title" value={form.title} onChange={change} required maxLength={150} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Price (₹)" name="price" type="number" min="0" step="0.01" value={form.price} onChange={change} required />
            <Input label="Product image URL" name="image_url" type="url" value={form.image_url} onChange={change} placeholder="Optional https://…" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="description">Description</label>
            <textarea id="description" name="description" value={form.description} onChange={change} rows={4} maxLength={5000} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          {category === 'canteen' && <div className="space-y-4 border-t pt-5">
            <h2 className="font-semibold text-gray-900">Food details</h2>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="is_veg" checked={Boolean(form.is_veg)} onChange={change} className="h-4 w-4 rounded" />Vegetarian</label>
            <Input label="Preparation time (minutes)" name="prep_time_minutes" type="number" min="1" value={form.prep_time_minutes ?? ''} onChange={change} placeholder="Optional" />
            <div className="grid gap-4 sm:grid-cols-2"><Input label="Available from" name="available_from" type="time" value={form.available_from || ''} onChange={change} /><Input label="Available until" name="available_to" type="time" value={form.available_to || ''} onChange={change} /></div>
          </div>}

          {category === 'stationery' && <div className="space-y-4 border-t pt-5">
            <h2 className="font-semibold text-gray-900">Stationery details</h2>
            <Input label="SKU" name="sku" value={form.sku} onChange={change} required maxLength={64} />
            <div className="grid gap-4 sm:grid-cols-2"><Input label="Unit (e.g. piece, pack)" name="unit" value={form.unit} onChange={change} required maxLength={30} /><Input label="Barcode" name="barcode" value={form.barcode || ''} onChange={change} placeholder="Optional" maxLength={64} /></div>
          </div>}

          {category === 'hostel_supply' && <div className="space-y-4 border-t pt-5">
            <h2 className="font-semibold text-gray-900">Hostel supply details</h2>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="request_only" checked={Boolean(form.request_only)} onChange={change} className="h-4 w-4 rounded" />Students must request this item through the warden</label>
            <Input label="Supply category" name="supply_category" value={form.supply_category || ''} onChange={change} placeholder="Optional" maxLength={100} />
          </div>}

          <div className="flex gap-3 border-t pt-5">
            <Button type="submit" disabled={saving || !approved}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create listing'}</Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/vendor/listings')}>Cancel</Button>
          </div>
        </form>
      </div>
    </main>
  );
}
