# Phase G Completion

## Delivered

Phase G is implemented as four dependency-ordered increments:

- **G1 Notifications:** persistent user-owned notifications, exact unread count, filters, read state, server-generated order/hostel/inventory/book events, REST API, navbar center, and authorization isolation.
- **G2 Books:** student-to-student second-hand book listings using the existing `Listing` + `BookDetail`, reservation, seller confirmation, completion/cancellation, availability lock, database-level single-active-transaction constraint, and audit logs.
- **G3 Analytics:** live vendor/admin aggregation APIs and React dashboards with date ranges, sales trends, top items, order/category/hostel/book/user summaries, and low-stock metrics.
- **G4 WebSockets:** JWT-authenticated Channels consumer, per-user groups, notification sync, targeted delivery, reconnecting frontend socket, Redis support in Compose, and Nginx WebSocket proxying.

## Intentionally deferred

Open-ended peer-to-peer chat/messaging, AI recommendations, streaming/precomputed analytics, and larger custom-admin extensions were not added because they were explicitly outside the Phase G exit scope.

## Verification performed in the authoring environment

- Python source compilation: passed with `python3 -m compileall -q backend/apps backend/config backend/manage.py`.
- Frontend ESLint: passed.
- Frontend Jest: passed for the delivered notification-store suite.
- Frontend production build: not executable in this Linux authoring environment because the uploaded `node_modules` contains Windows Rollup optional binaries but not the Linux Rollup binary. `npm install`/`npm ci` on the target machine is required before running the production build there.
- Django/pytest integration suite: not executable in this environment because Django dependencies are not installed locally and package download is unavailable. The final bundle includes the backend test suite and a CI workflow that will execute it in GitHub Actions.

## GitHub status

The source bundle contains the completed working tree. No claim is made that GitHub `main` was updated from this environment; the available GitHub write path returned HTTP 403 during the handoff.
