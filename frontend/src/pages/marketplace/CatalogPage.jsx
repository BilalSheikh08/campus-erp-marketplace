/**
 * Marketplace domain browsing page.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu } from 'lucide-react';
import useListingsStore from '../../store/listingsStore';
import FilterSidebar from '../../components/marketplace/FilterSidebar';
import SearchBar from '../../components/marketplace/SearchBar';
import ListingGrid from '../../components/marketplace/ListingGrid';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';

const DOMAINS = {
  canteen: { label: '🍽️ Canteen', color: 'from-orange-500 to-red-500' },
  stationery: { label: '📚 Stationery', color: 'from-blue-500 to-indigo-500' },
  hostel_supply: { label: '🏠 Hostel Supplies', color: 'from-green-500 to-emerald-500' },
  book: { label: '📖 Used Books', color: 'from-purple-500 to-pink-500' },
};

export default function CatalogPage() {
  const { domain } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Set domain filter on mount or when domain changes
  useEffect(() => {
    if (domain && domain !== filters.category) {
      setFilters({ category: domain });
    } else if (!domain) {
      fetchListings();
    }
  }, [domain, filters.category, setFilters, fetchListings]);

  const domainInfo = domain ? DOMAINS[domain] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {domainInfo && (
        <div className={`bg-gradient-to-r ${domainInfo.color} text-white py-8 mb-6`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold">{domainInfo.label}</h1>
            <p className="mt-2 text-white/90">Browse products in this category</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              message={error}
              onClose={clearError}
              dismissible
            />
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={setSearch} />
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar Toggle (Mobile) */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mb-4"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5 mr-2" />
            Filters
          </Button>

          {/* Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={() =>
              setFilters({
                category: domain,
                minPrice: null,
                maxPrice: null,
                vendor: null,
                search: '',
              })
            }
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Listings Grid */}
          <div className="flex-1">
            <ListingGrid listings={listings} isLoading={isLoading} />

            {/* Pagination */}
            {pagination.totalCount > pagination.pageSize && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="ghost"
                  disabled={!pagination.hasPrevious}
                  onClick={() => setPage(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-gray-600">
                  Page {pagination.currentPage} of{' '}
                  {Math.ceil(pagination.totalCount / pagination.pageSize)}
                </span>
                <Button
                  variant="ghost"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage(pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

CatalogPage.propTypes = {
  domain: PropTypes.string,
};
