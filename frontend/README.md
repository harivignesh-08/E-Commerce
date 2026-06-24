# E-Commerce Frontend

A comprehensive vanilla HTML/CSS/JavaScript frontend for a microservices-based E-Commerce platform.

## 📁 Project Structure

```
frontend/
├── index.html                 # Main customer portal
├── css/
│   └── styles.css            # Main stylesheet
├── js/
│   ├── api.js                # API service layer
│   └── app.js                # Application logic
├── services/                 # Individual service UIs
│   ├── product-service.html
│   ├── cart-service.html
│   ├── order-service.html
│   ├── payment-service.html
│   ├── inventory-service.html
│   ├── notification-service.html
│   ├── user-service.html
│   └── css/
│       └── service-styles.css
└── README.md
```

## 🎯 Features

### Customer Portal (`index.html`)
- **Home Page**: Landing page with features overview
- **Products Page**: Browse products with search and filtering
- **Shopping Cart**: Add/remove items, update quantities
- **Checkout**: Process orders with payment information
- **Order Tracking**: View order history and status
- **User Profile**: Manage account information
- **Admin Dashboard**: Manage products, inventory, orders, and users

### Service-Specific UIs

#### 1. **Product Service** (`product-service.html`)
- Product catalog management
- Add, edit, delete products
- Category management
- Product statistics

#### 2. **Cart Service** (`cart-service.html`)
- Active shopping carts monitoring
- Cart item details
- Cart value tracking
- Clear/delete carts

#### 3. **Order Service** (`order-service.html`)
- Order management and tracking
- Order status updates
- Order timeline view
- Revenue tracking

#### 4. **Payment Service** (`payment-service.html`)
- Transaction processing
- Payment status monitoring
- Refund management
- Transaction history

#### 5. **Inventory Service** (`inventory-service.html`)
- Stock level monitoring
- Low stock alerts
- Stock adjustments
- Inventory reports

#### 6. **Notification Service** (`notification-service.html`)
- Notification management
- Email, SMS, and push notifications
- Notification templates
- Send notifications to users

#### 7. **User Service** (`user-service.html`)
- User account management
- Role-based access control
- User status tracking
- User statistics

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required

### Installation

1. **Clone or download the frontend folder**
   ```bash
   cd frontend
   ```

2. **Start a local server** (recommended for development)
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js (with http-server)
   npx http-server
   ```

3. **Open in browser**
   - Navigate to `http://localhost:8000`
   - Main portal: `http://localhost:8000`
   - Services: `http://localhost:8000/services/{service-name}.html`

## 📖 Usage

### Customer Portal

#### Browse Products
1. Click "Products" in navigation
2. Search products using the search box
3. Filter by category
4. Click "Add to Cart" to add items

#### Shopping Cart
1. Click "Cart" to view items
2. Adjust quantities using +/- buttons
3. Click "Proceed to Checkout" when ready

#### Checkout
1. Fill in shipping address
2. Enter payment information
3. Click "Complete Order"

#### Track Orders
1. Click "My Orders" in navigation
2. View order history and status

#### Manage Profile
1. Click "Profile" in navigation
2. Update personal information
3. Update address details
4. Click "Update Profile" to save

### Admin Dashboard

Access the admin section by clicking "Admin" in the navigation (requires admin role).

#### Manage Products
1. Go to "Products" tab
2. Click "Add Product" to create new items
3. Edit existing products
4. Delete products as needed

#### Inventory Management
1. Go to "Inventory" tab
2. Monitor stock levels
3. Update inventory quantities

#### Manage Orders
1. Go to "Orders" tab
2. View all orders
3. Update order status

#### Manage Users
1. Go to "Users" tab
2. Add new users
3. Edit user roles and permissions
4. Delete users

### Service UIs

Each service has its own dedicated UI:

- **Product Service**: Manage product catalog
- **Cart Service**: Monitor active shopping carts
- **Order Service**: Manage and track orders
- **Payment Service**: Process and monitor transactions
- **Inventory Service**: Track and manage stock levels
- **Notification Service**: Send notifications to users
- **User Service**: Manage user accounts and roles

Navigate to each service using the links in the services folder.

