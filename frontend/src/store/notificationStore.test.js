import useNotificationStore from './notificationStore';
import { fetchUnreadCount, markNotificationRead } from '../services/notificationsApi';

jest.mock('../services/notificationsApi', () => ({
  fetchNotifications: jest.fn(),
  fetchUnreadCount: jest.fn(),
  markNotificationRead: jest.fn(),
}));

describe('notificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      hasNext: false,
    });
    fetchUnreadCount.mockResolvedValue({ unread_count: 0 });
    markNotificationRead.mockReset();
  });

  test('deduplicates websocket notifications', () => {
    const notification = { id: 'n1', is_read: false, message: 'Hello' };
    useNotificationStore.getState().pushNotification(notification);
    useNotificationStore.getState().pushNotification(notification);

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.unreadCount).toBe(1);
  });

  test('markRead decrements unread count exactly once', async () => {
    const notification = { id: 'n1', is_read: false, message: 'Hello' };
    useNotificationStore.setState({ notifications: [notification], unreadCount: 1 });
    markNotificationRead.mockResolvedValue({ ...notification, is_read: true });

    await useNotificationStore.getState().markRead('n1');

    expect(useNotificationStore.getState().unreadCount).toBe(0);
    expect(useNotificationStore.getState().notifications[0].is_read).toBe(true);
  });
});
