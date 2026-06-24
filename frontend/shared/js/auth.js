/**
 * Authentication Module
 * Handles user login, logout, session management, and role-based access
 */

class AuthManager {
  constructor() {
    this.currentUser = this.loadUser();
    this.isAuthenticated = !!this.currentUser;
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role: 'user' or 'admin'
   * @returns {Promise<Object>} - User object
   */
  async login(email, password, role = 'user') {
    try {
      // Mock authentication - replace with real API call
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Simulate API call
      const response = await this.mockApiCall('/api/auth/login', {
        email,
        password,
        role
      });

      // Store user data
      const user = {
        id: response.id || Date.now(),
        email,
        role,
        name: response.name || email.split('@')[0],
        token: response.token || 'mock-jwt-token-' + Date.now(),
        createdAt: new Date().toISOString()
      };

      this.currentUser = user;
      this.isAuthenticated = true;
      this.saveUser(user);

      return user;
    } catch (error) {
      console.error('[v0] Auth login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User data (email, password, name)
   * @returns {Promise<Object>} - User object
   */
  async register(userData) {
    try {
      const { email, password, name } = userData;

      if (!email || !password || !name) {
        throw new Error('Email, password, and name are required');
      }

      // Simulate API call
      const response = await this.mockApiCall('/api/auth/register', userData);

      const user = {
        id: response.id || Date.now(),
        email,
        name,
        role: 'user', // New users are always regular users
        token: response.token || 'mock-jwt-token-' + Date.now(),
        createdAt: new Date().toISOString()
      };

      this.currentUser = user;
      this.isAuthenticated = true;
      this.saveUser(user);

      return user;
    } catch (error) {
      console.error('[v0] Auth register error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  }

  /**
   * Get current user
   * @returns {Object|null} - Current user or null
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  checkAuth() {
    return this.isAuthenticated;
  }

  /**
   * Check if user has admin role
   * @returns {boolean} - True if user is admin
   */
  isAdmin() {
    return this.currentUser?.role === 'admin';
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} - True if user has role
   */
  hasRole(role) {
    return this.currentUser?.role === role;
  }

  /**
   * Get auth token
   * @returns {string|null} - Auth token
   */
  getToken() {
    return this.currentUser?.token || null;
  }

  /**
   * Save user to storage
   * @private
   */
  saveUser(user) {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('[v0] Error saving user:', error);
    }
  }

  /**
   * Load user from storage
   * @private
   */
  loadUser() {
    try {
      // Try localStorage first
      let user = localStorage.getItem('currentUser');
      if (user) {
        return JSON.parse(user);
      }

      // Try sessionStorage
      user = sessionStorage.getItem('currentUser');
      if (user) {
        return JSON.parse(user);
      }

      return null;
    } catch (error) {
      console.error('[v0] Error loading user:', error);
      return null;
    }
  }

  /**
   * Mock API call
   * @private
   */
  async mockApiCall(endpoint, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          id: Math.random().toString(36).substr(2, 9),
          token: 'mock-token-' + Date.now()
        });
      }, 500);
    });
  }

  /**
   * Update user profile
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated user
   */
  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      const updated = { ...this.currentUser, ...updates };
      this.currentUser = updated;
      this.saveUser(updated);

      return updated;
    } catch (error) {
      console.error('[v0] Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Check if user profile is complete
   * @returns {boolean} - True if profile is complete
   */
  isProfileComplete() {
    if (!this.currentUser) return false;
    
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'zip'];
    return requiredFields.every(field => 
      this.currentUser[field] && 
      String(this.currentUser[field]).trim() !== ''
    );
  }

  /**
   * Mark profile as being edited
   */
  setProfileEditing(status) {
    if (this.currentUser) {
      this.currentUser.profileEditing = status;
      this.saveUser(this.currentUser);
    }
  }

  /**
   * Check if profile is currently being edited
   */
  isProfileEditing() {
    return this.currentUser?.profileEditing === true;
  }
}

// Create singleton instance
const auth = new AuthManager();
