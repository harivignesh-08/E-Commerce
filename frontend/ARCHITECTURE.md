# Frontend Architecture - User & Admin Portals

## System Architecture

```
                                    LANDING PAGE (/)
                                    ├─ Features Overview
                                    ├─ Demo Credentials
                                    └─ Portal Selection

                    ┌───────────────────┴───────────────────┐
                    │                                       │
            USER PORTAL (/user/)              ADMIN PORTAL (/admin/)
            ├─ Products                       ├─ Dashboard
            ├─ Cart                           ├─ Products (CRUD)
            ├─ Checkout                       ├─ Inventory (ADMIN ONLY)
            ├─ Orders                         ├─ Orders
            ├─ Profile                        ├─ Users
            └─ Notifications                  └─ Notifications
                    │                                       │
                    └───────────────┬───────────────────────┘
                                    │
                            SHARED MODULES
                            ├─ auth.js (Auth & Sessions)
                            ├─ api.js (API Client)
                            └─ styles.css (Design System)
                                    │
                    ┌───────────────┴───────────────────┐
                    │                                   │
            MICROSERVICES (Backend)        STORAGE (Client-Side)
            ├─ Product Service            ├─ localStorage
            ├─ Cart Service               │  ├─ cart items
            ├─ Order Service              │  ├─ current user
            ├─ Payment Service            │  ├─ orders
            ├─ Inventory Service          │  └─ notifications
            ├─ Notification Service       └─ sessionStorage
            └─ User Service                   └─ session data
```

---

## Data Flow - User Portal

```
┌─────────────────┐
│  User Opens     │
│  Portal         │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Load auth.js       │
│  Check Session      │
└────────┬────────────┘
         │
         ├─ Authenticated? ──NO──┐
         │                       │
        YES                      ▼
         │              ┌───────────────────┐
         ▼              │  Show Login Form   │
┌──────────────────┐    └─────────┬─────────┘
│ Load User Portal │              │
│ Display Pages    │              ▼
└────────┬─────────┘    ┌───────────────────┐
         │              │  auth.login()     │
         │              │  - Validate       │
         │              │  - Create Session │
         │              │  - Store User     │
         │              └─────────┬─────────┘
         │                        │
         ▼                        ▼
┌──────────────────────────────────────────┐
│  User Browses Products                   │
│  ├─ api.getProducts()                    │
│  ├─ Display in Grid                      │
│  └─ Apply Filters/Search                 │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Add Items to Cart                       │
│  ├─ api.addToCart(productId)             │
│  ├─ Store in localStorage                │
│  └─ Update Cart Badge                    │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  View Cart & Checkout                    │
│  ├─ Display Cart Items                   │
│  ├─ Calculate Total                      │
│  └─ Show Order Summary                   │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Enter Shipping & Payment Info           │
│  ├─ Validate Form                        │
│  ├─ api.createOrder()                    │
│  └─ Store in localStorage                │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  View Order History                      │
│  ├─ api.getOrders()                      │
│  ├─ Display Order Details                │
│  └─ Show Status & Items                  │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Manage Profile                          │
│  ├─ Load User Data                       │
│  ├─ Edit & Save Changes                  │
│  └─ auth.updateProfile()                 │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Logout                                  │
│  ├─ auth.logout()                        │
│  ├─ Clear Session                        │
│  └─ Redirect to Login                    │
└──────────────────────────────────────────┘
```

---

## Data Flow - Admin Portal

