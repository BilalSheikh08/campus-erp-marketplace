/**
 * Zustand store for listings/catalog state.
 * Manages filters, search, pagination, and listings data.
 */

import { create } from 'zustand';
import * as listingsAPI from '../api/listings';

export const useListingsStore = create((set, get) => ({
  // State
  listings: [],
  currentListing: null,
  filters: {
    category: null,
    minPrice: null,
    maxPrice: null,
    vendor: null,
    search: '',
    status: 'active',
  },
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  },
  isLoading: false,
  error: null,

  // Actions
  /**
   * Fetch listings with current filters and pagination.
   */
  fetchListings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params = {
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        category_type: filters.category,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        vendor_id: filters.vendor,
        search: filters.search,
        status: filters.status,
      };

      // Remove null/empty values
      Object.keys(params).forEach(
        key => (params[key] === null || params[key] === '') && delete params[key],
      );

      const data = await listingsAPI.fetchListings(params);
      set({
        listings: data.results,
        pagination: {
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalCount: data.count,
          hasNext: !!data.next,
          hasPrevious: !!data.previous,
        },
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err.response?.data?.detail || 'Failed to fetch listings',
      });
    }
  },

  /**
   * Fetch a single listing by ID.
   */
  fetchListing: async (listingId) => {
    set({ isLoading: true, error: null });
    try {
      const listing = await listingsAPI.fetchListingDetail(listingId);
      set({ currentListing: listing, isLoading: false });
      return listing;
    } catch (err) {
      set({
        isLoading: false,
        error: err.response?.data?.detail || 'Failed to fetch listing',
      });
      throw err;
    }
  },

  /**
   * Set filter values and reset to page 1.
   */
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, currentPage: 1 },
    }));
    get().fetchListings();
  },

  /**
   * Set category filter.
   */
  setCategory: (category) => {
    get().setFilters({ category });
  },

  /**
   * Set search query.
   */
  setSearch: (search) => {
    get().setFilters({ search });
  },

  /**
   * Set price range.
   */
  setPriceRange: (minPrice, maxPrice) => {
    get().setFilters({ minPrice, maxPrice });
  },

  /**
   * Set vendor filter.
   */
  setVendor: (vendor) => {
    get().setFilters({ vendor });
  },

  /**
   * Go to specific page.
   */
  setPage: (page) => {
    set(state => ({
      pagination: { ...state.pagination, currentPage: page },
    }));
    get().fetchListings();
  },

  /**
   * Clear all filters and reset to page 1.
   */
  clearFilters: () => {
    set({
      filters: {
        category: null,
        minPrice: null,
        maxPrice: null,
        vendor: null,
        search: '',
        status: 'active',
      },
      pagination: { currentPage: 1, pageSize: 20, totalCount: 0, hasNext: false, hasPrevious: false },
    });
    get().fetchListings();
  },

  /**
   * Clear error message.
   */
  clearError: () => set({ error: null }),
}));

export default useListingsStore;
