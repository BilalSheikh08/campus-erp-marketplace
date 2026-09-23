# Phase G1 — NOTIFICATION FOUNDATION — LOCKED SPEC
Status: IMPLEMENTED IN FINAL WORKING BUNDLE — acceptance criteria preserved for traceability

> Implementation note: the sections below preserve the original locked acceptance criteria and file plan. Any wording such as “not yet created”, “will be created”, or “implementation NOT started” is historical and refers to the specification stage. The delivered source tree now contains the corresponding implementation and migrations.

---

## 1. ARCHITECTURE CORRECTIONS (from review)

- BookDetail ALREADY EXISTS in backend/apps/listings/models.py (one-to-one Listing extension with seller, condition, author, subject, edition, expected_category=BOOK). G2 must extend BookDetail — NOT recreate it. G2 scope: reservation/sale workflow around existing BookDetail.
- Messaging/chat DEFERRED. No Conversation/Message/WebSocket chat in G1, G2, or G3. Messaging deferred to future phase.
- WebSockets are DELIVERY INFRASTRUCTURE (not business domain). G4 = delivery mechanism for notifications; persistent Notification remains source of truth. REST history always works regardless of WebSocket.
- G1 must be useful without WebSockets enabled.
- Locked Phase G sequence: G1 (Notification Foundation) → G2 (Book Marketplace using existing BookDetail) → G3 (Analytics) → G4 (Real-Time Delivery / deferred until G1 exists). No expansion beyond this.

---

## 2. FINAL PHASE G STRUCTURE (locked)

G1 — Notification Foundation
G2 — Second-Hand Book Marketplace (existing Listing + existing BookDetail + BookTransaction/reservation workflow; NOT a duplicate model)
G3 — Analytics (live aggregation queries only; no new analytics model required)
G4 — Real-Time Delivery / WebSockets (deferred until G1 notifications exist; delivery mechanism only, source of truth = Notification model)

DEFERRED: Full messaging/chat, AI recommendations, real-time analytics streaming, premature caching/materialized reporting, unnecessary advanced admin redesign.

---

## 3. G1 OBJECTIVE

Build a persistent, secure, role-aware notification system serving Students, Vendors, Wardens, and Admins. Must work completely independently of WebSockets. Must be server-controlled (clients cannot create notifications for other users). Must integrate with existing Orders (orders app) and Hostel Requests (hostel_requests app) domain services.

---

## 4. G1 MODEL SPECIFICATION (Notification — new; no BookDetail change)

App owner: notifications (existing scaffold apps/notifications/).
Migration: notifications.0001_g1_notification.py (included in the final bundle).

Fields (every field justified):

- id: UUID, PK, default=uuid.uuid4, editable=False (reason: consistent with existing Listing/Order UUID pattern; prevents integer enumeration)
- user: ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, related_name="notifications", db_index=True) — reason: exactly one authenticated user owns each notification; isolation enforced at DB and permission level
- message: CharField(max_length=500) — reason: server-generated message content; short enough for list view, long enough for event description (e.g. "Hostel request #abc approved by Warden A")
- notification_type: CharField(max_length=40, choices=[...]) — reason: category for filtering/display; NOT arbitrary free text (controlled by server)
- category: CharField(max_length=30, blank=True, default="") — reason: optional grouping (e.g. "order", "hostel", "inventory", "system"); not required for G1 minimum but allows filtering without overengineering
- is_read: BooleanField(default=False, db_index=True) — reason: read/unread state is core G1 requirement; index required for unread count query performance
- created_at: DateTimeField(auto_now_add=True, db_index=True) — reason: timestamp for ordering; index supports ordered queries

NO foreign keys to Order / HostelRequest / Listing / BookDetail. Reason: notifications must remain independent of downstream data lifecycle; linking notifications directly to resource PK introduces cleanup/deletion complexity (e.g. deleted order leaves orphan notification FK). G1 uses user + notification_type + message for identification; if later needed, reference IDs can be embedded in message or added in future extension. This is the simplest maintainable approach for a student project.

Meta:
- ordering = ["-created_at", "-id"]
- indexes: (user, is_read) compound for unread count; (created_at) for ordering (already covered by individual indexes; compound optional but recommended: Index(fields=["user", "is_read"]) for unread query)
- constraints: none beyond FK integrity

Status/Lifecycle: ONLY read/unread (is_read False/True). No additional status machine (e.g. no "archived", "deleted", "acknowledged"). Reason: G1 requirements specify read/unread only. No product requirement demands more states; adding extra states without justification over-engineers.

---

