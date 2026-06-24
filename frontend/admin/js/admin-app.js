/**
 * Admin Portal Application
 * Handles all admin-facing functionality
 */

class AdminApp {
  constructor() {
    this.currentPage = 'dashboard';
    this.user = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadUser();
    this.redirectIfNotAdmin();
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

    // Product modal
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => this.openProductModal());
    }

    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
      closeModal.addEventListener('click', () => this.closeProductModal());
    }

    const productForm = document.getElementById('product-form');
    if (productForm) {
      productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
    }

    // Search and filters
    const productSearch = document.getElementById('products-search');
    if (productSearch) {
      productSearch.addEventListener('input', () => this.loadProducts());
    }

    const inventorySearch = document.getElementById('inventory-search');
    if (inventorySearch) {
      inventorySearch.addEventListener('input', () => this.loadInventory());
    }

    const ordersSearch = document.getElementById('orders-search');
    if (ordersSearch) {
      ordersSearch.addEventListener('input', () => this.loadOrders());
    }

    const ordersFilter = document.getElementById('orders-filter');
    if (ordersFilter) {
      ordersFilter.addEventListener('change', () => this.loadOrders());
    }

    const usersSearch = document.getElementById('users-search');
    if (usersSearch) {
      usersSearch.addEventListener('input', () => this.loadUsers());
    }

    // Notification form
    const notificationForm = document.getElementById('notification-form');
    if (notificationForm) {
      notificationForm.addEventListener('submit', (e) => this.handleNotificationSubmit(e));

      const recipientType = notificationForm.querySelector('select[name="recipientType"]');
      if (recipientType) {
        recipientType.addEventListener('change', () => this.toggleUserSelect());
      }
    }

    // Send notification button
    const sendNotificationBtn = document.getElementById('send-notification-btn');
    if (sendNotificationBtn) {
      sendNotificationBtn.addEventListener('click', () => {
        // Scroll to notification form
        document.getElementById('notification-form').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Modal close button
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeProductModal());
    });

    // Load initial data
    window.addEventListener('load', () => this.loadDashboardData());
  }

  redirectIfNotAdmin() {
    if (!auth.checkAuth() || !auth.isAdmin()) {
      this.showLoginPage();
    }
  }

  checkProfileCompletion() {
    if (!auth.checkAuth() || !auth.isAdmin()) return;

    if (!auth.isProfileComplete()) {
      this.showCompleteProfilePage();
    } else {
      this.loadDashboardData();
    }
  }

  showCompleteProfilePage() {
    // Hide main content and show profile setup modal
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    if (document.getElementById('admin-profile-complete-modal')) return;

    const profileHtml = `
      <div id="admin-profile-complete-modal" class="modal active" style="z-index: 2000;">
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h2>Complete Your Admin Profile</h2>
            <p style="color: var(--text-light); margin: var(--spacing-sm) 0 0 0;">Please provide your details to access the admin dashboard</p>
          </div>
          <form id="admin-profile-complete-form" class="modal-body" style="padding: var(--spacing-lg);">
            <div class="form-row">
              <div class="form-group">
                <label for="admin-complete-name">Full Name *</label>
                <input type="text" id="admin-complete-name" name="name" required class="form-input">
              </div>
              <div class="form-group">
                <label for="admin-complete-phone">Phone *</label>
                <input type="tel" id="admin-complete-phone" name="phone" required class="form-input">
              </div>
            </div>
            <div class="form-group">
              <label for="admin-complete-address">Address *</label>
              <input type="text" id="admin-complete-address" name="address" required class="form-input">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="admin-complete-city">City *</label>
                <input type="text" id="admin-complete-city" name="city" required class="form-input">
              </div>
              <div class="form-group">
                <label for="admin-complete-state">State *</label>
                <input type="text" id="admin-complete-state" name="state" required class="form-input">
              </div>
              <div class="form-group">
                <label for="admin-complete-zip">ZIP Code *</label>
                <input type="text" id="admin-complete-zip" name="zip" required class="form-input">
              </div>
            </div>
            <div class="modal-footer" style="padding: var(--spacing-lg) 0 0 0; border-top: 1px solid var(--border-color); gap: var(--spacing-md);">
              <button type="submit" class="btn btn-primary btn-block">Complete Profile & Continue</button>
              <button type="button" class="btn btn-secondary btn-block" onclick="adminApp.logout()">Logout</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', profileHtml);

    document.getElementById('admin-profile-complete-form').addEventListener('submit', async (e) => {
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
        document.getElementById('admin-profile-complete-modal').remove();
        this.showNotification('Profile completed successfully!');
        this.loadDashboardData();
        this.showPage('dashboard');
      } catch (error) {
        alert('Error completing profile: ' + error.message);
      }
    });
  }

  showLoginPage() {
    if (document.getElementById('login-modal')) return;

    const loginHtml = `
      <div id="login-modal" class="modal active" style="z-index: 2000;">
        <div class="modal-content" style="max-width: 400px;">
          <div class="modal-header">
            <h2>Admin Login</h2>
          </div>
          <form id="login-form" class="modal-body">
            <div class="form-group">
              <label>Email</label>
              <input type="email" name="email" value="admin@example.com" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" name="password" value="password" required>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-primary btn-block">Login as Admin</button>
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
        await auth.login(email, password, 'admin');
        if (!auth.isAdmin()) {
          throw new Error('Only admin users can access this portal');
        }
        document.getElementById('login-modal').remove();
        this.loadUser();
        this.loadDashboardData();
      } catch (error) {
        alert('Login failed: ' + error.message);
      }
    });
  }

  async loadUser() {
    this.user = auth.getCurrentUser();
    if (this.user) {
      document.getElementById('admin-name').textContent = this.user.name || this.user.email;
      console.log('[v0] Admin loaded:', this.user.email);
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
      document.querySelectorAll('[data-page]').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
          link.classList.add('active');
        }
      });

      // Load page-specific data
      if (pageName === 'products') {
        this.loadProducts();
      } else if (pageName === 'inventory') {
        this.loadInventory();
      } else if (pageName === 'orders') {
        this.loadOrders();
      } else if (pageName === 'users') {
        this.loadUsers();
      } else if (pageName === 'notifications') {
        this.loadNotifications();
        this.loadUsersForNotificationForm();
      } else if (pageName === 'dashboard') {
        this.loadDashboardData();
      }

      window.scrollTo(0, 0);
    }
  }

  async loadDashboardData() {
    try {
      const [products, orders, users, inventory] = await Promise.all([
        api.getProducts(),
        api.getOrders(),
        api.getUsers(),
        api.getInventory()
      ]);

      document.getElementById('stat-products').textContent = (products.data || []).length;
      document.getElementById('stat-orders').textContent = (orders.data || []).length;
      document.getElementById('stat-users').textContent = (users.data || []).length;

      const lowStock = (inventory.data || []).filter(item => item.stock <= item.reorderLevel);
      document.getElementById('stat-low-stock').textContent = lowStock.length;

      this.loadRecentOrders();
      this.loadLowStockItems();
    } catch (error) {
      console.error('[v0] Error loading dashboard:', error);
    }
  }

  async loadRecentOrders() {
    const container = document.getElementById('recent-orders');
    if (!container) return;

    try {
      const response = await api.getOrders();
      const orders = (response.data || []).slice(0, 5);

      if (orders.length === 0) {
        container.innerHTML = '<p class="text-muted">No orders yet</p>';
        return;
      }

      container.innerHTML = orders.map(order => `
        <div style="padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-color);">
          <div class="flex-between">
            <span class="text-primary">${order.id}</span>
            <span class="badge badge-primary">${order.status}</span>
          </div>
          <p class="text-muted" style="margin: 0; font-size: 0.9rem;">$${order.total.toFixed(2)}</p>
        </div>
      `).join('');
    } catch (error) {
      container.innerHTML = '<p class="text-danger">Error loading orders</p>';
    }
  }

  async loadLowStockItems() {
    const container = document.getElementById('low-stock-items');
    if (!container) return;

    try {
      const response = await api.getInventory();
      const lowStock = (response.data || []).filter(item => item.stock <= item.reorderLevel);

      if (lowStock.length === 0) {
        container.innerHTML = '<p class="text-success">All items in stock</p>';
        return;
      }

      container.innerHTML = lowStock.map(item => `
        <div style="padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-color);">
          <div class="flex-between">
            <span>${item.name}</span>
            <span class="badge badge-danger">Stock: ${item.stock}</span>
          </div>
        </div>
      `).join('');
    } catch (error) {
      container.innerHTML = '<p class="text-danger">Error loading inventory</p>';
    }
  }

  async loadProducts() {
    const tbody = document.getElementById('products-table');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading...</td></tr>';

    try {
      const response = await api.getProducts();
      const products = response.data || [];

      const search = (document.getElementById('products-search')?.value || '').toLowerCase();
      const filtered = products.filter(p =>
        !search || p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search)
      );

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(product => `
        <tr>
          <td>${product.id}</td>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>$${product.price.toFixed(2)}</td>
          <td>${product.stock}</td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-primary btn-sm" onclick="adminApp.editProduct(${product.id})">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="adminApp.deleteProduct(${product.id})">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      tbody.innerHTML = '<tr><td colspan="6" class="alert alert-danger">Error loading products</td></tr>';
    }
  }

  async loadInventory() {
    const tbody = document.getElementById('inventory-table');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading...</td></tr>';

    try {
      const response = await api.getInventory();
      const items = response.data || [];

      const search = (document.getElementById('inventory-search')?.value || '').toLowerCase();
      const filtered = items.filter(item =>
        !search || item.name.toLowerCase().includes(search)
      );

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No items found</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(item => `
        <tr>
          <td>${item.productId}</td>
          <td>${item.name}</td>
          <td>${item.stock}</td>
          <td>${item.reorderLevel}</td>
          <td>${item.supplier}</td>
          <td>
            <span class="badge ${item.stock <= item.reorderLevel ? 'badge-danger' : 'badge-success'}">
              ${item.stock <= item.reorderLevel ? 'Low' : 'OK'}
            </span>
          </td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="adminApp.updateStockModal(${item.productId})">Update</button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      tbody.innerHTML = '<tr><td colspan="7" class="alert alert-danger">Error loading inventory</td></tr>';
    }
  }

  async loadOrders() {
    const tbody = document.getElementById('orders-table');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading...</td></tr>';

    try {
      const response = await api.getOrders();
      let orders = response.data || [];

      const search = (document.getElementById('orders-search')?.value || '').toLowerCase();
      const status = document.getElementById('orders-filter')?.value || '';

      orders = orders.filter(order => {
        const matchSearch = !search || order.id.toLowerCase().includes(search);
        const matchStatus = !status || order.status === status;
        return matchSearch && matchStatus;
      });

      if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No orders found</td></tr>';
        return;
      }

      tbody.innerHTML = orders.map(order => `
        <tr>
          <td>${order.id}</td>
          <td>Customer ${order.id.slice(-3)}</td>
          <td>${order.items.length}</td>
          <td>$${order.total.toFixed(2)}</td>
          <td>
            <span class="badge badge-${order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'warning' : 'primary'}">
              ${order.status}
            </span>
          </td>
          <td>${new Date(order.date).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="adminApp.viewOrder(${order.id})">View</button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      tbody.innerHTML = '<tr><td colspan="7" class="alert alert-danger">Error loading orders</td></tr>';
    }
  }

  async loadUsers() {
    const tbody = document.getElementById('users-table');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading...</td></tr>';

    try {
      const response = await api.getUsers();
      const users = response.data || [];

      const search = (document.getElementById('users-search')?.value || '').toLowerCase();
      const filtered = users.filter(user =>
        !search || user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)
      );

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No users found</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(user => `
        <tr>
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td><span class="badge badge-primary">${user.role}</span></td>
          <td>${new Date(user.joinDate).toLocaleDateString()}</td>
          <td><span class="badge badge-success">Active</span></td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="adminApp.viewUser(${user.id})">View</button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      tbody.innerHTML = '<tr><td colspan="7" class="alert alert-danger">Error loading users</td></tr>';
    }
  }

  async loadNotifications() {
    const container = document.getElementById('notifications-list');
    if (!container) return;

    try {
      const response = await api.getNotifications();
      const notifications = response.data || [];

      if (notifications.length === 0) {
        container.innerHTML = '<p class="text-muted">No notifications sent yet</p>';
        return;
      }

      container.innerHTML = notifications.map(notif => `
        <div class="notification-item">
          <h4>${notif.title || 'Notification'}</h4>
          <p>${notif.message}</p>
          <p class="notification-time">${new Date(notif.createdAt).toLocaleString()}</p>
        </div>
      `).join('');
    } catch (error) {
      container.innerHTML = '<p class="text-danger">Error loading notifications</p>';
    }
  }

  async loadUsersForNotificationForm() {
    const userSelect = document.querySelector('select[name="userId"]');
    if (!userSelect) return;

    try {
      const response = await api.getUsers();
      const users = response.data || [];

      userSelect.innerHTML = '<option value="">Choose a user</option>' +
        users.map(user => `<option value="${user.id}">${user.name} (${user.email})</option>`).join('');
    } catch (error) {
      console.error('[v0] Error loading users for form:', error);
    }
  }

  toggleUserSelect() {
    const recipientType = document.querySelector('select[name="recipientType"]').value;
    const userSelectGroup = document.getElementById('user-select-group');
    userSelectGroup.style.display = recipientType === 'user' ? 'block' : 'none';
  }

  openProductModal() {
    document.getElementById('product-modal').classList.add('active');
    document.getElementById('product-form').reset();
  }

  closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
  }

  async handleProductSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get('name'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price')),
      stock: parseInt(formData.get('stock')),
      description: formData.get('description')
    };

    try {
      await api.createProduct(productData);
      this.showNotification('Product added successfully!');
      this.closeProductModal();
      this.loadProducts();
    } catch (error) {
      alert('Error saving product: ' + error.message);
    }
  }

  editProduct(id) {
    alert('Edit functionality would open the product form with existing data');
  }

  async deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        this.showNotification('Product deleted successfully!');
        this.loadProducts();
      } catch (error) {
        alert('Error deleting product: ' + error.message);
      }
    }
  }

  updateStockModal(productId) {
    const quantity = prompt('Enter new stock quantity:');
    if (quantity !== null) {
      this.updateStock(productId, parseInt(quantity));
    }
  }

  async updateStock(productId, quantity) {
    try {
      await api.updateInventory(productId, quantity);
      this.showNotification('Inventory updated!');
      this.loadInventory();
    } catch (error) {
      alert('Error updating inventory: ' + error.message);
    }
  }

  viewOrder(orderId) {
    alert(`Order details for ${orderId} would be displayed here`);
  }

  viewUser(userId) {
    alert(`User details for ${userId} would be displayed here`);
  }

  async handleNotificationSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const notificationData = {
      recipientType: formData.get('recipientType'),
      userId: formData.get('userId') || null,
      title: formData.get('title'),
      message: formData.get('message')
    };

    try {
      await api.sendNotification(notificationData);
      this.showNotification('Notification sent successfully!');
      e.target.reset();
      this.loadNotifications();
    } catch (error) {
      alert('Error sending notification: ' + error.message);
    }
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
let adminApp;
document.addEventListener('DOMContentLoaded', () => {
  adminApp = new AdminApp();
});
