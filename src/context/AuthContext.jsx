import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';


const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async (username, password, machineIP) => {
    setLoading(true);
    try {
      const response = await api.post('/login', { username, password, type:"nimda" });

      if (response.status === 200 || response.status === 201) {
        const { password, ...userWithoutPassword } = response.data;
        setUser(userWithoutPassword);
        
        localStorage.setItem('@AMS:user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('@AMS:token', response.data.token);
        
      
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