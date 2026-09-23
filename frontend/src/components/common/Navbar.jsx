/**
 * Professional Application Header / Navbar.
 * Supports glassmorphism styling, public exploratory links,
 * authenticated role-contextual routing, animated notification drawer,
 * and user profile menu.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Store,
  User,
  X,
  Building,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useNotificationStore from '../../store/notificationStore';
import { fetchNotifications } from '../../services/notificationsApi';
import Button from '../shared/Button';

const TYPE_LABELS = {
  order: 'Order',
  hostel: 'Hostel',
  inventory: 'Inventory',
  book: 'Book',
  system: 'System',
};

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount, fetchCart } = useCartStore();
  const { unreadCount, refreshUnreadCount, pushNotification, notifications, markRead } =
    useNotificationStore();

  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [latestLoading, setLatestLoading] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Poll notifications count periodically when authenticated
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    fetchCart().catch(() => {});
    refreshUnreadCount().catch(() => {});
    const interval = window.setInterval(() => {
      refreshUnreadCount().catch(() => {});
    }, 60000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, fetchCart, refreshUnreadCount]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadLatest = async () => {
    setLatestLoading(true);
    try {
      const data = await fetchNotifications({ page: 1, page_size: 5 });
      const latest = Array.isArray(data) ? data : data?.results || [];
      latest.forEach((notification) => {
        pushNotification(notification);
      });
    } catch (error) {
      console.error('Failed to load latest notifications:', error);
    } finally {
      setLatestLoading(false);
    }
  };

  const toggleNotifications = async () => {
    const next = !notificationsOpen;
    setNotificationsOpen(next);
    if (next && notifications.length === 0) {
      await loadLatest();
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const role = user?.role;
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="font-extrabold text-xl tracking-tight">C</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-none">
                  Campus<span className="text-indigo-600">ERP</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase tracking-wider hidden sm:inline-block">
                  Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Marketplace & Logistics
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* Universal & Guest Exploratory Links */}
            <Link
              to="/marketplace"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/marketplace')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Marketplace
            </Link>

            <Link
              to="/books"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/books')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Used Books</span>
            </Link>

            {/* Role-Specific Shortcuts for Authenticated Users */}
            {isAuthenticated && role === 'student' && (
              <>
                <Link
                  to="/hostel-requests"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/hostel-requests')
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Hostel</span>
                </Link>
                <Link
                  to="/orders"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/orders')
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  Orders
                </Link>
              </>
            )}

            {isAuthenticated && role === 'vendor' && (
              <>
                <Link
                  to="/vendor/dashboard"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/vendor/dashboard')
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Store className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/vendor/listings"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/vendor/listings')
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  Listings
                </Link>
                <Link
                  to="/vendor/inventory"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/vendor/inventory')
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  Stock
                </Link>
                <Link
                  to="/vendor/analytics"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/vendor/analytics')
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
              </>
            )}

            {isAuthenticated && role === 'warden' && (
              <>
                <Link
                  to="/warden/dashboard"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/warden/dashboard')
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="h-4 w-4" />
                  <span>Desk</span>
                </Link>
                <Link
                  to="/warden/requests"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/warden/requests')
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  Requests
                </Link>
              </>
            )}

            {isAuthenticated && role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/admin/dashboard')
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  Admin
                </Link>
                <Link
                  to="/admin/vendors"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/admin/vendors')
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  Vendors
                </Link>
                <Link
                  to="/admin/analytics"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/analytics')
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
              </>
            )}

            {/* Informational Links */}
            <Link
              to="/about"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/about')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/contact')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Help & Directory
            </Link>
          </nav>

          {/* Right Action Icons & Auth Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Cart Icon */}
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                  aria-label="View shopping cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[11px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center shadow-sm">
                      {itemCount() > 99 ? '99+' : itemCount()}
                    </span>
                  )}
                </Link>

                {/* Notifications Popover */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={toggleNotifications}
                    className="relative p-2.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                    aria-label="Open notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4.5 min-w-4.5 px-1 flex items-center justify-center animate-pulse shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-3 w-96 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Notifications</p>
                          <p className="text-xs text-slate-500">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
                        </div>
                        <Link
                          to="/notifications"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          View all
                        </Link>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {latestLoading ? (
                          <p className="px-5 py-8 text-center text-xs text-slate-500">Loading notifications...</p>
                        ) : notifications.length === 0 ? (
                          <div className="px-5 py-8 text-center">
                            <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-500 font-medium">All caught up! No notifications.</p>
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notification) => (
                            <button
                              type="button"
                              key={notification.id}
                              onClick={() => {
                                if (!notification.is_read) {
                                  markRead(notification.id).catch(() => {});
                                }
                              }}
                              className={`w-full text-left px-5 py-3.5 transition-colors ${
                                notification.is_read ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/70 hover:bg-indigo-50'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded">
                                  {TYPE_LABELS[notification.notification_type] || 'Notice'}
                                </span>
                                {!notification.is_read && (
                                  <span className="text-[10px] font-bold text-red-600">UNREAD</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-800 line-clamp-2 font-medium">
                                {notification.message}
                              </p>
                            </button>
                          ))
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-xs font-semibold text-slate-700 hover:text-indigo-600"
                        >
                          Open Notification Center &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Avatar Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {userInitials}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {user?.name || 'Account'}
                      </div>
                      <div className="text-[10px] font-semibold text-indigo-600 capitalize">
                        {role}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 hidden lg:block" />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {role} Account
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          <User className="h-4 w-4" />
                          <span>Profile Settings</span>
                        </Link>

                        {role === 'student' && (
                          <>
                            <Link
                              to="/books/my-listings"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <BookOpen className="h-4 w-4" />
                              <span>My Book Listings</span>
                            </Link>
                            <Link
                              to="/orders"
                              onClick={() => setProfileMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <Package className="h-4 w-4" />
                              <span>Order History</span>
                            </Link>
                          </>
                        )}

                        {role !== 'vendor' && (
                          <Link
                            to="/become-vendor"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                          >
                            <Store className="h-4 w-4" />
                            <span>Become a Vendor</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            setProfileMenuOpen(false);
                            await handleLogout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-slate-700 hover:text-indigo-600">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {isAuthenticated ? (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center">
                {userInitials}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs text-indigo-600 capitalize font-medium">{role} Account</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full">Sign In</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Register</Button>
              </Link>
            </div>
          )}

          <div className="space-y-1 font-semibold text-sm">
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
            >
              <Store className="h-4 w-4" />
              <span>Campus Marketplace</span>
            </Link>

            <Link
              to="/books"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
            >
              <BookOpen className="h-4 w-4" />
              <span>Used Books Exchange</span>
            </Link>

            {isAuthenticated && role === 'student' && (
              <>
                <Link
                  to="/hostel-requests"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <Home className="h-4 w-4" />
                  <span>Hostel Supplies</span>
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <Package className="h-4 w-4" />
                  <span>Order History</span>
                </Link>
                <Link
                  to="/books/my-listings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>My Book Listings</span>
                </Link>
              </>
            )}

            {isAuthenticated && role === 'vendor' && (
              <>
                <Link
                  to="/vendor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <Store className="h-4 w-4" />
                  <span>Vendor Dashboard</span>
                </Link>
                <Link
                  to="/vendor/inventory"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <Package className="h-4 w-4" />
                  <span>Manage Inventory</span>
                </Link>
                <Link
                  to="/vendor/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Vendor Analytics</span>
                </Link>
              </>
            )}

            {isAuthenticated && role === 'warden' && (
              <>
                <Link
                  to="/warden/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <Building className="h-4 w-4" />
                  <span>Warden Dashboard</span>
                </Link>
                <Link
                  to="/warden/requests"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <Home className="h-4 w-4" />
                  <span>Review Requisitions</span>
                </Link>
              </>
            )}

            {isAuthenticated && role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <Building className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
                <Link
                  to="/admin/vendors"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                >
                  <Store className="h-4 w-4" />
                  <span>Vendor Approvals</span>
                </Link>
              </>
            )}

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
            >
              <Sparkles className="h-4 w-4" />
              <span>About Platform</span>
            </Link>

            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
            >
              <User className="h-4 w-4" />
              <span>Help & Directory</span>
            </Link>
          </div>

          {isAuthenticated && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-slate-700 hover:text-indigo-600"
              >
                Profile Settings
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await handleLogout();
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-800"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
