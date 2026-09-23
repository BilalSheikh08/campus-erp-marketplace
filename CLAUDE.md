# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Repository status

The repository now contains runnable Phase 1 through Phase 7 foundations. The backend has valid Django configuration in `backend/config/`, a UUID/email custom user model, JWT authentication, reusable role permissions, authentication throttles, vendor onboarding and approval workflows, the shared listing/catalog engine, inventory management and locked stock services, server-authoritative carts, transactional checkout, order lifecycle services, migrations, and authentication/vendor/listing/inventory/order tests. The frontend has a Vite/React JavaScript entry point, Tailwind/PostCSS configuration, ESLint/Jest configuration, and a minimal foundation screen. Dockerfiles, Compose services, and environment templates are present.

Hostel request workflows, persistent notifications, second-hand book transactions, live analytics, and notification WebSockets are implemented. Full messaging/chat, AI recommendation, and advanced custom-admin extensions remain intentionally deferred. Treat the design artifact as the source of intent, but always check actual source files before assuming a feature exists.

## Product and intended architecture

`E-Commerce_Project_Campus_ERP_Full_Claude_Conversation.md` is a design/progress artifact for a Campus ERP + Marketplace Hybrid. The intended product is one campus platform with four domains:

- Canteen ordering and kitchen inventory
- Stationery ordering and stock
- Hostel-supply requests and warden fulfillment
- Second-hand books sold by students

The design deliberately uses a **shared core (“one engine, four skins”)** rather than four independent applications. Listings, vendors/providers, inventory, carts, orders, notifications, audit logs, and analytics are shared; domain-specific details extend the shared listing model. The common order lifecycle is `placed -> confirmed -> ready -> completed`, with cancellation/dispute paths and inventory deduction kept transactionally consistent.

The intended backend is a Django modular monolith:

- `backend/config/` holds Django settings, URL routing, ASGI, and WSGI entry points.
- `backend/apps/` is intended to contain bounded Django apps for `users`, `vendors`, `listings`, `inventory`, `orders`, `books`, `notifications`, `analytics`, `admin_panel`, and shared `core` utilities/permissions/middleware.
- Django ORM + PostgreSQL is the persistence layer; Django REST Framework exposes JSON APIs.
- DRF SimpleJWT and role-based permissions serve Student, Vendor, Warden, and Admin users.
- Django Channels with Redis is intended for order-status and notification WebSockets.
- Cloudinary is intended for listing/book images; Razorpay is only a test-mode payment option.

The intended frontend is a React/Vite SPA written in JavaScript/JSX (not TypeScript). The planned structure separates role-oriented pages (`student`, `vendor`, `admin`), reusable UI components, feature areas (cart/orders/inventory), API services, state stores, routes, and WebSocket hooks. The planned client uses React Router, Axios, Zustand, Recharts, Lucide, and `html5-qrcode`.

The intended deployment is Docker Compose locally with PostgreSQL, Redis, a Django backend, and an Nginx-served React build. The backend is expected to listen on port 8000 and the frontend on port 80. The design artifact discusses Railway/Render deployment, but Docker Compose deployment configuration is present; cloud-provider-specific deployment manifests are not included.

## Important domain invariants

When implementing the system, preserve these boundaries and invariants:

- A vendor must be approved before creating listings.
- Inventory cannot become negative; order creation and stock deduction belong in one database transaction.
- Concurrent orders for the same stock must use row locking (`select_for_update()` in Django) or an equivalent safe mechanism.
- Store `price_at_order` on order items so later price changes do not alter order history.
- Validate order status transitions centrally rather than allowing arbitrary status updates.
- Hostel requests require warden approval; book listings become unavailable after a confirmed sale.
- Status changes, inventory events, and other state-changing operations are intended to be auditable and to produce persistent notifications; WebSockets are an additional delivery mechanism, not the history store.

## Commands

### Current project commands

These commands are valid for the completed Phase 1–7 project. Run them from the repository root unless noted otherwise.

Backend setup on Windows:

