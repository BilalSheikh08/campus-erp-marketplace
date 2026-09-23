/**
 * Cart state management using Zustand.
 * Manages shopping cart items, checkout, and order operations.
 */

import { create } from 'zustand';
import {
  fetchCart,
  addToCart as apiAddToCart,
  updateCartItemQuantity as apiUpdateQuantity,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  checkout as apiCheckout,
} from '../api/orders';

const useCartStore = create((set, get) => ({
  // State
  items: [],
  isLoading: false,
  error: null,
  checkoutLoading: false,
  checkoutError: null,

  // Getters
  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: () =>
    get().items.reduce((sum, item) => sum + parseFloat(item.unit_price) * item.quantity, 0),
  totalAmount: () => get().subtotal(), // Same for now, can add taxes/fees later

  // Actions - Fetch cart
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchCart();
      set({ items: data.items || [], isLoading: false });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch cart';
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },

  // Actions - Add item
  addItem: async (listingId, quantity = 1) => {
    set({ error: null });
    try {
      const cartItem = await apiAddToCart(listingId, quantity);
      // Refresh cart to ensure consistency
      await get().fetchCart();
      return cartItem;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to add item';
      set({ error: errorMessage });
      throw err;
    }
  },

  // Actions - Update quantity
  updateQuantity: async (cartItemId, quantity) => {
    set({ error: null });
    try {
      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }
      const cartItem = await apiUpdateQuantity(cartItemId, quantity);
      // Update local state
      set(state => ({
        items: state.items.map(item =>
          item.id === cartItemId ? { ...item, quantity: cartItem.quantity } : item
        ),
      }));
      return cartItem;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update quantity';
      set({ error: errorMessage });
      throw err;
    }
  },

  // Actions - Remove item
  removeItem: async (cartItemId) => {
    set({ error: null });
    try {
      await apiRemoveFromCart(cartItemId);
      set(state => ({
        items: state.items.filter(item => item.id !== cartItemId),
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to remove item';
      set({ error: errorMessage });
      throw err;
    }
  },

  // Actions - Clear cart
  clearCart: async () => {
    set({ error: null });
    try {
      await apiClearCart();
      set({ items: [] });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to clear cart';
      set({ error: errorMessage });
      throw err;
    }
  },

  // Actions - Checkout
  checkout: async (paymentMethod, pickupSlot = '') => {
    set({ checkoutError: null, checkoutLoading: true });
    try {
      const result = await apiCheckout(paymentMethod, pickupSlot);
      set({ items: [], checkoutLoading: false });
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Checkout failed';
      set({ checkoutError: errorMessage, checkoutLoading: false });
      throw err;
    }
  },

  // Actions - Clear error
  clearError: () => set({ error: null }),
  clearCheckoutError: () => set({ checkoutError: null }),
}));

export default useCartStore;