```
┌─────────────────┐
│  Admin Opens    │
│  Portal         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Load auth.js           │
│  Check Session & Role   │
└────────┬────────────────┘
         │
         ├─ Admin? ──NO──┐
         │               │
        YES               ▼
         │      ┌───────────────────┐
         ▼      │  Show Admin Login  │
┌──────────────┐└─────────┬─────────┘
│ Load Dashboard          │
│ Show Key Metrics        ▼
└────────┬─────────────────────────┐
         │         auth.login(role='admin')
         │                         
         ▼
┌──────────────────────────────────┐
│  PRODUCT MANAGEMENT              │
│  ├─ api.getProducts()            │
│  ├─ Display in Table             │
│  ├─ Add/Edit/Delete Products     │
│  ├─ api.createProduct()          │
│  ├─ api.updateProduct(id, data)  │
│  └─ api.deleteProduct(id)        │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  INVENTORY MANAGEMENT (ADMIN ONLY)│
│  ├─ api.getInventory()           │
│  ├─ Display Stock Levels         │
│  ├─ Show Low Stock Alerts        │
│  ├─ Update Stock                 │
│  └─ api.updateInventory()        │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  ORDER MANAGEMENT                │
│  ├─ api.getOrders()              │
│  ├─ Display All Orders           │
│  ├─ Filter by Status             │
│  ├─ Update Order Status          │
│  └─ api.updateOrderStatus()      │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  USER MANAGEMENT                 │
│  ├─ api.getUsers()               │
│  ├─ Display User List            │
│  ├─ Search/Filter Users          │
│  ├─ View User Details            │
│  └─ Manage User Accounts         │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  NOTIFICATION SYSTEM             │
│  ├─ Compose Message              │
│  ├─ Select Recipients            │
│  ├─ api.sendNotification()       │
│  └─ View Notification History    │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Logout                          │
│  ├─ auth.logout()                │
│  ├─ Clear Session                │
│  └─ Redirect to Login            │
└──────────────────────────────────┘
```

---

## Component Architecture

### Shared Layer
```
┌─────────────────────────────────────────┐
│           SHARED MODULES                │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  auth.js (Authentication)       │   │
│  ├─────────────────────────────────┤   │
│  │  • AuthManager class            │   │
│  │  • login(email, password, role) │   │
│  │  • logout()                     │   │
│  │  • checkAuth()                  │   │
│  │  • isAdmin()                    │   │
│  │  • hasRole(role)                │   │
│  │  • getToken()                   │   │
│  │  • updateProfile()              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  api.js (API Client)            │   │
│  ├─────────────────────────────────┤   │
│  │  • APIClient class              │   │
│  │  • Product methods              │   │
│  │  • Cart methods                 │   │
│  │  • Order methods                │   │
│  │  • Payment methods              │   │
│  │  • Inventory methods            │   │
│  │  • Notification methods         │   │
│  │  • User methods                 │   │
│  │  • Mock data generators         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  styles.css (Design System)     │   │
│  ├─────────────────────────────────┤   │
│  │  • CSS Variables (colors, etc)  │   │
│  │  • Base Styles (HTML, body)     │   │
│  │  • Layout (grid, flex)          │   │
│  │  • Components (btn, card, etc)  │   │
│  │  • Utilities (margin, padding)  │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### User Portal Layer
```
┌─────────────────────────────────────────┐
│        USER PORTAL (/user/)             │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  index.html (UI Structure)      │   │
│  ├─────────────────────────────────┤   │
│  │  • Header & Navigation          │   │
│  │  • Home Page                    │   │
│  │  • Products Page                │   │
│  │  • Cart Page                    │   │
│  │  • Checkout Page                │   │
│  │  • Orders Page                  │   │
│  │  • Profile Page                 │   │
│  │  • Footer                       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  user-styles.css (User Layout)  │   │
│  ├─────────────────────────────────┤   │
│  │  • Header styling               │   │
│  │  • Product grid                 │   │
│  │  • Cart item styling            │   │
│  │  • Form styling                 │   │
│  │  • Mobile responsive            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  user-app.js (App Logic)        │   │
│  ├─────────────────────────────────┤   │
│  │  • UserApp class                │   │
│  │  • Page Navigation              │   │
│  │  • Product Loading & Filtering  │   │
│  │  • Cart Management              │   │
│  │  • Checkout Processing          │   │
│  │  • Order Management             │   │
│  │  • Profile Updates              │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Admin Portal Layer
```
┌─────────────────────────────────────────┐
│        ADMIN PORTAL (/admin/)           │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  index.html (Admin UI)          │   │
│  ├─────────────────────────────────┤   │
│  │  • Header with Admin Name       │   │
│  │  • Sidebar Navigation           │   │
│  │  • Dashboard Page               │   │
│  │  • Products Page                │   │
│  │  • Inventory Page               │   │
│  │  • Orders Page                  │   │
│  │  • Users Page                   │   │
│  │  • Notifications Page           │   │
│  │  • Modals (forms, alerts)       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  admin-styles.css (Admin Layout)│   │
│  ├─────────────────────────────────┤   │
│  │  • Header styling               │   │
│  │  • Sidebar navigation           │   │
│  │  • Dashboard cards              │   │
│  │  • Table styling                │   │
│  │  • Form styling                 │   │
│  │  • Modal styling                │   │
│  │  • Mobile responsive            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  admin-app.js (Admin Logic)     │   │
│  ├─────────────────────────────────┤   │
│  │  • AdminApp class               │   │
│  │  • Dashboard Data Loading       │   │
│  │  • Product CRUD Operations      │   │
│  │  • Inventory Management         │   │
│  │  • Order Management             │   │
│  │  • User Management              │   │
│  │  • Notification System          │   │
│  │  • Modal Handling               │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Authentication Flow

```
USER VISITS PORTAL
        │
        ▼
