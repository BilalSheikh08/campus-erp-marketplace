/**
 * Vendor inventory management page.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Edit } from 'lucide-react';
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
      setError(err.response?.data?.detail || 'Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading inventory..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Inventory</h1>
          <p className="text-gray-600">View and adjust stock levels for your listings</p>
        </div>

        {/* Alert */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Inventory Management</h3>
              <p className="text-sm text-blue-800 mt-1">
                Adjust stock levels to reflect what&apos;s available for purchase. System prevents overselling.
              </p>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">No listings with inventory</p>
              <Button onClick={() => navigate('/vendor/listings')}>
                Create a Listing First
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Reserved</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Available</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {listings.map(listing => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {listing.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {listing.inventory?.quantity || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {listing.inventory?.reserved_quantity || 0}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          (listing.inventory?.available_quantity || 0) > 10 ? 'bg-green-100 text-green-800' :
                          (listing.inventory?.available_quantity || 0) > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {listing.inventory?.available_quantity || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => navigate(`/vendor/inventory/${listing.id}/adjust`)}
                          className="p-1 hover:bg-gray-100 rounded transition inline-flex items-center gap-1"
                          title="Adjust"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-600">Adjust</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
