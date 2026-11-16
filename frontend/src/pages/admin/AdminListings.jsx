/**
 * Campus Commons - Catalog Moderation Ledger
 * Central Registrar Concession Catalog Oversight:
 * Itemized inventory audit, vendor pricing verification, and listing visibility toggles.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, Eye, EyeOff, Layers, ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchListings, updateListing } from '../../api/listings';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import SafeImage from '../../components/shared/SafeImage';
import { formatPrice } from '../../utils/formatters';

const CATEGORY_LABELS = {
  canteen: 'Canteen Dining',
  stationery: 'Academic Stationery',
  hostel_supply: 'Hostel Supplies',
  books: 'Books Exchange',
};

const STATUS_BADGE = {
  active: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  inactive: 'bg-[#FAF8F3] text-zinc-600 border-[#E4DDCF]',
};

export default function AdminListings() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to update listing status');
    } finally {
      setActionInProgress(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Auditing campus concession catalog..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <Layers className="h-3.5 w-3.5 text-zinc-700" />
              <span>CENTRAL REGISTRAR · CATALOG MODERATION LEDGER</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              Campus Catalog Moderation
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm mt-1 font-sans">
              Audit pricing compliance, inspect item descriptions, and toggle public marketplace availability.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/admin/dashboard">
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Governance Console</span>
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
        {actionError && (
          <div className="mb-6">
            <Alert type="error" message={actionError} dismissible onClose={() => setActionError(null)} />
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-lg p-4 border border-[#E4DDCF] shadow-xs mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog titles, specifications, or vendor concessionaires..."
                className="w-full pl-10 pr-3.5 py-2 text-xs font-sans rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-900 focus:outline-none focus:border-blue-900 focus:bg-white placeholder:text-zinc-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-zinc-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-mono px-3 py-2 rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-900 focus:outline-none focus:border-blue-900"
              >
                <option value="all">All Departments</option>
                <option value="canteen">Canteen Dining</option>
                <option value="stationery">Stationery Depot</option>
                <option value="hostel_supply">Hostel Supplies</option>
                <option value="books">Textbooks</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-mono px-3 py-2 rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-900 focus:outline-none focus:border-blue-900"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            Showing <strong className="text-zinc-900">{filteredListings.length}</strong> of {listings.length} registered catalog entries
          </div>
        </div>

        {/* Catalog Table */}
        <div className="bg-white rounded-lg border border-[#E4DDCF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F3] border-b border-[#E4DDCF] text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Item &amp; Concession</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Registered Rate</th>
                  <th className="px-5 py-3.5">Stock Level</th>
                  <th className="px-5 py-3.5">Catalog Status</th>
                  <th className="px-5 py-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DDCF]">
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-zinc-400">
                      <Layers className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                      <p className="font-serif font-bold text-zinc-800 text-sm">No items found</p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-sans">
                        No catalog listings match the active filter criteria.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-[#FAF8F3]/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-[#FAF8F3] overflow-hidden border border-[#E4DDCF] shrink-0">
                            <SafeImage
                              src={listing.image_url}
                              alt={listing.title}
                              domain={listing.category_type}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <Link
                              to={`/listings/${listing.id}`}
                              className="font-serif font-bold text-zinc-950 text-sm hover:text-blue-900 transition-colors flex items-center gap-1"
                            >
                              <span>{listing.title}</span>
                              <ExternalLink className="h-3 w-3 text-zinc-400" />
                            </Link>
                            <p className="text-[10px] font-mono text-zinc-500">
                              Vendor: {listing.vendor?.business_name || 'Concession'} • #{listing.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-700 uppercase tracking-wider">
                        {CATEGORY_LABELS[listing.category_type] || listing.category_type}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-zinc-950 text-sm">
                        {formatPrice(listing.price)}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-zinc-700">
                        {listing.inventory?.quantity != null ? `${listing.inventory.quantity} units` : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                            STATUS_BADGE[listing.status] || 'bg-[#FAF8F3] text-zinc-700 border-[#E4DDCF]'
                          }`}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(listing.id, listing.status)}
                          disabled={actionInProgress === listing.id}
                          className={`text-xs py-1 px-2.5 font-mono font-bold ${
                            listing.status === 'active'
                              ? 'text-amber-800 border-amber-300 hover:bg-amber-50'
                              : 'text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          {listing.status === 'active' ? (
                            <span className="flex items-center gap-1">
                              <EyeOff className="h-3 w-3" /> Hide
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> Make Active
                            </span>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