CHECK auth.checkAuth()
        │
        ├─ FALSE (Not Authenticated)
        │   │
        │   ▼
        │ SHOW LOGIN FORM
        │   │
        │   ▼
        │ USER ENTERS CREDENTIALS
        │   │
        │   ▼
        │ auth.login(email, password, role)
        │   │
        │   ├─ VALIDATE CREDENTIALS
        │   │
        │   ├─ CREATE SESSION
        │   │
        │   ├─ GENERATE TOKEN
        │   │
        │   ├─ STORE IN localStorage
        │   │   (currentUser: {id, email, role, token})
        │   │
        │   ├─ CHECK ROLE
        │   │   │
        │   │   ├─ role = 'admin' ? → Admin Portal
        │   │   │
        │   │   └─ role = 'user'  ? → User Portal
        │   │
        │   └─ RENDER APPROPRIATE PORTAL
        │
        └─ TRUE (Authenticated)
            │
            ▼
        CHECK auth.isAdmin()
            │
            ├─ TRUE  → LOAD ADMIN PORTAL
            │
            └─ FALSE → LOAD USER PORTAL
```

---

## API Request Flow

```
USER ACTION (e.g., Add to Cart)
        │
        ▼
CALL api.addToCart(productId)
        │
        ▼
GET AUTH HEADERS
├─ Include JWT Token
└─ Set Content-Type: application/json
        │
        ▼
MAKE REQUEST
├─ Method: POST
├─ Endpoint: /cart/items
└─ Body: {productId, quantity}
        │
        ▼
HANDLE RESPONSE
├─ Success (200)
│   │
│   └─ Update UI
│       └─ Show Toast Notification
│
└─ Error
    ├─ Parse Error Message
    └─ Show Alert to User
```

---

## File Dependency Graph

```
index.html (Landing)
├─ shared/css/styles.css

user/index.html
├─ shared/css/styles.css
├─ user/css/user-styles.css
├─ shared/js/auth.js
├─ shared/js/api.js
└─ user/js/user-app.js
    ├─ auth (global)
    └─ api (global)

admin/index.html
├─ shared/css/styles.css
├─ admin/css/admin-styles.css
├─ shared/js/auth.js
├─ shared/js/api.js
└─ admin/js/admin-app.js
    ├─ auth (global)
    └─ api (global)
```

---

## State Management

### Client-Side Storage

```
localStorage
├─ currentUser
│   ├─ id
│   ├─ email
│   ├─ role (user|admin)
│   ├─ name
│   ├─ token
│   └─ createdAt
│
├─ cart
│   ├─ [{productId, name, price, quantity}]
│   └─ Persisted across sessions
│
├─ orders
│   ├─ [{id, items, total, status, date}]
│   └─ Persisted across sessions
│
└─ notifications
    ├─ [{id, title, message, date}]
    └─ Persisted across sessions

sessionStorage
└─ currentUser (mirrors localStorage)
   └─ Cleared on browser close
```

---

## API Service Endpoints

```
PRODUCTS
├─ GET    /products          → List all products
├─ GET    /products/{id}     → Get product details
├─ POST   /products          → Create product (admin)
├─ PUT    /products/{id}     → Update product (admin)
└─ DELETE /products/{id}     → Delete product (admin)

