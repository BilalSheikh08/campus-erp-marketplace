import api from '../api/client.js';

export const fetchVendorAnalytics = async (params = {}) => {
  const response = await api.get('/api/analytics/vendor/', { params });
  return response.data;
};

export const fetchAdminAnalytics = async (params = {}) => {
  const response = await api.get('/api/analytics/admin/', { params });
  return response.data;
};
