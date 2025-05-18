// This file handles all authentication API routes

// User registration endpoint
export async function POST(request) {
  if (request.url.endsWith('/register')) {
    // Process registration
    try {
      const body = await request.json();
      const { name, email, password } = body;
      
      // In a real implementation, you would save this to a database
      console.log('Registering user:', { name, email, password: '********' });
      
      // For testing purposes, we'll just return a success message
      return Response.json({
        success: true,
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('Registration error:', error);
      return Response.json({ 
        error: 'Failed to register user' 
      }, { 
        status: 500 
      });
    }
  } else if (request.url.endsWith('/login')) {
    // Process login
    try {
      const body = await request.json();
      const { email, password } = body;
      
      // In a real implementation, you would verify the credentials against a database
      console.log('Login attempt:', { email, password: '********' });
      
      // For testing purposes, we'll accept any credentials
      // In production, you should validate credentials against your database
      return Response.json({
        success: true,
        token: 'fake-jwt-token-' + Math.random().toString(36).substring(2),
        user: {
          id: 'user-1',
          name: 'Test User',
          email: email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return Response.json({ 
        error: 'Invalid email or password' 
      }, { 
        status: 401 
      });
    }
  } else if (request.url.endsWith('/profile')) {
    // Get user profile
    try {
      // In a real implementation, you would decode the JWT token and fetch the user profile
      
      // For testing purposes, we'll return a mock user profile
      return Response.json({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Profile error:', error);
      return Response.json({ 
        error: 'Failed to fetch user profile' 
      }, { 
        status: 401 
      });
    }
  }
  
  // Handle unknown endpoints
  return Response.json({ 
    error: 'Endpoint not found' 
  }, { 
    status: 404 
  });
}

// Logout endpoint is not needed for API-only implementation since tokens are stored client-side