# Agent Instructions & Guidelines: CampusLoop

These instructions are mandatory for any AI coding agent, engineer, or automated assistant working on the **CampusLoop** codebase.

---

## 1. Prime Directives

1. **Read Project Documentation First:**
   Before modifying or adding code, inspect `PROJECT_STATUS.md`, `ARCHITECTURE.md`, `README.md`, and `CHANGELOG.md` to understand existing structures, established conventions, and known limitations.
2. **Understand Existing Code Before Implementing:**
   Search the codebase before writing new functions or components. Multiple features in this repository (e.g., `NotificationDropdown`, `MessageModal`, `ReviewModal`, `HandoverModal`) were implemented but disconnected from parent views. Never build duplicates of existing components.
3. **Preserve Working Functionality:**
   Do not introduce regressions into working flows (such as authentication, catalog filtering, or status transitions).
4. **Adhere to the Established Technology Stack:**
   - Frontend: React 19, Vite, React Router v7, Tailwind CSS v4, Lucide React, Framer Motion, Axios.
   - Backend: Express 5, Mongoose 9, Node.js CommonJS.
   - Do not switch module systems (keep CommonJS in `server` and ESM in `client`).
5. **No Blind Completion Claims:**
   Never mark a feature or task as completed in documentation or reports unless you have verified it through code execution, build commands, tests, or explicit schema checks.

---

## 2. Rules for Modifying Code

### Safe Pickup Zones Rule
- The backend enforces strict validation against `SAFE_PICKUP_ZONES` in `server/config/pickupZones.js`.
- Never use free-text inputs for pickup locations in frontend forms. Always bind pickup location inputs to `<select>` elements loaded from `GET /api/items/pickup-zones`.

### State Machine Verification Rule
- When implementing handover verification, do not bypass `POST /api/requests/:id/verify-handover`.
- Handover transitions from `accepted` to `handed_over` must verify the borrower's cryptographic token or 6-digit numeric PIN.

### Component Reuse Protocol
- Check `client/src/components/` before creating UI widgets:
  - Exchange Chat: `client/src/components/MessageModal.jsx`
  - Handover QR/PIN: `client/src/components/HandoverModal.jsx`
  - Reviews: `client/src/components/ReviewModal.jsx`
  - Notifications: `client/src/components/NotificationDropdown.jsx`
  - Theme Toggle: `client/src/components/ThemeToggle.jsx`

### Environment Variables & Secrets
- Never commit secret keys, passwords, or production database credentials to repository files.
- Maintain `.env.example` templates alongside environment configurations.
- Always handle fallback values gracefully in non-production environments.

---

## 3. Verification & Testing Protocol

Before committing any feature or declaring work complete:
1. **Lint Check:** Run `npm run lint --prefix client` and ensure no new linting errors are introduced.
2. **Build Check:** Run `npm run build --prefix client` to ensure bundle compilation succeeds.
3. **Backend Syntax Check:** Validate server syntax with `node --check server/server.js` or through automated test suites.
4. **Documentation Updates:**
   - Update `PROJECT_STATUS.md` reflecting accurate status transitions.
   - Add an entry to `CHANGELOG.md` documenting what changed and why.
   - Update `README.md` and `ARCHITECTURE.md` if routes, configurations, or schemas were altered.

---

## 4. Roadmap Task Priority Guidelines

When picking tasks from the development backlog:
- **P0 (Critical / Blockers):** Fix broken functionality, runtime exceptions, or critical validation mismatches (e.g., Safe Pickup Zone select box, Handover modal wiring).
- **P1 (Essential Functionality):** Connect orphan components (`MessageModal`, `NotificationDropdown`, `ReviewModal`), missing navigation links (`/borrowed`), and image uploads.
- **P2 (Quality & Reliability):** Automated testing suites (backend Supertest, frontend Vitest), admin KPI metric cards, code optimization.
- **P3 (Enhancements):** Cloud storage integration (S3/Cloudinary), email/push notifications, WebSocket real-time messaging.
