# Phase G — System Evolution Planning & Architecture Audit

Status: IMPLEMENTED IN WORKING BUNDLE. G1, G2, G3, and G4 are implemented. GitHub push remains unavailable from this environment.

> Historical audit sections below describe the repository state at the start of Phase G. The current working bundle supersedes those snapshots: G1 notifications, G2 books, G3 analytics, and G4 real-time notification delivery are implemented.

---

## 1. EXECUTIVE SUMMARY

Phase G is the continuation after Phase F (hostel requests, complete at f51223b). The real repository audit shows Phase G is NOT a giant feature dump — 4 of 6 intended subsystems are empty scaffolds with zero implementation. Recommended Phase G is split into two coherent sub-phases: G1 (Notification Foundation + Book Listing skeleton) and G2 (Analytics + Admin dashboards), with messaging/WebSockets/advanced admin deferred. This preserves "one engine, four skins" and avoids instability.

---

## 2. HISTORICAL REPOSITORY STATUS (PHASE-G START)

Branch: main. Phase F stable (f51223b). Phase 1–6 foundations complete at the start of Phase G. The sentence describing Phase 7 as “NOT STARTED” is a historical snapshot; the delivered working bundle now contains the G1–G4 implementations listed at the top of this document.

Git status at audit start: M backend/apps/orders/services.py; M backend/config/settings.py; M frontend/src/routes/Router.jsx; ?? backend/apps/hostel_requests/; ?? frontend/src/pages/student/; ?? frontend/src/pages/warden/; ?? frontend/src/services/

---

## 3. WHAT WAS ALREADY IMPLEMENTED AT PHASE-G START

- users, vendors, listings (with Canteen/Stationery/HostelSupply/Book detail models via Listing extension), inventory (select_for_update, transactional services), orders (cart, checkout, lifecycle, status logs, payments), hostel_requests (full state machine, services, tests, frontend warden/student pages), core (permissions, middleware, throttling, utils).
- Backend: Django REST Framework + JWT + role permissions. Frontend: React/Vite/Tailwind router with student/vendor/warden/admin routes.
- Channels configured (settings.py has CHANNEL_LAYERS — in-memory default, Redis optional via REDIS_URL). No consumers, no WebSocket auth, no user-specific groups.
- Design artifact (E-Commerce...Conversation.md) defines BookDetails, Notifications, Analytics, Admin, WebSockets, Messaging, but the artifact is specification-only — not code.

---

## 4. WHAT WAS PARTIALLY IMPLEMENTED AT PHASE-G START

- notifications/: scaffold-only at the start of Phase G; now implemented with persistence, REST APIs, event services, and WebSocket delivery.
- books/: empty at the start of Phase G; the working bundle now contains BookTransaction services, APIs, migrations, and frontend pages built around the existing BookDetail.
- analytics/: same — all files empty. SCAFFOLDED ONLY.
- admin_panel/: same — all files empty except apps.py/admin.py. SCAFFOLDED ONLY.
- orders/services.py has order lifecycle + audit; does NOT have book-transaction-specific logic.
- bookstore messaging / buyer-seller chat: NO FILES anywhere (frontend or backend).

---

## 5. WHAT WAS MISSING AT PHASE-G START

- Persistent Notification model + API (unread/read, categories, role filtering, generation rules, frontend notification center).
- WebSocket consumers / auth / reconnect / user-channel groups / order-status events / hostel events.
- BookDetail model + second-hand listing flow + reserve/purchase + confirmed-sale availability lock + messaging/contact between seller/buyer.
- Analytics aggregates (vendor/admin dashboards with real database queries, not just stub screens).
- Advanced admin workflows (dispute management, audit-log visibility, user management beyond current admin lists).
- Messaging/Conversation model (whether shared or transaction-scoped — undecided; no code).

---

## 6. HISTORICAL PRODUCT GAPS

A. Notifications (full)
B. WebSockets / Real-Time (no consumers)
C. Second-Hand Books (no models, no frontend, no transaction flow)
D. Messaging (architecture undecided; no files)
E. Analytics (no queries, no charts, no dashboards beyond ComingSoon)
F. Advanced Admin (no dispute/audit/user-management code beyond basic approval lists)

---

## 7. ARCHITECTURAL OPTIONS CONSIDERED

- Notifications: (a) sync inside domain services, (b) event abstraction, (c) background queue. Recommended: (a) — simple, transaction-safe, fits student project; events/queues over-engineered at this stage.
- Books: (a) reuse Order, (b) dedicated BookTransaction, (c) hybrid. Recommended: (b) — books are peer-to-peer with seller-specific ownership; reusing vendor-stock Order confuses inventory logic.
- Messaging: (a) generic Conversation/Message, (b) listing-scoped, (c) transaction-scoped. Recommended: (c) — tied to book reservations/purchases only; simplest, avoids open-ended chat.
- Analytics: (a) live ORM aggregation, (b) reporting queries, (c) precomputed. Recommended: (b) — live aggregation sufficient for campus-scale; precompute only if performance demands later.
- WebSockets: (a) Channels consumer + groups, (b) per-resource channels. Recommended: (a) with basic auth — sufficient for notification/order events; deferred to after notifications exist.

