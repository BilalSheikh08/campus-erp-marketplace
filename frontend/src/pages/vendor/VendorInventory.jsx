/**
 * Campus Commons - Vendor Inventory Management
 * University Merchant Stock Ledger:
 * Real-time stock audit, low-stock threshold monitoring, and delta adjustments.
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit, Boxes, ArrowLeft, RefreshCw } from 'lucide-react';
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
    return <LoadingSpinner message="Auditing concession stock ledger..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <Boxes className="h-3.5 w-3.5 text-zinc-700" />
              <span>MERCHANT DISPATCH · STOCK ALLOCATION LEDGER</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              Inventory &amp; Stock Count
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm mt-1 font-sans">
              Monitor live counter quantities, depletion thresholds, and stock intake logs.
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
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {listings.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-12 text-center shadow-xs max-w-lg mx-auto">
            <Boxes className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <h2 className="font-serif text-lg font-bold text-zinc-900 mb-1">No products found in inventory</h2>
            <p className="text-xs text-zinc-600 mb-6 leading-relaxed font-sans">
              Create a concession catalog item to begin tracking stock units.
            </p>
            <Link to="/vendor/listings/new">
              <Button variant="primary" size="md" className="font-bold text-xs">
                Create Catalog Item
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#E4DDCF] overflow-hidden shadow-xs">
            <div className="px-5 py-3 bg-[#FAF8F3] border-b border-[#E4DDCF] flex items-center justify-between text-xs font-mono font-bold text-zinc-700 uppercase tracking-wider">
              <span>Current Stock Allocations ({listings.length})</span>
              <span className="text-[11px] text-zinc-500 lowercase font-normal">audited in real time</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F3] border-b border-[#E4DDCF] text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Concession Item</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Available Stock</th>
                    <th className="px-5 py-3.5">Depletion Threshold</th>
                    <th className="px-5 py-3.5">Audit Status</th>
                    <th className="px-5 py-3.5 text-right">Adjustment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DDCF]">
                  {listings.map((l) => {
                    const quantity = l.inventory?.quantity ?? 0;
                    const threshold = l.inventory?.low_stock_threshold ?? 5;
                    const isLow = quantity <= threshold;

                    return (
                      <tr key={l.id} className="hover:bg-[#FAF8F3]/60 transition">
                        <td className="px-5 py-3.5 font-serif font-bold text-zinc-950 text-sm">
                          {l.title}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-700 uppercase tracking-wider">
                          {l.category_type?.replace('_', ' ')}
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-zinc-950 text-sm">
                          {quantity} units
                        </td>
                        <td className="px-5 py-3.5 font-mono text-zinc-500">
                          {threshold} units
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${
                              quantity === 0
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : isLow
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {quantity === 0 ? 'Depleted' : isLow ? 'Low Stock' : 'Sufficient'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/vendor/inventory/${l.id}/adjust`)}
                            className="text-xs flex items-center gap-1.5 ml-auto text-zinc-800"
                          >
                            <Edit className="h-3.5 w-3.5 text-zinc-600" />
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
