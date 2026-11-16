/**
 * Campus Commons - Inventory Stock Adjustment
 * Quick ±1 and ±5 increments, custom delta entries, and stock tracking.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Boxes } from 'lucide-react';
import { fetchInventoryDetail, adjustStock } from '../../api/inventory';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';

export default function InventoryAdjustmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inventory, setInventory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [quantityChange, setQuantityChange] = useState('');

  useEffect(() => {
    loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadInventory = async () => {
    try {
      const data = await fetchInventoryDetail(id);
      setInventory(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load inventory details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustment = async (change) => {
    setError(null);
    if (!inventory) return;

    setIsAdjusting(true);
    try {
      const result = await adjustStock(id, { quantity_change: change });
      setInventory(result);
      setQuantityChange('');
      setSuccessMessage(`Stock adjusted successfully: ${change > 0 ? '+' : ''}${change} units`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to adjust stock');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleCustomAdjustment = (e) => {
    e.preventDefault();
    const change = parseInt(quantityChange, 10);
    if (isNaN(change) || change === 0) {
      setError('Please enter a valid non-zero number');
      return;
    }
    handleAdjustment(change);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading product stock allocation..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24 text-slate-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/vendor/inventory')}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to inventory list
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3.5 mb-6 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Adjust Stock Level</h1>
              <p className="text-xs text-slate-500">Item: {inventory?.listing?.title || 'Catalog Product'}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
            </div>
          )}
          {successMessage && (
            <div className="mb-6">
              <Alert type="success" message={successMessage} dismissible onClose={() => setSuccessMessage(null)} />
            </div>
          )}

          {/* Current Stock Balance Display */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-8 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Stock</span>
              <div className="text-4xl font-mono font-black text-slate-900 mt-1">
                {inventory?.quantity ?? 0} <span className="text-base font-normal text-slate-500">units</span>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                (inventory?.quantity ?? 0) === 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : (inventory?.quantity ?? 0) <= (inventory?.low_stock_threshold ?? 5)
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {(inventory?.quantity ?? 0) === 0 ? 'Out of Stock' : (inventory?.quantity ?? 0) <= (inventory?.low_stock_threshold ?? 5) ? 'Low Stock' : 'In Stock'}
            </span>
          </div>

          {/* Quick Delta Buttons */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Quick Adjustments (± Delta)
              </label>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAdjustment(-5)}
                  disabled={isAdjusting || (inventory?.quantity ?? 0) < 5}
                  className="font-mono font-bold text-rose-600 hover:bg-rose-50 border-slate-200"
                >
                  -5
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAdjustment(-1)}
                  disabled={isAdjusting || (inventory?.quantity ?? 0) < 1}
                  className="font-mono font-bold text-rose-600 hover:bg-rose-50 border-slate-200"
                >
                  -1
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAdjustment(1)}
                  disabled={isAdjusting}
                  className="font-mono font-bold text-emerald-600 hover:bg-emerald-50 border-slate-200"
                >
                  +1
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAdjustment(5)}
                  disabled={isAdjusting}
                  className="font-mono font-bold text-emerald-600 hover:bg-emerald-50 border-slate-200"
                >
                  +5
                </Button>
              </div>
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleCustomAdjustment} className="pt-6 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Custom Quantity Change
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(e.target.value)}
                  placeholder="e.g. +20 or -10"
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 font-mono"
                />
                <Button
                  type="submit"
                  variant="blue"
                  disabled={isAdjusting || !quantityChange}
                  loading={isAdjusting}
                  className="px-6 font-bold"
                >
                  Apply
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
