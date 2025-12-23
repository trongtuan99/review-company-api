import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && authService.isAuthenticated()) {
        setUser(currentUser);
        // Refresh user data from backend to get latest role
        try {
          const response = await userService.getUser(currentUser.id);
          if (response.status === 'ok' || response.status === 'success') {
            const freshUser = { ...currentUser, ...response.data };
            // Handle role from nested object if needed
            if (response.data.role && typeof response.data.role === 'object') {
              freshUser.role = response.data.role.role || response.data.role.name;
            }
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        } catch (error) {
          console.error('Failed to refresh user on init:', error);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.signIn(email, password);

      if ((response.status === 'ok' || response.status === 'success') && response.data) {
        const userData = response.data;
        // Handle role from nested object if needed
        if (userData.role && typeof userData.role === 'object') {
          userData.role = userData.role.role || userData.role.name;
        }
        localStorage.setItem('access_token', userData.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error.error === 'Network Error' || error.message?.includes('Network Error')) {
        errorMessage = error.message || 'Không thể kết nối đến server. Vui lòng kiểm tra lại URL API hoặc kết nối mạng.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.signUp(userData);
      if (response.status === 'ok' || response.status === 'success') {
        return await login(userData.email, userData.password);
      }
      return { success: false, error: response.message || 'Registration failed' };
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error.error === 'Network Error' || error.message?.includes('Network Error')) {
        errorMessage = error.message || 'Không thể kết nối đến server. Vui lòng kiểm tra lại URL API hoặc kết nối mạng.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authService.signOut();
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const response = await userService.getUser(user.id);
      if (response.status === 'ok' || response.status === 'success') {
        const freshUser = { ...user, ...response.data };
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        return freshUser;
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
    return null;
  };

  // Check if user is admin - handle multiple formats
  const isAdmin =
    user?.role === 'admin' ||
    user?.role?.role === 'admin' ||
    user?.role?.name === 'admin' ||
    user?.is_admin === true;

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

