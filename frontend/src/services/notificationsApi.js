import api from '../api/client.js';

export const fetchNotifications = async (params = {}) => {
  const response = await api.get('/api/notifications/', { params });
  return response.data;
};

export const fetchUnreadCount = async () => {
  const response = await api.get('/api/notifications/unread-count/');
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/api/notifications/${id}/`, { is_read: true });
  return response.data;
};
