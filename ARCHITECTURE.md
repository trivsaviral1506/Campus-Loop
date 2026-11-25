# CampusLoop System Architecture

This document details the software architecture, runtime topology, data flow patterns, and database models of the **CampusLoop** platform.

---

## 1. High-Level Architectural Topology

CampusLoop follows a decoupled Client-Server architecture with a single-page application (SPA) frontend communicating over RESTful HTTP APIs with a Node.js/Express backend, which interfaces with a MongoDB document database.

```mermaid
flowchart TD
    subgraph Client ["Client Tier (Browser)"]
        UI["React 19 SPA (Vite)"]
        AuthCtx["AuthContext (JWT in localStorage)"]
        ThemeCtx["ThemeContext (Dark/Light Mode)"]
        AxiosClient["Axios HTTP Client (Bearer Auth Header)"]
        UI --> AuthCtx
        UI --> ThemeCtx
        UI --> AxiosClient
    end

    subgraph Server ["Server Tier (Node.js / Express 5)"]
        Router["Express Router (server.js)"]
        AuthMW["Auth Middleware (protect / admin)"]
        UploadMW["Multer Middleware (POST /api/upload)"]
        Controllers["Controllers (auth, item, request, message, notification, review, admin)"]
        Notifier["Notification Helper Utility"]
        
        Router --> AuthMW
        Router --> UploadMW
        AuthMW --> Controllers
        UploadMW --> Controllers
        Controllers --> Notifier
    end

    subgraph Data ["Data & Storage Tier"]
        MongooseODM["Mongoose Models"]
        MongoDB[(MongoDB / MongoMemoryServer)]
        UploadStorage[("Local File System (/uploads)")]
        
        Controllers --> MongooseODM
        MongooseODM --> MongoDB
        Controllers --> UploadStorage
    end

    AxiosClient -->|"HTTP / JSON (/api/*)"| Router
```

---

## 2. Directory Structure & Module Breakdown

```
Campus-Loop/
├── client/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components/
│   │   │   ├── Footer.jsx             # Global responsive footer
│   │   │   ├── HandoverModal.jsx      # QR code camera scanner & PIN verification
│   │   │   ├── MessageModal.jsx       # Polling exchange chat dialog
│   │   │   ├── Navbar.jsx             # Floating glassmorphic navigation header
│   │   │   ├── NotificationDropdown.jsx # Real-time notification menu
│   │   │   ├── ReviewModal.jsx        # 5-star rating submission modal
│   │   │   └── ThemeToggle.jsx        # Light/Dark animated toggle switch
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # User session state & Axios bearer defaults
│   │   │   └── ThemeContext.jsx       # Theme state manager
│   │   ├── lib/
│   │   │   └── utils.js               # clsx and tailwind-merge helper (cn)
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx     # Roster and loan telemetry for administrators
│   │   │   ├── BorrowerDashboard.jsx  # Outgoing requests & handover QR code view
│   │   │   ├── CreateListing.jsx      # New resource publication form
│   │   │   ├── Dashboard.jsx          # Live search and category discovery catalog
│   │   │   ├── EditListing.jsx        # Item updating form
│   │   │   ├── ItemDetails.jsx        # Resource specification & booking trigger
│   │   │   ├── Landing.jsx            # Public marketing and value proposition page
│   │   │   ├── Login.jsx              # Student authentication page
│   │   │   ├── OwnerDashboard.jsx     # Owned listings & incoming request management
│   │   │   ├── Profile.jsx            # Student credential and account details
│   │   │   └── Register.jsx           # Student onboarding with institutional email
│   │   ├── App.css
│   │   ├── App.jsx                    # React Router configuration & route guards
│   │   ├── index.css                  # Tailwind styles and custom design system tokens
│   │   └── main.jsx                   # React root hydration
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json                    # SPA routing rewrite rule
│   └── vite.config.js
├── server/
│   ├── config/
│   │   ├── db.js                      # Mongoose connection & MongoMemoryServer fallback
│   │   └── pickupZones.js             # List of approved campus physical meeting zones
│   ├── controllers/
│   │   ├── adminController.js         # System metrics & administrative queries
│   │   ├── authController.js          # Authentication, domain check & JWT issuance
│   │   ├── itemController.js          # Resource listing CRUD and catalog filtering
│   │   ├── messageController.js       # Transactional peer messaging
│   │   ├── notificationController.js  # User notifications queries and read state
│   │   ├── requestController.js       # Borrowing state machine & handover checks
│   │   └── reviewController.js        # Post-return ratings and user reputation
│   ├── middleware/
│   │   └── auth.js                    # JWT token extraction and role verification
│   ├── models/
│   │   ├── BorrowRequest.js           # Reservation, status transitions, QR/PIN tokens
│   │   ├── Item.js                    # Resource specifications & safe zone validation
│   │   ├── Message.js                 # Scoped chat message schema
│   │   ├── Notification.js            # User event notification schema
│   │   ├── Review.js                  # 5-star ratings with duplicate prevention index
│   │   └── User.js                    # Student accounts with bcrypt hashing
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── uploadRoutes.js
│   ├── utils/
│   │   └── notificationHelper.js      # Internal notification dispatcher
│   ├── package.json
│   ├── seed.js                        # Demo seeder script
│   └── server.js                      # Express application setup and route mounts
```

---

## 3. Core Request Flows