---

## 8. RECOMMENDED ARCHITECTURE

Preserve "one engine, four skins": shared Listing/Inventory/Order + domain-specific detail extensions. Notifications are shared; analytics query the shared engine; books extend Listing with BookDetail + a BookTransaction; messaging is scoped to book transactions only. WebSockets consume notification events only after notification model exists (dependency order). No independent systems for notifications/orders/inventory/messages.

---

## 9. PHASE G MUST-HAVE SCOPE (NOW DELIVERED)

G1 — Notification Foundation:
- Notification model (user FK, message, type, is_read, created_at, category).
- Serialization + viewset (list, mark-read, unread-count) with role filtering.
- Service layer: create_on_order_transition(), create_on_hostel_approve(), low_stock_alert() — synchronous in domain services.
- Frontend: notification bell/icon in navbar, unread badge, simple dropdown list + mark-read.
- Tests: exact 200/403, unread count accuracy, role isolation.

G2 — Book Transaction Skeleton (light):
- BookDetail model (listing FK, condition, edition, seller FK, is_available).
- Reservation/purchase endpoint (confirm reservation, mark listing unavailable, create audit log).
- Basic student-facing "My Books" + browse page (no messaging yet).
- Tests: double-sale prevention, availability after confirmed purchase.

---

## 10. PHASE G NICE-TO-HAVE SCOPE / DEFERRED ITEMS

- Analytics dashboard pages (vendor / admin) with simple aggregated queries (sales by day, top items, hostel request counts).
- Admin dispute flagging UI (basic list of flagged orders + resolution action).
- Basic WebSocket notification delivery (after G1 notifications model exists — depends on G1).

---

## 11. FEATURES TO DEFER

- Full messaging / chat / conversation system (architecture undecided; no product requirement stronger than "buyer contacts seller" which can be handled via existing student profile/contact info initially).
- Advanced WebSocket reconnect / fan-out optimization (campus scale is small; basic Channels sufficient).
- AI/recommendation engine (design mentions but not required for Phase G exit criteria).
- Real-time analytics streaming / precomputed metrics.
- Custom admin audit-log viewer beyond existing order/log models.

---

## 12. PHASE G SUB-PHASE SEQUENCE

G1 — Notification Foundation (depends on: orders/hostel services exist; no other G dependencies)
  Objective: persistent read/unread notifications for all roles.
  Backend: model + serializers + views + services.
  Frontend: navbar bell + dropdown list.
  Exit: notification API returns exact unread counts; authorization exact 403 for cross-role; all order/hostel events trigger notifications.

G2 — Book Listing + Reservation (depends on: shared Listing engine; no dependency on G1 but can run in parallel)
  Objective: student can list/relist/confirm-sale used books; buyer can reserve.
  Backend: BookDetail + reservation service + availability lock.
  Frontend: /books browse + /books/my-listings + reserve flow.
  Exit: confirmed sale prevents duplicate purchase; listing unavailable after sale.

G3 — Analytics + Admin Dashboards (depends on: orders/inventory/hostel/book data exists)
  Objective: vendor and admin see aggregated sales/order/hostel metrics.
  Backend: analytics queries (not new models — query existing tables).
  Frontend: /vendor/analytics + /admin/analytics pages with charts (Recharts already in design).
  Exit: dashboards load with real aggregated data; no N+1 ORM.

G4 — WebSocket Real-Time (depends on: G1 notifications; deferred after G3)
  Objective: notification/order events pushed over Channels.
  Backend: notification consumer + user-group auth.
  Exit: authenticated user receives own events; no cross-user leakage.

NOTE: G4 explicitly deferred until G1 complete; never start G4 before G1.

---

## 13. DATABASE / MODEL PLAN (no migrations created)

Notification (new):
- id (UUID PK), user_id (FK users), message (text), notification_type (char/enum: order, hostel, stock_alert, book), is_read (bool), created_at (timestamp), category (optional).
- Indexes: (user_id, is_read, created_at) for unread query; (created_at) for history.
- Unique: none (one message can have multiple instances per user if needed).

BookDetail (new — extends Listing via one-to-one):
- listing_id (PK/FK listing), seller_id (FK users — student seller, not vendor), condition (enum: new/used/good/fair/poor), edition (char), subject (char), is_available (bool, derived / set on sale), created_at, updated_at.
- Constraint: seller must have role STUDENT; listing.category_type == 'book'.
- Deletion: cascade with listing; sale removes availability rather than deleting.

