# Campus ERP + Marketplace Hybrid

A Django + React campus platform implementing a shared marketplace engine with four domain skins:

1. Canteen ordering
2. Stationery ordering
3. Hostel-supply requests
4. Student-to-student second-hand books

## Architecture

The project follows **one engine, four skins**. Listings, vendor controls, inventory, carts, orders, permissions, audit logs, notifications, and analytics are shared services. Domain-specific details extend the shared `Listing` model.

### Backend

- Django 5.0.6
- Django REST Framework 3.15.1
- SimpleJWT authentication
- Django Channels + Redis for notification WebSockets
- PostgreSQL in Docker; SQLite fallback for local development
- Transactional services with `select_for_update()` for stock/order/book concurrency

### Frontend

- React 18.3.1 + Vite
- JavaScript/JSX
- Tailwind CSS
- Axios with JWT refresh handling
- Zustand
- Recharts
- Lucide icons

## Completed feature set

### Core marketplace

- Email/JWT authentication with Student, Vendor, Warden, and Admin roles
- Vendor onboarding and admin approval
- Shared listing catalog with category-specific detail models
- Inventory management with row-locked stock operations and low-stock detection
- Cart and server-authoritative checkout
- Single-vendor order splitting
- Immutable order-line price snapshots
- Order lifecycle and cancellation stock restoration
- Audit/status logs

### Hostel request system

- Student hostel-supply requests
- Warden assignment and workflow
- Transaction-safe approval/rejection/fulfilment/cancellation
- Inventory reservation/depletion/restoration rules
- Persistent audit logs

### G1 — Notifications

- Persistent user-owned notifications
- Exact unread-count API
- Pagination and unread/category/type filters
- Own-user isolation; cross-user object access returns HTTP 403
- Read-state-only PATCH
- Server-generated order, hostel, inventory, and book notifications
- No public notification-creation endpoint

### G2 — Second-hand books

- Student-owned book listings using the existing shared `Listing` + `BookDetail`
- Search, condition and price filters
- Student listing management
- Reservation workflow
- Seller confirmation workflow
- Completion/cancellation workflow
- Single active reservation constraint per listing
- Book availability becomes false and listing becomes sold after seller confirmation
- Transaction audit logs

### G3 — Analytics

- Vendor analytics: revenue, orders, items sold, low-stock count, daily sales, top items, order status
- Admin analytics: marketplace revenue/orders, book sales value, category sales, hostel-request status, book-transaction status, user roles, low-stock count
- Date-range filtering
- Live ORM aggregation; no analytics table is required

### G4 — Real-time notifications

- JWT access-token WebSocket authentication
- User-specific Channels groups
- Initial unread-count sync
- Persistent notification delivery over `/ws/notifications/`
- Automatic client reconnect with bounded backoff
- Nginx WebSocket proxy configuration
- Redis-backed channel layer in Compose

Full peer-to-peer chat/messaging and AI recommendation features remain intentionally out of scope for the current semester build.

## Local setup — Windows PowerShell

From the repository root:

```powershell
python -m venv .venv
.venv\\Scripts\\Activate.ps1
pip install -r backend\\requirements.txt
python backend\\manage.py check
python backend\\manage.py migrate
python backend\\manage.py runserver
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL printed by the frontend (normally `http://localhost:5173`).

## Docker Compose

Create the local environment files first:

```powershell
Copy-Item .env.example .env
Copy-Item backend\\.env.example backend\\.env
Copy-Item frontend\\.env.example frontend\\.env
```

Then:

```powershell
docker compose up --build
```

The Compose stack contains PostgreSQL, Redis, Django/Daphne, and Nginx/React. The frontend is served on port 80 and the backend on port 8000.

## Configuration

- `backend/.env.example` — Django, database, Redis, CORS and optional integrations
- `frontend/.env.example` — API and WebSocket base URLs
- `.env.example` — Docker Compose database/backend defaults

Before deployment, replace development secrets, set `DEBUG=0`, restrict `ALLOWED_HOSTS`, CORS and CSRF origins, and use HTTPS/WSS.

## Backend checks

Run from `backend/`:

```powershell
python manage.py check
python manage.py makemigrations --check
pytest -v
pytest --cov=apps -v
```

## Frontend checks

Run from `frontend/`:

```powershell
npm run lint
npm run build
npm test -- --runInBand
```

## Main API areas

```text
/api/auth/
/api/vendors/
/api/listings/
/api/inventory/
/api/orders/
/api/hostel-requests/
/api/notifications/
/api/books/
/api/analytics/
/health/
/api/health/
```

WebSocket:

```text
/ws/notifications/?token=<JWT_ACCESS_TOKEN>
```

## Main frontend routes

```text
/marketplace
/cart
/orders
/notifications
/books
/books/new
/books/my-listings
/books/transactions
/vendor/dashboard
/vendor/listings
/vendor/inventory
/vendor/analytics
/admin/dashboard
/admin/vendors
/admin/orders
/admin/listings
/admin/analytics
/hostel-requests
/warden/dashboard
/warden/requests
```

## Verification note for this delivered bundle

The source was statically checked in this authoring environment:

- Python backend source: `compileall` passed.
- Frontend ESLint: passed.
- Frontend Vite build could not be executed here because the uploaded `node_modules` tree is missing the optional Linux Rollup binary (`@rollup/rollup-linux-x64-gnu`). A normal `npm install`/`npm ci` on the target machine resolves that dependency.
- Django/pytest could not be executed here because this environment has no installed Django dependency set and outbound package installation is unavailable.

The final bundle excludes local virtual environments, `node_modules`, build output, secrets, caches, and runtime databases.
