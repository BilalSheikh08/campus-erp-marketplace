/**
 * Campus Commons - Notifications & Order Activity Feed
 * Filterable alert tray for order transitions, hostel requisitions, and peer messages.
 */

import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useNotificationStore from '../store/notificationStore';
import Button from '../components/shared/Button';
import Alert from '../components/shared/Alert';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TYPE_LABELS = {
  order: 'Order Update',
  hostel: 'Hostel Requisition',
  inventory: 'Stock Alert',
  book: 'Peer Exchange',
  system: 'Campus System',
};

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, error, hasNext, loadNotifications, markRead, clearError } = useNotificationStore();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');

  const load = useCallback((targetPage = 1, targetFilter = filter) => {
    const params = { page: targetPage, page_size: 20 };
    if (targetFilter === 'unread') params.unread = 'true';
    if (targetFilter !== 'all' && !['unread'].includes(targetFilter)) params.notification_type = targetFilter;
    return loadNotifications(params).then(() => setPage(targetPage)).catch(() => {});
  }, [filter, loadNotifications]);

  useEffect(() => { load(1, filter); }, [filter, load]);

  const changeFilter = (value) => setFilter(value);
  const showMore = () => load(page + 1, filter);

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Bell className="h-7 w-7 text-blue-600" /> Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount === 1 ? '' : 's'}` : 'All notifications caught up'}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['all', 'unread', 'order', 'hostel', 'inventory', 'book'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => changeFilter(value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                  filter === value
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={clearError} />
          </div>
        )}

        {loading && notifications.length === 0 ? (
          <LoadingSpinner message="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <EmptyState
              icon={<Inbox className="mx-auto h-12 w-12 text-slate-300" />}
              title="No notifications"
              message="Status updates for orders and hostel requisitions will appear here."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  n.read ? 'bg-white border-slate-200' : 'bg-blue-50/50 border-blue-200 shadow-xs'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {TYPE_LABELS[n.notification_type] || n.notification_type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.body || n.message}</p>
                </div>

                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100/60 rounded-xl transition cursor-pointer"
                    title="Mark as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {hasNext && (
              <div className="text-center pt-6">
                <Button variant="outline" size="sm" onClick={showMore} loading={loading}>
                  Load More Notifications
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
