import axios from 'axios';

const normalizeBaseUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  return url.replace(/\/+$/, '');
};

const resolveBaseUrl = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  const storedUrl = localStorage.getItem('@AMS:apiUrl');
  const fallbackUrl = import.meta?.env?.VITE_API_URL;
  const base = normalizeBaseUrl(storedUrl || fallbackUrl);

  return base ? `${base}/api` : '/api';
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const refreshApiBaseUrl = () => {
  const nextBaseUrl = resolveBaseUrl();
  api.defaults.baseURL = nextBaseUrl;
  return nextBaseUrl;
};

export const createApiInstance = (token) => {
  return axios.create({
    baseURL: resolveBaseUrl(),
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined
    }
  });
};

api.interceptors.request.use(
  (config) => {
    config.baseURL = config.baseURL || refreshApiBaseUrl();
    const token = localStorage.getItem('@AMS:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const currentPath = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '';
      const isOnLoginPage = currentPath.endsWith('/login') || currentPath.includes('/login');
      if (!isOnLoginPage) {
        localStorage.removeItem('@AMS:user');
        localStorage.removeItem('@AMS:token');
        window.location = '/ams/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api };