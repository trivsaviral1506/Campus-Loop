# Changelog

All notable changes and technical baseline audits for the CampusLoop platform will be documented in this file.

---

## [Unreleased - Pending Features & Security Hardening] - 2026-11-25

### Added
- **Docker & CI/CD:** Added `server/Dockerfile`, `client/Dockerfile`, `client/nginx.conf`, root `docker-compose.yml` (with persistent MongoDB and `/uploads` volumes), and `.github/workflows/ci.yml` covering lint, unit tests, integration tests (with MongoDB service), and production build.
- **Offline Unit & Utility Tests:** Added `server/tests/unit.test.js` (`npm run test:unit --prefix server`, 4/4 passing) and `client/tests/utils.test.js` (`npm test --prefix client`, 2/2 passing).
- **Shared Listing Form & Image Upload:** Created `client/src/components/ListingForm.jsx` and `getImageUrl` in `client/src/lib/utils.js` to unify `CreateListing.jsx` and `EditListing.jsx`, enforce Safe Pickup Zone selection via `GET /api/items/pickup-zones`, and support `multipart/form-data` image uploads via `POST /api/upload`.
- **Handover PIN Display & Borrower Cancellation:** Updated `client/src/pages/BorrowerDashboard.jsx` to display the 6-digit `handoverPin` alongside the QR code, add a Cancel button (`DELETE /api/requests/:id`) for pending requests, and wire `MessageModal` and `ReviewModal`.
- **Owner Dashboard Integrations:** Updated `client/src/pages/OwnerDashboard.jsx` to use `GET /api/items/my`, wire `HandoverModal` for PIN/QR verification (removing the status-bypass call), and wire `MessageModal` and `ReviewModal`.
- **Navigation & Notifications:** Updated `client/src/components/Navbar.jsx` with a `/borrowed` navigation link, active route styling via `NavLink`, and mounted `NotificationDropdown.jsx`.
- **Profile Reviews & Admin KPIs:** Updated `client/src/pages/Profile.jsx` to display average rating and received reviews (`GET /api/reviews/user/:userId`), and updated `client/src/pages/AdminDashboard.jsx` to render 6 KPI summary cards from `GET /api/admin/metrics`.
- **Security Hardening & Env Templates:** Added `server/config/jwt.js` (fails startup in production if `JWT_SECRET` is missing), `server/middleware/rateLimit.js` (rate limits auth and messaging endpoints), restricted CORS via `CLIENT_URL` in `server/server.js`, and added `server/.env.example` and `client/.env.example`.
- **Backend Integration Test Suite:** Added `server/tests/api.test.js` using `node:test` and updated `server/package.json` `test` script.

### Verification
- `npm run lint --prefix client`: 0 errors (13 warnings).
- `npm run build --prefix client`: Succeeded.
- `node --check server/server.js` & `node --check server/tests/api.test.js`: Passed.
- `npm test --prefix server`: Created; could not complete in offline sandbox due to no running local `mongod` and no network access for `mongodb-memory-server` binary download.

---

## [Baseline Audit] - 2026-11-25

### Audit Summary
Comprehensive code quality, architectural audit, and codebase inspection performed by a Senior Software Engineer. Documented existing backend/frontend architecture, identified orphaned components (`NotificationDropdown`, `MessageModal`, `ReviewModal`, `HandoverModal`), Safe Pickup Zone validation mismatches, and security gaps.
