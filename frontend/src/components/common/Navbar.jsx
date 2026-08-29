/**
 * Application header/navbar for public and authenticated states.
 */

import { Link } from 'react-router-dom';
import { LogOut, User, Menu, X, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import Button from '../shared/Button';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount, fetchCart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch cart when authenticated user mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch(() => {
        // Silently fail if cart doesn't exist yet
      });
    }
  }, [isAuthenticated, fetchCart]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-gray-900 hidden sm:inline">
              Campus ERP
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, <span className="font-medium">{user?.name}</span>
                </span>
                <div className="flex items-center gap-2">
                  {/* Vendor Dashboard Link */}
                  {user?.role === 'vendor' && (
                    <Link to="/vendor/dashboard">
                      <Button variant="ghost" size="sm">
                        Vendor Dashboard
                      </Button>
                    </Link>
                  )}
                  {/* Cart Icon */}
                  <Link to="/cart" className="relative">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Cart
                      {itemCount() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {itemCount()}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-600">
                  Welcome, <span className="font-medium">{user?.name}</span>
                </div>
                {user?.role === 'vendor' && (
                  <Link
                    to="/vendor/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      Vendor Dashboard
                    </Button>
                  </Link>
                )}
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart {itemCount() > 0 && `(${itemCount()})`}
                  </Button>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full">Register</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
