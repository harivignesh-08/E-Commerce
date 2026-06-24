// ===== API Configuration =====
const API_BASE_URL = 'http://localhost:8080/api';

// Mock data for demonstration (replace with actual API calls)
const mockData = {
    products: [
        { id: 1, name: 'Laptop', price: 999.99, category: 'electronics', stock: 5, description: 'High-performance laptop' },
        { id: 2, name: 'Smartphone', price: 799.99, category: 'electronics', stock: 10, description: 'Latest smartphone' },
        { id: 3, name: 'T-Shirt', price: 29.99, category: 'clothing', stock: 50, description: 'Comfortable cotton t-shirt' },
        { id: 4, name: 'Jeans', price: 59.99, category: 'clothing', stock: 30, description: 'Classic blue jeans' },
        { id: 5, name: 'JavaScript Book', price: 49.99, category: 'books', stock: 15, description: 'Complete JS guide' },
        { id: 6, name: 'Coffee Maker', price: 89.99, category: 'home', stock: 8, description: 'Automatic coffee maker' },
    ],
    users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'customer', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active' },
    ],
    orders: [
        { id: 'ORD-001', customer: 'John Doe', total: 1059.98, status: 'delivered', date: '2024-06-10', items: [{ name: 'Laptop', qty: 1, price: 999.99 }, { name: 'Mouse', qty: 1, price: 59.99 }] },
        { id: 'ORD-002', customer: 'John Doe', total: 89.97, status: 'shipped', date: '2024-06-15', items: [{ name: 'T-Shirt', qty: 3, price: 29.99 }] },
    ]
};

// ===== API Service Class =====
class APIService {
    constructor() {
        this.token = localStorage.getItem('token') || null;
    }

    // ===== Product Service =====
    async getProducts(filters = {}) {
        console.log('[v0] Fetching products with filters:', filters);
        try {
            // In production, replace with actual API call:
            // const response = await fetch(`${API_BASE_URL}/products`, {
            //     method: 'GET',
            //     headers: this.getHeaders()
            // });
            // return await response.json();
            
            // Mock implementation
            let products = [...mockData.products];
            
            if (filters.search) {
                products = products.filter(p => 
                    p.name.toLowerCase().includes(filters.search.toLowerCase())
                );
            }
            
            if (filters.category) {
                products = products.filter(p => p.category === filters.category);
            }
            
            return products;
        } catch (error) {
            console.error('[v0] Error fetching products:', error);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            const products = await this.getProducts();
            return products.find(p => p.id === id);
        } catch (error) {
            console.error('[v0] Error fetching product:', error);
            throw error;
        }
    }

    async createProduct(productData) {
        console.log('[v0] Creating product:', productData);
        try {
            // const response = await fetch(`${API_BASE_URL}/products`, {
            //     method: 'POST',
            //     headers: this.getHeaders(),
            //     body: JSON.stringify(productData)
            // });
            // return await response.json();
            
            const newProduct = {
                id: Math.max(...mockData.products.map(p => p.id)) + 1,
                ...productData
            };
            mockData.products.push(newProduct);
            return newProduct;
        } catch (error) {
            console.error('[v0] Error creating product:', error);
            throw error;
        }
    }

