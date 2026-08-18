# Phase 0 Implementation Decisions

This document records the decisions that are fixed before the first application features are implemented. It resolves the open points identified in the project design conversation while preserving the shared “one engine, four skins” architecture.

## 1. Book ownership and seller model

`Listing` is the shared catalog entity. Its `vendor` relationship is nullable at the database-model level because book listings are peer-to-peer listings and do not belong to a campus vendor.

- Canteen, stationery, and hostel-supply listings must have an approved `Vendor`.
- A book listing must have a `BookDetail.seller` pointing to a Student user.
- A book listing must not use a fabricated vendor record merely to satisfy the shared listing table.
- Serializer/service validation will enforce the category-specific ownership rule: non-book listings require an approved vendor; book listings require a student seller.
- Only the seller or an administrator may edit or mark an active book listing as sold.
- A confirmed book sale makes the listing unavailable for further purchase. Relisting requires a new listing record.

This keeps the shared catalog intact without conflating a student seller with an operational vendor.

## 2. Custom user model fields and roles

The project will use a custom Django user model in the `users` app. The model will extend Django's authentication primitives and use email as the login identifier.

Planned fields:

- UUID primary key
- `email` (unique, used as `USERNAME_FIELD`)
- `name` (the platform display name)
- `role`: `student`, `vendor`, `warden`, or `admin`
- `phone` (optional)
- `hostel_room` (optional, primarily for students)
- Django's `is_active`, `is_staff`, and password fields

`username` will not be used as a second login identifier. A student who sells books remains a Student role; book-selling permissions are determined by ownership and the book workflow rather than by creating a fifth role.

The custom user model will be created before the first migration that references users. `AUTH_USER_MODEL` is intentionally not enabled in the Phase 1 settings until that model exists.

## 3. Canonical state machines

### Orders

Order states:

- `placed`
- `confirmed`
- `ready`
- `completed`
- `cancelled`
- `disputed`

Allowed transitions:

```text
placed    -> confirmed | cancelled
confirmed -> ready | cancelled
ready     -> completed | disputed
disputed  -> completed | cancelled
completed -> terminal
cancelled -> terminal
```

The transition validator will be centralized in the order domain service. Students can cancel only before `ready`; vendors can manage the fulfillment transitions for their own order items; administrators can resolve disputes. Every transition creates an order-status log and persistent notification.

Order placement must create the order, snapshot `price_at_order`, and deduct inventory inside one database transaction. Inventory rows are locked with `select_for_update()` to prevent overselling.

### Hostel supply requests

Hostel requests use a separate state machine because they require warden approval:

- `submitted`
- `approved`
- `rejected`
- `ready`
- `completed`
- `cancelled`

Allowed transitions:

```text
submitted -> approved | rejected | cancelled
approved  -> ready | cancelled
ready     -> completed
rejected  -> terminal
completed -> terminal
cancelled -> terminal
```

A warden approves or rejects a submitted request. The `approved -> ready` operation locks and deducts inventory transactionally; the student is then notified that the item is ready for pickup. Completion represents collection or confirmed fulfillment. A request cannot be fulfilled without warden approval.

## 4. Payment scope for the first release

The first release will use a mock campus payment/wallet or cash-on-pickup mode. No real money movement or card data will be handled by the application.

- Payment status and reference fields will be designed so a payment adapter can be added later.
- Razorpay remains an optional test-mode integration after the core order flow is stable.
- External payment failure must never leave a partially-created order or incorrectly deducted stock.
- No production payment credentials belong in source control or example files.

This keeps the semester MVP demonstrable and avoids making an external payment gateway a dependency of the core workflow.

## 5. Environment variable structure

Committed `.env.example` files document names and safe development placeholders. Actual `.env` files remain local and are ignored by Git.

### Root `.env` (Docker Compose)

Used for service-level values:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `BACKEND_SECRET_KEY`
- `BACKEND_DEBUG`

### `backend/.env`

Used by Django:

- `DEBUG`
- `SECRET_KEY`
- `ENVIRONMENT`
- `ALLOWED_HOSTS`
- `DATABASE_URL`
- `REDIS_URL`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `CLOUDINARY_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SENTRY_DSN`

### `frontend/.env`

Only public build-time client configuration belongs here:

- `VITE_API_BASE_URL`
- `VITE_WS_BASE_URL`

The frontend must never receive database credentials, signing keys, payment secrets, or other server-only values.

## Decision status

These decisions are the Phase 0 baseline. Later changes to user identity, ownership, or state values must be treated as schema/API changes and documented before implementation.
