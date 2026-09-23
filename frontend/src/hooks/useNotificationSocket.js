import { useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import { getAccessToken } from '../utils/storage';

function getWebSocketBase() {
  if (import.meta.env.VITE_WS_BASE_URL) {
    return import.meta.env.VITE_WS_BASE_URL.replace(/\/$/, '');
  }
  const apiBase = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '');
  if (apiBase.startsWith('https://')) return `wss://${apiBase.slice('https://'.length)}`;
  if (apiBase.startsWith('http://')) return `ws://${apiBase.slice('http://'.length)}`;
  return apiBase;
}

export default function useNotificationSocket() {
  const { isAuthenticated } = useAuthStore();
  const pushNotification = useNotificationStore((state) => state.pushNotification);
  const syncUnreadCount = useNotificationStore((state) => state.syncUnreadCount);
  const socketRef = useRef(null);
  const retryRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined' || typeof WebSocket === 'undefined') {
      return undefined;
    }

    let disposed = false;
    let retryDelay = 1000;

    const connect = () => {
      if (disposed) return;
      const token = getAccessToken();
      if (!token) return;

      const url = `${getWebSocketBase()}/ws/notifications/?token=${encodeURIComponent(token)}`;
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        retryDelay = 1000;
      };
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification.created' && data.notification) {
            pushNotification(data.notification);
          }
          if (data.type === 'notification.sync') {
            syncUnreadCount(data.unread_count);
          }
        } catch (error) {
          console.error('Invalid notification WebSocket payload:', error);
        }
      };
      socket.onclose = () => {
        socketRef.current = null;
        if (disposed) return;
        retryRef.current = window.setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 15000);
      };
      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      disposed = true;
      if (retryRef.current) window.clearTimeout(retryRef.current);
      if (socketRef.current) socketRef.current.close();
      socketRef.current = null;
    };
  }, [isAuthenticated, pushNotification, syncUnreadCount]);
}
