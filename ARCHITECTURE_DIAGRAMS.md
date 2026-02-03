# System Architecture & Flow Diagrams

## 1. Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                            │
│                                                                     │
│  ┌─────────────────────┐         ┌──────────────────┐             │
│  │  LoginPage.jsx      │         │  AuthContext.jsx │             │
│  │  • Email/Password   │───────▶ │  • Global State  │             │
│  │  • Google Sign-in   │         │  • useAuth hook  │             │
│  └─────────────────────┘         └──────────────────┘             │
│            │                                                        │
│            ▼                                                        │
│  ┌─────────────────────────────────┐                             │
│  │  firebase.js (Firebase SDK)     │                             │
│  │  • registerUser()               │                             │
│  │  • signInUser()                 │                             │
│  │  • signInWithGoogle()           │                             │
│  │  • getIdToken()                 │                             │
│  └─────────────────────────────────┘                             │
│            │                                                        │
│            │ ID Token                                             │
│            │ (JWT)                                               │
│            ▼                                                        │
│  ┌─────────────────────────────────┐                             │
│  │  Protected Routes                │                             │
│  │  • ProtectedRoute                │                             │
│  │  • AdminRoute                    │                             │
│  │  • AnalystRoute                  │                             │
│  └─────────────────────────────────┘                             │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ Authorization: Bearer {token}
                           │ Content-Type: application/json
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                              │
│                                                                     │
│  ┌────────────────────────────────────────────┐                   │
│  │  API Endpoints                             │                   │
│  │  • POST /auth/register                     │                   │
│  │  • GET /auth/me                            │                   │
│  │  • POST /admin/users/{id}/approve          │                   │
│  └────────────────────────────────────────────┘                   │
│            │                                                        │
│            ▼                                                        │
│  ┌────────────────────────────────────────────┐                   │
│  │  dependencies.py (Middleware)              │                   │
│  │  • get_current_user()                      │                   │
│  │  • get_current_admin()                     │                   │
│  │  • HTTPBearer auth extraction              │                   │
│  └────────────────────────────────────────────┘                   │
│            │                                                        │
│            ▼                                                        │
│  ┌────────────────────────────────────────────┐                   │
│  │  firebase_config.py                        │                   │
│  │  • verify_id_token()                       │                   │
│  │  • Validate with Firebase Admin SDK        │                   │
│  │  • Get user claims                         │                   │
│  └────────────────────────────────────────────┘                   │
│            │                                                        │
│            ▼                                                        │
│  ┌────────────────────────────────────────────┐                   │
│  │  Database Query                            │                   │
│  │  • Get user by firebase_uid                │                   │
│  │  • Check role & is_active                  │                   │
│  │  • Load user permissions                   │                   │
│  └────────────────────────────────────────────┘                   │
│            │                                                        │
│            ▼                                                        │
│  ┌────────────────────────────────────────────┐                   │
│  │  Execute Endpoint                          │                   │
│  │  • Process request based on role           │                   │
│  │  • Return authorized data                  │                   │
│  └────────────────────────────────────────────┘                   │
│                                                                     │
└──────────────────────────┬───────────────────────────────────────────┘
                           │ JSON Response
                           ▼
                    ┌─────────────────┐
                    │  Frontend       │
                    │  • Update State │
                    │  • Render UI    │
                    └─────────────────┘
```

---

## 2. User Registration & Approval Flow

```
REGISTRATION PHASE
──────────────────

User                         Frontend               Firebase            Backend DB
  │                            │                       │                  │
  ├─ Fill signup form ────────▶│                       │                  │
  │                            │                       │                  │
  │                            ├─ Create Firebase User │                  │
  │                            ├─────────────────────▶ │                  │
  │                            │ createUserWithEmail   │                  │
  │                            │                       │                  │
  │                            │◀─ Return uid + token ─┤                  │
  │                            │                       │                  │
  │                            ├─ Call /auth/register ─────────────────▶ │
  │                            │ POST with Firebase UID                  │
  │                            │                       │   Insert users   │
  │                            │                       │   role='pending' │
  │                            │◀─ User created with role=pending ──────│
  │                            │                       │                  │
  │◀─ "Pending Approval" ──────│                       │                  │
  │   notification            │                       │                  │


