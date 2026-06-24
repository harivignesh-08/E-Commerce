/**
 * API Client Module
 * Handles all API calls to microservices
 * Update API_BASE_URL to point to your API Gateway
 */

// Configuration
const API_BASE_URL = 'http://localhost:8080/api'; // Update this with your API Gateway URL

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 30000;
  }

  /**
   * Get headers with auth token
   * @private
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (auth && auth.getToken()) {
      headers['Authorization'] = `Bearer ${auth.getToken()}`;
    }

    return headers;
  }

  /**
   * Make API request
   * @private
   */
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: this.getHeaders(),
      timeout: this.timeout
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), this.timeout)
        )
      ]);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('[v0] API Error:', error.message);
      throw error;
    }
  }

  /**
   * GET request
   */
  get(endpoint) {
    return this.request('GET', endpoint);
  }

  /**
   * POST request
   */
  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  /**
   * PUT request
   */
  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  /**
   * DELETE request
   */
  delete(endpoint) {
    return this.request('DELETE', endpoint);
  }

  // ==================== PRODUCT SERVICE ====================

  /**
   * Get all products
   */
  async getProducts(filters = {}) {
    try {
      let endpoint = '/products';
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      if (params.toString()) {
        endpoint += '?' + params.toString();
      }

      const mockData = this.getMockProducts();
      return { data: mockData, total: mockData.length };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(id) {
    try {
      const products = this.getMockProducts();
      return products.find(p => p.id == id) || null;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create product (admin only)
   */
  async createProduct(productData) {
    try {
      return await this.post('/products', productData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update product (admin only)
   */
  async updateProduct(id, productData) {
    try {
      return await this.put(`/products/${id}`, productData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete product (admin only)
   */
  async deleteProduct(id) {
    try {
      return await this.delete(`/products/${id}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== CART SERVICE ====================

  /**
   * Get user's cart
   */
  async getCart() {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      return { items: cart, total: this.calculateCartTotal(cart) };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(productId, quantity = 1) {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const product = await this.getProduct(productId);

      if (!product) {
        throw new Error('Product not found');
      }

      const existingItem = cart.find(item => item.productId == productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          productId,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      return { success: true, item: cart.find(i => i.productId == productId) };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update cart item
   */
  async updateCartItem(productId, quantity) {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const item = cart.find(i => i.productId == productId);

      if (!item) {
        throw new Error('Item not in cart');
      }

      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }

      item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      return { success: true, item };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId) {
    try {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      cart = cart.filter(item => item.productId != productId);
      localStorage.setItem('cart', JSON.stringify(cart));
      return { success: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Clear cart
   */
  async clearCart() {
    try {
      localStorage.removeItem('cart');
      return { success: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== ORDER SERVICE ====================

  /**
   * Get all orders (user sees own, admin sees all)
   */
  async getOrders(filters = {}) {
    try {
      const orders = this.getMockOrders();
      return { data: orders, total: orders.length };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(id) {
    try {
      const orders = this.getMockOrders();
      return orders.find(o => o.id == id) || null;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create order (checkout)
   */
  async createOrder(orderData) {
    try {
      const order = {
        id: 'ORD-' + Date.now(),
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        items: JSON.parse(localStorage.getItem('cart') || '[]')
      };

      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
      await this.clearCart();

      return order;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(orderId, status) {
    try {
      return await this.put(`/orders/${orderId}`, { status });
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== PAYMENT SERVICE ====================

  /**
   * Process payment
   */
  async processPayment(paymentData) {
    try {
      return await this.post('/payments', paymentData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory() {
    try {
      const payments = JSON.parse(localStorage.getItem('payments') || '[]');
      return { data: payments, total: payments.length };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== INVENTORY SERVICE ====================

  /**
   * Get inventory levels (admin only)
   */
  async getInventory(filters = {}) {
    try {
      const products = this.getMockProducts();
      return {
        data: products.map(p => ({
          productId: p.id,
          name: p.name,
          stock: p.stock || 100,
          reorderLevel: 20,
          supplier: p.supplier || 'Default Supplier'
        })),
        total: products.length
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update inventory (admin only)
   */
  async updateInventory(productId, quantity) {
    try {
      return await this.put(`/inventory/${productId}`, { quantity });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get low stock items (admin only)
   */
  async getLowStockItems() {
    try {
      const inventory = await this.getInventory();
      return inventory.data.filter(item => item.stock <= item.reorderLevel);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== NOTIFICATION SERVICE ====================

  /**
   * Get notifications
   */
  async getNotifications() {
    try {
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      return { data: notifications, total: notifications.length };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Send notification (admin only)
   */
  async sendNotification(notificationData) {
    try {
      return await this.post('/notifications', notificationData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== USER SERVICE ====================

  /**
   * Get all users (admin only)
   */
  async getUsers(filters = {}) {
    try {
      const users = this.getMockUsers();
      return { data: users, total: users.length };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUser(id) {
    try {
      const users = this.getMockUsers();
      return users.find(u => u.id == id) || null;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update user (admin can update any, users can update own)
   */
  async updateUser(id, userData) {
    try {
      return await this.put(`/users/${id}`, userData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(id) {
    try {
      return await this.delete(`/users/${id}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== MOCK DATA ====================

  getMockProducts() {
    return [
      {
        id: 1,
        name: 'Laptop Pro',
        price: 1299.99,
        category: 'Electronics',
        image: 'https://via.placeholder.com/300x200?text=Laptop+Pro',
        description: 'High-performance laptop for professionals',
        stock: 45,
        supplier: 'Tech Supplier Inc'
      },
      {
        id: 2,
        name: 'Wireless Mouse',
        price: 29.99,
        category: 'Accessories',
        image: 'https://via.placeholder.com/300x200?text=Wireless+Mouse',
        description: 'Ergonomic wireless mouse with long battery life',
        stock: 150,
        supplier: 'Accessory Plus'
      },
      {
        id: 3,
        name: 'USB-C Cable',
        price: 12.99,
        category: 'Cables',
        image: 'https://via.placeholder.com/300x200?text=USB-C+Cable',
        description: 'Fast charging USB-C cable',
        stock: 8,
        supplier: 'Cable World'
      },
      {
        id: 4,
        name: 'Keyboard Mechanical',
        price: 89.99,
        category: 'Accessories',
        image: 'https://via.placeholder.com/300x200?text=Mechanical+Keyboard',
        description: 'RGB mechanical keyboard',
        stock: 60,
        supplier: 'Gaming Gear'
      },
      {
        id: 5,
        name: 'Monitor 4K',
        price: 399.99,
        category: 'Electronics',
        image: 'https://via.placeholder.com/300x200?text=4K+Monitor',
        description: '4K UHD 27-inch monitor',
        stock: 25,
        supplier: 'Display Tech'
      }
    ];
  }

  getMockOrders() {
    return [
      {
        id: 'ORD-001',
        customerId: 1,
        date: '2024-06-20',
        total: 1329.98,
        status: 'delivered',
        items: [
          { productId: 1, name: 'Laptop Pro', quantity: 1, price: 1299.99 },
          { productId: 2, name: 'Wireless Mouse', quantity: 1, price: 29.99 }
        ]
      },
      {
        id: 'ORD-002',
        customerId: 1,
        date: '2024-06-22',
        total: 102.98,
        status: 'processing',
        items: [
          { productId: 4, name: 'Keyboard Mechanical', quantity: 1, price: 89.99 },
          { productId: 2, name: 'Wireless Mouse', quantity: 1, price: 12.99 }
        ]
      }
    ];
  }

  getMockUsers() {
    return [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', joinDate: '2024-01-15' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', joinDate: '2023-12-01' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', joinDate: '2024-03-20' }
    ];
  }

  // ==================== UTILITIES ====================

  calculateCartTotal(items) {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  handleError(error) {
    console.error('[v0] Error:', error);
    throw error;
  }
}

// Create singleton instance
const api = new APIClient();
