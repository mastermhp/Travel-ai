import Cookies from 'js-cookie';

class ApiService {
  constructor() {
    // Replace with your actual backend URL
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Add auth token to requests
  _getAuthHeaders() {
    const token = Cookies.get('token');
    return token ? { ...this.headers, Authorization: `Bearer ${token}` } : this.headers;
  }

  // Auth endpoints
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ email, password }),
      });

      // Parse response
      const data = await response.json();
      
      // Handle errors
      if (!response.ok) {
        throw new Error(data.error || `Login failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(userData),
      });

      // Parse response
      const data = await response.json();
      
      // Handle errors
      if (!response.ok) {
        throw new Error(data.error || `Registration failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async getUserProfile() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: 'GET',
        headers: this._getAuthHeaders(),
      });

      // Parse response
      const data = await response.json();
      
      // Handle errors
      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch profile: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Profile error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;