ADMIN APPROVAL PHASE
────────────────────

Admin                    Frontend              Backend             Firebase      DB
  │                       │                      │                   │            │
  ├─ Login as admin ─────▶│                      │                   │            │
  │                       │ (Verify with Firebase)                    │            │
  │                       │                      │                   │            │
  │                       │◀─────── Admin token ─────────────────────│            │
  │                       │ (role='admin')                            │            │
  │                       │                      │                   │            │
  ├─ Go to /admin ───────▶│                      │                   │            │
  │  dashboard            │ GET /admin/pending-approvals              │            │
  │                       ├─ Bearer token ──────▶│                   │            │
  │                       │                      │ SELECT * FROM     │            │
  │                       │                      │ users WHERE       │            │
  │                       │                      │ role='pending'    │            │
  │                       │                      │                   │            │
  │                       │◀─ List pending users ┤                   │            │
  │                       │                      │                   │            │
  ├─ Select user ────────▶│                      │                   │            │
  ├─ Choose role ────────▶│ POST /admin/users/   │                   │            │
  │  (user/analyst/       │      {id}/approve    │                   │            │
  │   admin)              ├─ {role: "analyst"} ▶│                   │            │
  │                       │ Bearer token         │                   │            │
  ├─ Click Approve ──────▶│                      │ UPDATE users SET  │            │
  │                       │                      │ role='analyst'    │            │
  │                       │                      │ WHERE id={id}     │            │
  │                       │                      │                   ├─ Update user record
  │                       │                      │ set_custom_claims(uid, {role: 'analyst'})
  │                       │                      ├──────────────────▶│            │
  │                       │                      │ (Sync to Firebase)│            │
  │                       │◀─ Success response ──┤                   │            │
  │                       │                      │                   │            │
  │◀─ Refresh pending list┤                      │                   │            │
  │   (user gone)         │                      │                   │            │


LOGIN & ACCESS PHASE
────────────────────

User                  Frontend              Firebase          Backend          DB
  │                    │                      │                  │              │
  ├─ Login ───────────▶│                      │                  │              │
  │                    │ signInUser(email,   │                  │              │
  │                    │            password) │                  │              │
  │                    ├─────────────────────▶│                  │              │
  │                    │                      ├─ Verify password │              │
  │                    │◀─ ID token (JWT) ───┤                  │              │
  │                    │ (contains uid + custom claims)          │              │
  │                    │                      │                  │              │
  │◀─ Redirected to ───│                      │                  │              │
  │   dashboard         │                      │                  │              │
  │                    │ All subsequent requests include token:
  │                    │ Authorization: Bearer {id_token}
  │                    │                      │                  │              │
  │ Access resource ──▶│ GET /api/reports    │                  │              │
  │                    ├──────────────────────────────────────▶│              │
  │                    │                      │ verify_id_token()              │
  │                    │                      │ (Firebase SDK)                │
  │                    │                      │                  │ Query user's role
  │                    │                      │                  ├──────────▶│
  │                    │                      │                  │◀──────────┤
  │                    │                      │                  │ role='analyst' ✓
  │                    │                      │◀─ Token valid,   │              │
  │                    │                      │   role claims ok │              │
  │                    │                      │                  │ Return analyst reports
  │                    │◀─ Authorized response ──────────────────┤              │
  │◀─ View reports ────│                      │                  │              │
