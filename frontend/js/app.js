// ===== Application State =====
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

// ===== Page Navigation =====
function navigateTo(pageName) {
    console.log('[v0] Navigating to:', pageName);
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const pageElement = document.getElementById(pageName);
    if (pageElement) {
        pageElement.classList.add('active');
        state.currentPage = pageName;
        
        // Update navigation active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });
        
        // Load page-specific data
        loadPageData(pageName);
    }
}

function loadPageData(pageName) {
    console.log('[v0] Loading data for page:', pageName);
    
    switch(pageName) {
        case 'products':
            loadProducts();
            break;
        case 'cart':
            loadCart();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'admin':
            loadAdminDashboard();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// ===== Home Page =====
// Home page is static, no specific loading needed

// ===== Products Page =====
async function loadProducts() {
    console.log('[v0] Loading products');
    try {
        const products = await api.getProducts(state.filters);
        state.products = products;
        renderProducts(products);
    } catch (error) {
        console.error('[v0] Error loading products:', error);
        showNotification('Error loading products', 'error');
    }
}

function renderProducts(products) {
    console.log('[v0] Rendering products:', products.length);
    const grid = document.getElementById('products-grid');
    
    if (!products || products.length === 0) {
        grid.innerHTML = '<div class="empty-message">No products found</div>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">Product Image</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description || ''}</div>
                <div class="product-footer">
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="btn btn-primary btn-small btn-add-to-cart" 
                            onclick="handleAddToCart(${product.id}, '${product.name}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function setupProductFilters() {
    console.log('[v0] Setting up product filters');
    
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.filters.search = e.target.value;
            loadProducts();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            state.filters.category = e.target.value;
            loadProducts();
        });
    }
}

// ===== Cart Management =====
async function handleAddToCart(productId, productName) {
    console.log('[v0] Adding product to cart:', productId);
    try {
        await api.addToCart(productId, 1);
        updateCartCount();
        showNotification(`${productName} added to cart`, 'success');
    } catch (error) {
        console.error('[v0] Error adding to cart:', error);
        showNotification('Error adding to cart', 'error');
    }
}

async function loadCart() {
    console.log('[v0] Loading cart');
    try {
        const cart = await api.getCart();
        state.cart = cart;
        renderCart(cart);
    } catch (error) {
        console.error('[v0] Error loading cart:', error);
    }
}

function renderCart(cart) {
    console.log('[v0] Rendering cart with', cart.length, 'items');
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (!cart || cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-message">Your cart is empty</div>';
        updateCartSummary(cart);
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">Item Image</div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="quantity-control">
                    <button onclick="updateCartQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                    <div class="quantity-display">${item.quantity}</div>
                    <button onclick="updateCartQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="remove-btn" onclick="removeFromCart(${item.productId})">Remove</div>
        </div>
    `).join('');
    
    updateCartSummary(cart);
}

async function updateCartQuantity(productId, newQuantity) {
    console.log('[v0] Updating cart quantity:', productId, newQuantity);
    try {
        if (newQuantity <= 0) {
            await api.removeFromCart(productId);
        } else {
            await api.updateCartItem(productId, newQuantity);
        }
        await loadCart();
    } catch (error) {
        console.error('[v0] Error updating cart:', error);
    }
}

async function removeFromCart(productId) {
    console.log('[v0] Removing from cart:', productId);
    try {
        await api.removeFromCart(productId);
        await loadCart();
        updateCartCount();
    } catch (error) {
        console.error('[v0] Error removing from cart:', error);
    }
}

function updateCartSummary(cart) {
    console.log('[v0] Updating cart summary');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + shipping;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function updateCartCount() {
    const count = state.cart.length || 0;
    document.querySelector('.cart-count').textContent = count;
}

// ===== Checkout =====
function setupCheckout() {
    console.log('[v0] Setting up checkout form');
    const form = document.getElementById('checkout-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleCheckout();
        });
    }
}

async function handleCheckout() {
    console.log('[v0] Processing checkout');
    try {
        const cart = await api.getCart();
        if (cart.length === 0) {
            showNotification('Cart is empty', 'warning');
            return;
        }
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Create order
        const orderData = {
            customer: state.user?.name || 'Guest',
            total: total,
            items: cart
        };
        
        const order = await api.createOrder(orderData);
        
        // Process payment
        const paymentData = {
            orderId: order.id,
            amount: total
        };
        
        const payment = await api.processPayment(paymentData);
        
        if (payment.success) {
            await api.clearCart();
            updateCartCount();
            showNotification('Order placed successfully!', 'success');
            setTimeout(() => navigateTo('orders'), 2000);
        }
    } catch (error) {
        console.error('[v0] Checkout error:', error);
        showNotification('Error processing order', 'error');
    }
}

// ===== Orders Management =====
async function loadOrders() {
    console.log('[v0] Loading orders');
    try {
        const orders = await api.getOrders();
        state.orders = orders;
        renderOrders(orders);
    } catch (error) {
        console.error('[v0] Error loading orders:', error);
    }
}

function renderOrders(orders) {
    console.log('[v0] Rendering orders:', orders.length);
    const ordersList = document.getElementById('orders-list');
    
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = '<div class="empty-message">No orders yet</div>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-id">Order ${order.id}</div>
                <div class="order-status status-${order.status}">${order.status.toUpperCase()}</div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.name} x${item.qty}</span>
                        <span>$${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <span>Total:</span>
                <span>$${order.total.toFixed(2)}</span>
            </div>
            <div style="margin-top: 15px; font-size: 13px; color: var(--text-secondary);">
                Order Date: ${order.date}
            </div>
        </div>
    `).join('');
}

