import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Simulated user data
const users = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin123',
    machineIP: '192.168.1.1',
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'user123',
    machineIP: '192.168.1.2',
    name: 'Regular User',
    role: 'user'
  }
];

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (email, password, machineIP) => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user in our simulated database
      const foundUser = users.find(
        user => 
          user.email === email && 
          user.password === password && 
          user.machineIP === machineIP
      );

      if (foundUser) {
        // Remove password from user object before storing
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        
        // Store user in localStorage
        localStorage.setItem('@AMS:user', JSON.stringify(userWithoutPassword));
        
        // Redirect to dashboard
        navigate('/dashboard/home');
        return { success: true };
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Erro ao fazer login'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('@AMS:user');
    navigate('/');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 