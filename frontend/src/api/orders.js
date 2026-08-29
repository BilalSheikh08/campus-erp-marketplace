/**
 * Cart and order API service - integrates with backend endpoints.
 */

import client from './client';

const API_BASE = '/api';

/**
 * Fetch the authenticated user's cart
 */
export const fetchCart = async () => {
  const response = await client.get(`${API_BASE}/cart/`);
  return response.data;
};

/**
 * Add an item to cart
 * @param {string} listingId - UUID of the listing
 * @param {number} quantity - Quantity to add (default 1)
 */
export const addToCart = async (listingId, quantity = 1) => {
  const response = await client.post(`${API_BASE}/cart/items/`, {
    listing: listingId,
    quantity,
  });
  return response.data;
};

/**
 * Update quantity of a cart item
 * @param {string} cartItemId - UUID of the cart item
 * @param {number} quantity - New quantity
 */
export const updateCartItemQuantity = async (cartItemId, quantity) => {
  const response = await client.patch(`${API_BASE}/cart/items/${cartItemId}/`, {
    quantity,
  });
  return response.data;
};

/**
 * Remove an item from cart
 * @param {string} cartItemId - UUID of the cart item
 */
export const removeFromCart = async (cartItemId) => {
  await client.delete(`${API_BASE}/cart/items/${cartItemId}/`);
};

/**
 * Clear the entire cart
 */
export const clearCart = async () => {
  const response = await client.delete(`${API_BASE}/cart/`);
  return response.data;
};

/**
 * Checkout - create order(s) from cart
 * @param {string} paymentMethod - 'mock', 'campus_wallet', or 'cash_on_pickup'
 * @param {string} pickupSlot - Optional pickup time/slot
 */
export const checkout = async (paymentMethod, pickupSlot = '') => {
  const response = await client.post(`${API_BASE}/orders/checkout/`, {
    payment_method: paymentMethod,
    pickup_slot: pickupSlot,
  });
  return response.data;
};

/**
 * Fetch user's orders
 */
export const fetchOrders = async () => {
  const response = await client.get(`${API_BASE}/orders/`);
  return response.data;
};

/**
 * Fetch a specific order
 * @param {string} orderId - UUID of the order
 */
export const fetchOrder = async (orderId) => {
  const response = await client.get(`${API_BASE}/orders/${orderId}/`);
  return response.data;
};

/**
 * Transition an order to a new status
 * @param {string} orderId - UUID of the order
 * @param {Object} data - { target_status: string, note?: string }
 */
export const transitionOrder = async (orderId, data) => {
  const response = await client.post(`${API_BASE}/orders/${orderId}/transition/`, data);
  return response.data;
};
