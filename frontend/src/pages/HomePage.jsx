/**
 * Home page - shows different content based on authentication state.
 */

import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from '../components/shared/Button';
import { ArrowRight, ShoppingCart, Users, BookOpen, Package } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Welcome Section */}
          <div className="mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xl text-gray-600">
              You&apos;re logged in as a <span className="font-semibold capitalize">{user?.role}</span>
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/profile"
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <Users className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Profile</h3>
              <p className="text-sm text-gray-600">View and edit your profile</p>
            </Link>

            {user?.role === 'student' && (
              <>
                <Link
                  to="/marketplace"
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <ShoppingCart className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Browse Catalog</h3>
                  <p className="text-sm text-gray-600">Shop from all domains</p>
                </Link>

                <Link
                  to="/cart"
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <Package className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Shopping Cart</h3>
                  <p className="text-sm text-gray-600">View your cart</p>
                </Link>

                <Link
                  to="/orders"
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <BookOpen className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Orders</h3>
                  <p className="text-sm text-gray-600">View your orders</p>
                </Link>
              </>
            )}

            {user?.role === 'vendor' && (
              <>
                <Link
                  to="/vendor/dashboard"
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <ShoppingCart className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Dashboard</h3>
                  <p className="text-sm text-gray-600">View your dashboard</p>
                </Link>

                <Link
                  to="/vendor/listings"
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <Package className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Listings</h3>
                  <p className="text-sm text-gray-600">Manage your products</p>
                </Link>

                <Link
                  to="/vendor/orders"
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <BookOpen className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Orders</h3>
                  <p className="text-sm text-gray-600">View incoming orders</p>
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <ShoppingCart className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Dashboard</h3>
                  <p className="text-sm text-gray-600">View admin dashboard</p>
                </Link>

                <Link
                  to="/admin/vendors"
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <Users className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Vendors</h3>
                  <p className="text-sm text-gray-600">Review vendor applications</p>
                </Link>

                <Link
                  to="/admin/orders"
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <Package className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Orders</h3>
                  <p className="text-sm text-gray-600">View all orders</p>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-4xl">C</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 sm:text-6xl">
            Campus ERP Marketplace
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your unified platform for canteen ordering, stationery shopping, hostel supplies, and second-hand books.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="flex items-center gap-2">
                Sign In
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <ShoppingCart className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Canteen</h3>
            <p className="text-sm text-gray-600">Order food directly from campus canteen</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Package className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Stationery</h3>
            <p className="text-sm text-gray-600">Buy quality stationery items</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Users className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Hostel Supplies</h3>
            <p className="text-sm text-gray-600">Request hostel essentials</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <BookOpen className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Used Books</h3>
            <p className="text-sm text-gray-600">Buy and sell textbooks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
