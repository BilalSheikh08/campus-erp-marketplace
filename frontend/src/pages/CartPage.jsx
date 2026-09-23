/**
 * Shopping cart page - display and manage cart items.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import useCartStore from '../store/cartStore';
import Button from '../components/shared/Button';
import Alert from '../components/shared/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice, getDomainLabel } from '../utils/formatters';

export default function CartPage() {
  const navigate = useNavigate();
  const [checkoutMethod, setCheckoutMethod] = useState('mock');
  const [showCheckout, setShowCheckout] = useState(false);
  const {
    items,
    isLoading,
    error,
    checkoutLoading,
    checkoutError,
    itemCount,
    subtotal,
    totalAmount,
    fetchCart,
    updateQuantity,
    removeItem,
    checkout,
    clearError,
    clearCheckoutError,
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch {
      // Error is handled in store
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeItem(cartItemId);
    } catch {
      // Error is handled in store
    }
  };

  const handleCheckout = async () => {
    try {
      clearCheckoutError();
      const result = await checkout(checkoutMethod);
      // Show success and redirect after a moment
      navigate('/orders', { state: { orders: result.orders, success: true } });
    } catch {
      // Error is handled in store
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading cart..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {itemCount()} {itemCount() === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={clearError} />
          </div>
        )}

        {checkoutError && (
          <div className="mb-6">
            <Alert type="error" message={checkoutError} dismissible onClose={clearCheckoutError} />
          </div>
        )}

        {/* Empty Cart */}
        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Start shopping to add items to your cart.
            </p>
            <Button onClick={() => navigate('/marketplace')}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y">
                  {items.map(item => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-4">
                        {/* Item Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded">
                                  {getDomainLabel(item.category_type)}
                                </span>
                                <span>Stock: {item.stock_status}</span>
                              </div>
                            </div>
                            <p className="text-lg font-bold text-primary">
                              {formatPrice(item.unit_price)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-4">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={item.quantity}
                              onChange={e =>
                                handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                              }
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                            />
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <span className="text-sm text-gray-600 ml-auto">
                              Subtotal: {formatPrice(item.unit_price * item.quantity)}
                            </span>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 hover:bg-red-50 rounded text-red-600 hover:text-red-700"
                          title="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary & Checkout */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

                {/* Summary Details */}
                <div className="space-y-4 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>To be calculated</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between mb-6">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(totalAmount())}
                  </span>
                </div>

                {/* Checkout Button */}
                {!showCheckout ? (
                  <Button
                    size="lg"
                    className="w-full mb-3"
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceed to Checkout
                  </Button>
                ) : (
                  <>
                    {/* Payment Method Selection */}
                    <div className="mb-4 space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Payment Method
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="mock"
                          checked={checkoutMethod === 'mock'}
                          onChange={e => setCheckoutMethod(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Test Payment</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="cash_on_pickup"
                          checked={checkoutMethod === 'cash_on_pickup'}
                          onChange={e => setCheckoutMethod(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Cash on Pickup</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="campus_wallet"
                          checked={checkoutMethod === 'campus_wallet'}
                          onChange={e => setCheckoutMethod(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Campus Wallet</span>
                      </label>
                    </div>

                    {/* Checkout Buttons */}
                    <Button
                      size="lg"
                      className="w-full mb-2"
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      loading={checkoutLoading}
                    >
                      {checkoutLoading ? 'Processing...' : 'Complete Order'}
                    </Button>
                    <Button
                      size="lg"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setShowCheckout(false)}
                      disabled={checkoutLoading}
                    >
                      Back to Cart
                    </Button>
                  </>
                )}

                {/* Continue Shopping */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => navigate('/marketplace')}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
