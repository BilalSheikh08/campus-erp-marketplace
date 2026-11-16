/**
 * Campus Commons / Exchange Navigation Header
 * Modern, elevated university marketplace navigation with role-specific workspaces,
 * active cart badge, and responsive drawer.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Building2,
  Store,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cartItemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Academic Bar */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 bg-slate-900 text-slate-300 text-[11px] font-medium tracking-wide">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-white font-semibold">
            <Sparkles className="h-3 w-3 text-amber-400" />
            University Campus Exchange &amp; Logistics
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Express Counter Pickups Active</span>
        </div>
        <div className="flex items-center gap-5 text-slate-300">
          <Link to="/about" className="hover:text-white transition">About System</Link>
          <Link to="/contact" className="hover:text-white transition">Campus Directory</Link>
          {user && (
            <span className="text-amber-400 font-semibold flex items-center gap-1 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Role: {user.role?.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo / Monogram */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-md border border-slate-800 group-hover:scale-105 transition-transform">
              <span className="font-editorial text-amber-400">U</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">
                  CAMPUS<span className="text-blue-600">HUB</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Exchange
                </span>
              </div>
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-500">
                Marketplace &amp; Dining Logistics
              </p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold tracking-wide">
            <Link
              to="/marketplace"
              className={`px-3.5 py-2 rounded-xl transition ${
                isActive('/marketplace') && !isActive('/marketplace/hostel_supply')
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Marketplace
            </Link>

            <Link
              to="/books"
              className={`px-3.5 py-2 rounded-xl transition ${
                isActive('/books')
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Used Books
            </Link>

            {user?.role === 'student' && (
              <Link
                to="/hostel-requests"
                className={`px-3.5 py-2 rounded-xl transition ${
                  isActive('/hostel-requests')
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Hostel Requests
              </Link>
            )}

            {user?.role === 'vendor' && (
              <Link
                to="/vendor/dashboard"
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  isActive('/vendor')
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Store className="h-3.5 w-3.5 text-orange-500" />
                Merchant Desk
              </Link>
            )}

            {user?.role === 'warden' && (
              <Link
                to="/warden/dashboard"
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  isActive('/warden')
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                Residence Desk
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Shield className="h-3.5 w-3.5 text-blue-600" />
                Governance Desk
              </Link>
            )}

            <Link
              to="/about"
              className={`px-3.5 py-2 rounded-xl transition ${
                isActive('/about')
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition shadow-xs flex items-center justify-center group"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Authenticated User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition text-left cursor-pointer shadow-xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {user?.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                      {user?.name || 'Account'}
                    </p>
                    <p className="text-[10px] font-medium capitalize text-slate-500">{user?.role}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="font-bold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700 transition"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        My Profile
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700 transition"
                      >
                        <Clock className="h-4 w-4 text-slate-400" />
                        My Orders &amp; PIN Tokens
                      </Link>

                      {user?.role === 'vendor' && (
                        <Link
                          to="/vendor/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700 transition"
                        >
                          <Store className="h-4 w-4 text-orange-500" />
                          Merchant Dashboard
                        </Link>
                      )}

                      {user?.role === 'warden' && (
                        <Link
                          to="/warden/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700 transition"
                        >
                          <Building2 className="h-4 w-4 text-emerald-600" />
                          Warden Residence Desk
                        </Link>
                      )}

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700 transition"
                        >
                          <Shield className="h-4 w-4 text-blue-600" />
                          Governance Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer font-medium"
                      >
                        <LogOut className="h-4 w-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Marketplace
          </Link>
          <Link
            to="/books"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Used Books
          </Link>
          {user?.role === 'student' && (
            <Link
              to="/hostel-requests"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Hostel Requests
            </Link>
          )}
          {user?.role === 'vendor' && (
            <Link
              to="/vendor/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Merchant Desk
            </Link>
          )}
          {user?.role === 'warden' && (
            <Link
              to="/warden/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Residence Desk
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Governance Desk
            </Link>
          )}
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            About System
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Campus Directory
          </Link>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
