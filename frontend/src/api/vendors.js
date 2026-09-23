/**
 * Vendor API service - vendor applications, approvals, and management.
 */

import client from './client';

const API_BASE = '/api';

/**
 * Apply to become a vendor
 * @param {Object} data - { business_name, vendor_type, description, contact_number }
 */
export const applyAsVendor = async (data) => {
  const response = await client.post(`${API_BASE}/vendors/apply/`, data);
  return response.data;
};

/**
 * Get current user's vendor profile
 */
export const fetchVendorProfile = async () => {
  const response = await client.get(`${API_BASE}/vendors/me/`);
  return response.data;
};

/**
 * Update vendor profile
 * @param {Object} data - Fields to update
 */
export const updateVendorProfile = async (data) => {
  const response = await client.patch(`${API_BASE}/vendors/me/`, data);
  return response.data;
};

/**
 * List all vendor applications (admin only)
 * @param {Object} params - { approval_status?, vendor_type? }
 */
export const fetchVendorApplications = async (params = {}) => {
  const response = await client.get(`${API_BASE}/vendors/`, { params });
  return response.data;
};

/**
 * Approve a vendor application (admin only)
 * @param {string} vendorId - UUID of vendor to approve
 */
export const approveVendor = async (vendorId) => {
  const response = await client.post(`${API_BASE}/vendors/${vendorId}/approve/`);
  return response.data;
};

/**
 * Reject a vendor application (admin only)
 * @param {string} vendorId - UUID of vendor to reject
 * @param {Object} data - { reason }
 */
export const rejectVendor = async (vendorId, data) => {
  const response = await client.post(`${API_BASE}/vendors/${vendorId}/reject/`, data);
  return response.data;
};
