import apiClient from './apiClient';

/**
 * Student: Submit a hostel request
 */
export const submitHostelRequest = async (data) => {
  const response = await apiClient.post('/hostel-requests/', data);
  return response.data;
};

/**
 * Student: List own hostel requests
 */
export const fetchStudentHostelRequests = async (params = {}) => {
  const response = await apiClient.get('/student/hostel-requests/', { params });
  return response.data;
};

/**
 * Student: Get hostel request detail
 */
export const fetchHostelRequest = async (id) => {
  const response = await apiClient.get(`/hostel-requests/${id}/`);
  return response.data;
};

/**
 * Student: Cancel own hostel request
 */
export const cancelHostelRequest = async (id) => {
  const response = await apiClient.post(`/hostel-requests/${id}/transition/`, {
    action: 'cancel',
  });
  return response.data;
};

/**
 * Warden: List hostel requests
 */
export const fetchWardenHostelRequests = async (params = {}) => {
  const response = await apiClient.get('/warden/hostel-requests/', { params });
  return response.data;
};

/**
 * Warden: Get hostel request detail
 */
export const fetchWardenHostelRequest = async (id) => {
  const response = await apiClient.get(`/warden/hostel-requests/${id}/`);
  return response.data;
};

/**
 * Warden: Transition hostel request status
 */
export const transitionHostelRequest = async (id, action, notes = '') => {
  const response = await apiClient.post(`/hostel-requests/${id}/transition/`, {
    action,
    notes,
  });
  return response.data;
};

/**
 * Admin: List all hostel requests
 */
export const fetchAdminHostelRequests = async (params = {}) => {
  const response = await apiClient.get('/admin/hostel-requests/', { params });
  return response.data;
};