BookTransaction / Reservation (new, lightweight):
- id (UUID), listing_id (FK), buyer_id (FK), seller_id (FK), status (reserved/confirmed/cancelled/completed), created_at, completed_at.
- Constraint: only one ACTIVE (reserved/confirmed) per listing at a time; status machine prevents arbitrary updates.
- Audit: log created via existing order/status-log pattern.

No changes to existing users/vendors/listings/inventory/orders/hostel_requests tables.

---

## 14. API PLAN (IMPLEMENTED IN WORKING BUNDLE)

POST /api/notifications/ — create (admin/system only; non-public)
GET /api/notifications/ — list for auth user (filter ?unread=true, ?category=order)
PATCH /api/notifications/{id}/ — mark read (own only; 403 for others)
GET /api/notifications/unread-count/ — exact count (not in (200,403))

POST /api/books/ — list book (student only, with BookDetail)
GET /api/books/ — browse (filter category=book, available=true)
GET /api/books/{id}/ — detail (public if available; 403 for unavailable if not buyer/seller/admin)
POST /api/books/{id}/reserve/ — reserve (student buyer; 403 if already reserved/sold; transactional)
PATCH /api/books/{id}/confirm-sale/ — confirm (seller only; updates BookDetail.is_available=False; creates BookTransaction)

GET /api/analytics/vendor/ — vendor sales (date-range filter)
GET /api/analytics/admin/ — platform-wide (date-range + category)

All endpoints use existing auth (JWT) + role permissions from core. No new auth mechanism.

---

## 15. FRONTEND ROUTE / UX PLAN (not created)

/routes updates (existing Router.jsx — add only):
- /notifications — notification list / management (student/vendor/admin)
- /books — browse second-hand books (public within auth)
- /books/my-listings — student seller's listings + reserve confirmations
- /books/{id}/ — book detail + reserve action
- /vendor/analytics — vendor sales chart page
- /admin/analytics — admin platform-wide charts

Pages needed (not implemented):
- NotificationsPage (list, unread filter, mark-read action)
- BookBrowsePage / BookDetailPage (image, condition, price, reserve button, seller info)
- BookMyListingsPage (list + edit reserve status + mark-sold)
- VendorAnalyticsPage (sales over time, top items — Recharts)
- AdminAnalyticsPage (platform orders, hostel, inventory — Recharts)

No removal of existing student/warden routes. All new routes under /books or /notifications or /analytics.

---

## 16. SECURITY PLAN