### 3.1 Authentication & Protected API Requests
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Browser as React App (AuthContext)
    participant Server as Express Server
    participant DB as MongoDB

    Student->>Browser: Enters email (@college.edu) & password
    Browser->>Server: POST /api/auth/login
    Server->>DB: User.findOne({ email })
    DB-->>Server: User record (with bcrypt hash)
    Server->>Server: bcrypt.compare(password, hash)
    Server-->>Browser: { _id, name, email, role, token }
    Browser->>Browser: localStorage.setItem('token', token)
    Browser->>Browser: axios.defaults.headers.common['Authorization'] = Bearer <token>
    
    Student->>Browser: Navigates to Protected Route (e.g. /dashboard)
    Browser->>Server: GET /api/auth/me (Bearer <token>)
    Server->>Server: jwt.verify(token, JWT_SECRET)
    Server->>DB: User.findById(decoded.id)
    DB-->>Server: User details
    Server-->>Browser: 200 OK (User Profile)
```

---

### 3.2 Borrow Request Lifecycle & Safe Handover Verification
```mermaid
stateDiagram-v2
    [*] --> pending: Borrower Submits Request (POST /api/requests)
    
    pending --> rejected: Owner Rejects (PUT /api/requests/:id/status)
    pending --> cancelled: Borrower Cancels (DELETE /api/requests/:id)
    pending --> accepted: Owner Accepts (Generates token & 6-digit PIN)
    
    accepted --> handed_over: Handover Verified via QR Token or 6-digit PIN (POST /verify-handover)
    accepted --> cancelled: Owner or Borrower aborts
    
    handed_over --> returned: Owner confirms physical return (PUT /api/requests/:id/status)
    
    returned --> [*]: Post-return reciprocal reviews unlocked (POST /api/reviews)
```

---

### 3.3 Safe Pickup Zone Integrity Validation
Physical campus safety is enforced in both application logic and database schema:
1. When creating an item listing (`POST /api/items`), the user must select an authorized location from `SAFE_PICKUP_ZONES`.
2. The `Item.js` Mongoose schema executes a custom schema validator:
   ```javascript
   validate: {
     validator: function(v) {
       return SAFE_PICKUP_ZONES.includes(v);
     },
     message: props => `${props.value} is not an authorized Safe Pickup Zone.`
   }
   ```
3. Current authorized zones include:
   - *Central Library Front Desk*
   - *Student Union Safe Zone*
   - *Makerspace West Wing*
   - *Main Campus Gate Security Desk*
   - *Campus Cafeteria Entrance*
   - *Computer Science Dept Office*
   - *Engineering Hall Floor 2*
   - *Sports Complex Reception*

---

## 4. Database Schema Relationships

```mermaid
erDiagram
    User ||--o{ Item : "owns"
    User ||--o{ BorrowRequest : "borrows"
    User ||--o{ BorrowRequest : "lends"
    User ||--o{ Message : "sends / receives"
    User ||--o{ Notification : "receives"
    User ||--o{ Review : "writes / receives"
    
    Item ||--o{ BorrowRequest : "reserved by"
    Item ||--o{ Review : "evaluated in"
    
    BorrowRequest ||--o{ Message : "contains"
    BorrowRequest ||--o{ Review : "generates"

    User {
        ObjectId _id PK
        string name
        string email UK
        string password
        string college
        string department
        string year
        string role "student | admin"
        Date createdAt
    }

    Item {
        ObjectId _id PK
        ObjectId owner FK
        string name
        string description
        string category "books | electronics | lab | sports | other"
        string condition "new | good | fair"
        boolean isAvailable
        number deposit
        string imageUrl
        string pickupLocation
        Date createdAt
    }

    BorrowRequest {
        ObjectId _id PK
        ObjectId borrower FK
        ObjectId owner FK
        ObjectId item FK
        Date startDate
        Date endDate
        string status "pending | accepted | rejected | cancelled | handed_over | returned"
        string handoverToken
        string handoverPin
        Date handoverVerifiedAt
        Date returnedAt
        Date createdAt
    }

    Message {
        ObjectId _id PK
        ObjectId request FK
        ObjectId sender FK
        ObjectId recipient FK
        string content
        Date createdAt
    }

    Notification {
        ObjectId _id PK
        ObjectId user FK
        ObjectId sender FK
        string type
        string title
        string message
        string link
        boolean isRead
        Date createdAt
    }

    Review {
        ObjectId _id PK
        ObjectId request FK
        ObjectId item FK
        ObjectId reviewer FK
        ObjectId reviewee FK
        string targetType "borrower_to_owner | owner_to_borrower"
        number rating "1 to 5"
        string comment
        Date createdAt
    }
```

---

## 5. Security & Threat Modeling Considerations

1. **Authentication:**
   - Passwords salted with bcrypt (10 rounds).
   - JWT payload contains only non-sensitive identifiers (`id` and `role`).
   - Tokens verified per request in the Authorization header.
2. **Access Control (Authorization):**
   - Resource updates and deletions verify `item.owner.toString() === req.user.id` or `req.user.role === 'admin'`.
   - Message reading and sending verify that the requesting user is either the borrower, the owner, or an administrator.
   - Handover verification requires the resource owner's private credentials.
3. **Data Integrity & Double-Booking Prevention:**
   - Overlap queries check existing reservations for the requested item between `startDate` and `endDate` where status is `accepted` or `handed_over`.
   - Compound index on `Review` (`{ request: 1, reviewer: 1 }`) ensures a participant cannot submit duplicate reviews for the same transaction.
