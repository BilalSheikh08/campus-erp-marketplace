/**
 * Listings API endpoints - fetch, filter, search, and browse catalog.
 */

import api from './client';

/**
 * Fetch listings with optional filters and search.
 * Query parameters: category, status, min_price, max_price, vendor, search, page, page_size
 */
export const fetchListings = async (params = {}) => {
  const response = await api.get('/api/listings/', { params });
  return response.data;
};

/**
 * Fetch a single listing by ID.
 */
export const fetchListingDetail = async (listingId) => {
  const response = await api.get(`/api/listings/${listingId}/`);
  return response.data;
};

/**
 * Search listings by query string.
 */
export const searchListings = async (searchQuery, params = {}) => {
  const response = await api.get('/api/listings/', {
    params: { ...params, search: searchQuery },
  });
  return response.data;
};

/**
 * Filter listings by category/domain.
 */
export const filterByCategory = async (category, params = {}) => {
  const response = await api.get('/api/listings/', {
    params: { ...params, category_type: category },
  });
  return response.data;
};

/**
 * Filter listings by price range.
 */
export const filterByPrice = async (minPrice, maxPrice, params = {}) => {
  const response = await api.get('/api/listings/', {
    params: { ...params, min_price: minPrice, max_price: maxPrice },
  });
  return response.data;
};

/**
 * Filter listings by vendor.
 */
export const filterByVendor = async (vendorId, params = {}) => {
  const response = await api.get('/api/listings/', {
    params: { ...params, vendor_id: vendorId },
  });
  return response.data;
};

export default {
  fetchListings,
  fetchListingDetail,
  searchListings,
  filterByCategory,
  filterByPrice,
  filterByVendor,
};