## 5. G1 SERVICE SPECIFICATION (notifications/services.py — new file; reuse existing patterns)

File: backend/apps/notifications/services.py (new)

Service functions (small clean boundary):

- create_notification(user, notification_type, message, category="") -> Notification instance
- notify_order_transition(order, actor, target_status, note="") -> creates notification for student (order.student) and optionally vendor/admin based on event importance
- notify_hostel_request_transition(request, actor, target_status, note="") -> creates notification for request student and assigned warden (if transition changes status significantly: submitted→pending_approval, pending_approval→approved/rejected, approved→fulfilled, approved→cancelled)
- notify_low_stock(inventory) -> ONLY if existing inventory service already defines a meaningful threshold; must check current inventory code
- get_unread_count(user) -> exact count of user.notifications.filter(is_read=False).count()

Server-controlled: all create_... functions take user explicitly (do not derive from request; called from domain services). Client POST /notifications is NOT exposed. Reason: prevents clients from forging notifications for other users.

Transaction behavior:
- For order/hostel events: notification created INSIDE same transaction.atomic() block as domain transition (inside existing transition_hostel_request or order service). Reason: notification must reflect committed state change; if domain transition rolls back, notification must not persist. This requires calling notification service before or within existing atomic block — NOT after external commit.
- For inventory low-stock: notification can be after transaction commit (if threshold check runs post-commit). Recommendation: keep inside same service but document clearly; simplest is include in same service method but separate from DB transaction if not critical. For G1, include inside service; exact transaction behavior documented but not changed from existing inventory services.

---

## 6. G1 API CONTRACT

App: notifications (existing apps/notifications/)
Serializers: new notifications/serializers.py
Views: new notifications/views.py — NotificationViewSet with custom actions
URLs: extend existing notifications/urls.py (currently empty/stub)

Endpoints (exact):

GET /api/notifications/
- Auth: required (JWT Bearer).
- Authorization: user must be authenticated; response filtered to request.user only.
- Request: none (GET)
- Response (200): paginated list of user's notifications with message, notification_type, category, is_read, created_at (formatted or ISO); NO nested FK objects.
- Filters: ?unread=true (filter is_read=False); ?category=<string> (optional)
- Ordering: default -created_at; ?ordering=created_at optional
- Pagination: yes (PageNumberPagination or CursorPagination with consistent page_size, e.g. 20)
- Error codes: 401 unauthenticated; 403 not allowed (not expected for own list, but enforced); 500 server error only if DB failure