Notifications:
- Authorization: user sees only own notifications (403 for other user's ID). Unread count must not leak across users.
- Input: mark-read on non-existent ID returns 404 (exact, not in-range).
- Rate: basic throttle on unread query to prevent scraping.

Books:
- Ownership: only seller can edit/confirm-sale; buyer can reserve; admin can view.
- Double-sale: database-level constraint (only one active reservation per listing) + service-level transaction check.
- Availability: listing must be marked unavailable after confirmed sale; no edit-after-sale (only relist as new).
- Image/upload: reuse existing Cloudinary setup (design mentions; not yet configured in current code — use existing listing image mechanism).

WebSockets (G4, deferred):
- Authentication: connect with JWT token; reject unauthenticated.
- Authorization: user only receives events for own notifications/orders/hostel requests; no cross-user broadcast.
- Security: no message content injection via client input; server generates all messages.

Analytics: read-only endpoints; no mutation via analytics URLs; role-filtered (vendor sees only own; admin all).

---

## 17. TRANSACTION / CONCURRENCY PLAN

Notification creation inside domain services (orders/hostel) wrapped in same transaction.atomic() — notification insert rolls back if order fails (or remain independent — design choice; recommend independent but consistent: create notification after successful commit, or include in same transaction if event-triggered synchronously). For simplicity: synchronous creation inside service after update, within same atomic block if event is part of the same operation.

Book reservation: transaction.atomic() + select_for_update() on Listing/BookDetail; check is_available; if false raise; else reserve; create BookTransaction; save. Prevents race-condition double reservation.

Book confirmation: same — lock listing; verify buyer has active reservation; update is_available=False; save BookTransaction completed.

No new concurrency rules for analytics (read-only aggregates).

---

## 18. TEST PLAN (must have exact assertions — never (200,403))

Notifications:
- test_notification_list_own_only: create 2 users; auth user A; assert only A's notifications returned; assert B's not present.
- test_notification_unread_count_exact: unread=3; call /unread-count/; assert response.data == 3 (exact int, not in-range).
- test_notification_mark_read_own_403_for_other: auth user B tries PATCH /notifications/A-notification-id/; assert 403 exactly.
- test_notification_trigger_on_order_status: submit order; transition status; assert notification created with correct type; exact 201 for notification; claim/assign tests preserved exactly.

Books:
- test_book_reservation_blocks_duplicate: reserve by A (200); reserve by B (exact 403 or 400 — specify exactly based on design); reserve again by A (exact 400 — already reserved).
- test_book_sale_prevents_resale: confirm sale (200); reserve by new buyer (exact 403); edit listing after sale (exact 403 or 400).
- test_book_list_inventories: create BookDetail with is_available=True; after confirm-sale assert False.

Authorization (preserved from Phase F — exact assertions):
- claim unassigned: 200; other warden on assigned: 403 (exact — not ambiguous).

Analytics / Admin:
- test_analytics_vendor_shows_only_own: auth vendor; assert response data contains vendor's orders only.

---

## 19. PERFORMANCE PLAN

- Notification unread query: (user_id, is_read) index prevents full scan; unread count uses .filter(is_read=False).count() — fast at campus scale (<10k users).
- Book browse: filter(is_available=True) on BookDetail + Listing; index on listing.category_type + is_available.
- Analytics: aggregation over orders/inventory with .values() + .annotate(); for campus-scale (hundreds of orders/day) live aggregation acceptable; if performance degrades, add materialized view or cached summary — not ahead of need.
- WebSocket (G4 deferred): basic Channels with group names (user_{id}) — minimal fan-out (one to one); no broadcast storm risk at campus scale.
- No premature caching / Redis use required for Phase G exit; existing Redis channel layer is sufficient.

---

## 20. RISKS AND MITIGATIONS

- Risk: scope creep into full messaging/chat (undecided architecture). Mitigation: defer messaging entirely; use profile/contact info for buyer-seller contact; reopen only if product requires it after G1/G2.
- Risk: notification creation in synchronous service blocks transactions. Mitigation: include inside atomic if event is part of transition; if performance becomes issue, move to post-commit (separate task — not in G1).
- Risk: double-sale race condition missed in tests. Mitigation: test with concurrent reservation attempts; use transaction + select_for_update; never rely only on service-level check.
- Risk: analytics queries cause N+1 (listing per order item). Mitigation: use .select_related() / .prefetch_related() in analytics service; test with full dataset.
- Risk: Phase G too large (notifications + books + analytics + WebSocket + admin all at once) causes unstable state. Mitigation: split to G1/G2/G3/G4; only approve G1 + G2 for first implementation pass.

---

## 21. PHASE G EXIT CRITERIA

Before any Phase G is declared complete (do NOT call complete prematurely):

- G1: Notification model exists; API returns exact unread counts (no in-range assertions); 403 for cross-user access; order/hostel transitions trigger notifications (verified by test); frontend notification bell displays unread count.
- G2: BookDetail model + reservation endpoint exist; confirmed sale prevents double purchase (exact 403 or 400); frontend browse + reserve + confirm-sale flow works; no inventory conflict with existing orders.
- G3 (if included): Analytics pages show real aggregated data from existing tables; no 404/empty-state for valid roles; no N+1 query problems.
- G4 (if included, deferred): WebSocket delivers notification events to authenticated user's channel only; reconnect works; cross-user leakage tested and blocked.
- All new code has exact assertions (never ambiguous in-range); existing Phase F tests (hostel requests, authorization with exact 403) remain passing; git status clean; commit message exact.

NO PHASE G IMPLEMENTATION IS STARTED at time of this plan. Confirmed below.

---

## 22. RECOMMENDED NEXT IMPLEMENTATION STEP

Approve G1 scope first (Notification Foundation) — smallest, has highest dependency value (G4 depends on it, analytics can reference notifications), and validates authorization/notification patterns without touching books or analytics. After G1 approved and committed, approve G2 (Book skeleton). Do NOT combine G1+G2+G3 into single work batch.

Next action after approval: create Notification model + serializer + viewset + service; add /notifications route; update nav with bell; write exact tests (unread count 3 → assert 3; cross-user PATCH → 403); commit with message describing exact feature (e.g., "Add notification foundation G1").

---

## STEP 17 — NO CODING CONFIRMATION (VERIFIED)

- No production code changed: TRUE (git status shows only prior Phase F modifications; no new file edits)
- No migrations created: TRUE (no backend/apps/notifications/migrations/* new; no makemigrations run)
- No frontend implementation changed: TRUE (Router.jsx unmodified for G; no new pages written)
- No backend implementation changed for G: TRUE (notifications/views.py/serializers.py/models.py remain 0 lines)
- No commit created for G: TRUE (latest commit remains f51223b — Phase F; no new commit)
- No push performed for G: TRUE (no push event; branch main at f51223b)
- Phase G implementation has NOT started: TRUE (only planning document written)

Plan file: Phase_G_Roadmap.md (this file). No other files changed.
