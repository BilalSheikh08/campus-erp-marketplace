/**
 * Admin Listings Management - moderate and manage all listings in the system.
 */

import { useEffect, useState } from 'react';
import { ChevronDown, Filter, Search, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchListings, updateListing } from '../../api/listings';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';

const CATEGORY_LABELS = {
  canteen: 'Canteen',
  stationery: 'Stationery',
  hostel_supply: 'Hostel Supply',
  books: 'Books',
};

const STATUS_BADGE = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
};

export default function AdminListings() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedListing, setExpandedListing] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin only.');
      setIsLoading(false);
      return;
    }
    loadListings();
  }, [user]);

  const loadListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all listings including inactive ones (admin view)
      const data = await fetchListings({ page_size: 1000, status: 'all' });
      const listingsList = Array.isArray(data) ? data : data.results || [];
      setListings(listingsList);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = listings;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((l) => l.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((l) => l.category_type === categoryFilter);
    }

    // Search filter (by title, description, vendor)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.title?.toLowerCase().includes(query) ||
          l.description?.toLowerCase().includes(query) ||
          l.vendor?.business_name?.toLowerCase().includes(query)
      );
    }

    setFilteredListings(filtered);
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, statusFilter, categoryFilter, searchQuery]);

  const handleToggleStatus = async (listingId, currentStatus) => {
    setActionInProgress(listingId);
    setActionError(null);
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateListing(listingId, { status: newStatus });

      // Update local state
      setListings(
        listings.map((l) =>
          l.id === listingId ? { ...l, status: newStatus } : l
        )
      );
      setExpandedListing(null);
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to update listing status');
    } finally {
      setActionInProgress(null);
    }
  };

  const getCategoryLabel = (category) => {
    return CATEGORY_LABELS[category] || category;
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Alert type="error" message="Access denied. Admin only." />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading listings..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Listings Management</h1>
          <p className="text-gray-600">Monitor and moderate all listings on the platform</p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {actionError && (
          <div className="mb-6">
            <Alert
              type="error"
              message={actionError}
              dismissible
              onClose={() => setActionError(null)}
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="canteen">Canteen</option>
                <option value="stationery">Stationery</option>
                <option value="hostel_supply">Hostel Supply</option>
                <option value="books">Books</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-600">Total Listings</p>
            <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {listings.filter((l) => l.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-sm text-gray-600">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">
              {listings.filter((l) => l.status === 'inactive').length}
            </p>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredListings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {listings.length === 0 ? 'No listings found' : 'No listings match your filters'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                        {listing.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {listing.vendor?.business_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getCategoryLabel(listing.category_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{listing.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            STATUS_BADGE[listing.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() =>
                            setExpandedListing(expandedListing === listing.id ? null : listing.id)
                          }
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedListing === listing.id ? 'rotate-180' : ''
                            }`}
                          />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expanded Listing Details */}
        {expandedListing && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            {filteredListings.find((l) => l.id === expandedListing) && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Listing Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Title:</p>
                      <p className="font-medium text-gray-900">
                        {filteredListings.find((l) => l.id === expandedListing)?.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status:</p>
                      <p className="font-medium text-gray-900">
                        {filteredListings
                          .find((l) => l.id === expandedListing)
                          ?.status.charAt(0)
                          .toUpperCase() +
                          filteredListings
                            .find((l) => l.id === expandedListing)
                            ?.status.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Vendor:</p>
                      <p className="font-medium text-gray-900">
                        {filteredListings.find((l) => l.id === expandedListing)?.vendor
                          ?.business_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Category:</p>
                      <p className="font-medium text-gray-900">
                        {getCategoryLabel(
                          filteredListings.find((l) => l.id === expandedListing)?.category_type
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Price:</p>
                      <p className="font-medium text-gray-900">
                        ₹{filteredListings.find((l) => l.id === expandedListing)?.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Created:</p>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          filteredListings.find((l) => l.id === expandedListing)?.created_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <p className="text-gray-600 text-sm">Description:</p>
                    <p className="text-gray-900 mt-1">
                      {filteredListings.find((l) => l.id === expandedListing)?.description ||
                        'No description'}
                    </p>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-900 mb-3">Moderation Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() =>
                        handleToggleStatus(
                          expandedListing,
                          filteredListings.find((l) => l.id === expandedListing)?.status
                        )
                      }
                      disabled={actionInProgress === expandedListing}
                      variant={
                        filteredListings.find((l) => l.id === expandedListing)?.status ===
                        'active'
                          ? 'secondary'
                          : 'primary'
                      }
                      className="flex items-center gap-2"
                    >
                      {actionInProgress === expandedListing ? (
                        'Updating...'
                      ) : filteredListings.find((l) => l.id === expandedListing)?.status ===
                        'active' ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Reactivate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
