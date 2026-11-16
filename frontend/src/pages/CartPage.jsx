/**
 * Campus Commons - Shopping Cart & Express Checkout
 * Scannable order review, payment method selector, and instant counter token generation.
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  QrCode,
  Banknote,
  ArrowRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import useCartStore from '../store/cartStore';
import Button from '../components/shared/Button';
import Alert from '../components/shared/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SafeImage from '../components/shared/SafeImage';
import { formatPrice, getDomainLabel } from '../utils/formatters';

export default function CartPage() {
  const navigate = useNavigate();
  const [checkoutMethod, setCheckoutMethod] = useState('cash_on_pickup');

  const {
    items = [],
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

  const safeItems = Array.isArray(items) ? items : [];

  const safeItemCount =
    typeof itemCount === 'function'
      ? itemCount()
      : safeItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  const safeSubtotal =
    typeof subtotal === 'function'
      ? subtotal()
      : safeItems.reduce(
          (sum, item) =>
            sum +
            Number(item.unit_price ?? item.price_at_addition ?? item.listing?.price ?? 0) *
              (Number(item.quantity) || 1),
          0
        );

  const safeTotal =
    typeof totalAmount === 'function'
      ? totalAmount()
      : typeof safeSubtotal === 'number'
      ? safeSubtotal
      : 0;

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch {
      // Handled in store
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeItem(cartItemId);
    } catch {
      // Handled in store
    }
  };

  const handleCheckout = async () => {
    try {
      clearCheckoutError();
      const method = checkoutMethod === 'cash' ? 'cash_on_pickup' : checkoutMethod;
      const result = await checkout(method);
      navigate('/orders', { state: { orders: result?.orders || [], success: true } });
    } catch {
      // error handled by store
    }
  };

  if (isLoading && safeItems.length === 0) {
    return <LoadingSpinner message="Loading cart items..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
              <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />
              <span>Campus Unified Checkout</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Shopping Cart &amp; Order Bag
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Review selected items. Multi-vendor orders receive distinct 4-digit pickup PINs for fast collection.
            </p>
          </div>
          <Link to="/marketplace">
            <Button variant="outline" size="sm">
              Continue Browsing
            </Button>
          </Link>
        </div>

        {/* Global Errors */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={clearError} />
          </div>
        )}

        {safeItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              You haven&apos;t added any dining meals, stationery items, or textbooks to your order bag yet.
            </p>
            <Link to="/marketplace">
              <Button variant="primary" className="px-6 py-2.5 font-bold">
                Browse Campus Marketplaces
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <span>Selected Items ({safeItemCount})</span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Direct Counter Pickup
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {safeItems.map((item) => {
                    const title = item.title || item.listing?.title || 'Campus Item';
                    const category = item.category_type || item.listing?.category_type || 'canteen';
                    const unitPrice = Number(
                      item.unit_price ?? item.price_at_addition ?? item.listing?.price ?? 0
                    );
                    const quantity = Number(item.quantity) || 1;
                    const itemSubtotal = unitPrice * quantity;
                    const imageUrl = item.image_url || item.listing?.image_url;
                    const vendorName = item.vendor_name || item.listing?.vendor_name;

                    return (
                      <div
                        key={item.id}
                        className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                            <SafeImage
                              src={imageUrl}
                              alt={title}
                              domain={category}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 inline-block mb-1">
                              {getDomainLabel(category)}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 truncate max-w-sm">
                              {title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Unit Price:{' '}
                              <span className="font-mono font-semibold text-slate-700">
                                {formatPrice(unitPrice)}
                              </span>
                            </p>
                            {vendorName && (
                              <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                                Pickup: {vendorName}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity & Price Controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {/* Quantity Counter */}
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, quantity - 1)}
                              disabled={quantity <= 1}
                              className="p-1 rounded-lg hover:bg-white text-slate-600 disabled:opacity-40 transition cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-mono font-bold text-slate-900">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, quantity + 1)}
                              className="p-1 rounded-lg hover:bg-white text-slate-600 transition cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Item Subtotal */}
                          <div className="text-right min-w-[70px]">
                            <span className="font-mono font-extrabold text-sm text-slate-900 block">
                              {formatPrice(itemSubtotal)}
                            </span>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Express Counter Guarantee */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-center gap-3 text-xs text-blue-900">
                <Clock className="h-5 w-5 text-blue-600 shrink-0" />
                <span>
                  <strong>Counter Verification Guaranteed:</strong> Upon checkout, a unique 4-digit PIN is issued for each merchant concession. Show it at the counter for instant pickup.
                </span>
              </div>
            </div>

            {/* Right: Checkout & Settlement Panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatPrice(safeSubtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Campus Counter Fee:</span>
                    <span className="font-semibold text-emerald-600">₹0.00 (Free)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Commission:</span>
                    <span className="font-semibold text-emerald-600">0% Student Rate</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="font-bold text-sm text-slate-900">Grand Total:</span>
                    <span className="font-mono font-extrabold text-xl text-slate-900">
                      {formatPrice(safeTotal)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Settlement Method
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        checkoutMethod === 'cash_on_pickup'
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Banknote className="h-4 w-4 text-emerald-600" />
                        <div>
                          <p className="text-xs font-bold">Cash on Counter Pickup</p>
                          <p className="text-[10px] text-slate-500">Pay directly when collecting items</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_pickup"
                        checked={checkoutMethod === 'cash_on_pickup'}
                        onChange={() => setCheckoutMethod('cash_on_pickup')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                    </label>

                    <label
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        checkoutMethod === 'stripe'
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-bold">Campus Debit / Card</p>
                          <p className="text-[10px] text-slate-500">Fast prepaid checkout</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={checkoutMethod === 'stripe'}
                        onChange={() => setCheckoutMethod('stripe')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                    </label>

                    <label
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        checkoutMethod === 'upi'
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <QrCode className="h-4 w-4 text-amber-600" />
                        <div>
                          <p className="text-xs font-bold">UPI / QR Code</p>
                          <p className="text-[10px] text-slate-500">Instant scan via phone</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={checkoutMethod === 'upi'}
                        onChange={() => setCheckoutMethod('upi')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>

                {checkoutError && (
                  <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                    {checkoutError}
                  </div>
                )}

                {/* Checkout CTA */}
                <Button
                  onClick={handleCheckout}
                  loading={checkoutLoading}
                  disabled={checkoutLoading || safeItems.length === 0}
                  variant="primary"
                  size="lg"
                  className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Confirm Order &amp; Get PIN</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-[11px] text-slate-400 text-center">
                  Encrypted checkout • Instant 4-digit pickup PIN generated
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
