import { createContext, useState, useContext, useMemo } from 'react';
import { api } from '../config/api';
import {
  AMS_ENV_STORAGE_KEY,
  AUTHORIZATION_LEVEL_STORAGE_KEY,
  getPermissions,
  getStoredAmsEnv,
  getStoredAuthorizationLevel,
} from '../utils/permissions';


const AuthContext = createContext({});

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('@AMS:user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [authorizationLevel, setAuthorizationLevel] = useState(getStoredAuthorizationLevel);
  const [amsEnv, setAmsEnv] = useState(getStoredAmsEnv);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });

      if (response.status === 200 || response.status === 201) {
        const { token, authorizationLevel: level, amsEnv } = response.data.data;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userFromToken = payload.user ?? payload;
        setUser(userFromToken);
        setAuthorizationLevel(level ?? null);
        localStorage.setItem('@AMS:user', JSON.stringify(userFromToken));
        localStorage.setItem('@AMS:token', token);
        if (level) localStorage.setItem(AUTHORIZATION_LEVEL_STORAGE_KEY, level);
        else localStorage.removeItem(AUTHORIZATION_LEVEL_STORAGE_KEY);
        setAmsEnv(amsEnv ?? null);
        if (amsEnv) localStorage.setItem(AMS_ENV_STORAGE_KEY, amsEnv);
        else localStorage.removeItem(AMS_ENV_STORAGE_KEY);
        return { success: true };
      } else {
        throw new Error('Credenciais inválidas');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthorizationLevel(null);
    setAmsEnv(null);
    localStorage.removeItem('@AMS:user');
    localStorage.removeItem('@AMS:token');
    localStorage.removeItem(AUTHORIZATION_LEVEL_STORAGE_KEY);
    localStorage.removeItem(AMS_ENV_STORAGE_KEY);
    window.location.href = '/ams/login';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  const permissions = useMemo(() => getPermissions(authorizationLevel), [authorizationLevel]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      isAuthenticated,
      authorizationLevel,
      amsEnv,
      permissions,
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

export const usePermissions = () => {
  const { permissions } = useAuth();
  return permissions ?? getPermissions(null);
};
