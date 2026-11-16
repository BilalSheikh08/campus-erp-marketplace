/**
 * Campus Commons - Shopping Cart & Order Requisition Slip
 * University Requisition Sheet styling:
 * Itemized concession ledger, transparent student fee breakdown,
 * settlement method selection, and instant 4-digit pickup PIN generation.
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
  Receipt,
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
    return <LoadingSpinner message="Consulting active student requisition slip..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4DDCF]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <Receipt className="h-3.5 w-3.5" />
              <span>STUDENT DESK · ACTIVE REQUISITION SLIP</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
              Order Requisition Bag
            </h1>
            <p className="text-zinc-600 text-xs sm:text-sm mt-1 font-sans">
              Review selected items. Multi-vendor orders receive distinct 4-digit pickup PINs for express collection.
            </p>
          </div>
          <Link to="/marketplace">
            <Button variant="outline" size="sm" className="text-xs">
              Continue Browsing Catalog
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
          <div className="bg-white rounded-lg border border-[#E4DDCF] p-10 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 bg-[#FAF8F3] border border-[#E4DDCF] rounded flex items-center justify-center mx-auto mb-3 text-zinc-400">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-lg font-bold text-zinc-900 mb-1">Your Requisition Bag is Empty</h2>
            <p className="text-xs text-zinc-600 mb-5 leading-relaxed font-sans">
              You have not added any dining meals, stationery packs, or course books to your order bag yet.
            </p>
            <Link to="/marketplace">
              <Button variant="primary" size="md" className="font-semibold text-xs">
                Browse Campus Concessions
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-lg border border-[#E4DDCF] overflow-hidden shadow-xs">
                <div className="px-5 py-3 bg-[#FAF8F3] border-b border-[#E4DDCF] flex items-center justify-between text-xs font-mono font-bold text-zinc-700 uppercase tracking-wider">
                  <span>Selected Items ({safeItemCount})</span>
                  <span className="flex items-center gap-1 text-emerald-800 text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Express Counter Pickup
                  </span>
                </div>

                <div className="divide-y divide-[#E4DDCF]">
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
                        className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-16 h-16 rounded bg-[#FAF8F3] overflow-hidden border border-[#E4DDCF] shrink-0">
                            <SafeImage
                              src={imageUrl}
                              alt={title}
                              domain={category}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-700 inline-block mb-1">
                              {getDomainLabel(category)}
                            </span>
                            <h3 className="font-serif text-sm font-bold text-zinc-950 truncate max-w-sm">
                              {title}
                            </h3>
                            <p className="text-xs font-mono text-zinc-500 mt-0.5">
                              Rate: <span className="text-zinc-800 font-semibold">{formatPrice(unitPrice)}</span>
                            </p>
                            {vendorName && (
                              <p className="text-[11px] font-mono text-zinc-600 mt-0.5">
                                Counter: {vendorName}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity & Price Controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4DDCF]">
                          {/* Quantity Counter */}
                          <div className="flex items-center border border-[#E4DDCF] rounded bg-[#FAF8F3] p-0.5">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, quantity - 1)}
                              disabled={quantity <= 1}
                              className="p-1 rounded hover:bg-white text-zinc-600 disabled:opacity-40 transition cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-mono font-bold text-zinc-900">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, quantity + 1)}
                              className="p-1 rounded hover:bg-white text-zinc-600 transition cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Item Subtotal */}
                          <div className="text-right min-w-[70px]">
                            <span className="font-mono font-bold text-sm text-zinc-950 block">
                              {formatPrice(itemSubtotal)}
                            </span>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                            title="Remove item from docket"
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
              <div className="p-3.5 rounded border border-[#E4DDCF] bg-[#FAF8F3] flex items-center gap-3 text-xs text-zinc-700 font-sans">
                <Clock className="h-4 w-4 text-zinc-600 shrink-0" />
                <span>
                  <strong>Counter Verification Protocol:</strong> Upon checkout, a unique 4-digit PIN docket is issued for each merchant concession. Present it at the express window for instant collection.
                </span>
              </div>
            </div>

            {/* Right: Checkout & Settlement Panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-lg border border-[#E4DDCF] p-5 shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-base text-zinc-950 pb-2.5 border-b border-[#E4DDCF]">
                  Settlement Ledger
                </h3>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-zinc-600">
                    <span>Requisition Subtotal:</span>
                    <span className="font-bold text-zinc-950">
                      {formatPrice(safeSubtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Express Counter Fee:</span>
                    <span className="font-semibold text-emerald-800">₹0.00 (Standard)</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Student Commission:</span>
                    <span className="font-semibold text-emerald-800">0% Campus Subsidy</span>
                  </div>
                  <div className="pt-2.5 border-t border-[#E4DDCF] flex justify-between items-baseline">
                    <span className="font-serif font-bold text-sm text-zinc-900">Total Settlement:</span>
                    <span className="font-mono font-bold text-xl text-zinc-950">
                      {formatPrice(safeTotal)}
                    </span>
                  </div>
                </div>

                {/* Settlement Method Selector */}
                <div className="pt-3 border-t border-[#E4DDCF]">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Payment Method
                  </label>
                  <div className="space-y-1.5">
                    <label
                      className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition ${
                        checkoutMethod === 'cash_on_pickup'
                          ? 'border-blue-900 bg-blue-50/50 text-blue-950'
                          : 'border-[#E4DDCF] hover:bg-[#FAF8F3] text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-emerald-700" />
                        <div>
                          <p className="text-xs font-semibold">Cash on Counter Pickup</p>
                          <p className="text-[10px] font-mono text-zinc-500">Pay directly at physical counter</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_pickup"
                        checked={checkoutMethod === 'cash_on_pickup'}
                        onChange={() => setCheckoutMethod('cash_on_pickup')}
                        className="text-blue-900 focus:ring-blue-900"
                      />
                    </label>

                    <label
                      className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition ${
                        checkoutMethod === 'stripe'
                          ? 'border-blue-900 bg-blue-50/50 text-blue-950'
                          : 'border-[#E4DDCF] hover:bg-[#FAF8F3] text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-900" />
                        <div>
                          <p className="text-xs font-semibold">Campus Debit / Card</p>
                          <p className="text-[10px] font-mono text-zinc-500">Instant online card clearance</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={checkoutMethod === 'stripe'}
                        onChange={() => setCheckoutMethod('stripe')}
                        className="text-blue-900 focus:ring-blue-900"
                      />
                    </label>

                    <label
                      className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition ${
                        checkoutMethod === 'upi'
                          ? 'border-blue-900 bg-blue-50/50 text-blue-950'
                          : 'border-[#E4DDCF] hover:bg-[#FAF8F3] text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-amber-700" />
                        <div>
                          <p className="text-xs font-semibold">UPI / QR Payment</p>
                          <p className="text-[10px] font-mono text-zinc-500">Fast mobile scanner settlement</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={checkoutMethod === 'upi'}
                        onChange={() => setCheckoutMethod('upi')}
                        className="text-blue-900 focus:ring-blue-900"
                      />
                    </label>
                  </div>
                </div>

                {checkoutError && (
                  <div className="text-xs text-red-800 bg-red-50 p-2.5 rounded border border-red-200 font-mono">
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
                  className="w-full py-2.5 rounded text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Authorize Order &amp; Issue 4-Digit PIN</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>

                <p className="text-[10px] font-mono text-zinc-500 text-center">
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
