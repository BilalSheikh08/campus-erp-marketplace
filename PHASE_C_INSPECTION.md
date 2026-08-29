# Phase C Implementation Plan - Inspection Report

## Backend Architecture Inspection

### Existing Cart & Order System

**Models (apps/orders/models.py):**
- ✅ Cart: OneToOne user relationship, contains CartItems
- ✅ CartItem: Listing + quantity, unique constraint on (cart, listing)
- ✅ Order: User FK, total_amount, status (placed/confirmed/ready/completed/cancelled/disputed), payment tracking
- ✅ OrderItem: Immutable snapshots with price_at_order, title_snapshot, vendor_name_snapshot
- ✅ OrderStatusLog: Status transition auditing

**Payment Methods Supported:**
- MOCK (test)
- CAMPUS_WALLET
- CASH_ON_PICKUP

**Order Statuses:**
- placed → confirmed → ready → completed
- + cancelled, disputed paths

**API Endpoints (apps/orders/urls.py):**
```
POST   /api/cart/                    - Get/fetch cart (GET), clear cart (DELETE)
POST   /api/cart/items/              - Add item to cart
PATCH  /api/cart/items/<id>/         - Update cart item quantity
DELETE /api/cart/items/<id>/         - Remove cart item
POST   /api/orders/checkout/         - Create order from cart
GET    /api/orders/                  - List user's orders
GET    /api/orders/<id>/             - Get order detail
POST   /api/orders/<id>/transition/  - Change order status (admin/vendor)
```

**Services (apps/orders/services.py):**
- add_to_cart(user, listing, quantity)
- set_cart_item_quantity(user, cart_item_id, quantity)
- remove_cart_item(user, cart_item_id)
- clear_cart(user)
- checkout_cart(user, payment_method, pickup_slot)
- get_or_create_cart(user)
- transition_order(user, order_id, new_status, note)
- visible_orders_for(user) - role-based filtering

**Serializers:**
- CartItemSerializer (read-only listing info)
- CartSerializer (cart with items)
- CartItemCreateSerializer (validation for add)
- CartItemUpdateSerializer (only quantity)
- CheckoutSerializer (payment_method, pickup_slot)
- OrderSerializer (full order with items & logs)
- OrderItemSerializer (immutable snapshots)
- OrderStatusLogSerializer (audit trail)

**Permissions:**
- IsAuthenticated, IsStudent for cart operations
- IsOrderParticipant for order viewing (role-based)

### Frontend Architecture

**Existing Zustand Stores:**
- authStore.js - Authentication, user, tokens
- listingsStore.js - Listings, filters, pagination

**Existing API Services:**
- client.js - Axios instance with JWT interceptors
- auth.js - Authentication endpoints
- listings.js - Listing endpoints

**Reusable Components:**
- Button (variants, loading state)
- Input (validation, error feedback)
- Alert (error/warning/success/info)
- LoadingSpinner
- ListingCard
- FilterSidebar
- SearchBar
- ListingGrid

**Routing (Router.jsx):**
- /cart - Currently ComingSoonPage (to be replaced)
- /orders - Currently ComingSoonPage

## Frontend Implementation Requirements

### To Implement:
1. **Cart API Service** (frontend/src/api/orders.js)
   - Fetch cart
   - Add to cart
   - Update quantity
   - Remove item
   - Clear cart
   - Checkout

2. **Cart Zustand Store** (frontend/src/store/cartStore.js)
   - Cart state: items, loading, error, itemCount
   - Actions: fetchCart, addItem, updateQuantity, removeItem, clearCart, checkout
   - Computed: totalPrice, itemCount

3. **Cart Page Component** (frontend/src/pages/CartPage.jsx)
   - Display cart items
   - Quantity controls
   - Remove buttons
   - Cart summary (total, subtotal)
   - Empty state
   - Checkout button

4. **Checkout Flow** (frontend/src/pages/CheckoutPage.jsx or modal)
   - Payment method selection
   - Order creation
   - Success confirmation
   - Error handling

5. **Update Listing Detail Page**
   - Connect "Add to Cart" button
   - Loading state on click
   - Success/error feedback

6. **Update Navbar**
   - Add cart icon
   - Add cart item count badge
   - Update on cart changes

## No Breaking Changes

- ✅ All Phase A auth endpoints remain unchanged
- ✅ All Phase B listing endpoints remain unchanged  
- ✅ Router.jsx cart and orders routes exist
- ✅ Backend cart/order APIs are production-ready
- ✅ Zustand store pattern already established
- ✅ Axios client with interceptors ready

## Implementation Strategy

1. Create orders API service (maps to backend endpoints)
2. Create cart Zustand store (reuse auth pattern)
3. Update ListingDetailPage "Add to Cart" button
4. Create CartPage component
5. Create CheckoutPage/modal
6. Update Navbar with cart count
7. Test complete flow
8. Verify all tests pass
