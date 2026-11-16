/**
 * Campus Commons / Exchange Navigation Header
 * Redesigned with university publication & dispatch desk aesthetic:
 * warm paper palette, crisp ink rules, official role stamps, and legible navigation.
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
  Landmark,
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

  const getLogoDestination = () => {
    if (!isAuthenticated || !user) return '/';
    if (user.role === 'vendor') return '/vendor/dashboard';
    if (user.role === 'warden') return '/warden/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const showCart = !isAuthenticated || user?.role === 'student';

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return { label: 'Student Desk', bg: 'bg-blue-50 text-blue-900 border-blue-200' };
      case 'vendor':
        return { label: 'Merchant Dispatch', bg: 'bg-amber-50 text-amber-900 border-amber-200' };
      case 'warden':
        return { label: 'Superintendent', bg: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
      case 'admin':
        return { label: 'Platform Registrar', bg: 'bg-purple-50 text-purple-900 border-purple-200' };
      default:
        return { label: 'Campus Guest', bg: 'bg-zinc-100 text-zinc-800 border-zinc-200' };
    }
  };

  const roleBadge = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F3] border-b border-[#E4DDCF] shadow-xs">
      {/* Top University Dispatch Bar */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1 bg-[#18181B] text-[#D4D4D8] text-[11px] font-mono tracking-wide border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-white font-medium">
            <Landmark className="h-3 w-3 text-amber-400" />
            UNIVERSITY CAMPUS CLEARINGHOUSE &amp; DISPATCH
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 font-sans text-[11px]">Central Express Pickup &amp; Student Services</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-300 font-sans">
          <Link to="/about" className="hover:text-white transition">About System</Link>
          <Link to="/contact" className="hover:text-white transition">Directory</Link>
          {user && (
            <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border uppercase ${roleBadge.bg}`}>
              {roleBadge.label}
            </span>
          )}
        </div>
      </div>

      {/* Main Masthead Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo / Campus Seal Monogram */}
          <Link to={getLogoDestination()} className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-[#18181B] text-[#F8F6F0] flex items-center justify-center font-serif text-xl font-bold shadow-xs border border-[#27272A] group-hover:border-amber-600 transition-colors">
              <span>U</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-zinc-950">
                  CAMPUS<span className="text-blue-900">HUB</span>
                </span>
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded border border-[#E4DDCF] bg-[#F1ECE1] text-zinc-700">
                  EST. 2026
                </span>
              </div>
              <p className="text-[10px] font-sans font-medium tracking-wide uppercase text-zinc-500">
                Official Marketplace &amp; Student Requisitions
              </p>
            </div>
          </Link>

          {/* Center Role-Partitioned Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium">
            {/* Unauthenticated / Guest Links */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/marketplace"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/marketplace') && !isActive('/marketplace/hostel_supply')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Marketplace Catalog
                </Link>
                <Link
                  to="/books"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/books')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Used Textbooks
                </Link>
                <Link
                  to="/about"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/about')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  About Concessions
                </Link>
                <Link
                  to="/contact"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/contact')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Campus Directory
                </Link>
              </>
            )}

            {/* Student Navigation Links */}
            {isAuthenticated && user?.role === 'student' && (
              <>
                <Link
                  to="/marketplace"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/marketplace') && !isActive('/marketplace/hostel_supply')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Marketplace
                </Link>
                <Link
                  to="/books"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/books')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Used Textbooks
                </Link>
                <Link
                  to="/hostel-requests"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/hostel-requests')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Hostel Requisitions
                </Link>
                <Link
                  to="/orders"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/orders')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  My Orders &amp; PINs
                </Link>
              </>
            )}

            {/* Vendor Navigation Links */}
            {isAuthenticated && user?.role === 'vendor' && (
              <>
                <Link
                  to="/vendor/dashboard"
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/vendor/dashboard'
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  <Store className="h-3.5 w-3.5 text-amber-500" />
                  Order Dispatch Desk
                </Link>
                <Link
                  to="/vendor/listings"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/vendor/listings')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Catalog &amp; Menu
                </Link>
                <Link
                  to="/vendor/inventory"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/vendor/inventory')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Stock Control
                </Link>
                <Link
                  to="/vendor/analytics"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/vendor/analytics')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Sales Ledger
                </Link>
                <Link
                  to="/marketplace"
                  className="px-3 py-1.5 rounded-md transition-colors text-zinc-500 hover:text-zinc-900 hover:bg-[#F1ECE1]"
                >
                  Browse Catalog
                </Link>
              </>
            )}

            {/* Warden Navigation Links */}
            {isAuthenticated && user?.role === 'warden' && (
              <>
                <Link
                  to="/warden/dashboard"
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/warden/dashboard'
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                  Superintendent Desk
                </Link>
                <Link
                  to="/warden/requests"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/warden/requests')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Requisition Docket Queue
                </Link>
                <Link
                  to="/marketplace/hostel_supply"
                  className="px-3 py-1.5 rounded-md transition-colors text-zinc-500 hover:text-zinc-900 hover:bg-[#F1ECE1]"
                >
                  Hostel Supply Stock
                </Link>
              </>
            )}

            {/* Admin Navigation Links */}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                    location.pathname === '/admin/dashboard'
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5 text-purple-600" />
                  Registrar Console
                </Link>
                <Link
                  to="/admin/vendors"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/admin/vendors')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Vendor Permits
                </Link>
                <Link
                  to="/admin/orders"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/admin/orders')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Order Surveillance
                </Link>
                <Link
                  to="/admin/listings"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/admin/listings')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Catalog Moderation
                </Link>
                <Link
                  to="/admin/analytics"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive('/admin/analytics')
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-[#F1ECE1]'
                  }`}
                >
                  Platform Analytics
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Controls & User Identity */}
          <div className="flex items-center gap-3">
            {/* Cart Button: Visible for guests (redirects to login) and students */}
            {showCart && (
              <Link
                to="/cart"
                className="relative p-2 rounded-md border border-[#E4DDCF] bg-white text-zinc-800 hover:bg-[#FAF8F3] transition shadow-xs flex items-center justify-center group"
                aria-label="View Shopping Cart"
              >
                <ShoppingCart className="h-4.5 w-4.5 group-hover:text-blue-900 transition-colors" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white font-mono font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-xs">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Authenticated User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-md border border-[#E4DDCF] bg-white hover:bg-[#FAF8F3] transition text-left cursor-pointer shadow-xs"
                >
                  <div className="w-7 h-7 rounded bg-zinc-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                    {user?.name ? user.name[0].toUpperCase() : <User className="h-3.5 w-3.5" />}
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-xs font-semibold text-zinc-900 truncate max-w-[120px]">
                      {user?.name || 'Account'}
                    </p>
                    <p className="text-[10px] font-mono uppercase text-zinc-500">{user?.role}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-[#E4DDCF] shadow-lg py-1.5 z-50 text-xs animate-in fade-in duration-100">
                    <div className="px-3.5 py-2.5 border-b border-[#E4DDCF] bg-[#FAF8F3]">
                      <p className="font-semibold text-zinc-900">{user?.name}</p>
                      <p className="text-[11px] font-mono text-zinc-500 truncate">{user?.email}</p>
                      <span className={`inline-block mt-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${roleBadge.bg}`}>
                        {roleBadge.label}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F3] text-zinc-700 transition"
                      >
                        <User className="h-3.5 w-3.5 text-zinc-400" />
                        Campus ID &amp; Profile
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F3] text-zinc-700 transition"
                      >
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                        Pickup Vouchers &amp; History
                      </Link>

                      {user?.role === 'vendor' && (
                        <Link
                          to="/vendor/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F3] text-zinc-700 transition"
                        >
                          <Store className="h-3.5 w-3.5 text-amber-600" />
                          Merchant Order Desk
                        </Link>
                      )}

                      {user?.role === 'warden' && (
                        <Link
                          to="/warden/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F3] text-zinc-700 transition"
                        >
                          <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                          Superintendent Desk
                        </Link>
                      )}

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F3] text-zinc-700 transition"
                        >
                          <Shield className="h-3.5 w-3.5 text-purple-600" />
                          Registrar Governance Console
                        </Link>
                      )}

                      {user?.role !== 'student' && (
                        <Link
                          to="/marketplace"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#FAF8F3] text-zinc-700 transition"
                        >
                          <Store className="h-3.5 w-3.5 text-zinc-400" />
                          Browse Public Catalog
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-[#E4DDCF] pt-1 mt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-800 hover:bg-red-50 transition text-left cursor-pointer font-medium"
                      >
                        <LogOut className="h-3.5 w-3.5 text-red-700" />
                        Sign Out of Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-800 hover:bg-[#F1ECE1] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-blue-900 text-white hover:bg-blue-950 transition shadow-xs"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-md border border-[#E4DDCF] bg-white text-zinc-800 hover:bg-[#FAF8F3] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E4DDCF] bg-[#FAF8F3] px-4 pt-3 pb-6 space-y-1.5 animate-in slide-in-from-top-1 duration-100">
          {/* Guest Links */}
          {!isAuthenticated && (
            <>
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Marketplace Catalog
              </Link>
              <Link
                to="/books"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Used Textbooks
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-600 hover:bg-[#F1ECE1]"
              >
                About Concessions
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-600 hover:bg-[#F1ECE1]"
              >
                Campus Directory
              </Link>
            </>
          )}

          {/* Student Links */}
          {isAuthenticated && user?.role === 'student' && (
            <>
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Marketplace Catalog
              </Link>
              <Link
                to="/books"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Used Textbooks
              </Link>
              <Link
                to="/hostel-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Hostel Requisitions
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                My Orders &amp; Pickup Tokens
              </Link>
            </>
          )}

          {/* Vendor Links */}
          {isAuthenticated && user?.role === 'vendor' && (
            <>
              <Link
                to="/vendor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Order Dispatch Desk
              </Link>
              <Link
                to="/vendor/listings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Catalog &amp; Menu
              </Link>
              <Link
                to="/vendor/inventory"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Stock Control
              </Link>
              <Link
                to="/vendor/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Sales Ledger
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-500 hover:bg-[#F1ECE1]"
              >
                Browse Catalog
              </Link>
            </>
          )}

          {/* Warden Links */}
          {isAuthenticated && user?.role === 'warden' && (
            <>
              <Link
                to="/warden/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Superintendent Desk
              </Link>
              <Link
                to="/warden/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Requisitions Docket Queue
              </Link>
              <Link
                to="/marketplace/hostel_supply"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-500 hover:bg-[#F1ECE1]"
              >
                Hostel Supply Stock
              </Link>
            </>
          )}

          {/* Admin Links */}
          {isAuthenticated && user?.role === 'admin' && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Registrar Platform Console
              </Link>
              <Link
                to="/admin/vendors"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Vendor Permits
              </Link>
              <Link
                to="/admin/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Order Surveillance
              </Link>
              <Link
                to="/admin/listings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Catalog Moderation
              </Link>
              <Link
                to="/admin/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-900 hover:bg-[#F1ECE1]"
              >
                Platform Analytics
              </Link>
            </>
          )}

          {!isAuthenticated && (
            <div className="pt-3 border-t border-[#E4DDCF] flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-md border border-[#E4DDCF] bg-white text-xs font-semibold text-zinc-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-md bg-blue-900 text-white text-xs font-semibold"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
