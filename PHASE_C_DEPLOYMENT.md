# PHASE C - VERIFICATION & DEPLOYMENT CHECKLIST

## Pre-Deployment Verification Commands

Run these commands to verify Phase C is ready for deployment:

### Backend Verification

```bash
# Navigate to backend
cd backend

# Check Django system status
python manage.py check
# Expected: System check identified no issues (0 silenced).

# Run all tests
python -m pytest -v
# Expected: 51 passed in ~61 seconds

# Check for pending migrations (should be none)
python manage.py makemigrations --check --dry-run
# Expected: No migrations needed
```

### Frontend Verification

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if needed)
npm install

# Lint all code
npm run lint
# Expected: 0 errors, 0 warnings

# Build production bundle
npm run build
# Expected: ✓ built successfully
# Output: JS: 287.40 KB (88.22 KB gzipped)
#         CSS: 22.75 KB (4.80 KB gzipped)

# Optional: Preview production build
npm run preview
# Then visit http://localhost:4173
```

---

## Deployment Verification Results

### ✅ Backend System Check
```
System check identified no issues (0 silenced).
```

### ✅ Backend Tests (51 Total)
```
apps/inventory/tests/test_inventory.py
- test_inventory_uses_uuid_and_calculates_stock_state PASSED
- test_inventory_is_one_to_one_and_rejects_reserved_over_quantity PASSED
- test_inventory_rejects_book_listings PASSED
- test_inventory_requires_approved_matching_vendor PASSED
- test_inventory_services_lock_and_preserve_stock_invariants PASSED
- test_reservation_and_consumption_require_active_listing PASSED
- test_update_inventory_rejects_quantity_below_reserved PASSED
- test_inventory_list_create_and_owner_scope PASSED
- test_admin_can_create_and_list_any_eligible_inventory PASSED
- test_inventory_rejects_books_and_cross_vendor_creation PASSED
- test_inventory_update_protects_listing_and_reserved_fields PASSED
- test_stock_adjustment_endpoint_is_transactional_and_validates_delta PASSED
- test_inventory_endpoints_require_approved_vendor_or_admin PASSED
- test_listing_public_response_exposes_safe_availability_only PASSED
- test_book_listing_has_no_inventory_availability PASSED

apps/listings/tests/test_listing_catalog.py
- test_listing_uses_uuid_and_rejects_negative_price PASSED
- test_all_domain_details_validate_and_are_one_to_one PASSED
- test_invalid_vendor_and_detail_relationships_are_rejected PASSED
- test_approved_matching_vendor_can_create_each_vendor_domain PASSED
- test_pending_rejected_and_mismatched_vendors_cannot_create PASSED
- test_student_book_listing_derives_seller_and_rejects_overrides PASSED
- test_public_catalog_search_filters_and_pagination PASSED
- test_owner_admin_update_and_delete_are_authorized PASSED
- test_category_alias_is_normalized PASSED

apps/orders/tests/test_orders.py
- test_cart_is_owned_and_duplicate_adds_increment PASSED
- test_cart_rejects_book_request_only_and_missing_inventory PASSED
- test_checkout_snapshots_price_deducts_stock_and_clears_cart PASSED
- test_checkout_splits_mixed_vendor_cart PASSED
- test_checkout_failure_keeps_cart_and_stock PASSED
- test_cancellation_restores_stock_once_and_refunds_mock_payment PASSED
- test_vendor_fulfillment_and_student_completion_follow_state_machine PASSED
- test_order_visibility_isolated_between_students_and_vendor PASSED
- test_cart_and_order_database_constraints PASSED
- test_payment_methods_are_explicit PASSED

apps/users/tests/test_authentication.py
- test_user_manager_uses_uuid_and_hashes_password PASSED
- test_registration_returns_tokens_and_never_exposes_password PASSED
- test_public_registration_cannot_assign_elevated_role PASSED
- test_login_uses_email_and_returns_safe_user PASSED
- test_refresh_rotation_and_logout_blacklist PASSED
- test_profile_can_update_safe_fields_only PASSED
- test_password_change_requires_current_password_and_hashes_new_password PASSED
- test_role_permissions_and_owner_permission PASSED

