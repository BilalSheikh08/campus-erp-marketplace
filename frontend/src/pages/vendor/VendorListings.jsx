/**
 * Campus Commons - Vendor Listings Catalog Table
 * Fast stock review, price auditing, and create/edit actions.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Edit, Plus, Trash2, Store, Package } from 'lucide-react';
import { fetchListings, deleteListing } from '../../api/listings';
import { fetchVendorProfile } from '../../api/vendors';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import SafeImage from '../../components/shared/SafeImage';
import { formatPrice } from '../../utils/formatters';

const STOCK_STATUS_BADGES = {
  in_stock: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
  out_of_stock: 'bg-rose-50 text-rose-700 border-rose-200',
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

  useEffect(() => {
    loadListings();
  }, []);

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

  if (loading) return <LoadingSpinner message="Loading merchant catalog..." />;

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold mb-2">
              <Store className="h-3.5 w-3.5 text-orange-600" />
              <span>Concession Catalog</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Merchant Listings</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add products, adjust live pricing, and manage consumer visibility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/vendor/listings/new">
              <Button variant="blue" className="gap-1.5 font-bold">
                <Plus className="h-4 w-4" /> Add New Item
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError('')} />
          </div>
        )}
        {success && (
          <div className="mb-6">
            <Alert type="success" message={success} dismissible onClose={() => setSuccess('')} />
          </div>
        )}

        {listings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">No items listed yet</h2>
            <p className="text-xs text-slate-500 mb-6">
              Create your first menu item or supply listing to start receiving campus orders.
            </p>
            <Link to="/vendor/listings/new">
              <Button variant="blue" className="font-bold">
                Create First Item
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Item Snapshot</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock Status</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                            <SafeImage
                              src={l.image_url}
                              alt={l.title}
                              domain={l.category_type}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{l.title}</p>
                            <p className="text-[11px] text-slate-400 font-mono">ID: #{l.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 capitalize">
                        {l.category_type?.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 font-mono font-extrabold text-slate-900">
                        {formatPrice(l.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            STOCK_STATUS_BADGES[l.stock_status] || 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {l.stock_status?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-700">
                        {l.inventory?.quantity ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/vendor/listings/${l.id}/edit`)}
                          className="p-1.5"
                          title="Edit Listing"
                        >
                          <Edit className="h-3.5 w-3.5 text-slate-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(l)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50"
                          title="Deactivate Listing"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