// ===== Profile Management =====
async function loadProfile() {
    console.log('[v0] Loading profile');
    try {
        const user = await api.getCurrentUser();
        if (user) {
            state.user = user;
            document.getElementById('user-name').value = user.name || '';
            document.getElementById('user-email').value = user.email || '';
            document.getElementById('user-phone').value = user.phone || '';
            document.getElementById('user-address').value = user.address || '';
            document.getElementById('user-city').value = user.city || '';
            document.getElementById('user-state').value = user.state || '';
            document.getElementById('user-zip').value = user.zip || '';
        }
    } catch (error) {
        console.error('[v0] Error loading profile:', error);
    }
}

function setupProfileForm() {
    console.log('[v0] Setting up profile form');
    const form = document.getElementById('profile-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const profileData = {
                name: document.getElementById('user-name').value,
                email: document.getElementById('user-email').value,
                phone: document.getElementById('user-phone').value,
                address: document.getElementById('user-address').value,
                city: document.getElementById('user-city').value,
                state: document.getElementById('user-state').value,
                zip: document.getElementById('user-zip').value
            };
            
            try {
                if (state.user) {
                    await api.updateUserProfile(state.user.id, profileData);
                    showNotification('Profile updated successfully', 'success');
                }
            } catch (error) {
                console.error('[v0] Error updating profile:', error);
                showNotification('Error updating profile', 'error');
            }
        });
    }
}

// ===== Admin Dashboard =====
async function loadAdminDashboard() {
    console.log('[v0] Loading admin dashboard');
    try {
        // Check if user is admin
        const user = await api.getCurrentUser();
        if (user && user.role !== 'admin') {
            showNotification('Access denied: Admin only', 'error');
            navigateTo('home');
            return;
        }
        
        await loadAdminProducts();
        await loadAdminInventory();
        await loadAdminOrders();
        await loadAdminUsers();
    } catch (error) {
        console.error('[v0] Error loading admin dashboard:', error);
    }
}

async function loadAdminProducts() {
    console.log('[v0] Loading admin products');
    try {
        const products = await api.getProducts();
        renderAdminProducts(products);
    } catch (error) {
        console.error('[v0] Error loading admin products:', error);
    }
}

function renderAdminProducts(products) {
    console.log('[v0] Rendering admin products table');
    const tbody = document.getElementById('products-table-body');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No products</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.category}</td>
            <td>${product.stock}</td>
            <td class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function loadAdminInventory() {
    console.log('[v0] Loading admin inventory');
    try {
        const inventory = await api.getInventory();
        renderAdminInventory(inventory);
    } catch (error) {
        console.error('[v0] Error loading admin inventory:', error);
    }
}

function renderAdminInventory(inventory) {
    console.log('[v0] Rendering admin inventory table');
    const tbody = document.getElementById('inventory-table-body');
    
    if (!inventory || inventory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No inventory</td></tr>';
        return;
    }
    
    tbody.innerHTML = inventory.map(item => `
        <tr>
            <td>${item.productName}</td>
            <td>${item.available}</td>
            <td>${item.reserved}</td>
            <td>${item.lowStockAlert ? '<span style="color: var(--danger-color);">Yes</span>' : 'No'}</td>
            <td class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="updateInventory(${item.productId})">Update</button>
            </td>
        </tr>
    `).join('');
}

async function loadAdminOrders() {
    console.log('[v0] Loading admin orders');
    try {
        const orders = await api.getOrders();
        renderAdminOrders(orders);
    } catch (error) {
        console.error('[v0] Error loading admin orders:', error);
    }
}

