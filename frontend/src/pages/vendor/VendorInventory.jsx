/**
 * Campus Commons - Vendor Inventory Management
 * Real-time stock audit and quick allocation adjustment for approved vendors.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Boxes, ArrowLeft } from 'lucide-react';
import { fetchListings } from '../../api/listings';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';

export default function VendorInventory() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchListings({ page: 1, limit: 100 });
      setListings(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load stock inventory');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Auditing inventory stock..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24 text-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/vendor/dashboard')}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Merchant Desk
        </button>

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Boxes className="h-7 w-7 text-blue-600" /> Stock &amp; Inventory Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live product allocations, low stock alerts, and delta adjustment history.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {listings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <Boxes className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">No products found</h2>
            <p className="text-xs text-slate-500">Create a catalog item to begin tracking stock units.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Current Available Stock</th>
                    <th className="px-6 py-4">Threshold</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Adjustment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((l) => {
                    const quantity = l.inventory?.quantity ?? 0;
                    const threshold = l.inventory?.low_stock_threshold ?? 5;
                    const isLow = quantity <= threshold;

                    return (
                      <tr key={l.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                          {l.title}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-600 capitalize">
                          {l.category_type?.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 font-mono font-extrabold text-slate-900 text-sm">
                          {quantity} units
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500">
                          {threshold} units
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                              quantity === 0
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : isLow
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {quantity === 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'Sufficient'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/vendor/inventory/${l.id}/adjust`)}
                            className="gap-1.5 font-bold"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Adjust Stock</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
