/**
 * Campus Commons - Marketplace Catalog
 * Redesigned with university catalog folio aesthetic:
 * warm paper background, serif headings, clean department index tabs,
 * and robust pagination.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import useListingsStore from '../../store/listingsStore';
import FilterSidebar from '../../components/marketplace/FilterSidebar';
import SearchBar from '../../components/marketplace/SearchBar';
import ListingGrid from '../../components/marketplace/ListingGrid';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';

const DOMAIN_TABS = [
  { id: 'all', label: 'All Concessions' },
  { id: 'canteen', label: 'Canteen Dining' },
  { id: 'stationery', label: 'Stationery Depot' },
  { id: 'hostel_supply', label: 'Hostel Supplies' },
  { id: 'book', label: 'Used Textbooks' },
];

export default function CatalogPage() {
  const { domain } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const {
    listings,
    filters,
    pagination,
    isLoading,
    error,
    setFilters,
    setSearch,
    setPage,
    fetchListings,
    clearError,
  } = useListingsStore();

  useEffect(() => {
    if (domain && domain !== filters.category) {
      setFilters({ category: domain });
    } else if (!domain && filters.category) {
      setFilters({ category: null });
    } else {
      fetchListings();
    }
  }, [domain, filters.category, setFilters, fetchListings]);

  const activeCategory = filters.category || 'all';

  const handleTabChange = (tabId) => {
    if (tabId === 'all') {
      navigate('/marketplace');
    } else {
      navigate(`/marketplace/${tabId}`);
    }
  };

  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
    if (sortBy === 'rating') return (parseFloat(b.average_rating) || 0) - (parseFloat(a.average_rating) || 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 pb-24 font-sans">
      {/* Header Masthead */}
      <div className="bg-[#FAF8F3] border-b border-[#E4DDCF] pt-8 pb-6 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span>UNIVERSITY OFFICIAL CATALOG · CONCESSIONS INVENTORY</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
                {activeCategory === 'all'
                  ? 'All Campus Concessions'
                  : DOMAIN_TABS.find((t) => t.id === activeCategory)?.label || 'Catalog'}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 font-sans">
                Direct counter pickups with atomic stock locking and verified pricing.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-zinc-800 bg-white px-3 py-1.5 rounded border border-[#E4DDCF] shadow-xs">
                {pagination.totalCount} Listed Records
              </span>
            </div>
          </div>

          {/* Department Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono">
            {DOMAIN_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-1.5 rounded text-xs transition whitespace-nowrap cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'bg-white text-zinc-700 hover:bg-[#F1ECE1] border border-[#E4DDCF]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Error Feedback */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={clearError} />
          </div>
        )}

        {/* Top Control Bar: Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
          <div className="w-full sm:max-w-md">
            <SearchBar
              value={filters.search}
              onChange={(val) => setSearch(val)}
              onClear={() => setSearch('')}
              placeholder="Search catalog by name, brand, or SKU..."
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end font-sans">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden px-3 py-2 rounded border border-[#E4DDCF] bg-white text-xs font-semibold text-zinc-800 flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filter Index</span>
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 font-mono text-[11px] hidden sm:inline">SORT ORDER:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 text-xs rounded border border-[#E4DDCF] bg-white text-zinc-800 font-medium focus:outline-none focus:border-blue-900 cursor-pointer shadow-xs font-sans"
              >
                <option value="newest">Recently Registered</option>
                <option value="price_asc">Rate: Low to High</option>
                <option value="price_desc">Rate: High to Low</option>
                <option value="rating">Student Review Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid & Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              domains={DOMAIN_TABS.filter((t) => t.id !== 'all').map((t) => ({
                value: t.id,
                label: t.label,
              }))}
              selectedDomain={filters.category || 'all'}
              onDomainChange={(val) => handleTabChange(val)}
              stockStatuses={[
                { value: 'all', label: 'All Availability' },
                { value: 'in_stock', label: 'In Stock' },
                { value: 'low_stock', label: 'Low Stock' },
              ]}
              selectedStockStatus={filters.stock_status || 'all'}
              onStockStatusChange={(val) => setFilters({ stock_status: val === 'all' ? null : val })}
              minPrice={filters.minPrice || ''}
              maxPrice={filters.maxPrice || ''}
              onMinPriceChange={(val) => setFilters({ minPrice: val })}
              onMaxPriceChange={(val) => setFilters({ maxPrice: val })}
              onResetFilters={() => {
                setFilters({ category: null, stock_status: null, minPrice: null, maxPrice: null });
                navigate('/marketplace');
              }}
            />
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            <ListingGrid listings={sortedListings} isLoading={isLoading} />

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-between border-t border-[#E4DDCF] pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="gap-1.5 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous Folio
                </Button>

                <span className="text-xs font-mono font-semibold text-zinc-600">
                  Folio {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="gap-1.5 text-xs"
                >
                  Next Folio
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