    async updateProduct(id, productData) {
        console.log('[v0] Updating product:', id, productData);
        try {
            const index = mockData.products.findIndex(p => p.id === id);
            if (index >= 0) {
                mockData.products[index] = { ...mockData.products[index], ...productData };
                return mockData.products[index];
            }
            throw new Error('Product not found');
        } catch (error) {
            console.error('[v0] Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        console.log('[v0] Deleting product:', id);
        try {
            mockData.products = mockData.products.filter(p => p.id !== id);
            return { success: true };
        } catch (error) {
            console.error('[v0] Error deleting product:', error);
            throw error;
        }
    }

    // ===== Cart Service =====
    async getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    async addToCart(productId, quantity = 1) {
        console.log('[v0] Adding to cart:', productId, quantity);
        try {
            const cart = await this.getCart();
            const existingItem = cart.find(item => item.productId === productId);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                const product = await this.getProductById(productId);
                cart.push({
                    productId,
                    quantity,
                    price: product.price,
                    name: product.name
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            return cart;
        } catch (error) {
            console.error('[v0] Error adding to cart:', error);
            throw error;
        }
    }

    async removeFromCart(productId) {
        console.log('[v0] Removing from cart:', productId);
        try {
            const cart = await this.getCart();
            const filteredCart = cart.filter(item => item.productId !== productId);
            localStorage.setItem('cart', JSON.stringify(filteredCart));
            return filteredCart;
        } catch (error) {
            console.error('[v0] Error removing from cart:', error);
            throw error;
        }
    }

    async updateCartItem(productId, quantity) {
        console.log('[v0] Updating cart item:', productId, quantity);
        try {
            const cart = await this.getCart();
            const item = cart.find(item => item.productId === productId);
            if (item) {
                item.quantity = quantity;
                if (item.quantity <= 0) {
                    return this.removeFromCart(productId);
                }
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            return cart;
        } catch (error) {
            console.error('[v0] Error updating cart item:', error);
            throw error;
        }
    }

    async clearCart() {
        console.log('[v0] Clearing cart');
        localStorage.setItem('cart', JSON.stringify([]));
        return [];
    }

    // ===== Order Service =====
    async getOrders(userId = null) {
        console.log('[v0] Fetching orders for user:', userId);
        try {
            // Mock implementation
            return mockData.orders;
        } catch (error) {
            console.error('[v0] Error fetching orders:', error);
            throw error;
        }
    }

    async getOrderById(orderId) {
        try {
            return mockData.orders.find(o => o.id === orderId);
        } catch (error) {
            console.error('[v0] Error fetching order:', error);
            throw error;
        }
    }

    async createOrder(orderData) {
        console.log('[v0] Creating order:', orderData);
        try {
            const newOrder = {
                id: 'ORD-' + String(mockData.orders.length + 1).padStart(3, '0'),
                ...orderData,
                status: 'pending',
                date: new Date().toISOString().split('T')[0]
            };
            mockData.orders.push(newOrder);
            return newOrder;
        } catch (error) {
            console.error('[v0] Error creating order:', error);
            throw error;
        }
    }

    async updateOrderStatus(orderId, status) {
        console.log('[v0] Updating order status:', orderId, status);
        try {
            const order = mockData.orders.find(o => o.id === orderId);
            if (order) {
                order.status = status;
                return order;
            }
            throw new Error('Order not found');
        } catch (error) {
            console.error('[v0] Error updating order status:', error);
            throw error;
        }
    }

    // ===== User Service =====
    async getUsers() {
        console.log('[v0] Fetching users');
        try {
            return mockData.users;
        } catch (error) {
            console.error('[v0] Error fetching users:', error);
            throw error;
        }
    }

    async getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    async login(email, password) {
        console.log('[v0] Logging in user:', email);
        try {
            // Mock implementation
            const user = mockData.users.find(u => u.email === email);
            if (user) {
                const token = 'mock_token_' + Date.now();
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                this.token = token;
                return { user, token };
            }
            throw new Error('Invalid credentials');
        } catch (error) {
            console.error('[v0] Login error:', error);
            throw error;
        }
    }

    async logout() {
        console.log('[v0] Logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        this.token = null;
    }

    async updateUserProfile(userId, profileData) {
        console.log('[v0] Updating user profile:', userId, profileData);
        try {
            const user = mockData.users.find(u => u.id === userId);
            if (user) {
                Object.assign(user, profileData);
                localStorage.setItem('user', JSON.stringify(user));
                return user;
            }
            throw new Error('User not found');
        } catch (error) {
            console.error('[v0] Error updating profile:', error);
            throw error;
        }
    }

    // ===== Inventory Service =====
    async getInventory() {
        console.log('[v0] Fetching inventory');
        try {
            return mockData.products.map(p => ({
                productId: p.id,
                productName: p.name,
                available: p.stock,
                reserved: Math.floor(p.stock * 0.1),
                lowStockAlert: p.stock < 10
            }));
        } catch (error) {
            console.error('[v0] Error fetching inventory:', error);
            throw error;
        }
    }

    async updateInventory(productId, quantity) {
        console.log('[v0] Updating inventory:', productId, quantity);
        try {
            const product = mockData.products.find(p => p.id === productId);
            if (product) {
                product.stock = quantity;
                return product;
            }
            throw new Error('Product not found');
        } catch (error) {
            console.error('[v0] Error updating inventory:', error);
            throw error;
        }
    }

    // ===== Payment Service =====
    async processPayment(paymentData) {
        console.log('[v0] Processing payment:', paymentData);
        try {
            // Mock payment processing
            return {
                success: true,
                transactionId: 'TXN-' + Date.now(),
                status: 'completed',
                amount: paymentData.amount
            };
        } catch (error) {
            console.error('[v0] Error processing payment:', error);
            throw error;
        }
    }

    // ===== Notification Service =====
    async getNotifications() {
        console.log('[v0] Fetching notifications');
        try {
            return [
                { id: 1, message: 'Your order has been shipped', date: new Date() },
                { id: 2, message: 'New product available in your wishlist', date: new Date() }
            ];
        } catch (error) {
            console.error('[v0] Error fetching notifications:', error);
            throw error;
        }
    }

    // ===== Helper Methods =====
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `API Error: ${response.status}`);
        }
        return response.json();
    }
}

// ===== Initialize API Service =====
const api = new APIService();
