import { create } from 'zustand';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
} from '../services/notificationsApi';

function normalizeListResponse(data) {
  return {
    items: Array.isArray(data) ? data : (data?.results || []),
    count: Array.isArray(data) ? data.length : (data?.count ?? 0),
    next: Array.isArray(data) ? null : data?.next,
  };
}

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  hasNext: false,

  refreshUnreadCount: async () => {
    try {
      const data = await fetchUnreadCount();
      set({ unreadCount: Number(data?.unread_count || 0) });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to load notification count.' });
      throw error;
    }
  },

  loadNotifications: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchNotifications(params);
      const normalized = normalizeListResponse(data);
      set((state) => ({
        notifications: params.page && Number(params.page) > 1
          ? [...state.notifications, ...normalized.items]
          : normalized.items,
        hasNext: Boolean(normalized.next),
        loading: false,
      }));
      await get().refreshUnreadCount();
      return data;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.detail || 'Failed to load notifications.',
      });
      throw error;
    }
  },

  markRead: async (id) => {
    const updated = await markNotificationRead(id);
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - (state.notifications.find((n) => n.id === id && !n.is_read) ? 1 : 0)),
      notifications: state.notifications.map((notification) => (
        notification.id === id ? updated : notification
      )),
    }));
    return updated;
  },

  pushNotification: (notification) => {
    set((state) => {
      const alreadyPresent = state.notifications.some((item) => item.id === notification.id);
      const nextUnread = notification.is_read
        ? state.unreadCount
        : alreadyPresent
          ? state.unreadCount
          : state.unreadCount + 1;
      return {
        notifications: [
          notification,
          ...state.notifications.filter((item) => item.id !== notification.id),
        ].slice(0, 100),
        unreadCount: nextUnread,
      };
    });
  },

  syncUnreadCount: (count) => set({ unreadCount: Number(count || 0) }),
  clearError: () => set({ error: null }),
}));

export default useNotificationStore;
