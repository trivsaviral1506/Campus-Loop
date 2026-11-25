# CampusLoop - Smart Campus Resource Exchange

CampusLoop is a full-stack peer-to-peer resource lending and borrowing platform designed specifically for university campuses. It enables verified students and faculty to lend, borrow, and exchange academic textbooks, laboratory equipment, electronics, calculators, and sports gear safely within verified campus pickup zones.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Database Seeding & Demo Credentials](#database-seeding--demo-credentials)
- [Running the Application](#running-the-application)
- [API Reference Summary](#api-reference-summary)
- [Project Documentation](#project-documentation)
- [License](#license)

---

## Project Overview

University students frequently purchase expensive textbooks, calculators, and microcontroller kits for short-term academic coursework. CampusLoop establishes a campus-restricted circular economy where students can list unused gear, discover needed equipment, coordinate physical handovers at authorized safe zones, and build verified peer trust.

---

## Key Features

- **Campus-Restricted Authentication:** Student registration restricted to authorized institutional email domains (e.g. `.edu`), backed by bcrypt password hashing and JSON Web Tokens (JWT).
- **Resource Catalog & Filtering:** Search and filter items across categories (books, electronics, lab, sports, other) with live keyword search and availability toggling.
- **Controlled Safe Pickup Zones:** Physical handovers are restricted to verified safe campus locations (e.g., Central Library, Makerspace, Security Desk).
- **Two-Party Handover Verification:** Accepted borrow requests generate verification tokens and 6-digit numeric PINs, verified via camera QR scanning or numeric entry before custody transfer.
- **Direct Exchange Messaging:** Real-time thread-based communication between borrowers and resource owners tied directly to each borrowing request.
- **In-App Notification Center:** Automated alerts for request creation, acceptance, rejection, handover confirmation, return completion, and new chat messages.
- **Peer Reputation & Review System:** Post-return reciprocal 5-star ratings and written feedback to maintain trust and accountability.
- **Administrative Portal:** Platform-wide monitoring of user accounts, inventory, active loans, and overdue equipment tracking.
- **Adaptive UI & Theming:** Modern responsive design with light/dark theme switching, animated transitions, and glassmorphic styling.

---

## Technology Stack

### Frontend
- **Framework:** React 19 (`react` 19.2.8, `react-dom` 19.2.8)
- **Tooling & Build:** Vite 8.3.0
- **Routing:** React Router v7 (`react-router-dom` 7.18.4)
- **Styling:** Tailwind CSS v4 (`tailwindcss` 4.3.3, `@tailwindcss/postcss`)
- **Icons & UI:** Lucide React (`lucide-react` 1.47.0), Framer Motion (`framer-motion` 13.4.0)
- **QR Utilities:** `qrcode.react` (generation) & `html5-qrcode` (camera scanning)
- **HTTP Client:** Axios 1.20.0
- **Code Quality:** Oxlint 1.81.0

### Backend
- **Runtime:** Node.js (CommonJS)
- **Framework:** Express.js 5.2.1
- **Database ODM:** Mongoose 9.10.1
- **Database Engine:** MongoDB (supports local MongoDB, MongoDB Atlas, or automatic in-memory fallback via `mongodb-memory-server` 11.2.0)
- **Authentication:** JSON Web Tokens (`jsonwebtoken` 9.0.3) & `bcryptjs` 3.0.3
- **File Handling:** Multer 2.4.0 (disk storage with MIME/size limits)
- **Cross-Origin & Config:** `cors` 2.8.6, `dotenv` 18.0.1

---

## System Architecture

CampusLoop is architected as a decoupled client-server web application:

```
[ Browser / Client (React 19 + Vite) ]
                 │
                 │ HTTP / REST APIs (Axios)
                 ▼
[ Express.js 5 Application Server (Port 5000) ]
        │                 │                │
        ▼                 ▼                ▼
[ JWT Auth Middleware ] [ Multer Uploads ] [ Mongoose Models ]
                                                   │
                                                   ▼
                                       [ MongoDB / MongoMemoryServer ]
```

For full architectural diagrams and data flow specifications, see [ARCHITECTURE.md](file:///c:/Users/hp/Desktop/Campus-Loop/ARCHITECTURE.md).

---

## Repository Structure

```
Campus-Loop/
├── client/                      # Vite + React Frontend
│   ├── public/                  # Static assets and icons
│   ├── src/
│   │   ├── assets/              # Logos and static media
│   │   ├── components/          # Reusable UI & modal components
│   │   │   ├── Footer.jsx
│   │   │   ├── HandoverModal.jsx # QR camera & PIN verification
│   │   │   ├── MessageModal.jsx  # Exchange chat modal
│   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   ├── NotificationDropdown.jsx # Notification dropdown
│   │   │   ├── ReviewModal.jsx   # 5-star review modal
│   │   │   └── ThemeToggle.jsx   # Light/dark toggle
│   │   ├── context/             # Global Auth and Theme Contexts
│   │   ├── lib/                 # Utility helpers (clsx + tailwind-merge)
│   │   ├── pages/               # Application view routes
│   │   ├── App.jsx              # Routing definitions
│   │   ├── index.css            # Global CSS and Tailwind directives
│   │   └── main.jsx             # React entry point
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── server/                      # Node.js + Express Backend
│   ├── config/                  # Database and safe zone configurations
│   ├── controllers/             # Business logic and request handlers
│   ├── middleware/              # JWT auth and admin protection
│   ├── models/                  # Mongoose data schemas
│   ├── routes/                  # Express route routers
│   ├── uploads/                 # Local image upload target directory
│   ├── utils/                   # Notification dispatcher utility
│   ├── package.json
│   ├── seed.js                  # Database seeder script
│   └── server.js                # Server entry point
├── AGENTS.md                    # Coding agent protocols and rules
├── ARCHITECTURE.md              # Technical architecture documentation
├── CHANGELOG.md                 # State changelog and audit records
├── PROJECT_STATUS.md            # Detailed feature-by-feature status
└── README.md                    # Root project documentation
```

---

## Prerequisites

- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **npm:** v9.0.0 or higher
- **MongoDB:** Local MongoDB daemon (optional, as the backend automatically initializes an in-memory database if no local MongoDB instance is active)

---

## Installation and Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd Campus-Loop
```

### 2. Configure Backend Environment
Create or verify `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/campusloop
JWT_SECRET=your_jwt_secret_key_here
ALLOWED_EMAIL_DOMAIN=.edu
```
*(Note: If `MONGO_URI` is omitted or local MongoDB is stopped, the server automatically starts an in-memory database).*

### 3. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

## Database Seeding & Demo Credentials

Populate the database with pre-configured accounts, listings, active borrow requests, reviews, and test messages:

```bash
cd server
npm run seed
```

### Seed Accounts (Password for all: `password123`)
| Role | Email | Description |
| :--- | :--- | :--- |
| **Admin** | `admin@campus.edu` | Full platform administrative access |
| **Student (Owner)** | `alex@campus.edu` | Owns Arduino Starter Kit & Tennis Racket |
| **Student (Borrower)** | `priya@campus.edu` | Active accepted request (PIN: `482910`) |
| **Student (Peer)** | `liam@campus.edu` | Owns TI-84 Plus Graphing Calculator |

---

## Running the Application

### Start the Backend Server
```bash
cd server
npm run dev
# Server listening on http://localhost:5000
```

### Start the Frontend Client
In a separate terminal:
```bash
cd client
npm run dev
# Vite client serving on http://localhost:5173
```

---

## API Reference Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register student with campus email |
| `POST` | `/api/auth/login` | Public | Authenticate user & retrieve JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |
| `GET` | `/api/items` | Public | Browse and filter resource listings |
| `GET` | `/api/items/:id` | Public | Get single item details |
| `POST` | `/api/items` | Private | Create resource listing (safe zone validated) |
| `PUT` | `/api/items/:id` | Private | Update owned listing |
| `DELETE` | `/api/items/:id` | Private | Delete owned listing |
| `GET` | `/api/items/pickup-zones` | Public | List authorized safe campus zones |
| `POST` | `/api/requests` | Private | Create new borrow request |
| `GET` | `/api/requests/borrower` | Private | List current user's outgoing requests |
| `GET` | `/api/requests/owner` | Private | List current user's incoming requests |
| `PUT` | `/api/requests/:id/status` | Private | Update request state (accept, reject, return) |
| `POST` | `/api/requests/:id/verify-handover` | Private | Verify handover via QR token or 6-digit PIN |
| `DELETE` | `/api/requests/:id` | Private | Cancel pending borrow request |
| `GET` | `/api/messages/request/:requestId` | Private | Get chat messages for a request |
| `POST` | `/api/messages/request/:requestId` | Private | Send a chat message |
| `GET` | `/api/notifications` | Private | Get user notifications and unread count |
| `PUT` | `/api/notifications/:id/read` | Private | Mark notification as read |
| `PUT` | `/api/notifications/read-all` | Private | Mark all notifications as read |
| `POST` | `/api/reviews` | Private | Post review for returned loan |
| `GET` | `/api/reviews/user/:userId` | Public | Get reviews & average rating for a user |
| `POST` | `/api/upload` | Private | Upload listing image (max 5MB) |
| `GET` | `/api/admin/metrics` | Admin | Get administrative dashboard statistics |
| `GET` | `/api/admin/users` | Admin | List all registered users |
| `GET` | `/api/admin/items` | Admin | List all resource listings |
| `GET` | `/api/admin/loans` | Admin | List active and historical loans |

---

## Project Documentation

Detailed technical audits and guidelines are maintained in the following files:
- [PROJECT_STATUS.md](file:///c:/Users/hp/Desktop/Campus-Loop/PROJECT_STATUS.md) - Exact feature status, component audit, known bugs, and completion matrix.
- [ARCHITECTURE.md](file:///c:/Users/hp/Desktop/Campus-Loop/ARCHITECTURE.md) - Deep architectural diagrams, data flows, and schema relationships.
- [AGENTS.md](file:///c:/Users/hp/Desktop/Campus-Loop/AGENTS.md) - Rules of engagement and protocols for future AI coding agents.
- [CHANGELOG.md](file:///c:/Users/hp/Desktop/Campus-Loop/CHANGELOG.md) - Audit and development history log.

---

## License

ISC License.
