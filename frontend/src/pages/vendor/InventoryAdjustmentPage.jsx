/**
 * Inventory adjustment page - vendors adjust stock levels.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchInventoryDetail, adjustStock } from '../../api/inventory';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';

export default function InventoryAdjustmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

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
      setError(err.response?.data?.detail || 'Failed to load inventory');
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
      setSuccessMessage(`Stock adjusted by ${change > 0 ? '+' : ''}${change}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to adjust stock');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleQuickAdjust = (amount) => {
    handleAdjustment(amount);
  };

  const handleCustomAdjustment = async (e) => {
    e.preventDefault();
    if (!quantityChange) {
      setError('Enter a quantity change');
      return;
    }
    handleAdjustment(parseInt(quantityChange));
  };

  if (!user || user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Alert type="error" message="Access denied. Vendors only." />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading inventory..." />;
  }

  if (!inventory) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Alert type="error" message="Inventory not found" />
          <Button onClick={() => navigate('/vendor/inventory')} className="mt-4">
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/vendor/inventory')}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Adjust Stock</h1>
            <p className="text-gray-600">{inventory.listing?.title}</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Stock */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Stock</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Quantity</p>
                <p className="text-3xl font-bold text-blue-600">{inventory.quantity}</p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Reserved</p>
                <p className="text-3xl font-bold text-yellow-600">{inventory.reserved_quantity}</p>
              </div>

              <div className={`rounded-lg p-4 ${
                inventory.available_quantity > 10 ? 'bg-green-50' :
                inventory.available_quantity > 0 ? 'bg-yellow-50' :
                'bg-red-50'
              }`}>
                <p className="text-sm text-gray-600">Available</p>
                <p className={`text-3xl font-bold ${
                  inventory.available_quantity > 10 ? 'text-green-600' :
                  inventory.available_quantity > 0 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {inventory.available_quantity}
                </p>
              </div>
            </div>
          </div>

          {/* Adjustment Tools */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Adjust Inventory</h2>

            {/* Quick Adjustments */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Quick Adjustments</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleQuickAdjust(1)}
                  disabled={isAdjusting}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add 1 Unit
                </Button>
                <Button
                  onClick={() => handleQuickAdjust(5)}
                  disabled={isAdjusting}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add 5 Units
                </Button>
                <Button
                  onClick={() => handleQuickAdjust(-1)}
                  disabled={isAdjusting}
                  variant="secondary"
                  className="gap-2"
                >
                  <Minus className="h-4 w-4" />
                  Remove 1 Unit
                </Button>
                <Button
                  onClick={() => handleQuickAdjust(-5)}
                  disabled={isAdjusting}
                  variant="secondary"
                  className="gap-2"
                >
                  <Minus className="h-4 w-4" />
                  Remove 5 Units
                </Button>
              </div>
            </div>

            {/* Custom Adjustment */}
            <div className="border-t pt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Custom Adjustment</p>
              <form onSubmit={handleCustomAdjustment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Change
                  </label>
                  <input
                    type="number"
                    value={quantityChange}
                    onChange={(e) => setQuantityChange(e.target.value)}
                    placeholder="Enter positive or negative number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use + for additions, - for reductions
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isAdjusting || !quantityChange}
                  className="w-full"
                >
                  {isAdjusting ? 'Adjusting...' : 'Apply Adjustment'}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Button
            onClick={() => navigate('/vendor/inventory')}
            variant="ghost"
            className="w-full"
          >
            Back to Inventory
          </Button>
        </div>
      </div>
    </div>
  );
}
