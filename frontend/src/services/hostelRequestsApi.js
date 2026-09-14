import api from '../api/client.js';

/**
 * Student: Submit a hostel request
 */
export const submitHostelRequest = async (data) => {
  const response = await api.post('/api/hostel-requests/', data);
  return response.data;
};

/**
 * Student: List own hostel requests
 */
export const fetchStudentHostelRequests = async (params = {}) => {
  const response = await api.get('/api/hostel-requests/student/', { params });
  return response.data;
};

/**
 * Student: Get hostel request detail
 */
export const fetchHostelRequest = async (id) => {
  const response = await api.get(`/api/hostel-requests/${id}/`);
  return response.data;
};

/**
 * Student: Cancel own hostel request
 */
export const cancelHostelRequest = async (id) => {
  const response = await api.delete(`/api/hostel-requests/${id}/`);
  return response.data;
};

/**
 * Warden: List hostel requests
 */
export const fetchWardenHostelRequests = async (params = {}) => {
  const response = await api.get('/api/hostel-requests/warden/', { params });
  return response.data;
};

/**
 * Warden: Get hostel request detail
 */
export const fetchWardenHostelRequest = async (id) => {
  const response = await api.get(`/api/hostel-requests/warden/${id}/`);
  return response.data;
};

/**
 * Warden: Transition hostel request status
 */
export const transitionHostelRequest = async (id, targetStatus, note = '') => {
  const response = await api.post(`/api/hostel-requests/${id}/transition/`, {
    target_status: targetStatus,
    note,
  });
  return response.data;
};

/**
 * Admin: List all hostel requests
 */
export const fetchAdminHostelRequests = async (params = {}) => {
  const response = await api.get('/api/hostel-requests/admin/', { params });
  return response.data;
};
