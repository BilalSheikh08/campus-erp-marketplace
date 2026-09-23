import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useNotificationStore from '../store/notificationStore';
import Button from '../components/shared/Button';
import Alert from '../components/shared/Alert';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TYPE_LABELS = { order: 'Order', hostel: 'Hostel', inventory: 'Inventory', book: 'Book', system: 'System' };

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div><p className="text-sm font-medium text-primary mb-1">Your activity</p><h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Bell className="h-8 w-8" /> Notifications</h1><p className="text-gray-600 mt-1">{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}.</p></div>
          <div className="flex flex-wrap gap-2">{['all', 'unread', 'order', 'hostel', 'inventory', 'book'].map((value) => <button key={value} type="button" onClick={() => changeFilter(value)} className={`px-3 py-1.5 rounded-full text-sm capitalize ${filter === value ? 'bg-primary text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>{value}</button>)}</div>
        </div>
        {error && <div className="mb-6"><Alert type="error" message={error} dismissible onClose={clearError} /></div>}
        {loading && notifications.length === 0 ? <LoadingSpinner message="Loading notifications..." /> : notifications.length === 0 ? <div className="bg-white rounded-xl border"><EmptyState icon={<Bell className="mx-auto h-12 w-12" />} title="You're all caught up" message="New order, hostel, inventory, and book activity will appear here." /></div> : (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="divide-y">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-5 ${notification.is_read ? 'bg-white' : 'bg-indigo-50/40'}`}>
                  <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{TYPE_LABELS[notification.notification_type] || 'Notification'}</span>{!notification.is_read && <span className="text-[10px] font-bold text-red-600">NEW</span>}</div><p className="mt-2 text-gray-900">{notification.message}</p><p className="mt-2 text-xs text-gray-500">{notification.created_at ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }) : 'Recently'}</p></div>{!notification.is_read && <Button size="sm" variant="ghost" onClick={() => markRead(notification.id).catch(() => {})}><CheckCheck className="h-4 w-4 mr-1" /> Mark read</Button>}</div>
                </div>
              ))}
            </div>
            {hasNext && <div className="p-4 border-t flex justify-center"><Button variant="secondary" onClick={showMore} loading={loading}>Load more</Button></div>}
          </div>
        )}
      </div>
    </div>
  );
}