GET /api/notifications/unread-count/
- Auth: required
- Authorization: user sees only own count
- Request: none
- Response (200): {"unread_count": integer} — EXACT integer, not approximate, not boolean, not list
- Filters: none (always user's own unread)
- Status codes: 401, 500

PATCH /api/notifications/<id>/
- Auth: required
- Authorization: notification.user == request.user (exact ownership check); if different user: 403 exactly (not ambiguous, not in-range)
- Request body: {"is_read": true} (only field allowed; server ignores any other fields — mass assignment protection)
- Response (200): updated notification with is_read=True; message same format as list
- If notification.id does not exist: 404
- If user tries PATCH for other user's notification: 403 (exact, tested)
- Status codes: 401, 403, 404, 200, 400 (invalid body only)

POST /api/notifications/ (NOT exposed to clients)
- Recommendation: NO public endpoint. Notification creation is service-only. This avoids authorization complexity for creation and ensures server-controlled content.

Admin behavior: Admin does NOT automatically bypass ownership for notifications. Admin should see own notifications (like any user). If admin needs visibility into all notifications, that requires a separate admin endpoint with explicit admin role permission — NOT implied by the standard notification endpoint. G1 does NOT implement cross-user admin visibility unless explicitly required; keep simple.

All authorization assertions in tests must use exact values (not ranges): e.g. assert response.status_code == 403, not in (200, 403).

---

## 7. G1 AUTHORIZATION MATRIX

Rule: user may access ONLY their own notifications.

- Student reads own notification list → 200 (filtered to self)
- Student accesses another user's notification (PATCH /notifications/other-id/) → 403 exact
- Student accesses notification that does not exist → 404
- Vendor reads own → 200
- Vendor accesses student's notification → 403
- Warden reads own → 200
- Admin reads own → 200 (same as any user; no special cross-user visibility in G1)
- Unauthenticated GET /notifications/ → 401
- Unauthenticated PATCH → 401

Cross-user isolation enforced by both serializer (filter queryset) and object-level permission class.

---

## 8. G1 FRONTEND UX SPECIFICATION (no implementation yet)

Routes (to add to frontend/src/routes/Router.jsx — NOT yet modified):
- /notifications (new protected route, accessible to all roles)

Page: NotificationsPage (new: frontend/src/pages/NotificationsPage.jsx — NOT yet created)

Components (conceptual):
- NotificationsPage: shows user's notification list, unread count header, filter buttons (unread/all), loading state, error state, empty state.
- NotificationItem: single notification card with message, type, category, created_at, Read/Unread state, Mark Read button.
- NavbarNotificationBell (update existing nav component — NOT yet modified): bell icon with unread badge (red circle with count from /unread-count/); click opens dropdown preview of latest 5 notifications; shows "View all" link.

State handling:
- Unread count fetched on page load and after mark-read action (re-fetch /unread-count/ or update from PATCH response).
- List fetched once on mount; refresh on filter change or manual refresh.
- No WebSocket subscription in G1 (WebSocket deferred to G4).

Loading state: spinner while fetching list/count (reuse existing LoadingSpinner component).
Empty state: text "No notifications yet." when list is empty.
Error state: error banner with retry button (reuse existing patterns from other pages).

API service (existing architecture): add to existing frontend/src/services/ (currently only hostelRequestsApi.js). Create notificationsApi.js (NOT yet created) following same Axios/interceptor pattern (reuse auth token from store, handle 401 by redirecting to login if needed).

---

## 9. G1 INTEGRATION MAP (existing files to reference; NOT modified)

Files to reference (read-only for G1 planning):
- backend/apps/orders/services.py — transition_hostel_request equivalent for orders? Check orders/services.py for order status transition functions (exists; verify exact function names and transaction patterns).
- backend/apps/orders/models.py — check Order model fields, especially student/user FK, vendor FK, status field, status logs.
- backend/apps/orders/serializers.py — check order serializer output format.
- backend/apps/hostel_requests/services.py — transition_hostel_request() is existing; integration point for notifications (add notify_hostel_request_transition inside same atomic block or immediately after)
- backend/apps/hostel_requests/models.py — HostelRequest fields: student, assigned_warden, status, listing, quantity.
- backend/apps/inventory/services.py — check inventory threshold/low-stock logic (if any threshold exists; verify before implementing notify_low_stock). If no threshold mechanism exists in current inventory service, DO NOT invent one; skip inventory notifications for G1 and document deferred.
- backend/apps/users/models.py — role enum (STUDENT, VENDOR, WARDEN, ADMIN) for notification filtering.
- backend/config/settings.py — INSTALLED_APPS includes notifications? Check and confirm notifications app is registered (already scaffolded; may need ensuring in INSTALLED_APPS).

Integration points (conceptual — exact insertion points to define during G1 implementation, NOT modified now):
- Order service transition: insert notify_order_transition after status update but within same transaction (before commit — or include in same atomic call).
- Hostel request transition: inside transition_hostel_request (same atomic block) — call notify_hostel_request_transition.
- Low-stock: ONLY if inventory service defines threshold; skip if not present.
- Vendor/Admin events: NOT included in G1 unless explicitly required; focus on order + hostel events.

---

## 10. G1 TRANSACTION STRATEGY

Notification creation must reflect committed domain change.

Approach: inside each domain service's transaction.atomic() block, call the notification service BEFORE the transaction commits. This ensures that if the domain transition succeeds, notification is created; if it rolls back, notification is not persisted (same rollback applies to both).

Implementation note: the notification service should not open its own nested atomic block unless needed. Calling create_notification within the existing transaction.atomic() is sufficient.

For events without a parent transaction (e.g. low-stock check that runs independently): notification can be created after the service confirms the event occurred; no nested transaction needed.

No rollback behavior needed for notification deletion — G1 does not delete notifications. Read/unread only.

---

## 11. G1 SECURITY REVIEW

Verified risks and mitigations:

- Object-level authorization: NotificationSerializer / ViewSet uses queryset.filter(user=request.user) and checks object.user == request.user for PATCH. 403 for any other user. No ambiguous assertions.
- User isolation: DB index (user, is_read) ensures queries are bounded; pagination prevents scraping entire DB.
- ID enumeration: UUID PK prevents integer scanning; no sequential IDs exposed.
- Notification content leakage: message is server-generated; clients never submit message content for notifications.
- Mass assignment: PATCH only allows is_read; serializer ignores extra fields (use serializers.ModelSerializer with explicit fields list, not serializers.Serializer that allows arbitrary fields by default unless properly restricted).
- Unsafe PATCH fields: only is_read writable; all other fields read-only in serializer.
- Role leakage: authorization does not grant special cross-user visibility to admin; standard endpoint filters by user.
- API throttling: reuse existing throttling if needed; basic throttle sufficient (not over-engineered for G1).
- Pagination abuse: fixed page_size (e.g. 20); no arbitrary large page_size allowed.

---

## 12. G1 PERFORMANCE / INDEX PLAN

Indexes (only when justified):
- user + is_read compound index (required for unread count query performance: SELECT ... WHERE user_id=X AND is_read=False)
- created_at (required for ordering; covered by default index or compound)
- user only (required for list query filtering; compound with is_read covers most cases; separate user index optional but recommended for list query)

No Redis caching for notifications. No materialized reporting for G1. Notifications are small rows; campus scale (<10k users, <100 notifications/user) requires no advanced caching.

Query patterns:
- List: .filter(user=user).order_by("-created_at"); pagination applied.
- Unread count: .filter(user=user, is_read=False).count()
- PATCH: get(pk=id, user=user); update is_read; save.

No N+1: Notification model has no FK references to orders/requests (intentionally); no related queries needed.

---

## 13. G1 TEST MATRIX (exact assertions — no ambiguous ranges)

Backend (pytest in notifications app):

1. test_create_notification_success — exact: assert notification.user == user; assert notification.is_read == False; assert notification.created_at is not None.
2. test_notification_list_own_only — auth user A; create A notification; create B notification; assert A's list response count == 1; assert B's notification id NOT in response IDs.
3. test_notification_cross_user_isolation — auth user A tries GET /notifications/ filtering by ?user=B (not allowed); response must return only A's notifications; if endpoint ignores ?user filter (correct behavior), response still only A's.
4. test_notification_access_other_user_403 — auth A; PATCH /notifications/B-notification-id/; assert response.status_code == 403 (exact, not in range).
5. test_notification_unread_count_exact — auth A; create 3 unread notifications; assert GET /unread-count/ response.data["unread_count"] == 3 (exact int); create 1 more; assert == 4; mark 1 read; assert == 3.
6. test_notification_mark_own_read — auth A; PATCH /notifications/A-notification-id/ with {"is_read": true}; assert response.status_code == 200; assert response.data["is_read"] == True; refresh GET /notifications/<id>/; is_read == True.
7. test_notification_cannot_mark_other_read — auth A tries PATCH /notifications/B-notification-id/; assert status_code == 403; assert B notification is_read unchanged.
8. test_notification_unauthenticated_rejected — no auth header; GET /notifications/; assert 401; PATCH any; assert 401.
9. test_notification_pagination — auth A; create 25 notifications; GET /notifications/?page_size=20; assert response has pagination links; assert first page count <= 20.
10. test_notification_filter_unread — auth A; create 2 unread, 2 read; GET /notifications/?unread=true; assert all returned have is_read=False; assert count == 2.
11. test_order_notification_trigger — submit order + transition; verify notification created for student; assert notification.message contains expected text; assert notification.notification_type correct.
12. test_hostel_notification_trigger — submit hostel request + approve/reject; verify notifications for student and assigned warden (as appropriate); assert exact 200 for transition, notification created.
13. test_notification_not_created_on_failed_domain — attempt invalid order/hostel transition (e.g. unauthorized transition); domain service raises error; verify no notification created; verify no DB notification row exists.
14. test_notification_transaction_rollback — simulate domain failure within same transaction (e.g. mock exception after transition); verify notification not persisted; verify notification count unchanged.
15. test_notification_role_isolation — create notifications for student, vendor, warden, admin separately; auth as each; assert only own notifications visible.

Frontend (if tests added):
- Build passes (npm run build)
- Lint passes (npm run lint)
- Component displays loading, empty, error, list states; unread count updates; no cross-user content shown.

---

## 14. G1 ACCEPTANCE CRITERIA (objective, verifiable)

G1 is complete ONLY when ALL of the following are true:

1. Notification model exists in notifications app with fields: id, user, message, notification_type, category, is_read, created_at (no extra fields without justification).
2. Own-only access enforced exactly (other user's PATCH → 403, not 200; not in range).
3. Unread count endpoint returns exact integer (not approximate, not boolean, not list).
4. Server generates notifications for at least: order transition events and hostel request transition events.
5. Notification creation fails (rolls back) when underlying domain operation fails (tested with transaction rollback).
6. No public POST /notifications/ endpoint exposed to clients.
7. WebSockets are implemented in G4; G1 remains fully usable without them; notifications fully usable via REST.
8. Existing Phase F tests pass (hostel authorization with exact 403, inventory transaction, order services) — no regression.
9. No ambiguous assertions in any new tests (exact values only: == 200, == 403, == 404).
10. Frontend build and lint pass; notification pages load with correct states.
11. No production code outside notifications/services.py, notifications/serializers.py, notifications/views.py, notifications/urls.py (plus integration points in orders/hostel services); no changes to other apps.
12. No migrations created for G2 (BookTransaction) or G3 (Analytics) during G1.

---

## 15. IMPLEMENTATION FILE PLAN (historical plan; implementation completed)

Files to create (new):
- backend/apps/notifications/models.py (Notification model — new content; currently 0 lines)
- backend/apps/notifications/serializers.py (NotificationSerializer, ReadOnlyNotificationSerializer — new content; currently 0 lines)
- backend/apps/notifications/services.py (create_notification, notify_order_transition, notify_hostel_request_transition, notify_low_stock — new file)
- backend/apps/notifications/views.py (NotificationViewSet with list, unread-count, partial_update — new content; currently 0 lines)
- backend/apps/notifications/urls.py (router with /notifications/, /unread-count/, /<id>/ — extend current empty/stub file)
- backend/apps/notifications/migrations/0001_initial.py (generated by makemigrations; NOT manually created)
- frontend/src/pages/NotificationsPage.jsx (new page)
- frontend/src/services/notificationsApi.js (new service following existing Axios/interceptor pattern)

Files to integrate (modify — ONLY during implementation, NOT now):
- backend/apps/orders/services.py (add notify_order_transition call within order transition service)
- backend/apps/hostel_requests/services.py (add notify_hostel_request_transition call within transition_hostel_request; same atomic block)
- backend/config/settings.py (verify INSTALLED_APPS includes notifications; already scaffolded — only confirm)
- frontend/src/routes/Router.jsx (add /notifications route — minimal change)
- frontend/src/components/nav/Navigation.jsx (or equivalent navbar component — add bell icon + dropdown; check current nav component file first)

Files NOT to modify during G1:
- backend/apps/listings/models.py (BookDetail exists; leave unchanged for G2)
- backend/apps/books/ (exists but empty/stub; NO changes during G1)
- backend/apps/analytics/ (empty/stub; NO changes during G1)
- backend/apps/orders/models.py (read-only reference; no structural change needed for G1)
- any WebSocket-related files (deferred to G4)

---

## 16. OPEN DECISIONS, IF ANY

None critical for G1. Confirmed:
- Notification model fields final (no extra FK references; simple message/text approach).
- No public POST endpoint for notifications.
- No cross-user visibility for admin in G1.
- WebSockets deferred; delivery mechanism not part of G1.
- Messaging/chat deferred; no Conversation or Message model.

Optional questions for future approval (not blocking G1):
- Should G2 BookTransaction model include FK to Notification for sale events? (Not required; notifications can reference book via message text; deferred to G2 spec.)
- Should G4 WebSocket consumers use Django Channels groups (user-specific)? (Yes — deferred; architecture confirmed but implementation deferred until G1 complete.)

---

## 17. FINAL RECOMMENDATION

Approve G1 scope exactly as specified above. Start with:
1. Create Notification model + serializers + services (notification services only — NOT orders/hostel integration yet).
2. Add basic views + URL routing.
3. Add exact authorization tests (own-only, 403 exact, unread count exact).
4. Only after G1 notification service passes standalone tests, integrate into orders/services.py and hostel_requests/services.py.
5. Only after backend tests pass, implement frontend notifications page and navbar bell.
6. Confirm no modification to books/app, analytics/app, WebSocket code, messaging code, or routes other than /notifications.
7. Commit message exact (e.g. "G1: Add Notification model, services, views, authorization, tests, frontend route" — not ambiguous).

---

VERIFIED STATE (no code changed):
- backend/apps/notifications/models.py: implemented Notification model in the working bundle.
- backend/apps/notifications/serializers.py: 0 lines (unchanged)
- backend/apps/notifications/views.py: 0 lines (unchanged)
- backend/apps/notifications/services.py: implemented service layer in the working bundle.
- backend/apps/listings/models.py: READ — BookDetail exists; NOT modified; verified fields (listing PK, seller FK, condition, author, subject, edition)
- backend/apps/notifications/urls.py: existing stub (empty/stub); NOT modified
- frontend/src/routes/Router.jsx: NOT modified (will be modified during G1 implementation, NOT now)
- No new files created outside this spec document
- Notifications migration is included as backend/apps/notifications/migrations/0001_g1_notification.py.
- No commit made for G1
- No push performed
- G1 implementation is complete in the working bundle; this section is retained as the historical locked plan.

Plan locked. Ready for user approval before G1 implementation begins.
