// services/api.js
class ApiService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  _getAuthHeaders() {
    let headers = { ...this.headers };
    
    // Only access localStorage in browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  // AUTHENTICATION METHODS
  
  async register(userData) {
    try {
      console.log("Registering user:", userData.email);
      
      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone || null
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Registration failed: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  
  async login(credentials) {
    try {
      console.log("Logging in user:", credentials.email);
      
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Login failed: ${response.status}`);
      }
      
      // Save auth token if provided
      if (data.session?.access_token && typeof window !== "undefined") {
        localStorage.setItem('authToken', data.session.access_token);
      }
      
      // Store user info
      if (data.user && typeof window !== "undefined") {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  async logout() {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
      });
      
      // Even if the server request fails, clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        console.warn('Logout on server failed, but local session cleared');
      }
      
      return data;
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API request fails
      if (typeof window !== "undefined") {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
      throw error;
    }
  }
  
  async getCurrentUser() {
    try {
      // First check if we have the user in local storage to avoid unnecessary API calls
      if (typeof window !== "undefined") {
        const localUser = localStorage.getItem('user');
        if (localUser) {
          return { success: true, user: JSON.parse(localUser) };
        }
        
        // If no stored user or token, don't even make the request
        const token = localStorage.getItem('authToken');
        if (!token) {
          return { success: false, message: 'Not authenticated' };
        }
      }
      
      const response = await fetch(`${this.baseUrl}/api/auth/me`, {
        method: 'GET',
        headers: this._getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Clear invalid token/user data
        if (response.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
        throw new Error(data.message || `Failed to get user: ${response.status}`);
      }
      
      // Update stored user info
      if (data.user && typeof window !== "undefined") {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: this._getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to update profile: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // BOOKING METHODS
  
  async createBooking(bookingDetails) {
    try {
      console.log("Creating booking:", bookingDetails);
      
      const response = await fetch(`${this.baseUrl}/api/bookings`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify(bookingDetails),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to create booking: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  }
  
  async getUserBookings() {
    try {
      const response = await fetch(`${this.baseUrl}/api/bookings/user`, {
        method: 'GET',
        headers: this._getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to get bookings: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Get bookings error:', error);
      throw error;
    }
  }
  
  async getBookingByReference(reference) {
    try {
      const response = await fetch(`${this.baseUrl}/api/bookings/${reference}`, {
        method: 'GET',
        headers: this._getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to get booking: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Get booking error:', error);
      throw error;
    }
  }
  
  async cancelBooking(reference) {
    try {
      const response = await fetch(`${this.baseUrl}/api/bookings/${reference}`, {
        method: 'PUT',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({ action: 'cancel' }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to cancel booking: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  // TRAVEL ASSISTANT METHODS

  async travelAssistant(query, sessionId = null) {
    try {
      console.log("Sending request to:", `${this.baseUrl}/api/travel/assistant`);
      
      const requestData = {
        query,
        sessionId
      };
      
      console.log("Request data:", requestData);

      const response = await fetch(`${this.baseUrl}/api/travel/assistant`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to process chat: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Chat error details:', error);
      throw error;
    }
  }

  async sendImageMessage(formData) {
    try {
      console.log("Sending image to:", `${this.baseUrl}/api/travel/image-upload`);

      // For FormData, we need to omit the Content-Type header so the browser can set it with boundary
      const headers = this._getAuthHeaders();
      delete headers['Content-Type'];
      
      const response = await fetch(`${this.baseUrl}/api/travel/image-upload`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to process image: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  async getChatHistory(sessionId) {
    try {
      console.log("Getting chat history for session:", sessionId);

      const response = await fetch(`${this.baseUrl}/api/travel/chat-history?sessionId=${sessionId}`, {
        method: 'GET',
        headers: this._getAuthHeaders(),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to get chat history: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Chat history error:', error);
      throw error;
    }
  }

  // HOTEL API METHODS
  
  async searchHotels(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add search parameters to query string
      if (params.destination) queryParams.append('destination', params.destination);
      if (params.checkIn) queryParams.append('checkIn', params.checkIn);
      if (params.checkOut) queryParams.append('checkOut', params.checkOut);
      if (params.adults) queryParams.append('adults', params.adults);
      if (params.children) queryParams.append('children', params.children);
      if (params.minPrice && params.maxPrice) queryParams.append('price', `${params.minPrice}-${params.maxPrice}`);
      if (params.rating) queryParams.append('rating', params.rating);
      if (params.currency) queryParams.append('currency', params.currency);
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber);
      
      console.log("Searching hotels with params:", Object.fromEntries(queryParams.entries()));
      
      const response = await fetch(`${this.baseUrl}/api/hotels/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: this._getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to search hotels: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Hotel search error:', error);
      throw error;
    }
  }
  
  async getHotelDetails(hotelId, provider) {
    try {
      if (!hotelId) {
        throw new Error("Hotel ID is required");
      }
      
      // Standardize provider - default to 'booking' if not provided
      const safeProvider = provider || 'booking';
      
      console.log(`Getting hotel details for ${safeProvider}/${hotelId}`);
      
      const response = await fetch(`${this.baseUrl}/api/hotels/details/${safeProvider}/${hotelId}`, {
        method: 'GET',
        headers: this._getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to get hotel details: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Hotel details error:', error);
      throw error;
    }
  }
  
  async getHotelRooms(hotelId, provider, params = {}) {
    try {
      if (!hotelId) {
        throw new Error("Hotel ID is required");
      }

      // Standardize provider - default to 'booking' if not provided
      const safeProvider = provider || 'booking';
      
      const queryParams = new URLSearchParams();
      
      if (params.adults) queryParams.append('adults', params.adults);
      if (params.children) queryParams.append('children', params.children);
      if (params.roomQty) queryParams.append('roomQty', params.roomQty);
      if (params.currency) queryParams.append('currency', params.currency);
      
      console.log(`Getting rooms for ${safeProvider}/${hotelId}`);
      
      const response = await fetch(`${this.baseUrl}/api/hotels/rooms/${safeProvider}/${hotelId}?${queryParams.toString()}`, {
        method: 'GET',
        headers: this._getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to get hotel rooms: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Hotel rooms error:', error);
      throw error;
    }
  }
  
  async getBestHotelDeals(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.destination) queryParams.append('destination', params.destination);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.currency) queryParams.append('currency', params.currency);
      
      console.log("Getting best hotel deals with params:", Object.fromEntries(queryParams.entries()));
      
      const response = await fetch(`${this.baseUrl}/api/hotels/best-deals?${queryParams.toString()}`, {
        method: 'GET',
        headers: this._getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to get best hotel deals: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Best hotel deals error:', error);
      throw error;
    }
  }

  // AI Helper methods
  
  // Helper method to get AI-generated hotel data with properly formatted images
  async generateHotelData(params = {}) {
    const { destination = 'New York', limit = 5 } = params;
    
    try {
      // Create a prompt that specifically requests hotel images
      const prompt = `Generate realistic hotel information for ${limit} unique hotels in ${destination}.
      Include for each hotel:
      - A realistic hotel name
      - Location in ${destination}
      - Price between $150 and $500
      - Rating between 3.8 and 4.9
      - Review count
      - Short description (1-2 sentences)
      - Images: use specific Unsplash image URLs in this exact format: "https://source.unsplash.com/random/800x600/?hotel+luxury" (make the query relevant to the hotel)
      - 5 hotel amenities
      
      Format the response as a detailed JSON array without explanations. Each hotel must have a "images" array with at least one image URL.`;
      
      const response = await this.travelAssistant(prompt);
      
      // Process the response to ensure images are correctly formatted
      let hotelData;
      try {
        // Extract JSON from response
        const match = response.data.match(/\[\s*\{.*\}\s*\]/s);
        if (match) {
          const parsedData = JSON.parse(match[0]);
          
          // Ensure each hotel has proper images
          hotelData = parsedData.map(hotel => {
            const locationQuery = encodeURIComponent((hotel.location || destination).split(',')[0].trim().toLowerCase().replace(/\s+/g, '+'));
            
            // Ensure images is always an array with at least one URL
            const images = Array.isArray(hotel.images) ? 
              hotel.images : 
              hotel.image ? [hotel.image] : [];
            
            // Make sure each image is properly formatted
            const processedImages = images.length > 0 ? 
              images.map(img => typeof img === 'string' ? img : null).filter(Boolean) : 
              [];
              
            // If no valid images, create a fallback with location-based query
            if (processedImages.length === 0) {
              processedImages.push(`https://source.unsplash.com/random/800x600/?hotel+${locationQuery}`);
            }
            
            return {
              ...hotel,
              id: hotel.id || `ai-${Math.random().toString(36).substr(2, 9)}`,
              provider: 'ai',
              images: processedImages,
              location: hotel.location || `${destination}, City Center`
            };
          });
        } else {
          throw new Error("Could not extract JSON from AI response");
        }
      } catch (parseError) {
        console.error("Error parsing AI hotel data:", parseError);
        throw parseError;
      }
      
      return {
        success: true,
        hotels: hotelData || [],
        count: hotelData?.length || 0,
        dataSource: "AI Generated"
      };
    } catch (error) {
      console.error("AI hotel generation error:", error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;