function renderAdminOrders(orders) {
    console.log('[v0] Rendering admin orders table');
    const tbody = document.getElementById('orders-admin-table-body');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No orders</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>${order.status}</td>
            <td>${order.date}</td>
            <td class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="viewOrder('${order.id}')">View</button>
                <button class="btn btn-secondary btn-small" onclick="updateOrderStatus('${order.id}')">Update</button>
            </td>
        </tr>
    `).join('');
}

async function loadAdminUsers() {
    console.log('[v0] Loading admin users');
    try {
        const users = await api.getUsers();
        renderAdminUsers(users);
    } catch (error) {
        console.error('[v0] Error loading admin users:', error);
    }
}

function renderAdminUsers(users) {
    console.log('[v0] Rendering admin users table');
    const tbody = document.getElementById('users-table-body');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">No users</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.status}</td>
            <td class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="editUser(${user.id})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function setupAdminTabs() {
    console.log('[v0] Setting up admin tabs');
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
            
            e.target.classList.add('active');
            const tabId = e.target.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ===== Product Modal =====
function openProductModal() {
    console.log('[v0] Opening product modal');
    document.getElementById('product-modal').classList.add('show');
}

function closeProductModal() {
    console.log('[v0] Closing product modal');
    document.getElementById('product-modal').classList.remove('show');
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
}

function setupProductForm() {
    console.log('[v0] Setting up product form');
    const form = document.getElementById('product-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const productId = document.getElementById('product-id').value;
            const productData = {
                name: document.getElementById('product-name').value,
                description: document.getElementById('product-description').value,
                price: parseFloat(document.getElementById('product-price').value),
                category: document.getElementById('product-category').value,
                stock: parseInt(document.getElementById('product-stock').value)
            };
            
            try {
                if (productId) {
                    await api.updateProduct(parseInt(productId), productData);
                    showNotification('Product updated successfully', 'success');
                } else {
                    await api.createProduct(productData);
                    showNotification('Product created successfully', 'success');
                }
                closeProductModal();
                await loadAdminProducts();
            } catch (error) {
                console.error('[v0] Error saving product:', error);
                showNotification('Error saving product', 'error');
            }
        });
    }
}

async function editProduct(id) {
    console.log('[v0] Editing product:', id);
    try {
        const product = await api.getProductById(id);
        if (product) {
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-stock').value = product.stock;
            openProductModal();
        }
    } catch (error) {
        console.error('[v0] Error loading product:', error);
    }
}

async function deleteProduct(id) {
    console.log('[v0] Deleting product:', id);
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await api.deleteProduct(id);
            showNotification('Product deleted successfully', 'success');
            await loadAdminProducts();
        } catch (error) {
            console.error('[v0] Error deleting product:', error);
            showNotification('Error deleting product', 'error');
        }
    }
}

// ===== Placeholder Admin Functions =====
function updateInventory(productId) {
    console.log('[v0] Update inventory:', productId);
    showNotification('Feature not implemented yet', 'info');
}

function viewOrder(orderId) {
    console.log('[v0] View order:', orderId);
    showNotification('Feature not implemented yet', 'info');
}

function updateOrderStatus(orderId) {
    console.log('[v0] Update order status:', orderId);
    showNotification('Feature not implemented yet', 'info');
}

function editUser(userId) {
    console.log('[v0] Edit user:', userId);
    showNotification('Feature not implemented yet', 'info');
}

function deleteUser(userId) {
    console.log('[v0] Delete user:', userId);
    if (confirm('Are you sure?')) {
        showNotification('Feature not implemented yet', 'info');
    }
}

// ===== Notifications =====
function showNotification(message, type = 'info') {
    console.log('[v0] Showing notification:', type, message);
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: var(--${type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'}-color);
        color: white;
        border-radius: 6px;
        box-shadow: var(--shadow-lg);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== Logout =====
async function handleLogout() {
    console.log('[v0] Logging out');
    await api.logout();
    state.user = null;
    navigateTo('home');
    showNotification('Logged out successfully', 'success');
}

// ===== Initialize Application =====
function initializeApp() {
    console.log('[v0] Initializing application');
    
    // Setup event listeners
    setupProductFilters();
    setupCheckout();
    setupProfileForm();
    setupAdminTabs();
    setupProductForm();
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateTo(page);
        });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('product-modal');
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
    
    // Load initial data
    loadCart();
    updateCartCount();
    
    // Navigate to home page
    navigateTo('home');
    
    console.log('[v0] Application initialized successfully');
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
