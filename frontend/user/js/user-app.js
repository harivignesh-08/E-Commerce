/**
 * User Portal Application
 * Handles all user-facing functionality
 */

class UserApp {
  constructor() {
    this.currentPage = 'home';
    this.cart = [];
    this.user = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadUser();
    this.redirectIfNotAuthenticated();
    this.checkProfileCompletion();
  }

  setupEventListeners() {
    // Page navigation
    document.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        this.showPage(page);
      });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
      this.logout();
    });

    // Product search and filter
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.loadProducts());
    }
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this.loadProducts());
    }

    // Checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => this.handleCheckout(e));
    }

    // Profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    }

    // Load data when pages are shown
    window.addEventListener('load', () => this.loadInitialData());
  }

  redirectIfNotAuthenticated() {
    if (!auth.checkAuth()) {
      this.showLoginPage();
    }
  }

  checkProfileCompletion() {
    if (!auth.checkAuth()) return;

    if (!auth.isProfileComplete()) {
      this.showCompleteProfilePage();
    } else {
      this.loadCart();
      this.loadInitialData();
    }
  }

  showCompleteProfilePage() {
    // Hide main content and show profile setup modal
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    if (document.getElementById('profile-complete-modal')) return;

    const profileHtml = `
      <div id="profile-complete-modal" class="modal active" style="z-index: 2000;">
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h2>Complete Your Profile</h2>
            <p style="color: var(--text-light); margin: var(--spacing-sm) 0 0 0;">Please provide your details to continue shopping</p>
          </div>
          <form id="profile-complete-form" class="modal-body" style="padding: var(--spacing-lg);">
            <div class="form-row">
              <div class="form-group">
                <label for="complete-name">Full Name *</label>
                <input type="text" id="complete-name" name="name" required class="form-input">
              </div>
              <div class="form-group">
                <label for="complete-phone">Phone *</label>
                <input type="tel" id="complete-phone" name="phone" required class="form-input">
              </div>
            </div>
            <div class="form-group">
              <label for="complete-address">Address *</label>
              <input type="text" id="complete-address" name="address" required class="form-input">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="complete-city">City *</label>
                <input type="text" id="complete-city" name="city" required class="form-input">
              </div>
              <div class="form-group">
                <label for="complete-state">State *</label>
                <input type="text" id="complete-state" name="state" required class="form-input">
              </div>
              <div class="form-group">
                <label for="complete-zip">ZIP Code *</label>
                <input type="text" id="complete-zip" name="zip" required class="form-input">
              </div>
            </div>
            <div class="modal-footer" style="padding: var(--spacing-lg) 0 0 0; border-top: 1px solid var(--border-color); gap: var(--spacing-md);">
              <button type="submit" class="btn btn-primary btn-block">Complete Profile & Continue</button>
              <button type="button" class="btn btn-secondary btn-block" onclick="userApp.logout()">Logout</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', profileHtml);

    document.getElementById('profile-complete-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const updates = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip: formData.get('zip')
      };

      try {
        await auth.updateProfile(updates);
        this.user = auth.getCurrentUser();
        document.getElementById('profile-complete-modal').remove();
        this.loadCart();
        this.loadInitialData();
        this.showPage('home');
        this.showNotification('Profile completed successfully!');
      } catch (error) {
        alert('Error completing profile: ' + error.message);
      }
    });
  }

  showLoginPage() {
    // Create a simple login page overlay
    if (document.getElementById('login-modal')) return;

    const loginHtml = `
      <div id="login-modal" class="modal active" style="z-index: 2000;">
        <div class="modal-content" style="max-width: 400px;">
          <div class="modal-header">
            <h2>Login</h2>
          </div>
          <form id="login-form" class="modal-body">
            <div class="form-group">
              <label>Email</label>
              <input type="email" name="email" value="user@example.com" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" name="password" value="password" required>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-primary btn-block">Login</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', loginHtml);

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;

      try {
        await auth.login(email, password, 'user');
        document.getElementById('login-modal').remove();
        this.loadUser();
        this.loadInitialData();
      } catch (error) {
        alert('Login failed: ' + error.message);
      }
    });
  }

  async loadUser() {
    this.user = auth.getCurrentUser();
    if (this.user) {
      console.log('[v0] User loaded:', this.user.email);
    }
  }

  showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    // Show selected page
    const page = document.getElementById(pageName);
    if (page) {
      page.classList.add('active');
      this.currentPage = pageName;

      // Update nav links
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
          link.classList.add('active');
        }
      });

      // Load page-specific data
      if (pageName === 'products') {
        this.loadProducts();
      } else if (pageName === 'orders') {
        this.loadOrders();
      } else if (pageName === 'profile') {
        this.loadProfile();
      } else if (pageName === 'checkout') {
        this.loadCheckoutData();
      } else if (pageName === 'cart') {
        this.renderCart();
      }

      // Scroll to top
      window.scrollTo(0, 0);
    }
  }

  async loadProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading">Loading products...</div>';

    try {
      const response = await api.getProducts();
      const products = response.data || [];

      // Apply filters
      const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
      const category = document.getElementById('category-filter')?.value || '';

      let filtered = products.filter(p => {
        const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm);
        const matchCategory = !category || p.category.toLowerCase() === category.toLowerCase();
        return matchSearch && matchCategory;
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><h3>No products found</h3></div>';
        return;
      }

      grid.innerHTML = filtered.map(product => `
        <div class="product-card">
          <img src="${product.image}" alt="${product.name}" class="product-image">
          <div class="product-body">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-category">${product.category}</p>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
              <div class="product-price">$${product.price.toFixed(2)}</div>
              <button class="btn btn-primary btn-sm" onclick="userApp.addToCart(${product.id}, ${product.price}, '${product.name}')">Add to Cart</button>
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      grid.innerHTML = '<div class="alert alert-danger">Error loading products</div>';
      console.error('[v0] Error loading products:', error);
    }
  }

  async addToCart(productId, price, name) {
    try {
      await api.addToCart(productId);
      this.loadCart();
      this.showNotification(`${name} added to cart!`);
    } catch (error) {
      alert('Error adding to cart: ' + error.message);
    }
  }

  loadCart() {
    api.getCart().then(response => {
      this.cart = response.items || [];
      this.updateCartBadge();
      if (this.currentPage === 'cart') {
        this.renderCart();
      }
    });
  }

  updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
      badge.textContent = this.cart.length;
    }
  }

  renderCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Your cart is empty</h3>
          <p>Start shopping to add items to your cart</p>
          <button class="btn btn-primary" data-page="products">Continue Shopping</button>
        </div>
      `;
      this.updateSummary(0, 10);
      return;
    }

    let subtotal = 0;
    container.innerHTML = this.cart.map(item => {
      const total = item.price * item.quantity;
      subtotal += total;
      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name}</h4>
            <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            <div class="cart-item-controls">
              <input type="number" min="1" value="${item.quantity}" class="quantity-input" onchange="userApp.updateQuantity(${item.productId}, this.value)">
              <span class="cart-item-remove" onclick="userApp.removeFromCart(${item.productId})">Remove</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.updateSummary(subtotal, 10);
  }

  updateSummary(subtotal, shipping = 10) {
    const total = subtotal + shipping;
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (shippingEl) shippingEl.textContent = '$' + shipping.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
  }

  async updateQuantity(productId, quantity) {
    try {
      await api.updateCartItem(productId, parseInt(quantity));
      this.loadCart();
    } catch (error) {
      alert('Error updating cart: ' + error.message);
    }
  }

  async removeFromCart(productId) {
    try {
      await api.removeFromCart(productId);
      this.loadCart();
      this.showNotification('Item removed from cart');
    } catch (error) {
      alert('Error removing from cart: ' + error.message);
    }
  }

  loadCheckoutData() {
    const itemsContainer = document.getElementById('checkout-items');
    if (!itemsContainer) return;

    if (this.cart.length === 0) {
      this.showPage('cart');
      return;
    }

    let subtotal = 0;
    itemsContainer.innerHTML = this.cart.map(item => {
      const total = item.price * item.quantity;
      subtotal += total;
      return `
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--border-color); padding-bottom: var(--spacing-md);">
          <span>${item.name} x ${item.quantity}</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      `;
    }).join('');

    const shipping = 10;
    const total = subtotal + shipping;

    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');
    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
  }

  async handleCheckout(e) {
    e.preventDefault();

    if (this.cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      const formData = new FormData(e.target);
      const order = {
        shippingAddress: {
          fullName: formData.get('fullName'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          address: formData.get('address'),
          city: formData.get('city'),
          state: formData.get('state'),
          zip: formData.get('zip')
        },
        paymentInfo: {
          cardNumber: formData.get('cardNumber'),
          expiry: formData.get('expiry'),
          cvc: formData.get('cvc')
        }
      };

      const result = await api.createOrder(order);
      this.cart = [];
      this.updateCartBadge();

      this.showNotification('Order placed successfully!');
      alert(`Order ${result.id} placed successfully!`);

      setTimeout(() => {
        this.showPage('home');
      }, 1500);
    } catch (error) {
      alert('Error placing order: ' + error.message);
    }
  }

  async loadOrders() {
    const container = document.getElementById('orders-list');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading orders...</div>';

    try {
      const response = await api.getOrders();
      const orders = response.data || [];

      if (orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No orders yet</h3></div>';
        return;
      }

      container.innerHTML = orders.map(order => `
        <div class="order-card">
          <div class="order-header">
            <div>
              <span class="order-id">${order.id}</span>
              <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <span class="order-status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
          </div>
          <div class="order-body">
            <div class="order-items">
              ${order.items.map(item => `
                <div class="order-item">
                  <span>${item.name} x ${item.quantity}</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            <div class="order-total">
              <span>Total:</span>
              <span>$${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      container.innerHTML = '<div class="alert alert-danger">Error loading orders</div>';
      console.error('[v0] Error loading orders:', error);
    }
  }

  async loadProfile() {
    if (!this.user) return;

    document.getElementById('profile-name').value = this.user.name || '';
    document.getElementById('profile-email').value = this.user.email || '';
    document.getElementById('profile-phone').value = this.user.phone || '';
    document.getElementById('profile-address').value = this.user.address || '';
    document.getElementById('profile-city').value = this.user.city || '';
    document.getElementById('profile-state').value = this.user.state || '';
    document.getElementById('profile-zip').value = this.user.zip || '';
  }

  async handleProfileUpdate(e) {
    e.preventDefault();

    try {
      const updates = {
        name: document.getElementById('profile-name').value,
        email: document.getElementById('profile-email').value,
        phone: document.getElementById('profile-phone').value,
        address: document.getElementById('profile-address').value,
        city: document.getElementById('profile-city').value,
        state: document.getElementById('profile-state').value,
        zip: document.getElementById('profile-zip').value
      };

      await auth.updateProfile(updates);
      this.user = auth.getCurrentUser();
      this.showNotification('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
  }

  loadInitialData() {
    this.loadProducts();
    this.loadCart();
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '100px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  logout() {
    auth.logout();
    alert('Logged out successfully');
    window.location.reload();
  }
}

// Initialize app
let userApp;
document.addEventListener('DOMContentLoaded', () => {
  userApp = new UserApp();
});
