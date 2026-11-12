/** Listings owned by the signed-in vendor. */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Edit, Plus, Trash2 } from 'lucide-react';
import { fetchListings, deleteListing } from '../../api/listings';
import { fetchVendorProfile } from '../../api/vendors';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import { formatPrice } from '../../utils/formatters';

const STOCK_STATUS_COLORS = {
  in_stock: 'bg-green-100 text-green-800',
  low_stock: 'bg-yellow-100 text-yellow-800',
  out_of_stock: 'bg-red-100 text-red-800',
};

export default function VendorListings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.notice || '');

  const loadListings = async () => {
    setLoading(true);
    setError('');
    try {
      const vendor = await fetchVendorProfile();
      const result = await fetchListings({ vendor_id: vendor.id, status: 'all', page: 1, page_size: 100 });
      setListings(Array.isArray(result) ? result : result.results || []);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadListings(); }, []);

  const handleDeactivate = async (listing) => {
    if (!window.confirm(`Deactivate “${listing.title}”? It will no longer appear in the marketplace.`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteListing(listing.id);
      setListings((current) => current.filter((item) => item.id !== listing.id));
      setSuccess('Listing deactivated.');
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not deactivate this listing.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading your listings…" />;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Manage Listings</h1>
            <p className="text-gray-600">Create and maintain products for your approved vendor account.</p>
          </div>
          <Button onClick={() => navigate('/vendor/listings/new')} className="gap-2"><Plus className="h-4 w-4" />New listing</Button>
        </header>

        {error && <div className="mb-5"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}
        {success && <div className="mb-5"><Alert type="success" message={success} dismissible onClose={() => setSuccess('')} /></div>}

        <section className="overflow-hidden rounded-lg bg-white shadow-sm">
          {listings.length === 0 ? (
            <div className="py-14 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="mb-5 text-gray-600">You haven’t created any listings yet.</p>
              <Button onClick={() => navigate('/vendor/listings/new')}>Create your first listing</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50"><tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr></thead>
                <tbody className="divide-y">
                  {listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><p className="font-medium text-gray-900">{listing.title}</p><p className="text-xs capitalize text-gray-500">{listing.category_type?.replace('_', ' ')}</p></td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatPrice(listing.price)}</td>
                      <td className="px-4 py-3 text-sm"><span className={`rounded px-2 py-1 text-xs font-medium ${STOCK_STATUS_COLORS[listing.stock_status] || 'bg-gray-100 text-gray-700'}`}>{listing.stock_status?.replace('_', ' ').toUpperCase() || '—'}</span></td>
                      <td className="px-4 py-3 text-sm capitalize text-gray-700">{listing.status?.replace('_', ' ')}</td>
                      <td className="px-4 py-3"><div className="flex justify-end gap-2">
                        <button type="button" onClick={() => navigate(`/vendor/listings/${listing.id}/edit`)} className="rounded p-2 hover:bg-gray-100" title="Edit listing" aria-label={`Edit ${listing.title}`}><Edit className="h-4 w-4 text-blue-600" /></button>
                        {listing.status === 'active' && <button type="button" onClick={() => handleDeactivate(listing)} className="rounded p-2 hover:bg-gray-100" title="Deactivate listing" aria-label={`Deactivate ${listing.title}`}><Trash2 className="h-4 w-4 text-red-600" /></button>}
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
