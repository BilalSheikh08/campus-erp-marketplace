import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Filter, Search, Eye, EyeOff, Layers, ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchListings, updateListing } from '../../api/listings';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import { formatPrice } from '../../utils/formatters';

const CATEGORY_LABELS = {
  canteen: 'Canteen Dining',
  stationery: 'Academic Stationery',
  hostel_supply: 'Hostel Supplies',
  books: 'Books Exchange',
};

const STATUS_BADGE = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function AdminListings() {
  const navigate = useNavigate();
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
      setError('Access denied. Administrator privileges required.');
      setIsLoading(false);
      return;
    }
    loadListings();
  }, [user]);

  const loadListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
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

    if (statusFilter !== 'all') {
      filtered = filtered.filter((l) => l.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((l) => l.category_type === categoryFilter);
    }

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
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <Alert type="error" message="Access restricted to campus platform administrators." />
          <Button onClick={() => navigate('/')} className="mt-4 w-full">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Auditing university catalog inventory..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 pb-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Governance Console
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="h-7 w-7 text-blue-600" />
            <span>Platform Catalog Moderation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audit active vendor listings, inspect prices, and manage visibility across campus domains.
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}

        {actionError && (
          <div className="mb-4">
            <Alert
              type="error"
              message={actionError}
              dismissible
              onClose={() => setActionError(null)}
            />
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total System Listings</p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{listings.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Active in Marketplace</p>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
              {listings.filter((l) => l.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Archived / Inactive</p>
            <p className="text-2xl font-black text-slate-600 mt-1 font-mono">
              {listings.filter((l) => l.status === 'inactive').length}
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product title, description, or vendor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 bg-white rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm border border-slate-200 bg-white rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm border border-slate-200 bg-white rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">All Concession Categories</option>
              <option value="canteen">Canteen Dining</option>
              <option value="stationery">Stationery Depot</option>
              <option value="hostel_supply">Hostel Supplies</option>
              <option value="books">Books Exchange</option>
            </select>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          {filteredListings.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs sm:text-sm">
              <Layers className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <div className="font-semibold text-slate-700">No catalog items found</div>
              <p className="text-xs text-slate-400 mt-0.5">
                {listings.length === 0 ? 'No listings created yet' : 'No listings match current filters'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Item Title</th>
                    <th className="px-4 py-3.5">Vendor / Shop</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Price</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Listed On</th>
                    <th className="px-5 py-3.5 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-900 max-w-xs truncate text-xs sm:text-sm">
                        {listing.title}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">
                        {listing.vendor?.business_name || listing.vendor_name || 'Campus Concession'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {getCategoryLabel(listing.category_type)}
                      </td>
                      <td className="px-4 py-3.5 font-bold font-mono text-slate-900 text-xs sm:text-sm">
                        {formatPrice(listing.price)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            STATUS_BADGE[listing.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {listing.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() =>
                            setExpandedListing(expandedListing === listing.id ? null : listing.id)
                          }
                          className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 text-xs"
                        >
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform ${
                              expandedListing === listing.id ? 'rotate-180' : ''
                            }`}
                          />
                          Moderate
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
          <div className="mt-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm text-xs">
            {filteredListings.find((l) => l.id === expandedListing) && (
              <>
                <div className="mb-4 pb-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900">
                    Product Moderation: {filteredListings.find((l) => l.id === expandedListing)?.title}
                  </h3>
                  <button
                    onClick={() => setExpandedListing(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-medium"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Visibility Status</span>
                    <span className="font-bold text-slate-900 capitalize">
                      {filteredListings.find((l) => l.id === expandedListing)?.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Offering Merchant</span>
                    <span className="font-bold text-slate-900">
                      {filteredListings.find((l) => l.id === expandedListing)?.vendor?.business_name || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Department</span>
                    <span className="font-bold text-slate-900">
                      {getCategoryLabel(filteredListings.find((l) => l.id === expandedListing)?.category_type)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Base Price</span>
                    <span className="font-bold font-mono text-emerald-700 text-sm">
                      {formatPrice(filteredListings.find((l) => l.id === expandedListing)?.price)}
                    </span>
                  </div>
                </div>

                {filteredListings.find((l) => l.id === expandedListing)?.description && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed text-xs">
                    {filteredListings.find((l) => l.id === expandedListing)?.description}
                  </div>
                )}

                {/* Moderation Actions */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <Button
                    onClick={() =>
                      handleToggleStatus(
                        expandedListing,
                        filteredListings.find((l) => l.id === expandedListing)?.status
                      )
                    }
                    disabled={actionInProgress === expandedListing}
                    variant={
                      filteredListings.find((l) => l.id === expandedListing)?.status === 'active'
                        ? 'outline'
                        : 'primary'
                    }
                    size="sm"
                    className="flex items-center gap-1.5 text-xs font-semibold"
                  >
                    {actionInProgress === expandedListing ? (
                      'Updating...'
                    ) : filteredListings.find((l) => l.id === expandedListing)?.status === 'active' ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-rose-600" />
                        <span className="text-rose-600">Deactivate from Marketplace</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        <span>Reactivate in Marketplace</span>
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
