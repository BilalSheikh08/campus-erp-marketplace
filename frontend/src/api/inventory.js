/**
 * Inventory API service - manage stock levels.
 */

import client from './client';

const API_BASE = '/api/inventory';

/**
 * Fetch all inventory for authenticated user (vendor) or admin
 * @param {Object} params - Pagination and filter params
 */
export const fetchInventory = async (params = {}) => {
  const response = await client.get(`${API_BASE}/`, { params });
  return response.data;
};

/**
 * Get inventory details for a specific listing
 * @param {string} inventoryId - UUID of inventory
 */
export const fetchInventoryDetail = async (inventoryId) => {
  const response = await client.get(`${API_BASE}/${inventoryId}/`);
  return response.data;
};

/**
 * Update inventory quantity or threshold
 * @param {string} inventoryId - UUID of inventory
 * @param {Object} data - { quantity?, low_stock_threshold? }
 */
export const updateInventory = async (inventoryId, data) => {
  const response = await client.patch(`${API_BASE}/${inventoryId}/`, data);
  return response.data;
};

/**
 * Adjust stock by a delta
 * @param {string} inventoryId - UUID of inventory
 * @param {Object} data - { quantity_change }
 */
export const adjustStock = async (inventoryId, data) => {
  const response = await client.post(`${API_BASE}/${inventoryId}/adjust/`, data);
  return response.data;
};
