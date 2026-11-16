/**
 * Campus Commons - Dispatch Bulletins & Notifications
 * Official Campus Notice Board & Dispatch Bulletins:
 * Order status transitions, hostel requisition endorsements, and peer textbook exchanges.
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
  order: 'Order Dispatch',
  hostel: 'Hostel Requisition',
  inventory: 'Stock Alert',
  book: 'Textbook Exchange',
  system: 'Campus Notice',
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
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <Bell className="h-3.5 w-3.5 text-zinc-700" />
              <span>DISPATCH BOARD · ACTIVE CAMPUS BULLETINS</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              Notices &amp; Dispatch Bulletins
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-mono">
              {unreadCount > 0 ? `${unreadCount} unread dispatch bulletin${unreadCount === 1 ? '' : 's'}` : 'All bulletins verified'}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 font-mono">
            {['all', 'unread', 'order', 'hostel', 'inventory', 'book'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => changeFilter(value)}
                className={`px-3 py-1 rounded text-xs transition-colors cursor-pointer ${
                  filter === value
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'bg-white border border-[#E4DDCF] text-zinc-700 hover:bg-[#FAF8F3]'
                }`}
              >
                {value.toUpperCase()}
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
          <LoadingSpinner message="Consulting campus dispatch bulletins..." />
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-12 text-center shadow-xs">
            <EmptyState
              icon={<Inbox className="mx-auto h-10 w-10 text-zinc-300" />}
              title="No bulletins registered"
              message="Status notifications for meals, stationery orders, and hostel requisitions will appear here."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 sm:p-5 rounded-lg border transition-colors flex items-start justify-between gap-4 ${
                  n.read ? 'bg-white border-[#E4DDCF]' : 'bg-[#FAF8F3] border-blue-900/40 ring-1 ring-blue-900/10'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#E4DDCF] bg-white text-zinc-800">
                      {TYPE_LABELS[n.notification_type] || n.notification_type}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-zinc-950">{n.title}</h3>
                  <p className="text-xs text-zinc-700 mt-1 leading-relaxed font-sans">{n.body || n.message}</p>
                </div>

                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-white rounded border border-[#E4DDCF] transition-colors cursor-pointer shrink-0"
                    title="Mark bulletin as acknowledged"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}

            {hasNext && (
              <div className="text-center pt-6">
                <Button variant="outline" size="sm" onClick={showMore} loading={loading} className="text-xs font-mono">
                  Load Older Bulletins
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