apps/vendors/tests/test_vendor_onboarding.py
- test_student_can_submit_pending_application PASSED
- test_duplicate_application_is_rejected PASSED
- test_invalid_vendor_type_is_rejected PASSED
- test_vendor_profile_can_be_retrieved_and_updated_while_pending PASSED
- test_only_admin_can_list_and_approve_vendors PASSED
- test_approved_vendor_cannot_change_type_or_be_approved_twice PASSED
- test_admin_rejection_persists_reason_and_is_terminal PASSED
- test_approved_vendor_permission_requires_role_and_status PASSED
- test_vendor_one_to_one_constraint_prevents_duplicate_rows PASSED

Result: 51 passed in 60.71s ✅
```

### ✅ Frontend ESLint
```
No errors or warnings found ✅
```

### ✅ Frontend Build
```
vite v5.4.21 building for production...
✓ 1609 modules transformed.
dist/index.html                   0.47 kB │ gzip:   0.29 kB
dist/assets/index-B3En87y-.css   22.75 kB │ gzip:   4.80 kB
dist/assets/index-ChehUxZP.js   287.40 kB │ gzip:  88.22 kB
✓ built in 5.67s ✅
```

---

## Environment Configuration

### Backend (.env or environment variables)
```
# Required for production
DATABASE_URL=postgresql://user:pass@host:5432/campus_erp
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=<generate-new-key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

### Frontend (.env)
```
VITE_API_URL=https://api.yourdomain.com
```

---

## Docker Deployment (if using)

### Build Images
```bash
# From repository root
docker compose build

# Start services
docker compose up -d

# Verify health
curl http://localhost:8000/health/
curl http://localhost:80/
```

---

## Post-Deployment Tests

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health/
# Expected: {"status": "ok", "service": "campus-erp-backend"}

# Frontend (should serve React app)
curl http://localhost/
# Expected: HTML response with React app
```

### Manual Smoke Test
1. Open http://localhost or https://yourdomain.com
2. Register new account
3. Login
4. Browse marketplace
5. Add item to cart
6. Complete checkout
7. View order history

### Expected Results
- ✅ Registration succeeds
- ✅ Login works with JWT token
- ✅ Marketplace displays listings
- ✅ Add to cart adds item
- ✅ Cart updates and displays
- ✅ Checkout creates order
- ✅ Order appears in history

---

## Rollback Plan

If issues occur post-deployment:

```bash
# Revert to previous version
git checkout <previous-tag>
cd backend && git checkout <previous-tag>
cd ../frontend && npm install && npm run build

# Restart services
docker compose down
docker compose up -d

# Verify rollback
curl http://localhost:8000/health/
```

---

## Monitoring Checklist

After deployment, monitor:

- [ ] Backend response times (< 500ms)
- [ ] Frontend page load (< 2s)
- [ ] Cart operations (< 1s)
- [ ] Checkout success rate (> 99%)
- [ ] Error logs (none critical)
- [ ] Database connections (< max)
- [ ] Memory usage (stable)
- [ ] CPU usage (< 70%)

---

## Support & Troubleshooting

### Common Issues

**Issue: Cart not syncing**
- Check JWT token validity
- Verify API_URL in frontend .env
- Check backend logs: `docker logs <backend-container>`

**Issue: Checkout fails**
- Verify inventory data exists
- Check stock levels
- Review backend logs

**Issue: Build fails**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Rebuild: `npm run build`

---

## Documentation References

See the following files for more information:

1. **PHASE_C_EXECUTIVE_SUMMARY.md** - High-level overview
2. **PHASE_C_COMPLETION.md** - Implementation details
3. **PHASE_C_MANUAL_TESTING.md** - Complete testing guide
4. **PHASE_C_INSPECTION.md** - Architecture analysis
5. **INVESTIGATION_REPORT.md** - Data setup documentation
6. **CLAUDE.md** - Project architecture

---

## Sign-Off

**Phase C Implementation:** ✅ Complete
**Quality Assurance:** ✅ Passed
**Testing:** ✅ All tests pass
**Build:** ✅ Success
**Deployment Ready:** ✅ Yes
**Approved for Production:** ✅ Ready

Date: 2026-08-29
Status: PRODUCTION READY

---

## Phase D Readiness

Once Phase C is live and stable, Phase D can begin:
- Order management and fulfillment
- Notification system
- Real-time updates (WebSockets)
- Analytics dashboard
- Advanced admin workflows

**Do not start Phase D until Phase C has been in production for at least 1 week.**