```powershell
python -m venv .venv
.venv\\Scripts\\Activate.ps1
pip install -r backend\\requirements.txt
python backend\\manage.py check
python backend\\manage.py migrate
```

The foundation uses SQLite when `DATABASE_URL` is empty, so `check`, `migrate`, and `runserver` work without starting PostgreSQL. Start the backend with:

```powershell
python backend\\manage.py runserver
```

Frontend setup and checks:

```powershell
cd frontend
npm install
npm run dev
npm run build
npm run lint
npm test -- --runInBand
npm run preview
```

The backend has authentication, vendor onboarding, catalog, inventory, order, hostel-request, notification, book, and analytics tests. Frontend linting is configured and the frontend test command is retained for feature-level tests.

Docker Compose setup:

```powershell
Copy-Item .env.example .env
Copy-Item backend\\.env.example backend\\.env
Copy-Item frontend\\.env.example frontend\\.env
docker compose up --build
docker compose down
```

The Compose stack is PostgreSQL + Redis + Django/Daphne + Nginx/React. Docker must be installed separately; the current development environment does not have the Docker CLI available.

### Backend feature workflow

Run these from `backend/` with the repository virtual environment activated after model changes:

```bash
python manage.py check
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

The design artifact specifies the following backend test commands:

```bash
cd backend
pytest -v
pytest --cov=apps -v
pytest apps/orders/tests/test_order_logic.py -v
pytest apps/orders/tests/test_order_logic.py::TestOrderPlacement::test_order_deducts_inventory_correctly -v
```

Use the project’s eventual pytest configuration and app paths if they differ from the design draft. `python manage.py test` is also the standard Django fallback once tests exist.

### Planned frontend workflow

```bash
cd frontend
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run test
npm run test -- --coverage
npm run test:watch
```

The current `frontend/package.json` defines `dev`, `build`, `preview`, `test`, `test:watch`, and `lint` scripts. `frontend/package-lock.json` is generated and should be kept in sync with the manifest.

### Docker workflow

```bash
docker compose up --build
docker compose down
```

The Compose foundation defines PostgreSQL + Redis + Django/Daphne backend + Nginx/React frontend. Run `python manage.py migrate` inside the backend container after project models are added. Docker configuration has been YAML-validated, but the Docker CLI was unavailable in the current environment, so image startup has not been exercised here.

## Configuration and design references

- `E-Commerce_Project_Campus_ERP_Full_Claude_Conversation.md` contains the requirements, domain model, API sketches, UI plan, security notes, deployment plan, and proposed dependency lists. It is a historical design document, not executable code.
- `backend/.env.example`, `frontend/.env.example`, and the root `.env.example` document the current configuration contract. The actual `.env` files remain local and may be empty; do not assume PostgreSQL, Redis, Cloudinary, Razorpay, or Sentry credentials are configured locally.
- `.claude/settings.local.json` currently only allows the repository’s `rtk ls` and `rtk find` commands.
- No repository-level Cursor rules or Copilot instructions are present beyond the project docs; a GitHub Actions CI workflow is included under `.github/workflows/ci.yml`.

As domain implementation continues, keep this file current with verified module paths, migrations, feature-specific commands, and CI/deployment instructions. Phase 4 contains the shared Listing model, canteen/stationery/hostel-supply/book detail models, ownership validation, catalog CRUD/search/filter/pagination APIs, safe deactivation, admin registration, and tests. Phase 5 contains the Inventory model, one-to-one eligible Listing validation, derived availability, transactional row-locked stock services, owner/Admin management APIs, adjustment endpoint, admin registration, Listing availability metadata, migration, and tests. Phase 6 contains Cart/CartItem, server-priced multi-vendor checkout split into single-vendor Orders, immutable order-line snapshots, mock/campus-wallet/cash-on-pickup payment strategy state, exact order transitions, cancellation stock restoration, status logs, role-filtered APIs, admin registration, migration, and tests. Phase 7 is complete for notifications, second-hand books, analytics, and notification WebSockets. Full messaging/chat and advanced custom-admin workflows are intentionally deferred.
