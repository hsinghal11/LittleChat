import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'auth-token': token
            }
          });

          if (response.ok) {
            const data = await response.json();
            // Ensure user object has the correct structure with _id property
            if (data.user && data.user._id) {
              // Make sure we have both _id and id properties for compatibility
              setUser({
                ...data.user,
                id: data.user._id // Ensure id property exists for frontend use
              });
              console.log('User authenticated:', data.user);
            } else {
              console.error('Invalid user data structure:', data.user);
              logout();
            }
          } else {
            // Token is invalid or expired
            console.error('Authentication failed:', await response.json());
            logout();
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Register a new user
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        
        // Ensure user object has the correct structure
        if (data.user && data.user._id) {
          setUser({
            ...data.user,
            id: data.user._id // Ensure id property exists for frontend use
          });
          console.log('User registered:', data.user);
        } else {
          console.error('Invalid user data structure from registration:', data.user);
        }
        
        return { success: true, data };
      } else {
        console.error('Registration failed:', data);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  // Login a user
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        
        // Ensure user object has the correct structure
        if (data.user && data.user._id) {
          setUser({
            ...data.user,
            id: data.user._id // Ensure id property exists for frontend use
          });
          console.log('User logged in:', data.user);
        } else {
          console.error('Invalid user data structure from login:', data.user);
        }
        
        return { success: true, data };
      } else {
        console.error('Login failed:', data);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  // Logout a user
  const logout = async () => {
    try {
      if (token) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      navigate('/login');
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 