CART
├─ GET    /cart              → Get user's cart
├─ POST   /cart/items        → Add item to cart
├─ PUT    /cart/items/{id}   → Update item quantity
├─ DELETE /cart/items/{id}   → Remove item
└─ DELETE /cart              → Clear cart

ORDERS
├─ GET    /orders            → List orders (user: own, admin: all)
├─ GET    /orders/{id}       → Get order details
├─ POST   /orders            → Create order (checkout)
└─ PUT    /orders/{id}       → Update order status (admin)

PAYMENTS
├─ POST   /payments          → Process payment
└─ GET    /payments/history  → Payment history

INVENTORY
├─ GET    /inventory         → Get inventory levels (admin only)
├─ PUT    /inventory/{id}    → Update stock (admin only)
└─ GET    /inventory/low     → Get low stock items (admin only)

NOTIFICATIONS
├─ GET    /notifications     → Get notifications
└─ POST   /notifications     → Send notification (admin)

USERS
├─ GET    /users             → Get all users (admin only)
├─ GET    /users/{id}        → Get user details
├─ PUT    /users/{id}        → Update user
└─ DELETE /users/{id}        → Delete user (admin only)

AUTH
├─ POST   /auth/login        → User login
├─ POST   /auth/register     → User registration
└─ POST   /auth/logout       → Logout
```

---

## UI Component Hierarchy

### User Portal
```
UserApp
├─ Header (Navigation)
│  └─ Nav Links
│     ├─ Home
│     ├─ Products
│     ├─ Cart (with badge)
│     ├─ Orders
│     ├─ Profile
│     └─ Logout
│
├─ Main Content
│  ├─ Home Page
│  │  └─ Hero Section
│  │
│  ├─ Products Page
│  │  ├─ Search Box
│  │  ├─ Category Filter
│  │  └─ Product Grid
│  │     └─ Product Card (x N)
│  │        ├─ Image
│  │        ├─ Name
│  │        ├─ Price
│  │        └─ Add to Cart Button
│  │
│  ├─ Cart Page
│  │  ├─ Cart Items
│  │  │  └─ Cart Item (x N)
│  │  │     ├─ Image
│  │  │     ├─ Name
│  │  │     ├─ Quantity Control
│  │  │     └─ Remove Button
│  │  └─ Order Summary
│  │     ├─ Subtotal
│  │     ├─ Shipping
│  │     ├─ Total
│  │     └─ Checkout Button
│  │
│  ├─ Checkout Page
│  │  ├─ Shipping Form
│  │  ├─ Payment Form
│  │  └─ Order Summary
│  │
│  ├─ Orders Page
│  │  └─ Order Card (x N)
│  │     ├─ Order ID
│  │     ├─ Items List
│  │     ├─ Total
│  │     └─ Status
│  │
│  └─ Profile Page
│     ├─ Personal Info Form
│     ├─ Address Form
│     └─ Save Button
│
└─ Footer
```

### Admin Portal
```
AdminApp
├─ Header
│  └─ Admin Name
│     └─ Logout
│
├─ Sidebar (Navigation)
│  ├─ Dashboard Link
│  ├─ Products Link
│  ├─ Inventory Link (ADMIN ONLY)
│  ├─ Orders Link
│  ├─ Users Link
│  └─ Notifications Link
│
├─ Main Content
│  ├─ Dashboard
│  │  ├─ Stats Cards (4)
│  │  │  ├─ Total Products
│  │  │  ├─ Total Orders
│  │  │  ├─ Total Users
│  │  │  └─ Low Stock Items
│  │  ├─ Recent Orders Card
│  │  └─ Low Stock Alert Card
│  │
│  ├─ Products Page
│  │  ├─ Add Product Button
│  │  ├─ Search Box
│  │  └─ Products Table
│  │     ├─ ID
│  │     ├─ Name
│  │     ├─ Category
│  │     ├─ Price
│  │     ├─ Stock
│  │     └─ Actions (Edit, Delete)
│  │
│  ├─ Inventory Page
│  │  ├─ Search Box
│  │  └─ Inventory Table
│  │     ├─ Product ID
│  │     ├─ Product Name
│  │     ├─ Current Stock
│  │     ├─ Reorder Level
│  │     ├─ Supplier
│  │     ├─ Status
│  │     └─ Actions (Update)
│  │
│  ├─ Orders Page
│  │  ├─ Search Box
│  │  ├─ Status Filter
│  │  └─ Orders Table
│  │     ├─ Order ID
│  │     ├─ Customer
│  │     ├─ Items
│  │     ├─ Total
│  │     ├─ Status
│  │     ├─ Date
│  │     └─ Actions (View)
│  │
│  ├─ Users Page
│  │  ├─ Search Box
│  │  └─ Users Table
│  │     ├─ User ID
│  │     ├─ Name
│  │     ├─ Email
│  │     ├─ Role
│  │     ├─ Join Date
│  │     ├─ Status
│  │     └─ Actions (View)
│  │
│  └─ Notifications Page
│     ├─ Recent Notifications Card
│     │  └─ Notification Item (x N)
│     └─ Send Notification Form
│        ├─ Recipient Type Select
│        ├─ User Select (conditional)
│        ├─ Title Input
│        ├─ Message Textarea
│        └─ Send Button
│
├─ Modal (Product Form)
│  ├─ Name Input
│  ├─ Category Input
│  ├─ Price Input
│  ├─ Stock Input
│  ├─ Description Textarea
│  ├─ Cancel Button
│  └─ Save Button
│
└─ Footer
```

---

## Security Boundaries

```
PUBLIC ACCESS
├─ Landing Page (/)
├─ User Portal Login (/user/ - login form)
└─ Admin Portal Login (/admin/ - login form)

