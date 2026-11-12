# Phase H — Product Readiness

## Goal

Make the existing campus workflows reliable enough for a supervised pilot by fixing the backend CI failures and completing the profile, vendor listing, and support inquiry flows.

## Scope

- Align cart and order API routes with the frontend contract.
- Return a clear forbidden response when a warden attempts to change another warden's assigned request.
- Keep vendor listing management scoped to the signed-in vendor and wire create, edit, and deactivate actions to the API.
- Connect profile editing and password changes to the existing authentication API.
- Persist campus support inquiries and make them reviewable by administrators.
- Correct CI checks where they relied on an invalid WebSocket origin or bypassed database constraints incorrectly.

## Completion checks

- GitHub Actions backend and frontend jobs pass on the phase pull request.
- Existing order, hostel request, book reservation constraint, and notification WebSocket checks pass.
- `makemigrations --check --dry-run` reports no missing migration.
- The phase is merged to `main` so it can be pulled with the normal project checkout.

## Deferred until a pilot defines the requirement

- Payment gateway or campus wallet integration; current checkout strategies are simulated.
- Student identity verification and institution-specific contact details.
- Image upload storage and buyer–seller messaging.