## 🔌 API Integration

The frontend uses the `APIService` class defined in `js/api.js` to communicate with backend services.

### Current Implementation
- **Mock Data**: Currently uses mock data for demonstration
- **Local Storage**: Uses browser localStorage for cart persistence

### Connecting to Real Backend

To connect to actual backend services, update the `API_BASE_URL` in `js/api.js`:

```javascript
const API_BASE_URL = 'http://your-api-gateway-url/api';
```

Then implement actual API calls in the `APIService` class methods:

```javascript
async getProducts(filters = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}
```

## 🎨 Styling

### Design System
- **Colors**: 
  - Primary: `#2563eb` (Blue)
  - Danger: `#dc2626` (Red)
  - Success: `#16a34a` (Green)
  - Warning: `#ea580c` (Orange)

- **Typography**:
  - Font Family: System fonts (Segoe UI, Roboto, etc.)
  - Font Sizes: 14px (body) to 48px (headings)

- **Layout**: Flexbox and CSS Grid
- **Responsive**: Mobile-first design with breakpoints at 768px and 480px

### CSS Variables
All colors and common values are defined as CSS variables for easy customization:

```css
:root {
    --primary-color: #2563eb;
    --danger-color: #dc2626;
    --success-color: #16a34a;
    --text-primary: #111827;
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    /* ... more variables */
}
```

## 🔒 Authentication

Currently, the frontend uses mock authentication. To implement real authentication:

1. Update the `login()` method in `api.js`
2. Store JWT token in localStorage
3. Include token in API request headers
4. Implement logout functionality

Example:
```javascript
async login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const { token, user } = await response.json();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { user, token };
    } catch (error) {
        throw error;
    }
}
```

## 📊 State Management

The application uses a simple state object for managing application data:

```javascript
const state = {
    currentPage: 'home',
    user: null,
    cart: [],
    products: [],
    orders: [],
    filters: {
        search: '',
        category: ''
    }
};
```

## 🐛 Debugging

The application includes debug logging using `console.log('[v0] ...')` statements. These help track:
- Navigation events
- API calls and responses
- State changes
- User interactions

View the browser console (F12) to see debug logs.

## 📱 Responsive Design

The frontend is fully responsive:
- **Desktop**: Full layout with all features
- **Tablet** (768px): Adjusted layouts and font sizes
- **Mobile** (480px): Optimized for small screens

## 🔄 Service Communication Flow

```
User Portal
    ↓
Customer Pages ←→ API Service ←→ Backend Services
    ↓
Admin Dashboard
    ↓
Service UIs (Product, Cart, Order, etc.)
```

## 🧪 Testing

To test the frontend:

1. **Manual Testing**:
   - Test all pages and navigation
   - Add/remove items from cart
   - Complete checkout process
   - View orders and profile

2. **Browser Compatibility**:
   - Test in Chrome, Firefox, Safari, Edge
   - Test responsive design using DevTools

3. **API Testing**:
   - Replace mock data with real API endpoints
   - Test error handling
   - Monitor network requests

## 📝 Best Practices

1. **Code Organization**: Pages, APIs, and styling are separated
2. **Reusability**: Common components and utilities
3. **Error Handling**: Try-catch blocks and user notifications
4. **Performance**: Minimal dependencies, efficient DOM manipulation
5. **Accessibility**: Semantic HTML, ARIA labels where needed

## 🚀 Deployment

### Deploy to Vercel
```bash
vercel deploy
```

### Deploy to GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Site will be available at `https://username.github.io/repo-name`

### Deploy to Other Platforms
The frontend requires only static file hosting and can be deployed to:
- AWS S3 + CloudFront
- Azure Static Web Apps
- Netlify
- Firebase Hosting
- Any web server

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Review the API service implementation
3. Verify backend services are running
4. Check network requests in DevTools

## 📄 License

This project is part of the E-Commerce microservices platform.

## 🎓 Learn More

- [HTML & CSS](https://developer.mozilla.org/en-US/docs/Web/Guide)
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [REST APIs](https://restfulapi.net/)
- [Web Performance](https://web.dev/performance/)

---

**Version**: 1.0.0  
**Last Updated**: June 2024
