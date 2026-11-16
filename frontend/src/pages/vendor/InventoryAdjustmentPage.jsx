/**
 * Campus Commons - Inventory Stock Adjustment
 * University Stock Ledger Adjustment Docket:
 * Preset ±1 and ±5 increments, custom delta entries, and physical audit log.
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
      setError('Please enter a valid non-zero delta integer.');
      return;
    }
    handleAdjustment(change);
  };

  if (isLoading) {
    return <LoadingSpinner message="Consulting product stock ledger..." />;
  }

  const currentCount = inventory?.quantity ?? 0;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/vendor/inventory')}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Stock Ledger</span>
        </button>

        <div className="bg-white rounded-lg border border-[#E4DDCF] p-6 sm:p-8 shadow-xs">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-[#E4DDCF]">
            <div className="w-10 h-10 rounded bg-[#FAF8F3] text-zinc-800 flex items-center justify-center border border-[#E4DDCF]">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                STOCK LEVEL DOCKET
              </span>
              <h1 className="font-serif text-2xl font-normal text-zinc-950 tracking-tight">
                Adjust Concession Stock
              </h1>
              <p className="text-xs text-zinc-600 mt-0.5">
                Item: <strong className="text-zinc-900">{inventory?.listing?.title || 'Catalog Product'}</strong>
              </p>
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

          {/* Current Stock Snapshot Card */}
          <div className="p-4 rounded border border-[#E4DDCF] bg-[#FAF8F3] mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Current Registered Stock
              </span>
              <p className="font-mono font-bold text-3xl text-zinc-950 mt-0.5">
                {currentCount} <span className="text-xs font-normal text-zinc-600">units</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Low Stock Alert</span>
              <p className="font-mono text-sm text-zinc-700 font-semibold mt-0.5">
                &le; {inventory?.low_stock_threshold ?? 5} units
              </p>
            </div>
          </div>

          {/* Quick Adjustment Buttons */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-700 mb-2">
                Quick Delta Increments / Deductions
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdjustment(-5)}
                  disabled={isAdjusting || currentCount < 5}
                  className="font-mono font-bold text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  -5 Units
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdjustment(-1)}
                  disabled={isAdjusting || currentCount < 1}
                  className="font-mono font-bold text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  -1 Unit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdjustment(1)}
                  disabled={isAdjusting}
                  className="font-mono font-bold text-xs text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                >
                  +1 Unit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdjustment(5)}
                  disabled={isAdjusting}
                  className="font-mono font-bold text-xs text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                >
                  +5 Units
                </Button>
              </div>
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleCustomAdjustment} className="pt-4 border-t border-[#E4DDCF]">
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-700 mb-2">
                Custom Stock Intake or Deduction
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(e.target.value)}
                  placeholder="e.g. +20 for intake, -8 for spoilage"
                  className="flex-1 text-xs px-3 py-2 rounded border border-[#E4DDCF] bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 font-mono"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isAdjusting}
                  disabled={isAdjusting || !quantityChange}
                  className="px-4 text-xs font-bold"
                >
                  Apply Delta
                </Button>
              </div>
              <p className="text-[10px] font-mono text-zinc-500 mt-1.5">
                Positive number adds intake units; negative number deducts spoiled or audited items.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
