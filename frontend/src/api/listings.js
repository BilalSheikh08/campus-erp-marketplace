/**
 * Listings API service - browse and manage listings.
 */

import client from './client';

const API_BASE = '/api';

/**
 * Fetch listings from catalog with pagination and filtering
 * @param {Object} params - { page?, page_size?, category?, min_price?, max_price?, search?, etc }
 */
export const fetchListings = async (params = {}) => {
  const response = await client.get(`${API_BASE}/listings/`, { params });
  return response.data;
};

/**
 * Fetch a specific listing detail
 * @param {string} listingId - UUID of the listing
 */
export const fetchListingDetail = async (listingId) => {
  const response = await client.get(`${API_BASE}/listings/${listingId}/`);
  return response.data;
};

/**
 * Create a new listing
 * @param {Object} data - Listing data with category-specific details
 */
export const createListing = async (data) => {
  const response = await client.post(`${API_BASE}/listings/`, data);
  return response.data;
};

/**
 * Update a listing
 * @param {string} listingId - UUID of the listing
 * @param {Object} data - Fields to update
 */
export const updateListing = async (listingId, data) => {
  const response = await client.patch(`${API_BASE}/listings/${listingId}/`, data);
  return response.data;
};

/**
 * Delete/deactivate a listing
 * @param {string} listingId - UUID of the listing
 */
export const deleteListing = async (listingId) => {
  await client.delete(`${API_BASE}/listings/${listingId}/`);
};

