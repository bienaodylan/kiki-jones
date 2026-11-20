# MIREZA Security Specification & Dirty Dozen Adversarial Payloads

## 1. Data Invariants
1. **Admin RBAC Exclusivity**: Only verified admins (`admins/{uid}` document or bootstrapped verified email `bienaodylan428@gmail.com`) may mutate catalog products, categories, variants, storefront CMS config, promotions, inventory movements, or import jobs.
2. **No Self-Assigned Admin Roles**: Standard customers cannot create or modify documents in `/admins/{uid}` or inject `role`/`isAdmin` fields into `/users/{uid}`.
3. **Published Catalog Boundary**: Unauthenticated visitors can only read `/products/{id}` where `status == 'published'` and `/categories/{id}` where `isActive == true`. Draft and archived products are strictly hidden from non-admins.
4. **PII Isolation**: Customer profiles (`/users/{uid}`), saved addresses (`/users/{uid}/addresses/{id}`), and orders (`/orders/{id}`) contain PII (`email`, `phone`, `shippingAddress`). Reads are strictly restricted to the owning `request.auth.uid` or an admin.
5. **Payment Authority**: Customers cannot set `paymentStatus: 'paid'` on order creation or update. Only verified server-side webhook verification or admin reconciliation can transition `paymentStatus` to `'paid'`.
6. **Temporal & Structural Integrity**: All document IDs are checked against `^[a-zA-Z0-9_\-]+$`, strings have bounded `.size()`, arrays have bounded `.size()`, and timestamps use `request.time`.

## 2. Dirty Dozen Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Shadow Admin Creation**: Non-admin authenticated user writes `/admins/{uid}` with `{ role: "super_admin" }`.
2. **Email Spoof Admin Escalation**: User signs in with unverified email claim (`email_verified: false`) matching admin email and attempts to write `/products/p1`.
3. **Ghost Field Injection on User Profile**: Authenticated user creates `/users/{uid}` with extra field `{ isAdmin: true }`.
4. **Cross-User Profile Read**: Authenticated user A attempts `get` on `/users/{userB_uid}`.
5. **Cross-User Order List Scraping**: Authenticated user A executes `list` on `/orders` without `userId == userA.uid` constraint.
6. **Unpublished Product Leak**: Public visitor attempts `get` on `/products/{draftId}` where `status == 'draft'`.
7. **Client-Side Paid Order Forgery**: Customer creates `/orders/{orderId}` with `paymentStatus: 'paid'`.
8. **Customer Order Price Tampering**: Customer updates `/orders/{orderId}` attempting to modify `totalXof: 0`.
9. **Resource Exhaustion ID Poisoning**: Attacker writes `/newsletter_subscribers/<2000-char-id>` with oversized string ID.
10. **Variant Stock Manipulation**: Non-admin customer attempts `update` on `/variants/{variantId}` to set `stockQty: 9999`.
11. **Promotion Code Forgery**: Non-admin user attempts `create` on `/promotions/FREE100`.
12. **Webhook Event Spoofing**: Client attempts direct `create` on `/payment_webhook_events/evt_fake`.