```

---

## 3. Role-Based Access Control (RBAC)

```
REQUEST FLOW WITH ROLE CHECKS
──────────────────────────────

                           ┌─────────────────┐
                           │  Request Arrives │
                           │  with ID Token  │
                           └────────┬────────┘
                                    │
                                    ▼
                           ┌─────────────────────────────┐
                           │ Extract Token from Header   │
                           │ Authorization: Bearer {...} │
                           └────────┬────────────────────┘
                                    │
                                    ▼
                           ┌─────────────────────────────┐
                           │ Verify Token Signature      │
                           │ (Firebase Admin SDK)        │
                           └────────┬────────────────────┘
                                    │
                      ┌─────────────┴──────────────┐
                      │                            │
                      ▼                            ▼
              ┌──────────────────┐      ┌──────────────────┐
              │ Invalid/Expired  │      │ Valid Token      │
              │ Return 401       │      │ Extract UID      │
              └──────────────────┘      └────────┬─────────┘
                                                 │
                                                 ▼
                                    ┌────────────────────────────┐
                                    │ Query DB: users WHERE      │
                                    │ firebase_uid = extracted   │
                                    └────────┬───────────────────┘
                                             │
                              ┌──────────────┴──────────────┐
                              │                             │
                              ▼                             ▼
                    ┌─────────────────────┐     ┌───────────────────┐
                    │ User not found      │     │ User found        │
                    │ Return 404          │     │ Get user.role     │
                    └─────────────────────┘     └────────┬──────────┘
                                                        │
                                                        ▼
                                            ┌───────────────────────┐
                                            │ Check Endpoint Perms  │
                                            └────────┬──────────────┘
                                                     │
                ┌────────────┬────────────┬─────────┼──────────┬────────────┐
                │            │            │         │          │            │
                ▼            ▼            ▼         ▼          ▼            ▼
        ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐
        │ Role:      │ │ Role:    │ │ Role:    │ │ Role:    │ │ Endpoint │ │ Result │
        │ pending    │ │ user     │ │ analyst  │ │ admin    │ │ Requires │ │        │
        ├────────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├────────┤
        │ ❌ DENIED  │ │ ✓ ALLOW  │ │ ✓ ALLOW  │ │ ✓ ALLOW  │ │ any user │ │ 200    │
        │            │ │          │ │          │ │          │ │          │ │        │
        │ ❌ DENIED  │ │ ❌ DENIED│ │ ✓ ALLOW  │ │ ✓ ALLOW  │ │ analyst+ │ │ 403    │
        │            │ │          │ │          │ │          │ │          │ │        │
        │ ❌ DENIED  │ │ ❌ DENIED│ │ ❌ DENIED│ │ ✓ ALLOW  │ │ admin    │ │ 403    │
        └────────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘


PERMISSION MATRIX
─────────────────

                 │ Pending │  User  │ Analyst │ Admin
