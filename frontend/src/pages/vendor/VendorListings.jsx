/**
 * Campus Commons - Vendor Listings Catalog Table
 * University Merchant Concession Ledger:
 * Precise price auditing, stock status stamps, itemized catalog index, and item actions.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Edit, Plus, Trash2, Store, Package, ArrowLeft, RefreshCw } from 'lucide-react';
import { fetchListings, deleteListing } from '../../api/listings';
import { fetchVendorProfile } from '../../api/vendors';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import SafeImage from '../../components/shared/SafeImage';
import { formatPrice } from '../../utils/formatters';

const STOCK_STATUS_BADGES = {
  in_stock: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  low_stock: 'bg-amber-50 text-amber-800 border-amber-300',
  out_of_stock: 'bg-rose-50 text-rose-800 border-rose-300',
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

  if (loading) return <LoadingSpinner message="Consulting merchant concession catalog..." />;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <Store className="h-3.5 w-3.5 text-zinc-700" />
              <span>MERCHANT DISPATCH · CONCESSION CATALOG LEDGER</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              Counter Listings &amp; Menu
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm mt-1 font-sans">
              Manage live pricing, stock allocations, and public consumer availability across your concession.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/vendor/dashboard">
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Order Desk</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={loadListings}
              className="text-xs p-2"
              title="Refresh ledger"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Link to="/vendor/listings/new">
              <Button variant="primary" size="sm" className="text-xs flex items-center gap-1.5 font-bold">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
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
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-12 text-center shadow-xs max-w-lg mx-auto">
            <Package className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <h2 className="font-serif text-lg font-bold text-zinc-900 mb-1">No items registered in catalog</h2>
            <p className="text-xs text-zinc-600 mb-6 leading-relaxed font-sans">
              Register your first meal concession, stationery pack, or equipment listing to begin processing campus requests.
            </p>
            <Link to="/vendor/listings/new">
              <Button variant="primary" size="md" className="font-bold text-xs">
                Create First Item
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#E4DDCF] overflow-hidden shadow-xs">
            <div className="px-5 py-3 bg-[#FAF8F3] border-b border-[#E4DDCF] flex items-center justify-between text-xs font-mono font-bold text-zinc-700 uppercase tracking-wider">
              <span>Registered Concession Items ({listings.length})</span>
              <span className="text-[11px] text-zinc-500 lowercase font-normal">showing all active &amp; pending entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F3] border-b border-[#E4DDCF] text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Concession Item</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Counter Rate</th>
                    <th className="px-5 py-3.5">Stock Status</th>
                    <th className="px-5 py-3.5">Ledger Count</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DDCF]">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-[#FAF8F3]/60 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded bg-[#FAF8F3] overflow-hidden border border-[#E4DDCF] shrink-0">
                            <SafeImage
                              src={l.image_url}
                              alt={l.title}
                              domain={l.category_type}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-serif font-bold text-zinc-950 text-sm">{l.title}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">DOCKET: #{l.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-700 uppercase tracking-wider">
                        {l.category_type?.replace('_', ' ')}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-zinc-950 text-sm">
                        {formatPrice(l.price)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${
                            STOCK_STATUS_BADGES[l.stock_status] || 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]'
                          }`}
                        >
                          {l.stock_status?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-zinc-800 font-semibold">
                        {l.inventory?.quantity ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/vendor/listings/${l.id}/edit`)}
                          className="p-1.5 text-zinc-700 hover:text-zinc-950"
                          title="Edit Item Details"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(l)}
                          className="p-1.5 text-red-700 hover:bg-red-50 border-red-200"
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