AUTHENTICATED USER ACCESS
├─ User Portal (/user/)
│  ├─ Products (read-only)
│  ├─ Cart (own cart only)
│  ├─ Orders (own orders only)
│  ├─ Profile (own profile only)
│  └─ Notifications (receive only)
│
└─ BLOCKED from:
   ├─ Admin Portal
   ├─ Inventory Service
   ├─ Product Management
   ├─ User Management
   └─ Other User's Data

AUTHENTICATED ADMIN ACCESS
├─ Admin Portal (/admin/)
│  ├─ Products (full CRUD)
│  ├─ Inventory (exclusive access)
│  ├─ Orders (all orders)
│  ├─ Users (management)
│  └─ Notifications (send notifications)
│
└─ BLOCKED from:
   ├─ User Portal Shopping Flow
   ├─ Placing Orders as User
   ├─ Personal Shopping Cart
   └─ Accessing User Profiles as Customers
```

---

## Performance Optimization Strategy

```
INITIAL LOAD
├─ HTML Page (< 100KB)
├─ CSS Files (< 50KB)
├─ JS Files (< 100KB)
└─ Total: < 250KB

RUNTIME OPTIMIZATION
├─ Lazy Load Images
├─ Cache API Responses
├─ Minimize DOM Manipulation
└─ Efficient Event Delegation

CACHING STRATEGY
├─ Browser Cache
│  ├─ Static Assets (CSS/JS)
│  └─ Long-lived Cache Headers
│
├─ LocalStorage Cache
│  ├─ Cart Items
│  ├─ Orders
│  └─ Notifications
│
└─ Session Cache
   └─ Current User Data

NETWORK OPTIMIZATION
├─ Combined CSS Files
├─ Single JS Bundle
├─ Gzip Compression
└─ CDN Delivery (if available)
```

---

## Deployment Architecture

```
DEVELOPMENT
├─ Local Machine
├─ python -m http.server 8000
└─ localhost:8000

STAGING
├─ Testing Server
├─ Full Backend Integration
└─ Load Testing

PRODUCTION
├─ CDN (Static Assets)
├─ Web Server (HTML/CSS/JS)
├─ API Gateway (Backend)
└─ Database Servers (Data)

CI/CD PIPELINE
├─ Code Push
├─ Tests Run
├─ Build Frontend
├─ Deploy to Staging
├─ Integration Tests
└─ Deploy to Production
```

---

**Architecture is designed for:**
- ✅ Clear separation of concerns
- ✅ Easy backend integration
- ✅ Scalable microservices
- ✅ Role-based access control
- ✅ Responsive design
- ✅ Optimal performance