─────────────────┼─────────┼────────┼─────────┼──────
GET /auth/me     │    ❌   │   ✓    │    ✓    │  ✓
GET /transactions│    ❌   │   ✓    │    ✓    │  ✓
GET /reports     │    ❌   │   ❌   │    ✓    │  ✓
GET /admin/*     │    ❌   │   ❌   │    ❌   │  ✓
POST /auth/user* │    ❌   │   ❌   │    ❌   │  ✓
```

---

## 4. Database Schema

```
┌─────────────────────────────────────────────────────┐
│                   users TABLE                       │
├──────────────┬──────────────┬──────────┬────────────┤
│ Column       │ Type         │ Index    │ Notes      │
├──────────────┼──────────────┼──────────┼────────────┤
│ id           │ INTEGER      │ PRIMARY  │ Auto-inc   │
│              │              │ KEY      │            │
├──────────────┼──────────────┼──────────┼────────────┤
│ firebase_uid │ VARCHAR      │ UNIQUE   │ From       │
│              │              │ INDEX    │ Firebase   │
├──────────────┼──────────────┼──────────┼────────────┤
│ email        │ VARCHAR      │ UNIQUE   │ Verified   │
│              │              │ INDEX    │ by Firebase│
├──────────────┼──────────────┼──────────┼────────────┤
│ username     │ VARCHAR      │ UNIQUE   │ Optional   │
│              │              │ INDEX    │            │
├──────────────┼──────────────┼──────────┼────────────┤
│ display_name │ VARCHAR      │          │ Optional   │
├──────────────┼──────────────┼──────────┼────────────┤
│ role         │ VARCHAR      │ INDEX    │ pending,   │
│              │              │          │ user,      │
│              │              │          │ analyst,   │
│              │              │          │ admin      │
├──────────────┼──────────────┼──────────┼────────────┤
│ is_active    │ BOOLEAN      │          │ Default:   │
│              │              │          │ TRUE       │
├──────────────┼──────────────┼──────────┼────────────┤
│ created_at   │ TIMESTAMP    │          │ UTC        │
├──────────────┼──────────────┼──────────┼────────────┤
│ updated_at   │ TIMESTAMP    │          │ UTC        │
└──────────────┴──────────────┴──────────┴────────────┘
```

---

## 5. Component Communication

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
│                                                             │
│  App.js (Routes)                                           │
│     │                                                      │
│     ├─→ LoginPage ◀→ firebase.js (Auth SDK)              │
│     │                                                      │
│     ├─→ Dashboard ◀→ AuthContext (useAuth)               │
│     │       │        ├─→ get /api/auth/me                │
│     │       │        └─→ get /api/transactions           │
│     │       │                                             │
│     │       └─→ Header (Logout)                          │
│     │                                                      │
│     └─→ AdminDashboard ◀→ AuthContext (Admin check)       │
│              │                                             │
│              ├─→ get /api/admin/dashboard                │
│              ├─→ get /api/admin/pending-approvals        │
│              ├─→ post /api/admin/users/{id}/approve      │
│              └─→ get /api/admin/users                    │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ ID Token (JWT)
                       │ Authorization Header
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND LAYER (FastAPI)                   │
│                                                             │
│  main.py (Router Setup)                                    │
│     │                                                      │
│     ├─→ api/auth.py                                      │
│     │   ├─→ POST /auth/register                          │
│     │   ├─→ GET /auth/me (requires get_current_user)     │
│     │   ├─→ GET /auth/users (requires get_current_admin) │
│     │   └─→ PUT /auth/users/{id}/role                    │
│     │                                                      │
│     ├─→ api/admin.py                                     │
│     │   ├─→ GET /admin/dashboard                         │
│     │   ├─→ GET /admin/pending-approvals                 │
│     │   ├─→ POST /admin/users/{id}/approve               │
│     │   └─→ GET /admin/users                             │
│     │                                                      │
│     └─→ dependencies.py (Middleware)                      │
│         ├─→ get_current_user (verify token)              │
│         ├─→ get_current_admin (check role)               │
│         └─→ firebase_config.py                           │
│             └─→ verify_id_token() (Firebase SDK)        │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ Query/Update
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                            │
│                  (PostgreSQL)                               │
│                                                             │
│   users table                                              │
│   ├─ firebase_uid (UNIQUE INDEX)                          │
│   ├─ email (UNIQUE INDEX)                                 │
│   ├─ role (INDEX)                                         │
│   └─ ... (other columns)                                  │
│                                                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. State Management Flow

```
User Interaction
       │
       ▼
┌─────────────────────────────┐
│  React Component            │
│  (LoginPage, AdminDashboard)│
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  firebase.js Functions           │
│  • registerUser()                │
│  • signInUser()                  │
│  • signInWithGoogle()            │
│  • getCurrentUserInfo()          │
└──────────────┬───────────────────┘
               │
               ├─→ Firebase SDK
               │   └─→ Returns ID token
               │
               └─→ Backend API
                   └─→ /auth/register
                   └─→ /auth/me
                   └─→ Returns user data
                       with role
                       │
                       ▼
         ┌──────────────────────────────┐
         │  AuthContext.jsx             │
         │  • Stores user & userInfo    │
         │  • Sets isAdmin, isAnalyst   │
         │  • Triggers re-renders       │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Components using useAuth()  │
         │  • Access user state         │
         │  • Conditional rendering     │
         │  • Route protection          │
         └──────────────────────────────┘
```

---

This visualization helps understand how data flows through the system!
