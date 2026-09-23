/**
 * Marketplace landing page - domain selection and featured listings.
 */

import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const DOMAINS = [
  {
    id: 'canteen',
    label: '🍽️ Canteen',
    description: 'Order food and beverages from campus canteen',
    color: 'from-orange-500 to-red-500',
    path: '/marketplace/canteen',
  },
  {
    id: 'stationery',
    label: '📚 Stationery',
    description: 'Browse stationery items and supplies',
    color: 'from-blue-500 to-indigo-500',
    path: '/marketplace/stationery',
  },
  {
    id: 'hostel_supply',
    label: '🏠 Hostel Supplies',
    description: 'Request and order hostel essentials',
    color: 'from-green-500 to-emerald-500',
    path: '/marketplace/hostel_supply',
  },
  {
    id: 'book',
    label: '📖 Used Books',
    description: 'Buy and sell second-hand books',
    color: 'from-purple-500 to-pink-500',
    path: '/marketplace/book',
  },
];

export default function MarketplaceLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-indigo-600 text-white py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">Campus Marketplace</h1>
          <p className="text-xl text-indigo-100 max-w-2xl">
            Discover and shop from four unique campus marketplaces. From canteen meals to used
            textbooks, find everything you need in one place.
          </p>
        </div>
      </div>

      {/* Domains Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse Marketplaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DOMAINS.map(domain => (
            <button
              key={domain.id}
              onClick={() => navigate(domain.path)}
              className={`bg-gradient-to-br ${domain.color} text-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-left`}
            >
              <h3 className="text-3xl font-bold mb-2">{domain.label}</h3>
              <p className="mb-4 text-white/90">{domain.description}</p>
              <div className="flex items-center gap-2 font-semibold">
                Browse
                <ArrowRight className="h-5 w-5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-3">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse</h3>
              <p className="text-gray-600">
                Explore products from your chosen marketplace with filters and search.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-3">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Add to Cart</h3>
              <p className="text-gray-600">
                Select items and add them to your cart when you&apos;re ready to purchase.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-3">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Checkout</h3>
              <p className="text-gray-600">
                Complete your purchase securely and track your orders in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
